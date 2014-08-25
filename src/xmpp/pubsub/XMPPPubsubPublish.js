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
 * @type {TP.xmpp.PubsubPublish}
 * @synopsis A wrapper for the PubSub publish node type.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Pubsub.defineSubtype('PubsubPublish');

TP.xmpp.PubsubPublish.set('template',
        TP.join('<pubsub xmlns="', TP.xmpp.XMLNS.PUBSUB, '">',
        '<publish node=""/>',
        '</pubsub>'));

TP.xmpp.PubsubPublish.set('childTags', TP.ac('item'));

//  For subtypes of TP.xmpp.Pubsub, we register ourself using an XPath
TP.xmpp.Pubsub.registerPubsubType(TP.xmpp.XMLNS.PUBSUB,
        './$def:publish', TP.xmpp.PubsubPublish);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.PubsubPublish.Inst.defineMethod('addItem',
function(anItemXML, itemID) {

    /**
     * @name addItem
     * @synopsis Adds an item to the receiver's item payload.
     * @param {Node} anItemXML An XML node containing the content of the new
     *     item.
     * @param {String} itemID The item ID that is being published. This may be
     *     optional in which case the XMPP server must assign one.
     * @returns {TP.xmpp.PubsubPublish} The receiver.
     * @todo
     */

    var newItem,
        elem;

    newItem = TP.node('<item xmlns="' + TP.xmpp.XMLNS.PUBSUB + '"/>');
    if (TP.notEmpty(itemID)) {
        TP.elementSetAttribute(newItem, 'id', itemID);
    }

    TP.nodeAppendChild(newItem, TP.nodeCloneNode(anItemXML, true));

    elem = this.getNamedDescendant('publish', true);

    TP.nodeAppendChild(elem, newItem);

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.PubsubPublish.Inst.defineMethod('setConfigure',
function(aNode) {

    /**
     * @name setConfigure
     * @synopsis Sets the configuration to the supplied TP.xmpp.XData node.
     * @param {TP.xmpp.XData} aNode The configuration node.
     * @returns {TP.xmpp.PubsubCreate} The receiver.
     */

    var elem;

    if (!TP.isKindOf(aNode, TP.xmpp.XData)) {
        return this.raise('TP.sig.InvalidXMPPXData', arguments, aNode);
    }

    elem = this.getNamedDescendant('configure', true);

    //  the data field gets added at the primitive level
    TP.nodeAppendChild(elem,
                        TP.nodeCloneNode(aNode.getNativeNode(), true));

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.PubsubPublish.Inst.defineMethod('setNodeID',
function(anID) {

    /**
     * @name setNodeID
     * @synopsis Sets the node ID that the receiver is publishing.
     * @param {String} anID The node ID that is being published.
     * @returns {TP.xmpp.PubsubPublish} The receiver.
     */

    var elem;

    elem = this.getNamedDescendant('publish', true);
    TP.elementSetAttribute(elem, 'node', anID);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
