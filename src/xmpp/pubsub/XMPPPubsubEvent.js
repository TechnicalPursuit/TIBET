//  ========================================================================
/*
NAME:   TP.xmpp.PubsubEvent.js
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
 * @type {TP.xmpp.PubsubEvent}
 * @synopsis A wrapper for the PubSub event node type.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Pubsub.defineSubtype('PubsubEvent');

//  Make sure to set the 'namespace', since its cleared by our
//  TP.xmpp.Payload supertype.
TP.xmpp.PubsubEvent.set('namespace', TP.xmpp.XMLNS.PUBSUB_EVENT);

TP.xmpp.PubsubEvent.set('tagname', 'event');

TP.xmpp.PubsubEvent.set('childTags', TP.ac('collection', 'configuration',
        'delete', 'items', 'purge', 'subscription'));

TP.xmpp.PubsubEvent.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.PubsubEvent.Inst.defineMethod('getSignalName',
function(aStanza) {

    /**
     * @name getSignalName
     * @synopsis Returns the signal name to use when signaling arrival of
     *     packets of this type.
     * @param {TP.xmpp.Stanza} aStanza The stanza that 'owns' this element.
     * @returns {String} 
     */

    return 'TP.sig.XMPPPubsubEventInput';
});

//  ------------------------------------------------------------------------

TP.xmpp.PubsubEvent.Inst.defineMethod('getSignalOrigin',
function(aStanza) {

    /**
     * @name getSignalOrigin
     * @synopsis Returns the signal origin to use when signaling arrival of
     *     packets of this type. Presence stanzas signal presence change signal
     *     from the corresponding JID. This method should return TP.NONE if it
     *     does not want the XMPP connection to send a signal on the receiver's
     *     behalf.
     * @param {TP.xmpp.Stanza} aStanza The stanza that 'owns' this element.
     * @returns {Object|String|Array} The origin(s) to use when signaling.
     */

    var itemsTPElem,

        pubsubJIDStr,
        nodeID,

        uriStr;

    if (TP.isEmpty(itemsTPElem = this.getElementsByTagName('items'))) {
        //  We can return TP.NONE telling the XMPP connection to not signal
        return TP.NONE;
    }

    //  Our enclosing stanza should be a '<message>' element - grab its
    //  'from' attribute - that will be the pubsub service that sent us this
    //  event.
    pubsubJIDStr = aStanza.getAttribute('from');

    nodeID = itemsTPElem.first().getAttribute('node');
    nodeID = nodeID.strip(/^\//);

    uriStr = TP.join('xmpp:', pubsubJIDStr, '?;node=', nodeID);

    return TP.uc(uriStr);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
