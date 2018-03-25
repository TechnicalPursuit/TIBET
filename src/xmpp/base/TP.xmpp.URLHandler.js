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
 * @type {TP.xmpp.URLHandler}
 * @summary A URI handler type that can store and load from 'xmpp://' URIs.
 */

//  ------------------------------------------------------------------------

TP.uri.URIHandler.defineSubtype('xmpp.URLHandler');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  CONTENT METHODS
//  ------------------------------------------------------------------------

TP.xmpp.URLHandler.Type.defineMethod('load',
function(targetURI, aRequest) {

    /**
     * @method load
     * @summary Loads URI data content and returns it on request. This is a
     *     template method which defines the overall process used for loading
     *     URI data and ensuring that the URI's cache and header content are
     *     kept up to date. You should normally override one of the more
     *     specific load* methods in subtypes if you're doing custom load
     *     handling.
     * @param {TP.uri.URI} targetURI The URI to load. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A valid response object for the request.
     */

    var request,
        response,

        action,

        uriparams,
        queryDict,

        requestParams,

        authJID,

        pubsubAction,

        loadRequest;

    request = TP.request(aRequest);
    response = request.getResponse();

    //  Manipulating an 'XMPP' resource requires an 'action'. Note here how
    //  we do *not* take the action from the request. This is because it
    //  conflicts with a number of commands below that have a parameter that
    //  is also named 'action'. Therefore we only pull the action from the
    //  URI.
    if (TP.isEmpty(action = targetURI.get('queryType'))) {
        request.fail();
        return response;
    }

    //  We take values for XMPP requests from either the request or the URI.

    //  Grab any parameters that were supplied on the request (as part of
    //  a command line, etc.)
    uriparams = request.at('uriparams');
    if (TP.notValid(uriparams)) {
        uriparams = TP.hc();
    }

    //  Grab any parameters that were supplied as part of the URI itself.
    queryDict = targetURI.get('queryDict');
    if (TP.notValid(queryDict)) {
        queryDict = TP.hc();
    }

    //  Go ahead and put the action in a requestParams hash and configure an
    //  'authentication JID' if it was supplied.
    requestParams = TP.hc('action', action);
    if (TP.notEmpty(authJID = targetURI.get('authjid'))) {
        requestParams.atPut('connectionJID', authJID);
    }

    switch (action) {
        case 'command':

            //  Send an ad-hoc XMPP command:
            //      Params: 'action'    [cancel|complete|execute|next|prev]
            //              'node'

            //  xmpp:infohost.com?command;action=execute;node=Escaped XML...

            requestParams.add(
                    'toJID', targetURI.get('path'),
                    'cmd_action', uriparams.atIfInvalid(
                                'action', queryDict.at('action')),
                    'node', window.unescape(uriparams.atIfInvalid(
                                'node', queryDict.at('node'))));

            break;

        case 'disco':

            //  Discover an XMPP service (not currently supported by TIBET):
            //      Params: 'request'   [info|items]
            //              'type'      [get|set]
            //              'node'

            //  xmpp:infohost.com?disco;request=info

            break;

        case 'invite':

            //  Join a chatroom and invite other JIDs to that room (not
            //  currently supported by TIBET):
            //      Params: 'jid'
            //              'password'

            //  xmpp:chat.infohost.com?invite;jid=foorat@infohost.com;password=foo

            break;

        case 'join':

            //  Join a chatroom (not currently supported by TIBET):
            //      Params: 'password'

            //  xmpp:chat.infohost.com?join;password=foo

            break;

        case 'message':

            //  Send a message.
            //      Params: 'subject',
            //              'body',
            //              'thread',
            //              'from',
            //              'id',
            //              'type'

            //  NB: 'from' is currently unused by TIBET

            //  xmpp:inforat@infohost.com?message;subject=A%20message%20for%20inforat;type=normal;id=message1;thread=7dae34

            requestParams.add(
                    'toJID', targetURI.get('path'),
                    'subject', window.unescape(uriparams.atIfInvalid(
                                'subject', queryDict.at('subject'))),
                    'body', window.unescape(uriparams.atIfInvalid(
                                'body', queryDict.at('body'))),
                    'thread', uriparams.atIfInvalid(
                                'thread', queryDict.at('thread')),
                    'from', uriparams.atIfInvalid(
                                'from', queryDict.at('from')),
                    'id', uriparams.atIfInvalid(
                            'id', queryDict.at('id')),
                    'type', 'chat');

            break;

        case 'pubsub':

            //  All pubsub actions have the following parameters:

            //      Params: 'action',
            //              'node',

            pubsubAction = uriparams.atIfInvalid(
                                'action', queryDict.at('action'));
            requestParams.atPut('pubsub_action', pubsubAction);

            requestParams.atPut('pubsubServiceJID', targetURI.get('path'));

            requestParams.atPut(
                'nodeID', uriparams.atIfInvalid(
                    'node', queryDict.at('node')));

            switch (pubsubAction) {
                case 'subscribe':

                    //  Subscribe to a pubsub node:

                    //  xmpp:pubsub.infohost.com?pubsub;action=subscribe;node=/home/infohost/testrat

                    //  No additional parameters

                    break;

                case 'unsubscribe':

                    //  Unsubscribe from a pubsub node:

                    //  xmpp:pubsub.infohost.com?pubsub;action=unsubscribe;node=/home/infohost/testrat

                    //  No additional parameters

                    break;

                case 'publish':

                    //  Publish an item to a pubsub node (not part of
                    //  XEP-147):

                    //  xmpp:pubsub.infohost.com?pubsub;action=publish;node=/home/infohost/testrat;payload=Here%20is%20some%20data%20

                    requestParams.atPut(
                        'payload', uriparams.atIfInvalid(
                            'payload', queryDict.at('payload')));

                    break;

                case 'retract':

                    //  Retract an item from a pubsub node (not part of
                    //  XEP-147):

                    //  xmpp:pubsub.infohost.com?pubsub;action=retract;node=/home/infohost/testrat;itemID=4D62E20579F7C

                    requestParams.atPut(
                        'itemID', uriparams.atIfInvalid(
                            'itemID', queryDict.at('itemID')));

                    break;

                case 'delete':

                    //  Delete a pubsub node (and all subscriptions) (not
                    //  part of XEP-147):

                    //  xmpp:pubsub.infohost.com?pubsub;action=delete;node=/home/infohost/testrat

                    //  No additional parameters

                    break;

                default:

                    aRequest.fail('Unrecognized pubsub action');

                    return this;
            }

            break;

        case 'recvfile':

            //  Receive a file (not currently supported by TIBET):
            //      Params: 'mime-type',
            //              'name',
            //              'sid',
            //              'size',

            //  xmpp:infohost.com?recvfile;name=/path/to/file

            break;

        case 'register':

            //  Register with server/service (not currently supported by
            //  TIBET):

            //  xmpp:infohost.com?register


            break;

        case 'remove':

            //  Remove a roster item:

            //  xmpp:inforat@infohost.com?remove;name=My%20buddy

            requestParams.add(
                    'toJID', targetURI.get('path'),
                    'name', uriparams.atIfInvalid(
                            'name', queryDict.at('name')));

            break;

        case 'roster':

            //  Add or edit a roster item:
            //      Params: 'group',
            //              'name',

            //  xmpp:inforat@infohost.com?roster;name=My%20buddy;group=rats

            requestParams.add(
                    'toJID', targetURI.get('path'),
                    'name', uriparams.atIfInvalid(
                            'name', queryDict.at('name')),
                    'group', uriparams.atIfInvalid(
                            'group', queryDict.at('group')));

            break;

        case 'sendfile':

            //  Send a file (not currently supported by TIBET):

            //  xmpp:infohost.com?sendfile

            break;

        case 'subscribe':

            //  Subscribe to a JID:

            //  xmpp:inforat@infohost.com?subscribe

            requestParams.atPut('toJID', targetURI.get('path'));

            break;

        case 'unregister':

            //  Not supported by TIBET

            //  Unregister with server/service (not currently supported by
            //  TIBET):

            //  xmpp:infohost.com?unregister

            break;

        case 'unsubscribe':

            //  Unsubscribe from a JID:

            //  xmpp:inforat@infohost.com?unsubscribe

            requestParams.atPut('toJID', targetURI.get('path'));

            break;

        case 'presence':

            //  Change to a JID's presence (not part of XEP-147):

            //  NB: the 'to JID' ('infohost.com' here) is unused

            //  xmpp:infohost.com?presence;show=TP.xmpp.XMLNS.AWAY;status=Gone%20for%20the%20day

            requestParams.add(
                    'show', uriparams.atIfInvalid(
                            'show', queryDict.at('show')),
                    'status', window.unescape(uriparams.atIfInvalid(
                            'status', queryDict.at('status'))));

            break;

        default:

            aRequest.fail('Unrecognized action');

            return this;
    }

    //  Construct and initialize an TP.sig.XMPPRequest using the params as a
    //  parameter.
    loadRequest = TP.sig.XMPPRequest.construct(requestParams);

    //  'Join' that request to the incoming request. This will cause the
    //  incoming request to 'pause' until the get item request finishes and
    //  to be 'dependent' on the success/failure of the get item request.
    request.andJoinChild(loadRequest);

    //  Fire the load request to trigger service operation.
    loadRequest.fire();

    //  Make sure that the 2 requests match on sync/async
    request.updateRequestMode(loadRequest);

    return response;
});

