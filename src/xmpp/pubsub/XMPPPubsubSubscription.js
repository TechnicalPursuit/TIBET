//  ========================================================================
/*
NAME:   TP.xmpp.PubsubSubscription.js
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
 * @type {TP.xmpp.PubsubSubscription}
 * @synopsis A wrapper for the PubSub subscription node type.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Pubsub.defineSubtype('PubsubSubscription');

TP.xmpp.PubsubSubscription.set('tagname', 'subscription');

//  For subtypes of TP.xmpp.Pubsub, we register ourself using an XPath
TP.xmpp.Pubsub.registerPubsubType(TP.xmpp.XMLNS.PUBSUB,
        './$def:subscription', TP.xmpp.PubsubSubscription);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.PubsubSubscription.Inst.defineMethod('getJID',
function() {

    /**
     * @name getJID
     * @synopsis Returns the string value of the receiver's jid attribute.
     * @returns {String} 
     */

    return this.getAttribute('jid');
});

//  ------------------------------------------------------------------------

TP.xmpp.PubsubSubscription.Inst.defineMethod('getNode',
function() {

    /**
     * @name getNode
     * @synopsis Returns the string value of the receiver's node attribute.
     * @returns {String} 
     */

    return this.getAttribute('node');
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
