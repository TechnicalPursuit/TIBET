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
 * @type {TP.xmpp.Transport}
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('xmpp.Transport');

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
     * @method shouldLogRecvs
     * @summary Combined setter/getter for controlling whether the transport
     *     should log received data. The default is false.
     * @param {Boolean} aFlag The new setting, if any.
     * @returns {Boolean} The setting, after any adjustment.
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
     * @method shouldLogSends
     * @summary Combined setter/getter for controlling whether the transport
     *     should log sent data. The default is false.
     * @param {Boolean} aFlag The new setting, if any.
     * @returns {Boolean} The setting, after any adjustment.
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
     * @method init
     * @summary Initializes a new instance.
     * @param {TP.lang.Hash} aConnectionInfo A hash of connection information.
     *     This hash should contain values for: 'serverName', 'inStream',
     *     'outStream'.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.xmpp.Transport} A new instance.
     */

    if (TP.notValid(aConnectionInfo)) {
        return this.raise('TP.sig.InvalidParameter');
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
     * @method connect
     * @summary Connects the receiver to the server it is configured to connect
     *     to.
     * @exception TP.sig.XMPPTransportException
     * @returns {Boolean} True if the transport connects successfully to the
     *     server.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xmpp.Transport.Inst.defineMethod('connectionDidAuthenticate',
function() {

    /**
     * @method connectionDidAuthenticate
     * @summary A method that is called by the connection that owns this
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
     * @method disconnect
     * @summary Disconnects the receiver to the server it was configured to
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
     * @method $getNextMessageID
     * @summary Returns a newly generated message ID for use.
     * @returns {String} The message ID that will be used for the next message.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xmpp.Transport.Inst.defineMethod('isBusy',
function() {

    /**
     * @method isBusy
     * @summary Whether or not the transport is 'busy' sending something.
     * @returns {Boolean} Whether or not the transport is busy.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xmpp.Transport.Inst.defineMethod('receive',
function() {

    /**
     * @method receive
     * @summary Receives any currently available XMPP data by reading data from
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
     * @method transmit
     * @summary Sends the raw data provided to the server.
     * @param {String} aStr The raw data to be sent over the transport.
     * @exception TP.sig.XMPPTransportException
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xmpp.Transport.Inst.defineMethod('startReceiving',
function() {

    /**
     * @method startReceiving
     * @summary Start the transport's 'receiving process'. For transports that
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
     * @method stopReceiving
     * @summary Stop the transport's 'receiving process'. For transports that
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
     * @method shouldLogRecvs
     * @summary Combined setter/getter for controlling whether the transport
     *     should log received data. The default is false.
     * @param {Boolean} aFlag The new setting, if any.
     * @returns {Boolean} The setting, after any adjustment.
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
     * @method shouldLogSends
     * @summary Combined setter/getter for controlling whether the transport
     *     should log sent data. The default is false.
     * @param {Boolean} aFlag The new setting, if any.
     * @returns {Boolean} The setting, after any adjustment.
     */

    if (TP.isBoolean(aFlag)) {
        this.$set('logSends', aFlag);
    }

    return this.$get('logSends');
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
