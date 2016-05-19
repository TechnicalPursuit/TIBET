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
 * @type {TP.xmpp.PubsubCreate}
 * @summary A wrapper for the PubSub create node type.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Pubsub.defineSubtype('PubsubCreate');

TP.xmpp.PubsubCreate.set('template',
        TP.join('<pubsub xmlns="', TP.xmpp.XMLNS.PUBSUB, '">',
        '<create node=""/>', '<configure/>', '</pubsub>'));

//  For subtypes of TP.xmpp.Pubsub, we register ourself using an XPath
TP.xmpp.Pubsub.registerPubsubType(TP.xmpp.XMLNS.PUBSUB, './$def:create',
        TP.xmpp.PubsubCreate);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.PubsubCreate.Inst.defineMethod('setConfigure',
function(aNode) {

    /**
     * @method setConfigure
     * @summary Sets the configuration to the supplied TP.xmpp.XData node.
     * @param {TP.xmpp.XData} aNode The configuration node.
     * @returns {TP.xmpp.PubsubCreate} The receiver.
     */

    var elem;

    if (!TP.isKindOf(aNode, TP.xmpp.XData)) {
        return this.raise('TP.sig.InvalidXMPPXData', aNode);
    }

    elem = this.getNamedDescendant('configure', true);

    //  the data field gets added at the primitive level
    TP.nodeAppendChild(elem,
                        TP.nodeCloneNode(aNode.getNativeNode(), true));

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.PubsubCreate.Inst.defineMethod('setNodeID',
function(anID) {

    /**
     * @method setNodeID
     * @summary Sets the node ID that the receiver is creating.
     * @param {String} anID The node ID that is being created.
     * @returns {TP.xmpp.PubsubCreate} The receiver.
     */

    var elem;

    elem = this.getNamedDescendant('create', true);
    TP.elementSetAttribute(elem, 'node', anID);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
