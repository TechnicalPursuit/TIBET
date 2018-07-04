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
 * @type {TP.xmpp.JID}
 * @summary A XMPP ID (JID) type.
 * @summary The TP.xmpp.JID type provides a central point from which to
 *     manage JID-related information such as roster/presence info etc. It also
 *     provides convenience methods for extraction of various portions of the
 *     JID string for use.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('xmpp.JID');

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
     * @method construct
     * @summary Constructs a new JID instance for use with XMPP connections.
     *     Note that each JID is a singleton relative to that string.
     * @param {String} aString A valid JID: [node@]domain[/resource].
     * @exception TP.sig.InvalidJID
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
        return this.raise('TP.sig.InvalidJID', aString);
    }

    hostInd = aString.lastIndexOf('@');

    /* eslint-disable no-extra-parens */
    //  the @ has to be between two actual values, not at the end
    if (aString.indexOf('@') === 0 ||
        hostInd === (aString.getSize() - 1)) {
        return this.raise('TP.sig.InvalidJID', aString);
    }
    /* eslint-enable no-extra-parens */

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
     * @method escapeJID
     * @summary Escapes the supplied JID according to XEP-106
     * @param {String} aJID The JID to escape.
     * @returns {String} The escaped JID.
     */

    var escapedJID;

    escapedJID = aJID.trim();
    escapedJID = escapedJID.replace(/@/g, '\\40').
                            replace(/ /g, '\\20').
                            replace(/'/g, '\\27').
                            replace(/"/g, '\\22').
                            replace(/:/g, '\\3a').
                            replace(/&/g, '\\26').
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
     * @method unescapeJID
     * @summary Unescapes the supplied JID according to XEP-106
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
     * @method init
     * @summary Constructs a new JID instance for use with XMPP connections.
     * @param {String} aString A valid JID: [node@]domain[/resource].
     * @exception TP.sig.InvalidJID
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
     * @method addObserver
     * @summary Adds a local signal observation which is roughly like a DOM
     *     element adding an event listener. The observer is typically the
     *     handler provided to an observe() call while the signal is a signal or
     *     string which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @param {Object|Object[]} anOrigin One or more origins to observe.
     * @param {Object|Object[]} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as
     *     TP.CAPTURING or a specific function to manage the observe process.
     *     IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to add the observation, false otherwise.
     */

    var signals,

        len,
        i,

        signal;

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
        if (TP.isSubtypeOf(signals.at(i).asType(), 'TP.sig.XMPPSignal')) {
            //  One of the signals supplied was a type of TP.sig.XMPPSignal,
            //  so we bail out and don't handle any of them (but we do allow
            //  the notification center to have a crack at them).
            return true;
        }
    }

    //  TODO: Support more than one signal type
    signal = signals.first();

    this.observe(TP.uc('xmpp:' + this.asString() +
                        '?;node=' + signal.getSignalName()),
                    'TP.sig.XMPPPubsubNodeChange');

    return true;
});

//  ------------------------------------------------------------------------

TP.xmpp.JID.Inst.defineMethod('asJID',
function() {

    /**
     * @method asJID
     * @summary Returns the receiver as a TP.xmpp.JID instance.
     * @returns {TP.xmpp.JID} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.JID.Inst.defineMethod('asString',
function(verbose) {

    /**
     * @method asString
     * @summary Returns the receiver's JID in string form.
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
     * @method getBareJID
     * @summary Returns the [node@]domain portion of the JID, but no resource
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
     * @method getDomain
     * @summary Returns the domain portion of the JID.
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
     * @method getNode
     * @summary Returns the node (or component name) portion of the JID.
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
     * @method getPresence
     * @summary Returns the JID's current presence in TP.sig.XMPPPresence form.
     *     This entity can be queried for type, show, status, etc.
     * @returns {TP.sig.XMPPPresence} The current presence packet instance.
     */

    return this.$get('presence');
});

//  ------------------------------------------------------------------------

TP.xmpp.JID.Inst.defineMethod('getResourcePath',
function() {

    /**
     * @method getResourcePath
     * @summary Returns the resource portion of the JID, if available.
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
     * @method getRoster
     * @summary Returns the TP.xmpp.IqRoster instance for the receiver, if
     *     available. This is typically only available for the current user's
     *     JID(s). JIDs representing roster entries themselves won't have a
     *     roster.
     * @returns {TP.xmpp.IqRoster}
     */

    return this.$get('roster');
});

//  ------------------------------------------------------------------------

