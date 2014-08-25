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
 * @type {TP.xmpp.SASLResponse}
 * @synopsis A wrapper for the SASL authentication element
 */

//  ------------------------------------------------------------------------

TP.xmpp.Packet.defineSubtype('SASLResponse');

TP.xmpp.SASLResponse.set('namespace', TP.xmpp.XMLNS.SASL);
TP.xmpp.SASLResponse.set('tagname', 'response');

TP.xmpp.SASLResponse.register();

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
