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
 * @type {TP.xmpp.URL}
 * @summary A subtype of URL specific to handling XMPP formatted urls.
 * @summary This type is typically used within TIBET to define a unique ID
 *     for a particular XMPP session. Note that RFC5122 defines the 'xmpp:' URI
 *     standard. This type implements a subset of that functionality. According
 *     to RFC5122, XMPP URLs begin with the 'xmpp:' scheme, followed by a double
 *     slash, followed the 'authority component' which should be the JID of the
 *     current login:
 *
 *     xmpp://testrat@localhost

 *     So, to send a message from 'testrat' on 'localhost' to 'inforat' on
 *     'infohost.com', the following URL would be formed:
 *
 *     xmpp://testrat@localhost/inforat@infohost.com?message

 *     In TIBET, and in accordance with RFC5122, the 'authority component' can
 *     be omitted if it is to default to the 'current XMPP login':
 *
 *     xmpp:inforat@infohost.com?message

 *     TIBET supports most 'XMPP URL queries', a registry of which can be found
 *     at:
 *
 *     http://xmpp.org/registrar/querytypes.html
 *
 *     They take the following form (these examples assume a current login /
 *     authenticating authority). Note that XMPP URLs use semicolons (';') as
 *     URI query separators for maximum compatibility with XML:
 *
 *     Send an ad-hoc XMPP command:
 *
 *     xmpp:infohost.com?command;action=execute;node=Escaped XML...
 *
 *     [body is alternate source of node content to send]
 *
 *     Discover an XMPP service (not currently supported by TIBET):
 *
 *     xmpp:infohost.com?disco;request=info
 *
 *     Join a chatroom and invite other JIDs to that room (not currently
 *     supported by TIBET):
 *
 *     xmpp:chat.infohost.com?invite;jid=foorat@infohost.com;password=foo

 *     Join a chatroom (not currently supported by TIBET):
 *
 *     xmpp:chat.infohost.com?join;password=foo
 *
 *     Send a message:
 *
 *     xmpp:inforat@infohost.com?message;subject=A%20message%20for%20inforat;type=normal;id=message1;thread=7dae34;body=Inforat,%20come%20here%20I%20want%20you

 *     [body is alternate source of message to send]
 *
 *     Subscribe to a pubsub node:
 *
 *     xmpp:pubsub.infohost.com?pubsub;action=subscribe;node=/home/infohost/testrat
 *
 *     Unsubscribe from a pubsub node:
 *
 *     xmpp:pubsub.infohost.com?pubsub;action=unsubscribe;node=/home/infohost/testrat
 *
 *     Receive a file (not currently supported by TIBET):
 *
 *     xmpp:infohost.com?recvfile;name=/path/to/file
 *
 *     Register with server/service (not currently supported by TIBET):
 *
 *     xmpp:infohost.com?register
 *
 *     Remove a roster item:
 *
 *     xmpp:inforat@infohost.com?remove;name=My%20buddy


 *     Add or edit a roster item:
 *
 *     xmpp:inforat@infohost.com?roster;name=My%20buddy;group=rats

 *     [name is user-assigned name, group is user-assigned group]
 *
 *     Send a file (not currently supported by TIBET):
 *
 *     xmpp:infohost.com?sendfile
 *
 *     Subscribe to a JID:
 *
 *     xmpp:inforat@infohost.com?subscribe


 *     Unregister with server/service (not currentlysupported by TIBET):
 *
 *     xmpp:infohost.com?unregister
 *
 *     Unsubscribe from a JID:
 *
 *     xmpp:inforat@infohost.com?unsubscribe

 *     Change to a JID's presence (not part of XEP-147):
 *
 *     xmpp:infohost.com?presence;show=TP.xmpp.XMLNS.AWAY;status=Gone%20for%20the%20day
 *
 *     [to JID ('infohost.com' here) is unused] [body is alternate source of
 *     status]
 *
 *     Publish an item to a pubsub node (not part of XEP-147):
 *
 *     xmpp:pubsub.infohost.com?pubsub;action=publish;node=/home/infohost/testrat;payload=Here%20is%20some%20data%20
 *
 *     [body is alternate source of payload to publish]
 *
 *     Retract an item from a pubsub node (not part of XEP-147):
 *
 *     xmpp:pubsub.infohost.com?pubsub;action=retract;node=/home/infohost/testrat;itemID=4D62E20579F7C
 *
 *     Delete a pubsub node (and all subscriptions) (not part of XEP-147):
 *
 *
 *     xmpp:pubsub.infohost.com?pubsub;action=delete;node=/home/infohost/testrat
 */

