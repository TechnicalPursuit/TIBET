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
 * @type {TP.xmpp.PubsubEvent}
 * @summary A wrapper for the PubSub event node type.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Pubsub.defineSubtype('PubsubEvent');

//  Make sure to set the 'namespace', since its cleared by our
//  TP.xmpp.Payload supertype.
TP.xmpp.PubsubEvent.set('namespace', TP.xmpp.XMLNS.PUBSUB_EVENT);

TP.xmpp.PubsubEvent.set('tagname', 'event');

TP.xmpp.PubsubEvent.set('childTags', TP.ac('collection', 'configuration',
        'delete', 'items', 'purge', 'subscription'));

TP.xmpp.PubsubEvent.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.PubsubEvent.Inst.defineMethod('getSignalName',
function(aStanza) {

    /**
     * @method getSignalName
     * @summary Returns the signal name to use when signaling arrival of
     *     packets of this type.
     * @param {TP.xmpp.Stanza} aStanza The stanza that 'owns' this element.
     * @returns {String}
     */

    return 'TP.sig.XMPPPubsubEventInput';
});

//  ------------------------------------------------------------------------

TP.xmpp.PubsubEvent.Inst.defineMethod('getSignalOrigin',
function(aStanza) {

    /**
     * @method getSignalOrigin
     * @summary Returns the signal origin to use when signaling arrival of
     *     packets of this type. Presence stanzas signal presence change signal
     *     from the corresponding JID. This method should return TP.NONE if it
     *     does not want the XMPP connection to send a signal on the receiver's
     *     behalf.
     * @param {TP.xmpp.Stanza} aStanza The stanza that 'owns' this element.
     * @returns {Object|String|Object[]} The origin(s) to use when signaling.
     */

    var itemsTPElem,

        pubsubJIDStr,
        nodeID,

        uriStr;

    if (TP.isEmpty(itemsTPElem = this.getElementsByTagName('items'))) {
        //  We can return TP.NONE telling the XMPP connection to not signal
        return TP.NONE;
    }

    //  Our enclosing stanza should be a '<message>' element - grab its
    //  'from' attribute - that will be the pubsub service that sent us this
    //  event.
    pubsubJIDStr = aStanza.getAttribute('from');

    nodeID = itemsTPElem.first().getAttribute('node');
    nodeID = nodeID.strip(/^\//);

    uriStr = TP.join('xmpp:', pubsubJIDStr, '?;node=', nodeID);

    return TP.uc(uriStr);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
