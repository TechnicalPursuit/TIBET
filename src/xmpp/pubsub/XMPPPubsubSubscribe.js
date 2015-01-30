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
 * @type {TP.xmpp.PubsubSubscribe}
 * @summary A wrapper for the PubSub subscribe node type.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Pubsub.defineSubtype('PubsubSubscribe');

TP.xmpp.PubsubSubscribe.set('template',
        TP.join('<pubsub xmlns="', TP.xmpp.XMLNS.PUBSUB, '">',
        '<subscribe node=""/>', '</pubsub>'));

//  For subtypes of TP.xmpp.Pubsub, we register ourself using an XPath
TP.xmpp.Pubsub.registerPubsubType(TP.xmpp.XMLNS.PUBSUB,
        './$def:subscribe', TP.xmpp.PubsubSubscribe);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.PubsubSubscribe.Inst.defineMethod('setNodeID',
function(anID) {

    /**
     * @method setNodeID
     * @summary Sets the node ID that the receiver is subscribing to.
     * @param {String} anID The node ID that is being subscribed to.
     * @returns {TP.xmpp.PubsubSubscribe} The receiver.
     */

    var elem;

    elem = this.getNamedDescendant('subscribe', true);
    TP.elementSetAttribute(elem, 'node', anID);

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.PubsubSubscribe.Inst.defineMethod('setSubscriberJID',
function(aJID) {

    /**
     * @method setSubscriberJID
     * @summary Sets the subscriber JID that is making the subscription.
     * @param {TP.xmpp.JID} aJID The subscriber JID that is making the
     *     subscription.
     * @returns {TP.xmpp.PubsubSubscribe} The receiver.
     */

    var elem;

    elem = this.getNamedDescendant('subscribe', true);
    TP.elementSetAttribute(elem, 'jid', aJID.get('bareJID'));

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
