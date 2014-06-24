//  ========================================================================
/*
NAME:   TP.xmpp.Iq.js
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
 * @type {TP.xmpp.Iq}
 * @synopsis An Iq element wrapper. This node type provides convenience methods
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
     * @name addQuery
     * @synopsis Adds a query node child with the namespace provided. This is a
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
     * @name constructResponse
     * @synopsis Creates an appropriate response object based on the current
     *     packet. For IQ packets the namespace of the current packet is
     *     leveraged to construct a new instance with proper type.
     * @returns {TP.xmpp.Stanza} 
     */

    var inst,
        query;

    //  we only build for 'get' or 'set' stanzas
    if ((this.get('tagType') === 'get') || (this.get('tagType') === 'set')) {
        inst = this.getType().construct(null, 'result', this.get('from'));
    } else {
        return;
    }

    //  add a query tag for any query-embedded namespace we carry
    if (TP.isValid(query = this.getPayload('query')) &&
        (query.getSize() > 0)) {
        inst.addQuery(this.getNamespaceURI());
    }

    return inst;
});

//  ------------------------------------------------------------------------

TP.xmpp.Iq.Inst.defineMethod('getDefaultType',
function() {

    /**
     * @name getDefaultType
     * @synopsis Returns the default stanza type for the receiver.
     * @returns {String} 
     * @todo
     */

    return 'get';
});

//  ------------------------------------------------------------------------

TP.xmpp.Iq.Inst.defineMethod('getSignalName',
function(aStanza) {

    /**
     * @name getSignalName
     * @synopsis Returns the signal name to use when signaling arrival of
     *     packets of this type. The default is XMPP*Input where the asterisk is
     *     replaced by the current tag/type string, for example
     *     TP.sig.XMPPMessageInput.
     * @description Since this TP.xmpp.Node type *is* a stanza, 'aStanza' will
     *     be null. This method should 'pass along' the receiver to any nested
     *     getSignalName() calls as the stanza.
     * @param {TP.xmpp.Stanza} aStanza The stanza that 'owns' this element.
     * @returns {String} 
     * @todo
     */

    var payload;

    payload = this.get('payload');

    //  if we have only one packet, let it determine the signal name
    if (TP.isValid(payload) && (payload.getSize() === 1)) {
        //  Note how we pass ourself along as the 'stanza'.
        return payload.at(0).getSignalName(this);
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
