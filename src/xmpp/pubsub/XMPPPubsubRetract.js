//  ========================================================================
/*
NAME:   TP.xmpp.PubsubRetract.js
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
 * @type {TP.xmpp.PubsubRetract}
 * @synopsis A wrapper for the PubSub retract node type.
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
     * @name addItem
     * @synopsis Adds an item to the receiver's item payload.
     * @param {String} itemID The item ID that is being retracted. This is not
     *     optional.
     * @raises TP.sig.InvalidParameter
     * @returns {TP.xmpp.PubsubRetract} The receiver.
     * @todo
     */

    var newItem,
        elem;

    if (TP.isEmpty(itemID)) {
        this.raise('TP.sig.InvalidParameter', arguments);
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
     * @name setNodeID
     * @synopsis Sets the node ID that the receiver is retracting.
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
