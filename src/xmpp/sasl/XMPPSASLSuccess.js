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
 * @type {TP.xmpp.SASLSuccess}
 * @summary A wrapper for the SASL success element
 */

//  ------------------------------------------------------------------------

TP.xmpp.Packet.defineSubtype('SASLSuccess');

TP.xmpp.SASLSuccess.set('namespace', TP.xmpp.XMLNS.SASL);
TP.xmpp.SASLSuccess.set('tagname', 'success');

TP.xmpp.SASLSuccess.register();

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
