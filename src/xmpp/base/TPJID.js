//  ========================================================================
/*
NAME:   TP.xmpp.JID.js
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
 * @type {TP.xmpp.JID}
 * @synopsis A XMPP ID (JID) type.
 * @description The TP.xmpp.JID type provides a central point from which to
 *     manage JID-related information such as roster/presence info etc. It also
 *     provides convenience methods for extraction of various portions of the
 *     JID string for use.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('xmpp:JID');

//  ------------------------------------------------------------------------

TP.definePrimitive('jid',
function(aJID) {

    return TP.xmpp.JID.construct(aJID);
});

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  Characters that are disallowed in the node identifier portion of JIDs
//  (the part before the '@') as per XMPP 1.0
TP.xmpp.JID.Type.defineAttribute('disallowedJIDCharsRegEx',
                                TP.rc('[ "&\'/:<>@]+'));

//  The local JID hash, each JID instance is indexed here.
TP.xmpp.JID.Type.defineAttribute('instances', TP.hc());

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xmpp.JID.Type.defineMethod('construct',
function(aString) {

    /**
     * @name construct
     * @synopsis Constructs a new JID instance for use with XMPP connections.
     *     Note that each JID is a singleton relative to that string.
     * @param {String} aString A valid JID: [node@]domain[/resource].
     * @raises TP.sig.InvalidJID
     * @returns {TP.xmpp.JID} 
     */

    var hostInd,

        nodeIdent,
        hostIdent,

        newJID,

        inst;

    if (TP.isKindOf(aString, 'TP.xmpp.JID')) {
        return aString;
    }

    if (!TP.isString(aString)) {
        return this.raise('TP.sig.InvalidJID', arguments, aString);
    }

    hostInd = aString.lastIndexOf('@');

    //  the @ has to be between two actual values, not at the end
    if ((aString.indexOf('@') === 0) ||
        (hostInd === (aString.getSize() - 1))) {
        return this.raise('TP.sig.InvalidJID', arguments, aString);
    }

    //  Grab the 'node identifier' and 'host identifier' portions of the
    //  JID.
    nodeIdent = aString.slice(0, hostInd);
    hostIdent = aString.slice(hostInd);

    //  XMPP 1.0 states that JIDs must follow the Nodeprep profile of
    //  Stringprep, which specifically disallows the characters as expressed
    //  in 'disallowedJIDCharsRegEx'. We escape those here.

    if (this.get('disallowedJIDCharsRegEx').test(nodeIdent)) {
        nodeIdent = this.escapeJID(nodeIdent);
    }

    newJID = nodeIdent + hostIdent;
    if (TP.isValid(inst = this.get('instances').at(newJID))) {
        return inst;
    }

    inst = this.callNextMethod();

    this.get('instances').atPut(newJID, inst);

    return inst;
});

//  ------------------------------------------------------------------------

