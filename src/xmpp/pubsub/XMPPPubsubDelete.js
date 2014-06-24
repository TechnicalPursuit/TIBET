//  ========================================================================
/*
NAME:   TP.xmpp.PubsubDelete.js
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
