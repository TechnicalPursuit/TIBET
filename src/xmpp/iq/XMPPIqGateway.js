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
 * @type {TP.xmpp.IqGateway}
 * @synopsis A wrapper for the IQ_GATEWAY namespace'd payload element.
 */

//  ------------------------------------------------------------------------

TP.xmpp.IqPayload.defineSubtype('IqGateway');

//  Make sure to set the 'namespace', since its cleared by our
//  TP.xmpp.Payload supertype.
TP.xmpp.IqGateway.set('namespace', TP.xmpp.XMLNS.IQ_GATEWAY);

TP.xmpp.IqGateway.set('childTags', TP.ac('desc', 'prompt', 'jid'));

TP.xmpp.IqGateway.register();

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
