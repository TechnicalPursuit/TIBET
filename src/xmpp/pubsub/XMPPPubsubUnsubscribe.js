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
 * @type {TP.xmpp.PubsubUnsubscribe}
 * @synopsis A wrapper for the PubSub unsubscribe node type.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Pubsub.defineSubtype('PubsubUnsubscribe');

TP.xmpp.PubsubUnsubscribe.set('template',
        TP.join('<pubsub xmlns="', TP.xmpp.XMLNS.PUBSUB, '">',
        '<unsubscribe node=""/>', '</pubsub>'));

//  For subtypes of TP.xmpp.Pubsub, we register ourself using an XPath
TP.xmpp.Pubsub.registerPubsubType(TP.xmpp.XMLNS.PUBSUB,
        './$def:unsubscribe', TP.xmpp.PubsubUnsubscribe);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.PubsubUnsubscribe.Inst.defineMethod('setNodeID',
function(anID) {

    /**
     * @name setNodeID
     * @synopsis Sets the node ID that the receiver is subscribing to.
     * @param {String} anID The node ID that is being subscribed to.
     * @returns {TP.xmpp.PubsubUnsubscribe} The receiver.
     */

    var elem;

    elem = this.getNamedDescendant('unsubscribe', true);
    TP.elementSetAttribute(elem, 'node', anID);

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.PubsubUnsubscribe.Inst.defineMethod('setSubscriberJID',
function(aJID) {

    /**
     * @name setSubscriberJID
     * @synopsis Sets the subscriber JID that is retracting the subscription.
     * @param {TP.xmpp.JID} aJID The subscriber JID that is retracting the
     *     subscription.
     * @returns {TP.xmpp.PubsubUnsubscribe} The receiver.
     */

    var elem;

    elem = this.getNamedDescendant('unsubscribe', true);
    TP.elementSetAttribute(elem, 'jid', aJID.get('bareJID'));

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
