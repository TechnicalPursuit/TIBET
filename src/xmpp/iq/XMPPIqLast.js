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
 * @type {TP.xmpp.IqLast}
 * @synopsis A wrapper for the IQ_LAST namespace'd payload element.
 */

//  ------------------------------------------------------------------------

TP.xmpp.IqPayload.defineSubtype('IqLast');

TP.xmpp.IqLast.set('namespace', TP.xmpp.XMLNS.IQ_LAST);

TP.xmpp.IqLast.register();

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
