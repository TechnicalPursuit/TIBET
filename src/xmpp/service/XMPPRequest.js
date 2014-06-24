//  ========================================================================
/*
NAME:   TP.sig.XMPPRequest.js
AUTH:   William J. Edney (wje)
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
//  ------------------------------------------------------------------------

/**
 * @type {TP.sig.XMPPRequest}
 * @synopsis A subtype of TP.sig.URIRequest that is used in conjunction with the
 *     TP.core.XMPPService type to communicate to XMPP servers.
 * @example Communicating with an XMPP server from TIBET consists of:
 *     
 *     1. Define the operation you want to perform via a set of 'request
 *     parameters'. The 'action' parameter will tell the service servicing this
 *     request what sort of action you want the service to perform. 2.
 *     Instantiating an TP.sig.XMPPRequest object, supplying those parameters.
 *     3. Firing the request.
 *     
 *     Defining request parameters:
 *     
 *     Note that the service will also need: 'service URI', 'server name',
 *     'connection JID', 'connection password' 'connection type' (optional -
 *     either TP.xmpp.XMLNS.BINDING or some other transport type - the default
 *     is TP.xmpp.XMLNS.BINDING).
 *     
 *     These can be included in the request as 'serviceURI', 'serverName',
 *     'connectionJID', 'connectionPassword', and 'connectionType', but if they
 *     are not defined in the request, they will be obtained either by looking
 *     for a vCard entry matching the service's 'resourceID' in the current
 *     application's 'cfg' hash or by prompting the user.
 *     
 *     Here is an example of request parameters defined in the request (this
 *     example adds the JID 'inforat
 * @infohost.com' to our roster under the name 'My buddy' in the group 'rats'):
 *     
 *     requestParams = TP.hc( 'action', 'roster', 'toJID', TP.jid('inforat
 * @infohost.com'),
 'name', 'My buddy', 'group', 'rats', 'serverName',
 *     'infohost.com', 'serviceURI', 'http://localhost:5280/http-bind/',
 *     'connectionJID', TP.jid('testrat
 * @infohost.com'),
 'connectionPassword', 'testrat', 'connectionType',
 *     TP.xmpp.XMLNS.BINDING);
 *     
 *     Request parameters examples:
 *     
 *     Connect the XMPP service (not part of XEP-147):
 *     
 *     requestParams = TP.hc( 'action', 'connect');
 *     
 *     OR
 *     
 *     Send an ad-hoc XMPP command:
 *     
 *     // 'cmd_action' can be [cancel|complete|execute|next|prev] requestParams
 *     = TP.hc( 'action', 'command', 'toJID', TP.jid('infohost.com'),
 *     'cmd_action', 'execute', 'node', '<Escaped XML...>');
 *     
 *     OR
 *     
 *     Discover an XMPP service (not currently supported by TIBET):
 *     
 *     OR
 *     
 *     Join a chatroom and invite other JIDs to that room (not currently
 *     supported by TIBET):
 *     
 *     OR
 *     
 *     Join a chatroom (not currently supported by TIBET):
 *     
 *     OR
 *     
 *     Send a message:
 *     
 *     // 'type' can be [normal|chat|groupchat|headline] requestParams = TP.hc(
 *     'action', 'message', 'toJID', TP.jid('inforat
 * @infohost.com'),
 'subject', 'A message for inforat', 'body', 'Inforat, come
 *     here I want you', 'thread', '7dae34', 'from', 'testrat
 * @infohost.com'),
 'name', 'My buddy');
 *     
 *     OR
 *     
 *     Add or edit a roster item:
 *     
 *     requestParams = TP.hc( 'action', 'roster', 'toJID', TP.jid('inforat
 * @infohost.com'),
 'name', 'My buddy', 'group', 'rats');
 *     
 *     OR
 *     
 *     Send a file (not currently supported by TIBET):
 *     
 *     OR
 *     
 *     Subscribe to a JID:
 *     
 *     requestParams = TP.hc( 'action', 'subscribe', 'toJID', TP.jid('inforat
 * @infohost.com', // currently unused by // TIBET 'id', 'message1', 'type',
 *     'normal');
 *     
 *     OR
 *     
 *     Create a pubsub node:
 *     
 *     requestParams = TP.hc( 'action', 'pubsub', 'pubsub_action', 'create',
 *     'pubsubServiceJID', TP.jid('pubsub.infohost.com'), 'nodeID',
 *     '/home/infohost/testrat', 'subAccessModel', TP.xmpp.Pubsub.OPEN,
 *     'pubAccessModel', TP.xmpp.Pubsub.OPEN);
 *     
 *     OR
 *     
 *     Subscribe to a pubsub node:
 *     
 *     requestParams = TP.hc( 'action', 'pubsub', 'pubsub_action', 'subscribe',
 *     'pubsubServiceJID', TP.jid('pubsub.infohost.com'), 'nodeID',
 *     '/home/infohost/testrat');
 *     
 *     OR
 *     
 *     Unsubscribe from a pubsub node:
 *     
 *     requestParams = TP.hc( 'action', 'pubsub', 'pubsub_action',
 *     'unsubscribe', 'pubsubServiceJID', TP.jid('pubsub.infohost.com'),
 *     'nodeID', '/home/infohost/testrat');
 *     
 *     OR
 *     
 *     Retrieve a list of current subscriptions (not part of XEP-147):
 *     
 *     requestParams = TP.hc( 'action', 'pubsub', 'pubsub_action',
 *     'subscriptions', 'pubsubServiceJID', TP.jid('pubsub.infohost.com'));
 *     
 *     OR
 *     
 *     Receive a file (not currently supported by TIBET):
 *     
 *     OR
 *     
 *     Register with server/service (not currently supported by TIBET):
 *     
 *     OR
 *     
 *     Remove a roster item:
 *     
 *     requestParams = TP.hc( 'action', 'remove', 'toJID', TP.jid('inforat
 * @infohost.com'));

 OR
 *     
 *     Unregister with server/service (not currently supported by TIBET):
 *     
 *     OR
 *     
 *     Unsubscribe from a JID:
 *     
 *     requestParams = TP.hc( 'action', 'unsubscribe', 'toJID', TP.jid('inforat
 * @infohost.com'));

 OR
 *     
 *     Change to a JID's presence (not part of XEP-147):
 *     
 *     // 'show' can be
 *     
 *     [TP.xmpp.XMLNS.ONLINE|TP.xmpp.XMLNS.AWAY|TP.xmpp.XMLNS.CHAT|TP.xmpp.XMLNS.DO_NOT_DISTURB|TP.xmpp.XMLNS.EXTENDED_AWAY]
 *     requestParams = TP.hc( 'action', 'presence', 'show', TP.xmpp.XMLNS.AWAY,
 *     'status', 'Gone for the day');
 *     
 *     OR
 *     
 *     Publish an item to a pubsub node (not part of XEP-147):
 *     
 *     requestParams = TP.hc( 'action', 'pubsub', 'pubsub_action', 'publish',
 *     'pubsubServiceJID', TP.jid('pubsub.infohost.com'), 'nodeID',
 *     '/home/infohost/testrat', 'payload', TP.doc('<foo><bar/></foo>'),
 *     'subAccessModel', TP.xmpp.Pubsub.OPEN);
 *     
 *     OR
 *     
 *     Retract an item from a pubsub node:
 *     
 *     requestParams = TP.hc( 'action', 'pubsub', 'pubsub_action', 'retract',
 *     'pubsubServiceJID', TP.jid('pubsub.infohost.com'), 'nodeID',
 *     '/home/infohost/testrat', 'itemID', '4D62E20579F7C');
 *     
 *     OR
 *     
 *     Delete a pubsub node (and all subscriptions):
 *     
 *     requestParams = TP.hc( 'action', 'pubsub', 'pubsub_action', 'delete',
 *     'pubsubServiceJID', TP.jid('pubsub.infohost.com'), 'nodeID',
 *     '/home/infohost/testrat');
 *     
 *     Package and fire the request:
 *     
 *     msgReq = TP.sig.XMPPRequest.construct(requestParams);
 *     msgReq.defineMethod('handleRequestSucceeded', function(aResponse) {
 *     
 *     TP.log(aResponse.getResult(), TP.LOG, arguments); }); msgReq.fire();
 * @todo
 */

//  ------------------------------------------------------------------------

TP.sig.URIRequest.defineSubtype('XMPPRequest');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.XMPPRequest.Type.defineAttribute('responseType', 'TP.sig.XMPPResponse');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
