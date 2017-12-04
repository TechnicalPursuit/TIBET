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
 * @type {TP.xmpp.Connection}
 * @summary Handles all communication between a specific JID in the client and
 *     a particular Jabber server. The interface is modeled very loosely on the
 *     JDBC pattern of opening a connection and asking for a 'statement', in
 *     this case, a stanza of some form.
 *
 *
 * @example

 *     conn = TP.xmpp.Connection.open(aName,
 *              TP.hc('httpServerURI', aURI,
 *                      'connectionType', TP.xmpp.XMLNS.BINDING));
 *
 *     if (!conn.authenticate(aJID, aPassword)) { // auth failed };
 *
 *     // <message type="normal"> msg = conn.constructStanza();
 *
 *     OR
 *
 *     // <iq type="get"> msg = conn.constructStanza('get');
 *
 *     OR
 *
 *     // <iq type="get"><query xmlns="jabber:iq:auth"></query></iq> msg =
 *     conn.constructStanza('get', null, TP.xmpp.IqAuth.construct());
 *     msg.getPayload('query', TP.xmpp.XMLNS.IQ_AUTH).item(0).set( 'userName',
 *     aJID); msg.set*();
 *
 *     res = msg.send(); res.get*();
 *
 *     conn.close();
 *
 *
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('xmpp.Connection');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  The 'default resource' (for JIDs), in case the user didn't supply one.
TP.xmpp.Connection.Type.defineAttribute('defaultResource', 'TIBET');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xmpp.Connection.Type.defineMethod('open',
function(aServerName, aConnectionInfo) {

    /**
     * @method open
     * @summary Opens a new connection to the serverName using the connection
     *     information provided.
     * @param {String} aServerName The actual server name to connect to. This
     *     can be altered by the server in certain circumstances.
     * @param {TP.core.Hash} aConnectionInfo The hash containing 'connection
     *     information', such as 'httpServerURI' and 'connectionType'.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.xmpp.Connection} A new instance.
     */

    var inst;

    if (TP.isEmpty(aServerName)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    inst = this.construct(aServerName, aConnectionInfo);
    if (inst.open()) {
        return inst;
    }

    return null;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the 'tranport' used by this connection
TP.xmpp.Connection.Inst.defineAttribute('transport');

//  the name of the server this connection is connected to
TP.xmpp.Connection.Inst.defineAttribute('serverName');

//  the two streams we'll use to capture the conversation
TP.xmpp.Connection.Inst.defineAttribute('outStream');
TP.xmpp.Connection.Inst.defineAttribute('inStream');

//  whether or not the server we're connecting to wants to 'bind' resources
//  Note that we have an initial value here of 'null' on purpose - see
//  usage.
TP.xmpp.Connection.Inst.defineAttribute('wantsBinding', null);

//  whether or not the server we're connecting to wants to maintain
//  'sessions'.
//  Note that we have an initial value here of 'null' on purpose - see
//  usage.
TP.xmpp.Connection.Inst.defineAttribute('wantsSession', null);

//  the SASL authentication methods we can use to authenticate
TP.xmpp.Connection.Inst.defineAttribute('SASLMechanisms');

//  the jabber ID associated with this connection
TP.xmpp.Connection.Inst.defineAttribute('jid');

//  contains the last msg ID used for a send() on this connection
TP.xmpp.Connection.Inst.defineAttribute('msgID');

//  is the connection currently considered open?
TP.xmpp.Connection.Inst.defineAttribute('$open', false);

//  has the connection been authenticated?
TP.xmpp.Connection.Inst.defineAttribute('authenticated', false);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.Connection.Inst.defineMethod('init',
function(aServerName, aConnectionInfo) {

    /**
     * @method init
     * @summary Initializes a new instance.
     * @param {String} aServerName The actual server name to connect to. This
     *     can be altered by the server in certain circumstances.
     * @param {TP.core.Hash} aConnectionInfo The hash containing 'connection
     *     information', such as 'httpServerURI' and 'connectionType'.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.xmpp.Connection} A new instance.
     */

    var instr,
        outstr,

        connectionType;

    if (TP.isEmpty(aServerName)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    this.callNextMethod();

    //  with jabber you can specify a logical server name that differs from
    //  the server you're connecting to...and the server can then alias
    //  that on opening the connection. we default to the physical server.
    this.set('serverName', aServerName);

    //  Capture the serverName in the connection info
    aConnectionInfo.atPut('serverName', aServerName);

    //  construct the streams we'll be using

    //  We don't start with any initial node for the input stream and we
    //  supply 'this' as the stream's connection.
    instr = TP.xmpp.InputStream.construct(null, this);
    this.set('inStream', instr);
    aConnectionInfo.atPut('inStream', instr);

    //  We don't start with any initial node for the output stream and we
    //  supply 'this' as the stream's connection.
    outstr = TP.xmpp.OutputStream.construct(null, this);
    this.set('outStream', outstr);
    aConnectionInfo.atPut('outStream', outstr);

    //  Allocate an initialize a transport
    connectionType = TP.ifEmpty(aConnectionInfo.at('connectionType'),
                                TP.xmpp.XMLNS.BINDING);

    //  For now, we only support binding
    if (connectionType.toLowerCase() === TP.xmpp.XMLNS.BINDING) {
        this.set('transport',
                    TP.xmpp.BOSHTransport.construct(aConnectionInfo));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.Connection.Inst.defineMethod('$auth',
function(aJID, aPassword, aMethod) {

    /**
     * @method $auth
     * @summary Authenticates the connection using the JID, password, and
     *     method provided.
     * @param {TP.xmpp.JID|String} aJID A proper JID or JID string.
     * @param {String} aPassword The password to use.
     * @param {String} aMethod An XMPP SASL authentication type: PLAINTEXT or
     *     DIGEST (the default).
     * @exception TP.sig.InvalidXMPPResponse
     * @exception TP.sig.UnsupportedXMPPAuthMethod
     * @exception TP.sig.XMPPAuthException
     * @exception TP.sig.InvalidParameter
     * @returns {Boolean} True on successful authentication.
     */

    var method,
        authenticated;

    if (TP.notValid(aJID) || TP.isEmpty(aPassword)) {
        this.raise('TP.sig.InvalidParameter');

        return false;
    }

    //  If the list of SASL methods is empty, then we didn't obtain a valid
    //  list of authentication mechanisms when we opened the connection and
    //  we should bail out here.
    if (TP.isEmpty(this.get('SASLMechanisms'))) {
        this.raise('TP.sig.XMPPAuthException',
                    'No valid authentication mechanisms found');

        return false;
    }

    method = TP.ifInvalid(aMethod, TP.xmpp.XMLNS.DIGEST);

    //  If the currently available SASL mechanisms don't support the method
    //  that the caller desired, bail out here.
    if (!this.get('SASLMechanisms').contains(method)) {
        this.raise('TP.sig.UnsupportedXMPPAuthMethod',
                    'Desired authentication mechanism not supported');
    }

    switch (method) {
        case TP.xmpp.XMLNS.DIGEST:
            authenticated = this.$authDigest(aJID, aPassword);
            break;

        case TP.xmpp.XMLNS.PLAINTEXT:
            authenticated = this.$authPlainText(aJID, aPassword);
            break;

        default:
            authenticated = false;
            break;
    }

    return authenticated;
});

//  ------------------------------------------------------------------------

TP.xmpp.Connection.Inst.defineMethod('$authDigest',
function(aJID, aPassword) {

    /**
     * @method $authDigest
     * @summary Authenticates the username and password provided using the
     *     digest-MD5 model.
     * @param {TP.xmpp.JID|String} aJID A proper JID or JID string.
     * @param {String} aPassword The password to use.
     * @exception TP.sig.InvalidXMPPResponse
     * @exception TP.sig.UnsupportedXMPPAuthMethod
     * @exception TP.sig.XMPPAuthException
     * @returns {Boolean} True on successful authentication.
     */

    var theJID,

        outstr,

        auth,

        res,

        challengeBase64,
        challengePlainText,

        serverNonceIndex,
        serverNonce,

        clientNonce,

        digestURI,

        nc,

        seed,

        HA1,
        HA2,

        responseVal,

        responsePlain,
        responseBase64,

        responseElem,

        responseChallengeBase64,
        responseChallengePlain,

        rspAuth,

        responseChallengeTest;

    if (TP.notValid(aJID) || TP.isEmpty(aPassword)) {
        this.raise('TP.sig.InvalidParameter');

        return false;
    }

    //  This is digest authentication as described by:
    //  http://en.wikipedia.org/wiki/Digest_access_authentication

    //  make sure that aJID is a JID
    theJID = aJID.asJID();

    //  get a handle to our output stream so we can write
    outstr = this.getOutputStream();

    //  Step #1-3 in the SASL portion of the XMPP 1.0 protocol already took
    //  place when opening the connection. See the 'open' method of this
    //  type.


    //  Step #4 in the SASL portion of the XMPP 1.0 protocol

    //  Send a SASL 'auth' packet to the server telling it that we're going
    //  to be using 'DIGEST-MD5' authentication.
    auth = TP.xmpp.SASLAuth.construct();
    auth.setAttribute('mechanism', 'DIGEST-MD5');

    //  Note how we manually send this by writing to the output stream
    //  directly, since 'send' is meant to send XMPP stanzas.
    outstr.write(auth);


    //  Step #5 in the SASL portion of the XMPP 1.0 protocol

    //  Look for our first base64-encoded 'challenge' element
    res = this.get('transport').receive();

    //  Didn't get valid data so we return false
    if (TP.notValid(res)) {
        return false;
    }

    //  make sure the node has a name of 'challenge' with a namespace of
    //  TP.xmpp.XMLNS.SASL. This 'challenge' contains base64 encoded
    //  challenge information that we will use in the next step of
    //  authentication.
    if (res.getLocalName() !== 'challenge' ||
        TP.nodeGetNSURI(res.getNativeNode()) !== TP.xmpp.XMLNS.SASL) {
        this.raise('TP.sig.UnsupportedXMPPAuthMethod',
                    'SASL DIGEST-MD5 not supported');

        return false;
    }

    //  The text value of the element will contain the base64-encoded data.
    challengeBase64 = res.getTextContent();

    if (TP.isEmpty(challengeBase64)) {
        this.raise('TP.sig.XMPPAuthException',
                    'SASL DIGEST-MD5 challenge data missing');

        return false;
    }

    //  Decode the base64 data into plain text.
    challengePlainText = TP.atob(challengeBase64);

    //  Grab the 'nonce' value by substringing from the index of 'nonce='
    //  in the plain text data to the end of the nonce "
    serverNonceIndex = challengePlainText.indexOf('nonce=') + 7;

    serverNonce = challengePlainText.substring(
                    serverNonceIndex,
                    challengePlainText.indexOf('"', serverNonceIndex));

    if (TP.isEmpty(serverNonce)) {
        this.raise('TP.sig.XMPPAuthException',
                    'SASL DIGEST-MD5 challenge server nonce not found');

        return false;
    }

    //  Compute the 'client side nonce' value.
    clientNonce = TP.generateRandomValue(14);

    //  Compute a 'digestURI' by appending the server name that we're
    //  connecting to to 'xmpp/'
    digestURI = 'xmpp/' + theJID.get('domain');

    //  The request counter is currently set to 1.
    nc = '00000001';

    //  Calculate the 'HA1' value
    seed = TP.join(theJID.get('node'), ':',
                    theJID.get('domain'), ':',
                    aPassword);
    HA1 = TP.join(
                TP.hash(seed, TP.HASH_MD5, TP.HASH_LATIN1),
                ':', serverNonce,
                ':', clientNonce);

    //  Calculate the 'HA2' value
    HA2 = 'AUTHENTICATE:' + digestURI;

    //  Calculate the response value.
    responseVal = TP.hash(
                        TP.join(
                            TP.hash(HA1, TP.HASH_MD5, TP.HASH_HEX), ':',
                            serverNonce, ':',
                            nc, ':',
                            clientNonce, ':',
                            'auth:', TP.hash(HA2, TP.HASH_MD5, TP.HASH_HEX)),
                        TP.HASH_MD5,
                        TP.HASH_HEX);

    //  The entire response consists of the username, realm, nonce, cnonce,
    //  nc, digest-uri, and response value.
    responsePlain = TP.join('username="', theJID.get('node'), '",',
                            'realm="', theJID.get('domain'), '",',
                            'nonce="', serverNonce, '",',
                            'cnonce="', clientNonce, '",',
                            'nc="', nc, '",',
                            'qop=auth,digest-uri="', digestURI, '",',
                            'response="', responseVal, '",',
                            'charset=', TP.UTF8);

    //  Compute a binary value from the entire response and then make a
    //  base64 value of that.

    responseBase64 = TP.extern.forge.util.encode64(
                        TP.extern.forge.util.encodeUtf8(responsePlain));

    //  Step #6 in the SASL portion of the XMPP 1.0 protocol

    //  Send a SASL 'response' packet to the server with the response base64
    //  as the text value of the response.
    responseElem = TP.xmpp.SASLResponse.construct();
    responseElem.setTextContent(responseBase64);

    //  Note how we manually send this by writing to the output stream
    //  directly, since 'send' is meant to send XMPP stanzas.
    outstr.write(responseElem);


    //  Step #7 in the SASL portion of the XMPP 1.0 protocol

    //  Look for the second base64-encoded 'challenge' element. This also
    //  checks for SASL 'success' and 'failure's.
    res = this.get('transport').receive();

    //  Didn't get valid data so we return false
    if (TP.notValid(res)) {
        return false;
    }

    //  If we got a 'challenge' element back from the server, then it wants
    //  to 'challenge' us further.
    while (res.getLocalName() === 'challenge') {
        //  At this point, res should be the second 'challenge' element
        //  sent by the server.

        responseChallengeBase64 = res.getTextContent();

        if (TP.isEmpty(responseChallengeBase64)) {
            this.raise('TP.sig.XMPPAuthException',
                        'SASL DIGEST-MD5 response text missing');

            return false;
        }

        responseChallengePlain = TP.atob(responseChallengeBase64);

        rspAuth = responseChallengePlain.substring(
                        responseChallengePlain.indexOf('rspauth=') + 8);

        //  Reset the 'HA2' value
        HA2 = ':' + digestURI;

        //  Create a 'test' value that should match 'rspAuth'
        responseChallengeTest =
                TP.hash(
                    TP.join(TP.hash(HA1, TP.HASH_MD5, TP.HASH_HEX), ':',
                            serverNonce, ':',
                            nc, ':',
                            clientNonce, ':',
                            'auth:', TP.hash(HA2, TP.HASH_MD5, TP.HASH_HEX)),
                    TP.HASH_MD5,
                    TP.HASH_HEX);

        if (responseChallengeTest !== rspAuth) {
            this.raise('TP.sig.XMPPAuthException',
                        'SASL DIGEST-MD5 response test did not match ' +
                        'initial response text');

            return false;
        }


        //  Step #8 in the SASL portion of the XMPP 1.0 protocol

        //  We now send an empty 'response' element back to the server.
        responseElem = TP.xmpp.SASLResponse.construct();

        //  Note how we manually send this by writing to the output stream
        //  directly, since 'send' is meant to send XMPP stanzas.
        outstr.write(responseElem);

        res = this.get('transport').receive();

        //  Didn't get valid data so we return false
        if (TP.notValid(res)) {
            return false;
        }
    }


    //  Step #9 in the SASL portion of the XMPP 1.0 protocol

    //  Look for either the 'success' or 'failure' element around
    //  authentication.
    if (res.getLocalName() !== 'success' ||
        TP.nodeGetNSURI(res.getNativeNode()) !== TP.xmpp.XMLNS.SASL) {
        this.raise('TP.sig.XMPPAuthException',
                    'SASL DIGEST-MD5 did not successfully authenticate');

        return false;
    }

    return true;
}, {
    dependencies: [TP.extern.forge]
});

//  ------------------------------------------------------------------------

TP.xmpp.Connection.Inst.defineMethod('$authPlainText',
function(aJID, aPassword) {

    /**
     * @method $authPlainText
     * @summary Authenticates the username and password provided using the
     *     plaintext model.
     * @param {TP.xmpp.JID|String} aJID A proper JID or JID string.
     * @param {String} aPassword The password to use.
     * @exception TP.sig.InvalidXMPPResponse
     * @exception TP.sig.UnsupportedXMPPAuthMethod
     * @exception TP.sig.XMPPAuthException
     * @returns {Boolean} True on successful authentication.
     */

    TP.override();

    return false;
});

//  ------------------------------------------------------------------------

TP.xmpp.Connection.Inst.defineMethod('authenticate',
function(aJID, aPassword) {

    /**
     * @method authenticate
     * @summary Authenticates the connection using the JID and password
     *     provided.
     * @param {TP.xmpp.JID|String} aJID A proper JID or JID String.
     * @param {String} aPassword The password to use.
     * @returns {Boolean} True on successful connection.
     */

    var jid,
        authenticated,
        featuresElement;

    if (TP.notValid(aJID) || TP.isEmpty(aPassword)) {
        this.raise('TP.sig.InvalidParameter');

        return false;
    }

    jid = aJID.asJID();

    //  If the JID didn't have a 'resource path' then we add '/' and this
    //  type's default resource path to it.
    if (TP.isEmpty(jid.get('resourcePath'))) {
        jid = TP.xmpp.JID.construct(TP.join(
                                jid.asString(),
                                '/',
                                this.getType().get('defaultResource')));
    }

    this.set('jid', jid);

    //  Perform the actual authentication.
    authenticated = this.$auth(jid, aPassword);
    if (!authenticated) {
        //  Couldn't get authenticated - close the connection and return
        //  false.
        this.close();

        return false;
    }

    this.get('transport').connectionDidAuthenticate();

    featuresElement = this.get('transport').receive();

    //  Because we used the 'receive' call above, we got a TP.core.Node, but
    //  'obtainStreamFeatures' expects a native node, so we convert it.
    if (TP.isValid(featuresElement) &&
        TP.isElement(featuresElement = featuresElement.getNativeNode())) {
        this.obtainStreamFeatures(featuresElement);
    }

    //  If the server is configured to want us to bind any resources that
    //  we're going to use (like the one specified on our JID), then go
    //  ahead and bind those resources.
    if (TP.isTrue(this.get('wantsBinding'))) {
        if (!this.bindResource(jid)) {
            return false;
        }
    }

    //  If the server is configured to want us to request a session, then go
    //  ahead and do that as well.
    if (TP.isTrue(this.get('wantsSession'))) {
        if (!this.establishSession(jid)) {
            return false;
        }
    }

    //  We're authenticated - yay!
    this.isAuthenticated(true);

    //  Observe TP.sig.XMPPTransportReady signals from the tranport... we're
    //  getting going.
    this.observe(this.get('transport'), 'TP.sig.XMPPTransportReady');
    this.observe(this.get('transport'), 'TP.sig.XMPPTransportException');

    //  Tell our transport to go ahead and start receiving.
    this.get('transport').startReceiving();

    //  The connection is available.
    this.signal('TP.sig.XMPPConnectionReady');

    return true;
});

//  ------------------------------------------------------------------------

TP.xmpp.Connection.Inst.defineMethod('bindResource',
function(aJID) {

    /**
     * @method bindResource
     * @summary Establishes an XMPP 1.0 'binding' for the resource that the
     *     supplied JID is requesting. This step takes place after SASL
     *     authentication.
     * @param {TP.xmpp.JID|String} aJID A proper JID or JID string.
     * @exception TP.sig.InvalidXMPPResponse
     * @exception TP.sig.XMPPResourceAllocationException
     * @exception TP.sig.InvalidParameter
     * @returns {Boolean} True on successful resource binding.
     */

    var bindElem,
        bindMsg,

        res,

        jidElem,
        jidVal;

    if (TP.notValid(aJID)) {
        this.raise('TP.sig.InvalidParameter');

        return false;
    }

    //  The server supports 'resource binding' (or we wouldn't have gotten
    //  to this method). We'll tell it to bind us to the supplied JID's
    //  resource if it can (this will default to the value 'TIBET' as per
    //  the 'defaultResource' attribute on the TP.xmpp.Connection type).

    bindElem = TP.xmpp.BindResource.construct();
    bindElem.addResource(aJID.get('resourcePath'));

    bindMsg = this.constructStanza('set', null, bindElem);
    this.send(bindMsg);

    //  Look for our 'resource binding' element
    res = this.get('transport').receive();

    //  Didn't get valid data so we return false
    if (TP.notValid(res)) {
        return false;
    }

    jidElem = res.getElementsByTagName('jid').first();

    if (TP.notValid(jidElem)) {
        this.raise('TP.sig.XMPPResourceAllocationException',
                    TP.join('Server could not allocate resource: ',
                            aJID.get('resourcePath'),
                            ' for JID: ',
                            aJID.asString()));

        return false;
    }

    //  If the JID that was supplied and the JID that was returned from the
    //  server don't match, that means the server could not allocate the
    //  resource requested by the user.

    //  Update the JID that was supplied to this routine with the new JID
    //  value.
    jidVal = jidElem.getTextContent();
    if (aJID.asString() !== jidVal) {
        aJID.set('jid', jidVal);

        TP.ifWarn() ?
            TP.warn(TP.join('Server could not allocate resource for JID: ',
                            aJID.asString(),
                            '. JID reset to: ',
                            jidVal),
                    TP.IO_LOG) : 0;
    }

    return true;
});

//  ------------------------------------------------------------------------

TP.xmpp.Connection.Inst.defineMethod('close',
function(serverClosed) {

    /**
     * @method close
     * @summary Closes the connection.
     * @param {Boolean} serverClosed Pass true if you're closing because the
     *     server closed first.
     * @returns {Boolean} True if the connection is closed successfully.
     */

    if (!this.isOpen()) {
        return true;
    }

    //  close our conversational stream as long as we're not closing due to
    //  a notification or error from the server
    if (TP.notTrue(serverClosed)) {
        this.getOutputStream().close();
    }

    //  Let the transport know to stop the receiving in preparation for
    //  closing the connection.
    this.get('transport').stopReceiving();

    this.get('transport').disconnect();

    //  Ignore TP.sig.XMPPTransportReady signals from the tranport... we're
    //  shutting down.
    this.ignore(this.get('transport'), 'TP.sig.XMPPTransportReady');
    this.ignore(this.get('transport'), 'TP.sig.XMPPTransportException');

    this.isOpen(false);

    return !this.isOpen();
});

//  ------------------------------------------------------------------------

TP.xmpp.Connection.Inst.defineMethod('constructStanza',
function(aStanzaType, toJID, aPayload) {

    /**
     * @method constructStanza
     * @summary Constructs a new TP.xmpp.Stanza of the proper type and
     *     configured using the parameters provided. This is the preferred
     *     method for creating new stanzas which aren't responses to incoming
     *     stanzas.
     * @param {String} aStanzaType The stanza type to construct.
     * @param {String|JID} toJID The JID to target.
     * @param {TP.xmpp.Payload} aPayload A payload instance.
     * @exception TP.sig.InvalidInstantiation
     * @exception TP.sig.InvalidXMPPStanzaType
     * @returns {TP.xmpp.Stanza} A new stanza instance.
     */

    var tagName,
        tagType,
        inst;

    tagName = TP.ifInvalid(aStanzaType, 'normal');
    if (!TP.isType(tagType = TP.xmpp.XMLNS.getStanzaType(tagName))) {
        return this.raise('TP.sig.InvalidXMPPStanzaType',
                            tagName);
    }

    if (TP.notValid(inst = tagType.construct())) {
        return this.raise('TP.sig.InvalidInstantiation',
                            tagType);
    }

    //  don't assume it's one-to-one between type strings and types
    inst.set('stanzaType', tagName);
    inst.set('connection', this);

    if (TP.isValid(toJID)) {
        inst.set('to', toJID.asString());
    }

    if (TP.isValid(aPayload)) {
        inst.addPayload(aPayload);
    }

    return inst;
});

//  ------------------------------------------------------------------------

TP.xmpp.Connection.Inst.defineMethod('establishSession',
function(aJID) {

    /**
     * @method establishSession
     * @summary Establishes an XMPP 1.0 'session'. This step takes place after
     *     SASL authentication and JID resource binding and is what allows the
     *     various IM status, chat, etc. stanzas to be processed by the server.
     * @param {TP.xmpp.JID|String} aJID A proper JID or JID string.
     * @exception TP.sig.InvalidXMPPResponse
     * @exception TP.sig.SessionEstablishmentException
     * @returns {Boolean} True on successful session establishment.
     */

    var sessionElem,
        sessionMsg,

        res,

        errorTPElem;

    if (TP.notValid(aJID)) {
        this.raise('TP.sig.InvalidParameter');
        return false;
    }

    //  The server supports 'session establishment' (or we wouldn't have
    //  gotten to this method).

    sessionElem = TP.xmpp.Session.construct();

    sessionMsg = this.constructStanza('set', null, sessionElem);
    sessionMsg.set('from', aJID.asString());
    this.send(sessionMsg);

    //  Look to make sure that we didn't get an error element back
    res = this.get('transport').receive();

    //  Didn't get valid data so we return false
    if (TP.notValid(res)) {
        return false;
    }

    errorTPElem = res.getElementsByTagName('error').first();

    if (TP.isValid(errorTPElem)) {
        this.raise(
                'TP.sig.XMPPSessionEstablishmentException',
                TP.join('Server could not establish a session for JID: ',
                        aJID.asString()));

        return false;
    }

    return true;
});

//  ------------------------------------------------------------------------

TP.xmpp.Connection.Inst.defineMethod('getInputStream',
function() {

    /**
     * @method getInputStream
     * @summary Returns the receiver's input stream.
     * @returns {TP.xmpp.InputStream} The input stream instance.
     */

    return this.get('inStream');
});

//  ------------------------------------------------------------------------

TP.xmpp.Connection.Inst.defineMethod('getLastMessageID',
function() {

    /**
     * @method getLastMessageID
     * @summary Returns the last generated message ID for this connection.
     * @returns {String}
     */

    return this.$get('msgID');
});

//  ------------------------------------------------------------------------

TP.xmpp.Connection.Inst.defineMethod('getMessageCount',
function() {

    /**
     * @method getMessageCount
     * @summary Returns the count of messages sent by this connection.
     * @returns {Number}
     */

    return this.$get('msgCount');
});

//  ------------------------------------------------------------------------

TP.xmpp.Connection.Inst.defineMethod('getOutputStream',
function() {

    /**
     * @method getOutputStream
     * @summary Returns the receiver's output stream.
     * @returns {TP.xmpp.OutputStream} The output stream instance.
     */

    return this.get('outStream');
});

//  ------------------------------------------------------------------------

TP.xmpp.Connection.Inst.defineHandler('XMPPDataAvailable',
function(aSignal) {

    /**
     * @method handleXMPPDataAvailable
     * @summary Responds to notifications that data is available from the
     *     server. This implementation reads new data and signals the proper
     *     packet-level input signals.
     * @param {TP.sig.XMPPDataAvailable} aSignal The triggering signal.
     * @exception TP.sig.XMPPQueueingException
     */

    var stream,

        node,

        signame,
        origin,
        payload;

    stream = this.getInputStream();

    if (aSignal.getSignalOrigin() !== stream.getID()) {
        //  not our input stream...
        return;
    }

    //  Read data from the input stream and process it.
    try {
        //  Keep reading nodes from the stream. As long as we successfully
        //  get a TP.core.Node each time, process each one until we run out.
        while (TP.isValid(node = stream.read())) {
            //  If that node was an TP.xmpp.Node.
            if (TP.isKindOf(node, TP.xmpp.Node)) {
                if (node.isError()) {
                    if (TP.isKindOf(node, TP.xmpp.StreamError)) {
                        //  There was a stream error, so we bail out as per
                        //  the XMPP 1.0 specification. Other kinds of
                        //  errors aren't as fatal.
                        this.get('transport').stopReceiving();
                        this.get('transport').disconnect();

                        if (this.isOpen()) {
                            //  The server closed the connection - a stream
                            //  error is pretty fatal.
                            this.close(true);
                        }
                    }
                }

                //  ask the node what it wants to signal
                signame = node.getSignalName();

                //  queue the incoming packets in the form of signals

                //  If the node is a kind of TP.xmpp.Stanza, then we get use
                //  its message ID as the origin of the signal. If it does
                //  not have a message ID, then we use our ID, so that the
                //  signal looks like its coming right from the connection
                //  object.
                if (TP.isKindOf(node, TP.xmpp.Stanza)) {
                    if (TP.isEmpty(origin = node.getSignalOrigin())) {
                        origin = this.getID();
                    }
                } else {
                    //  Otherwise, we use our ID, so that the signal looks
                    //  like its coming right from the connection object.
                    origin = this.getID();
                }

                //  If the node was a stanza and the getSignalOrigin() call
                //  returned TP.NONE, then we don't queue a signal for this
                //  node - just continue.
                if (origin === TP.NONE) {
                    continue;
                }

                payload = TP.hc('node', node);

                //  If the node was a stanza and the getSignalOrigin() call
                //  returned anArray, then we queue a signal for each origin
                //  in this Array
                if (TP.isArray(origin)) {
                    /* eslint-disable no-loop-func */
                    origin.perform(
                        function(anOrigin) {

                            TP.queue(anOrigin,
                                        signame,
                                        null,
                                        payload,
                                        TP.INHERITANCE_FIRING);
                        });
                    /* eslint-enable no-loop-func */

                    //  Start back at the top of the loop
                    continue;
                }

                //  Queue the signal with the notification system for
                //  processing below (when we're done reading and processing
                //  all of the nodes).
                TP.queue(origin,
                            signame,
                            null,
                            payload,
                            TP.INHERITANCE_FIRING);
            }
        }

        //  trigger queue activation to process the valid signals
        TP.sys.fireNextSignal();
    } catch (e) {
        //  'undo' the read, so we can get to the data
        // stream.set('index', stream.get('index') - 1, false);

        this.raise('TP.sig.XMPPQueueingException', TP.ec(e));
    }

    return;
});

//  ------------------------------------------------------------------------

TP.xmpp.Connection.Inst.defineHandler('XMPPRosterInput',
function(aSignal) {

    /**
     * @method handleXMPPRosterInput
     * @summary Responds to notifications of roster input.
     * @param {TP.sig.XMPPRosterInput} aSignal The triggering signal.
     */

    var args,
        node,
        roster;

    if (TP.notValid(aSignal) || TP.notValid(args = aSignal.getPayload())) {
        TP.ifWarn() ?
            TP.warn('Invalid signal data for event.',
                    TP.IO_LOG) : 0;

        return;
    }

    if (TP.notValid(node = args.at('node'))) {
        TP.ifWarn() ?
            TP.warn('Missing stanza data for event.',
                    TP.IO_LOG) : 0;

        return;
    }

    if (TP.notValid(roster = node.getPayload(
                                'query', TP.xmpp.XMLNS.IQ_ROSTER).at(0))) {
        return;
    }

    //  if this signal is part of an iq/result then we asked for the roster
    //  and can update it completely
    if (node.get('tagType') === 'result') {
        this.get('jid').set('roster', roster);
    }

    //  if this is an iq/set it's being pushed from the server and we need
    //  to respond in a more granular fashion
    if (node.get('tagType') === 'set') {
        return;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.xmpp.Connection.Inst.defineHandler('XMPPTransportReady',
function(aSignal) {

    /**
     * @method handleXMPPTransportReady
     * @summary Responds to notifications of the transport being ready to send
     *     or receive data.
     * @param {TP.sig.XMPPTransportReady} aSignal The triggering signal.
     */

    //  Our default behavior is to turn around and signal
    //  TP.sig.XMPPConnectionReady.
    this.signal('TP.sig.XMPPConnectionReady');
});

//  ------------------------------------------------------------------------

TP.xmpp.Connection.Inst.defineHandler('XMPPTransportException',
function(aSignal) {

    /**
     * @method handleXMPPTransportException
     * @summary Responds to notifications of the transport having some sort of
     *     problem. This method closes the connection and signals an
     *     TP.sig.XMPPConnectionException.
     * @param {TP.sig.XMPPTransportException} aSignal The triggering signal.
     */

    //  The server closed the connection - a transport exception is pretty
    //  fatal.
    this.close(true);

    //  Our default behavior is to turn around and signal
    //  TP.sig.XMPPConnectionException.
    this.signal('TP.sig.XMPPConnectionException');
});

//  ------------------------------------------------------------------------

TP.xmpp.Connection.Inst.defineMethod('isAuthenticated',
function(aFlag) {

    /**
     * @method isAuthenticated
     * @summary Returns true if the receiver has authenticated successfully.
     * @param {Boolean} aFlag The new authenticatedness value, if any.
     * @returns {Boolean} The authenticatedness status, after optional set.
     */

    if (TP.isBoolean(aFlag)) {
        this.$set('authenticated', aFlag, false);
    }

    return this.$get('authenticated');
});

//  ------------------------------------------------------------------------

TP.xmpp.Connection.Inst.defineMethod('isBusy',
function() {

    /**
     * @method isBusy
     * @summary Whether or not the connection is 'busy' sending something.
     * @returns {Boolean} Whether or not the connection is busy.
     */

    //  We're busy if our transport is busy
    return this.get('transport').isBusy();
});

//  ------------------------------------------------------------------------

TP.xmpp.Connection.Inst.defineMethod('isOpen',
function(aFlag) {

    /**
     * @method isOpen
     * @summary Combined setter/getter for open status, returns true if the
     *     connection is open.
     * @param {Boolean} aFlag The new open/closed status if any.
     * @returns {Boolean} The connection open status, after optional set.
     */

    if (TP.isBoolean(aFlag)) {
        this.$set('$open', aFlag, false);
    }

    return TP.isTrue(this.$get('$open'));
});

//  ------------------------------------------------------------------------

TP.xmpp.Connection.Inst.defineMethod('obtainSASLMechanisms',
function(anElement) {

    /**
     * @method obtainSASLMechanisms
     * @summary Obtains the currently available SASL mechanisms from the
     *     supplied element.
     * @param {Element} anElement The element to use as a root to obtain the
     *     SASL mechanisms from.
     */

    var mechanismsElement,
        mechanismElements;

    //  See if SASL is available by checking to see if there is a
    //  'mechanisms' element in the XMPP packet. If so, and it has an
    //  'xmlns' attribute of TP.xmpp.XMLNS.SASL, it means that SASL is
    //  available.
    //  This element will contain the various SASL authentication mechanisms
    //  that we can use.
    if (TP.notEmpty(mechanismsElement = TP.nodeGetElementsByTagName(
                                                            anElement,
                                                            'mechanisms'))) {
        //  TP.nodeGetElementsByTagName() returns an Array. We want to use
        //  first element.
        mechanismsElement = mechanismsElement.first();

        //  If the mechanismsElement has the proper namespace, then gather
        //  the text value of all of the child 'mechanism' elements into the
        //  'SASLMechanisms' instance attribute.
        if (TP.nodeGetNSURI(mechanismsElement) === TP.xmpp.XMLNS.SASL) {
            mechanismElements = TP.nodeGetElementsByTagName(
                                                    mechanismsElement,
                                                    'mechanism');

            this.set('SASLMechanisms',
                        mechanismElements.collect(
                            function(anElem) {
                                return TP.nodeGetTextContent(anElem);
                            }));
        }
    } else {
        //  Otherwise, SASL is not available to us.
        this.set('SASLMechanisms', null);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.xmpp.Connection.Inst.defineMethod('obtainStreamFeatures',
function(anElement) {

    /**
     * @method obtainStreamFeatures
     * @summary Obtains the currently available stream features from the
     *     supplied element.
     * @param {Element} anElement The element to use as a root to obtain the
     *     stream features from.
     */

    var featuresChild;

    //  If there are valid values for 'wantsBinding' or 'wantsSession'
    //  (whether true or false), we've already done this and we can bail out
    //  here.
    if (TP.isValid(this.get('wantsBinding')) &&
        TP.isValid(this.get('wantsSession'))) {
        return;
    }

    //  Make sure that we got a 'features' element back. It will tell us
    //  whether the server wants to use resource binding and/or session
    //  creation.
    if (TP.elementGetLocalName(anElement) !== 'features' ||
        TP.nodeGetNSURI(anElement) !== TP.xmpp.XMLNS.STREAM) {
        this.raise('TP.sig.XMPFeatureNegotiationException',
                    'Server did not return supported features list');

        return;
    }

    //  See if the server supports 'resource binding'. If so, we'll flag it
    //  as such

    featuresChild = TP.nodeGetElementsByTagName(anElement, 'bind').first();

    if (TP.isValid(featuresChild)) {
        this.set('wantsBinding', true);
    } else {
        this.set('wantsBinding', false);
    }

    //  See if the server supports 'session creation'. If so, we'll flag it
    //  as such

    featuresChild =
            TP.nodeGetElementsByTagName(anElement, 'session').first();

    if (TP.isValid(featuresChild)) {
        this.set('wantsSession', true);
    } else {
        this.set('wantsSession', false);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.xmpp.Connection.Inst.defineMethod('open',
function() {

    /**
     * @method open
     * @summary Opens the receiver using its current server parameters.
     * @exception TP.sig.InvalidOperation
     * @returns {Boolean} True if the connection opens successfully.
     */

    var didConnect,
        tpElem;

    if (this.isOpen()) {
        this.raise('TP.sig.InvalidOperation');

        return true;
    }

    this.observe(null, 'TP.sig.XMPPDataAvailable');
    this.observe(null, TP.sig.XMPPRosterInput.getSignalName());

    didConnect = this.get('transport').connect();

    if (TP.isValid(tpElem = this.getInputStream().read())) {
        //  Now we can determine whether SASL authentication is available or
        //  not. XMPP 1.0 defines SASL as the standard authentication
        //  mechanism and it supersedes the older Jabber authentication
        //  mechanism.
        this.obtainSASLMechanisms(tpElem.getNativeNode());
    }

    this.isOpen(didConnect);

    return didConnect;
});

//  ------------------------------------------------------------------------

TP.xmpp.Connection.Inst.defineMethod('send',
function(aStanza) {

    /**
     * @method send
     * @summary Sends the stanza provided.
     * @param {TP.xmpp.Stanza} aStanza The stanza to send.
     * @exception TP.sig.XMPPConnectionNotReady
     * @exception TP.sig.InvalidXMPPMessage
     * @returns {String} The message ID used for the send.
     */

    var msgID;

    if (!this.isOpen() || !this.isAuthenticated()) {
        return this.raise('TP.sig.XMPPConnectionNotReady');
    }

    if (!TP.isKindOf(aStanza, TP.xmpp.Stanza)) {
        return this.raise('TP.sig.InvalidXMPPMessage');
    }

    //  set the message ID on the stanza so we can correlate it later. note
    //  that we don't alter an existing one so that responses can maintain
    //  connectivity with their originating stanzas from other clients
    if (TP.notValid(msgID = aStanza.get('msgID')) || TP.isEmpty(msgID)) {
        msgID = this.get('transport').$getNextMessageID();

        this.set('msgID', msgID);
        aStanza.set('msgID', msgID);
    }

    //  if we expect a response, observe msgID as origin to correlate
    if (aStanza.expectsResponse()) {
        aStanza.observe(aStanza.get('msgID'), 'TP.sig.XMPPInput');
    }

    //  Send the XML packet by writing to the output stream. This will call
    //  back to our 'sendRaw' method.
    this.getOutputStream().write(aStanza);

    //  return the ID we used so the receiver can correlate it. This will be
    //  used as the origin of a signal that will be thrown. The signal name
    //  is determined by the type of the receiving packet.
    return aStanza.get('msgID');
});

//  ------------------------------------------------------------------------

TP.xmpp.Connection.Inst.defineMethod('sendRaw',
function(aStr) {

    /**
     * @method sendRaw
     * @summary Sends the raw data provided.
     * @param {String} aStr The raw data to be sent over the connection.
     * @exception TP.sig.XMPPConnectionNotReady
     */

    if (!this.isOpen() || !this.isAuthenticated()) {
        return this.raise('TP.sig.XMPPConnectionNotReady');
    }

    return this.get('transport').transmit(aStr);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
