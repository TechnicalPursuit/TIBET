//  ========================================================================
/*
NAME:   TP.xmpp.PubsubPublish.js
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
