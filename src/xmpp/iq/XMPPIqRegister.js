//  ========================================================================
/*
NAME:   TP.xmpp.IqRegister.js
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
 * @type {TP.xmpp.IqRegister}
 * @synopsis A wrapper for the IQ_REGISTER namespace'd payload element.
 */

//  ------------------------------------------------------------------------

TP.xmpp.IqPayload.defineSubtype('IqRegister');

//  Make sure to set the 'namespace', since its cleared by our
//  TP.xmpp.Payload supertype.
TP.xmpp.IqRegister.set('namespace', TP.xmpp.XMLNS.IQ_REGISTER);

TP.xmpp.IqRegister.set('childTags',
        TP.ac('instructions', 'username', 'password', 'hash',
        'token', 'sequence', 'name', 'first', 'last',
        'email', 'address', 'city', 'state', 'zip', 'phone',
        'url', 'date', 'misc', 'text', 'remove'));

TP.xmpp.IqRegister.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.IqRegister.Inst.defineMethod('handleArrival',
function(aSignal) {

    /**
     * @name handleArrival
     * @synopsis Responds to inbound arrival of a new packet of the receiver's
     *     type. For most packet types this requires no action but certain
     *     packets such as subscription requests require a response.
     * @param {TP.sig.Signal} aSignal The original inbound signal which
     *     contained the receiver.
     */

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
