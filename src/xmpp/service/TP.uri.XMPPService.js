//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/**
 * @type {TP.uri.XMPPService}
 * @summary A subtype of TP.uri.URIService that communicates with XMPP
 *     servers.
 * @example If the TP.sig.XMPPRequest/TP.sig.XMPPResponse processing model is
 *     used, it is unnecessary to manually set up a TP.uri.XMPPService. As part
 *     of the TIBET infrastructure of using request/response pairs, a 'default'
 *     instance of this service will be instantiated and registered to handle
 *     all TP.sig.XMPPRequests.
 *
 *     This 'default' instance of the service will be registered with the
 *     system under the name 'XMPPService'. It should have a
 *     vcard entry in the currently executing project (with an '<fn>' of
 *     'XMPPService'). If this vcard cannot be found, the user
 *     will be prompted to enter the information about the default server. If
 *     only part of the information is found the user can be prompted to enter
 *     the missing information.
 *
 *     It is possible, however, to manually set up a server. To do so, supply
 *     the 'serviceURI', 'serverName' and 'connectionType' parameters to the
 *     service as a set of connection parameters:
 *
 *     xmppService = TP.uri.XMPPService.construct(
 *                      'localXMPPServer',
 *                      TP.hc('serviceURI', 'http://localhost:5280/http-bind/',
 *                              'serverName', 'infohost.com',
 *                              'connectionType', TP.xmpp.XMLNS.BINDING));
 *
 *     Or have a vcard entry where the '<fn>' entry matches the resource ID that
 *     is passed to the 'construct' call as detailed here:
 *
 *     E.g.
 *
 *     <fn><text>localXMPPServer</text></fn>
 *     <!-- Server name -->
 *     <n><text>localXMPPServer</text></n>
 *     <!-- Service URI -->
 *     <url><uri>http://localhost:5280/http-bind</uri></url>
 *     <!-- XMPP connection type -->
 *     <vcard-ext:x-xmpp-conn-type>BINDING</vcard-ext:x-xmpp-conn-type>
 *
 *     and then construct it using:
 *
 *     xmppService = TP.uri.XMPPService.construct('localXMPPServer');
 *
 *     If these parameters aren't supplied in either the 'construct' call or in
 *     the vcard, the user can be prompted to supply them at runtime by
 *     specifying the placeholder value '{USER}' in the vcard entry:
 *
 *     <url><uri>{USER}</uri></url>
 *
 *     You will then need to register your service instance so that it services
 *     TP.sig.XMPPRequests (otherwise, the TIBET machinery will instantiate the
 *     'default' instance of TP.uri.XMPPService as described above and register
 *     it to service these kinds of requests):
 *
 *     xmppService.register();
 *
 *     If the vcard associated with the current 'effective' user role ('demo',
 *     'admin', 'devl', 'mgr', 'qa', 'user', etc.) has an entry:
 *
 *     <impp><uri>...</uri></impp>
 *
 *     that will be used as the 'connectionJID' (the 'from JID') for this
 *     connection.
 *
 *     There are several ways to use a connection. A connection can be opened
 *     and authenticated or, if the 'connectionJID' is 'new' to the server, it
 *     can try to register with it.
 *
 *     Open and authenticate a connection:
 *
 *     if (xmppService.openConnection()) {
 *         xmppService.authenticateConnection(
 *              TP.jid('testrat@infohost.com'), 'testrat');
 *         xmppService.setupCurrentUser();
 *     } else {
 *           //  Can't open connection
 *     };
 *
 *     OR
 *
 *     Register with a server:
 *
 *     if (xmppService.openConnection()) {
 *
 *         //   initiateRegistration does return a TP.core.Hash containing the
 *         //   names and current values of any extra fields that may be
 *         //   required by a particular server so that you can process those.
 *         //   We don't use those here - we just assume that username and
 *         //   password are all that's required.
 *
 *         regFields = xmppService.initiateRegistration();
 *
 *         //   Normally, we'd be supplying a TP.core.Hash here that had a key
 *         //   for every key we found in regFields above, but for this example
 *         //   we just assume 'username' and 'password'.
 *         xmppService.finalizeRegistration(
 *                  TP.hc('username', 'foorat', 'password', 'foorat'));
 *
 *         //   Now that we've registered with the server, authenticate our
 *         //   connection with it.
 *         xmppService.authenticateConnection(
 *                  TP.jid('foorat@infohost.com'), 'foorat');
 *
 *         xmppService.setupCurrentUser();
 *     } else {
 *         //   Can't open connection
 *     };
 *
 *     Shut down a connection:
 *
 *     xmppService.shutdownConnection();
 */

//  ------------------------------------------------------------------------

TP.uri.URIService.defineSubtype('XMPPService');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.uri.XMPPService.Type.defineAttribute(
    'triggers', TP.ac(TP.ac(TP.ANY, 'TP.sig.XMPPRequest')));

//  TP.uri.XMPPService scheme is async-only so configure for that
TP.uri.XMPPService.Type.defineAttribute('supportedModes',
                                        TP.core.SyncAsync.ASYNCHRONOUS);
TP.uri.XMPPService.Type.defineAttribute('mode',
                                        TP.core.SyncAsync.ASYNCHRONOUS);

//  additional aspect on the core vcard Element type to retrieve the
//  XMPP 'connection type' ('BINDING' or another type)
TP.ietf.vcard.Inst.defineAttribute('conntype',
    TP.xpc('./vcard-ext:x-xmpp-conn-type',
        TP.hc('shouldCollapse', true, 'extractWith', 'value')));

TP.uri.XMPPService.register();

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the cached last stanza - for debugging purposes.
TP.uri.XMPPService.Inst.defineAttribute('lastStanza');

//  the server name hosting the XMPP service. Note that this may be
//  different from the 'serviceURI', inherited from our supertype.
TP.uri.XMPPService.Inst.defineAttribute('serverName');

//  the connection type, either TP.xmpp.XMLNS.BINDING or some other type.
TP.uri.XMPPService.Inst.defineAttribute('connectionType');

//  the connection to the XMPP service
TP.uri.XMPPService.Inst.defineAttribute('connection');

//  whether or not to immediately send the XMPP 'stanza' after
//  construction. Normally true, but when servicing requests this gets
//  switched to false so that requests have an opportunity to observe the
//  msgID of the 'stanza' before it is sent.
TP.uri.XMPPService.Inst.defineAttribute('autosend', true);

//  the queue used by the XMPP request / response machinery.
TP.uri.XMPPService.Inst.defineAttribute('requestQueue');

//  the 'service name' used by the pubsub service - defaults to 'pubsub'.
TP.uri.XMPPService.Inst.defineAttribute('pubsubName', 'pubsub');

