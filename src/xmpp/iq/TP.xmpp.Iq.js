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
 * @type {TP.xmpp.Iq}
 * @summary An Iq element wrapper. This node type provides convenience methods
 *     for working with XMPP Iq elements and their common children.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Stanza.defineSubtype('Iq');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.xmpp.Iq.Type.defineAttribute('stanzaTypes',
    TP.ac('get', 'set', 'result', 'error'));

TP.xmpp.Iq.Type.defineAttribute('tagname', 'iq');
TP.xmpp.Iq.Type.defineAttribute('template', '<iq></iq>');

TP.xmpp.Iq.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.Iq.Inst.defineMethod('addQuery',
function(aNamespace) {

    /**
     * @method addQuery
     * @summary Adds a query node child with the namespace provided. This is a
     *     convenient way to add a content node for some of the more common
     *     packet types. For example, myNode.addQuery(IQ_LAST).
     * @param {String} aNamespace The namespace, usually a namespace constant
     *     like IQ_ROSTER etc.
     * @returns {TP.xmpp.Iq} The receiver.
     */

    var query;

    query = TP.xmpp.Query.construct(null, aNamespace);
    this.addPayload(query);

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.Iq.Inst.defineMethod('constructResponse',
function() {

    /**
     * @method constructResponse
     * @summary Creates an appropriate response object based on the current
     *     packet. For IQ packets the namespace of the current packet is
     *     leveraged to construct a new instance with proper type.
     * @returns {TP.xmpp.Stanza|undefined}
     */

    var inst,
        query;

    //  we only build for 'get' or 'set' stanzas
    if (this.get('tagType') === 'get' || this.get('tagType') === 'set') {
        inst = this.getType().construct(null, 'result', this.get('from'));
    } else {
        return;
    }

    //  add a query tag for any query-embedded namespace we carry
    if (TP.isValid(query = this.getPayload('query')) &&
        query.getSize() > 0) {
        inst.addQuery(this.getNamespaceURI());
    }

    return inst;
});

//  ------------------------------------------------------------------------

TP.xmpp.Iq.Inst.defineMethod('getDefaultType',
function() {

    /**
     * @method getDefaultType
     * @summary Returns the default stanza type for the receiver.
     * @returns {String}
     */

    return 'get';
});

//  ------------------------------------------------------------------------

TP.xmpp.Iq.Inst.defineMethod('getSignalName',
function(aStanza) {

    /**
     * @method getSignalName
     * @summary Returns the signal name to use when signaling arrival of
     *     packets of this type. The default is XMPP*Input where the asterisk is
     *     replaced by the current tag/type string, for example
     *     TP.sig.XMPPMessageInput.
     * @description Since this TP.xmpp.Node type *is* a stanza, 'aStanza' will
     *     be null. This method should 'pass along' the receiver to any nested
     *     getSignalName() calls as the stanza.
     * @param {TP.xmpp.Stanza} aStanza The stanza that 'owns' this element.
     * @returns {String}
     */

    var payload;

    payload = this.get('payload');

    //  if we have only one packet, let it determine the signal name
    if (TP.isValid(payload) && payload.getSize() === 1) {
        //  Note how we pass ourself along as the 'stanza'.
        return payload.at(0).getSignalName(this);
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
