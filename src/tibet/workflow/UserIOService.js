//  ========================================================================
/*
NAME:   TP.core.UserIOService.js
AUTH:   Scott Shattuck (ss)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.
*/
//  ========================================================================

/**
 * @type {TP.core.UserIOService}
 * @synopsis A TP.core.Service specific to handling TP.sig.UserIORequests. The
 *     best example is the TIBET console which provides a way for the system to
 *     interact with the User.
 */

//  ------------------------------------------------------------------------

TP.core.IOService.defineSubtype('UserIOService');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  what signals will trigger this resource/service?
TP.core.UserIOService.Type.defineAttribute('triggerSignals',
                                        'TP.sig.UserIORequest');

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
     * @name init
     * @synopsis Initializes a new instance.
     * @param {String} aResourceID The unique identifier for this service.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An optional request or
     *     hash containing a service URI if the service is going to be tied to a
     *     particular target location.
     * @returns {TP.core.UserIOService} A new instance.
     * @todo
     */

    this.callNextMethod();

    this.$set('requestQueue', TP.ac());

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UserIOService.Inst.defineMethod('getRequestQueue',
function() {

    /**
     * @name getRequestQueue
     * @synopsis Returns the receiver's request queue, the list of requests
     *     which are currently awaiting processing.
     * @returns {Array} 
     */

    return this.$get('requestQueue');
});

//  ------------------------------------------------------------------------

TP.core.UserIOService.Inst.defineMethod('getNextRequest',
function(aRequest) {

    /**
     * @name getNextRequest
     * @synopsis Removes a request from the queue and returns it for processing.
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
     * @name getRequestById
     * @synopsis Retrieves a request from the queue and returns it for
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
    req = queue.detect(function(item) {

                        return item.getRequestID() === aRequestID;
                    });

    return req;
});

//  ------------------------------------------------------------------------

TP.core.UserIOService.Inst.defineMethod('handleNextRequest',
function(aRequest) {

    /**
     * @name handleNextRequest
     * @synopsis Processes the next request in the receiver's request queue.
     *     This method is automatically invoked at the end of each request cycle
     *     so any pending requests are handled in FIFO order.
     * @param {TP.sig.Request} aRequest The last request, which sometimes will
     *     need to provide information to this process.
     */

    var req,
        fname,

        reqType;

    //  when input causes a new input request to be queued the
    //  'lastInputRequest' might not have been handled yet, so we have to
    //  check that first before we decide to clear it...
    if (TP.isValid(req = this.get('lastInputRequest'))) {
        if (req.isActive()) {
            //  update in case the signal has altered on the fly (by
            //  updating prompt or default value for example)
            this.refreshFromRequest(req);

            return;
        }
    }

    //  always clear the last request to force the new request to be set and
    //  make sure we think we're available for use
    this.set('lastInputRequest', null);
    this.isAwaitingInput(false);
    this.shouldConcealInput(false);

    //  deal with running out of requests to process
    if (TP.notValid(req = this.getNextRequest(aRequest))) {
        return this.handleNoMoreRequests(aRequest);
    }

    //  if we have the right method invoke it, otherwise we'll raise an
    //  error
    if (!TP.isType(reqType = TP.sys.getTypeByName(req.getTypeName()))) {
        return this.raise('TP.sig.InvalidType',
                            arguments,
                            req.getTypeName());
    }

    fname = reqType.getHandlerName(null, false, aRequest);
    if (TP.isMethod(this[fname])) {
        return this[fname](req);
    }

    fname = reqType.getHandlerName(null, true, aRequest);
    if (TP.isMethod(this[fname])) {
        return this[fname](req);
    }

    return this.raise('TP.sig.UnhandledInputRequest', arguments, fname);
});

//  ------------------------------------------------------------------------

TP.core.UserIOService.Inst.defineMethod('handleNoMoreRequests',
function(aRequest) {

    /**
     * @name handleNoMoreRequests
     * @synopsis Performs any processing required when all queued requests have
     *     been processed. The default is simply to return.
     * @param {TP.sig.Request} aRequest The last request, which sometimes will
     *     need to provide information to this process.
     * @todo
     */

    return;
});

//  ------------------------------------------------------------------------

TP.core.UserIOService.Inst.defineMethod('handleUserInputRequest',
function(aSignal) {

    /**
     * @name handleUserInputRequest
     * @synopsis Responds to input requests, either handling them directly or
     *     queuing them for later processing.
     * @param {TP.sig.UserInputRequest} aSignal 
     */

    return;
});

//  ------------------------------------------------------------------------

TP.core.UserIOService.Inst.defineMethod('handleUserInputSeries',
function(aSignal) {

    /**
     * @name handleUserInpuSeries
     * @synopsis Responds to input series, either handling them directly or
     *     queuing them for later processing.
     * @param {TP.sig.UserInputSeries} aSignal 
     */

    return;
});

//  ------------------------------------------------------------------------

TP.core.UserIOService.Inst.defineMethod('handleUserOutputRequest',
function(aSignal) {

    /**
     * @name handleUserOutputRequest
     * @synopsis Responds to output requests, either handling them directly or
     *     queuing them for later processing.
     * @param {TP.sig.UserOutputRequest} aSignal 
     */

    return;
});

//  ------------------------------------------------------------------------

TP.core.UserIOService.Inst.defineMethod('isAwaitingInput',
function(aFlag) {

    /**
     * @name isAwaitingInput
     * @synopsis Combined setter/getter for whether the receiver is waiting for
     *     input. This method will interrogate the input cell as part of the
     *     process.
     * @param {Boolean} aFlag An optional new setting.
     * @returns {Boolean} The current input state.
     * @todo
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.UserIOService.Inst.defineMethod('queueIORequest',
function(aSignal) {

    /**
     * @name queueIORequest
     * @synopsis Queues the incoming signal for later processing. This method is
     *     typically invoked automatically by services that are currently
     *     blocked servicing a prior request.
     * @param {TP.sig.UserIORequest} aSignal 
     */

    this.get('requestQueue').add(aSignal);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UserIOService.Inst.defineMethod('refreshFromRequest',
function(aRequest) {

    /**
     * @name refreshFromRequest
     * @synopsis Performs any updates necessary to ensure that the display is
     *     current with the current state of the request. The default
     *     implementation does nothing.
     * @param {TP.sig.UserIORequest} aRequest 
     * @returns {TP.core.UserIOService} The receiver.
     * @todo
     */

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
