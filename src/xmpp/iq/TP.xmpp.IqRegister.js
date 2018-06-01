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
 * @type {TP.xmpp.IqRegister}
 * @summary A wrapper for the IQ_REGISTER namespace'd payload element.
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

TP.xmpp.IqRegister.Inst.defineHandler('Arrival',
function(aSignal) {

    /**
     * @method handleArrival
     * @summary Responds to inbound arrival of a new packet of the receiver's
     *     type. For most packet types this requires no action but certain
     *     packets such as subscription requests require a response.
     * @param {TP.sig.Signal} aSignal The original inbound signal which
     *     contained the receiver.
     * @returns {TP.xmpp.IqRegister} The receiver.
     */

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
