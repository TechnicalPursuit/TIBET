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
 * @type {TP.xmpp.Stanza}
 * @summary The XMPP protocol consists of 3 main 'packet' types: message, iq,
 *     and presence. This type provides a common root for this subtree, while
 *     the TP.xmpp.Payload type provides a root for the various namespace
 *     fragments which provide optional content for the packet types.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Packet.defineSubtype('Stanza');

//  can't construct concrete instances of this
TP.xmpp.Stanza.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  array of message types (get, set, result, error, normal, chat, etc) that
//  are specific to this stanza type
TP.xmpp.Stanza.Type.defineAttribute('stanzaTypes');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xmpp.Stanza.Type.defineMethod('register',
function() {

    /**
     * @method register
     * @summary Registers the type's information, particularly the tag name,
     *     template, and namespace information which drives the lookup processes
     *     for getConcreteType().
     * @returns {TP.meta.xmpp.Stanza} The receiver.
     */

    var i,
        arr;

    this.callNextMethod();

    if (TP.isArray(arr = this.get('stanzaTypes'))) {
        //  register our stanza types
        for (i = 0; i < arr.getSize(); i++) {
            TP.xmpp.XMLNS.defineStanzaType(arr.at(i), this);
        }
    }

    return this;
}, {
    trackInvocations: false
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

//  flag defining whether the stanza expects responses
TP.xmpp.Stanza.Inst.defineAttribute('$expectsResponse', false);

//  for stanzas which expect responses, this holds the last one
TP.xmpp.Stanza.Inst.defineAttribute('lastResponse');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.Stanza.Inst.defineMethod('init',
function(aNode, aType, toJID) {

    /**
     * @method init
     * @summary Initializes a new instance.
     * @param {A} aNode native node, or null to use the type's default template.
     * @param {String} aType The stanza type (get, set, etc) for the new
     *     instance.
     * @param {TP.xmpp.JID|String} toJID The JID or JID string to target.
     * @returns {TP.xmpp.Stanza|undefined} A new instance.
     */

    this.callNextMethod(aNode);

    //  the top-level call may not be able to clone the node type properly,
    //  in which case we're not really initialized
    if (TP.notValid(this.getNativeNode())) {
        return;
    }

    if (TP.isString(aType)) {
        this.set('stanzaType', aType);
    } else {
        this.set('stanzaType', this.get('defaultType'));
    }

    if (TP.isValid(toJID)) {
        this.set('to', toJID.asString());
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.Stanza.Inst.defineMethod('addPayload',
function(aNode) {

    /**
     * @method addPayload
     * @summary Adds a payload node to the receiver. There can be multiple
     *     payload elements, however a single payload is more typical.
     * @param {A} TP.xmpp.Payload payload node.
     * @exception TP.sig.InvalidXMPPPayload
     * @returns {TP.xmpp.Stanza} The receiver.
     */

    if (!TP.isKindOf(aNode, TP.xmpp.Payload)) {
        return this.raise('TP.sig.InvalidXMPPPayload', aNode);
    }

    //  the payload gets added at the primitive level
    TP.nodeAppendChild(this.getNativeNode(),
                        TP.nodeCloneNode(aNode.getNativeNode(), true));

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.Stanza.Inst.defineMethod('constructResponse',
function() {

    /**
     * @method constructResponse
     * @summary Creates an appropriate response object based on the current
     *     packet.
     * @exception SubtypeResponsibility
     * @returns {TP.xmpp.Stanza}
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xmpp.Stanza.Inst.defineMethod('expectsResponse',
function(aFlag) {

    /**
     * @method expectsResponse
     * @summary A combined setter/getter for the 'response expected' flag. This
     *     flag defines whether the receiver will attempt to observe its message
     *     ID for result signals.
     * @param {Boolean} aFlag The new value for the flag, if used as a setter.
     * @returns {Boolean} The current flag value, after optional set.
     */

    if (TP.isBoolean(aFlag)) {
        this.$set('$expectsResponse', aFlag, false);
    }

    return this.$get('$expectsResponse');
});

//  ------------------------------------------------------------------------

TP.xmpp.Stanza.Inst.defineMethod('getDefaultType',
function() {

    /**
     * @method getDefaultType
     * @summary Returns the default stanza type for the receiver.
     * @returns {String}
     */

    return '';
});

//  ------------------------------------------------------------------------

TP.xmpp.Stanza.Inst.defineMethod('getFrom',
function() {

    /**
     * @method getFrom
     * @summary Returns the 'from' address for the packet. This is a string
     *     representing a JID.
     * @returns {String}
     */

    return this.getAttribute('from');
});

//  ------------------------------------------------------------------------

TP.xmpp.Stanza.Inst.defineMethod('getMsgID',
function() {

    /**
     * @method getMsgID
     * @summary Returns the message ID for the receiver. Each packet is
     *     assigned a unique ID which can be used to correlate request/response
     *     pairs and other results.
     * @returns {String}
     */

    //  note we return what the internal node thinks, it's authoritative
    return this.getAttribute('id');
});

//  ------------------------------------------------------------------------

TP.xmpp.Stanza.Inst.defineMethod('getPayload',
function(aTagName, aNamespace) {

    /**
     * @method getPayload
     * @summary Returns an array containing any packets matching the tagname
     *     and namespace provided. The returned packets are valid XMPP node
     *     types. Both parameters are optional, allowing for easy filtering of
     *     payload results.
     * @param {String} aTagName The payload tagname to match. For example,
     *     'query'.
     * @param {String} aNamespace The namespace any tags should be qualified by,
     *     such as IQ_ROSTER.
     * @returns {Element[]}
     */

    var natNode,
        arr,
        errorElem;

    //  get the native element
    natNode = this.getNativeNode();

    if (TP.isString(aTagName)) {
        //  Note here that we use the native call because 'natNode' is a
        //  native node.
        arr = TP.nodeGetElementsByTagName(natNode, aTagName, aNamespace);
    } else {
        arr = TP.nodeGetChildElements(natNode);

        //  we've got the array, now to filter by NS if needed
        if (TP.isString(aNamespace)) {
            arr = arr.select(
                function(item) {

                    return TP.nodeGetNSURI(item) === aNamespace;
                });
        }
    }

    //  If we didn't successfully retrieve any elements with the tag name
    //  and namespace, then return null here.
    if (TP.isEmpty(arr)) {
        return null;
    }

    //  If we have an error element somewhere in our payload, then we wrap
    //  that up in an TP.xmpp.StanzaError type and hand it back as the only
    //  element in the Array.
    if (TP.elementGetLocalName(arr.first()) === 'error') {
        errorElem = TP.xmpp.StanzaError.construct(arr.first());
        return TP.ac(errorElem);
    }

    //  convert items to proper wrapped instances
    arr = arr.collect(
            function(item) {

                return TP.xmpp.Node.fromNode(item);
            });

    return arr;
});

//  ------------------------------------------------------------------------

TP.xmpp.Stanza.Inst.defineMethod('getSignalOrigin',
function(aStanza) {

    /**
     * @method getSignalOrigin
     * @summary Returns the signal origin to use when signaling arrival of
     *     packets of this type. The default is the 'msgID' or this stanza's
     *     'ID' if the msgID doesn't exist.
     * @description Since this TP.xmpp.Node type *is* a stanza, 'aStanza' will
     *     be null. This method should 'pass along' the receiver to any nested
     *     getSignalOrigin() calls as the stanza. This method should return
     *     TP.NONE if it does not want the XMPP connection to send a signal on
     *     the receiver's behalf.
     * @param {TP.xmpp.Stanza} aStanza The stanza that 'owns' this element.
     * @returns {Object|String|Object[]} The origin(s) to use when signaling.
     */

    return TP.ifEmpty(this.get('msgID'), this.getID());
});

//  ------------------------------------------------------------------------

TP.xmpp.Stanza.Inst.defineMethod('getResponse',
function() {

    /**
     * @method getResponse
     * @summary Returns the last response to the current packet, if any.
     * @returns {TP.xmpp.Node} A response node.
     */

    return this.$get('lastResponse');
});

//  ------------------------------------------------------------------------

TP.xmpp.Stanza.Inst.defineMethod('getTagType',
function() {

    /**
     * @method getTagType
     * @summary Returns the value of the receiver's 'type' attribute, if any.
     *     If the type had no value it is set to the default type as a result of
     *     this call and the default type is returned.
     * @returns {String}
     */

    var tagType;

    tagType = this.callNextMethod();
    if (TP.notValid(tagType)) {
        this.set('tagType', this.get('defaultType'));
    }

    return this.getAttribute('type');
});

//  ------------------------------------------------------------------------

TP.xmpp.Stanza.Inst.defineMethod('getTo',
function() {

    /**
     * @method getTo
     * @summary Returns the receiver's 'to' address. This is the target JID.
     * @returns {String}
     */

    return this.getAttribute('to');
});

//  ------------------------------------------------------------------------

TP.xmpp.Stanza.Inst.defineHandler('XMPPInput',
function(aSignal) {

    /**
     * @method handleXMPPInput
     * @summary Responds to notification of TP.sig.XMPPInput, typically due to
     *     an observation of the receiver's message ID. In this handler the
     *     response node is saved as the receiver's last response.
     * @returns {TP.xmpp.Stanze} The receiver.
     */

    var args,
        node;

    if (TP.notValid(aSignal) || TP.notValid(args = aSignal.getPayload())) {
        TP.ifWarn() ?
            TP.warn('Invalid signal data for event.',
                    TP.IO_LOG) : 0;

        return this;
    }

    if (TP.notValid(node = args.at('node'))) {
        TP.ifWarn() ?
            TP.warn('Missing stanza data for event.',
                    TP.IO_LOG) : 0;

        return this;
    }

    //  got our response, clean up registration so we don't leak
    this.ignore(aSignal.getOrigin(), 'TP.sig.XMPPInput');

    //  save the response
    this.set('lastResponse', node);

    return this;
});
//  ------------------------------------------------------------------------

TP.xmpp.Stanza.Inst.defineMethod('send',
function(aConnection) {

    /**
     * @method send
     * @summary Sends the receiver using its connection, or the connection
     *     provided.
     * @param {TP.xmpp.Connection} aConnection The connection instance to send
     *     with. Defaults to the receiver's connection.
     * @exception TP.sig.InvalidXMPPConnection
     * @returns {String} The message ID used for the send.
     */

    var conn;

    if (TP.isValid(aConnection)) {
        return aConnection.send(this);
    }

    if (TP.notValid(conn = this.get('connection'))) {
        return this.raise('TP.sig.InvalidXMPPConnection');
    }

    return conn.send(this);
});

//  ------------------------------------------------------------------------

TP.xmpp.Stanza.Inst.defineMethod('setFrom',
function(aJIDString) {

    /**
     * @method setFrom
     * @summary Sets the originating address for the packet. Note that the
     *     jabber server typically ignores these and rewrites them with the JID
     *     of the connection. You can stil use this to assist with documentation
     *     within the TIBET send logs however.
     * @param {A} aJIDString string representing the sending JID.
     * @returns {TP.xmpp.Stanza} The receiver.
     */

    this.setAttribute('from', aJIDString);

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.Stanza.Inst.defineMethod('setStanzaType',
function(aStanzaType) {

    /**
     * @method setStanzaType
     * @summary Sets the receiver's stanza type attribute. The type must be
     *     mapped in the type's stanzaTypes array to be valid.
     * @param {String} aStanzaType The stanza type string to set.
     * @exception TP.sig.InvalidXMPPStanzaType
     * @returns {TP.xmpp.Stanza} The receiver.
     */

    var stanzaType,
        arr;

    stanzaType = aStanzaType;
    if (TP.notValid(stanzaType)) {
        stanzaType = this.get('defaultType');
    }

    arr = this.getType().get('stanzaTypes');
    if (TP.notValid(arr) || !arr.containsString(stanzaType)) {
        return this.raise('TP.sig.InvalidXMPPStanzaType',
                            stanzaType);
    }

    TP.elementSetAttribute(this.getNativeNode(), 'type', stanzaType);

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.Stanza.Inst.defineMethod('setMsgID',
function(aValue) {

    /**
     * @method setMsgID
     * @summary Defines the unique message ID for the receiver. You don't
     *     normally call this publicly.
     * @param {String} aValue The message ID.
     * @returns {TP.xmpp.Stanza} The receiver.
     */

    this.setAttribute('id', aValue);

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.Stanza.Inst.defineMethod('setTo',
function(aJIDString) {

    /**
     * @method setTo
     * @summary Sets the receiver's 'to' address. This is the target JID for
     *     the packet.
     * @param {String} aJIDString The JId being targeted.
     * @returns {TP.xmpp.Stanza} The receiver.
     */

    this.setAttribute('to', aJIDString);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
