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
 * @type {TP.xmpp.PubsubRetract}
 * @summary A wrapper for the PubSub retract node type.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Pubsub.defineSubtype('PubsubRetract');

TP.xmpp.PubsubRetract.set('template',
        TP.join('<pubsub xmlns="', TP.xmpp.XMLNS.PUBSUB, '">',
        '<retract node=""/>',
        '</pubsub>'));

TP.xmpp.PubsubRetract.set('childTags', TP.ac('item'));

//  For subtypes of TP.xmpp.Pubsub, we register ourself using an XPath
TP.xmpp.Pubsub.registerPubsubType(TP.xmpp.XMLNS.PUBSUB,
        './$def:retract', TP.xmpp.PubsubRetract);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.PubsubRetract.Inst.defineMethod('addItem',
function(itemID) {

    /**
     * @method addItem
     * @summary Adds an item to the receiver's item payload.
     * @param {String} itemID The item ID that is being retracted. This is not
     *     optional.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.xmpp.PubsubRetract} The receiver.
     */

    var newItem,
        elem;

    if (TP.isEmpty(itemID)) {
        this.raise('TP.sig.InvalidParameter');
    }

    newItem = TP.node('<item xmlns="' + TP.xmpp.XMLNS.PUBSUB + '"/>');
    TP.elementSetAttribute(newItem, 'id', itemID);

    elem = this.getNamedDescendant('retract', true);

    TP.nodeAppendChild(elem, newItem);

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.PubsubRetract.Inst.defineMethod('setNodeID',
function(anID) {

    /**
     * @method setNodeID
     * @summary Sets the node ID that the receiver is retracting.
     * @param {String} anID The node ID that is being retracted.
     * @returns {TP.xmpp.PubsubRetract} The receiver.
     */

    var elem;

    elem = this.getNamedDescendant('retract', true);
    TP.elementSetAttribute(elem, 'node', anID);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
