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
 * @type {TP.sig.RequestCoalescer}
 * @synopsis An object designed to help with management of multiple
 *     TP.sig.Request objects, treating them as a single request in terms of
 *     state. The coalescer will fire RequestCompleted only upon completion of
 *     all of its component requests.
 */

//  ------------------------------------------------------------------------

TP.sig.AndJoin.defineSubtype('RequestCoalescer');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.RequestCoalescer.Inst.defineMethod('addRequest',
function(aRequest) {

    /**
     * @name addRequest
     * @synopsis Adds a request as a trigger for the receiver. This method is a
     *     convenience wrapper for the appropriate addTrigger call using the
     *     various properties of the request. The signal observed in this case
     *     is RequestCompleted.
     * @param {TP.sig.Request} aRequest A new request to observe.
     * @raises TP.sig.InvalidRequest
     * @returns {TP.sig.RequestCoalescer} The receiver.
     */

    if (TP.notValid(aRequest)) {
        return this.raise('TP.sig.InvalidRequest', arguments);
    }

    this.addTrigger(aRequest.getRequestID(), 'TP.sig.RequestCompleted');

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

