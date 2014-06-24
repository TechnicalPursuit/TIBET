//  ========================================================================
/*
NAME:   TP.sig.RequestCoalescer.js
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