TP.xmpp.JID.Inst.defineHandler('XMPPPresenceInput',
function(aSignal) {

    /**
     * @method handleXMPPPresenceInput
     * @summary Responds to notification that a presence packet has arrived.
     *     This implementation makes sure that the receiver's presence is
     *     updated with the content of the presence packet.
     * @param {TP.sig.XMPPPresenceInput} aSignal The triggering signal.
     * @returns {TP.xmpp.JID} The receiver.
     */

    var args,
        node;

    if (TP.notValid(aSignal) || TP.notValid(args = aSignal.getPayload())) {
        TP.ifWarn() ?
            TP.warn('Invalid signal data for TP.sig.XMPPPresence event.',
                    TP.IO_LOG) : 0;

        return this;
    }

    if (TP.notValid(node = args.at('node'))) {
        TP.ifWarn() ?
            TP.warn('Missing stanza data for TP.sig.XMPPPresence event.',
                    TP.IO_LOG) : 0;

        return this;
    }

    this.set('presence', node);

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.JID.Inst.defineHandler('XMPPPubsubNodeChange',
function(aSignal) {

    /**
     * @method handleXMPPPubsubNodeChange
     * @summary Responds to notification that a pubsub node has changed.
     * @param {TP.sig.XMPPPubsubNodeChange} aSignal The triggering signal.
     * @returns {TP.xmpp.JID} The receiver.
     */

    var sigURI,
        sigURIHash,

        sigPayload,

        sig,
        sigName;

    //  First, make sure we can get a signal name
    if (!TP.isURI(sigURI = TP.uc(aSignal.getOrigin()))) {
        return this.raise('TP.sig.InvalidURI');
    }

    if (TP.notValid(sigURIHash = sigURI.get('queryDict'))) {
        return this.raise('TP.sig.InvalidParameter');
    }

    if (TP.isEmpty(sigName = sigURIHash.at('node'))) {
        return this.raise('TP.sig.InvalidSignal');
    }

    //  TP.sig.XMPPPubsubNodeChange signals always have an Array as their
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
        this.signal(sigName);
    }

    //  Unset the flag
    this.set('ignoreRemoteObservers', false);

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.JID.Inst.defineMethod('isPresent',
function() {

    /**
     * @method isPresent
     * @summary Returns true if the receiver's status indicates that it is
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

        /* eslint-disable no-extra-parens */
        return (show === 'chat' || show === 'normal');
        /* eslint-enable no-extra-parens */
    }
});

//  ------------------------------------------------------------------------

TP.xmpp.JID.Inst.defineMethod('removeObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @method removeObserver
     * @summary Removes a local signal observation which is roughly like a DOM
     *     element adding an event listener. The observer is typically the
     *     handler provided to an observe call while the signal is a signal or
     *     string which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @param {Object|Object[]} anOrigin One or more origins to ignore.
     * @param {Object|Object[]} aSignal One or more signals to ignore from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn off observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as
     *     TP.CAPTURING or a specific function to manage the observe process.
     *     IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to remove the observation, false otherwise.
     */

    var signals,

        len,
        i,

        signal;

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
        if (TP.isSubtypeOf(signals.at(i).asType(), 'TP.sig.XMPPSignal')) {
            //  One of the signals supplied was a type of TP.sig.XMPPSignal,
            //  so we bail out and don't handle any of them (but we do allow
            //  the notification center to have a crack at them).
            return true;
        }
    }

    //  TODO: Support more than one signal type
    signal = signals.first();

    this.ignore(TP.uc('xmpp:' + this.asString() +
                        '?;node=' + signal.getSignalName()),
                    'TP.sig.XMPPPubsubNodeChange');

    return true;
});

//  ------------------------------------------------------------------------

TP.xmpp.JID.Inst.defineMethod('setPresence',
function(aPresencePacket) {

    /**
     * @method setPresence
     * @summary Sets the receiver's presence node to the node provided. This
     *     can then be queried to determine the JID's current availability etc.
     * @returns {TP.xmpp.JID} The receiver.
     */

    if (!TP.isKindOf(aPresencePacket, 'TP.xmpp.Presence')) {
        return this.raise('TP.sig.InvalidXMPPPacket',
                            aPresencePacket);
    }

    return this.$set('presence', aPresencePacket);
});

//  ------------------------------------------------------------------------

TP.xmpp.JID.Inst.defineMethod('setRoster',
function(aRoster) {

    /**
     * @method setRoster
     * @summary Sets the roster instance for the receiver.
     * @param {A} TP.xmpp.IqRoster roster instance representing the JID's
     *     current roster content.
     * @returns {TP.xmpp.JID} The receiver.
     */

    if (!TP.isKindOf(aRoster, 'TP.xmpp.IqRoster')) {
        return this.raise('TP.sig.InvalidParameter', aRoster);
    }

    return this.$set('roster', aRoster);
});

//  ------------------------------------------------------------------------

TP.xmpp.JID.Inst.defineMethod('signalObservers',
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
        if (TP.isSubtypeOf(signals.at(i).asType(), 'TP.sig.XMPPSignal')) {
            //  One of the signals supplied was a type of TP.sig.XMPPSignal,
            //  so we bail out and don't handle any of them (but we do allow
            //  the notification center to have a crack at them).
            return true;
        }
    }

    //  TODO: Support more than one signal type
    signal = signals.first();

    sigURI = TP.uc('xmpp:' + this.asString() +
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
        //  The payload of the XMPPPubsubNodeChange signal is the fully
        //  serialized signal that we're signalling.
        sigPayload = TP.xmpp.SignalPayload.fromTP_sig_Signal(sigInst);
    } else {
        sigPayload = TP.xmlnode(aPayload);
    }

    sigURI.signal('TP.sig.XMPPPubsubNodeChange', sigPayload);

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
     * @method asJID
     * @summary Returns the receiver as a TP.xmpp.JID instance.
     * @returns {TP.xmpp.JID}
     */

    return TP.xmpp.JID.construct(this);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