//  ------------------------------------------------------------------------

TP.uri.URL.defineSubtype('xmpp.URL');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.xmpp.URL.Type.defineConstant('SCHEME', 'xmpp');

//  This RegExp splits up the URL into the following components:
//  scheme://authority/path(?querytype)(;queryparam=val;...)
TP.xmpp.URL.Type.defineConstant('XMPP_REGEX',
                TP.rc('xmpp:(?://)?([^/]+/)?([^/?]+)(([^;]+);?(\\S*))?'));

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  'xmpp:' scheme is async-only so configure for that
TP.xmpp.URL.Type.defineAttribute('supportedModes',
                                TP.core.SyncAsync.ASYNCHRONOUS);
TP.xmpp.URL.Type.defineAttribute('mode',
                                TP.core.SyncAsync.ASYNCHRONOUS);

TP.xmpp.URL.registerForScheme('xmpp');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xmpp.URL.Type.defineMethod('$getDefaultHandler',
function(aURI, aRequest) {

    /**
     * @method $getDefaultHandler
     * @summary Return the default URI handler type for this URI type.
     * @param {TP.uri.URI|String} aURI The URI to obtain the default handler
     *     for.
     * @param {TP.sig.Request} aRequest The request whose values should inform
     *     the routing assignment.
     * @returns {TP.meta.uri.URIHandler} A TP.uri.URIHandler subtype type
     *     object.
     */

    return TP.xmpp.URLHandler;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  note that there are 'scheme', 'path' and 'fragment' ivars on
//  TP.uri.URI / TP.uri.URL

//  the authenticating JID, constructed from the string trailing the xmpp://
//  prefix, but before the next slash
TP.xmpp.URL.Inst.defineAttribute('authjid');

//  the path in an xmpp: URI denotes the address to which an XMPP stanza
//  will be sent - this can be considered the 'to JID'.
TP.xmpp.URL.Inst.defineAttribute('path');

//  the query type from the query component of the xmpp: URI
TP.xmpp.URL.Inst.defineAttribute('queryType');

//  the query parameters from the query component of the xmpp: URI
TP.xmpp.URL.Inst.defineAttribute('queryDict');

//  whether or not to ignore remote observers when signaling
TP.xmpp.URL.Inst.defineAttribute('ignoreRemoteObservers');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.URL.Inst.defineMethod('init',
function(aURIString) {

    /**
     * @method init
     * @summary Initializes a new instance of the receiver.
     * @param {String} aURIString A String containing a proper URI.
     * @returns {TP.xmpp.URL} A new instance.
     */

    var results,

        authjid,

        queryType,
        uriQuery,
        queryDict,

        eventInputHandler;

    this.callNextMethod();

    //  Run the type's RegExp and grab the pieces of the URI.
    results = this.getType().XMPP_REGEX.exec(aURIString);
    if (TP.notValid(results)) {
        return;
    }

    //  The 'auth JID' (the 'from JID') comes from the 'path'
    if (TP.notEmpty(authjid = results.at(1))) {
        //  Make sure it doesn't have a trailing '/'
        authjid = authjid.chop('/');
        this.set('authjid', TP.xmpp.JID.construct(authjid));
    }

    //  The 'to JID' comes from the 'path'
    this.set('path', TP.xmpp.JID.construct(results.at(2)));

    if (TP.notEmpty(queryType = results.at(4))) {
        //  The query type will always have a leading '?'
        this.set('queryType', queryType.slice(1));
    }

    //  If there are parameters in the query, process them into a hash.
    if (TP.isValid(uriQuery = results.at(5))) {
        //  Construct a hash from the query string.
        queryDict = TP.core.Hash.fromString(uriQuery);

        this.set('queryDict', queryDict, false);
    }

    //  Make sure to set the 'ignoreRemoteObservers' flag to false. Unless
    //  we're processing the signal ourselves, we'll want the remote
    //  observers to be notified.
    this.set('ignoreRemoteObservers', false);

    //  Rather than set ourself as the handler, we create a handler function
    //  and call our 'process' method from that. This is because trying to
    //  resolve URI instances as signal handlers themselves is problematic
    //  because 'TP.getOID()' will try to fetch a URI's resource if it sees
    //  a URI as a handler.
    eventInputHandler =
        function(aSignal) {

            this.processTP_sig_XMPPPubsubEventInput(aSignal);
        }.bind(this);

    eventInputHandler.observe(this, 'TP.sig.XMPPPubsubEventInput');

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.URL.Inst.defineMethod('addObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @method addObserver
     * @summary Adds a local signal observation which is roughly like a DOM
     *     element adding an event listener. The observer is typically the
     *     handler provided to an observe() call while the signal is a signal or
     *     string which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @param {Object|Array} anOrigin One or more origins to observe.
     * @param {Object|Array} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as 'capture'
     *     or a specific function to manage the observe process. IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to add the observation, false otherwise.
     */

    var signals,

        len,
        i,

        pubsubServiceJID,
        pubsubNodeID,

        subscriptions,
        subscriptionEntries,

        subReqParams,
        subReq;

    //  invalid handler, no response can happen
    if (TP.notValid(aHandler)) {
        this.raise('TP.sig.InvalidHandler');

        return false;
    }

    if (TP.isArray(aSignal)) {
        signals = aSignal;
    } else if (TP.isString(aSignal)) {
        signals = aSignal.split(' ');
    } else if (TP.isType(aSignal)) {
        signals = TP.ac(aSignal);
    } else {
        this.raise('TP.sig.InvalidParameter',
                    'Improper signal definition.');

        return false;
    }

    len = signals.getSize();
    for (i = 0; i < len; i++) {
        if (signals.at(i) !== 'TP.sig.XMPPPubsubNodeChange' &&
            !TP.isSubtypeOf(signals.at(i).asType(),
                            'TP.sig.XMPPPubsubNodeChange')) {
            //  One of the signals supplied wasn't a type of
            //  TP.sig.XMPPPubsubNodeChange, so we bail out and don't
            //  handle any of them (note here that we return 'true' because
            //  these might very well be signals that the URL is trying to
            //  observe that have nothing to do with
            //  'TP.sig.XMPPPubsubNodeChange' and we want to give the main
            //  notification center a crack at them).
            return true;
        }
    }

    if (TP.notValid(pubsubServiceJID = this.get('path'))) {
        this.raise('TP.sig.InvalidParameter',
                    'No path to pubsub service defined.');

        return false;
    }

    if (TP.notValid(pubsubNodeID = this.get('queryDict').at('node'))) {
        this.raise('TP.sig.InvalidParameter',
                    'No pubsub nodeID defined.');

        return false;
    }

    //  Check to make sure that the 'current effective user' doesn't already
    //  have this subscription over in the server. This list of
    //  subscriptions was obtained from the server when the user logged in.

    subscriptions = TP.core.User.getEffectiveUser().get(
                                                'remoteSubscriptions');

    //  First, make sure that there is an entry for the service JID that we
    //  have
    if (TP.notValid(subscriptions.at(pubsubServiceJID.asString()))) {
        //  Need to have an active connection. Activating a connection will
        //  populate the 'remoteSubscriptions' of the current effective
        //  user.

        //  For now, we just bail out with a warning. At some point, we
        //  might store away the observation and wait for an XMPP connection
        //  to come up and retry the observe.
        TP.ifWarn() ?
            TP.warn('Remote subscription data not available') : 0;

        //  Note here how we return 'false', telling the main notification
        //  engine to *not* go ahead and process the observation.
        return false;
    }

    subscriptionEntries = subscriptions.at(pubsubServiceJID.asString());

    if (subscriptionEntries.contains(pubsubNodeID)) {
        //  The subscription has already been registered (note here that we
        //  return 'true' because we want the main notification engine to
        //  go ahead and process the observation).
        return true;
    }

    subReqParams = TP.hc('action', 'pubsub',
                            'pubsub_action', 'subscribe',
                            'pubsubServiceJID', pubsubServiceJID,
                            'nodeID', pubsubNodeID);

    subReq = TP.sig.XMPPRequest.construct(subReqParams);

    //  This will be called when the request succeeds. We need to add the
    //  pubsub node to the user's list of remote subscriptions.
    subReq.defineHandler(
        'RequestSucceeded',
        function(aResponse) {

            //  Make an entry for the pubsub node in the subscription
            //  entries.
            subscriptionEntries.add(pubsubNodeID);

            //  Make sure that they're all unique entries (might have had
            //  multiple observations of the same node).
            subscriptionEntries.unique();
        });

    //  This will be called when the request fails. This may be because the
    //  node being subscribed to has not been created.
    subReq.defineHandler(
        'RequestFailed',
        function(aResponse) {

            var errorTPElem,
                errorCondition,

                createReqParams,
                createReq;

            errorTPElem = aResponse.getResult().getErrorElement();

            errorCondition = errorTPElem.get(
                                        'errorCondition').getLocalName();

            if (errorCondition === 'item-not-found') {
                //  Fire off a 'create' request to create the pubsub node.
                //  Note how we make sure to use this service's resourceID
                //  so that the request is aimed at the receiver for
                //  processing.
                createReqParams =
                        TP.hc('action', 'pubsub',
                                'pubsub_action', 'create',
                                'pubsubServiceJID', pubsubServiceJID,
                                'nodeID', pubsubNodeID);

                createReq = TP.sig.XMPPRequest.construct(
                                createReqParams, this.get('resourceID'));

                createReq.defineHandler(
                    'RequestSucceeded',
                    function(successResponse) {

                        //  Reset the request failed handler so that we
                        //  don't endlessly loop.
                        subReq.defineHandler(
                            'RequestFailed',
                            function(failureResponse) {

                                return this.raise(
                                        'TP.sig.InvalidXMPPPubsubNode',
                                        'Cannot create node: ' +
                                            pubsubNodeID);
                            }.bind(this));

                        //  Try again.
                        subReq.fire();
                    });

                createReq.fire();
            }
        }.bind(this));

    subReq.fire();

    //  We've registered the subscription (note here that we return 'true'
    //  because we want the main notification engine to go ahead and process
    //  the observation).
    return true;
});

//  ------------------------------------------------------------------------

TP.xmpp.URL.Inst.defineMethod('processTP_sig_XMPPPubsubEventInput',
function(aSignal) {

    /**
     * @method processTP_sig_XMPPPubsubEventInput
     * @summary Responds to notification that a pubsub event packet has
     *     arrived.
     * @param {TP.sig.XMPPPubsubEventInput} aSignal The triggering signal.
     */

    var args,
        node,

        contents;

    if (TP.notValid(aSignal) || TP.notValid(args = aSignal.getPayload())) {
        TP.ifWarn() ?
            TP.warn(
            'Invalid signal data for TP.sig.XMPPPubsubEventInput event.',
            TP.IO_LOG) : 0;

        return;
    }

    if (TP.notValid(node = args.at('node'))) {
        TP.ifWarn() ?
            TP.warn(
            'Missing stanza data for TP.sig.XMPPPubsubEventInput event.',
            TP.IO_LOG) : 0;

        return;
    }

    if (TP.notEmpty(contents =
                    node.evaluateXPath('.//$def:item/*', TP.NODESET))) {
        //  !!NOTE!!
        //  We need to set this flag so that in the 'signalObservers()' call
        //  below we don't try to send this event *back* to the XMPP server,
        //  thereby causing a client<->server endless loop. We still do want
        //  local observers in the notification center to get notified,
        //  however.
        this.set('ignoreRemoteObservers', true);

        this.signal('TP.sig.XMPPPubsubNodeChange', contents);

        //  Unset the flag
        this.set('ignoreRemoteObservers', false);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.xmpp.URL.Inst.defineMethod('removeObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @method removeObserver
     * @summary Removes a local signal observation which is roughly like a DOM
     *     element adding an event listener. The observer is typically the
     *     handler provided to an observe call while the signal is a signal or
     *     string which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @param {Object|Array} anOrigin One or more origins to ignore.
     * @param {Object|Array} aSignal One or more signals to ignore from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn off observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as 'capture'
     *     or a specific function to manage the observe process. IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to remove the observation, false otherwise.
     */

    var signals,

        len,
        i,

        pubsubServiceJID,
        pubsubNodeID,

        subscriptions,
        subscriptionEntries,

        unsubReqParams,
        unsubReq;

    //  invalid handler, no response can happen
    if (TP.notValid(aHandler)) {
        this.raise('TP.sig.InvalidHandler');

        return false;
    }

    if (TP.isArray(aSignal)) {
        signals = aSignal;
    } else if (TP.isString(aSignal)) {
        signals = aSignal.split(' ');
    } else if (TP.isType(aSignal)) {
        signals = TP.ac(aSignal);
    } else {
        this.raise('TP.sig.InvalidParameter',
                    'Improper signal definition.');

        return false;
    }

    len = signals.getSize();
    for (i = 0; i < len; i++) {
        if (signals.at(i) !== 'TP.sig.XMPPPubsubNodeChange' &&
            !TP.isSubtypeOf(signals.at(i).asType(),
                            'TP.sig.XMPPPubsubNodeChange')) {
            //  One of the signals supplied wasn't a type of
            //  TP.sig.XMPPPubsubNodeChange, so we bail out and don't
            //  handle any of them (note here that we return 'true' because
            //  these might very well be signals that the URL is trying to
            //  ignore that have nothing to do with
            //  'TP.sig.XMPPPubsubNodeChange' and we want to give the main
            //  notification center a crack at them).
            return true;
        }
    }

    if (TP.notValid(pubsubServiceJID = this.get('path'))) {
        this.raise('TP.sig.InvalidParameter',
                    'No path to pubsub service defined.');

        return false;
    }

    if (TP.notValid(pubsubNodeID = this.get('queryDict').at('node'))) {
        this.raise('TP.sig.InvalidParameter',
                    'No pubsub nodeID defined.');

        return false;
    }

    //  Check to make sure that the 'current effective user' really has this
    //  subscription over in the server. This list of subscriptions was
    //  obtained from the server when the user logged in.

    subscriptions = TP.core.User.getEffectiveUser().get(
                                                    'remoteSubscriptions');

    //  First, make sure that there is an entry for the service JID that we
    //  have
    if (TP.notValid(subscriptions.at(pubsubServiceJID.asString()))) {
        //  Need to have an active connection. Activating a connection will
        //  populate the 'remoteSubscriptions' of the current effective
        //  user.

        //  For now, we just bail out with a warning. At some point, we
        //  might store away the observation and wait for an XMPP connection
        //  to come up and retry the observe.
        TP.ifWarn() ?
            TP.warn('Remote subscription data not available') : 0;

        //  Note here how we return 'false', telling the main notification
        //  engine to *not* go ahead and process the observation.
        return false;
    }

    subscriptionEntries = subscriptions.at(pubsubServiceJID.asString());

    if (!subscriptionEntries.contains(pubsubNodeID)) {
        //  The subscription has already been unregistered - or was never
        //  registered in the first place (note here that we return 'true'
        //  because we want the main notification engine to go ahead and
        //  process the ignore).
        return true;
    }

    unsubReqParams = TP.hc('action', 'pubsub',
                            'pubsub_action', 'unsubscribe',
                            'pubsubServiceJID', pubsubServiceJID,
                            'nodeID', pubsubNodeID);

    unsubReq = TP.sig.XMPPRequest.construct(unsubReqParams);

    //  This will be called when the request succeeds. We need to remove the
    //  pubsub node from the user's list of remote subscriptions.
    unsubReq.defineHandler(
        'RequestSucceeded',
        function(aResponse) {

            //  Remove all entries for the pubsub node in the subscription
            //  entries (remove() ensures that all occurrences are removed).
            subscriptionEntries.remove(pubsubNodeID);
        });

    //  This will be called when the request fails. This may be because the
    //  node being unsubscribed from has not been created.
    unsubReq.defineHandler(
        'RequestFailed',
        function(aResponse) {

            var errorTPElem,
                errorCondition;

            errorTPElem = aResponse.getResult().getErrorElement();

            errorCondition = TP.elementGetLocalName(
                                errorTPElem.get('errorCondition'));

            if (errorCondition === 'item-not-found') {
                return this.raise('TP.sig.InvalidXMPPPubsubNode',
                                    'Node doesn\'t exist: ' + pubsubNodeID);
            }
        }.bind(this));

    unsubReq.fire();

    //  We've unregistered the subscription (note here that we return 'true'
    //  because we want the main notification engine to go ahead and process
    //  the ignore).
    return true;
});

//  ------------------------------------------------------------------------

TP.xmpp.URL.Inst.defineMethod('signalObservers',
function(anOrigin, aSignal, aPayload, aPolicy, aType, isCancelable,
         isBubbling) {

    /**
     * @method signalObservers
     * @summary Signals a local signal observation which is roughly like a DOM
     *     element throwing an event. The observer is typically the handler
     *     provided to a signal() call while the signal is a signal or string
     *     which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @param {Object} anOrigin The originator of the signal.
     * @param {String|TP.sig.Signal} aSignal The signal to fire.
     * @param {Object} aPayload Optional argument object.
     * @param {Function} aPolicy A "firing" policy that will define how the
     *     signal is fired.
     * @param {String|TP.sig.Signal} aType A default type to use when the signal
     *     type itself isn't found and a new signal subtype must be constructed.
     *     Defaults to TP.sig.Signal.
     * @param {Boolean} isCancelable Optional flag for dynamic signals defining
     *     if they can be cancelled.
     * @param {Boolean} isBubbling Optional flag for dynamic signals defining
     *     whether they bubble (when using TP.DOM_FIRING).
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to signal the signal, false otherwise.
     */

    var signals,

        len,
        i,

        pubsubServiceJID,
        pubsubNodeID,

        pubPayloadElem,

        pubReqParams,
        pubReq;

    //  If we're ignoring remote observers, there's no sense in going any
    //  further. We do return true, however, so that the notification center
    //  gets a crack at the signal.
    if (TP.isTrue(this.get('ignoreRemoteObservers'))) {
        return true;
    }

    //  invalid payload, no sense in sending the publish
    if (TP.notValid(aPayload)) {
        this.raise('TP.sig.InvalidPayload');

        return false;
    }

    if (TP.isArray(aSignal)) {
        signals = aSignal;
    } else if (TP.isString(aSignal)) {
        signals = aSignal.split(' ');
    } else if (TP.isType(aSignal)) {
        signals = TP.ac(aSignal);
    } else {
        this.raise('TP.sig.InvalidParameter',
                    'Improper signal definition.');

        return false;
    }

    len = signals.getSize();
    for (i = 0; i < len; i++) {
        if (signals.at(i) !== 'TP.sig.XMPPPubsubNodeChange' &&
            !TP.isSubtypeOf(signals.at(i).asType(),
                            'TP.sig.XMPPPubsubNodeChange')) {
            //  One of the signals supplied wasn't a type of
            //  TP.sig.XMPPPubsubNodeChange, so we bail out and don't
            //  handle any of them (note here that we return 'true' because
            //  these might very be signals that the URL is trying to ignore
            //  that have nothing to do with 'TP.sig.XMPPPubsubNodeChange'
            //  and we want to give the main notification center a crack at
            //  them).
            return true;
        }
    }

    if (TP.notValid(pubsubServiceJID = this.get('path'))) {
        this.raise('TP.sig.InvalidParameter',
                    'No path to pubsub service defined.');

        return false;
    }

    if (TP.notValid(pubsubNodeID = this.get('queryDict').at('node'))) {
        this.raise('TP.sig.InvalidParameter',
                    'No pubsub nodeID defined.');

        return false;
    }

    //  Make sure that the payload we were supplied can be turned into an
    //  XML element. If not, bail out here.
    pubPayloadElem = TP.elem(aPayload);
    if (!TP.isElement(pubPayloadElem)) {
        this.raise('TP.sig.InvalidParameter',
                    'Pubsub payload is not XML Element.');

        return false;
    }

    //  Create an XMPP pubsub 'publish' request and fire it.
    pubReqParams = TP.hc('action', 'pubsub',
                            'pubsub_action', 'publish',
                            'pubsubServiceJID', pubsubServiceJID,
                            'nodeID', pubsubNodeID,
                            'payload', pubPayloadElem);

    pubReq = TP.sig.XMPPRequest.construct(pubReqParams);
    pubReq.fire();

    return false;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
