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
 * @Signals specific to receipt of message input.
 */

//  ------------------------------------------------------------------------

TP.sig.XMPPInput.defineSubtype('XMPPMessageInput');

TP.sig.XMPPMessageInput.defineSubtype('XMPPMessageNormalInput');
TP.sig.XMPPMessageInput.defineSubtype('XMPPMessageChatInput');
TP.sig.XMPPMessageInput.defineSubtype('XMPPMessageGroupchatInput');
TP.sig.XMPPMessageInput.defineSubtype('XMPPMessageHeadlineInput');
TP.sig.XMPPMessageInput.defineSubtype('XMPPMessageErrorInput');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
