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
 * @type {TP.xmpp.Packet}
 * @summary The XMPP protocol consists of 'streams' and 'stanzas' which are XML
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
     * @method getConnection
     * @summary Returns the connection instance which owns the receiver.
     * @returns {TP.xmpp.Connection}
     */

    return this.get('conn');
});

//  ------------------------------------------------------------------------

TP.xmpp.Packet.Inst.defineMethod('setConnection',
function(aConnection) {

    /**
     * @method setConnection
     * @summary Sets the receiver's connection. This is the connection that
     *     will be used for send() processing and similar operations.
     * @param {TP.xmpp.Connection} aConnection The connection to define.
     * @returns {TP.xmpp.Packet} The receiver.
     */

    return this.set('conn', aConnection);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
