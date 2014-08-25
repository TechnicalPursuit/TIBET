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
 * @Connection-specific Exception signals.
 * @todo
 */

//  ------------------------------------------------------------------------

TP.sig.XMPPException.defineSubtype('XMPPConnectionException');

TP.sig.XMPPConnectionException.defineSubtype('XMPPQueueingException');

TP.sig.XMPPConnectionException.defineSubtype('XMPPConnectionNotOpen');
TP.sig.XMPPConnectionException.defineSubtype('XMPPConnectionNotReady');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