//  the JID of the pubsub service - the combination of the 'pubsub service
//  name' and the service's 'server name'.
TP.uri.XMPPService.Inst.defineAttribute('pubsubJID');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('init',
function(resourceID, aRequest) {

    /**
     * @method init
     * @summary Returns an initialized instance of the receiver. If aRequest is
     *     provided it can help define the service's operation by providing a
     *     default serviceURI for the receiver. This uri is used when incoming
     *     requests don't provide a specific value.
     * @param {String} resourceID A unique service identifier.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An optional request or
     *     hash containing a serviceURI if the service is going to be tied to a
     *     particular target location.
     * @returns {TP.uri.URIService} A new instance.
     */

    this.callNextMethod();

    this.configureAuthData(aRequest);

    this.set('requestQueue', TP.ac());

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('clearAuthData',
function() {

    /**
     * @method clearAuthData
     * @summary Clears any stored authentication from the receiver and any
     *     backing store.
     * @returns {TP.core.Service} The receiver.
     */

    this.callNextMethod();

    this.set('serverName', null);
    this.set('connectionType', null);

    this.set('pubsubJID', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('configureAuthData',
function(aRequest) {

    /**
     * @method configureAuthData
     * @summary Configures authentication data for the receiver.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An optional request or
     *     hash containing a serviceURI if the service is going to be tied to a
     *     particular target location.
     * @returns {TP.core.Service} The receiver.
     */

    var paramDict,
        serverName,
        connectionType;

    this.callNextMethod();

    //  define the server key & secret key based on:
    //  a)  any incoming request object that might be used to
    //      template/initiate the service
    //  b)  any vcard entry that the server might have in the application's
    //      configuration
    //  c)  prompting the user for the value(s)

    //  If a request was supplied, we can use that to store the values.
    //  Otherwise, just construct a hash to store them.
    if (TP.isValid(aRequest)) {
        paramDict = aRequest;
    } else {
        paramDict = TP.hc();
    }

    //  Try to populate any missing parameters in the paramDict from the
    //  receiver's vcard entry. If these parameters are missing from the
    //  request, but are in the vcard, this should get them into the request.
    //  If they are not in the vcard, the user will be prompted for them with
    //  the supplied message.

    this.populateMissingVCardData(
        TP.hc('serverName',
                TP.ac(
                    'shortname',
                    'Enter server name: '),
              'connectionType',
                TP.ac(
                    'conntype',
                    'Enter connection type ("BINDING" or another type): ')),
        paramDict);

    //  The required serverName isn't in the paramDict? Abort it.
    if (TP.notValid(serverName = paramDict.at('serverName'))) {
        aRequest.fail(
            TP.sc('Missing required server name parameter in request'));

        return;
    }

    this.set('serverName', serverName);

    //  The required connectionType isn't in the paramDict? Abort it.
    if (TP.notValid(connectionType = paramDict.at('connectionType'))) {
        aRequest.fail(
            TP.sc('Missing required connection type parameter in request'));

        return;
    }

    this.set('connectionType', connectionType);

    this.set('pubsubJID', TP.jid(this.get('pubsubName') +
                                    '.' +
                                    this.get('serverName')));

    return this;
});

//  ------------------------------------------------------------------------
//  Connection Methods
//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('authenticateConnection',
function(aJID, aPassword) {

    /**
     * @method authenticateConnection
     * @summary Authenticates the receiver's connection, which should already
     *     be open.
     * @param {TP.xmpp.JID} aJID The JID to attempt authentication as.
     * @param {String} aPassword The password to use in our authentication
     *     attempt.
     * @exception TP.sig.InvalidJID
     * @exception TP.sig.InvalidParameter
     * @returns {Boolean} Whether or not we successfully authenticated our
     *     connection.
     */

    var authCredentials,

        effectiveUser,

        successfulConnect,
        conn;

    //  If these aren't defined, they will be in the populateMissingParams()
    //  call below
    authCredentials = TP.hc('connectionJID', aJID,
                            'connectionPassword', aPassword);

    //  If the 'connectionJID' (i.e. the 'from JID') or the
    //  'connectionPassword' for that JID wasn't supplied, try to populate
    //  it from the 'effective user's' vcard entry.
    if (TP.notValid(effectiveUser = TP.core.User.getEffectiveUser())) {
        //  If a TP.core.User hasn't been constructed (the TP.core.User type
        //  should have defaulted it), then raise an exception and return.
        return this.raise('TP.sig.XMPPAuthException',
                            'No effective user.');
    }

    effectiveUser.populateMissingParams(
                TP.hc('connectionJID',
                        TP.ac('jid', 'Enter Jabber ID: '),
                    'connectionPassword',
                        TP.ac('password', 'Enter your password: ')),
                authCredentials);

    successfulConnect = false;

    //  Make sure that we have a valid connection.
    if (TP.isValid(conn = this.get('connection'))) {
        //  We need to observe TP.sig.XMPPPubsubInput because sometimes our
        //  pubsub subscriptions come over as part of the 'session start'
        //  and that happens just at the end of the connection
        //  authentication procedure.
        this.observe(conn, 'TP.sig.XMPPPubsubInput');

        //  Attempt to authenticate with the supplied JID and password.
        successfulConnect = conn.authenticate(
                                authCredentials.at('connectionJID'),
                                authCredentials.at('connectionPassword'));

        if (successfulConnect) {
            //  Observe the 'TP.sig.XMPPConnectionReady' from the connection
            //  so that we're ready to start servicing requests, etc.
            this.observe(this.get('connection'),
                            'TP.sig.XMPPConnectionReady');

            //  Observe the 'TP.sig.XMPPConnectionException' from the
            //  connection so that we're ready to stop servicing requests,
            //  etc. if the connection has a problem and terminates.
            this.observe(this.get('connection'),
                            'TP.sig.XMPPConnectionException');
        } else {
            //  Couldn't successfully authenticate - back out the pubsub
            //  observation.
            this.ignore(conn, 'TP.sig.XMPPPubsubInput');
        }
    }

    return successfulConnect;
});

//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('getConnectedJID',
function() {

    /**
     * @method getConnectedJID
     * @summary Returns the JID representing the receiver's identity as
     *     currently logged in.
     * @returns {TP.uri.XMPPService} The receiver.
     */

    var conn;

    if (TP.isValid(conn = this.$get('connection'))) {
        return conn.get('jid');
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('getConnection',
function() {

    /**
     * @method getConnection
     * @summary Returns the receiver's connection object. This method checks to
     *     make sure that the connection's URI and server name matches ours. If
     *     it doesn't, and the connection is 'open', this method closes it and
     *     returns null.
     * @returns {TP.uri.XMPPService} The receiver.
     */

    var conn;

    if (TP.isValid(conn = this.$get('connection'))) {
        //  If the connection is open, but its serverName doesn't match our
        //  serverName, then we close it and return null

        if (conn.isOpen() &&
            conn.get('serverName') === this.get('serverName')) {
            return conn;
        } else if (conn.isOpen()) {
            conn.close();

            this.set('connection', null);

            return null;
        }
    }

    return conn;
});

//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('hasAuthConnection',
function() {

    /**
     * @method hasAuthConnection
     * @summary Returns whether or not the receiver's connection has been
     *     authenticated using a particular JID.
     * @returns {Boolean} Whether or not the receiver's connection has been
     *     authenticated.
     */

    var conn;

    if (TP.isValid(conn = this.$get('connection'))) {
        return conn.isAuthenticated();
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('hasOpenConnection',
function() {

    /**
     * @method hasOpenConnection
     * @summary Returns whether or not the receiver's connection has been
     *     opened with a particular server. Note that this doesn't necessarily
     *     mean that the connection has been authenticated, just opened.
     * @returns {Boolean} Whether or not the receiver has an open connection.
     */

    var conn;

    if (TP.isValid(conn = this.$get('connection'))) {
        //  If the connection is open, but its serverName doesn't match our
        //  serverName, then we close it and return null

        if (conn.isOpen()) {
            if (conn.get('serverName') === this.get('serverName')) {
                return true;
            }

            conn.close();

            this.set('connection', null);
        }
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('openConnection',
function() {

    /**
     * @method openConnection
     * @summary Opens a connection to the server based on the values in the
     *     receiver's 'serviceURI' and 'serverName' instance variables.
     * @description An open connection isn't necessarily an authenticated
     *     connection. Authentication is done in a separate step.
     * @returns {Boolean} Whether or not the receiver's connection is open.
     */

    var connection;

    if (this.hasOpenConnection()) {
        return true;
    }

    if (TP.notEmpty(this.get('serviceURI')) &&
        TP.notEmpty(this.get('serverName'))) {
        //  Open a connection. Note how we make sure that the serviceURI is
        //  supplied as a subtype of TP.uri.URI.
        if (TP.isValid(connection = TP.xmpp.Connection.open(
                        this.get('serverName'),
                        TP.hc('httpServerURI',
                                TP.uc(this.get('serviceURI')),
                                'connectionType',
                                    TP.ifInvalid(this.get('connectionType'),
                                                TP.xmpp.XMLNS.BINDING))))) {
            this.set('connection', connection);

            return true;
        }
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('setupCurrentUser',
function() {

    /**
     * @method setupCurrentUser
     * @summary Announces our availability using the service's JID.
     * @returns {TP.uri.XMPPService} The receiver.
     */

    var theUser,

        pubsubServiceJID,

        subReqParams,
        subReq,

        availReqParams,
        availReq;

    //  Grab the 'effective' user... this is the object that we'll populate
    //  subscriptions on.
    theUser = TP.core.User.getEffectiveUser();

    //  Sometimes, the server will return our list of pubsub subscriptions
    //  as part of the 'session start' procedure when the connection is
    //  authenticated. If so, then the 'remoteSubscriptions' instance
    //  variable of the currently effective user will contain a (maybe
    //  empty) TP.core.Hash. If there's nothing valid there, though, then we
    //  go fetch the user's pubsub subscriptions.

    pubsubServiceJID = this.get('pubsubJID');

    if (TP.notValid(theUser.get('remoteSubscriptions').at(
                                            pubsubServiceJID.asString()))) {
        //  Build a request to go get a list of the user's current
        //  subscriptions from the server. Note how we make sure to use this
        //  service's resourceID so that the request is aimed at the
        //  receiver for processing.
        subReqParams =
            TP.hc('action', 'pubsub',
                    'pubsub_action', 'subscriptions',
                    'pubsubServiceJID', pubsubServiceJID.asString());

        subReq = TP.sig.XMPPRequest.construct(subReqParams,
                                                this.get('resourceID'));

        //  Observe the pubsub input signal ourself.
        this.observe(subReq, 'TP.sig.XMPPPubsubInput');

        //  Fire the subscription retrieval request
        subReq.fire();
    }

    //  Fire off an 'available' request letting the system know the user is
    //  available. Note how we make sure to use this service's resourceID so
    //  that the request is aimed at the receiver for processing.
    availReqParams = TP.hc('action', 'presence',
                            'show', 'online');

    availReq = TP.sig.XMPPRequest.construct(
                        availReqParams, this.get('resourceID'));

    //  Fire the user availability request
    availReq.fire();

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('shutdownConnection',
function() {

    /**
     * @method shutdownConnection
     * @summary Shuts down the receiver's connection, if it is open.
     * @returns {TP.uri.XMPPService} The receiver.
     */

    var conn,

        theUser,
        remoteSubscriptions;

    //  Use $get() here so that we don't actually allocate / start up a new
    //  connection if we don't have one already.
    if (TP.isValid(conn = this.$get('connection'))) {
        //  If the connection is open, then close it.
        if (conn.isOpen()) {
            conn.close();
        }

        this.ignore(conn, 'TP.sig.XMPPPubsubInput');
        this.ignore(conn, 'TP.sig.XMPPConnectionReady');
        this.ignore(conn, 'TP.sig.XMPPConnectionException');

        //  Grab the 'effective' user... this is the object that will have
        //  our remote subscriptions.
        theUser = TP.core.User.getEffectiveUser();
        if (TP.isValid(remoteSubscriptions =
                        theUser.get('remoteSubscriptions'))) {
            //  Remove the key representing our pubsub JID from the
            //  effective user's remote subscriptions.
            remoteSubscriptions.removeKey(this.get('pubsubJID').asString());
        }

        this.set('connection', null);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  Registration Methods
//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('initiateRegistration',
function() {

    /**
     * @method initiateRegistration
     * @summary Initiate the XMPP registration process with the server that the
     *     receiver is connected to.
     * @exception TP.sig.XMPPConnectionNotOpen
     * @returns {TP.xmpp.Packet} An TP.xmpp.Packet containing the initial
     *     registration form information, etc.
     */

    var conn,
        stanza,

        res;

    //  Note that we don't check for an authenticated connection here, only
    //  an open one. We're registering a JID with this server and hoping
    //  that it will authenticate.
    if (!this.hasOpenConnection()) {
        return this.raise('TP.sig.XMPPConnectionNotOpen');
    }

    conn = this.get('connection');

    //  Construct an IQ 'get' stanza and append an IQ 'register' to it to
    //  get the initial registration form from the server.
    stanza = conn.constructStanza('get').addQuery(
                                            TP.xmpp.XMLNS.IQ_REGISTER);

    //  Capture this stanza as the 'last stanza' - this helps in debugging
    //  situations.
    this.set('lastStanza', stanza);

    //  Send it.
    stanza.send();

    //  Obtain the latest result from the server and return it.
    res = conn.receive();

    return res;
});

//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('getRegistrationFieldsFrom',
function(regNode) {

    /**
     * @method getRegistrationFieldsFrom
     * @summary Returns a TP.core.Hash of 'registration fields' according to
     *     XEP-77 of the XMPP protocol extensions.
     * @param {TP.xmpp.IqResult} regNode The element containing the
     *     TP.xmpp.IqRegister payload.
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.XMPPConnectionNotOpen
     * @returns {TP.core.Hash} A hash of key/value pairs containing field names
     *     and (current) field values.
     */

    var regFields,

        query,
        fieldElems;

    if (TP.notValid(regNode) || !TP.isKindOf(regNode, TP.xmpp.IqResult)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  Note that we don't check for an authenticated connection here, only
    //  an open one. We're registering a JID with this server and hoping
    //  that it will authenticate.
    if (!this.hasOpenConnection()) {
        return this.raise('TP.sig.XMPPConnectionNotOpen');
    }

    //  Allocate a hash to store the field names and field values.
    regFields = TP.hc();

    //  If we can successfully get the query's payload and get that Node's
    //  child elements, those will be the individual registration fields.
    //  For each child element, the local name should be the 'key' and the
    //  text value of the Element (if any) should be the value.
    if (TP.isValid(query = regNode.getPayload().at(0)) &&
        TP.notEmpty(fieldElems = query.getChildElements())) {
        fieldElems.perform(
            function(aFieldTPElem) {

                regFields.atPut(aFieldTPElem.getLocalName(),
                                aFieldTPElem.getTextContent());
            });
    }

    return regFields;
});

//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('finalizeRegistration',
function(registrationValues) {

    /**
     * @method finalizeRegistration
     * @summary Finalize the XMPP registration process with the server that the
     *     receiver is connected to.
     * @exception TP.sig.XMPPConnectionNotOpen
     * @exception TP.sig.InvalidParameter
     * @returns {TP.xmpp.Packet} An TP.xmpp.Packet containing either an
     *     acknowledgement that the registration worked or an error indicating
     *     why it didn't.
     * @params registrationValues TP.core.Hash A hash containing the various
     *     fields and their values for registering with the server (like
     *     username and password).
     */

    var registrationNode,

        conn,
        stanza,

        res;

    if (TP.notValid(registrationValues)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  Note that we don't check for an authenticated connection here, only
    //  an open one. We're registering a JID with this server and hoping
    //  that it will authenticate.
    if (!this.hasOpenConnection()) {
        return this.raise('TP.sig.XMPPConnectionNotOpen');
    }

    conn = this.get('connection');

    //  Construct an IQ 'register' Node and create a child element (via
    //  'set') for each registration field and its value.
    registrationNode = TP.xmpp.IqRegister.construct();
    registrationValues.perform(
                function(kvPair) {

                    registrationNode.set(kvPair.first(), kvPair.last());
                });

    //  Construct an IQ 'set' stanza and append that IQ 'register' Node to
    //  it.
    stanza = conn.constructStanza('set').addPayload(registrationNode);

    //  Capture this stanza as the 'last stanza' - this helps in debugging
    //  situations.
    this.set('lastStanza', stanza);

    //  Send it.
    stanza.send();

    //  Obtain the latest result from the server and return it.
    res = conn.receive();

    return res;
});

//  ------------------------------------------------------------------------
//  Messaging Methods
//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('addToRoster',
function(stanzaID, toJID, aName, aGroup) {

    /**
     * @method addToRoster
     * @summary Adds the supplied JID to the receiver JID's roster.
     * @param {String} stanzaID The ID to use on the stanza we're creating. If
     *     this call is being made because of an TP.sig.XMPPRequest, this will
     *     typically be the request's ID.
     * @param {TP.xmpp.JID} toJID The JID to add to the roster.
     * @param {String} aName The 'user-assigned' name that roster item will
     *     have.
     * @param {String} aGroup The 'user-assigned' group that roster item will
     *     have.
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.ConnectionNotAuthenticated
     * @returns {TP.xmpp.Stanza} The stanza sent.
     */

    if (TP.notValid(toJID)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    if (!this.hasAuthConnection()) {
        return this.raise('TP.sig.XMPPConnectionNotAuthenticated');
    }

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('fetchRoster',
function(stanzaID) {

    /**
     * @method fetchRoster
     * @summary Fetches the roster for the receiver's currently configured JID.
     * @param {String} stanzaID The ID to use on the stanza we're creating. If
     *     this call is being made because of an TP.sig.XMPPRequest, this will
     *     typically be the request's ID.
     * @exception TP.xmpp.ConnectionNotAuthenticated
     * @returns {TP.xmpp.Stanza} The stanza sent.
     */

    var conn,
        stanza;

    if (!this.hasAuthConnection()) {
        return this.raise('TP.sig.XMPPConnectionNotAuthenticated');
    }

    conn = this.get('connection');

    //  Construct an IQ 'get' stanza and append an IQ 'roster' to it to get
    //  our roster data from the server.
    stanza = conn.constructStanza('get').addQuery(TP.xmpp.XMLNS.IQ_ROSTER);
    stanza.set('msgID', stanzaID);

    //  Capture this stanza as the 'last stanza' - this helps in debugging
    //  situations.
    this.set('lastStanza', stanza);

    //  If 'autosend' is switched on (the default), then send the stanza
    //  right away.
    if (TP.isTrue(this.get('autosend'))) {
        stanza.send();
    }

    return stanza;
});

//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('removeFromRoster',
function(stanzaID, toJID, aName) {

    /**
     * @method removeFromRoster
     * @summary Removes the supplied JID from the receiver JID's roster.
     * @param {String} stanzaID The ID to use on the stanza we're creating. If
     *     this call is being made because of an TP.sig.XMPPRequest, this will
     *     typically be the request's ID.
     * @param {TP.xmpp.JID} toJID The JID to remove from the roster.
     * @param {String} aName The 'user-assigned' name that roster item has.
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.ConnectionNotAuthenticated
     * @returns {TP.xmpp.Stanza} The stanza sent.
     */

    if (TP.notValid(toJID)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    if (!this.hasAuthConnection()) {
        return this.raise('TP.sig.XMPPConnectionNotAuthenticated');
    }

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('sendCommand',
function(stanzaID, toJID, aCommandAction, aCommandElem) {

    /**
     * @method sendCommand
     * @summary Sends the supplied ad-hoc command to the supplied server JID.
     * @param {String} stanzaID The ID to use on the stanza we're creating. If
     *     this call is being made because of an TP.sig.XMPPRequest, this will
     *     typically be the request's ID.
     * @param {TP.xmpp.JID} toJID The server JID to send the command to.
     * @param {String} aCommandAction The action of the command (one of
     *     [cancel|complete| execute|next|prev]).
     * @param {Element} aCommandElem The XML element to send that represents the
     *     ad-hoc XMPP command.
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.InvalidElement
     * @exception TP.sig.ConnectionNotAuthenticated
     * @returns {TP.xmpp.Stanza} The stanza sent.
     */

    if (TP.notValid(toJID)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    if (!TP.isElement(aCommandElem)) {
        return this.raise('TP.sig.InvalidElement');
    }

    if (!this.hasAuthConnection()) {
        return this.raise('TP.sig.XMPPConnectionNotAuthenticated');
    }

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('sendMessage',
function(stanzaID, toJID, aMessage, aSubject, aThreadID, aMessageType) {

    /**
     * @method sendMessage
     * @summary Sends the supplied message to the supplied JID.
     * @param {String} stanzaID The ID to use on the stanza we're creating. If
     *     this call is being made because of an TP.sig.XMPPRequest, this will
     *     typically be the request's ID.
     * @param {TP.xmpp.JID} toJID The JID to send the message to.
     * @param {String} aMessage The message to send.
     * @param {String} aSubject The subject of the message.
     * @param {String} aThreadID The thread ID of the message.
     * @param {String} aMessageType The type of the message (one of
     *     [normal|chat| groupchat|headline]).
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.ConnectionNotAuthenticated
     * @returns {TP.xmpp.Stanza} The stanza sent.
     */

    var conn,
        stanza;

    if (TP.notValid(toJID)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  NB: aMessage, aSubject and aThreadID can all be empty here (even
    //  though having no message might make chatting a bit difficult ;-) ).

    if (!this.hasAuthConnection()) {
        return this.raise('TP.sig.XMPPConnectionNotAuthenticated');
    }

    conn = this.get('connection');

    //  Construct a 'chat' message.
    stanza = conn.constructStanza('chat');
    stanza.set('msgID', stanzaID);

    //  Set the 'to' to the supplied JID and the 'from' to our connected
    //  JID.
    stanza.set('to', toJID.asString());
    stanza.set('from', this.get('connectedJID').asString());

    //  Set the 'body' to the supplied message.
    stanza.set('body', aMessage);

    //  Set the 'subject' to the subject (if supplied).
    if (TP.notEmpty(aSubject)) {
        stanza.set('subject', aSubject);
    }

    //  Set the 'thread' to the thread ID (if supplied).
    if (TP.notEmpty(aThreadID)) {
        stanza.set('thread', aThreadID);
    }

    //  Set the 'message type' to the message type (if supplied).
    if (TP.notEmpty(aMessageType)) {
        stanza.set('tagType', aMessageType);
    }

    //  Capture this stanza as the 'last stanza' - this helps in debugging
    //  situations.
    this.set('lastStanza', stanza);

    //  If 'autosend' is switched on (the default), then send the stanza
    //  right away.
    if (TP.isTrue(this.get('autosend'))) {
        stanza.send();
    }

    return stanza;
});

//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('setPresence',
function(stanzaID, presenceState, aStatus) {

    /**
     * @method setPresence
     * @summary Sets the presence of the receiver's JID to 'available' with an
     *     optional 'status' message.
     * @param {String} stanzaID The ID to use on the stanza we're creating. If
     *     this call is being made because of an TP.sig.XMPPRequest, this will
     *     typically be the request's ID.
     * @param {String} presenceState The presence to set the receiver's JID to.
     *     This should be one of the following constants: TP.xmpp.XMLNS.ONLINE
     *     TP.xmpp.XMLNS.AWAY TP.xmpp.XMLNS.CHAT TP.xmpp.XMLNS.DO_NOT_DISTURB
     *     TP.xmpp.XMLNS.EXTENDED_AWAY.
     * @param {String} aStatus An optional 'status' message to broadcast to
     *     other JID's subscribed to the receiver's JID's presence.
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.ConnectionNotAuthenticated
     * @returns {TP.xmpp.Stanza} The stanza sent.
     */

    var conn,
        stanza;

    if (TP.isEmpty(presenceState)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  NB: aStatus can be empty here.

    if (!this.hasAuthConnection()) {
        return this.raise('TP.sig.XMPPConnectionNotAuthenticated');
    }

    conn = this.get('connection');

    //  Construct an 'available' stanza.
    stanza = conn.constructStanza('available');
    stanza.set('msgID', stanzaID);

    //  Set 'show' to 'online' - not really needed since an 'available'
    //  message with no 'show' is assumed to be in the 'online' state.
    stanza.set('show', presenceState);

    //  Officially, these are not necessary, but we supply them here anyway.
    stanza.set('from', this.get('connectedJID').asString());
    stanza.set('priority', '5');

    //  If a status was supplied, go ahead and use it.
    if (TP.notEmpty(aStatus)) {
        stanza.set('status', aStatus);
    }

    //  Capture this stanza as the 'last stanza' - this helps in debugging
    //  situations.
    this.set('lastStanza', stanza);

    //  If 'autosend' is switched on (the default), then send the stanza
    //  right away.
    if (TP.isTrue(this.get('autosend'))) {
        stanza.send();
    }

    return stanza;
});

//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('subscribeTo',
function(stanzaID, aJID) {

    /**
     * @method subscribeTo
     * @summary Sends a request from the receiver's JID to the supplied JID
     *     asking to be subscribed to its presence.
     * @param {String} stanzaID The ID to use on the stanza we're creating. If
     *     this call is being made because of an TP.sig.XMPPRequest, this will
     *     typically be the request's ID.
     * @param {TP.xmpp.JID} aJID The JID to request presence subscription from.
     * @exception TP.sig.InvalidJID
     * @exception TP.sig.ConnectionNotAuthenticated
     * @returns {TP.xmpp.Stanza} The stanza sent.
     */

    var conn,
        stanza;

    if (TP.notValid(aJID)) {
        return this.raise('TP.sig.InvalidJID');
    }

    if (!this.hasAuthConnection()) {
        return this.raise('TP.sig.XMPPConnectionNotAuthenticated');
    }

    conn = this.get('connection');

    //  Construct a 'subscribe' stanza.
    stanza = conn.constructStanza('subscribe');
    stanza.set('msgID', stanzaID);

    //  Set the 'from' and 'to' appropriately.
    stanza.set('from', this.get('connectedJID').asString());
    stanza.set('to', aJID.asString());

    //  Capture this stanza as the 'last stanza' - this helps in debugging
    //  situations.
    this.set('lastStanza', stanza);

    //  If 'autosend' is switched on (the default), then send the stanza
    //  right away.
    if (TP.isTrue(this.get('autosend'))) {
        stanza.send();
    }

    return stanza;
});

//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('unsubscribeFrom',
function(stanzaID, aJID) {

    /**
     * @method unsubscribeFrom
     * @summary Sends a request from the receiver's JID to the supplied JID
     *     asking to be unsubscribed from its presence.
     * @param {String} stanzaID The ID to use on the stanza we're creating. If
     *     this call is being made because of an TP.sig.XMPPRequest, this will
     *     typically be the request's ID.
     * @param {TP.xmpp.JID} aJID The JID to request presence unsubscription
     *     from.
     * @exception TP.sig.InvalidJID
     * @exception TP.sig.ConnectionNotAuthenticated
     * @returns {TP.xmpp.Stanza} The stanza sent.
     */

    var conn,
        stanza;

    if (TP.notValid(aJID)) {
        return this.raise('TP.sig.InvalidJID');
    }

    if (!this.hasAuthConnection()) {
        return this.raise('TP.sig.XMPPConnectionNotAuthenticated');
    }

    conn = this.get('connection');

    //  Construct an 'unsubscribe' stanza.
    stanza = conn.constructStanza('unsubscribe');
    stanza.set('msgID', stanzaID);

    //  Set the 'from' and 'to' appropriately.
    stanza.set('from', this.get('connectedJID').asString());
    stanza.set('to', aJID.asString());

    //  Capture this stanza as the 'last stanza' - this helps in debugging
    //  situations.
    this.set('lastStanza', stanza);

    //  If 'autosend' is switched on (the default), then send the stanza
    //  right away.
    if (TP.isTrue(this.get('autosend'))) {
        stanza.send();
    }

    return stanza;
});

//  ------------------------------------------------------------------------
//  Pubsub Methods
//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('constructPubsubNode',
function(stanzaID, pubsubServiceJID, nodeID, aSubscribeModel, aPublishModel) {

    /**
     * @method constructPubsubNode
     * @summary Constructs a pubsub node at the specified 'nodeID' (which in
     *     XMPP is usually represented as a 'topic map path'). The receiver's
     *     connected JID will be considered to be the owner of the new pubsub
     *     node.
     * @param {String} stanzaID The ID to use on the stanza we're creating. If
     *     this call is being made because of an TP.sig.XMPPRequest, this will
     *     typically be the request's ID.
     * @param {TP.xmpp.JID} pubsubServiceJID The JID representing the 'pubsub
     *     service'.
     * @param {String} nodeID The 'node ID' (usually a 'topic map path' like
     *     '/foo/bar/baz').
     * @param {String} aSubscribeModel The subscriber access model to use on the
     *     pubsub node. This should be one of the following constants:
     *     TP.xmpp.Pubsub.OPEN TP.xmpp.Pubsub.PRESENCE TP.xmpp.Pubsub.ROSTER
     *     TP.xmpp.Pubsub.AUTHORIZE TP.xmpp.Pubsub.WHITELIST If this parameter
     *     is not supplied, this defaults to TP.xmpp.Pubsub.OPEN.
     * @param {String} aPublishModel The publisher access model to use on the
     *     pubsub node. This should be one of the following constants:
     *     TP.xmpp.Pubsub.OPEN TP.xmpp.Pubsub.PUBLISHERS
     *     TP.xmpp.Pubsub.SUBSCRIBERS If this parameter is not supplied, this
     *     defaults to TP.xmpp.Pubsub.OPEN.
     * @exception TP.sig.InvalidJID
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.ConnectionNotAuthenticated
     * @returns {TP.xmpp.Stanza} The stanza sent.
     * @example
 xmppService.constructPubsubNode( 'create1',
     *     xmppService.get('pubsubJID'), '/home/localhost/testrat');
     */

    var pubsubJID,

        subscriberModel,
        publisherModel,

        conn,
        stanza,

        pubsubPayload,

        configureData,
        newDataField;

    if (TP.isEmpty(nodeID)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    if (!this.hasAuthConnection()) {
        return this.raise('TP.sig.XMPPConnectionNotAuthenticated');
    }

    pubsubJID = TP.ifEmpty(pubsubServiceJID, this.get('pubsubJID'));

    subscriberModel = TP.ifInvalid(aSubscribeModel, TP.xmpp.Pubsub.OPEN);
    publisherModel = TP.ifInvalid(aPublishModel, TP.xmpp.Pubsub.OPEN);

    conn = this.get('connection');

    //  Construct an IQ 'set' stanza and make sure that it has a unique ID
    //  associated with it.
    stanza = conn.constructStanza('set');
    stanza.set('msgID', stanzaID);

    //  Set the 'from' to our connected JID and the 'to' to the pubsub
    //  service's JID.
    stanza.set('from', this.get('connectedJID').asString());
    stanza.set('to', pubsubJID.asString());

    //  Construct an TP.xmpp.PubsubCreate as the payload for the stanza and
    //  set its nodeID to the supplied nodeID.
    pubsubPayload = TP.xmpp.PubsubCreate.construct();
    pubsubPayload.set('nodeID', nodeID);

    //  If the accessModel isn't TP.xmpp.Pubsub.OPEN (the default), then we
    //  have to attach a 'form' supplying all of this config data about the
    //  node to the server.

    //  Note that we *must* do this before attaching the
    //  TP.xmpp.PubsubCreate node as the payload, since the underlying node
    //  references will change once that is done.
    if (subscriberModel !== TP.xmpp.Pubsub.OPEN ||
        publisherModel !== TP.xmpp.Pubsub.PUBLISHERS) {
        //  Construct a 'form' to hold the config data
        configureData = TP.xmpp.XData.construct();
        configureData.set('formType', TP.xmpp.XData.SUBMIT);

        //  Construct a field with a name of 'FORM_TYPE' and a type of
        //  TP.xmpp.XDataField.HIDDEN. Set its value to be one that the
        //  pubsub service will recognize as 'config data for this node'.
        newDataField = TP.xmpp.XDataField.construct().
                                set('name', 'FORM_TYPE').
                                set('type', TP.xmpp.XDataField.HIDDEN).
                                addValue(TP.xmpp.XMLNS.PUBSUB_NODE_CONFIG);
        configureData.addFormItem(newDataField);

        //  Construct a field with a name of 'pubsub#access_model'. Set its
        //  value to be the supplied subscriber model constant.
        newDataField = TP.xmpp.XDataField.construct().
                                    set('name', 'pubsub#access_model').
                                    addValue(subscriberModel);
        configureData.addFormItem(newDataField);

        //  Construct a field with a name of 'pubsub#publish_model'. Set its
        //  value to be the supplied publisher model constant.
        newDataField = TP.xmpp.XDataField.construct().
                                    set('name', 'pubsub#publish_model').
                                    addValue(publisherModel);
        configureData.addFormItem(newDataField);

        //  Add the form to the TP.xmpp.Pubsub payload.
        pubsubPayload.set('configure', configureData);
    }

    //  Add the TP.xmpp.PubsubCreate node as the payload.
    stanza.addPayload(pubsubPayload);

    //  Capture this stanza as the 'last stanza' - this helps in debugging
    //  situations.
    this.set('lastStanza', stanza);

    //  If 'autosend' is switched on (the default), then send the stanza
    //  right away.
    if (TP.isTrue(this.get('autosend'))) {
        stanza.send();
    }

    return stanza;
});

//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('deletePubsubNode',
function(stanzaID, pubsubServiceJID, nodeID) {

    /**
     * @method deletePubsubNode
     * @summary Deletes the pubsub node at the specified 'nodeID' (which in
     *     XMPP is usually represented as a 'topic map path'). The receiver's
     *     connected JID will be considered to be the owner of the new pubsub
     *     node and only the owner can delete this node.
     * @param {String} stanzaID The ID to use on the stanza we're creating. If
     *     this call is being made because of an TP.sig.XMPPRequest, this will
     *     typically be the request's ID.
     * @param {TP.xmpp.JID} pubsubServiceJID The JID representing the 'pubsub
     *     service'.
     * @param {String} nodeID The 'node ID' (usually a 'topic map path' like
     *     '/foo/bar/baz').
     * @exception TP.sig.InvalidJID
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.ConnectionNotAuthenticated
     * @returns {TP.xmpp.Stanza} The stanza sent.
     * @example
 xmppService.deletePubsubNode( 'delete1',
     *     xmppService.get('pubsubJID'), '/home/localhost/testrat');
     */

    var pubsubJID,

        conn,
        stanza,

        pubsubPayload;

    if (TP.isEmpty(nodeID)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    if (!this.hasAuthConnection()) {
        return this.raise('TP.sig.XMPPConnectionNotAuthenticated');
    }

    pubsubJID = TP.ifEmpty(pubsubServiceJID, this.get('pubsubJID'));

    conn = this.get('connection');

    //  Construct an IQ 'set' stanza and make sure that it has a unique ID
    //  associated with it.
    stanza = conn.constructStanza('set');
    stanza.set('msgID', stanzaID);

    //  Set the 'from' to our connected JID and the 'to' to the pubsub
    //  service's JID.
    stanza.set('from', this.get('connectedJID').asString());
    stanza.set('to', pubsubJID.asString());

    //  Construct an TP.xmpp.PubsubDelete as the payload for the stanza and
    //  set its nodeID to the supplied nodeID.
    pubsubPayload = TP.xmpp.PubsubDelete.construct();
    pubsubPayload.set('nodeID', nodeID);

    //  Add the TP.xmpp.PubsubCreate node as the payload.
    stanza.addPayload(pubsubPayload);

    //  Capture this stanza as the 'last stanza' - this helps in debugging
    //  situations.
    this.set('lastStanza', stanza);

    //  If 'autosend' is switched on (the default), then send the stanza
    //  right away.
    if (TP.isTrue(this.get('autosend'))) {
        stanza.send();
    }

    return stanza;
});

//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('publishToPubsubNode',
function(stanzaID, pubsubServiceJID, nodeID, xmlContent, anAccessModel) {

    /**
     * @method publishToPubsubNode
     * @summary Publishes a pubsub node at the specified 'nodeID' (which in
     *     XMPP is usually represented as a 'topic map path'). If the server
     *     that the receiver is connected to supports 'auto-create' and the
     *     referenced node hasn't been created, then a creation attempt will be
     *     made. The receiver's connected JID will be considered to be the owner
     *     of the new pubsub node.
     * @param {String} stanzaID The ID to use on the stanza we're creating. If
     *     this call is being made because of an TP.sig.XMPPRequest, this will
     *     typically be the request's ID.
     * @param {TP.xmpp.JID} pubsubServiceJID The JID representing the 'pubsub
     *     service'.
     * @param {String} nodeID The 'node ID' (usually a 'topic map path' like
     *     '/foo/bar/baz').
     * @param {Node} xmlContent An XML node containing the data to publish to
     *     the node.
     * @param {String} anAccessModel The access model to use on the pubsub node.
     *     This should be one of the following constants: TP.xmpp.Pubsub.OPEN
     *     TP.xmpp.Pubsub.PRESENCE TP.xmpp.Pubsub.ROSTER
     *     TP.xmpp.Pubsub.AUTHORIZE TP.xmpp.Pubsub.WHITELIST If this parameter
     *     is not supplied, this defaults to TP.xmpp.Pubsub.OPEN.
     * @exception TP.sig.InvalidJID
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.InvalidNode
     * @exception TP.sig.ConnectionNotAuthenticated
     * @returns {TP.xmpp.Stanza} The stanza sent.
     * @example
 xmppService.publishToPubsubNode( 'publish1',
     *     xmppService.get('pubsubJID'), '/home/localhost/testrat',
     *     TP.doc('<foo><bar/></foo>'));
     */

    var pubsubJID,
        conn,
        stanza,
        pubsubPayload,
        pubContent,
        accessModel,
        configureData,
        newDataField;

    if (TP.isEmpty(nodeID)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    if (!TP.isNode(xmlContent)) {
        return this.raise('TP.sig.InvalidNode');
    }

    if (!this.hasAuthConnection()) {
        return this.raise('TP.sig.XMPPConnectionNotAuthenticated');
    }

    pubsubJID = TP.ifEmpty(pubsubServiceJID, this.get('pubsubJID'));

    accessModel = TP.ifInvalid(anAccessModel, TP.xmpp.Pubsub.OPEN);

    conn = this.get('connection');

    //  Construct an IQ 'set' stanza and make sure that it has a unique ID
    //  associated with it.
    stanza = conn.constructStanza('set');
    stanza.set('msgID', stanzaID);

    //  Set the 'from' to our connected JID and the 'to' to the pubsub
    //  service's JID.
    stanza.set('from', this.get('connectedJID').asString());
    stanza.set('to', pubsubJID.asString());

    //  Construct an TP.xmpp.PubsubPublish as the payload for the stanza and
    //  set its nodeID to the supplied nodeID.
    pubsubPayload = TP.xmpp.PubsubPublish.construct();
    pubsubPayload.set('nodeID', nodeID);

    //  If the accessModel isn't TP.xmpp.Pubsub.OPEN (the default), then we
    //  have to attach a 'form' supplying all of this config data about the
    //  node to the server.

    //  Note that we *must* do this before attaching the
    //  TP.xmpp.PubsubPublish node as the payload, since the underlying node
    //  references will change once that is done.
    if (accessModel !== TP.xmpp.Pubsub.OPEN) {
        //  Construct a 'form' to hold the config data
        configureData = TP.xmpp.XData.construct();
        configureData.set('formType', TP.xmpp.XData.SUBMIT);

        //  Construct a field with a name of 'FORM_TYPE' and a type of
        //  TP.xmpp.XDataField.HIDDEN. Set its value to be one that the
        //  pubsub service will recognize as 'publish options for this
        //  node'.
        newDataField = TP.xmpp.XDataField.construct().
                            set('name', 'FORM_TYPE').
                            set('type', TP.xmpp.XDataField.HIDDEN).
                            addValue(TP.xmpp.XMLNS.PUBSUB_PUBLISH_OPTIONS);
        configureData.addFormItem(newDataField);

        //  Construct a field with a name of 'pubsub#access_model'. Set its
        //  value to be the supplied access model constant.
        newDataField = TP.xmpp.XDataField.construct().
                            set('name', 'pubsub#access_model').
                            addValue(accessModel);
        configureData.addFormItem(newDataField);

        //  Add the form to the TP.xmpp.Pubsub payload.
        pubsubPayload.set('configure', configureData);
    }

    //  If the content to be published is an XML document, grab its
    //  documentElement, since the appending code wants an Element, not a
    //  Document.
    if (TP.isXMLDocument(pubContent = xmlContent)) {
        pubContent = pubContent.documentElement;
    }

    //  Add it to the pubsub payload (note that we leave off the item ID,
    //  letting the server default it).
    pubsubPayload.addItem(pubContent);

    //  Add the TP.xmpp.PubsubPublish node as the payload.
    stanza.addPayload(pubsubPayload);

    //  Capture this stanza as the 'last stanza' - this helps in debugging
    //  situations.
    this.set('lastStanza', stanza);

    //  If 'autosend' is switched on (the default), then send the stanza
    //  right away.
    if (TP.isTrue(this.get('autosend'))) {
        stanza.send();
    }

    return stanza;
});

//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('retractFromPubsubNode',
function(stanzaID, pubsubServiceJID, nodeID, itemID) {

    /**
     * @method retractFromPubsubNode
     * @summary Clears the pubsub node at the specified 'nodeID' (which in XMPP
     *     is usually represented as a 'topic map path') of all published items.
     *     The receiver's connected JID will be considered to be the owner of
     *     the new pubsub node and only the owner can clear this node.
     * @param {String} stanzaID The ID to use on the stanza we're creating. If
     *     this call is being made because of an TP.sig.XMPPRequest, this will
     *     typically be the request's ID.
     * @param {TP.xmpp.JID} pubsubServiceJID The JID representing the 'pubsub
     *     service'.
     * @param {String} nodeID The 'node ID' (usually a 'topic map path' like
     *     '/foo/bar/baz').
     * @param {String} itemID The 'item ID' (usually a 'object identifer' like
     *     '4D62E20579F7C').
     * @exception TP.sig.InvalidJID
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.ConnectionNotAuthenticated
     * @returns {TP.xmpp.Stanza} The stanza sent.
     * @example
 xmppService.retractFromPubsubNode( 'retract1',
     *     xmppService.get('pubsubJID'), '/home/localhost/testrat',
     *     '4D62E20579F7C');
     */

    var pubsubJID,

        conn,
        stanza,

        pubsubPayload;

    if (TP.isEmpty(nodeID) || TP.isEmpty(itemID)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    if (!this.hasAuthConnection()) {
        return this.raise('TP.sig.XMPPConnectionNotAuthenticated');
    }

    pubsubJID = TP.ifEmpty(pubsubServiceJID, this.get('pubsubJID'));

    conn = this.get('connection');

    //  Construct an IQ 'set' stanza and make sure that it has a unique ID
    //  associated with it.
    stanza = conn.constructStanza('set');
    stanza.set('msgID', stanzaID);

    //  Set the 'from' to our connected JID and the 'to' to the pubsub
    //  service's JID.
    stanza.set('from', this.get('connectedJID').asString());
    stanza.set('to', pubsubJID.asString());

    //  Construct an TP.xmpp.PubsubRetract as the payload for the stanza and
    //  set its nodeID to the supplied nodeID.
    pubsubPayload = TP.xmpp.PubsubRetract.construct();
    pubsubPayload.set('nodeID', nodeID);

    //  Add an item containing our item id (it won't have any payload
    //  itself - since we're retracting all we need is the item ID).
    pubsubPayload.addItem(itemID);

    //  Add the TP.xmpp.PubsubCreate node as the payload.
    stanza.addPayload(pubsubPayload);

    //  Capture this stanza as the 'last stanza' - this helps in debugging
    //  situations.
    this.set('lastStanza', stanza);

    //  If 'autosend' is switched on (the default), then send the stanza
    //  right away.
    if (TP.isTrue(this.get('autosend'))) {
        stanza.send();
    }

    return stanza;
});

//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('retrievePubsubSubscriptions',
function(stanzaID, pubsubServiceJID) {

    /**
     * @method retrievePubsubSubscriptions
     * @summary Creates a subscription to the pubsub node at the specified
     *     'nodeID' (which in XMPP is usually represented as a 'topic map path')
     *     using the receiver's connection JID as the subscribing JID.
     * @param {String} stanzaID The ID to use on the stanza we're creating. If
     *     this call is being made because of an TP.sig.XMPPRequest, this will
     *     typically be the request's ID.
     * @param {TP.xmpp.JID} pubsubServiceJID The JID representing the 'pubsub
     *     service'.
     * @exception TP.sig.InvalidJID
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.ConnectionNotAuthenticated
     * @returns {TP.xmpp.Stanza} The stanza sent.
     * @example
 xmppService.retrievePubsubSubscriptions( 'retrieve1',
     *     xmppService.get('pubsubJID'));
     */

    var pubsubJID,

        conn,
        stanza,

        pubsubPayload;

    if (!this.hasAuthConnection()) {
        return this.raise('TP.sig.XMPPConnectionNotAuthenticated');
    }

    pubsubJID = TP.ifEmpty(pubsubServiceJID, this.get('pubsubJID'));

    conn = this.get('connection');

    //  Construct an IQ 'get' stanza and make sure that it has a unique ID
    //  associated with it.
    stanza = conn.constructStanza('get');
    stanza.set('msgID', stanzaID);

    //  Set the 'from' to our connected JID and the 'to' to the pubsub
    //  service's JID.
    stanza.set('from', this.get('connectedJID').asString());
    stanza.set('to', pubsubJID.asString());

    //  Construct an TP.xmpp.PubsubSubscriptions as the payload for the
    //  stanza
    pubsubPayload = TP.xmpp.PubsubSubscriptions.construct();

    //  Add it to the pubsub payload.
    stanza.addPayload(pubsubPayload);

    //  Capture this stanza as the 'last stanza' - this helps in debugging
    //  situations.
    this.set('lastStanza', stanza);

    //  If 'autosend' is switched on (the default), then send the stanza
    //  right away.
    if (TP.isTrue(this.get('autosend'))) {
        stanza.send();
    }

    return stanza;
});

//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('setPubsubName',
function(aName) {

    /**
     * @method setPubsubName
     * @summary Sets the 'pubsub service name' (i.e. where the pubsub service
     *     can be found on the server). This, when combined with the receiver's
     *     'server name', forms the 'server JID' (i.e. if 'pubsub' is the
     *     service name and 'infohost.com' is the server, this method will
     *     generate a 'pubsub JID' of 'pubsub.infohost.com').
     * @param {String} aName The name of the 'pubsub service' on the server.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.uri.XMPPService} The receiver.
     */

    if (TP.isEmpty(aName)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  First, we set the slot itself - note the usage of '$set()' to avoid
    //  endless recursion.
    this.$set('pubsubName', aName);

    //  Then we recompute the 'pubsubJID' - this is a combination of the
    //  'pubsub name' and the 'server name'
    this.set('pubsubJID', TP.jid(aName +
                                    '.' +
                                    this.get('serverName')));

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('subscribeToPubsubNode',
function(stanzaID, pubsubServiceJID, nodeID) {

    /**
     * @method subscribeToPubsubNode
     * @summary Creates a subscription to the pubsub node at the specified
     *     'nodeID' (which in XMPP is usually represented as a 'topic map path')
     *     using the receiver's connection JID as the subscribing JID.
     * @param {String} stanzaID The ID to use on the stanza we're creating. If
     *     this call is being made because of an TP.sig.XMPPRequest, this will
     *     typically be the request's ID.
     * @param {TP.xmpp.JID} pubsubServiceJID The JID representing the 'pubsub
     *     service'.
     * @param {String} nodeID The 'node ID' (usually a 'topic map path' like
     *     '/foo/bar/baz').
     * @exception TP.sig.InvalidJID
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.ConnectionNotAuthenticated
     * @returns {TP.xmpp.Stanza} The stanza sent.
     * @example
 xmppService.subscribeToPubsubNode( 'subscribe1',
     *     xmppService.get('pubsubJID'), '/home/localhost/testrat');
     */

    var pubsubJID,

        conn,
        stanza,

        pubsubPayload;

    if (TP.isEmpty(nodeID)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    if (!this.hasAuthConnection()) {
        return this.raise('TP.sig.XMPPConnectionNotAuthenticated');
    }

    pubsubJID = TP.ifEmpty(pubsubServiceJID, this.get('pubsubJID'));

    conn = this.get('connection');

    //  Construct an IQ 'set' stanza and make sure that it has a unique ID
    //  associated with it.
    stanza = conn.constructStanza('set');
    stanza.set('msgID', stanzaID);

    //  Set the 'from' to our connected JID and the 'to' to the pubsub
    //  service's JID.
    stanza.set('from', this.get('connectedJID').asString());
    stanza.set('to', pubsubJID.asString());

    //  Construct an TP.xmpp.PubsubSubscribe as the payload for the stanza
    //  and set its nodeID to the supplied nodeID and its subscriberJID to
    //  our connected JID.
    pubsubPayload = TP.xmpp.PubsubSubscribe.construct();
    pubsubPayload.set('nodeID', nodeID);
    pubsubPayload.set('subscriberJID', this.get('connectedJID'));

    //  Add it to the pubsub payload.
    stanza.addPayload(pubsubPayload);

    //  Capture this stanza as the 'last stanza' - this helps in debugging
    //  situations.
    this.set('lastStanza', stanza);

    //  If 'autosend' is switched on (the default), then send the stanza
    //  right away.
    if (TP.isTrue(this.get('autosend'))) {
        stanza.send();
    }

    return stanza;
});

//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('unsubscribeFromPubsubNode',
function(stanzaID, pubsubServiceJID, nodeID) {

    /**
     * @method unsubscribeFromPubsubNode
     * @summary Removes a current subscription to the pubsub node at the
     *     specified 'nodeID' (which in XMPP is usually represented as a 'topic
     *     map path') using the receiver's connection JID as the unsubscribing
     *     JID.
     * @param {String} stanzaID The ID to use on the stanza we're creating. If
     *     this call is being made because of an TP.sig.XMPPRequest, this will
     *     typically be the request's ID.
     * @param {TP.xmpp.JID} pubsubServiceJID The JID representing the 'pubsub
     *     service'.
     * @param {String} nodeID The 'node ID' (usually a 'topic map path' like
     *     '/foo/bar/baz').
     * @exception TP.sig.InvalidJID
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.ConnectionNotAuthenticated
     * @returns {TP.xmpp.Stanza} The stanza sent.
     * @example
 xmppService.unsubscribeFromPubsubNode( 'unsubscribe1',
     *     xmppService.get('pubsubJID'), '/home/localhost/testrat');
     */

    var pubsubJID,

        conn,
        stanza,

        pubsubPayload;

    if (TP.isEmpty(nodeID)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    if (!this.hasAuthConnection()) {
        return this.raise('TP.sig.XMPPConnectionNotAuthenticated');
    }

    pubsubJID = TP.ifEmpty(pubsubServiceJID, this.get('pubsubJID'));

    conn = this.get('connection');

    //  Construct an IQ 'set' stanza and make sure that it has a unique ID
    //  associated with it.
    stanza = conn.constructStanza('set');
    stanza.set('msgID', stanzaID);

    //  Set the 'from' to our connected JID and the 'to' to the pubsub
    //  service's JID.
    stanza.set('from', this.get('connectedJID').asString());
    stanza.set('to', pubsubJID.asString());

    //  Construct an TP.xmpp.PubsubUnsubscribe as the payload for the stanza
    //  and set its nodeID to the supplied nodeID and its subscriberJID to
    //  our connected JID.
    pubsubPayload = TP.xmpp.PubsubUnsubscribe.construct();
    pubsubPayload.set('nodeID', nodeID);
    pubsubPayload.set('subscriberJID', this.get('connectedJID'));

    //  Add it to the pubsub payload.
    stanza.addPayload(pubsubPayload);

    //  Capture this stanza as the 'last stanza' - this helps in debugging
    //  situations.
    this.set('lastStanza', stanza);

    //  If 'autosend' is switched on (the default), then send the stanza
    //  right away.
    if (TP.isTrue(this.get('autosend'))) {
        stanza.send();
    }

    return stanza;
});

//  ------------------------------------------------------------------------
//  XMPP Service Request Processing
//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('openAndAuthConnectionFrom',
function(aRequest) {

    /**
     * @method openAndAuthConnectionFrom
     * @summary Opens and authenticates a connection based on information found
     *     under the 'connectionParams' key in the supplied request.
     * @param {TP.sig.XMPPRequest} aRequest The XMPP request to use to open and
     *     authenticate the connection.
     * @returns {Boolean} Whether or not an open and authenticated connection
     *     was produced from this process.
     */

    //  The service parameters should have already been populated when the
    //  service was initialized.

    //  If we have an open connection, then try to authenticate it. Note
    //  that if the 'connectionJID' or 'connectionPassword' are not supplied
    //  here, the 'authenticateConnection' call will try to obtain them
    //  first by vcard and then by prompting the user if that doesn't work.
    if (this.openConnection()) {
        if (this.authenticateConnection(
                            aRequest.at('connectionJID'),
                            aRequest.at('connectionPassword'))) {
            return true;
        }

        //  Couldn't authenticate the connection - fail it.
        aRequest.fail('Can\'t authenticate connection');

        return false;
    }

    //  Couldn't open the connection - fail it.
    aRequest.fail('Can\'t open connection');

    return false;
});

//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineHandler('XMPPConnectionException',
function(aSignal) {

    /**
     * @method handleXMPPConnectionException
     * @summary Handles when the receiver's connection is ready to send XMPP
     *     packets. Since XMPP servicing is asynchronous, observing this signal
     *     is the only way to know the connection is ready to send more stuff.
     * @param {TP.sig.XMPPConnectionException} aSignal The signal that the
     *     connection is ready.
     * @returns {TP.uri.XMPPService} The receiver.
     */

    //  By the time we get here, the connection will have closed itself. We
    //  just do some cleanup on ourself.

    this.ignore(this.get('connection'), 'TP.sig.XMPPConnectionReady');
    this.ignore(this.get('connection'), 'TP.sig.XMPPConnectionException');

    this.set('connection', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineHandler('XMPPConnectionReady',
function(aSignal) {

    /**
     * @method handleXMPPConnectionReady
     * @summary Handles when the receiver's connection is ready to send XMPP
     *     packets. Since XMPP servicing is asynchronous, observing this signal
     *     is the only way to know the connection is ready to send more stuff.
     * @param {TP.sig.XMPPConnectionReady} aSignal The signal that the
     *     connection is ready.
     * @returns {TP.uri.XMPPService} The receiver.
     */

    var reqQueue,
        request;

    //  If there is something in the request queue, that means that we
    //  wanted to send something while the connection was busy. It's no
    //  longer busy, so pluck the request out of the queue and process it.
    if (TP.notEmpty(reqQueue = this.get('requestQueue'))) {
        if (TP.isValid(request = reqQueue.shift())) {
            this.processTP_sig_XMPPRequest(request);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineHandler('XMPPPubsubInput',
function(aSignal) {

    /**
     * @method handleXMPPPubsubInput
     * @summary Handles when the receiver's connection has sent XMPP pubsub
     *     packets. In this type we use this to track user subscriptions.
     * @param {TP.sig.XMPPPubsubInput} aSignal The signal that pubsub data is
     *     ready.
     * @returns {TP.uri.XMPPService} The receiver.
     */

    var theUser,

        remoteSubscriptions,

        subscriptionResults,
        subscriptionNames;

    //  If we got here because of observation of a request and not of
    //  ourself, then we need to ignore the signal from that request.
    if (aSignal.getOrigin() !== this.getID()) {
        this.ignore(aSignal.getOrigin(), aSignal.getSignalName());
    }

    //  Grab the 'effective' user... this is the object that we'll populate
    //  subscriptions on.
    theUser = TP.core.User.getEffectiveUser();

    //  This will be a TP.core.Hash of serverName -> Array of subscription
    //  names
    remoteSubscriptions = theUser.get('remoteSubscriptions');

    //  The request was successful. Grab the results from the TP.core.Node
    //  at 'node' in the payload.
    if (TP.isValid(subscriptionResults = aSignal.getPayload().at('node'))) {
        if (TP.notEmpty(subscriptionNames =
                        subscriptionResults.evaluateXPath(
                            '//$def:subscription/@node',
                        TP.NODESET))) {
            //  Sometimes node names come with a leading '/'
            subscriptionNames.convert(
                    function(anAttr) {

                        return anAttr.value.strip(/^\//);
                    });
        } else {
            //  There were no entries, but we still want to put an empty
            //  Array in for the subscription names.
            subscriptionNames = TP.ac();
        }
    } else {
        //  There were no entries, but we still want to put an empty Array
        //  in for the subscription names.
        subscriptionNames = TP.ac();
    }

    //  Register this list of subscriptions with the effective user.
    remoteSubscriptions.atPut(
            this.get('pubsubJID').asString(),
            subscriptionNames);

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineHandler('XMPPRequest',
function(aRequest) {

    /**
     * @method handleXMPPRequest
     * @summary Handles when an TP.sig.XMPPRequest is fired. Since this service
     *     will register itself as the default handler for these kinds of
     *     requests, the default instance of it will usually handle all of these
     *     kinds of requests.
     * @param {TP.sig.XMPPRequest} aRequest The XMPP request object to take the
     *     request parameters from.
     * @returns {TP.uri.XMPPService} The receiver.
     */

    var request;

    request = TP.request(aRequest);

    //  We're handling this request, so we stop it from propagating and any
    //  other handler finding it.
    request.stopPropagation();

    //  rewrite the mode, whether we're async or sync. This will only change
    //  the value if it hasn't been set to something already, but it may
    //  warn when the value appears to be inconsistent with what the service
    //  is capable of processing.
    //  NB: The XMPP service is only capable of asynchronous processing.
    request.atPut('async', this.rewriteRequestMode(request));

    //  If this service doesn't have an authenticated (and, therefore, open)
    //  connection, go ahead and try to open one from the parameters given
    //  in the request.
    if (!this.hasAuthConnection()) {
        //  Push the request into the request queue. The XMPP connection
        //  will go asynch after it authenticates and therefore we need to
        //  process requests via the queue.
        this.get('requestQueue').push(request);

        //  Open and authenticate.
        if (this.openAndAuthConnectionFrom(request)) {
            //  We're authenticated. Set up the current user on the
            //  connection (i.e. announce presence).
            this.setupCurrentUser();
        } else {
            //  Couldn't open or authenticate the connection. The request
            //  will already have been failed. Don't hold onto it or the
            //  request queue.
            this.set('requestQueue', null);
        }
    } else if (this.get('connection').isBusy()) {
        //  If the connection is already busy sending something, just push
        //  our request onto the end of the queue. It will be serviced as
        //  soon as the connection returns.
        this.get('requestQueue').push(request);
    } else {
        //  Otherwise, we have an open, non-busy, connection. Go ahead and
        //  process the request right away.
        this.processTP_sig_XMPPRequest(request);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.XMPPService.Inst.defineMethod('processTP_sig_XMPPRequest',
function(aRequest) {

    /**
     * @method processTP_sig_XMPPRequest
     * @summary Processes the supplied request and calls the appropriate method
     *     on the receiver based on the 'action' supplied in the request.
     * @param {TP.sig.XMPPRequest} aRequest The XMPP request object to take the
     *     request parameters from.
     * @returns {TP.uri.XMPPService} The receiver.
     */

    var wasAutoSending,
        observeReq,
        reqID,
        handler,
        stanza;

    //  Capture the autosend value and set autosend to false.
    wasAutoSending = this.get('autosend');
    this.set('autosend', false);

    //  The following operations get the request ID 'stamped' into the
    //  stanza:

    //  fetchRoster, addToRoster, removeFromRoster

    //  constructPubsubNode, deletePubsubNode, publishToPubsubNode,
    //  retractFromPubsubNode,
    //  subscribeToPubsubNode, unsubscribeFromPubsubNode,


    //  The following operations do not get the request ID 'stamped'
    //  into the stanza:

    //  sendMessage, setPresence, subscribeTo, unsubscribeFrom,

    observeReq = false;
    reqID = aRequest.getRequestID();

    switch (aRequest.at('action')) {
        //  Send a command from the 'from' JID
        case 'command':

            observeReq = true;

            stanza = this.sendCommand(
                            reqID,
                            aRequest.at('toJID'),
                            aRequest.at('cmd_action'),
                            TP.elem(aRequest.at('node')));

            break;

        //  Just activate the connection
        case 'connect':

        //  There won't be a stanza - we're just activating the connection

            break;

        //  Send a message from the 'from' JID

        case 'message':

            stanza = this.sendMessage(
                            reqID,
                            aRequest.at('toJID'),
                            aRequest.at('body'),
                            aRequest.at('subject'),
                            aRequest.at('thread'),
                            aRequest.at('type'));

            break;

        //  Subscribe to a pubsub node

        case 'pubsub':

            observeReq = true;

            switch (aRequest.at('pubsub_action')) {
                case 'create':

                    stanza = this.constructPubsubNode(
                                        reqID,
                                        aRequest.at('pubsubServiceJID'),
                                        aRequest.at('nodeID'),
                                        aRequest.at('subAccessModel'),
                                        aRequest.at('pubAccessModel'));

                    break;

                case 'subscribe':

                    stanza = this.subscribeToPubsubNode(
                                        reqID,
                                        aRequest.at('pubsubServiceJID'),
                                        aRequest.at('nodeID'));

                    break;

                case 'unsubscribe':

                    stanza = this.unsubscribeFromPubsubNode(
                                        reqID,
                                        aRequest.at('pubsubServiceJID'),
                                        aRequest.at('nodeID'));

                    break;

                case 'subscriptions':

                    stanza = this.retrievePubsubSubscriptions(
                                        reqID,
                                        aRequest.at('pubsubServiceJID'));

                    break;

                case 'publish':

                    stanza = this.publishToPubsubNode(
                                        reqID,
                                        aRequest.at('pubsubServiceJID'),
                                        aRequest.at('nodeID'),
                                        aRequest.at('payload'),
                                        aRequest.at('subAccessModel'));

                    break;

                case 'retract':

                    stanza = this.retractFromPubsubNode(
                                        reqID,
                                        aRequest.at('pubsubServiceJID'),
                                        aRequest.at('nodeID'),
                                        aRequest.at('itemID'));

                    break;

                case 'delete':

                    stanza = this.deletePubsubNode(
                                        reqID,
                                        aRequest.at('pubsubServiceJID'),
                                        aRequest.at('nodeID'));

                    break;

                default:

                    aRequest.fail('Unrecognized pubsub action');

                    return this;
            }

            break;

        //  Remove an entry from the 'from' JID's roster
        case 'remove':

            observeReq = true;

            stanza = this.removeFromRoster(reqID,
                                            aRequest.at('toJID'),
                                            aRequest.at('name'));

            break;

        //  Add an entry from the 'from' JID's roster
        case 'roster':

            observeReq = true;

            stanza = this.addToRoster(reqID,
                                        aRequest.at('toJID'),
                                        aRequest.at('name'),
                                        aRequest.at('group'));

            break;

        //  Subscribe to a JID
        case 'subscribe':

            stanza = this.subscribeTo(reqID,
                                        aRequest.at('toJID'));

            break;

        //  Unsubscribe from a JID
        case 'unsubscribe':

            stanza = this.unsubscribeFrom(reqID,
                                            aRequest.at('toJID'));

            break;

        //  Change the 'from' JID's presence
        case 'presence':

            stanza = this.setPresence(reqID,
                                        aRequest.at('show'),
                                        aRequest.at('status'));

            break;

        default:

            aRequest.fail('Unrecognized action');

            return this;
    }

    //  If we're observing the request (ID) for TP.sig.XMPPInput (and
    //  subtypes), then set up the observation. When the XMPP response
    //  stanza with the same 'ID' is returned, this handler will detect
    //  whether its an error and either fail the request or complete it.
    if (observeReq) {
        handler = function(aSignal) {

            var tpNode;

            //  Ignore the signal to avoid having lots of observations
            //  around. Note here how we specifically ignore
            //  'TP.sig.XMPPInput' in case the signal's signal name is a
            //  subtype of that.
            this.ignore(reqID, 'TP.sig.XMPPInput', handler);

            if (TP.isValid(tpNode = aSignal.getPayload().at('node'))) {
                aRequest.set('result', tpNode);

                if (!aRequest.didComplete()) {
                    if (tpNode.isError()) {
                        aRequest.fail();
                    } else {
                        aRequest.complete();
                    }
                }
            } else {
                if (!aRequest.didComplete()) {
                    aRequest.complete();
                }
            }
        }.bind(this);

        this.observe(
            reqID,
            'TP.sig.XMPPInput',
               handler);

    } else {
        if (!aRequest.didComplete()) {
            aRequest.complete();
        }
    }

    if (TP.isValid(stanza)) {
        //  Now that observing the request is set up (if we need it to), go
        //  ahead and send the stanza.
        stanza.send();
    }

    //  Set autosend back to what it was before
    this.set('autosend', wasAutoSending);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