TP.xmpp.JID.Type.defineMethod('escapeJID',
function(aJID) {

    /**
     * @name escapeJID
     * @synopsis Escapes the supplied JID according to XEP-106
     * @param {String} aJID The JID to escape.
     * @returns {String} The escaped JID.
     */

    var escapedJID;

    escapedJID = aJID.trim();
    escapedJID = escapedJID.replace(/@/g, '\\40').
                            replace(/ /g, '\\20').
                            replace(/\'/g, '\\27').
                            replace(/\"/g, '\\22').
                            replace(/:/g, '\\3a').
                            replace(/\&/g, '\\26').
                            replace(/\\/g, '\\5c').
                            replace(/\//g, '\\2f').
                            replace(/</g, '\\3c').
                            replace(/>/g, '\\3e');

    return escapedJID;
});

//  ------------------------------------------------------------------------

TP.xmpp.JID.Type.defineMethod('unescapeJID',
function(aJID) {

    /**
     * @name unescapeJID
     * @synopsis Unescapes the supplied JID according to XEP-106
     * @param {String} aJID The JID to unescape.
     * @returns {String} The unescaped JID.
     */

    return aJID.replace(/\\40/g, '@').
                replace(/\\20/g, ' ').
                replace(/\\27/g, '\'').
                replace(/\\22/g, '"').
                replace(/\\3a/g, ':').
                replace(/\\26/g, '&').
                replace(/\\5c/g, '\\').
                replace(/\\2f/g, '/').
                replace(/\\3c/g, '<').
                replace(/\\3e/g, '>');
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the original JID string provided
TP.xmpp.JID.Inst.defineAttribute('jid');

//  the last presence packet received for this JID
TP.xmpp.JID.Inst.defineAttribute('presence');

//  the receiver's roster instance, if any
TP.xmpp.JID.Inst.defineAttribute('roster');

//  the receiver's idle time (as a Date) , if any (idle time is computed
//  from the last 'away', 'extended away', 'do not disturb' or just
//  unavailable presence). If this is null, the JID is available with a
//  presence of 'normal' or 'chat'.
TP.xmpp.JID.Inst.defineAttribute('idleTime');

//  whether or not to ignore remote observers when signaling
TP.xmpp.JID.Inst.defineAttribute('ignoreRemoteObservers');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.JID.Inst.defineMethod('init',
function(aString) {

    /**
     * @name init
     * @synopsis Constructs a new JID instance for use with XMPP connections.
     * @param {String} aString A valid JID: [node@]domain[/resource].
     * @raises TP.sig.InvalidJID
     * @returns {TP.xmpp.JID} 
     */

    this.callNextMethod();

    this.$set('jid', aString);

    //  Make sure to set the 'ignoreRemoteObservers' flag to false. Unless
    //  we're processing the signal ourselves, we'll want the remote
    //  observers to be notified.
    this.set('ignoreRemoteObservers', false);

    this.observe(this, 'TP.sig.XMPPPresenceInput');

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.JID.Inst.defineMethod('addObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @name addObserver
     * @synopsis Adds a local signal observation which is roughly like a DOM
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
     * @todo
     */

    var signals,

        len,
        i,

        signal;

    //  invalid handler, no response can happen
    if (TP.notValid(aHandler)) {
        this.raise('TP.sig.InvalidHandler', arguments);

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
                    arguments,
                    'Improper signal definition.');

        return false;
    }

    len = signals.getSize();
    for (i = 0; i < len; i++) {
        if (TP.isSubtypeOf(signals.at(i).asType(), 'TP.sig.XMPPSignal')) {
            //  One of the signals supplied was a type of TP.sig.XMPPSignal,
            //  so we bail out and don't handle any of them (but we do allow
            //  the notification center to have a crack at them).
            return true;
        }
    }

    //  TODO: Support more than one signal type
    signal = signals.first();

    this.observe(TP.uri('xmpp:' + this.asString() +
                        '?;node=' + signal.getSignalName()),
                    'TP.sig.XMPPPubsubNodeChanged');

    return true;
});

//  ------------------------------------------------------------------------

TP.xmpp.JID.Inst.defineMethod('asJID',
function() {

    /**
     * @name asJID
     * @synopsis Returns the receiver as a TP.xmpp.JID instance.
     * @returns {TP.xmpp.JID} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.JID.Inst.defineMethod('asString',
function(verbose) {

    /**
     * @name asString
     * @synopsis Returns the receiver's JID in string form.
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the TP.xmpp.JID's String representation. This flag is ignored in
     *     this version of this method.
     * @returns {String} The receiver as a String.
     */

    return this.get('jid');
});

//  ------------------------------------------------------------------------

TP.xmpp.JID.Inst.defineMethod('getBareJID',
function() {

    /**
     * @name getBareJID
     * @synopsis Returns the [node@]domain portion of the JID, but no resource
     *     information.
     * @returns {String} 
     */

    var ndx,
        str;

    str = this.get('jid');
    ndx = str.indexOf('/');
    if (ndx !== TP.NOT_FOUND) {
        return str.slice(0, ndx);
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.xmpp.JID.Inst.defineMethod('getDomain',
function() {

    /**
     * @name getDomain
     * @synopsis Returns the domain portion of the JID.
     * @returns {String} 
     */

    var ndx,
        str;

    str = this.get('jid');
    str = str.slice(str.indexOf('@') + 1);

    ndx = str.indexOf('/');
    if (ndx !== TP.NOT_FOUND) {
        return str.slice(0, ndx);
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.xmpp.JID.Inst.defineMethod('getNode',
function() {

    /**
     * @name getNode
     * @synopsis Returns the node (or component name) portion of the JID.
     * @returns {String} 
     */

    var str;

    str = this.get('jid');

    if (str.indexOf('@') === TP.NOT_FOUND) {
        return str;
    }

    return str.slice(0, str.indexOf('@'));
});

//  ------------------------------------------------------------------------

TP.xmpp.JID.Inst.defineMethod('getPresence',
function() {

    /**
     * @name getPresence
     * @synopsis Returns the JID's current presence in TP.sig.XMPPPresence form.
     *     This entity can be queried for type, show, status, etc.
     * @returns {TP.sig.XMPPPresence} The current presence packet instance.
     */

    return this.$get('presence');
});

//  ------------------------------------------------------------------------

TP.xmpp.JID.Inst.defineMethod('getResourcePath',
function() {

    /**
     * @name getResourcePath
     * @synopsis Returns the resource portion of the JID, if available.
     * @returns {String} 
     */

    var ndx,
        str;

    str = this.get('jid');
    str = str.slice(str.indexOf('@') + 1);

    ndx = str.indexOf('/');
    if (ndx !== TP.NOT_FOUND) {
        return str.slice(ndx + 1);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.xmpp.JID.Inst.defineMethod('getRoster',
function() {

    /**
     * @name getRoster
     * @synopsis Returns the TP.xmpp.IqRoster instance for the receiver, if
     *     available. This is typically only available for the current user's
     *     JID(s). JIDs representing roster entries themselves won't have a
     *     roster.
     * @returns {TP.xmpp.IqRoster} 
     */

    return this.$get('roster');
});

//  ------------------------------------------------------------------------

TP.xmpp.JID.Inst.defineMethod('handleXMPPPresenceInput',
function(aSignal) {

    /**
     * @name handleXMPPPresenceInput
     * @synopsis Responds to notification that a presence packet has arrived.
     *     This implementation makes sure that the receiver's presence is
     *     updated with the content of the presence packet.
     * @param {TP.sig.XMPPPresenceInput} aSignal The triggering signal.
     */

    var args,
        node;

    if (TP.notValid(aSignal) || TP.notValid(args = aSignal.getPayload())) {
        TP.ifWarn() ?
            TP.warn('Invalid signal data for TP.sig.XMPPPresence event.',
                    TP.IO_LOG, arguments) : 0;

        return;
    }

    if (TP.notValid(node = args.at('node'))) {
        TP.ifWarn() ?
            TP.warn('Missing stanza data for TP.sig.XMPPPresence event.',
                    TP.IO_LOG, arguments) : 0;

        return;
    }

    this.set('presence', node);

    return;
});

//  ------------------------------------------------------------------------

TP.xmpp.JID.Inst.defineMethod('handleXMPPPubsubNodeChanged',
function(aSignal) {

    /**
     * @name handleXMPPPubsubNodeChanged
     * @synopsis Responds to notification that a pubsub node has changed.
     * @param {TP.sig.XMPPPubsubNodeChanged} aSignal The triggering signal.
     */

    var sigURI,
        sigURIHash,

        sigPayload,

        sig,
        sigName;

    //  First, make sure we can get a signal name
    if (!TP.isURI(sigURI = TP.uc(aSignal.getOrigin()))) {
        return this.raise('TP.sig.InvalidURI', arguments);
    }

    if (TP.notValid(sigURIHash = sigURI.get('queryDict'))) {
        return this.raise('TP.sig.InvalidParameter', arguments);
    }

    if (TP.isEmpty(sigName = sigURIHash.at('node'))) {
        return this.raise('TP.sig.InvalidSignal', arguments);
    }

    //  TP.sig.XMPPPubsubNodeChanged signals always have an Array as their
    //  payload - since there may be more than one 'item' that is being
    //  sent. We only use the first one.
    if (TP.isArray(sigPayload = aSignal.getPayload())) {
        sigPayload = sigPayload.first();

        //  sigPayload is now a native node - need to wrap it into a
        //  TP.xmpp.SignalPayload
        sigPayload = TP.wrap(sigPayload);
    } else {
        sigPayload = null;
    }

    //  !!NOTE!!
    //  We need to set this flag so that in the 'signalObservers()' call
    //  below we don't try to send this event *back* to the XMPP server,
    //  thereby causing a client<->server endless loop. We still do want
    //  local observers in the notification center to get notified,
    //  however.
    this.set('ignoreRemoteObservers', true);

    if (TP.isKindOf(sigPayload, TP.xmpp.SignalPayload)) {
        sig = sigPayload.asTP_sig_Signal();
        sig.fire(this);
    } else {
        this.signal(sigName, arguments);
    }

    //  Unset the flag
    this.set('ignoreRemoteObservers', false);

    return;
});

//  ------------------------------------------------------------------------

TP.xmpp.JID.Inst.defineMethod('isPresent',
function() {

    /**
     * @name isPresent
     * @synopsis Returns true if the receiver's status indicates that it is
     *     present.
     * @returns {Boolean} Whether or not the receiver is present.
     */

    var pres,
        type,
        show;

    //  do we have a presence node? if not then we can assume not online
    if (TP.notValid(pres = this.get('presence'))) {
        return false;
    }

    type = pres.get('type');
    if (type === 'unavailable') {
        return false;
    } else {
        //  type may be 'available' or just be blank, depending on server.
        show = pres.get('show');
        if (TP.notValid(show)) {
            return true;
        }

        return (show === 'chat' || show === 'normal');
    }
});

//  ------------------------------------------------------------------------

TP.xmpp.JID.Inst.defineMethod('removeObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @name removeObserver
     * @synopsis Removes a local signal observation which is roughly like a DOM
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
     * @todo
     */

    var signals,

        len,
        i,

        signal;

    //  invalid handler, no response can happen
    if (TP.notValid(aHandler)) {
        this.raise('TP.sig.InvalidHandler', arguments);

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
                    arguments,
                    'Improper signal definition.');

        return false;
    }

    len = signals.getSize();
    for (i = 0; i < len; i++) {
        if (TP.isSubtypeOf(signals.at(i).asType(), 'TP.sig.XMPPSignal')) {
            //  One of the signals supplied was a type of TP.sig.XMPPSignal,
            //  so we bail out and don't handle any of them (but we do allow
            //  the notification center to have a crack at them).
            return true;
        }
    }

    //  TODO: Support more than one signal type
    signal = signals.first();

    this.ignore(TP.uri('xmpp:' + this.asString() +
                        '?;node=' + signal.getSignalName()),
                    'TP.sig.XMPPPubsubNodeChanged');

    return true;
});

//  ------------------------------------------------------------------------

TP.xmpp.JID.Inst.defineMethod('setPresence',
function(aPresencePacket) {

    /**
     * @name setPresence
     * @synopsis Sets the receiver's presence node to the node provided. This
     *     can then be queried to determine the JID's current availability etc.
     * @returns {TP.xmpp.JID} The receiver.
     */

    if (!TP.isKindOf(aPresencePacket, 'TP.xmpp.Presence')) {
        return this.raise('TP.sig.InvalidXMPPPacket',
                            arguments,
                            aPresencePacket);
    }

    return this.$set('presence', aPresencePacket);
});

//  ------------------------------------------------------------------------

TP.xmpp.JID.Inst.defineMethod('setRoster',
function(aRoster) {

    /**
     * @name setRoster
     * @synopsis Sets the roster instance for the receiver.
     * @param {A} TP.xmpp.IqRoster roster instance representing the JID's
     *     current roster content.
     * @returns {TP.xmpp.JID} The receiver.
     */

    if (!TP.isKindOf(aRoster, 'TP.xmpp.IqRoster')) {
        return this.raise('TP.sig.InvalidParameter', arguments, aRoster);
    }

    return this.$set('roster', aRoster);
});

//  ------------------------------------------------------------------------

TP.xmpp.JID.Inst.defineMethod('signalObservers',
function(anOrigin, aSignal, aContext, aPayload, aPolicy, aType,
isCancelable, isBubbling        ) {

    /**
     * @name signalObservers
     * @synopsis Signals a local signal observation which is roughly like a DOM
     *     element throwing an event. The observer is typically the handler
     *     provided to a signal() call while the signal is a signal or string
     *     which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @param {Object} anOrigin The originator of the signal.
     * @param {String|TP.sig.Signal} aSignal The signal to fire.
     * @param {Context} aContext The originating context.
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
     * @todo
     */

    var signals,

        len,
        i,

        signal,

        sigURI,
        sigInst,
        sigType,
        sigPayload;

    //  If we're ignoring remote observers, there's no sense in going any
    //  further. We do return true, however, so that the notification center
    //  gets a crack at the signal.
    if (TP.isTrue(this.get('ignoreRemoteObservers'))) {
        return true;
    }

    //  invalid payload, no sense in sending the publish
    if (TP.notValid(aPayload)) {
        this.raise('TP.sig.InvalidPayload', arguments);

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
                    arguments,
                    'Improper signal definition.');

        return false;
    }

    len = signals.getSize();
    for (i = 0; i < len; i++) {
        if (TP.isSubtypeOf(signals.at(i).asType(), 'TP.sig.XMPPSignal')) {
            //  One of the signals supplied was a type of TP.sig.XMPPSignal,
            //  so we bail out and don't handle any of them (but we do allow
            //  the notification center to have a crack at them).
            return true;
        }
    }

    //  TODO: Support more than one signal type
    signal = signals.first();

    sigURI = TP.uri('xmpp:' + this.asString() +
                    '?;node=' + signal.getSignalName());

    if (TP.isString(sigInst = signal)) {
        if (TP.isType(sigType = TP.sys.getTypeByName(signal))) {
            sigInst = sigType.construct(aPayload);
            if (TP.isValid(anOrigin)) {
                sigInst.setOrigin(anOrigin);
            }
        }
    }

    if (!TP.isString(sigInst)) {
        //  The payload of the XMPPPubsubNodeChanged signal is the fully
        //  serialized signal that we're signalling.
        sigPayload = TP.xmpp.SignalPayload.fromTP_sig_Signal(sigInst);
    } else {
        sigPayload = TP.xmlnode(aPayload);
    }

    sigURI.signal('TP.sig.XMPPPubsubNodeChanged', arguments, sigPayload);

    //  We never signal the local observers - signalling with us as an
    //  origin is meant to go out over the wire.
    return false;
});

//  ========================================================================
//  TP.xmpp.JID String Extensions
//  ========================================================================

String.Inst.defineMethod('asJID',
function() {

    /**
     * @name asJID
     * @synopsis Returns the receiver as a TP.xmpp.JID instance.
     * @returns {TP.xmpp.JID} 
     */

    return TP.xmpp.JID.construct(this);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
