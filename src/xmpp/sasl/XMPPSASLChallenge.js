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
 * @type {TP.xmpp.SASLChallenge}
 * @synopsis A wrapper for the SASL challenge element
 */

//  ------------------------------------------------------------------------

TP.xmpp.Packet.defineSubtype('SASLChallenge');

TP.xmpp.SASLChallenge.set('namespace', TP.xmpp.XMLNS.SASL);
TP.xmpp.SASLChallenge.set('tagname', 'challenge');

TP.xmpp.SASLChallenge.register();

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
