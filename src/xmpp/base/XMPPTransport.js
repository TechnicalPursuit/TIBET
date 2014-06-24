//  ========================================================================
/*
NAME:   TP.xmpp.Transport.js
AUTH:   William J. Edney (wje)
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
 * @type {TP.xmpp.Transport}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('xmpp:Transport');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.xmpp.Transport.Type.defineAttribute('logSends', false);
TP.xmpp.Transport.Type.defineAttribute('logRecvs', false);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xmpp.Transport.Inst.defineAttribute('serverName');

TP.xmpp.Transport.Inst.defineAttribute('inStream');
TP.xmpp.Transport.Inst.defineAttribute('outStream');

TP.xmpp.Transport.Inst.defineAttribute('connectionEstablished');

//  these default to the current state of the type at init time
TP.xmpp.Transport.Inst.defineAttribute('logRecvs');
TP.xmpp.Transport.Inst.defineAttribute('logSends');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  LOGGING SUPPORT METHODS
//  ------------------------------------------------------------------------

TP.xmpp.Transport.Type.defineMethod('shouldLogRecvs',
function(aFlag) {

    /**
     * @name shouldLogRecvs
     * @synopsis Combined setter/getter for controlling whether the transport
     *     should log received data. The default is false.
     * @param {Boolean} aFlag The new setting, if any.
     * @returns {Boolean} The setting, after any adjustment.
     * @todo
     */

    if (TP.isBoolean(aFlag)) {
        this.$set('logRecvs', aFlag);
    }

    return this.$get('logRecvs');
});

//  ------------------------------------------------------------------------

TP.xmpp.Transport.Type.defineMethod('shouldLogSends',
function(aFlag) {

    /**
     * @name shouldLogSends
     * @synopsis Combined setter/getter for controlling whether the transport
     *     should log sent data. The default is false.
     * @param {Boolean} aFlag The new setting, if any.
     * @returns {Boolean} The setting, after any adjustment.
     * @todo
     */

    if (TP.isBoolean(aFlag)) {
        this.$set('logSends', aFlag);
    }

    return this.$get('logSends');
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.Transport.Inst.defineMethod('init',
function(aConnectionInfo) {

    /**
     * @name init
     * @synopsis Initializes a new instance.
     * @param {TP.lang.Hash} aConnectionInfo A hash of connection information.
     *     This hash should contain values for: 'serverName', 'inStream',
     *     'outStream'.
     * @raises TP.sig.InvalidParameter
     * @returns {TP.xmpp.Transport} A new instance.
     */

    if (TP.notValid(aConnectionInfo)) {
        return this.raise('TP.sig.InvalidParameter', arguments);
    }

    this.callNextMethod();

    this.set('serverName', aConnectionInfo.at('serverName'));

    this.set('inStream', aConnectionInfo.at('inStream'));
    this.set('outStream', aConnectionInfo.at('outStream'));

    this.set('connectionEstablished', false);

    //  configure the instance based on current type settings
    this.shouldLogRecvs(this.getType().shouldLogRecvs());
    this.shouldLogSends(this.getType().shouldLogSends());

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.Transport.Inst.defineMethod('connect',
function() {

    /**
     * @name connect
     * @synopsis Connects the receiver to the server it is configured to connect
     *     to.
     * @raises TP.sig.XMPPTransportException
     * @returns {Boolean} True if the transport connects successfully to the
     *     server.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xmpp.Transport.Inst.defineMethod('connectionDidAuthenticate',
function() {

    /**
     * @name connectionDidAuthenticate
     * @synopsis A method that is called by the connection that owns this
     *     transport letting the transport know that the connection did
     *     successfully authenticate with the server.
     * @returns {TP.xmpp.Transport} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.Transport.Inst.defineMethod('disconnect',
function() {

    /**
     * @name disconnect
     * @synopsis Disconnects the receiver to the server it was configured to
     *     connect to.
     * @returns {Boolean} True if the transport discconnects successfully from
     *     the server.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.Transport.Inst.defineMethod('$getNextMessageID',
function() {

    /**
     * @name $getNextMessageID
     * @synopsis Returns a newly generated message ID for use.
     * @returns {String} The message ID that will be used for the next message.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xmpp.Transport.Inst.defineMethod('isBusy',
function() {

    /**
     * @name isBusy
     * @synopsis Whether or not the transport is 'busy' sending something.
     * @returns {Boolean} Whether or not the transport is busy.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xmpp.Transport.Inst.defineMethod('receive',
function() {

    /**
     * @name receive
     * @synopsis Receives any currently available XMPP data by reading data from
     *     the server.
     * @returns {TP.xmpp.Packet} The currently available XMPP packet read from
     *     the server.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xmpp.Transport.Inst.defineMethod('transmit',
function(aStr) {

    /**
     * @name transmit
     * @synopsis Sends the raw data provided to the server.
     * @param {String} aStr The raw data to be sent over the transport.
     * @raises TP.sig.XMPPTransportException
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xmpp.Transport.Inst.defineMethod('startReceiving',
function() {

    /**
     * @name startReceiving
     * @synopsis Start the transport's 'receiving process'. For transports that
     *     operate over HTTP, this will typically start a polling or listening
     *     process.
     * @returns {TP.xmpp.Transport} The receiver.
     */

    this.set('connectionEstablished', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.Transport.Inst.defineMethod('stopReceiving',
function() {

    /**
     * @name stopReceiving
     * @synopsis Stop the transport's 'receiving process'. For transports that
     *     operate over HTTP, this will typically stop a polling or listening
     *     process.
     * @returns {TP.xmpp.Transport} The receiver.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------
//  LOGGING SUPPORT METHODS
//  ------------------------------------------------------------------------

TP.xmpp.Transport.Inst.defineMethod('shouldLogRecvs',
function(aFlag) {

    /**
     * @name shouldLogRecvs
     * @synopsis Combined setter/getter for controlling whether the transport
     *     should log received data. The default is false.
     * @param {Boolean} aFlag The new setting, if any.
     * @returns {Boolean} The setting, after any adjustment.
     * @todo
     */

    if (TP.isBoolean(aFlag)) {
        this.$set('logRecvs', aFlag);
    }

    return this.$get('logRecvs');
});

//  ------------------------------------------------------------------------

TP.xmpp.Transport.Inst.defineMethod('shouldLogSends',
function(aFlag) {

    /**
     * @name shouldLogSends
     * @synopsis Combined setter/getter for controlling whether the transport
     *     should log sent data. The default is false.
     * @param {Boolean} aFlag The new setting, if any.
     * @returns {Boolean} The setting, after any adjustment.
     * @todo
     */

    if (TP.isBoolean(aFlag)) {
        this.$set('logSends', aFlag);
    }

    return this.$get('logSends');
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