//  ------------------------------------------------------------------------

TP.xmpp.URLHandler.Type.defineMethod('delete',
function(targetURI, aRequest) {

    /**
     * @method delete
     * @summary Deletes the target URL. This is an unsupported operation for an
     *     XMPP URL.
     * @param {TP.uri.URI} targetURI The URI to delete. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A valid response object for the request.
     */

    var request,
        response;

    this.raise('TP.sig.UnsupportedOperation');

    request = TP.request(aRequest);
    response = request.getResponse(false);
    request.fail();

    return response;
});

//  ------------------------------------------------------------------------

TP.xmpp.URLHandler.Type.defineMethod('save',
function(targetURI, aRequest) {

    /**
     * @method save
     * @summary Attempts to save data using standard TIBET save primitives to
     *     the URI (after rewriting) that is provided.
     * @description The 'save' method on TP.xmpp.URLHandler just checks for
     *     content that the URI might have and, depending on the XMPP URI's
     *     action, it makes that the value of one of the request's parameters.
     *     Then it just calls this type's 'load' method to complete the
     *     processing, since most XMPP URI's are of the 'load' variety (i.e.
     *     like an 'HTTP GET') anyway, rather than of the 'save' variety (i.e.
     *     like an 'HTTP PUT').
     * @param {TP.uri.URI} targetURI The URI to save. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A valid response object for the request.
     */

    var request,
        response,

        action,

        uriparams,
        queryDict,

        resp,

        content;

    request = TP.request(aRequest);
    response = request.getResponse();

    //  Manipulating an 'XMPP' resource requires an 'action'. Note here how
    //  we do *not* take the action from the request. This is because it
    //  conflicts with a number of commands below that have a parameter that
    //  is also named 'action'. Therefore we only pull the action from the
    //  URI.
    if (TP.isEmpty(action = targetURI.get('queryType'))) {
        request.fail();

        return response;
    }

    //  We take values for XMPP requests from either the request or the URI.

    //  Grab any parameters that were supplied on the request (as part of
    //  a command line, etc.)
    if (TP.notValid(uriparams = request.at('uriparams'))) {
        uriparams = TP.hc();
        request.atPut('uriparams', uriparams);
    }

    //  Grab any parameters that were supplied as part of the URI itself.
    queryDict = targetURI.get('queryDict');
    if (TP.notValid(queryDict)) {
        queryDict = TP.hc();
    }

    switch (action) {
        case 'command':

            resp = targetURI.getResource(
                TP.hc('refresh', false, 'async', false, 'resultType', TP.DOM));

            if (TP.isEmpty(content = resp.get('result'))) {
                content = uriparams.atIfInvalid(
                                'node', queryDict.at('node'));
            }

            uriparams.atPut('node', content);

            break;

        case 'message':

            resp = targetURI.getResource(
                TP.hc('refresh', false, 'async', false, 'resultType', TP.TEXT));

            if (TP.isEmpty(content = resp.get('result'))) {
                content = uriparams.atIfInvalid(
                                'body', queryDict.at('body'));
            }

            uriparams.atPut('body', content);

            break;

        case 'presence':

            resp = targetURI.getResource(
                TP.hc('refresh', false, 'async', false, 'resultType', TP.TEXT));

            if (TP.isEmpty(content = resp.get('result'))) {
                content = uriparams.atIfInvalid(
                                'status', queryDict.at('status'));
            }

            uriparams.atPut('status', content);

            break;

        case 'publish':

            resp = targetURI.getResource(
                                TP.hc('refresh', false, 'async', false));

            if (TP.isEmpty(content = resp.get('result'))) {
                content = uriparams.atIfInvalid(
                                'payload', queryDict.at('payload'));
            }

            uriparams.atPut('payload', content);

            break;

        default:
            break;
    }

    //  Now that we've extracted whatever 'content value' the URI had and
    //  added it to the proper request parameter for the action specified,
    //  we can just go ahead and call over to our 'load' method to finish
    //  the operation.

    return this.load(targetURI, aRequest);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
