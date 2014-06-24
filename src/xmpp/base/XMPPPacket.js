//  ========================================================================
/*
NAME:   TP.xmpp.Packet.js
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
 * @type {TP.xmpp.Packet}
 * @synopsis The XMPP protocol consists of 'streams' and 'stanzas' which are XML
 *     elements conforming to specific requirements. This type provides a common
 *     supertype for these entities which have a connection.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Node.defineSubtype('Packet');

//  can't construct concrete instances of this
TP.xmpp.Packet.isAbstract(true);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the connection which owns this packet
TP.xmpp.Packet.Inst.defineAttribute('conn');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.Packet.Inst.defineMethod('getConnection',
function() {

    /**
     * @name getConnection
     * @synopsis Returns the connection instance which owns the receiver.
     * @returns {TP.xmpp.Connection} 
     */

    return this.get('conn');
});

//  ------------------------------------------------------------------------

TP.xmpp.Packet.Inst.defineMethod('setConnection',
function(aConnection) {

    /**
     * @name setConnection
     * @synopsis Sets the receiver's connection. This is the connection that
     *     will be used for send() processing and similar operations.
     * @param {TP.xmpp.Connection} aConnection The connection to define.
     * @returns {TP.xmpp.Packet} The receiver.
     */

    return this.set('conn', aConnection);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
