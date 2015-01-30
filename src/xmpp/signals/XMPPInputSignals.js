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
 * @XMPP input-notification signals.
 */

//  ------------------------------------------------------------------------

TP.sig.XMPPSignal.defineSubtype('XMPPInput');

TP.sig.XMPPInput.defineSubtype('XMPPCustomInput');
TP.sig.XMPPInput.defineSubtype('XMPPErrorInput');

//  NOTE there are other subtypes of TP.sig.XMPPInput, defined in the top of
//  their respective "branch" files.

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
