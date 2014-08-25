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
 * @type {TP.xmpp.PubsubDelete}
 * @synopsis A wrapper for the PubSub delete node type.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Pubsub.defineSubtype('PubsubDelete');

TP.xmpp.PubsubDelete.set('template',
        TP.join('<pubsub xmlns="', TP.xmpp.XMLNS.PUBSUB_OWNER, '">',
        '<delete node=""/>', '</pubsub>'));

//  For subtypes of TP.xmpp.Pubsub, we register ourself using an XPath
TP.xmpp.Pubsub.registerPubsubType(TP.xmpp.XMLNS.PUBSUB_OWNER,
        './$def:delete', TP.xmpp.PubsubDelete);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.PubsubDelete.Inst.defineMethod('setNodeID',
function(anID) {

    /**
     * @name setNodeID
     * @synopsis Sets the node ID that the receiver is deleting.
     * @param {String} anID The node ID that is being deleted.
     * @returns {TP.xmpp.PubsubDelete} The receiver.
     */

    var elem;

    elem = this.getNamedDescendant('delete', true);
    TP.elementSetAttribute(elem, 'node', anID);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
