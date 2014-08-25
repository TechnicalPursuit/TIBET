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
 * @Exceptions signals specific to XMPP processing.
 * @todo
 */

TP.sig.ERROR.defineSubtype('XMPPException');

TP.sig.XMPPException.defineSubtype('XMPPInputException');
TP.sig.XMPPException.defineSubtype('XMPPReadException');
TP.sig.XMPPException.defineSubtype('XMPPWriteException');
TP.sig.XMPPException.defineSubtype('XMPPNodeCorruption');
TP.sig.XMPPException.defineSubtype('XMPPSerializationException');

TP.sig.XMPPException.defineSubtype('XMPPTransportException');

TP.sig.XMPPException.defineSubtype('InvalidJID');
TP.sig.XMPPException.defineSubtype('InvalidXMPPConnection');
TP.sig.XMPPException.defineSubtype('InvalidXMPPStanzaType');
TP.sig.XMPPException.defineSubtype('InvalidXMPPPacket');
TP.sig.XMPPException.defineSubtype('InvalidXMPPPayload');
TP.sig.XMPPException.defineSubtype('InvalidXMPPPubsubNode');
TP.sig.XMPPException.defineSubtype('InvalidXMPPResponse');
TP.sig.XMPPException.defineSubtype('InvalidXMPPResponseXML');
TP.sig.XMPPException.defineSubtype('InvalidXMPPStanza');
TP.sig.XMPPException.defineSubtype('InvalidXMPPStream');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
