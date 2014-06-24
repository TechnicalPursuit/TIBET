//  ========================================================================
/*
NAME:   XMPPExceptionSignals.js
AUTH:   Scott Shattuck (ss)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.
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
