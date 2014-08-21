//  ========================================================================
/*
NAME:   TIBETNotification.js
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

/*
TIBET's signaling system core.

As mentioned elsewhere, TIBET unifies the event models of the various major
browsers under a DOM Level2 compliant bubbling/capturing mechanism. In
addition to repairing the event dispatch discrepancies, TIBET adds
signaling/notification to the rest of the system so that any object can be a
sender or receiver of events -- and events can be of any form, UI or
otherwise. In fact, events can also be distributed across the wire to
support creation of collaborative web applications. TIBET's
event/signaling system ties directly into the concept of workflow very
quickly, see the workflow module for more information.
*/

/* JSHint checking */

/* global $handled:true,
          $signal:true,
          $signal_stack:true,
          EventSource:false
*/

/* jshint evil:true
*/

//  ========================================================================
//  SIGNALING
//  ========================================================================

/*
Definitions of the core TIBET objects that form the critical elements of the
signaling kernel and the signal inheritance hierarchy others will use.
*/

//  ------------------------------------------------------------------------
//  Signal
//  ------------------------------------------------------------------------

/*
TP.sig.Signal is the core signaling class from which all other signals
derive. As part of the TP.sig.Signal installation we add a new TP.signal()
implementation that is TP.sig.Signal-aware.
*/

TP.lang.Object.defineSubtype('sig:Signal');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  signal phases for DOM 2 simulation
TP.sig.Signal.Type.defineAttribute(
        'phases',
        TP.ac(TP.AT_TARGET, TP.CAPTURING_PHASE, TP.BUBBLING_PHASE));

//  does this signal type bubble? typically only DOM signals do
TP.sig.Signal.Type.defineAttribute('bubbling', false);

//  is this signal type cancelable? typically signals can be stopped
TP.sig.Signal.Type.defineAttribute('cancelable', true);

//  TIBET's default is to work up the tree so specialization works
TP.sig.Signal.Type.defineAttribute('defaultPolicy', TP.DEFAULT_FIRING);

//  is the receiver a signaling root, meaning inheritance traversal stops?
TP.sig.Signal.Type.defineAttribute('signalRoot', null);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sig.Signal.Type.defineMethod('getDefaultPolicy',
function() {

    /**
     * @name getDefaultPolicy
     * @synopsis Returns the default firing policy to use for signals of this
     *     type when no other policy is provided.
     * @returns {String} The firing policy name such as TP.INHERITANCE_FIRING.
     * @todo
     */

    return this.$get('defaultPolicy');
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Type.defineMethod('getHandlerName',
function(anOrigin, wantsFullName, aSignal) {

    /**
     * @name getHandlerName
     * @synopsis Computes and returns the handler name.
     * @param {String} anOrigin An origin global ID that should be used as part
     *     of the handler computation for 'origin targeted' signal handling.
     *     Defaults to the empty String.
     * @param {Boolean} wantsFullName Whether or not to use the signal's 'full
     *     name' when computing the handler name. Defaults to false.
     * @returns {String}
     * @todo
     */

    var origID,

        signame,
        handlerName;

    origID = TP.ifInvalid(anOrigin, '');

    if (TP.isKindOf(aSignal, TP.sig.Signal)) {
        signame = aSignal.getSignalName();
    } else {
        signame = this.getSignalName();
    }

    if (/^TP\.sig\./.test(signame)) {
        if (TP.notTrue(wantsFullName)) {
            handlerName = 'handle' +
                            origID +
                            signame.slice(7).asTitleCase();
        } else {
            handlerName = 'handle' + origID + TP.escapeTypeName(signame);
        }
    } else {
        handlerName = 'handle' +
                        origID +
                        TP.escapeTypeName(signame).asTitleCase();
    }

    return handlerName;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Type.defineMethod('getPhases',
function() {

    /**
     * @name getPhases
     * @synopsis Returns the different phases a signal might be at during
     *     firing. These typically correspond to the DOM phases.
     * @returns {Array}
     */

    return this.phases;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Type.defineMethod('getSignalName',
function() {

    /**
     * @name getSignalName
     * @synopsis Returns the name of the signal. This method is added to the
     *     type to allow the type and instances to work polymorphically in
     *     defining the signal name.
     * @returns {String}
     */

    //  By default, the signal name is the type name
    return this.getName();
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Type.defineMethod('getSignalOwner',
function() {

    /**
     * @name getSignalOwner
     * @synopsis Returns the name of the signal's owner, an object which takes
     *     responsibility for observations of this signal type. Default is null
     *     since most signals aren't "owned".
     * @returns {Object} The receiver's owner.
     * @todo
     */

    return null;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Type.defineMethod('isBubbling',
function() {

    /**
     * @name isBubbling
     * @synopsis Returns true if the signal bubbles. This is typically only used
     *     by signals which use DOM firing policies.
     * @description When a signal isBubbling and it is being fired via a DOM
     *     policy it will not stop TP.AT_TARGET but will continue up through the
     *     parent chain until it reaches the outermost DOM element containing
     *     it. Most signals bubble.
     * @returns {Boolean} True if the signal bubbles during DOM firing.
     */

    return this.$get('bubbling');
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Type.defineMethod('isCancelable',
function() {

    /**
     * @name isCancelable
     * @synopsis Returns true if the signal can be cancelled (i.e. it will
     *     respond to a stopPropagation() message by allowing itself to stop
     *     being sent to qualified handlers.
     * @returns {Boolean} True if the signal can be cancelled.
     */

    return this.$get('cancelable');
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Type.defineMethod('isSignalingRoot',
function(aFlag) {

    /**
     * @name isSignalingRoot
     * @synopsis Combined setter/getter for whether signals of this type form a
     *     local signaling root. When true certain forms of signaling will stop
     *     traversing supertypes and stop with the receiver.
     * @param {Boolean} aFlag
     * @returns {Boolean}
     */

    if (TP.isDefined(aFlag)) {
        this.$set('signalRoot', aFlag);
    }

    return TP.isTrue(this.$get('signalRoot'));
});

//  ------------------------------------------------------------------------

//  TP.sig.Signal is, of course, the root of all signaling types - we don't
//  signal 'above' it in the supertype chain. We've got to do this *after*
//  we define the 'isSignalingRoot' function, though ;-)
TP.sig.Signal.isSignalingRoot(true);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the critical elements needed to define where the signal originated
TP.sig.Signal.Inst.defineAttribute('origin');
TP.sig.Signal.Inst.defineAttribute('context');

//  a handle to the listener node currently being notified by the
//  notification processing for this signal. gives signal handlers a way to
//  access the listener they're being invoked for (when they may be used
//  across multiple handlers)
TP.sig.Signal.Inst.defineAttribute('listener');

//  ignore handlers whose IDs are in this list. this is used to help avoid
//  duplicate notification of registered handlers. a handler can
//  "reregister" for notifications during processing if it needs to be
//  notified for each match that finds it
TP.sig.Signal.Inst.defineAttribute('ignoreList');

//  the current DOM phase, for DOM signaling -- capturing, bubbling, or at
//  target.
TP.sig.Signal.Inst.defineAttribute('phase');

//  actual payload for the signal. for many signals this is the parameter
//  block used by handlers to define how they should response. for things
//  that carry data to/from the server this will also contain the data being
//  transported
TP.sig.Signal.Inst.defineAttribute('payload');

//  flag for reusability of the signal. this starts off false, and is
//  usually cleared by the isRecyclable call when a signal is done firing
TP.sig.Signal.Inst.defineAttribute('recyclable', false);

//  the pseudo-name for this signal, used for handler matching. when this is
//  empty/null it will default to the receiving signal's type name.
TP.sig.Signal.Inst.defineAttribute('signalName');

//  should default processing be prevented? this is used primarily by UI
//  signals but it can also be leveraged by other signal types.
TP.sig.Signal.Inst.defineAttribute('$shouldPrevent', false);

//  has the signal been asked to stop propagation? note that for signals
//  for which isCancelable is false this value is ignored
TP.sig.Signal.Inst.defineAttribute('$shouldStop', false);

//  DOM/UI target
//  TODO:   needed in certain subtype, but declared here for now. perhaps
//  to ensure it's always reachable
TP.sig.Signal.Inst.defineAttribute('target');

//  start time for the initiation of the signal. Typically the fire() time
//  but this can be set directly when signals are being handled manually.
TP.sig.Signal.Inst.defineAttribute('time');

//  total time the signal took to run. typically filled in when signaling
//  and statistics capture is turned on.
TP.sig.Signal.Inst.defineAttribute('elapsed');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('init',
function(aPayload) {

    /**
     * @name init
     * @synopsis Initialize a new signal instance.
     * @param {Object} aPayload A subtype-specific payload/parameter object.
     * @returns {TP.sig.Signal} A new instance.
     */

    //  supertype initialization
    this.callNextMethod();

    //  set the payload so we can extract values as needed
    this.setPayload(aPayload);

    //  can't reuse this one now
    this.recyclable = false;

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('addIfAbsent',
function(anItemOrKey, aValue) {

    /**
     * @name addIfAbsent
     * @synopsis Using the key/value pair provided assign the value to the key
     *     in the receiver if the key doesn't already exist.
     * @param {TPOrderedPair|String} anItemOrKey The ordered pair to add, or the
     *     key for a pair.
     * @param {Object} aValue Optional value to store when the first argument is
     *     a string.
     * @raises TP.sig.InvalidPair
     * @returns {Object} The key's value after processing.
     * @todo
     */

    var key,
        val;

    if (TP.isString(anItemOrKey)) {
        key = anItemOrKey;
        val = aValue;
    } else if (TP.isPair(anItemOrKey)) {
        //  TODO:   hopefully we don't say Hashes are ordered pairs
        key = anItemOrKey.first();
        val = anItemOrKey.last();
    } else {
        return this.raise('TP.sig.InvalidParameter', arguments,
                                'Invalid key or item.');
    }

    if (TP.isDefined(this.at(key))) {
        //  already has a valid value
        return this.at(key);
    }

    //  value doesn't exist yet...
    this.atPut(key, val);

    return this.at(key);
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('asDumpString',
function() {

    /**
     * @name asDumpString
     * @synopsis Returns the receiver as a string suitable for use in log
     *     output.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    var str;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asDumpString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asDumpString = true;

    try {
        str = this.getSignalName() +
                ' :: ' +
                '(' + TP.dump(this.getPayload()) + ')';
    } catch (e) {
        str = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asDumpString;

    return str;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @name asHTMLString
     * @synopsis Produces an HTML string representation of the receiver.
     * @returns {String} The receiver in HTML string format.
     */

    var str;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asHTMLString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asHTMLString = true;

    try {
        str = '<span class="TP_sig_Signal ' +
                TP.escapeTypeName(TP.tname(this)) + '">' +
                    '<span data-name="payload">' +
                        TP.htmlstr(this.getPayload()) +
                     '<\/span>' +
                 '<\/span>';
    } catch (e) {
        str = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asHTMLString;

    return str;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @name asJSONSource
     * @synopsis Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    var str;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asJSONSource) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asJSONSource = true;

    try {
        str = '{"type":' + this.getTypeName().quoted('"') + ',' +
                '"data":{"signame":' + this.getSignalName().quoted('"') + ',' +
                '"payload":' + TP.json(this.getPayload()) + '}}';
    } catch (e) {
        str = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asJSONSource;

    return str;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @name asPrettyString
     * @synopsis Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    var str;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asPrettyString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asPrettyString = true;

    try {
        str = '<dl class="pretty ' + TP.escapeTypeName(TP.tname(this)) + '">' +
                    '<dt>Type name<\/dt>' +
                    '<dd class="pretty typename">' +
                        this.getTypeName() +
                    '<\/dd>' +
                    TP.pretty(this.getPayload()) +
                    '<\/dl>';
    } catch (e) {
        str = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asPrettyString;

    return str;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('asString',
function(verbose) {

    /**
     * @name asString
     * @synopsis Returns the receiver as a string.
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the TP.sig.Signal's String representation. The default is true.
     * @returns {String} The receiver as a String.
     */

    var wantsVerbose,

        str;

    wantsVerbose = TP.ifInvalid(verbose, true);
    if (!wantsVerbose) {
        return this.getSignalName() + TP.OID_PREFIX +
                this.toString().split(TP.OID_PREFIX).last();
    }

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asString = true;

    //  NB: We force the TP.str() rep of the payload to be verbose.
    try {
        str = this.getSignalName() +
                ' :: ' +
                '(' + TP.str(this.getPayload(), true) + ')';
    } catch (e) {
        str = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asString;

    return str;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('asSource',
function() {

    /**
     * @name asSource
     * @synopsis Returns the receiver as a TIBET source code string.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    var payload,
        str,

        keys;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asSource) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asSource = true;

    try {
        if (TP.isDefined(payload = this.getPayload())) {
            str = this.getTypeName() + '.construct(' + TP.src(payload) + ')';
        } else {
            str = this.getTypeName() + '.construct()';
        }

        //  Make sure to remove the 'payload' key since we already use the
        //  payload in the constructor.
        keys = this.getUniqueValueKeys();
        keys.remove('payload');

        str += this.$generateSourceSets(keys);
    } catch (e) {
        str = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asSource;

    return str;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('asXMLString',
function() {

    /**
     * @name asXMLString
     * @synopsis Produces an XML string representation of the receiver.
     * @returns {String} The receiver in XML string format.
     */

    var str;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asXMLString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asXMLString = true;

    try {
        str = '<instance type="' + TP.tname(this) + '">' +
                    '<payload>' +
                        TP.xmlstr(this.getPayload()) +
                     '<\/payload>' +
                 '<\/instance>';
    } catch (e) {
        str = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asXMLString;

    return str;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('at',
function(aKey) {

    /**
     * @name at
     * @synopsis Returns the value of the named parameter from the receiver's
     *     payload/parameter object. This is the proper way to access the
     *     content of the signal in terms of its control parameters. Don't use
     *     set() to manage parameter data.
     * @param {String} aKey The name/key of the parameter to return.
     * @returns {Object} The value of the parameter registered under aKey.
     */

    var payload;

    payload = this.getPayload();
    if (TP.isValid(payload)) {
        if (TP.canInvoke(payload, 'at')) {
            return payload.at(aKey);
        } else if (TP.canInvoke(payload, 'get')) {
            return payload.get(aKey);
        } else {
            //  If at() and get() don't work, try direct slot access
            try {
                return payload[aKey];
            } catch (e) {
            }
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('atIfInvalid',
function(anIndex, aDefault) {

    /**
     * @name atIfInvalid
     * @synopsis Returns the value at the index provided or the default value if
     *     the key returns null or undefined.
     * @param {Object} anIndex The index of the value to return.
     * @param {Object} aDefault The default value to return if invalid.
     * @returns {Object} The element at anIndex in this collection.
     * @todo
     */

    var value;

    if (TP.isValid(value = this.at(anIndex))) {
        return value;
    } else if (TP.isCallable(aDefault)) {
        return aDefault();
    } else {
        return aDefault;
    }
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('atIfNull',
function(anIndex, aDefault) {

    /**
     * @name atIfNull
     * @synopsis Returns the value at the index provided or the default value if
     *     the key returns specifically null.
     * @param {Object} anIndex The index of the value to return.
     * @param {Object} aDefault The default value to return if null.
     * @returns {Object} The element at anIndex in this collection.
     * @todo
     */

    var value;

    if (TP.notNull(value = this.at(anIndex))) {
        return value;
    } else if (TP.isCallable(aDefault)) {
        return aDefault();
    } else {
        return aDefault;
    }
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('atIfUndefined',
function(anIndex, aDefault) {

    /**
     * @name atIfUndefined
     * @synopsis Returns the value at the index provided or the default value if
     *     the key returns specifically undefined.
     * @param {Object} anIndex The index of the value to return.
     * @param {Object} aDefault The default value to return if undefined.
     * @returns {Object} The element at anIndex in this collection.
     * @todo
     */

    var value;

    if (TP.isDefined(value = this.at(anIndex))) {
        return value;
    } else if (TP.isCallable(aDefault)) {
        return aDefault();
    } else {
        return aDefault;
    }
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('atPut',
function(aKey, aValue) {

    /**
     * @name atPut
     * @synopsis Defines a key/value pair in the receiver's payload, provided
     *     that the payload is empty and can be constructed, or that it can
     *     handle an atPut operation. This is the preferred way of manipulating
     *     the content of the signal in terms of its control parameters.
     * @description Note that this method does not signal 'Change', even if it's
     *     'shouldSignalChange' attribute is true. Observe the payload for
     *     change notification.
     * @param {String} aKey The key for the parameter.
     * @param {Object} aValue The value for the parameter.
     * @returns {TP.sig.Signal} The receiver.
     */

    var payload;

    payload = this.getPayload();
    if (TP.notValid(payload)) {
        this.set('payload', TP.hc(aKey, aValue));

        return this;
    }

    if (TP.canInvoke(payload, 'atPut')) {
        payload.atPut(aKey, aValue);

        return this;
    }

    if (TP.canInvoke(payload, 'set')) {
        payload.set(aKey, aValue);

        return this;
    }

    try {
        payload[aKey] = aValue;

        return this;
    } catch (e) {
    }

    this.raise('TP.sig.InvalidPayload', arguments,
                    'Unable to set payload parameter: ' + aKey);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('atPutIfAbsent',
function(aKey, aValue) {

    /**
     * @name atPutIfAbsent
     * @synopsis Defines a key/value pair in the receiver's payload, provided
     *     that the payload does not already contain a value for the key in
     *     question.
     * @description Note that this method does not signal 'Change', even if it's
     *     'shouldSignalChange' attribute is true. Observe the payload for
     *     change notification.
     * @param {String} aKey The key for the parameter.
     * @param {Object} aValue The value for the parameter.
     * @returns {Object} The key's value after processing.
     * @todo
     */

    var payload,
        val;

    payload = this.getPayload();
    if (TP.notValid(payload)) {
        this.set('payload', TP.hc(aKey, aValue));

        return aValue;
    }

    //  hashes can manage this for us themselves
    if (TP.canInvoke(payload, 'atPutIfAbsent')) {
        return payload.atPutIfAbsent(aKey, aValue);
    }

    if (TP.notDefined(val = this.at(aKey))) {
        this.atPut(aKey, aValue);

        return aValue;
    }

    return val;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('clearIgnores',
function() {

    /**
     * @name clearIgnores
     * @synopsis Clears any ignored handlers from the receiver's list so that
     *     all handlers are "renewed". Ignores allow a handler to be invoked
     *     once even if it's been registered multiple times. Clearing them means
     *     the same handler can be reinvoked.
     * @returns {TP.sig.Signal} The receiver.
     */

    var skips;

    //  empty so when reusing a signal instance we can reuse the list too
    if (TP.isValid(skips = this.get('ignoreList'))) {
        skips.empty();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('computeSignalName',
function() {

    /**
     * @name computeSignalName
     * @synopsis Computes the signal name. By default, this is the receiver's
     *     type name.
     * @returns {String} The signal name of the receiver.
     * @todo
     */

    return this.getTypeName();
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('copy',
function() {

    /**
     * @name copy
     * @synopsis Returns a 'copy' of the receiver. Actually, a new instance
     *     whose value is equalTo that of the receiver.
     * @returns {TP.sig.Signal} A shallow copy of the receiver.
     */

    var newinst;

    newinst = this.getType().construct();

    newinst.origin = this.origin;
    newinst.context = this.context;

    newinst.listener = this.listener;

    newinst.ignoreList = this.ignoreList;

    newinst.phase = this.phase;

    newinst.payload = this.payload;

    newinst.recyclable = this.recyclable;

    newinst.signalName = this.signalName;

    newinst.$shouldPrevent = this.$shouldPrevent;
    newinst.$shouldStop = this.$shouldStop;

    newinst.target = this.target;
    newinst.time = this.time;

    return newinst;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('fire',
function(anOrigin, aPayload, aPolicy) {

    /**
     * @name fire
     * @synopsis Activates the signal instance via the policy specified. The
     *     signal should have been fully configured prior to invocation of this
     *     method.
     * @param {Object} anOrigin Optional origin for this call.
     * @param {Array} aPayload Optional signal arguments.
     * @param {Function} aPolicy A firing policy function.
     * @returns {TP.sig.Signal} The signal.
     * @todo
     */

    var origin;

    //  allow refiring of signals
    this.stopPropagation(false);

    //  don't prevent default unless told (again)
    this.preventDefault(false);

    //  default our origin to self, which is part of what makes "fire"
    //  different from simple signaling
    origin = TP.ifInvalid(anOrigin, this);
    this.setOrigin(origin);

    //  instrument with current firing time
    this.$set('time', Date.now());

    //  if the signal has an origin fire from there, otherwise the
    //  signal itself will be the origin
    return TP.signal(this.getOrigin(), this, arguments, aPayload, aPolicy);
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getActiveTime',
function() {

    /**
     * @name getActiveTime
     * @synopsis Returns the active time from fire() to the current time in
     *     milliseconds.
     * @returns {Number} The active time of the receiver.
     */

    var time;

    if (TP.isNumber(time = this.$get('time'))) {
        return Date.now() - time;
    }

    return NaN;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getContext',
function() {

    /**
     * @name getContext
     * @synopsis Returns a handle to the context in which the signal originated.
     * @returns {Function} The Function context of the receiver.
     */

    return this.context;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getDocument',
function() {

    /**
     * @name getDocument
     * @synopsis Returns the document from which the signal originated. This is
     *     typically the TIBET window's document, but it can vary when UI events
     *     are involved.
     * @returns {Document} The document that the signal originated in.
     */

    return this.getWindow().document;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getElapsedTime',
function() {

    /**
     * @name getElapsedTime
     * @synopsis Returns the total elapsed time from fire() to completion. When
     *     the signal is not done being processed this method returns NaN.
     * @returns {Number} The elapsed time of the receiver.
     */

    return this.$get('elapsed') || NaN;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getOrigin',
function() {

    /**
     * @name getOrigin
     * @synopsis Returns the origin of the signal.
     * @returns {Object} The origin of the receiver.
     */

    return this.origin;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getParameters',
function() {

    /**
     * @name getParameters
     * @synopsis Returns the signal's parameters, which are typically encoded in
     *     the receiver's payload. The semantics of this call are slightly
     *     different however, only returning the payload when it implements the
     *     at/atPut methods. You should not manipulate this hash to set
     *     properties since it isn't guaranteed to not be a copy or temporary
     *     empty result set.
     * @returns {TP.lang.Hash|TP.sig.Request} Parameter data (typically).
     */

    var params;

    params = this.getPayload();
    if (TP.isValid(params)) {
        if (TP.canInvoke(params, TP.ac('at', 'atPut'))) {
            return params;
        }
    }

    //  empty, but not associated
    return TP.hc();
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getPayload',
function() {

    /**
     * @name getPayload
     * @synopsis Returns the optional arguments to the signal.
     * @returns {Object} The payload of the receiver.
     * @todo
     */

    return this.payload;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getPhase',
function() {

    /**
     * @name getPhase
     * @synopsis Returns the currently executing phase of the signal.
     * @returns {String} The currently executing phase of the receiver.
     */

    return this.phase;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getProperty',
function(attributeName) {

    /**
     * @name getProperty
     * @synopsis Returns the value, if any, for the attribute provided.
     * @description This method takes over when get() fails to find a specific
     *     getter or an aspect adapted getter. For signals we vary the default
     *     implementation in that no inferencing or backstop invocation occurs
     *     when attempting to look up values. If the receiver doesn't have the
     *     method or attribute processing stops there.
     * @param {String} attributeName The name of the attribute to get.
     * @returns {Object} The value of the named property in the receiver.
     * @todo
     */

    //  note no inferencing checks, we just go after the slot here. this is
    //  done so that queries against signals (which may quite often not have
    //  a particular property the handler/responder is testing for) don't
    //  trigger the inferencing engine
    return this.$get(attributeName);
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getRequestID',
function() {

    /**
     * @name getRequestID
     * @synopsis A synonymn for getOrigin for non-request/response signal types.
     *     Provided to ensure polymorphic support for workflow signal
     *     processing.
     * @returns {Object} The request ID of the receiver.
     */

    return this.origin;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getSignalName',
function() {

    /**
     * @name getSignalName
     * @synopsis Returns the signal name. This corresponds most often to the
     *     Signal's type name.
     * @returns {String} The signal name of the receiver.
     */

    var signame;

    if (!TP.isString(signame = this.$get('signalName'))) {
        signame = this.computeSignalName();
        this.$set('signalName', signame, false);
    }

    return signame;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getSignalNames',
function() {

    /**
     * @name getSignalNames
     * @synopsis Returns the all of the receiver's 'signal names' - that is,
     *     each supertype signal name *and* the receiver's direct *signal* name.
     * @description Note that this method is different than
     *     'getTypeSignalNames()' below in that this method will always use the
     *     signal name, even for the receiving type - which for a spoofed signal
     *     will be different than its type name.
     * @returns {Array} An Array of signal names.
     * @todo
     */

    var names;

    //  We do this a bit different than just getting the types Array and
    //  getting the signal names of each type because of 'signal name
    //  spoofing'. This instance may have a different signal name than its
    //  type name because its being spoofed. So, we get the supertype signal
    //  names and then unshift our *signal name* onto the front of it.

    names = this.getSupertypeSignalNames();
    names.unshift(this.getSignalName());

    return names;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getSupertypeSignalNames',
function() {

    /**
     * @name getSupertypeSignalNames
     * @synopsis Returns the 'supertypes signal names' - that is, each supertype
     *     name encoded as a signal name.
     * @returns {Array} An Array of supertype signal names.
     * @todo
     */

    var types,
        signames;

    //  Make sure to copy the supertype Array - we're doing a convert
    //  below.
    types = this.getType().getSupertypes().copy();

    signames = types.collect(
                function(aType) {

                    return aType.getSignalName();
                });

    //  Slice off any type names above 'TP.sig.signal' in the inheritance
    //  hierarchy.
    signames = signames.slice(0, signames.getPosition('TP.sig.Signal') + 1);

    return signames;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getSignalOrigin',
function() {

    /**
     * @name getSignalOrigin
     * @synopsis Returns the origin of the signal. This is an alias for
     *     getOrigin to maintain API symmetry with getSignalName.
     * @returns {String} The signal origin of the receiver.
     */

    return this.getOrigin();
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getTarget',
function() {

    /**
     * @name getTarget
     * @synopsis Returns the target of the signal. For most events this is the
     *     origin _object_, but for DOM events, particularly those with a native
     *     event component, this will be the element.
     * @returns {Object} The target of the receiver.
     */

    var payload,
        inst,
        id;

    //  DOM-based signals, which are the most common consumers of a
    //  "target", are usually provided either the original event or a
    //  hash with specific keys

    payload = this.getPayload();

    if (TP.isEvent(payload)) {
        if (TP.isValid(payload.tibetTarget)) {
            inst = payload.tibetTarget;
        } else if (TP.isElement(payload.srcElement)) {
            inst = payload.srcElement;
        } else {
            inst = payload.target;
        }
    } else if (TP.isElement(payload)) {
        inst = payload;
    } else if (TP.canInvoke(payload, 'at')) {
        if (TP.isEmpty(inst = payload.at('tibetTarget'))) {
            id = payload.at('elementGlobalID');
            if (TP.notEmpty(id)) {
                if (TP.isValid(inst = TP.byOID(id))) {
                    if (TP.canInvoke(inst, 'getNativeNode')) {
                        inst = inst.getNativeNode();
                    }
                }
            } else {
                inst = payload.at('target');
            }
        }
    } else if (TP.isValid(inst = TP.byOID(this.getOrigin()))) {
        if (TP.canInvoke(inst, 'getNativeNode')) {
            inst = inst.getNativeNode();
        }
    }

    return inst;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getTargetGlobalID',
function() {

    /**
     * @name getTargetGlobalID
     * @synopsis Returns the target of the signal. For most events this is the
     *     same as the origin, but for DOM events, particularly those with a
     *     native event component, this will often be the global ID of the
     *     targeted element
     * @returns {String} The 'global ID' of the target of the receiver.
     */

    var payload,
        id,
        inst;

    //  fast approach is to use the data in any event/hash with the payload
    payload = this.getPayload();

    if (TP.isEvent(payload)) {
        //  events we've instrumented will have the id, otherwise we can
        //  work from the target to get its ID
        id = payload.elementGlobalID;
        if (TP.isEmpty(id)) {
            inst = payload.srcElement || payload.target;
            id = TP.gid(inst);
        }
    } else if (TP.isElement(payload)) {
        //  element payloads we can leverage an ID from
        id = TP.gid(payload);
    } else if (TP.canInvoke(payload, 'at')) {
        //  if we got a hash we can ask it
        id = payload.at('elementGlobalID');
    }

    if (TP.notEmpty(id)) {
        return id;
    }

    return this.getOrigin();
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getTargetLocalID',
function() {

    /**
     * @name getTargetLocalID
     * @synopsis Returns the target ID of the signal. For most events this is
     *     the same as the origin ID, but for DOM events, particularly those
     *     with a native event component, this will often be the local ID of the
     *     targeted element.
     * @returns {String} The 'local ID' of the target of the receiver.
     */

    var payload,
        id,
        inst;

    //  fast approach is to use the data in any event/hash with the payload
    payload = this.getPayload();

    if (TP.isEvent(payload)) {
        //  events we've instrumented will have the id, otherwise we can
        //  work from the target to get its ID
        id = payload.elementLocalID;
        if (TP.isEmpty(id)) {
            inst = payload.srcElement || payload.target;
            id = TP.lid(inst);
        }
    } else if (TP.isElement(payload)) {
        //  element payloads we can leverage an ID from
        id = TP.lid(payload);
    } else if (TP.canInvoke(payload, 'at')) {
        //  if we got a hash we can ask it
        id = payload.at('elementLocalID');
    }

    if (TP.notEmpty(id)) {
        return id;
    }

    return this.getOrigin();
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getTypeSignalNames',
function() {

    /**
     * @name getTypeSignalNames
     * @synopsis Returns the 'types signal names' - that is, each supertype
     *     signal name *and* the receiver's direct type signal name.
     * @description Note that this method is different than 'getSignalNames()'
     *     above in that this method will always use the type name as converted
     *     to a signal name, even for the receiving type - which for a spoofed
     *     signal will be different than its signal name.
     * @returns {Array} An Array of type signal names.
     * @todo
     */

    var types,
        signames;

    //  Make sure to copy the Array - we're doing a convert below.
    types = this.getType().getTypes().copy();

    signames = types.collect(
                function(aType) {

                    return aType.getSignalName();
                });

    //  Slice off any type names above 'TP.sig.signal' in the inheritance
    //  hierarchy.
    signames = signames.slice(0, signames.getPosition('TP.sig.Signal') + 1);

    return signames;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getWindow',
function() {

    /**
     * @name getWindow
     * @synopsis Returns the window from which the signal originated. This is
     *     typically the TIBET window, but it can vary when UI events are
     *     involved.
     * @returns {Window} The native window object that the receiver occurred in.
     */

    var payload,
        canvasWin;

    payload = this.getPayload();

    if (TP.isEvent(payload)) {
        return TP.ifInvalid(payload.view, TP.sys.getUICanvas(true));
    }

    if (TP.canInvoke(payload, 'at')) {
        return TP.ifInvalid(payload.at('view'), TP.sys.getUICanvas(true));
    }

    //  We didn't get a valid signal payload object, but we can try to use
    //  the UICanvas's window anyway.
    if (TP.isWindow(canvasWin = TP.sys.getUICanvas(true))) {
        return canvasWin;
    }

    //  Can't do any good here. No payload and no canvas window. Just
    //  hand back the 'tibet' window.
    return window;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('ignoreHandler',
function(aHandler) {

    /**
     * @name ignoreHandler
     * @synopsis Tells the signal instance to ignore a specific handler ID. This
     *     can be called on the signal instance at any time, but is typically
     *     called by the signaling system to avoid duplicate notifications
     *     during DOM traversals.
     * @param {String|Object} aHandler The handler or handler ID to ignore for a
     *     particular signaling sequence.
     */

    var handler,
        skips;

    if (TP.notValid(aHandler)) {
        return;
    }

    handler = aHandler.getID();

    if (TP.notValid(skips = this.$get('ignoreList'))) {
        skips = TP.hc();
        this.$set('ignoreList', skips, false);
    }

    return skips.atPut(handler, true);
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('isBubbling',
function() {

    /**
     * @name isBubbling
     * @synopsis Returns true if the signal bubbles. This is typically only used
     *     by signals which use DOM firing policies.
     * @description When a signal isBubbling and it is being fired via a DOM
     *     policy it will not stop TP.AT_TARGET but will continue up through the
     *     parent chain until it reaches the outermost DOM element containing
     *     it. Most signals bubble.
     * @returns {Boolean} True if the signal bubbles during DOM firing.
     */

    var flag;

    if (TP.notEmpty(flag = this.$get('bubbling'))) {
        return flag;
    }

    return this.getType().isBubbling();
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('isCancelable',
function() {

    /**
     * @name isCancelable
     * @synopsis Returns true if the signal can be cancelled (i.e. it will
     *     respond to a stopPropagation() message by allowing itself to stop
     *     being sent to qualified handlers.
     * @returns {Boolean} True if the signal can be cancelled.
     */

    var flag;

    if (TP.notEmpty(flag = this.$get('cancelable'))) {
        return flag;
    }

    return this.getType().isCancelable();
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('isIgnoring',
function(aHandler) {

    /**
     * @name isIgnoring
     * @synopsis Returns true if the signal should skip over notification of the
     *     handler ID provided. This method works along with the ignoreHandler()
     *     method to let the signaling system support turning off multiple
     *     notifications to a handler of a particular signal instance.
     * @param {String|Object} aHandler A handler whose ID will be checked
     *     against the ignore list for this instance.
     * @returns {Boolean} True if the signal should not be presented to the
     *     handler for processing.
     */

    var skips;

    if (TP.notValid(skips = this.get('ignoreList'))) {
        return false;
    }

    if (TP.notValid(aHandler)) {
        return true;
    }

    return TP.isTrue(skips.at(aHandler.getID()));
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('isRecyclable',
function(aFlag) {

    /**
     * @name isRecyclable
     * @synopsis Returns true if the signal can be recycled.
     * @param {Boolean} aFlag A new setting. Optional.
     * @returns {Boolean} True if the signal can be recycled.
     * @todo
     */

    if (TP.isBoolean(aFlag)) {
        this.$set('recyclable', aFlag);
    }

    return TP.isTrue(this.$get('recyclable'));
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('isSignalingRoot',
function(aFlag) {

    /**
     * @name isSignalingRoot
     * @synopsis Combined setter/getter for whether signals of this type form a
     *     local signaling root. When true certain forms of signaling will stop
     *     traversing supertypes and stop with the receiver.
     * @param {Boolean} aFlag
     * @returns {Boolean} Whether or not the receiver can be considered a
     *     'signaling root'.
     */

    var sigType;

    sigType = TP.sig.SignalMap.$getSignalType(this, this.getType());

    if (!TP.isType(sigType)) {
        sigType = TP.sys.getTypeByName(sigType);
    }

    if (!TP.isType(sigType)) {
        sigType = this.getType();
    }

    return sigType.isSignalingRoot(aFlag);
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('isSpoofed',
function() {

    /**
     * @name isSpoofed
     * @synopsis Returns true if the signal is 'spoofed' - that is, it has a
     *     custom signal name different from its type name.
     * @returns {Boolean} True if the signal is spoofed.
     */

    return this.getTypeName() !== this.getSignalName();
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('preventDefault',
function(aFlag) {

    /**
     * @name preventDefault
     * @synopsis Tells a potential handler to not perform whatever default
     *     action it might perform.
     * @description Note that this method does not signal 'Change', even if it's
     *     'shouldSignalChange' attribute is true.
     * @param {Boolean} aFlag Prevent default: yes or no?
     * @returns {Boolean} True if the signal should not perform its default
     *     action.
     * @todo
     */

    var flag;

    flag = TP.ifInvalid(aFlag, true);

    return this.shouldPrevent(flag);
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('release',
function() {

    /**
     * @name release
     * @synopsis Clears the receiver's recyclable flag, allowing it to be
     *     reused.
     * @returns {TP.sig.Signal} The receiver.
     */

    this.recyclable = true;

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('recycle',
function() {

    /**
     * @name recycle
     * @synopsis Prepares the receiver for a new usage cycle.
     * @returns {TP.sig.Signal} The receiver.
     */

    this.origin = null;
    this.context = null;

    this.listener = null;

    this.ignoreList = null;

    this.phase = null;

    this.payload = null;

    this.recyclable = false;

    this.signalName = null;

    this.$shouldPrevent = false;
    this.$shouldStop = false;

    this.target = null;
    this.time = null;

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('renewHandler',
function(aHandler) {

    /**
     * @name renewHandler
     * @synopsis Tells the signal instance to reset a specific handler ID so
     *     that the handler can be told multiple times about a single signal
     *     instance. Usually invoked by the handler itself so it can be invoked
     *     multiple times.
     * @param {String|Object} aHandler The handler or handler ID to ignore for a
     *     particular signaling sequence.
     */

    var handler,
        skips;

    if (TP.notValid(aHandler)) {
        return;
    }

    handler = aHandler.getID();

    if (TP.notValid(skips = this.$get('ignoreList'))) {
        return;
    }

    //  any non-true value should work here
    return skips.atPut(handler, false);
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('setContext',
function(aContext) {

    /**
     * @name setContext
     * @synopsis Sets the originating context of the signal.
     * @description Note that this method does not signal 'Change', even if it's
     *     'shouldSignalChange' attribute is true.
     * @param {Function|Context} aContext The calling context.
     * @returns {TP.sig.Signal} The receiver.
     */

    this.context = aContext;

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('setOrigin',
function(anOrigin) {

    /**
     * @name setOrigin
     * @synopsis Sets the origin of the signal.
     * @description Note that this method does not signal 'Change', even if it's
     *     'shouldSignalChange' attribute is true.
     * @param {Object} anOrigin The originating object.
     * @returns {TP.sig.Signal} The receiver.
     */

    //  If the origin is a String, make sure it gets converted to a primitive
    //  string before being used
    if (TP.isString(anOrigin)) {
        this.origin = anOrigin.valueOf();
    } else {
        this.origin = anOrigin;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('setPayload',
function(anObject) {

    /**
     * @name setPayload
     * @synopsis Sets the payload/parameter object of the signal.
     * @description Note that this method does not signal 'Change', even if it's
     *     'shouldSignalChange' attribute is true.
     * @param {Object} anObject The optional signal payload.
     * @returns {TP.sig.Signal} The receiver.
     */

    this.payload = anObject;

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('setPhase',
function(aPhase) {

    /**
     * @name setPhase
     * @synopsis Sets the phase of the signal.
     * @description Note that this method does not signal 'Change', even if it's
     *     'shouldSignalChange' attribute is true.
     * @param {String} aPhase The current dispatch phase.
     * @returns {TP.sig.Signal} The receiver.
     */

    this.phase = aPhase;

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('setSignalName',
function(aSignalName, clearIgnores) {

    /**
     * @name setSignalName
     * @synopsis Defines the name of the signal.
     * @description By default a signal's name matches its type, but to support
     *     lightweight signals whose only differentiation is their name we allow
     *     TP.sig.Signal and other subtypes to stand in for a subtype simply by
     *     changing their names. An additional side-effect of this call is that
     *     any previous ignore list is cleared since the instance's name, and
     *     hence the handlers being invoked, could change.
     * @param {String} aSignalName The name this instance should report as being
     *     its signal name.
     * @param {Boolean} clearIgnores Whether or not to 'clear' any 'ignore's
     *     that the instance may have. This is true by default.
     * @returns {TP.sig.Signal} The receiver.
     */

    this.$set('signalName', aSignalName);

    if (TP.isFalse(clearIgnores)) {
        //  reset processing controls so execution can happen under new name
        this.clearIgnores();
    }

    this.shouldPrevent(false);
    this.shouldStop(false);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('shouldLog',
function() {

    /**
     * @name shouldLog
     * @synopsis Returns true when the signal can be logged during signal
     *     processing. The default is true for most signals, but many types of
     *     signals have to check TIBET configuration flags to see if they can
     *     currently be logged.
     * @returns {Boolean} True if the signal can be logged.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('shouldPrevent',
function(aFlag) {

    /**
     * @name shouldPrevent
     * @synopsis Returns true if the signal handler(s) should not perform the
     *     default action. If a flag is provided this flag is used to set the
     *     prevent status.
     * @description Note that this method does not signal 'Change', even if it's
     *     'shouldSignalChange' attribute is true.
     * @param {Boolean} aFlag Prevent default: yes or no?
     * @returns {Boolean} True if the signal should not perform its default
     *     action.
     * @todo
     */

    if (TP.isDefined(aFlag)) {
        this.$shouldPrevent = aFlag;
    }

    return this.$shouldPrevent;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('shouldStop',
function(aFlag) {

    /**
     * @name shouldStop
     * @synopsis Returns true if the signal should stop propagating. If a flag
     *     is provided this flag is used to set the propagation status.
     * @description Note that this method does not signal 'Change', even if it's
     *     'shouldSignalChange' attribute is true.
     * @param {Boolean} aFlag Stop propagating: yes or no?
     * @returns {Boolean} True if the signal should stop propagation.
     */

    //  if we're not cancelable this is a no-op
    if (!this.isCancelable()) {
        return false;
    }

    if (TP.isDefined(aFlag)) {
        this.$shouldStop = aFlag;
    }

    return this.$shouldStop;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('stopPropagation',
function(aFlag) {

    /**
     * @name stopPropagation
     * @synopsis Tells the signal to stop propagation -- subject to the
     *     observance of this property by the various firing policies and
     *     whether the receiver isCancelable()
     * @description Note that this method does not signal 'Change', even if it's
     *     'shouldSignalChange' attribute is true.
     * @param {Boolean} aFlag Stop propagating: yes or no?
     * @returns {Boolean} True if the signal should stop propagation.
     */

    var flag;

    flag = TP.ifInvalid(aFlag, true);

    return this.shouldStop(flag);
});

//  ------------------------------------------------------------------------
//  Exception
//  ------------------------------------------------------------------------

/*
Note that in TIBET, exceptions are just signals. This means they can be
observed by logs, by handlers, etc. It also means that they can be resolved
such that processing may continue, or the handler can terminate the
application if it so desires. This chaining is orthagonal to the try/catch
mechanism in JS so you can leverage either one, or both.

Exceptions form a hierarchy. Given that observation in TIBET is capable of
respecting such hierarchies you can observe at whatever level of granularity
you like. For example, an observation of Exception will cause you to be
notified of all exception subtypes. Observing TP.sig.IOException will get
you only TP.sig.IOException notifcations from whatever origins you define.
In this sense the system operates much like catch blocks in Java or other
languages, triggering your handler block when it matches the type, or a
subtype, of what you desire.
*/

//  ------------------------------------------------------------------------

//  root of exception/error tree
TP.sig.Signal.defineSubtype('Exception');

TP.sig.Exception.isSignalingRoot(true);

//  ------------------------------------------------------------------------

TP.definePrimitive('ec',
function(anError, aMessage) {

    /**
     * @name ec
     * @synopsis Constructs a new TP.sig.Exception using anError as the key
     *     element of the payload. An optional message augmenting the Error's
     *     native message can also be provided.
     * @param {Error} anError The Error object to use as the key element of the
     *     payload.
     * @param {String} aMessage The message to use as the message of the
     *     TP.sig.Exception. If this message is empty, the message from the
     *     Error object is used.
     * @todo
     */

    var msg;

    msg = TP.isEmpty(aMessage) ? anError.message : aMessage;

    return TP.sig.Exception.construct(TP.hc('object', anError,
                                            'message', msg));
});

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.Exception.Type.defineAttribute('$level', TP.ERROR);

TP.sig.Exception.Type.defineAttribute('defaultPolicy', TP.EXCEPTION_FIRING);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sig.Exception.Type.defineMethod('getLevel',
function() {

    /**
     * @name getLevel
     * @synopsis Returns the severity level associated with this type.
     * @returns {Number} The type's severity level.
     */

    return this.$get('$level');
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.Exception.Inst.defineMethod('asSource',
function() {

    /**
     * @name asSource
     * @synopsis Returns the receiver as a TIBET source code string.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    var err,
        msg,

        str,

        keys;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asSource) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asSource = true;

    err = this.at('object');
    if (TP.isError(err)) {
        msg = TP.ifInvalid(err.message, err.toString());
    } else if (TP.isValid(err)) {
        msg = TP.ifInvalid(TP.str(err), err.toString());
    } else {
        msg = this.getMessage();
    }

    try {
        str = this.getTypeName() + '.construct(' +
                'TP.hc(' +
                    '\'object\', ' + TP.src(err) + ', ' +
                    '\'message\', ' + '\'' + msg + '\'' +
                '))';

        //  Make sure to remove the 'payload' key since we already use the
        //  payload in the constructor.
        keys = this.getUniqueValueKeys();
        keys.remove('payload');

        str += this.$generateSourceSets(keys);
    } catch (e) {
        str = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asSource;

    return str;
});

//  ------------------------------------------------------------------------

TP.sig.Exception.Inst.defineMethod('asDumpString',
function() {

    /**
     * @name asDumpString
     * @synopsis Returns the receiver as a string suitable for use in log
     *     output.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    var err,
        msg,

        str;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asString = true;

    err = this.at('object');
    if (TP.isError(err)) {
        msg = TP.ifInvalid(TP.str(err), err.toString());
        msg += TP.getStackInfo(err).join('\n');
    } else if (TP.isValid(err)) {
        msg = TP.ifInvalid(TP.str(err), err.toString());
    } else {
        msg = this.getMessage();
    }

    try {
        str = this.getSignalName() +
                ' :: ' +
                '(' + msg + ')';
    } catch (e) {
        str = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asString;

    return str;
});

//  ------------------------------------------------------------------------

TP.sig.Exception.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @name asHTMLString
     * @synopsis Produces an HTML string representation of the receiver.
     * @returns {String} The receiver in HTML string format.
     */

    var err,
        msg,

        str;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asHTMLString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asHTMLString = true;

    err = this.at('object');
    if (TP.isValid(err)) {
        msg = TP.ifInvalid(TP.str(err), err.toString());
    } else {
        msg = this.getMessage();
    }

    try {
        if (TP.isValid(err)) {
            str = '<span class="TP_sig_Exception ' +
                    TP.escapeTypeName(TP.tname(this)) + '">' +
                        '<span data-name="payload">' +
                            TP.htmlstr(err) +
                         '<\/span>' +
                     '<\/span>';
        } else {
            str = '<span class="TP_sig_Exception ' +
                    TP.escapeTypeName(TP.tname(this)) + '">' +
                        '<span data-name="payload"><span data-name="message">' +
                            TP.htmlstr(msg) +
                         '<\/span><\/span>' +
                     '<\/span>';
        }

    } catch (e) {
        str = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asHTMLString;

    return str;
});

//  ------------------------------------------------------------------------

TP.sig.Exception.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @name asJSONSource
     * @synopsis Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    var err,
        msg,

        str;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asJSONSource) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asJSONSource = true;

    err = this.at('object');
    if (TP.isValid(err)) {
        msg = TP.ifInvalid(TP.str(err), err.toString());
    } else {
        msg = this.getMessage();
    }

    try {
        if (TP.isValid(err)) {
            str = '{"type":' + this.getTypeName().quoted('"') + ',' +
                    '"data":{' +
                        '"signame":' +
                             this.getSignalName().quoted('"') + ',' +
                        '"payload":' + TP.json(err) +
                    '}}';
        } else {
            str = '{"type":' + this.getTypeName().quoted('"') + ',' +
                    '"data":{' +
                        '"signame":' +
                             this.getSignalName().quoted('"') + ',' +
                        '"payload":{"message":' + TP.json(msg) + '}' +
                    '}}';
        }

    } catch (e) {
        str = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asJSONSource;

    return str;
});

//  ------------------------------------------------------------------------

TP.sig.Exception.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @name asPrettyString
     * @synopsis Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    var err,
        msg,

        str;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asPrettyString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asPrettyString = true;

    err = this.at('object');
    if (TP.isValid(err)) {
        msg = TP.ifInvalid(TP.str(err), err.toString());
    } else {
        msg = this.getMessage();
    }

    try {
        if (TP.isValid(err)) {
            str = '<dl class="pretty ' + TP.escapeTypeName(TP.tname(this)) +
                            '">' +
                        '<dt>Type name<\/dt>' +
                        '<dd class="pretty typename">' +
                            this.getTypeName() +
                        '<\/dd>' +
                        TP.pretty(err) +
                        '<\/dl>';
        } else {
            str = '<dl class="pretty ' + TP.escapeTypeName(TP.tname(this)) +
                            '">' +
                        '<dt>Type name<\/dt>' +
                        '<dd class="pretty typename">' +
                            this.getTypeName() +
                        '<\/dd>' +
                        TP.pretty(msg) +
                        '<\/dl>';
        }

    } catch (e) {
        str = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asPrettyString;

    return str;
});

//  ------------------------------------------------------------------------

TP.sig.Exception.Inst.defineMethod('asString',
function(verbose) {

    /**
     * @name asString
     * @synopsis Returns a reasonable string represention of the exception.
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the TP.sig.Exception's String representation. The default is true.
     * @returns {String} The receiver as a String
     */

    var err,
        msg,

        wantsVerbose,

        str;

    wantsVerbose = TP.ifInvalid(verbose, true);
    if (!wantsVerbose) {
        return this.getSignalName() + TP.OID_PREFIX +
                this.toString().split(TP.OID_PREFIX).last();
    }

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asString = true;

    err = this.at('object');
    if (TP.isValid(err)) {
        msg = TP.ifInvalid(TP.str(err), err.toString());
    } else {
        msg = this.getMessage();
    }

    try {
        str = this.getSignalName() +
                ' :: ' +
                '(' + msg + ')';
    } catch (e) {
        str = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asString;

    return str;
});

//  ------------------------------------------------------------------------

TP.sig.Exception.Inst.defineMethod('asXMLString',
function() {

    /**
     * @name asXMLString
     * @synopsis Produces an XML string representation of the receiver.
     * @returns {String} The receiver in XML string format.
     */

    var err,
        msg,

        str;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asXMLString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asXMLString = true;

    err = this.at('object');
    if (TP.isValid(err)) {
        msg = TP.ifInvalid(TP.str(err), err.toString());
    } else {
        msg = this.getMessage();
    }

    try {
        if (TP.isValid(err)) {
            str = '<instance type="' + TP.tname(this) + '">' +
                        '<payload>' +
                            TP.xmlstr(err) +
                         '<\/payload>' +
                     '<\/instance>';
        } else {
            str = '<instance type="' + TP.tname(this) + '">' +
                        '<payload><message>' +
                            TP.xmlstr(msg) +
                         '<\/message><\/payload>' +
                     '<\/instance>';
        }

    } catch (e) {
        str = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asXMLString;

    return str;
});

//  ------------------------------------------------------------------------

TP.sig.Exception.Inst.defineMethod('getError',
function() {

    /**
     * @name getError
     * @synopsis Returns the Error object, if any, associated with this
     *     exception. This object is typically found in the payload under the
     *     key 'object'.
     * @returns {Error} A native Error object.
     */

    return this.at('object');
});

//  ------------------------------------------------------------------------

TP.sig.Exception.Inst.defineMethod('getLevel',
function() {

    /**
     * @name getLevel
     * @synopsis Returns the severity level associated with this instance.
     * @returns {Number} The severity level of the receiver.
     */

    return this.getType().getLevel();
});

//  ------------------------------------------------------------------------

TP.sig.Exception.Inst.defineMethod('getMessage',
function() {

    /**
     * @name getMessage
     * @synopsis Returns the message(s), if any, associated with this instance.
     * @returns {String} The message entry/entries associated with the receiver.
     */

    return this.at('message');
});

//  ------------------------------------------------------------------------

TP.sig.Exception.Inst.defineMethod('preventDefault',
function(aFlag) {

    /**
     * @name preventDefault
     * @synopsis Turns off default processing for the receiver. In the case of a
     *     TP.sig.Exception this means that the standard throw call that would
     *     follow signaling the lightweight exception will not occur. This
     *     should be done whenever you've handled an exception in a way that
     *     should allow processing to continue.
     * @param {Boolean} aFlag True to signify that this exception has been
     *     handled.
     * @returns {Boolean} False, since default processing has been switched off.
     * @todo
     */

    //  set global handled flag so other external processing can see that
    //  we've been properly managed. the result for an
    $handled = true;

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  TOP LEVEL SIGNALS/EXCEPTIONS
//  ------------------------------------------------------------------------

//  create benign messaging signal types
TP.sig.Signal.defineSubtype('TRACE');
TP.sig.Signal.defineSubtype('INFO');
TP.sig.Signal.defineSubtype('SYSTEM');

//  build up logging exception hierarchy
TP.sig.Exception.defineSubtype('WARN');

TP.sig.WARN.defineSubtype('ERROR');
TP.sig.ERROR.defineSubtype('SEVERE');
TP.sig.SEVERE.defineSubtype('FATAL');

//  assign numerical constants for each level. note that in this context we
//  observe a leveling that isn't mirrored perfectly in the inheritance
//  hierarchy but is appropriate for log filtering
TP.sig.TRACE.Type.defineAttribute('$level', TP.TRACE);
TP.sig.INFO.Type.defineAttribute('$level', TP.INFO);
TP.sig.WARN.Type.defineAttribute('$level', TP.WARN);
TP.sig.ERROR.Type.defineAttribute('$level', TP.ERROR);
TP.sig.SEVERE.Type.defineAttribute('$level', TP.SEVERE);
TP.sig.FATAL.Type.defineAttribute('$level', TP.FATAL);
TP.sig.SYSTEM.Type.defineAttribute('$level', TP.SYSTEM);

//  ------------------------------------------------------------------------
//  TP.sig.Change
//  ------------------------------------------------------------------------

/*
This signal forms the root signal in support of MVC and data-driven
notification. There are numerous subtypes of TP.sig.Change, often created
dynamically, to allow fine-grained filtering of notification based on
individual object attributes such as 'LastnameChange' or 'Index34Change'.
These allow you to observe at small levels of granularity while leaving
open the option of simply observing TP.sig.Change and getting all
state-change events. UI change events are automatically converted into
TP.sig.Change subtypes as needed.
*/

//  ------------------------------------------------------------------------

TP.sig.Signal.defineSubtype('Change');

TP.sig.Change.Type.defineAttribute('defaultPolicy', TP.INHERITANCE_FIRING);

//  'Change' is the root of its own tree - we don't signal 'above' it in the
//  supertype chain.
TP.sig.Change.isSignalingRoot(true);

//  ------------------------------------------------------------------------

TP.sig.Change.Inst.defineMethod('getAction',
function() {

    /**
     * @name getAction
     * @synopsis Returns the action which caused the sender to change.
     * @returns {String} The action of the receiver.
     */

    return this.at('action');
});

//  ------------------------------------------------------------------------

TP.sig.Change.Inst.defineMethod('getAspect',
function() {

    /**
     * @name getAspect
     * @synopsis Returns the aspect of the sender which changed.
     * @returns {String} The aspect of the receiver.
     */

    return this.at('aspect');
});

//  ------------------------------------------------------------------------

TP.sig.Change.Inst.defineMethod('getSignalNames',
function() {

    /**
     * @name getSignalNames
     * @synopsis Returns the all of the receiver's 'signal names' - that is,
     *     each supertype signal name *and* the receiver's direct *signal* name.
     * @returns {Array} An Array of signal names.
     * @todo
     */

    var names;

    //  Since, in some sense, all subtypes of TP.sig.Change are 'spoofed',
    //  and change notification relies on INHERITANCE_FIRING (i.e. the
    //  handler can just implement a method for handling TP.sig.Change
    //  itself), we need to make sure that 'TP.sig.Change' is unshifted onto
    //  the return value here.

    //  This is different than the supertype's version of this method, which
    //  (when a signal is spoofed) will *not* add the signal's real type
    //  name, but will just use the spoofed name and the supertype signal
    //  names.

    names = this.getSupertypeSignalNames();

    //  If the receiver isn't already 'TP.sig.Change' itself, add
    //  'Change' as a signal name.
    if (this.getSignalName() !== 'TP.sig.Change') {
        names.unshift('TP.sig.Change');
    }

    names.unshift(this.getSignalName());

    return names;
});

//  ------------------------------------------------------------------------

TP.sig.Change.Inst.defineMethod('getValue',
function() {

    /**
     * @name getValue
     * @synopsis Returns the new value.
     * @returns {String} The value of the receiver.
     */

    var value,
        origin,
        aspect;

    value = this.at('value');
    if (TP.isValid(value)) {
        return value;
    }

    //  Attempt to get the value using origin and aspect.
    origin = this.getOrigin();
    if (TP.isString(origin)) {
        origin = TP.sys.getObjectById(origin);
        if (TP.notValid(origin)) {
            return;
        }
    }

    aspect = this.getAspect();
    if (TP.isEmpty(aspect)) {
        return;
    }

    if (TP.canInvoke(origin, 'get')) {
        return origin.get(aspect);
    }

    return;
});

//  ------------------------------------------------------------------------
//  TP.sig.IndexChange
//  ------------------------------------------------------------------------

/*
*/

//  ------------------------------------------------------------------------

TP.sig.Change.defineSubtype('IndexChange');

//  ------------------------------------------------------------------------
//  TP.sig.ValueChange
//  ------------------------------------------------------------------------

/*
*/

//  ------------------------------------------------------------------------

TP.sig.Change.defineSubtype('ValueChange');

//  ------------------------------------------------------------------------
//  TP.sig.StructureChange
//  ------------------------------------------------------------------------

/*
*/

//  ------------------------------------------------------------------------

TP.sig.ValueChange.defineSubtype('StructureChange');

//  ------------------------------------------------------------------------
//  TP.sig.SignalMap
//  ------------------------------------------------------------------------

/*
TP.sig.SignalMap provides a wrapper around the data structures that
manage signal observations and notification. Included with the
TP.sig.SignalMap type are a number of registration and firing "policies"
which implement the strategy pattern. By selecting a different policy you
alter the behavior of the registration or signal notification process.
*/

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('sig:SignalMap');

//  turn off logging unless we're debugging the internals of notification
TP.sig.SignalMap.shouldLog(false);

//  ------------------------------------------------------------------------

//  for reimporting we test here
if (TP.notValid(TP.sig.SignalMap.INTERESTS)) {
    TP.sig.SignalMap.INTERESTS = TP.constructOrphanObject();

    // An interest is composed of the following sparse keys:
    /*
        target
        event
        suspend // false,
     */

    // A listener is composed of the following sparse keys:
    /*
        target
        event
        phase
        propagate
        defaultAction
        observer
        suspend   // false
        remove    // false
        handler
     */
}

//  prebuilt regexs for testing for default signal construction
TP.sig.SignalMap.Type.defineConstant(
                    'CHANGE_REGEX',
                    /Change/);
TP.sig.SignalMap.Type.defineConstant(
                    'INDEX_CHANGE_REGEX',
                    /Index[0-9]+Change/);
TP.sig.SignalMap.Type.defineConstant(
                    'ERROR_REGEX',
                    /Error|Exception|Invalid|Violation|Failed|NotFound/);
TP.sig.SignalMap.Type.defineConstant(
                    'ERROR_CODE_REGEX',
                    /^[0-9]+$/);
TP.sig.SignalMap.Type.defineConstant(
                    'WARN_REGEX',
                    /Warning/);

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('$computeResponderChain',
function(aSignal, startResponder, isCapturing) {

    /**
     * @name $computeResponderChain
     * @synopsis Computes the 'responder chain' for the supplied signal (which
     *     should be a subtype of TP.sig.ResponderSignal) starting at the
     *     startResponder.
     * @param {TP.sig.ResponderSignal} aSignal The signal to compute the
     *     responder chain for.
     * @param {Object} startResponder The responder to start the traversal from.
     * @param {Boolean} isCapturing Whether or not we're computing for a
     *     'capturing' chain. If that's the case, we reverse our results so that
     *     the startResponder (if it is a responder for the signal) is at the
     *     end of the chain.
     * @returns {Array} The chain of responders as computed from the supplied
     *     startResponder.
     * @todo
     */

    var responders,
        nextResponder;

    responders = TP.ac();

    nextResponder = startResponder;

    //  Traverse up our responder chain
    while (TP.isValid(nextResponder)) {
        //  If we can invoke 'isResponderFor', do it and check the return
        //  value. If its true, this responder can handle the signal in some
        //  fashion.
        if (TP.canInvoke(nextResponder, 'isResponderFor') &&
            nextResponder.isResponderFor(aSignal, isCapturing)) {
            responders.push(nextResponder);
        }

        //  If we can invoke 'getNextResponder', do it and grab the next
        //  responder in the chain.
        if (TP.canInvoke(nextResponder, 'getNextResponder')) {
            nextResponder = nextResponder.getNextResponder(aSignal,
                                                            isCapturing);
        } else {
            break;
        }
    }

    //  We built this from the 'start responder out', but if the isCapturing
    //  flag is 'true', the caller is in capturing mode and likes to see it
    //  from the outside-in (because it will process 'capturing' event
    //  handlers first), so we reverse it here.
    if (TP.isTrue(isCapturing)) {
        responders.reverse();
    }

    //  Make sure to configure it as an origin set.
    responders.isOriginSet(true);

    return responders;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('$getPolicyName',
function(aPolicy) {

    /**
     * @name $getPolicyName
     * @synopsis Returns the public name of the policy provided. If the policy
     *     is provided as a string that string is returned.
     * @param {Function|String} aPolicy The policy specification.
     * @returns {String} The policy's public name.
     */

    if (TP.isString(aPolicy)) {
        return aPolicy;
    }

    //  if the policy is a function then it should be able to provide its
    //  name via getName
    if (TP.isCallable(aPolicy)) {
        return aPolicy.getName();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('$getSignalInstance',
function(aSignal, aPayload, defaultType, isCancelable, isBubbling) {

    /**
     * @name $getSignalInstance
     * @synopsis Returns a signal instance for use. This is optimized via the
     *     TP.sig.Signal construct machinery to reuse a common instance in most
     *     cases so that instance creation overhead is minimized.
     * @description When processing signals provided in string form the default
     *     type rules will cause types with Change in their name to be turned
     *     into Change signals, while types with Exception in their name will
     *     become subtypes of TP.sig.Exception. Exception is tested first, so a
     *     ChangeException is an Exception, not a Change :).
     * @param {TP.sig.Signal} aSignal The signal name/type.
     * @param {Object} aPayload Optional arguments.
     * @param {TP.lang.RootObject.<TP.core.Signal>} defaultType A TP.core.Signal
     *     subtype type object.
     * @param {Boolean} isCancelable Optional flag for dynamic signals defining
     *     if they can be cancelled.
     * @param {Boolean} isBubbling Optional flag for dynamic signals defining
     *     whether they bubble (when using TP.DOM_FIRING).
     * @returns {TP.sig.Signal} A Signal instance.
     * @todo
     */

    var sig,
        sigType;

    if (TP.isString(aSignal) || !TP.canInvoke(aSignal, 'clearIgnores')) {
        sigType = TP.sig.SignalMap.$getSignalType(aSignal, defaultType);

        if (TP.isType(sigType)) {
            TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE) ?
                TP.trace('Using signal type named: ' +
                                sigType.getName(),
                            TP.SIGNAL_LOG, arguments) : 0;

            sig = sigType.construct(aPayload);
            sig.$set('signalName', aSignal.getSignalName());

            TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE) ?
                TP.trace('Returning instance with signalName: ' +
                                sig.getSignalName(),
                            TP.SIGNAL_LOG, arguments) : 0;
        } else {
            TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE) ?
                TP.trace('Failed to find signal instance for: ' + aSignal,
                            TP.SIGNAL_LOG, arguments) : 0;

            sig = aSignal;
        }
    } else {
        TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE) ?
            TP.trace('Returning supplied signal instance: ' + aSignal,
                        TP.SIGNAL_LOG, arguments) : 0;

        sig = aSignal;
    }

    //  make sure the signal can be run cleanly against all handlers within
    //  a particular policy activation
    if (TP.canInvoke(sig, 'clearIgnores')) {
        sig.clearIgnores();
    }

    if (TP.notEmpty(isCancelable)) {
        sig.set('cancelable', isCancelable);
    }

    if (TP.notEmpty(isBubbling)) {
        sig.set('bubbling', isBubbling);
    }

    return sig;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('$getSignalType',
function(aSignal, aDefaultType) {

    /**
     * @name $getSignalType
     * @synopsis Returns a signal type for use by looking up the type matching
     *     the supplied signal. If the optional aDefaultType parameter is
     *     supplied it is used as the return type. If its not defined, a number
     *     of rules (explained below) are used to try to 'compute' the return
     *     type.
     * @description When returning signal types for signal values provided in
     *     String form the default type rules will cause types with Change in
     *     their name to return Change signals, while types with Exception in
     *     their name will return TP.sig.Exception. TP.sig.Exception is tested
     *     first, so a ChangeException is an Exception, not a TP.sig.Change :).
     * @param {TP.lang.RootObject.<TP.core.Signal>|String} aSignal A
     *     TP.core.Signal subtype type object or name.
     * @param {TP.lang.RootObject.<TP.core.Signal>} aDefaultType An optional
     *     type object that will be used as the return type from this method if
     *     a real signal type couldn't be computed.
     * @returns {TP.lang.RootObject.<TP.core.Signal>} A TP.core.Signal subtype
     *     type object.
     * @todo
     */

    var aTypeName,

        sigType,

        defaultType;

    //  if we've got a string turn it into a signal type reference
    if (TP.isString(aSignal)) {
        TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE) ?
            TP.trace('Getting type for aSignal string: ' + aSignal,
                        TP.SIGNAL_LOG, arguments) : 0;

        //  the signal type name will be the signal name.
        aTypeName = aSignal;

        if (TP.notValid(sigType = TP.sys.getTypeByName(aTypeName))) {
            TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE) ?
                TP.trace('No signal type named: ' + aTypeName,
                            TP.SIGNAL_LOG, arguments) : 0;

            //  try to get the best default signal possible here
            if (TP.sig.SignalMap.ERROR_REGEX.test(aSignal) ||
                TP.sig.SignalMap.ERROR_CODE_REGEX.test(aSignal)) {
                defaultType = TP.ifInvalid(aDefaultType,
                                            TP.sig.ERROR);
            } else if (TP.sig.SignalMap.WARN_REGEX.test(aSignal)) {
                defaultType = TP.ifInvalid(aDefaultType,
                                            TP.sig.WARN);
            } else if (TP.sig.SignalMap.CHANGE_REGEX.test(aSignal)) {
                defaultType = TP.ifInvalid(aDefaultType,
                                            TP.sig.Change);
            } else if (TP.sig.SignalMap.INDEX_CHANGE_REGEX.test(aSignal)) {
                defaultType = TP.ifInvalid(aDefaultType,
                                            TP.sig.IndexChange);
            } else {
                defaultType = TP.ifInvalid(aDefaultType, TP.sig.Signal);
            }

            if (TP.isType(defaultType)) {
                sigType = defaultType;
            } else {
                sigType = TP.sys.getTypeByName(defaultType);
            }
        }
    } else if (TP.isType(aSignal)) {
        sigType = aSignal;
    } else {
        sigType = TP.type(aSignal);
    }

    return sigType;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('$computeOriginID',
function(anOrigin) {

    var orgid;

    orgid = (TP.isValid(anOrigin)) ? TP.id(anOrigin) : TP.ANY;
    if ((orgid === '*') || (orgid === '')) {
        orgid = TP.ANY;
    }

    return orgid;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('$computeSignalName',
function(aSignal) {

    var signame;

    signame = (TP.isValid(aSignal)) ? aSignal.getSignalName() : TP.ANY;
    if (TP.notValid(signame) || (signame === '*') || (signame === '')) {
        signame = TP.ANY;
    }

    return signame;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('$isInterestSuspended',
function(anOrigin, aSignal) {

    /**
     * @name $isInterestSuspended
     * @synopsis Returns true if the combination of origin and signal ID is
     *     marked as suspended in the signal map.
     * @param {String} anOrigin What origin are we checking?
     * @param {String|tp.sig.Signal} aSignal What signal name?
     * @returns {Boolean} Whether or not a particular origin/signal ID is
     *     suspended or not.
     * @todo
     */

    var orgid,
        signame,
        entry;

    orgid = TP.sig.SignalMap.$computeOriginID(anOrigin);
    signame = TP.sig.SignalMap.$computeSignalName(aSignal);

    entry = TP.sig.SignalMap.INTERESTS[orgid + '.' + signame];
    if (TP.isValid(entry)) {
        return entry.suspect === true;
    }
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('$registerHandlerInfo',
function(anOrigin, aSignal, aHandler, aPhase, propagate, defaultAction, anObserver, xmlEvent) {

    /**
     * @name $registerHandlerInfo
     * @synopsis Creates a signal map entry for the interest specified. Note
     *     that no duplicate entries are made meaning each handler is notified
     *     only once per signal occurrence unless the TIBET flag
     *     shouldAllowDuplicateInterests() returns true. Also, if the enclosing
     *     interest container has already been created for another handler, and
     *     is suspended, it will remain suspended until a resume is invoked. If
     *     the specific entry is suspended it will be reactivated as a result of
     *     this call.
     * @param {Object} anOrigin What origin?
     * @param {String|TP.sig.Signal} aSignal What signal?
     * @param {Object} aHandler What object will get notification?
     * @param {String} aPhase The dispatch phase to register the handler for.
     * @param {String} propagate If equal to 'stop', then the handler should
     *     stop propagation.
     * @param {String} defaultAction If equal to 'cancel', then the handler
     *     should cancel the default action.
     * @param {Element} anObserver The observer element.
     * @param {Boolean} xmlEvent Should use XML Events semantics?
     * @todo
     */

    var origins,
        origin,

        events,
        theEvent,

        entry,
        xml,

        i,
        j,
        k,

        observers,
        observer,
        handlers;

    TP.debug('break.signal_register');

    if ((TP.isEmpty(anOrigin)) || (anOrigin === '*')) {
        origins = TP.ANY;
    } else {
        origins = anOrigin;
    }
    origins = origins.split(' ');

    if (TP.isEmpty(aSignal) || (aSignal === '*')) {
        events = TP.ANY;
    } else {
        events = aSignal;
    }
    events = events.split(' ');

    handlers = TP.ac();

    xml = TP.ifInvalid(xmlEvent, false);

    //  create a new entry for each expanded origin/signal pair
    for (i = 0; i < origins.getSize(); i++) {
        origin = origins.at(i);
        for (j = 0; j < events.getSize(); j++) {
            theEvent = events.at(j);

            //  when dealing with XML event semantics we have to manipulate
            //  things a bit if the target (origin) and observer differ. In
            //  particular we want the registration to sit at the observer's
            //  level in the DOM which means using the observer as the
            //  origin rather than the target. we want to preserve the
            //  target in a separate attribute so we can filter on it later
            if (xml) {
                if (anOrigin === anObserver) {
                    //  when anOrigin == anObserver it means ev:target was
                    //  defaulted to ev:observer. In that case we don't care
                    //  about xml_target since we weren't given a specific
                    //  child of an observer to match. Also, we can just use
                    //  origin as target and not worry about splitting
                    //  observer separately if necessary.
                            entry = TP.constructOrphanObject();
                            entry.target = origin;
                } else {
                    if (anObserver.indexOf(' ') === TP.NOT_FOUND) {
                                entry = TP.constructOrphanObject();

                        //  anObserver is a single value, no split required.
                        //  one special case here is that when the origin is
                        //  the document we're "outside" the element chain
                        //  and have to cheat a bit
                        if (TP.regex.DOCUMENT_ID.test(origin)) {
                            //  theoretically illegal, since we're saying
                            //  the document is "inside" the observer
                            entry.target = origin;
                        } else {
                            entry.target = anObserver;
                            entry.xml_target = origin;
                        }
                    } else {
                        //  have to split observer and generate an entry for
                        //  each combination
                        observers = anObserver.split(' ');
                        for (k = 0; k < observers.getSize(); k++) {
                            observer = observers.at(k);

                                    entry = TP.constructOrphanObject();

                            entry.target = observer;
                            entry.xml_target = origin;

                            entry.event = theEvent;
                            entry.handler = aHandler;

                            TP.notEmpty(aPhase) ?
                                entry.phase = aPhase : 0;
                            TP.notEmpty(propagate) ?
                                entry.propagate = propagate : 0;
                            TP.notEmpty(defaultAction) ?
                                entry.defaultAction = defaultAction : 0;
                            TP.notEmpty(observer) ?
                                entry.observer = observer : 0;

                            handlers.push(entry);
                        }

                        //  skip tail of the i/j loop since we've already
                        //  fully configured the handler entries
                        continue;
                    }
                }
            }
            else    //  NOT XML EVENTS
            {
                entry = TP.constructOrphanObject();
                entry.target = origin;
            }

            entry.event = theEvent;
            entry.handler = aHandler;

            TP.notEmpty(aPhase) ?
                    entry.phase = aPhase : 0;
            TP.notEmpty(propagate) ?
                    entry.propagate = propagate : 0;
            TP.notEmpty(defaultAction) ?
                    entry.defaultAction = defaultAction : 0;
            TP.notEmpty(anObserver) ?
                    entry.observer = anObserver : 0;

            handlers.push(entry);
        }
    }

    for (i = 0; i < handlers.getSize(); i++) {
        //  the true tells it to quietly discard duplicates
        this.$registerHandlerEntry(handlers.at(i), true);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('$registerHandlerEntry',
function(aHandlerEntry, quiet) {

    /**
     * @name $registerHandlerEntry
     * @synopsis Creates a signal map entry for the handler entry provided.
     * @param {Object} aHandlerEntry A listener entry.
     * @param {Boolean} quiet True to quietly ignore duplicate entries.
     * @todo
     */

    var map,
        orgid,
        signame,
        origin,
        type,
        owner,
        root,
        entry,
        id,
        hash,
        source,
        phase,
        win;

    map = TP.sig.SignalMap.INTERESTS;

    orgid = TP.sig.SignalMap.$computeOriginID(aHandlerEntry.target);
    signame = TP.sig.SignalMap.$computeSignalName(aHandlerEntry.event);

    //  ---
    //  origin/signal owner notification
    //  ---

    //  ensure owners such as mouse and keyboard know about this event.
    origin = TP.isTypeName(orgid) ? TP.sys.require(orgid) : orgid;
    if (TP.canInvoke(origin, 'addObserver')) {
        origin.addObserver(orgid, signame);
    }

    //  some events require interaction with an "owner", typically a
    //  TP.core.Device, responsible for events of that type which may also
    //  decide to manage observations directly
    type = TP.isTypeName(signame) ? TP.sys.require(signame) : signame;

    //  special case here for keyboard events since their names are often
    //  synthetic and we have to map to the true native event type
    if (TP.notValid(type)) {
        if (TP.regex.KEY_EVENT.test(signame)) {
            type = TP.sys.require('TP.sig.DOMKeySignal');
        }
    }

    //  If we have a type we need to ask it if events of that type have a signal
    //  onwer. If so we'll need to let that type manage observations as well.
    if (TP.canInvoke(type, 'getSignalOwner') &&
        TP.isValid(owner = type.getSignalOwner())) {
        if ((owner !== origin) && TP.canInvoke(owner, 'addObserver')) {
            owner.addObserver(orgid, signame);
        }
    }

    //  ---
    //  interest entry configuration
    //  ---

    id = orgid + '.' + signame;
    root = map[id];

    //  no root? no interests yet so we need to create a container object that
            //  will manage all data for this origin/signal pair.
    if (TP.notValid(root)) {
        TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE) ?
            TP.trace('Interest root not found.',
                        TP.SIGNAL_LOG, arguments) : 0;

                entry = TP.constructOrphanObject();
        entry.target = orgid;
        entry.event = signame;
                entry.listeners = [];
        map[id] = entry;

                root = entry;
    }

    entry = null;

    id = aHandlerEntry.handler;

    //  some handler entries have id's and some are inline functions. we use
    //  the handler attribute to hold this data just as in XML Events
    if (TP.notEmpty(id)) {
                phase = aHandlerEntry.phase;
        entry = root.listeners.detect(
                function(item) {

                    return item.handler === id && item.phase === phase;
                });

                if (TP.notValid(entry)) {
                    TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE) ?
                            TP.trace('Listener not found.',
                            TP.SIGNAL_LOG, arguments) : 0;
                }
    }

    //  if we find an entry we have two options, first if the entry "isn't
    //  really there" because it's in a remove state we can reactivate it
    if (TP.isValid(entry)) {
        if (TP.isTrue(quiet)) {
            return;
        }

        if (!TP.sys.shouldAllowDuplicateInterests()) {
            TP.ifWarn(TP.$DEBUG && TP.$$VERBOSE) ?
                TP.warn(
                    TP.join('Duplicate interest registration for origin: ',
                            orgid, ' signal: ',
                            signame, ' handler: ',
                            id, ' ignored.'),
                    TP.SIGNAL_LOG, arguments) : 0;

            return;
        }

        if (entry.suspend === true) {
            TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE) ?
                TP.trace('Listener currently flagged as suspended.',
                            TP.SIGNAL_LOG, arguments) : 0;
            delete entry.suspend;
            return;
        }

                if (entry.remove === true) {
            TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE) ?
                TP.trace('Listener currently flagged as removed.',
                            TP.SIGNAL_LOG, arguments) : 0;
            delete entry.remove;
            return;
        }
    }

    TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE) ?
        TP.trace('Creating new listener entry.',
                    TP.SIGNAL_LOG, arguments) : 0;

            // Simple. Just use the object provided.
            entry = aHandlerEntry;

    //  if no ID at this point we must have an inline function to use, if
    //  the handler ID is a JS URI then we have an inline expression. either
    //  way we have to convert the JS into a function we can use
    if (TP.isEmpty(id) || id.startsWith('javascript:')) {
        if (TP.isEmpty(id)) {
            TP.ifWarn() ?
                TP.warn(TP.boot.$annotate(
                            entry,
                            'Invalid handler in listener.'),
                        TP.SIGNAL_LOG, arguments) : 0;
        } else {
            //  NOTE we have to run the TP.xmlEntitiesToLiterals() call here
            //  since XML will require quotes etc. to be in entity form
            source = TP.xmlEntitiesToLiterals(id.strip(/javascript:/));

            //  build a function wrapper, using double quoting to match
            //  how attribute would likely be quoted in the source.
            source = 'function (triggerSignal) {' + source + '};';
        }

        TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE) ?
            TP.trace('Found function source: ' + source,
                        TP.SIGNAL_LOG, arguments) : 0;

        //  if we have source, try to get a function handle to it
        if (TP.isString(source)) {
            //  generate a unique hash to use as an id so we don't
            //  keep generating new functions for anonymous handlers
            hash = TP.hash(source, TP.HASH_MD5);

            //  note the lookup here which uses regOnly true to avoid longer
            //  searches since we know we're dealing with registered objects
            //  when using hash keys
            if (TP.isValid(TP.sys.getObjectById(hash, true))) {
                id = hash;

                //  have to check for duplicate again...
                entry.handler = id;

                return TP.sig.SignalMap.$registerHandlerEntry(entry);
            } else {
                try {
                    win = window;
                    eval('win.$$handler = ' + source);
                    win.$$handler.setID(hash);
                    id = win.$$handler.getID();

                    //  register the object so it can be found during
                    //  notification but do it only when we had to build the
                    //  object ourselves, otherwise we presume the developer
                    //  has registered it themselves, or will when they're
                    //  ready
                    TP.sys.registerObject(win.$$handler);
                } catch (e) {
                    TP.ifError() ?
                        TP.error(
                            TP.ec(e, 'Problem creating handler function.'),
                            TP.SIGNAL_LOG,
                            arguments) : 0;

                    return;
                }
            }
        }
    } else if (id.startsWith('#')) {
        //  local document ID reference, should have been converted to a
        //  global ID but $byOID will default to TP.sys.getUICanvas()
    }

    if (TP.isValid(id)) {
        entry.handler = id;

        root.listeners.push(entry);

        TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE) ?
            TP.trace('Listener entry created for ID: ' + id,
                        TP.SIGNAL_LOG, arguments) : 0;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('$registerInterest',
function(anOrigin, aSignal, aHandler, isCapturing) {

    /**
     * @name $registerInterest
     * @synopsis Creates a signal map entry for the interest specified.
     * @description No duplicate entries are made meaning each handler is
     *     notified only once per signal occurrence unless the TIBET flag
     *     shouldAllowDuplicateInterests() returns true. Also, if the enclosing
     *     interest container has already been created for another handler, and
     *     is suspended, it will remain suspended until a resume is invoked. If
     *     the specific entry is suspended it will be reactivated as a result of
     *     this call.
     * @param {Object} anOrigin What origin?
     * @param {String|TP.sig.Signal} aSignal What signal?
     * @param {Object} aHandler What object will get notification?
     * @param {Boolean} isCapturing Should this be considered a capturing
     *     handler?
     * @todo
     */

    var orgid,
        map,
        signame,
        root,
        entry,
        id,
        handlerID;
            /*
    if (TP.isEmpty(anOrigin) || (anOrigin == '*')) {
        orgid = TP.ANY;
    } else {
        orgid = TP.id(anOrigin);
    };

    if (TP.isEmpty(aSignal) || (aSignal == '*')) {
        signame = TP.ANY;
    } else {
        signame = aSignal.getSignalName();
    };
            */
    orgid = TP.sig.SignalMap.$computeOriginID(anOrigin);
    signame = TP.sig.SignalMap.$computeSignalName(aSignal);


    map = TP.sig.SignalMap.INTERESTS;
    id = orgid + '.' + signame;
    root = map[id];

    //  no root? no interests yet so we need to create a container
    if (TP.notValid(root)) {
        TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE) ?
            TP.trace('Interest root not found.',
                        TP.SIGNAL_LOG, arguments) : 0;

                entry = TP.constructOrphanObject();
        entry.target = orgid;
        entry.event = signame;
                entry.listeners = [];
        map[id] = entry;

        root = entry;
    }

    entry = null;

    handlerID = TP.gid(aHandler);

    entry = root.listeners.detect(
            function(item) {

                return item.handler === handlerID;
            });

    if (TP.notValid(entry)) {
        TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE) ?
                TP.trace('Listener entry not found.',
                TP.SIGNAL_LOG, arguments) : 0;
    }

    //  if we find an entry we have two options, first if the entry "isn't
    //  really there" because it's in a remove state we can reactivate it.
    if (TP.isValid(entry)) {
        if (!TP.sys.shouldAllowDuplicateInterests()) {
            TP.ifWarn(TP.$DEBUG && TP.$$VERBOSE) ?
                TP.warn(
                    TP.join('Duplicate interest registration for origin: ',
                            orgid, ' signal: ',
                            signame, ' handler: ',
                            handlerID, ' ignored.'),
                    TP.SIGNAL_LOG, arguments) : 0;

            return;
        }

        if (entry.suspend === true) {
            TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE) ?
                TP.trace('Listener entry currently flagged as suspended.',
                            TP.SIGNAL_LOG, arguments) : 0;

            delete entry.suspend;

            //  ensure we're looking at the same handler instance, not
            //  just the same ID by updating the registration
            TP.sys.registerObject(aHandler, handlerID, true);

            return;
        }

        if (entry.remove === true) {
            TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE) ?
                TP.trace('Listener entry currently flagged as removed.',
                            TP.SIGNAL_LOG, arguments) : 0;

                    delete entry.remove;

            //  ensure we're looking at the same handler instance, not
            //  just the same ID by updating the registration
            TP.sys.registerObject(aHandler, handlerID, true);

            return;
        }
    }

    TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE) ?
        TP.trace('Creating listener entry.',
                    TP.SIGNAL_LOG, arguments) : 0;

    //  if we arrived here there must not have been an entry already
            entry = TP.constructOrphanObject();
    entry.target = orgid;
    entry.event = signame;

    if (isCapturing) {
        entry.phase = 'capture';
    }

    entry.handler = handlerID;

    //  register the object so it can be found during notification
    TP.sys.registerObject(aHandler);

            root.listeners.push(entry);

    TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE) ?
        TP.trace(TP.join('Listener entry created for ID: ',
                            handlerID, ' with handler: ', aHandler),
                    TP.SIGNAL_LOG, arguments) : 0;
    return;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('$removeInterest',
function(anOrigin, aSignal, aHandler, isCapturing) {

    /**
     * @name $removeInterest
     * @synopsis Removes the signal map entry for the specific interest
     *     specified.
     * @description This method affects the handler provided, or all handlers of
     *     the particular capturing type (ie. capturing or non-capturing) if no
     *     handler is present. Note that when a handler is present the
     *     isCapturing flag is ignored and the handler's entry is removed
     *     regardless of its capture attribute value.
     * @param {Object} anOrigin What origin?
     * @param {String|TP.sig.Signal} aSignal What signal?
     * @param {Object} aHandler What object will get notification?
     * @param {Boolean} isCapturing Should this be considered a capturing
     *     handler?
     * @todo
     */

    var orgid,
        signame,

        map,
        id,
        root,

        handlerID,
        entry,
        list,
        item,
        i;
            /*
    if (TP.isEmpty(anOrigin) || (anOrigin == '*')) {
        orgid = TP.ANY;
    } else {
        orgid = TP.id(anOrigin);
    };

    if (TP.isEmpty(aSignal) || (aSignal == '*')) {
        signame = TP.ANY;
    } else {
        signame = aSignal.getSignalName();
    };
            */
    orgid = TP.sig.SignalMap.$computeOriginID(anOrigin);
    signame = TP.sig.SignalMap.$computeSignalName(aSignal);

    map = TP.sig.SignalMap.INTERESTS;
    id = orgid + '.' + signame;
    root = map[id];

    if (TP.notValid(root)) {
        return;
    }

    //  behavior branches based on handler vs. no handler. when no handler
    //  we'll be removing all interests of the specified capturing type, or
    //  all interests if no explicit capturing type was provided.
    if (TP.notValid(aHandler)) {
        if (TP.isTrue(isCapturing)) {
            list = root.listeners.select(
                function(item) {

                    return item.phase === 'capture';
                });

        } else if (TP.isFalse(isCapturing)) {
            list = root.listeners.select(
                function(item) {

                    return item.phase !== 'capture';
                });
        } else {
            list = root.listeners;
        }

        TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE) ?
            TP.trace('Removing ' + list.length + ' listener entries.',
                        TP.SIGNAL_LOG, arguments) : 0;

        for (i = 0; i < list.length; i++) {
            item = list.at(i);

            // Flag for removal.
            item.remove === true;

            // If we're supposed to remove entirely next step is to compact.
            if (!TP.sys.shouldIgnoreViaFlag()) {
                    root.listeners = list.select(
                            function(entry) {
                                return entry.remove !== true;
                            });
            }
        }
    } else {
        handlerID = aHandler.getID();
        entry = root.listeners.detect(
            function(item) {

                return item.handler === handlerID;
            });

        if (TP.isValid(entry)) {
            entry.remove = true;

            if (!TP.sys.shouldIgnoreViaFlag()) {
                list = root.listeners;
                        root.listeners = list.select(
                                function(item) {
                                    return item.remove !== true;
                                });
            }
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.Type.defineMethod('getListeners',
function(anOrigin, aSignal, captureState) {

    /**
     * @name getListeners
     * @synopsis Returns all listener entries found for the origin/signal name
     *     pair provided, adjusting for capturing semantics as needed. Note that
     *     "ANY" references are treated as "special origin" or "special signal"
     *     rather than as "wildcards" for purposes of this routine. In other
     *     words, when anOrigin is TP.ANY only listeners registered for the
     *     origin TP.ANY are returned, not listeners for
     *
     *
     * @param {String} anOrigin The origin to use for lookup.
     * @param {Signal} aSignal The signal (or name) to look up.
     * @param {Boolean} captureState Actually a "tri-state" flag where null is
     *     used for the third state. True means notify only handlers with "true"
     *     for their capture state, false means only those which are not
     *     capturing, and null is used to imply both. The default is null.
     * @todo
     */

    var list,
        capture,

        orgid,
        signame,

        map,
        id,
        root,

        items,
        item,
        i;

    //  set a default of no handlers found
    list = TP.ac();

    capture = captureState;

    orgid = TP.sig.SignalMap.$computeOriginID(anOrigin);
    signame = TP.sig.SignalMap.$computeSignalName(aSignal);

    map = TP.sig.SignalMap.INTERESTS;
    id = orgid + '.' + signame;
    root = map[id];

    if (TP.notValid(root)) {
        return list;
    }

    items = root.listeners;

    for (i = 0; i < items.length; i++) {
        item = items.at(i);

        //  if the specific handler is suspended or flagged for removal
        //  then just skip it
        if ((item.suspend === true) || (item.remove === true)) {
            continue;
        }

        if (TP.isFalse(capture)) {
            //  if capturing handlers are masked off, check and skip
            if (item.phase === 'capture') {
                continue;
            }
        } else if (TP.isTrue(capture)) {
            if (item.phase !== 'capture') {
                continue;
            }
        }

        //  add the observation to the list
        list.push(item);
    }

    return list;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.Type.defineMethod('notifyHandlers',
function(anOrigin, aSignalName, aSignal, checkPropagation, captureState,
aSigEntry, checkTarget) {

    /**
     * @name notifyHandlers
     * @synopsis Notifies all handlers found for the origin/signal name pair
     *     provided, adjusting for capturing semantics as needed.
     * @description This method notifies every available listener it can find
     *     which meet the captureState requirements -- unless the
     *     checkPropagation flag is true in which case the notification only
     *     occurs until a handler sets the stopPropagation() flag on the signal.
     *     In that case the first handler which stops propagation will be the
     *     last handler called regardless of how many other handers may be
     *     registered as observers. Note that if the particular signal/origin
     *     interest combination has been suspended as a result of a Suspend
     *     signal (via this.suspend() etc.) no notification will occur.
     * @param {String} anOrigin The origin to use for lookup.
     * @param {String} aSignalName The signal name to lookup.
     * @param {Signal} aSignal The signal passed to handlers.
     * @param {Boolean} checkPropagation Should propagation checks be performed.
     *     If so, a stopPropagation() call will terminate notifications. The
     *     default is true.
     * @param {Boolean} captureState Actually a "tri-state" flag where null is
     *     used for the third state. True means notify only handlers with "true"
     *     for their capture state, false means only those which are not
     *     capturing, and null is used to imply both. The default is null.
     * @param {Entry} aSigEntry The signal map entry Node to use to get the
     *     handlers from. This is an optional parameter. If this is not
     *     supplied, it will be computed here. If this method is called
     *     repeatedly, better performance can be achieved by computing the entry
     *     Node once and supplying it here.
     * @param {Boolean} checkTarget True to force "target checks" which enforce
     *     the DOM spec's requirement that when a specific target was defined
     *     for a listener it should only fire if the signal target (not origin)
     *     matches it.
     * @todo
     */

    var i,
        entry,
        items,
        check,
        capture,
        orgid,
        signame,
        item,
        handler,
        originalOrigin,
        hFunc,
        observer,
        xml_target,
        targetID;

    TP.debug('break.signal_notify');

    //  callers need to already have set up a signal instance
    if (TP.notValid(aSignal)) {
        return;
    }

    //  should we respect stopPropagation calls?
    check = TP.ifInvalid(checkPropagation, true);

    //  don't let signals get passed with TP.ANY as an origin, but ensure
    //  we can put things back the way they were once we're finished
    originalOrigin = aSignal.getOrigin();
    if (originalOrigin === TP.ANY) {
        aSignal.setOrigin(null);
    }

    //  if we're asked to respect propagation check then check it
    if (check && aSignal.shouldStop()) {
        aSignal.setOrigin(originalOrigin);

        return;
    }

    //  set our capture state flag so we can test as needed
    capture = captureState;

    //  capture the current origin for interest lookup purposes
    //  orgid = (TP.notValid(anOrigin)) ? TP.ANY : TP.id(anOrigin);

    //  capture the signal use we're using for lookup purposes
    //  signame = (TP.notValid(aSignalName)) ? TP.ANY : aSignalName.getID();

    orgid = TP.sig.SignalMap.$computeOriginID(anOrigin);
    signame = TP.sig.SignalMap.$computeSignalName(aSignalName);

    if (TP.isValid(aSigEntry)) {
        entry = aSigEntry;
    } else {
        //  note we don't bother with sorting out capture vs. bubble here,
        //  we put the burden of that on the observe process which manages
        //  order in the listener node list for a particular interest.
        //  this optimizes for runtime dispatch since observes can persist
        //  in XML, and across multiple content display invocations,
        //  meaning they're called only once in most cases
        entry = TP.sig.SignalMap.INTERESTS[orgid + '.' + signame];
        if (TP.notValid(entry)) {
            TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE) ?
                TP.trace(TP.join('Interest not found for: ',
                                    orgid, '.', signame),
                            TP.SIGNAL_LOG, arguments) : 0;

            aSignal.setOrigin(originalOrigin);

            return;
        }

        //  if the entire block of interests is suspended then do not
        //  notify
        if (entry.suspend === true) {
            TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE) ?
                TP.trace(TP.join('Interest for: ', orgid, '.', signame,
                                    ' is flagged as suspended.'),
                            TP.SIGNAL_LOG, arguments) : 0;

            aSignal.setOrigin(originalOrigin);

            return;
        }
    }

    // Get a shallow copy of the listeners so any handler activity that affects
    // the list won't affect our current iteration work.
    items = entry.listeners.slice(0);

    TP.ifTrace(TP.$$DEBUG && TP.sys.shouldLogSignals()) ?
        TP.trace(TP.join(orgid, ':', signame, ' has ', items.length,
                            ' listeners.'),
                    TP.SIGNAL_LOG, arguments) : 0;

    //  try/finally for signal stack
    try {
        //  make sure the signal stack is up to date by doing a
        //  "push" of the new signal
        $signal_stack.push(aSignal);
        $signal = aSignal;

        targetID = aSignal.getTargetGlobalID();

        for (i = 0; i < items.length; i++) {
            //  if we're asked to respect propagation check then check it
            if (check && aSignal.shouldStop()) {
                aSignal.setOrigin(originalOrigin);

                return;
            }

            item = items[i];

            //  if the specific handler is suspended or flagged for
            //  removal then just skip it
            if ((item.suspend === true) || (item.remove === true)) {
                TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE) ?
                        TP.trace('Listener ' + i +
                                 ' is suspended or removed.',
                                 TP.SIGNAL_LOG, arguments) : 0;

                continue;
            }

            if (TP.isFalse(capture)) {
                //  if capturing handlers are masked off, check and
                //  skip
                if (item.phase === 'capture') {
                    continue;
                }
            } else if (TP.isTrue(capture)) {
                if (item.phase !== 'capture') {
                    continue;
                }
            }

            //  to help with DOM filter and handler debugging we'll put
            //  a break option in
            TP.debug('break.signal_handler');

            //  if we're using strict XMLEvent or DOM firing then
            //  we have to check to see if the signal's target matches
            //  the specified dom_target if there is one
            if (TP.isTrue(checkTarget)) {
                xml_target = item.xml_target;
                observer = item.observer;

                if (TP.notEmpty(xml_target) && (xml_target !== TP.ANY)) {
                    if ((xml_target !== targetID) &&
                        (xml_target !== observer)) {
                        TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE) ?
                                TP.trace(TP.join('DOM target check ',
                                ' wanted: ', xml_target,
                                ' found: ', targetID,
                                '. Skipping listener: ',
                                TP.str(item)),
                                TP.SIGNAL_LOG, arguments) : 0;

                        continue;
                    }
                }
            }

            //  acquire a handle to an actual handler instance by
            //  asking TIBET for whatever object is found at that ID.
            //  Note that this allows handlers to be swapped out from
            //  under observations without affecting the signal map
            //  itself.
            handler = TP.byOID(item.handler);

            if (TP.notValid(handler)) {
                TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE) ?
                        TP.trace('Could not find handler with ID: ' +
                        item.handler,
                        TP.SIGNAL_LOG, arguments) : 0;
                continue;
            }

            if (TP.sys.shouldThrowHandlers()) {
                //  check for multiple notification bypass, or even a
                //  signal-configured ignore hook prior to firing
                if (!aSignal.isIgnoring(handler)) {
                    //  set up so we won't tell it again unless it
                    //  resets
                    aSignal.ignoreHandler(handler);

                    //  put a reference to the listener node itself
                    //  where the handler(s) can get to it when needed
                    aSignal.set('listener', item);

                    //  run the handler, making sure we can catch any
                    //  exceptions that are signaled
                    handler.handle(aSignal);
                }
            } else {
                try {
                    //  check for multiple notification bypass, or even
                    //  a signal-configured ignore hook prior to firing
                    if (!aSignal.isIgnoring(handler)) {
                        //  set up so we won't tell it again unless it
                        //  resets
                        aSignal.ignoreHandler(handler);

                        //  put a reference to the listener node itself
                        //  where the handler(s) can get to it when
                        //  needed
                        aSignal.set('listener', item);

                        //  run the handler, making sure we can catch
                        //  any exceptions that are signaled
                        handler.handle(aSignal);
                    }

                    //  TODO:   add check here regarding removal of the
                    //          handler? this would be an alternative to
                    //          cleanup policies, simply setting state
                    //          or adding functions to the handlers
                    //          themselves which return true when the
                    //          handler should be removed.

                    //          if so we can simply suspend the item so
                    //          it is skipped rather than removing the
                    //          node
                } catch (e) {
                    try {
                        //  see if we can get the actual function in
                        //  question so we have better debugging
                        //  capability
                        hFunc = handler.getHandler(aSignal);

                        if (TP.isCallable(hFunc)) {
                            TP.ifError() ?
                                    TP.error(
                                    TP.ec(e,
                                    TP.join('Error in: ', orgid,
                                            '.', signame,
                                            ' responder: ',
                                            handler.getID(),
                                            '\nhandler: ',
                                            hFunc.getName())),
                                    TP.SIGNAL_LOG,
                                    arguments) : 0;
                        } else {
                            TP.ifError() ?
                                    TP.error(
                                    TP.ec(e,
                                    TP.join('Error in: ', orgid,
                                            '.', signame,
                                            ' responder: ',
                                            handler.getID())),
                                    TP.SIGNAL_LOG,
                                    arguments) : 0;
                        }
                    } catch (e2) {
                    }

                    //  register the handler if TIBET is configured for
                    //  that so that the suspended function can be
                    //  acquired by the developer for debugging
                    if (TP.sys.shouldRegisterLoggers()) {
                        TP.sys.registerObject(handler, null, true);
                    }
                }
            }

            //  handle XML Events attributes for propagation etc.
            if (item.propagate === 'stop') {
                aSignal.stopPropagation(true);
            }

            if (item.defaultAction === 'cancel') {
                aSignal.preventDefault(true);
            }
        }

        aSignal.setOrigin(originalOrigin);
    } catch (e) {
            TP.ifError() ?
                TP.error(
                    TP.ec(e, TP.join('Problem executing handlers for: ',
                                    TP.str(aSignal))),
                    TP.SIGNAL_LOG,
                    arguments) : 0;
    } finally {
        //  "pop" the signal stack, throwing away the last signal
        //  and making the current signal the one at the end of the
        //  stack (or null)
        $signal = $signal_stack.pop();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('FIRE_ONE',
function(anOrigin, aSignal, aContext, aPayload, aType) {

    /**
     * @name FIRE_ONE
     * @synopsis Fires a single signal from a single origin. This is the routine
     *     which handles the majority of work in the signaling process.
     * @param {Object} anOrigin The originator of the signal.
     * @param {String|TP.sig.Signal} aSignal The signal to fire.
     * @param {Context} aContext The originating context.
     * @param {Object} aPayload Optional argument object.
     * @param {String|TP.sig.Signal} aType A default type to use when the signal
     *     type itself isn't found and a new signal subtype must be created.
     *     Defaults to TP.sig.Signal.
     * @returns {TP.sig.Signal} The signal.
     * @todo
     */

    var sig,
        orgid,
        signame,
        aSig,
        anOrg;

    //  allow default signaling with null origin/null signal...we don't
    //  construct the instance here so that the getSignalInstance() call can
    //  control behavior better
    aSig = TP.ifInvalid(aSignal, TP.sig.Signal);

    //  convert parameters into a valid signal instance
    sig = TP.sig.SignalMap.$getSignalInstance(aSig, aPayload, aType);
    if (!TP.isKindOf(sig, TP.sig.Signal)) {
        return;
    }

    //  ensure we've got a valid origin
    anOrg = TP.ifInvalid(anOrigin, TP.ANY);

    //  configure the signal instance
    sig.setOrigin(anOrg);
    sig.setContext(aContext);

    //  work with a consistent ID
    orgid = TP.id(anOrg);

    signame = sig.getSignalName();

    //  notify observers of the specific signal/origin pair
    TP.sig.SignalMap.notifyHandlers(orgid, signame, sig, true);

    //  if any of the handlers at this "level" said to stop then
    //  we stop now before traversing
    if (sig.shouldStop()) {
        sig.isRecyclable(true);

        return sig;
    }

    //  notify observers of the origin for TP.ANY signal (origins tend to be
    //  very specific IDs when they're not null)
    TP.sig.SignalMap.notifyHandlers(orgid, null, sig, true);

    //  notify observers of the signal from TP.ANY origin (unless we just
    //  if any of the handlers at this "level" said to stop then
    //  we stop now before traversing
    if (sig.shouldStop()) {
        sig.isRecyclable(true);

        return sig;
    }

    // Don't signal a potentially defaulted 'TP.ANY' origin multiple times.
    if (orgid !== TP.ANY) {
        TP.sig.SignalMap.notifyHandlers(null, signame, sig, true);
    }

    //  once the signal has been fired we can clear it for reuse
    sig.isRecyclable(true);

    return sig;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('DEFAULT_FIRING',
function(anOrigin, signalSet, aContext, aPayload, aType) {

    /**
     * @name DEFAULT_FIRING
     * @synopsis Fires a signal or set of signals from an origin. If a single
     *     signal/origin pair is provided this method defers to FIRE_ONE.
     * @param {Object} anOrigin The originator of the signal.
     * @param {String|TP.sig.Signal} aSignal The signal to fire.
     * @param {Context} aContext The originating context.
     * @param {Object} aPayload Optional argument object.
     * @param {String|TP.sig.Signal} aType A default type to use when the signal
     *     type itself isn't found and a new signal subtype must be created.
     *     Defaults to TP.sig.Signal.
     * @returns {TP.sig.Signal} The signal.
     * @todo
     */

    var policy,

        orgid,

        i,
        j,
        res;

    policy = TP.sig.SignalMap.FIRE_ONE;

    //  deal with possibility that origin IS an array
    if ((TP.isArray(anOrigin) && !anOrigin.isOriginSet()) ||
        (!TP.isArray(anOrigin))) {
        //  work with a consistent ID
        orgid = TP.id(anOrigin);

        //  only one origin
        if (TP.isArray(signalSet)) {
            //  array of signals but only the array as an origin
            for (j = 0; j < signalSet.getSize(); j++) {
                res = policy(
                    orgid, signalSet.at(j), aContext, aPayload, aType);
            }
        } else {
            //  one signal, one origin
            res = policy(orgid, signalSet, aContext, aPayload, aType);
        }
    } else if (TP.isArray(anOrigin)) {
        //  otherwise, its an Array, but its an Array of 'origin sets'.
        if (TP.isArray(signalSet)) {
            //  array of origins, array of signals
            for (i = 0; i < anOrigin.getSize(); i++) {
                //  work with a consistent ID
                orgid = TP.id(anOrigin.at(i));

                for (j = 0; j < signalSet.getSize(); j++) {
                    res = policy(
                        orgid, signalSet.at(j), aContext, aPayload, aType);
                }
            }
        } else {
            //  array of origins, one signal
            for (i = 0; i < anOrigin.getSize(); i++) {
                //  work with a consistent ID
                orgid = TP.id(anOrigin.at(i));

                res = policy(orgid, signalSet, aContext, aPayload, aType);
            }
        }
    }

    return res;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('DOM_FIRING',
function(originSet, aSignal, aContext, aPayload, aType) {

    /**
     * @name DOM_FIRING
     * @synopsis Fires signals across a series of origins which should be
     *     provided in DOM hierarchy order. The caller/signaler should have
     *     assembled the list prior to signaling. The behavior in this policy is
     *     intended to mirror the basic behavior of DOM2 signaling. The arm
     *     call's implementation ensures that the origin set is provided
     *     appropriately for this method.
     * @param {Array|Object} originSet The originator(s) of the signal. The
     *     array should be provided in order from window/document down to the
     *     target element and must be global String IDs. These are normally
     *     generated via UI.
     * @param {String|TP.sig.Signal} aSignal The signal to fire.
     * @param {Context} aContext The originating context.
     * @param {Object} aPayload Optional argument object.
     * @param {String|TP.sig.Signal} aType A default type to use when the signal
     *     type itself isn't found and a new signal subtype must be created.
     *     Defaults to TP.sig.Signal.
     * @returns {TP.sig.Signal} The signal.
     * @todo
     */

    var map,
        sig,
        signame,
        orgid,
        target,
        i,
        entry,
        orgids,
        originArray,
        len;

    TP.debug('break.signal_domfiring');

    //  in the DOM model we can only fire if we have a signal and origin
    if (TP.notValid(aSignal) || TP.notValid(originSet)) {
        return TP.sig.SignalMap.raise('TP.sig.InvalidDOMSignal', arguments);
    }

    map = TP.sig.SignalMap.INTERESTS;

    //  one or more origins are required...
    if (!TP.isArray(originSet)) {
        orgids = TP.ac(TP.id(originSet));
    } else {
        orgids = originSet.collect(
                    function(anOrigin) {

                        return TP.id(anOrigin);
                    });
    }

    //  get a valid signal instance configured
    sig = TP.sig.SignalMap.$getSignalInstance(aSignal, aPayload, aType);
    if (!TP.isKindOf(sig, TP.sig.Signal)) {
        return;
    }

    //  set up the signal name, using TP.ANY if we can't get one
    if (TP.isEmpty(signame = sig.getSignalName())) {
        signame = TP.ANY;
    }

    //  configure the signal instance with any passed argument data
    sig.setContext(aContext);

    //  set the phase to capturing to get started
    sig.setPhase(TP.CAPTURING_PHASE);

    //  without a target we've got trouble in DOM firing since the target
    //  defines when we stop capturing and start bubbling...
    target = sig.getTargetGlobalID();

    //  as we loop downward we'll keep track of orgids that have event
    //  listeners registered. this keeps us from doing the lookups twice
    originArray = TP.ac();

    //  loop down through the list until we reach the target, performing the
    //  lookups and notifying any capturing handlers as we descend
    len = orgids.getSize();
    for (i = 0; i < len; i++) {
        //  we enter this loop in capturing phase, so we want to do at least
        //  one pass before making any changes to phase etc.

        //  always work with ID's for map entries (GC issues)
        orgid = orgids.at(i);

        //  be sure to update the signal as we rotate orgids
        sig.setOrigin(orgid);

        if (TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE)) {
            TP.signal.$suspended = true;
            TP.sys.logSignal('Checking DOM_FIRING id ' +
                            orgid + '.' + signame,
                            TP.TRACE, arguments);
            TP.signal.$suspended = false;
        }

        //  if there's an entry for this origin/signal pair then we'll check
        //  it again when we do the bubbling pass...
        if (TP.isValid(entry = map[orgid + '.' + signame])) {
            if (TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE)) {
                TP.signal.$suspended = true;
                TP.sys.logSignal(TP.join('DOM_FIRING id ',
                                        orgid, '.', signame,
                                        ' found, preserving ', orgid),
                                    TP.TRACE,
                                    arguments);
                TP.signal.$suspended = false;
            }

            originArray.push(orgid);

            //  start with most specific, which is origin and signal
            //  listeners. this also happens to be all the DOM standard
            //  really supports, they don't have a way to specify any signal
            //  type from an origin
            TP.sig.SignalMap.notifyHandlers(orgid, signame, sig,
                                            false, true,
                                            entry, true);
        }

        if (TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE)) {
            TP.signal.$suspended = true;
            TP.sys.logSignal('Checking DOM_FIRING id ' +
                                orgid + '.' + TP.ANY,
                                TP.TRACE, arguments);
            TP.signal.$suspended = false;
        }

        //  as long as we didn't default the signal to "ANY" we'll check
        //  that as well
        if (signame !== TP.ANY) {
            //  if there's an entry for this origin and TP.ANY then we'll
            //  check it again when we do the bubbling pass...
            if (TP.isValid(entry = map[orgid + '.' + TP.ANY])) {
                if (TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE)) {
                    TP.signal.$suspended = true;
                    TP.sys.logSignal('DOM_FIRING id ' +
                                        orgid + '.' + TP.ANY +
                                        ' found, preserving ' + orgid,
                                        TP.TRACE, arguments);
                    TP.signal.$suspended = false;
                }

                if (originArray.last() !== orgid) {
                    originArray.push(orgid);
                }

                //  while we're dropping down we'll check this origin for
                //  any capturing handlers that are blanket signal handlers
                TP.sig.SignalMap.notifyHandlers(orgid, null, sig,
                                                false, true,
                                                entry, true);
            }
        }

        //  if any of the handlers at this origin "level" said to stop then
        //  we stop now before traversing to a new level in the DOM
        if (sig.shouldStop()) {
            return sig;
        }

        //  are we on the way down or up? if we've reached the target we'll
        //  want to stop once we do a final notification of any capturing
        //  handlers at the target level
        if (orgid === target) {
            sig.setPhase(TP.AT_TARGET);
            break;
        }
    }

    //  flip the origin array around so we work "bottom up" to bubble
    originArray.reverse();

    if (TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE)) {
        TP.signal.$suspended = true;
        TP.sys.logSignal(
            'Bubbling DOM_FIRING through preserved IDs: ' +
                    originArray.toString(),
                    TP.TRACE, arguments);
        TP.signal.$suspended = false;
    }

    //  now loop back through the bubbling list which was populated as we
    //  searched down toward the target. in most cases this list is a lot
    //  shorter than the downward list since most orgids don't have
    //  registrations
    len = originArray.getSize();
    for (i = 0; i < len; i++) {
        //  always work with ID's for map entries (GC issues)
        orgid = originArray.at(i);

        //  be sure to update the signal as we rotate orgids
        sig.setOrigin(orgid);

        //  continue with most specific, which is origin and signal pair.
        TP.sig.SignalMap.notifyHandlers(orgid, signame, sig,
                                        false, false,
                                        null, true);

        //  notifyHandlers will default null to TP.ANY so if we just did
        //  that one don't do it again
        if (signame !== TP.ANY) {
            //  next in bubble is for the origin itself, but any signal...
            TP.sig.SignalMap.notifyHandlers(orgid, null, sig,
                                            false, false,
                                            null, true);
        }

        //  if any of the handlers at this origin "level" said to stop then
        //  we stop now before traversing to a new level in the DOM
        if (sig.shouldStop()) {
            return sig;
        }

        //  once we've run through the target for bubbling handlers we'll
        //  set this to bubbling for the rest of the iterations
        if (sig.getPhase() === TP.AT_TARGET) {
            //  if the signal bubbles then we continue, otherwise we'll stop
            //  here
            if (!sig.isBubbling()) {
                break;
            }

            sig.setPhase(TP.BUBBLING_PHASE);
        }
    }

    //  reset the signal's origin so we don't confuse things in the final
    //  notification process by making it the original target ID
    sig.setOrigin(target);

    //  last but not least is the check for observers of the signal from any
    //  origin, but note that we only do this notification check once (since
    //  the signal name isn't changing during the DOM traversal process) and
    //  that we notify capturers, check for stopPropagation, then bubble
    TP.sig.SignalMap.notifyHandlers(null, signame, sig,
                                    false, true,
                                    null, true);

    if (sig.shouldStop()) {
        return sig;
    }

    TP.sig.SignalMap.notifyHandlers(null, signame, sig,
                                    false, false,
                                    null, true);

    return sig;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('RESPONDER_FIRING',
function(originSet, aSignal, aContext, aPayload, aType) {


    /**
     * @name RESPONDER_FIRING
     * @synopsis Fires signals across a series of responders which should be
     *     computed by asking the signal for its 'first responder' and then
     *     asking each responder to 'get its next responder' and then using that
     *     to go up the chain.
     * @param {Array|Object} originSet The originator(s) of the signal. Unused
     *     for this firing policy.
     * @param {String|TP.sig.Signal} aSignal The signal to fire.
     * @param {Context} aContext The originating context.
     * @param {Object} aPayload Optional argument object.
     * @param {String|TP.sig.Signal} aType A default type to use when the signal
     *     type itself isn't found and a new signal subtype must be created.
     *     Defaults to TP.sig.Signal.
     * @returns {TP.sig.Signal} The signal.
     * @todo
     */

    var sig,
        signame,

        targetResponder,

        respChain,

        i;

    TP.debug('break.signal_responderfiring');

    if (TP.notValid(aSignal)) {
        return TP.sig.SignalMap.raise('TP.sig.InvalidResponderSignal',
                                        arguments);
    }

    //  get a valid signal instance configured
    sig = TP.sig.SignalMap.$getSignalInstance(aSignal, aPayload, aType);
    if (!TP.isKindOf(sig, TP.sig.Signal)) {
        return;
    }

    //  set up the signal name, using TP.ANY if we can't get one
    if (TP.isEmpty(signame = sig.getSignalName())) {
        signame = TP.ANY;
    }

    //  configure the signal instance with any passed argument data
    sig.setContext(aContext);

    //  get the target responder
    targetResponder = sig.getTargetResponder();

    //  compute a responder chain. note here how we pass 'true' to tell the
    //  computation algorithm that we're computing for the 'capturing'
    //  phase.
    if (TP.notEmpty(respChain = TP.sig.SignalMap.$computeResponderChain(
                                        sig, targetResponder, true))) {
        //  populate the currently computed onto the signal. this allows
        //  handlers to access and manipulate the chain should they so
        //  desire.
        sig.set('currentChain', respChain);

        //  if the targetResponder itself is the last responder (because we
        //  passed 'true' above for 'capturing' phase, the responder chain
        //  Array will have been reverse()ed), then shift it off of there.

        //  We don't run its handler in capturing mode, but only in bubbling
        //  mode (after setting the phase to TP.AT_TARGET)
        if (TP.unwrap(respChain.last()) === TP.unwrap(targetResponder)) {
            respChain.shift();
        }

        //  start the process

        //  set the phase to capturing to get started
        sig.setPhase(TP.CAPTURING_PHASE);

        //  NB: We do *not* cache the responder chain size, but check it
        //  each time through the loop in case a handler has added or
        //  removed a responder.
        for (i = 0; i < respChain.getSize(); i++) {
            //  be sure to update the signal with the current origin as we
            //  traverse the responders
            sig.setOrigin(TP.gid(respChain.at(i)));

            //  execute the handler
            TP.handle(respChain.at(i), sig);

            //  if any of the handlers at this origin "level" said to stop
            //  then we stop now before traversing to a new level
            if (sig.shouldStop()) {
                return sig;
            }
        }
    }

    //  Recompute the responder chain again -- this time, passing 'false' as
    //  the parameter that determines whether we're capturing or not.
    if (TP.notEmpty(respChain = TP.sig.SignalMap.$computeResponderChain(
                                        sig, targetResponder, false))) {
        //  populate the currently computed onto the signal. this allows
        //  handlers to access and manipulate the chain should they so
        //  desire.
        sig.set('currentChain', respChain);

        //  if the targetResponder itself is the current responder (in
        //  'bubbling phase' it should always be the first one, if its a
        //  valid responder), then set the phase to TP.AT_TARGET and
        //  execute the handler.
        if (TP.unwrap(respChain.first()) === TP.unwrap(targetResponder)) {
            sig.setPhase(TP.AT_TARGET);

            //  be sure to update the signal with the origin
            sig.setOrigin(TP.gid(respChain.first()));

            //  execute the handler
            TP.handle(respChain.first(), sig);

            //  if any of the handlers at this origin "level" said to stop
            //  then we stop now before executing the bubbling handlers.
            if (sig.shouldStop()) {
                return sig;
            }

            //  We don't want to run this handler again, so shift it off the
            //  front
            respChain.shift();
        }

        //  if the signal bubbles then we continue, otherwise we'll stop
        //  here
        if (!sig.isBubbling()) {
            return sig;
        }

        //  we're bubbling... we're bubbling...
        sig.setPhase(TP.BUBBLING_PHASE);

        //  NB: We do *not* cache the responder chain size, but check it
        //  each time through the loop in case a handler has added or
        //  removed a responder.
        for (i = 0; i < respChain.getSize(); i++) {
            //  be sure to update the signal with the current origin as we
            //  traverse the responders
            sig.setOrigin(TP.gid(respChain.at(i)));

            //  execute the handler
            TP.handle(respChain.at(i), sig);

            //  if any of the handlers at this origin "level" said to stop
            //  then we stop now before traversing to a new level
            if (sig.shouldStop()) {
                return sig;
            }
        }
    }

    //  reset the signal's origin so we don't confuse things in the final
    //  notification process by making it the original target ID
    sig.setOrigin(targetResponder);

    return sig;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('EXCEPTION_FIRING',
function(anOrigin, signalSet, aContext, aPayload, aType) {

    /**
     * @name EXCEPTION_FIRING
     * @synopsis Fires a series of exceptions from the origin provided until a
     *     handler for one of the exception types/supertypes stops signal
     *     propagation.
     * @param {Object} anOrigin The originator of the signal.
     * @param {Array|TP.sig.Signal} signalSet The signal(s) to fire.
     * @param {Context} aContext The originating context.
     * @param {Object} aPayload Optional argument object.
     * @param {String|TP.sig.Signal} aType A default type to use when the signal
     *     type itself isn't found and a new signal subtype must be created.
     *     Defaults to TP.sig.Exception.
     * @returns {TP.sig.Signal} The signal.
     * @todo
     */

    var i,
        sig,
        orgid,
        signame,
        aSignal,
        orig,
        aSet;

    //  if no signal provided then bail out since we don't want to
    //  'infer' an exception
    if (TP.notValid(signalSet)) {
        return;
    }

    //  ensure we've got a valid origin if we do have a valid exception
    orig = TP.ifInvalid(anOrigin, TP.ANY);

    //  make sure signals are in an array for loop control. Creating the
    //  object is a little expensive but hey, we're processing an exception
    //  anyway at this point :)
    if (!TP.isArray(signalSet)) {
        aSet = TP.ac();
        aSet.push(signalSet);
    } else {
        aSet = signalSet;
    }

    //  the 'most specific' exception is the first one so we use it
    //  as the actual signal instance.
    aSignal = aSet.at(0);

    //  get a valid signal instance configured
    sig = TP.sig.SignalMap.$getSignalInstance(
                                aSignal,
                                aPayload,
                                TP.ifInvalid(aType, TP.sig.Exception));
    if (!TP.isKindOf(sig, TP.sig.Signal)) {
        return;
    }

    //  configure the signal instance
    sig.setContext(aContext);
    sig.setOrigin(orig);

    //  only one origin so fetch it now outside the loop
    orgid = TP.id(orig);

    //  process the list of alternative supertypes. note that there's an
    //  interesting check here to avoid lookup of origin/any observations
    //  more than once since that lookup's results can't change in the loop
    for (i = 0; i < aSet.getSize(); i++) {
        //  use data from array to work through the maps
        signame = aSet.at(i).getSignalName();

        //  notify specific observers for the signal/origin combo
        TP.sig.SignalMap.notifyHandlers(orgid, signame, sig, true);
        if (sig.shouldStop()) {
            break;
        }

        //  don't repeat if the signal name was already TP.ANY
        if (signame !== TP.ANY) {
            //  notify specific observers for the origin and any signal but
            //  only do this the first time through the loop (since the
            //  observation results won't change as we iterate)
            if (i === 0) {
                TP.sig.SignalMap.notifyHandlers(orgid, null, sig, true);
                if (sig.shouldStop()) {
                    break;
                }
            }
        }

        //  notify observers of the signal from any origin
        if (orgid !== TP.ANY) {
            TP.sig.SignalMap.notifyHandlers(null, signame, sig, true);
            if (sig.shouldStop()) {
                break;
            }
        }
    }

    return sig;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('INHERITANCE_FIRING',
function(anOrigin, aSignal, aContext, aPayload, aType) {

    /**
     * @name INHERITANCE_FIRING
     * @synopsis Fires a signal ensuring that observers of supertypes of that
     *     signal are notified. This is a single origin/single signal policy.
     * @param {Object} anOrigin The originator of the signal.
     * @param {TP.sig.Signal} aSignal The signal to fire.
     * @param {Context} aContext The originating context.
     * @param {Object} aPayload Optional argument object.
     * @param {String|TP.sig.Signal} aType A default type to use when the signal
     *     type itself isn't found and a new signal subtype must be created.
     *     Defaults to TP.sig.Signal.
     * @returns {TP.sig.Signal} The signal.
     * @todo
     */

    var aSig,

        orig,
        sig,
        orgid,

        type,

        signames,
        len,
        i,

        signame,

        isSpoofed;

    aSig = aSignal;

    if (TP.isArray(aSignal)) {
        if (aSignal.length >= 1) {
            TP.ifError() ?
                TP.error(
                    'Invalid Signal Array For Firing Policy. Truncating.',
                    TP.SIGNAL_LOG,
                    arguments) : 0;

            aSig = aSignal[0];
        }
        else    //  oops, empty array
        {
            TP.ifError() ?
                TP.error(
                    'Invalid Signal For Firing Policy. Terminating.',
                    TP.SIGNAL_LOG,
                    arguments) : 0;

            return;
        }
    }

    //  ensure we've got a valid origin
    orig = TP.ifInvalid(anOrigin, TP.ANY);

    //  get a valid signal instance configured
    sig = TP.sig.SignalMap.$getSignalInstance(aSig, aPayload, aType);
    if (!TP.isKindOf(sig, TP.sig.Signal)) {
        return;
    }

    //  configure the signal instance
    sig.setContext(aContext);
    sig.setOrigin(orig);

    orgid = TP.id(orig);

    //  process the list. as with exception firing we have a special test in
    //  this loop so we only look for origin/any observations once since the
    //  origin isn't changing during this loop
    type = sig.getType();

    signames = sig.getSignalNames();
    len = signames.getSize();

    for (i = 0; i < len; i++) {
        signame = signames.at(i);

        //  are we at Signal? top of signal hierarchy so stop here
        if (signame === 'TP.sig.Signal') {
            break;
        }

        //  notify specific observers for the signal/origin combo
        TP.sig.SignalMap.notifyHandlers(orgid, signame, sig, true);
        if (sig.shouldStop()) {
            break;
        }

        //  don't repeat if the signal name was already TP.ANY
        if (signame !== TP.ANY) {
            //  notify specific observers for the origin and any signal but
            //  only do this the first time through the loop (since the
            //  observation results won't change as we iterate)
            if (i === 0) {
                TP.sig.SignalMap.notifyHandlers(orgid, null, sig, true);
                if (sig.shouldStop()) {
                    break;
                }
            }
        }

        //  notify observers of the signal from any origin
        if (orgid !== TP.ANY) {
            TP.sig.SignalMap.notifyHandlers(null, signame, sig, true);
            if (sig.shouldStop()) {
                break;
            }
        }

        isSpoofed = sig.isSpoofed();

        //  is the signal a root (and not a spoofed) signal? we can stop
        //  looping then
        if (!isSpoofed && type.isSignalingRoot()) {
            break;
        }

        //  Is the signal spoofed? If so, this iteration (usually the first)
        //  of the loop should just continue with the current type.
        //  Otherwise, use the supertype.
        if (isSpoofed) {
                //  Leave 'type' at the current value. 'signame' will be set
                //  to the next value at the top of the loop.
        } else {
            type = type.getSupertype();
        }
    }

    return sig;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('REGISTER_CAPTURING',
function(anOrigin, aSignal, aHandler) {

    /**
     * @name REGISTER_CAPTURING
     * @synopsis Handles registration of a capturing handler for the
     *     registration data provided.
     * @description One feature yet to be added is the concept of a "cleanup
     *     policy". We want registrations to occur in which the observer
     *     specifies when to clean them out or "auto-ignore" them. A couple
     *     obvious policies would be to remove the observer after a certain
     *     number of invocations (like 1), after a particular time, or if some
     *     conditional test returns true/false which is the general case of how
     *     all other cleanup policies would be implemented -- as tests which if
     *     the return true will cause removal of the registration.
     * @param {String} anOrigin The origin to register interest in.
     * @param {TP.sig.Signal|String} aSignal The signal or signal name to
     *     register interest in.
     * @param {Object|String} aHandler The handler or handler ID being
     *     registered.
     * @todo
     */

    var orgid,
        signame;

    //  can't register without a handler
    if (TP.notValid(aHandler)) {
        return;
    }

    signame = TP.sig.SignalMap.$computeSignalName(aSignal);

    if (TP.isValid(anOrigin)) {
        //  activate change notification as needed
        if (/Change/.test(signame)) {
            if (TP.isMutable(anOrigin)) {
                //  not a String ID
                anOrigin.shouldSignalChange(true);
            } else {
                //  a string ID -- try to get handle to obj
                /*
                (ss)    commented out to avoid excessive overhead
                inst = TP.byOID(anOrigin.getID());
                if (TP.isMutable(inst)) {
                    inst.shouldSignalChange(true);
                };
                */
            }
        }

        orgid = TP.id(anOrigin);
    } else {
        orgid = TP.ANY;
    }

    //  register the interest, passing true so the capture attribute is set
    return TP.sig.SignalMap.$registerInterest(
                            orgid, signame, aHandler, true);
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('REGISTER_NONCAPTURING',
function(anOrigin, aSignal, aHandler) {

    /**
     * @name REGISTER_NONCAPTURING
     * @synopsis Handles registration of a non-capturing handler for the
     *     registration data provided.
     * @param {String} anOrigin The origin to register interest in.
     * @param {TP.sig.Signal|String} aSignal The signal or signal name to
     *     register interest in.
     * @param {Object|String} aHandler The handler or handler ID being
     *     registered.
     * @todo
     */

    var orgid,
        signame;

    //  can't register without a handler
    if (TP.notValid(aHandler)) {
        return;
    }

    signame = TP.sig.SignalMap.$computeSignalName(aSignal);

    if (TP.isValid(anOrigin)) {
        //  activate change notification as needed
        if (/Change/.test(signame)) {
            if (TP.isMutable(anOrigin)) {
                //  not a String ID
                anOrigin.shouldSignalChange(true);
            } else {
                //  a string ID -- try to get handle to obj
                /*
                (ss)    commented out to avoid excessive overhead
                inst = TP.byOID(anOrigin.getID());
                if (TP.isMutable(inst)) {
                    inst.shouldSignalChange(true);
                };
                */
            }
        }

        orgid = TP.id(anOrigin);
    } else {
        orgid = TP.ANY;
    }

    //  register the interest, passing false so capture is off
    return TP.sig.SignalMap.$registerInterest(
                            orgid, signame, aHandler, false);
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('REMOVE_CAPTURING',
function(anOrigin, aSignal, aHandler) {

    /**
     * @name REMOVE_CAPTURING
     * @synopsis Removes registration of a capturing handler for the
     *     registration data provided. If no handler is provided ALL capturing
     *     notifications for the signal/origin pair are removed.
     * @param {String} anOrigin The origin to register interest in.
     * @param {TP.sig.Signal|String} aSignal The signal or signal name to
     *     register interest in.
     * @param {Object|String} aHandler The handler or handler ID being
     *     registered.
     * @todo
     */

    var orgid,
        signame;

    orgid = TP.sig.SignalMap.$computeOriginID(anOrigin);
    signame = TP.sig.SignalMap.$computeSignalName(aSignal);

    return TP.sig.SignalMap.$removeInterest(
                            orgid, signame, aHandler, true);
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('REMOVE_NONCAPTURING',
function(anOrigin, aSignal, aHandler) {

    /**
     * @name REMOVE_NONCAPTURING
     * @synopsis Removes registration of a non-capturing handler for the
     *     registration data provided. If no handler is provided ALL capturing
     *     notifications for the signal/origin pair are removed.
     * @param {String} anOrigin The origin to register interest in.
     * @param {TP.sig.Signal|String} aSignal The signal or signal name to
     *     register interest in.
     * @param {Object|String} aHandler The handler or handler ID being
     *     registered.
     * @todo
     */

    var orgid,
        signame;

    orgid = TP.sig.SignalMap.$computeOriginID(anOrigin);
    signame = TP.sig.SignalMap.$computeSignalName(aSignal);

    return TP.sig.SignalMap.$removeInterest(
                            orgid, signame, aHandler, false);
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('RESUME',
function(anOrigin, aSignal) {

    /**
     * @name RESUME
     * @param {String} anOrigin The origin to resume interest in.
     * @param {TP.sig.Signal|String} aSignal The signal or signal name to resume
     *     interest in.
     * @abtract Resumes signaling status for a particular origin/signal pair.
     * @todo
     */

    var entry,
        orgid,
        signame;

    orgid = TP.sig.SignalMap.$computeOriginID(anOrigin);
    signame = TP.sig.SignalMap.$computeSignalName(aSignal);

    entry = TP.sig.SignalMap.INTERESTS[orgid + '.' + signame];
    if (TP.isValid(entry)) {
        delete entry.suspend;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('SUSPEND',
function(anOrigin, aSignal) {

    /**
     * @name SUSPEND
     * @synopsis Suspends signaling status for a particular origin/signal pair.
     * @param {String} anOrigin The origin to suspend interest in.
     * @param {TP.sig.Signal|String} aSignal The signal or signal name to
     *     suspend interest in.
     * @todo
     */

    var entry,
        orgid,
        signame;

    orgid = TP.sig.SignalMap.$computeOriginID(anOrigin);
    signame = TP.sig.SignalMap.$computeSignalName(aSignal);

    entry = TP.sig.SignalMap.INTERESTS[orgid + '.' + signame];
    if (TP.isValid(entry)) {
        entry.suspend = true;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.$ignore = function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @name $ignore
     * @synopsis The primary observation removal method. This method is
     *     typically invoked via the ignore instance method on most objects, you
     *     don't normally need to invoke it yourself.
     * @param {Object|Array} anOrigin An origin (or origins) to ignore.
     * @param {TP.sig.Signal|String|Array} aSignal A signal (or signals) to
     *     ignore from the origin(s).
     * @param {Function} aHandler The specific handler to turn off, if any.
     * @param {Function} aPolicy The policy if any. Should be 'capture' to
     *     remove capturing handlers. Default is non-capturing.
     * @todo
     */

    var origins,
        len,
        i,

        origin,
        adjustMap,

        typenames,

        typename,
        type,
        owner,

        signal,
        policy;

    if (!TP.isArray(origins = anOrigin)) {
        origins = TP.ac(anOrigin);
        origins.isOriginSet(true);
    }

    len = origins.getSize();
    for (i = 0; i < len; i++) {
        //  all observations are done conditionally based on whether the
        //  origin or "owner" of a particular signal wants to adjust the map
        //  after being given the chance to handle them directly.
        origin = TP.isTypeName(origins.at(i)) ?
                    TP.sys.require(origins.at(i)) :
                    origins.at(i);

        if (TP.canInvoke(origin, 'removeObserver')) {
            //  If we were supplied a String, make sure it's a fully
            //  expanded signal name.
            if (TP.isString(aSignal)) {
                typename = TP.expandSignalName(aSignal);
                if (!TP.isType(signal = TP.sys.require(typename))) {
                    //  Must be a spoofed signal - just use original name.
                    signal = aSignal;
                }
            } else {
                signal = aSignal;
            }

            adjustMap = origin.removeObserver(origin, signal,
                                                aHandler, aPolicy);
            if (!adjustMap) {
                return;
            }
        }
    }

    if (!TP.isArray(typenames = aSignal)) {
        typenames = TP.ac(aSignal);
        typenames.isOriginSet(true);
    }

    len = typenames.getSize();
    for (i = 0; i < len; i++) {
        //  NB: We go after the signal name and then unescape it here,
        //  rather than the actual type name. This is done because of
        //  spoofed signals.
        typename = TP.isString(typenames.at(i)) ?
                                typenames.at(i) :
                                typenames.at(i).getSignalName();

        //  Go ahead and make sure the signal name is fully expanded. If its
        //  a real signal name, but the user was using the short name, then
        //  the 'require' below will find its fully expanded form.
        //  Otherwise, if it's a 'spoofed' name, then require won't find it
        //  and 'type' will end up null (which is what we want).
        typename = TP.expandSignalName(typename);

        //  some events require interaction with an "owner", typically a
        //  TP.core.Device, responsible for events of that type which may
        //  also decide to manage observations directly
        type = TP.isTypeName(typename) ?
                TP.sys.require(typename) :
                typename;

        //  special case here for keyboard events since their names are
        //  often synthetic and we have to map to the true native event
        if (!TP.isType(type)) {
            if (TP.regex.KEY_EVENT.test(typename)) {
                type = TP.sys.require('TP.sig.DOMKeySignal');
            }
        }

        if (TP.isType(type) &&
            TP.canInvoke(type, 'getSignalOwner') &&
            TP.isValid(owner = type.getSignalOwner())) {
            if ((owner !== origin) && TP.canInvoke(owner, 'removeObserver')) {
                adjustMap = owner.removeObserver(anOrigin, typename,
                                                    aHandler, aPolicy);
                if (!adjustMap) {
                    return;
                }
            }
        }
    }

    origin = TP.ifInvalid(anOrigin, TP.ANY);

    if (TP.isEmpty(aSignal)) {
        //  It's empty, which means ANY
        signal = TP.ANY;
    } else if (TP.notEmpty(typename = TP.expandSignalName(aSignal)) &&
                TP.isType(TP.sys.require(typename))) {
        //  It's a real type.
        signal = typename;
    } else {
        //  Can't resolve to a type name - must be a spoofed signal
        signal = aSignal;
    }

    policy = TP.ifInvalid(aPolicy, TP.sig.SignalMap.REMOVE_NONCAPTURING);

    //  check on policy
    if (!TP.isCallable(policy)) {
        if (TP.isCallable(TP.sig.SignalMap[policy])) {
            policy = TP.sig.SignalMap[policy];
        } else if (TP.isString(policy) && policy.toLowerCase() === 'capture') {
            policy = TP.sig.SignalMap.REMOVE_CAPTURING;
        } else {
            policy = TP.sig.SignalMap.REMOVE_NONCAPTURING;
        }
    }

    return TP.sig.SignalMap.$invokePolicy(origin, signal, aHandler, policy);
};

//  ------------------------------------------------------------------------

TP.sig.SignalMap.$invokePolicy = function(origins, signals, handler, policy) {

    /**
     * @name $invokePolicy
     * @synopsis General purpose signal invocation method. Each policy gets
     *     invoked from this entry point.
     * @param {Object|Array} origins An origin or origins.
     * @param {TP.sig.Signal|Array} signals A signal or signals.
     * @param {Function} handler The handler if any.
     * @param {Function} policy The policy if any.
     * @todo
     */

    var i,
        j;

    //  deal with possibility that origin IS an array
    if ((TP.isArray(origins) && !origins.isOriginSet()) ||
        (!TP.isArray(origins))) {
        //  only one origin
        if (TP.isArray(signals)) {
            //  array of signals but only the array as an origin
            for (j = 0; j < signals.getSize(); j++) {
                policy(origins, signals.at(j), handler);
            }
        } else {
            //  one signal, one origin
            policy(origins, signals, handler);
        }
    } else if (TP.isArray(origins)) {
        if (TP.isArray(signals)) {
            //  array of origins, array of signals
            for (i = 0; i < origins.getSize(); i++) {
                for (j = 0; j < signals.getSize(); j++) {
                    policy(origins.at(i), signals.at(j), handler);
                }
            }
        } else {
            //  array of origins, one signal
            for (i = 0; i < origins.getSize(); i++) {
                policy(origins.at(i), signals, handler);
            }
        }
    }

    return;
};

//  ------------------------------------------------------------------------

TP.sig.SignalMap.$observe = function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @name $observe
     * @synopsis The primary observation installation method. This method is
     *     typically invoked via the observe instance method on most objects,
     *     you don't normally need to invoke it yourself.
     * @param {Object|Array} anOrigin An origin (or origins) to observe.
     * @param {TP.sig.Signal|String|Array} aSignal A signal (or signals) to
     *     observe from the origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @param {Function} aPolicy The policy if any. Should be 'capture' to
     *     configure a capturing handler. Default is non-capturing.
     * @todo
     */

    var origins,
        len,
        i,

        origin,
        adjustMap,

        typenames,

        typename,
        type,
        owner,

        signal,
        policy;

    if (TP.notValid(aHandler)) {
        TP.ifError() ?
            TP.error('Invalid signal handler.',
                        TP.SIGNAL_LOG,
                        arguments) : 0;

        return;
    }

    if (!TP.isArray(origins = anOrigin)) {
        origins = TP.ac(anOrigin);
        origins.isOriginSet(true);
    }

    len = origins.getSize();
    for (i = 0; i < len; i++) {
        //  all observations are done conditionally based on whether the
        //  origin or "owner" of a particular signal wants to adjust the map
        //  after being given the chance to handle them directly.
        origin = TP.isTypeName(origins.at(i)) ?
                    TP.sys.require(origins.at(i)) :
                    origins.at(i);

        if (TP.canInvoke(origin, 'addObserver')) {
            //  If we were supplied a String, make sure it's a fully
            //  expanded signal name.
            if (TP.isString(aSignal)) {
                typename = TP.expandSignalName(aSignal);
                if (!TP.isType(signal = TP.sys.require(typename))) {
                    //  Must be a spoofed signal - just use original name.
                    signal = aSignal;
                }
            } else {
                signal = aSignal;
            }

            adjustMap = origin.addObserver(origin, signal,
                                            aHandler, aPolicy);
            if (!adjustMap) {
                return;
            }
        }
    }

    if (!TP.isArray(typenames = aSignal)) {
        typenames = TP.ac(aSignal);
        typenames.isOriginSet(true);
    }

    len = typenames.getSize();
    for (i = 0; i < len; i++) {
        //  NB: We go after the signal name and then unescape it here,
        //  rather than the actual type name. This is done because of
        //  spoofed signals.
        typename = TP.isString(typenames.at(i)) ?
                                typenames.at(i) :
                                typenames.at(i).getSignalName();

        //  Go ahead and make sure the signal name is fully expanded. If its
        //  a real signal name, but the user was using the short name, then
        //  the 'require' below will find its fully expanded form.
        //  Otherwise, if it's a 'spoofed' name, then require won't find it
        //  and 'type' will end up null (which is what we want).
        typename = TP.expandSignalName(typename);

        //  some events require interaction with an "owner", typically a
        //  TP.core.Device, responsible for events of that type which may
        //  also decide to manage observations directly
        type = TP.isTypeName(typename) ?
                TP.sys.require(typename) :
                typename;

        //  special case here for keyboard events since their names are
        //  often synthetic and we have to map to the true native event
        if (!TP.isType(type)) {
            if (TP.regex.KEY_EVENT.test(typename)) {
                type = TP.sys.require('TP.sig.DOMKeySignal');
            }
        }

        if (TP.isType(type) &&
            TP.canInvoke(type, 'getSignalOwner') &&
            TP.isValid(owner = type.getSignalOwner())) {
            if ((owner !== origin) && TP.canInvoke(owner, 'addObserver')) {
                adjustMap = owner.addObserver(anOrigin, typename,
                                                aHandler, aPolicy);
                if (!adjustMap) {
                    return;
                }
            }
        }
    }

    origin = TP.ifInvalid(anOrigin, TP.ANY);

    if (TP.isEmpty(aSignal)) {
        //  It's empty, which means ANY
        signal = TP.ANY;
    } else if (TP.notEmpty(typename = TP.expandSignalName(aSignal)) &&
                TP.isType(TP.sys.require(typename))) {
        //  It's a real type.
        signal = typename;
    } else {
        //  Can't resolve to a type name - must be a spoofed signal
        signal = aSignal;
    }

    policy = TP.ifInvalid(aPolicy, TP.sig.SignalMap.REGISTER_NONCAPTURING);

    //  check on policy
    if (!TP.isCallable(policy)) {
        if (TP.isCallable(TP.sig.SignalMap[policy])) {
            policy = TP.sig.SignalMap[policy];
        } else if (TP.isString(policy) && policy.toLowerCase() === 'capture') {
            policy = TP.sig.SignalMap.REGISTER_CAPTURING;
        } else {
            policy = TP.sig.SignalMap.REGISTER_NONCAPTURING;
        }
    }

    return TP.sig.SignalMap.$invokePolicy(origin, signal, aHandler, policy);
};

//  ------------------------------------------------------------------------

TP.sig.SignalMap.$resume = function(anOrigin, aSignal) {

    /**
     * @name $resume
     * @synopsis The primary observation resume method. When an observation has
     *     been suspended this method will resume active notifications for it.
     * @param {Object|Array} anOrigin An origin (or origins) to resume
     *     notifications for.
     * @param {TP.sig.Signal|String|Array} aSignal A signal (or signals) to
     *     resume signaling from the origin(s).
     * @todo
     */

    var origins,
        len,
        i,

        origin,
        adjustMap,

        typenames,

        typename,
        type,
        owner,

        signal,
        policy;

    if (!TP.isArray(origins = anOrigin)) {
        origins = TP.ac(anOrigin);
        origins.isOriginSet(true);
    }

    len = origins.getSize();
    for (i = 0; i < len; i++) {
        //  all observations are done conditionally based on whether the
        //  origin or "owner" of a particular signal wants to adjust the map
        //  after being given the chance to handle them directly.
        origin = TP.isTypeName(origins.at(i)) ?
                    TP.sys.require(origins.at(i)) :
                    origins.at(i);

        if (TP.canInvoke(origin, 'resumeObserver')) {
            //  If we were supplied a String, make sure it's a fully
            //  expanded signal name.
            if (TP.isString(aSignal)) {
                typename = TP.expandSignalName(aSignal);
                if (!TP.isType(signal = TP.sys.require(typename))) {
                    //  Must be a spoofed signal - just use original name.
                    signal = aSignal;
                }
            } else {
                signal = aSignal;
            }

            adjustMap = origin.resumeObserver(origin, signal);
            if (!adjustMap) {
                return;
            }
        }
    }

    if (!TP.isArray(typenames = aSignal)) {
        typenames = TP.ac(aSignal);
        typenames.isOriginSet(true);
    }

    len = typenames.getSize();
    for (i = 0; i < len; i++) {
        //  NB: We go after the signal name and then unescape it here,
        //  rather than the actual type name. This is done because of
        //  spoofed signals.
        typename = TP.isString(typenames.at(i)) ?
                                typenames.at(i) :
                                typenames.at(i).getSignalName();

        //  Go ahead and make sure the signal name is fully expanded. If its
        //  a real signal name, but the user was using the short name, then
        //  the 'require' below will find its fully expanded form.
        //  Otherwise, if it's a 'spoofed' name, then require won't find it
        //  and 'type' will end up null (which is what we want).
        typename = TP.expandSignalName(typename);

        //  some events require interaction with an "owner", typically a
        //  TP.core.Device, responsible for events of that type which may
        //  also decide to manage observations directly
        type = TP.isTypeName(typename) ?
                TP.sys.require(typename) :
                typename;

        //  special case here for keyboard events since their names are
        //  often synthetic and we have to map to the true native event
        if (!TP.isType(type)) {
            if (TP.regex.KEY_EVENT.test(typename)) {
                type = TP.sys.require('TP.sig.DOMKeySignal');
            }
        }

        if (TP.isType(type) &&
            TP.canInvoke(type, 'getSignalOwner') &&
            TP.isValid(owner = type.getSignalOwner())) {
            if ((owner !== origin) && TP.canInvoke(owner, 'resumeObserver')) {
                adjustMap = owner.resumeObserver(anOrigin, typename);
                if (!adjustMap) {
                    return;
                }
            }
        }
    }

    origin = TP.ifInvalid(anOrigin, TP.ANY);

    if (TP.isEmpty(aSignal)) {
        //  It's empty, which means ANY
        signal = TP.ANY;
    } else if (TP.notEmpty(typename = TP.expandSignalName(aSignal)) &&
                TP.isType(TP.sys.require(typename))) {
        //  It's a real type.
        signal = typename;
    } else {
        //  Can't resolve to a type name - must be a spoofed signal
        signal = aSignal;
    }

    policy = TP.sig.SignalMap.RESUME;

    return TP.sig.SignalMap.$invokePolicy(origin, signal, null, policy);
};

//  ------------------------------------------------------------------------

TP.sig.SignalMap.$suspend = function(anOrigin, aSignal) {

    /**
     * @name $suspend
     * @synopsis The primary observation suspention method. When an observation
     *     has been suspended the registration is maintained but notifications
     *     are not made until a TP.resume().
     * @param {Object|Array} anOrigin An origin (or origins) to suspend
     *     notifications for.
     * @param {TP.sig.Signal|String|Array} aSignal A signal (or signals) to
     *     suspend signaling from the origin(s).
     * @todo
     */

    var origins,
        len,
        i,

        origin,
        adjustMap,

        typenames,

        typename,
        type,
        owner,

        signal,
        policy;

    if (!TP.isArray(origins = anOrigin)) {
        origins = TP.ac(anOrigin);
        origins.isOriginSet(true);
    }

    len = origins.getSize();
    for (i = 0; i < len; i++) {
        //  all observations are done conditionally based on whether the
        //  origin or "owner" of a particular signal wants to adjust the map
        //  after being given the chance to handle them directly.
        origin = TP.isTypeName(origins.at(i)) ?
                    TP.sys.require(origins.at(i)) :
                    origins.at(i);

        if (TP.canInvoke(origin, 'suspendObserver')) {
            //  If we were supplied a String, make sure it's a fully
            //  expanded signal name.
            if (TP.isString(aSignal)) {
                typename = TP.expandSignalName(aSignal);
                if (!TP.isType(signal = TP.sys.require(typename))) {
                    //  Must be a spoofed signal - just use original name.
                    signal = aSignal;
                }
            } else {
                signal = aSignal;
            }

            adjustMap = origin.suspendObserver(origin, signal);
            if (!adjustMap) {
                return;
            }
        }
    }

    if (!TP.isArray(typenames = aSignal)) {
        typenames = TP.ac(aSignal);
        typenames.isOriginSet(true);
    }

    len = typenames.getSize();
    for (i = 0; i < len; i++) {
        //  NB: We go after the signal name and then unescape it here,
        //  rather than the actual type name. This is done because of
        //  spoofed signals.
        typename = TP.isString(typenames.at(i)) ?
                                typenames.at(i) :
                                typenames.at(i).getSignalName();

        //  Go ahead and make sure the signal name is fully expanded. If its
        //  a real signal name, but the user was using the short name, then
        //  the 'require' below will find its fully expanded form.
        //  Otherwise, if it's a 'spoofed' name, then require won't find it
        //  and 'type' will end up null (which is what we want).
        typename = TP.expandSignalName(typename);

        //  some events require interaction with an "owner", typically a
        //  TP.core.Device, responsible for events of that type which may
        //  also decide to manage observations directly
        type = TP.isTypeName(typename) ?
                TP.sys.require(typename) :
                typename;

        //  special case here for keyboard events since their names are
        //  often synthetic and we have to map to the true native event
        if (!TP.isType(type)) {
            if (TP.regex.KEY_EVENT.test(typename)) {
                type = TP.sys.require('TP.sig.DOMKeySignal');
            }
        }

        if (TP.isType(type) &&
            TP.canInvoke(type, 'getSignalOwner') &&
            TP.isValid(owner = type.getSignalOwner())) {
            if ((owner !== origin) &&
                TP.canInvoke(owner, 'suspendObserver')) {
                adjustMap = owner.suspendObserver(anOrigin, typename);
                if (!adjustMap) {
                    return;
                }
            }
        }
    }

    origin = TP.ifInvalid(anOrigin, TP.ANY);

    if (TP.isEmpty(aSignal)) {
        //  It's empty, which means ANY
        signal = TP.ANY;
    } else if (TP.notEmpty(typename = TP.expandSignalName(aSignal)) &&
                TP.isType(TP.sys.require(typename))) {
        //  It's a real type.
        signal = typename;
    } else {
        //  Can't resolve to a type name - must be a spoofed signal
        signal = aSignal;
    }

    policy = TP.sig.SignalMap.SUSPEND;

    return TP.sig.SignalMap.$invokePolicy(origin, signal, null, policy);
};

//  ------------------------------------------------------------------------

//  configure methods for reflection
TP.sig.SignalMap.$ignore[TP.NAME] = '$ignore';
TP.sig.SignalMap.$ignore[TP.OWNER] = TP.sig.SignalMap;
TP.sig.SignalMap.$ignore[TP.TRACK] = 'Type';
TP.sig.SignalMap.$ignore[TP.DISPLAY] = 'TP.sig.SignalMap.Type.$ignore';

TP.sig.SignalMap.$invokePolicy[TP.NAME] = '$invokePolicy';
TP.sig.SignalMap.$invokePolicy[TP.OWNER] = TP.sig.SignalMap;
TP.sig.SignalMap.$invokePolicy[TP.TRACK] = 'Type';
TP.sig.SignalMap.$ignore[TP.DISPLAY] = 'TP.sig.SignalMap.Type.$invokePolicy';

TP.sig.SignalMap.$observe[TP.NAME] = '$observe';
TP.sig.SignalMap.$observe[TP.OWNER] = TP.sig.SignalMap;
TP.sig.SignalMap.$observe[TP.TRACK] = 'Type';
TP.sig.SignalMap.$ignore[TP.DISPLAY] = 'TP.sig.SignalMap.Type.$observe';

TP.sig.SignalMap.$resume[TP.NAME] = '$resume';
TP.sig.SignalMap.$resume[TP.OWNER] = TP.sig.SignalMap;
TP.sig.SignalMap.$resume[TP.TRACK] = 'Type';
TP.sig.SignalMap.$ignore[TP.DISPLAY] = 'TP.sig.SignalMap.Type.$resume';

TP.sig.SignalMap.$suspend[TP.NAME] = '$suspend';
TP.sig.SignalMap.$suspend[TP.OWNER] = TP.sig.SignalMap;
TP.sig.SignalMap.$suspend[TP.TRACK] = 'Type';
TP.sig.SignalMap.$ignore[TP.DISPLAY] = 'TP.sig.SignalMap.Type.$suspend';

//  ------------------------------------------------------------------------
//  GLOBAL SIGNALING PRIMITIVES
//  ------------------------------------------------------------------------

/*
Now that most of the infrastructure is in place we can start installing the
working versions of the signaling primitives.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('signal',
function(anOrigin, aSignal, aContext, aPayload, aPolicy, aType, isCancelable, isBubbling) {

    /**
     * @name signal
     * @synopsis Signals activity to registered observers. Any additional
     *     arguments are passed to the registered handlers along with the origin
     *     and event.
     * @param {Object} anOrigin The originator of the signal.
     * @param {String|TP.sig.Signal} aSignal The signal to fire.
     * @param {Context} aContext The originating context.
     * @param {Object} aPayload Optional argument object.
     * @param {Function} aPolicy A "firing" policy that will define how the
     *     signal is fired.
     * @param {String|TP.sig.Signal} aType A default type to use when the signal
     *     type itself isn't found and a new signal subtype must be created.
     *     Defaults to TP.sig.Signal.
     * @param {Boolean} isCancelable Optional flag for dynamic signals defining
     *     if they can be cancelled.
     * @param {Boolean} isBubbling Optional flag for dynamic signals defining
     *     whether they bubble (when using TP.DOM_FIRING).
     * @returns {TP.sig.Signal} The fired signal.
     * @todo
     */

    var origin,
        type,
        owner,
        shouldSignalMap,

        signame,

        pol,
        orgstr,
        sigstr,
        sigtype,
        sig,
        loggable,
        str,
        end,
        delta,
        flag;

    //  sometimes we can get lucky if a recursion includes signaling
    TP.sys.trapRecursion(true, false);

    //  see if ignore is on at the 'TP' level, meaning the TP.signal() call
    //  itself has been suspended
    if (TP.signal.$suspended) {
        return;
    }

    //  all observations are done conditionally based on whether the origin
    //  or "owner" of a particular signal wants to signal the map after
    //  being given the chance to handle them directly.
    origin = TP.isTypeName(anOrigin) ? TP.sys.require(anOrigin) : anOrigin;
    if (TP.canInvoke(origin, 'signalObservers')) {
        shouldSignalMap = origin.signalObservers(
                                            anOrigin, aSignal, aContext,
                                            aPayload, aPolicy, aType,
                                            isCancelable, isBubbling);
        if (!shouldSignalMap) {
            return;
        }
    }

    //  NB: We go after the signal name and then unescape it here, rather
    //  than the actual type name. This is done because of spoofed signals.
    signame = TP.isString(aSignal) ? aSignal : aSignal.getSignalName();

    //  some events require interaction with an "owner", typically a
    //  TP.core.Device, responsible for events of that type which may also
    //  decide to manage observations directly
    type = TP.isTypeName(signame) ? TP.sys.require(signame) : signame;

    //  special case here for keyboard events since their names are often
    //  synthetic and we have to map to the true native event
    if (TP.notValid(type)) {
        if (TP.regex.KEY_EVENT.test(signame)) {
            type = TP.sys.require('TP.sig.DOMKeySignal');
        }
    }

    if (TP.canInvoke(type, 'getSignalOwner') &&
        TP.isValid(owner = type.getSignalOwner())) {
        if ((owner !== origin) && TP.canInvoke(owner, 'signalObservers')) {
            shouldSignalMap = owner.signalObservers(
                                                anOrigin, aSignal, aContext,
                                                aPayload, aPolicy, aType,
                                                isCancelable, isBubbling);
            if (!shouldSignalMap) {
                return;
            }
        }
    }

    //  watch out for DOMFocus signals trying to work between the tools and
    //  the debugger...basically unusable in that mode
    TP.debug(TP.sys.cfg('break.signal') &&
                (TP.name(aSignal).indexOf('DOMFocus') !== 0));

    if (TP.sys.cfg('break.signal_exception')) {
        if (/Invalid|Exception/.test(aSignal) ||
            TP.isKindOf(aSignal, TP.sig.Exception)) {
            TP.debug();
        }
    }

    //  TODO:   make the default signaling policy an attribute of the
    //          signaling system somewhere so that it can be configured.

    //  see if ignore is on at the 'origin' level, meaning we're not
    //  currently allowing any signals from that origin to flow
    if (TP.isValid(anOrigin)) {
        if (anOrigin.$suspended) {
            return TP.sys.fireNextSignal();
        }
    }

    //  if signaling is turned off then do not notify
    if (TP.sig.SignalMap.INTERESTS.suspend === true) {
        if (TP.ifTrace(TP.$DEBUG && TP.$$VERBOSE)) {
            TP.sys.logSignal('Root interest map is suspended.',
                            TP.TRACE, arguments);
        }

        return;
    }

    //  don't log signals when processing events from the other logs to
    //  help reduce the potential for recursive logging. The activity and
    //  error logs, as well as the signal log itself, are definite no-nos.
    if (TP.sys.shouldLogSignals() &&
        (anOrigin !== TP.sys.$changeLog) &&
        (anOrigin !== TP.sys.$patchLog) &&
        (anOrigin !== TP.sys.$activityLog)) {

        sigstr = aSignal.getSignalName();
        sigtype = TP.sig.SignalMap.$getSignalType(aSignal);
        loggable = TP.canInvoke(sigtype, 'shouldLog') ?
                                sigtype.shouldLog() :
                                false;

        if (loggable) {
            //  compute an origin string
            if (anOrigin) {
                if (TP.isArray(anOrigin) && anOrigin.isOriginSet()) {
                    if (TP.$$VERBOSE) {
                        orgstr = '[' + anOrigin.collect(
                                    function(item) {

                                        return TP.id(item, true);
                                    }).join(', ');
                        orgstr += ']';
                    } else {
                        orgstr = TP.id(anOrigin.last());
                    }
                } else {
                    orgstr = TP.id(anOrigin, true);
                }
            } else {
                orgstr = TP.NULL_OID;
            }

            //  compute a signal string
            if (aSignal) {
                if (TP.isArray(aSignal)) {
                    if (TP.$$VERBOSE) {
                        sigstr = '[' + aSignal.collect(
                                    function(item) {

                                        return item.getSignalName();
                                    }).join(', ');
                        sigstr += ']';
                    } else {
                        sigstr = aSignal.last().getSignalName();
                    }
                } else {
                    sigstr = aSignal.getSignalName();
                }

            } else {
                //  no signal? it's going to default to TP.sig.Signal type
                sigstr = 'TP.sig.Signal';
            }

            //  build the log entry text and log it
            if (TP.notEmpty(orgstr) && TP.notEmpty(sigstr)) {
                str = sigstr + ' @@@ ' + orgstr;

                if (TP.sys.shouldLogSignalStack()) {
                    try {
                        flag = TP.sys.shouldLogStack();
                        TP.sys.shouldLogStack(true);
                        TP.ifTrace() ? TP.sys.logSignal(
                                            TP.boot.$annotate(aSignal, str),
                                            TP.TRACE, arguments) : 0;
                    } catch (e) {
                    } finally {
                        TP.sys.shouldLogStack(flag);
                    }
                } else {
                    TP.ifTrace() ? TP.sys.logSignal(
                                            TP.boot.$annotate(aSignal, str),
                                            TP.TRACE, arguments) : 0;
                }
            }
        }
    }

    //  ensure we've got a proper policy so we find a processing function
    pol = aPolicy;
    if (!TP.isCallable(pol)) {
        if (TP.isCallable(TP.sig.SignalMap[pol])) {
            pol = TP.sig.SignalMap[pol];
        } else {
            if (!TP.isType(type) ||
                    TP.isEmpty(pol = type.getDefaultPolicy())) {
                pol = TP.sig.SignalMap.DEFAULT_FIRING;
            } else if (!TP.isCallable(pol) &&
                        !TP.isCallable(pol = TP.sig.SignalMap[pol])) {
                pol = TP.sig.SignalMap.DEFAULT_FIRING;
            }
        }
    }

    //  hand off to policy do do the actual firing of the signal(s)
    sig = pol(anOrigin, aSignal, aContext, aPayload, aType,
                isCancelable, isBubbling);

    if (TP.sys.shouldTrackSignalStats()) {
        end = Date.now();
        delta = end - sig.get('time');

        sig.$set('elapsed', delta);

        TP.sys.$statistics.$signals = TP.sys.$statistics.$signals ||
                                        TP.ac();
        TP.sys.$statistics.$signals.push(delta);

        if (TP.sys.$statistics.$signals.length >
                TP.sys.cfg('signal.stats_max')) {
            TP.sys.$statistics.$signals.shift();
        }
    }

    //  process any pending signals that may have been queued by the
    //  signal handlers we just invoked
    TP.sys.fireNextSignal();

    return sig;
});

//  ------------------------------------------------------------------------
//  DEBUGGING - PART III (TP.raise() revisited)
//  ------------------------------------------------------------------------

TP.definePrimitive('raise',
function(anOrigin, anException, aContext, aPayload) {

    /**
     * @name raise
     * @synopsis Raise an exception.
     * @description The exception type can be either a type or a String
     *     representing a type as appropriate. The calling context should be a
     *     reference to the function in which the exception was issued. This is
     *     usually provided as arguments (too bad about 'caller' isn't it). The
     *     operation is controlled by flags which also define whether this call
     *     should log output to the TIBET error log. The logging can consist of
     *     just the exception data or it can include the call stack names at the
     *     point of the exception. See TP.sys.shouldLogRaise() and
     *     TP.sys.shouldLogStack() for more information.
     * @param {Object} anOrigin The exception's origin.
     * @param {TP.sig.Exception} anException The exception to raise.
     * @param {Function|Context} aContext A calling context.
     * @param {Object} aPayload Optional argument object.
     * @todo
     */

    var i,
        str,
        orig,
        args,
        supers,
        aSignal,
        exceptions,
        flag,
        eType,
        level;

    //  see if ignore is on at the 'global' level, meaning the TP.raise()
    //  call itself has been suspended
    if (TP.raise.$suspended) {
        return;
    }

    //  watch out for IE4!!! Crashes browser if this goes forward without
    //  being cleared.
    orig = anOrigin;

    if (TP.isWindow(orig)) {
        orig = null;
    }

    //  default to raising TP.sig.Exception -- the top level exception
    //  signal
    eType = TP.ifInvalid(anException, 'TP.sig.Exception');

    //  convert string exceptions into types
    if (TP.isTypeName(eType)) {
        aSignal = TP.sys.getTypeByName(eType);
        if (TP.notValid(aSignal)) {
            //  NOTE that we create a new subtype here, patching the
            //  exception into the system at runtime
            aSignal = TP.sig.Exception.defineSubtype(eType);
        }
    } else {
        aSignal = eType;
    }

    //  are we configured to output raise calls in the log? if so we'll do
    //  some logging but we turn off the flag to avoid recursion if there
    //  are any raise calls invoked by what we'll do here...
    flag = TP.sys.shouldLogRaise();
    try {
        if (flag) {
            TP.sys.shouldLogRaise(false);

            if (TP.isValid(aPayload)) {
                args = ' with payload/args: ';

                if (TP.isString(aPayload.message)) {
                    //  this one handles 'e' from catch blocks etc.
                    args += aPayload.toString();
                } else if (TP.canInvoke(aPayload, 'asString')) {
                    //  TIBET-enabled objects can asString themselves
                    args += aPayload.asString();
                } else if (TP.canInvoke(aPayload, 'toString')) {
                    args += aPayload.toString();
                } else if (TP.isString(aPayload.nodeName)) {
                    args += TP.nodeAsString(aPayload);
                } else {
                    try {
                        args += TP.str(aPayload);
                    } catch (e) {
                    }
                }
            } else {
                args = '';
            }

            if (TP.isValid(orig) &&
                TP.isCallable(orig.getTypeName) &&
                TP.isValid(eType.getSignalName)) {
                str = TP.id(orig) + ' raised: ' +
                        eType.getSignalName() +
                        args;
            } else if (TP.isCallable(eType.getSignalName)) {
                //  The null oid doesn't include type prefix like other
                //  $id data output will, so we add the generic 'Object'.
                str = 'Object' + TP.NULL_OID + ' raised: ' +
                        eType.getSignalName() +
                        args;
            }

            //  determine the proper log mechanism to use. we could use the
            //  types polymorphically I suppose...but this seemed adequate
            if (TP.canInvoke(aSignal, 'getLevel')) {
                level = aSignal.getLevel();
            } else {
                level = TP.ERROR;
            }

            switch (level) {
                case TP.TRACE:
                    TP.trace(str, TP.LOG, aContext);
                    break;
                case TP.INFO:
                    TP.info(str, TP.LOG, aContext);
                    break;
                case TP.WARN:
                    TP.isValid(aPayload) ?
                        TP.warn(TP.boot.$annotate(aPayload, str),
                                TP.LOG,
                                aContext) :
                        TP.warn(str,
                                TP.LOG,
                                aContext);
                    break;
                case TP.ERROR:
                    TP.isValid(aPayload) ?
                        TP.error(TP.boot.$annotate(aPayload, str),
                                TP.LOG,
                                aContext) :
                        TP.error(str,
                                TP.LOG,
                                aContext);
                    break;
                case TP.SEVERE:
                    TP.isValid(aPayload) ?
                        TP.severe(TP.boot.$annotate(aPayload, str),
                                TP.LOG,
                                aContext) :
                        TP.severe(str,
                                TP.LOG,
                                aContext);
                    break;
                case TP.FATAL:
                    TP.isValid(aPayload) ?
                        TP.fatal(TP.boot.$annotate(aPayload, str),
                                TP.LOG,
                                aContext) :
                        TP.fatal(str,
                                TP.LOG,
                                aContext);
                    break;
                case TP.SYSTEM:
                    TP.system(str, TP.LOG, aContext);
                    break;
                default:
                    TP.isValid(aPayload) ?
                        TP.error(TP.boot.$annotate(aPayload, str),
                                TP.LOG,
                                aContext) :
                        TP.error(str,
                                TP.LOG,
                                aContext);
                    break;
            }
        }
    } catch (e) {
    } finally {
        //  set the log/raise flag back to original status
        TP.sys.shouldLogRaise(flag);
    }

    //  for debugging only this section will register objects that have
    //  raised so they can be accessed via the development console.
    if (TP.sys.shouldRegisterLoggers()) {
        if (TP.isValid(orig)) {
            TP.sys.registerObject(orig, null, true);
        }
    }

    //  now build up an array of exception signal types which will be
    //  signaled to observers until the exception is stopped through use of
    //  the stopPropagation() mechanism or it runs out of signal types
    if (TP.isSubtypeOf(aSignal, TP.sig.Exception)) {
        supers = aSignal.getSupertypes();
    } else {
        //  signal a generic exception
        aSignal = TP.sig.Exception;
        supers = TP.ac();
    }

    //  process supertype list to build exception tree
    exceptions = TP.ac();
    exceptions.push(aSignal);

    //  TODO: compute the offset once and slice after that.
    //  trim the list down to just exception subtypes...don't go up through
    //  TP.sig.Signal and on toward Object.
    for (i = 0; i < supers.getSize(); i++) {
        exceptions.push(supers.at(i));
        if (supers.at(i) === TP.sig.Exception) {
            break;
        }
    }

    //  dispatch with EXCEPTION firing policy. Firing policies are
    //  functions which define the logic which controls how a particular
    //  signal is going to be processed. The TP.EXCEPTION_FIRING policy
    //  performs a list-oriented process which stops when the signal is
    //  "handled" at a particular exception.
    $handled = false;
    TP.signal(orig, exceptions, aContext, aPayload, TP.EXCEPTION_FIRING);

    //  if the type's handled flag is still false then we throw a real error
    if (TP.sys.shouldThrowExceptions() && !$handled) {
        //  one issue is that we want assertion throwing managed by its own
        //  flag so we do a secondary check here
        if (aSignal.getSignalName() !== 'AssertionFailed') {
            $handled = true;
            throw new Error(aSignal.getSignalName());
        }
    }

    return;
});

//  ========================================================================
//  Signal Sources
//  ========================================================================

/*
TP.core.SignalSource is the core signaling type from which all other signal
sources derive. Signal sources are objects that throw off signals; devices like
mice and keyboards and remote sources like server-sent event servers.
*/

TP.lang.Object.defineSubtype('core:SignalSource');

//  ========================================================================
//  TP.core.MutationSignalSource
//  ========================================================================

/*
*/

TP.core.SignalSource.defineSubtype('core:MutationSignalSource');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  A hash mapping a document ID to a MutationObserver
TP.core.MutationSignalSource.Type.defineAttribute('observers');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.MutationSignalSource.Type.defineMethod('initialize',
function() {

    /**
     * @name initialize
     * @synopsis Performs one-time setup for the type on startup/import.
     */

    this.set('observers', TP.hc());

    return;
});

//  ------------------------------------------------------------------------

TP.core.MutationSignalSource.Type.defineMethod('addObserverFor',
function(aDocument) {

    /**
     * @name addObserverFor
     * @synopsis
     * @param {Document} aDocument The document to register a Mutation Observer
     *     on.
     * @raises TP.sig.InvalidNode
     * @returns {TP.lang.RootObject.<TP.core.MutationSignalSource>} The
     *     MutationSignalSource type.
     */

    var observer;

    //  PhantomJS (at least at the time of this writing, doesn't support these).
    if (TP.notValid(self.MutationObserver)) {
        return this;
    }

    observer = new MutationObserver(
                    function(mutationRecords) {
                        var len,
                            i;

                        len = mutationRecords.length;
                        for (i = 0; i < len; i++) {
                            this.handleMutationEvent(mutationRecords.at(i));
                        }
                    }.bind(this));

    observer.observe(
            aDocument,
            {
                childList: true,
                subtree: true,
                attributes: false,
                attributeOldValue: false
            });

    this.get('observers').atPut(TP.id(aDocument), observer);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.MutationSignalSource.Type.defineMethod('removeObserverFor',
function(aDocument) {

    /**
     * @name removeObserverFor
     * @synopsis
     * @param {Document} aDocument The document to remove a Mutation Observer
     *     from.
     * @raises TP.sig.InvalidNode
     * @returns {TP.lang.RootObject.<TP.core.MutationSignalSource>} The
     *     MutationSignalSource type.
     */

    var observerKey,
        observer;

    observerKey = TP.id(aDocument);

    if (TP.isValid(observer = this.get('observers').at(observerKey))) {
        observer.disconnect();
    }

    this.get('observers').removeKey(observerKey);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.MutationSignalSource.Type.defineMethod('handleMutationEvent',
function(aMutationRecord) {

    /**
     * @name handleMutationEvent
     * @synopsis
     * @param {MutationRecord} aMutationRecord
     * @raises TP.sig.InvalidNode
     * @returns {TP.lang.RootObject.<TP.core.MutationSignalSource>} The
     *     MutationSignalSource type.
     */

    var targetElem,
        targetType,

        mutationType,

        fname,

        attrName,

        prevValue,
        newValue,
        operation,

        args,

        addedNodes,
        removedNodes,

        queryEntries,

        targetDoc;

    if (!TP.isElement(targetElem = aMutationRecord.target)) {
        //  TODO: Raise an exception
    }

    if (!TP.isType(targetType = TP.wrap(targetElem).getType())) {
        return this;
    }

    mutationType = aMutationRecord.type;

    switch(mutationType) {
        case 'attributes':
            fname = 'handlePeerTP_sig_DOMAttrChanged';

            if (TP.canInvoke(targetType, fname)) {
                attrName = aMutationRecord.attributeName;

                prevValue = aMutationRecord.oldValue;
                newValue = TP.elementGetAttribute(targetElem, attrName, true);

                if (TP.notValid(prevValue) &&
                    TP.elementHasAttribute(targetElem, attrName, true)) {
                    operation = TP.CREATE;
                } else if (!TP.elementHasAttribute(targetElem, attrName, true)) {
                    operation = TP.DELETE;
                } else {
                    operation = TP.UPDATE;
                }

                args = TP.hc('attrName', aMutationRecord.attributeName,
                                'newValue', newValue,
                                'prevValue', prevValue,
                                'operation', operation);

                targetType[fname](targetElem, args);
            }

            break;
        case 'childList':
            if (TP.notEmpty(addedNodes = TP.ac(aMutationRecord.addedNodes))) {
                fname = 'handlePeerTP_sig_DOMNodesAdded';

                if (TP.canInvoke(targetType, fname)) {
                    targetType[fname](targetElem, addedNodes);
                }
            }

            if (TP.notEmpty(
                        removedNodes = TP.ac(aMutationRecord.removedNodes))) {
                fname = 'handlePeerTP_sig_DOMNodesRemoved';

                if (TP.canInvoke(targetType, fname)) {
                    targetType[fname](targetElem, removedNodes);
                }
            }

            if (TP.notEmpty(queryEntries = this.get('queries'))) {
                targetDoc = TP.nodeGetDocument(targetElem);
                queryEntries.perform(
                        function(anEntry) {
                            this.executeSubtreeQueryAndDispatch(
                                    anEntry,
                                    addedNodes,
                                    removedNodes,
                                    targetDoc);
                        }.bind(this));
            }

            break;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.MutationSignalSource.Type.defineMethod('executeSubtreeQueryAndDispatch',
function(queryEntry, addedNodes, removedNodes, aDocument) {

    var queryRoot,
        queryPath,
        queryTarget,

        queryAddMethod,
        queryRemoveMethod,

        results,

        matchingNodes;

    if (TP.isEmpty(queryPath = queryEntry.at('query')) ||
        !queryPath.isAccessPath()) {
        //  TODO: Raise an InvalidPath here
        return this;
    }

    if (TP.isEmpty(queryTarget = queryEntry.at('target'))) {
        //  TODO: Raise an InvalidType here
        return this;
    }

    if (!TP.isElement(queryRoot = queryEntry.at('root'))) {
        queryRoot = aDocument;
    }

    queryAddMethod = queryEntry.atIfInvalid(
                        'addMethod',
                        'handlePeerTP_sig_AddFilteredNodes');
    queryRemoveMethod = queryEntry.atIfInvalid(
                        'removeMethod',
                        'handlePeerTP_sig_RemoveFilteredNodes');

    results = queryPath.executeGet(queryTarget);

    if (TP.notEmpty(addedNodes)) {
        matchingNodes = results.intersection(addedNodes);
        if (TP.canInvoke(queryTarget, queryAddMethod)) {
            queryTarget[queryAddMethod](queryTarget, matchingNodes);
        }
    }

    if (TP.notEmpty(removedNodes)) {
        matchingNodes = results.intersection(removedNodes);
        if (TP.canInvoke(queryTarget, queryRemoveMethod)) {
            queryTarget[queryRemoveMethod](queryTarget, matchingNodes);
        }
    }

    return this;
});

//  ========================================================================
//  TP.core.URISignalSource
//  ========================================================================

/*
TP.core.URISignalSource is a type of signaling source that has a URI associated
with it. These would include signal sources like server-sent event servers.
*/

TP.core.SignalSource.defineSubtype('core:URISignalSource');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  The URI event source's URI
TP.core.URISignalSource.Inst.defineAttribute('uri');

//  ------------------------------------------------------------------------

TP.core.URISignalSource.Inst.defineMethod('init',
function(aURI) {

    /**
     * @name init
     * @synopsis Initialize a new signal instance.
     * @param {TP.core.URI} aURI The URI to use to listen for events from.
     * @raises TP.sig.InvalidURI
     * @returns {TP.core.URISignalSource} A new instance.
     */

    var uri;

    //  supertype initialization
    this.callNextMethod();

    //  Not a valid URI? We can't initialize properly then...
    if (!TP.isURI(uri = TP.uc(aURI))) {
        this.raise('TP.sig.InvalidURI', arguments);

        return null;
    }

    this.set('uri', uri);

    return this;
});

//  ========================================================================
//  TP.core.SSESignalSource
//  ========================================================================

TP.core.URISignalSource.defineSubtype('core:SSESignalSource');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  The low-level Server-Side Events source object.
TP.core.URISignalSource.Inst.defineAttribute('$eventSource');

//  The private TP.lang.Hash containing a map of custom event names to the
//  handlers that were installed for each one so that we can unregister them.
TP.core.URISignalSource.Inst.defineAttribute('$customEventHandlers');

//  The Server-Side Events observer count
TP.core.URISignalSource.Inst.defineAttribute('observerCount');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.SSESignalSource.Inst.defineMethod('init',
function(aURI) {

    /**
     * @name init
     * @synopsis Initialize a new signal instance.
     * @param {TP.core.URI} aURI The URI to use to listen for events from.
     * @returns {TP.core.SSESignalSource} A new instance.
     */

    //  supertype initialization
    this.callNextMethod();

    this.set('$customEventHandlers', TP.hc());

    return this;
});

//  ------------------------------------------------------------------------

TP.core.SSESignalSource.Inst.defineMethod('addObserver',
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
     */

    var observerCount,

        sigTypes;

    if (TP.notValid(anOrigin) || TP.notValid(aSignal)) {
        return this.raise('TP.sig.InvalidParameter', arguments);
    }

    //  See if we have an observer count. If not, initialize it to 1.
    if (TP.notValid(observerCount = this.get('observerCount'))) {
        observerCount = 1;
    } else {
        observerCount += 1;
    }
    this.set('observerCount', observerCount);

    //  If there are 1 or more observers and the connection is not open, then
    //  open it.
    if (observerCount > 0 && !this.connectionIsOpen()) {

        //  Open the connection
        if (!this.openConnection()) {
            //  Can't open the connection - no sense in registering the handler
            //  with the notification system.
            return false;
        }
    }

    //  Set up any custom handlers based on what kinds of signal(s) we were
    //  supplied here.

    if (!TP.isArray(sigTypes = aSignal)) {
        sigTypes = TP.ac(aSignal);
    }

    sigTypes = sigTypes.collect(
            function (aSignalType) {
                var sigType,
                    subs;

                //  Grab the real type object if it wasn't supplied.
                sigType = TP.isType(aSignalType) ?
                                aSignalType :
                                TP.sys.getTypeByName(aSignalType);

                if (TP.notValid(subs = sigType.getSubtypes())) {
                    return sigType;
                }

                return TP.ac(sigType, subs);
            });
    sigTypes = sigTypes.flatten();

    this.setupCustomHandlers(sigTypes);

    //  Tell the notification to register our handler, etc.
    return true;
});

//  ------------------------------------------------------------------------

TP.core.SSESignalSource.Inst.defineMethod('closeConnection',
function() {

    /**
     * @name closeConnection
     * @synopsis Closes the connection to the remote server-sent events server.
     * @raises TP.sig.InvalidSource
     * @returns {Boolean} Whether or not the connection closed successfully.
     */

    var eventSource;

    //  Try to obtain the event source object.
    if (TP.notValid(eventSource = this.get('$eventSource'))) {
        this.raise('TP.sig.InvalidSource', arguments);

        return false;
    }

    //  Close the connection
    eventSource.close();

    //  Signal it to any observers, since the spec doesn't provide for a
    //  native-level 'close' event handler... booo.
    this.signal('TP.sig.SourceClosed', arguments);

    this.set('$eventSource', null);

    //  Empty whatever remaining custom handlers that weren't unregistered (we
    //  don't have to worry about removing them as event listeners from the
    //  event source object since we're disposing of it).
    this.get('$customEventHandlers').empty();

    return true;
});

//  ------------------------------------------------------------------------

TP.core.SSESignalSource.Inst.defineMethod('connectionIsOpen',
function() {

    /**
     * @name connectionIsOpen
     * @synopsis Returns whether or not the connection is currently open.
     * @returns {Boolean} Whether or not the connection is currently open.
     */

    //  If we have a valid eventSource, then we're open
    return TP.isValid(this.get('$eventSource'));
});

//  ------------------------------------------------------------------------

TP.core.SSESignalSource.Inst.defineMethod('openConnection',
function() {

    /**
     * @name openConnection
     * @synopsis Opens the connection to the remote server-sent events server.
     * @raises TP.sig.InvalidURI, TP.sig.InvalidSource
     * @returns {Boolean} Whether or not the connection opened successfully.
     */

    var sourceURI,
        eventSource;

    //  If there is an existing event source, then close its connection
    if (this.connectionIsOpen()) {
        this.get('$eventSource').close();
    }

    //  If there is no valid URI, then we can't open the connection... return
    //  false.
    if (!TP.isURI(sourceURI = this.get('uri'))) {
        this.raise('TP.sig.InvalidURI', arguments);

        return false;
    }

    //  Try to open a connection to the remote server-sent events server.
    try {
        eventSource = new EventSource(sourceURI.asString());
    } catch (e) {
        this.raise('TP.sig.InvalidSource', arguments);

        return false;
    }

    if (TP.isValid(eventSource)) {
        this.set('$eventSource', eventSource);
        this.setupStandardHandlers();
    }

    return true;
});

//  ------------------------------------------------------------------------

TP.core.SSESignalSource.Inst.defineMethod('removeObserver',
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
     */

    var observerCount,

        sigTypes;

    if (TP.notValid(anOrigin) || TP.notValid(aSignal)) {
        return this.raise('TP.sig.InvalidParameter', arguments);
    }

    //  See if we have an observer count. If not, we use the value of 0.
    if (TP.notValid(observerCount = this.get('observerCount'))) {
        observerCount = 0;
    } else {
        observerCount -= 1;
    }
    this.set('observerCount', observerCount);

    //  Tear down any custom handlers based on what kinds of signal(s) we were
    //  supplied here.

    if (!TP.isArray(sigTypes = aSignal)) {
        sigTypes = TP.ac(aSignal);
    }

    sigTypes = sigTypes.collect(
            function (aSignalType) {
                var sigType,
                    subs;

                //  Grab the real type object if it wasn't supplied.
                sigType = TP.isType(aSignalType) ?
                                aSignalType :
                                TP.sys.getTypeByName(aSignalType);

                if (TP.notValid(subs = sigType.getSubtypes())) {
                    return sigType;
                }

                return TP.ac(sigType, subs);
            });
    sigTypes = sigTypes.flatten();

    this.teardownCustomHandlers(sigTypes);

    //  If there are no observers and the connection is open, close it.
    if (observerCount === 0 && this.connectionIsOpen()) {

        //  Close the connection
        this.closeConnection();
    }

    //  Always tell the notification to remove our handler, etc.
    return true;
});

//  ------------------------------------------------------------------------

TP.core.SSESignalSource.Inst.defineMethod('setupCustomHandlers',
function(signalTypes) {

    /**
     * @name setupCustomHandlers
     * @synopsis Sets up handlers for 'custom' server-side events.
     * @description Because the Server-Sent Events specification does not
     *     specify that the general 'message' handler will fire when there is a
     *     custom 'event' (as specified by the 'event:' tag in the received
     *     data), we look at the signals being registered and if they have a
     *     'NATIVE_NAME' slot, we use that to register a handler with our
     *     private EventSource object to broadcast the signal.
     * @param {Array} signalTypes An Array of TP.sig.SourceSignal subtypes to
     *     check for custom handler registration.
     * @raises TP.sig.InvalidSource
     * @returns {TP.core.SSESignalSource} The receiver.
     */

    var eventSource,
        thisArg,
        handlerRegistry;

    if (TP.notValid(eventSource = this.get('$eventSource'))) {
        this.raise('TP.sig.InvalidSource', arguments);

        return this;
    }

    //  Grab ourself, since we'll need it for the registered handler
    thisArg = this;

    //  A map that we need to keep up-to-date for handler unregistration
    handlerRegistry = this.get('$customEventHandlers');

    //  Loop over the signal types (or their names) and see if they need a
    //  custom handler registered for them.
    signalTypes.perform(
        function (aSignalType) {
            var customName,
                signalName,

                handlerFunc;

            //  If the signal type has a NATIVE_NAME slot, then register a
            //  custom handler using that value as the event name.
            if (TP.notEmpty(customName = aSignalType.NATIVE_NAME)) {

                //  If there's already a handler registered for this native
                //  event type then just return here. We don't want multiple
                //  handlers for the same native event.
                if (handlerRegistry.hasKey(customName)) {
                    return;
                }

                signalName = aSignalType.getSignalName();

                handlerFunc = function (evt) {
                    var payload;

                    payload = TP.hc(
                                'origin', evt.origin,
                                'data', evt.data,
                                'lastEventId', evt.lastEventId,
                                'source', evt.source
                                );

                    thisArg.signal(signalName, arguments, payload);

                    return;
                };

                //  Put it in the handler registry in case we went to unregister
                //  it interactively later.
                handlerRegistry.atPut(customName, handlerFunc);

                //  Add the custom event listener to the event source.
                eventSource.addEventListener(customName, handlerFunc, false);
            }
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.core.SSESignalSource.Inst.defineMethod('setupStandardHandlers',
function() {

    /**
     * @name setupStandardHandlers
     * @synopsis Sets up the 'standard' Server-Side Events handlers for our
     *     event source object.
     * @raises TP.sig.InvalidSource
     * @returns {TP.core.SSESignalSource} The receiver.
     */

    var eventSource;

    if (TP.notValid(eventSource = this.get('$eventSource'))) {
        this.raise('TP.sig.InvalidSource', arguments);

        return this;
    }

    //  Set up the event listener that will trigger when the connection is
    //  opened.
    eventSource.addEventListener(
        'open',
        function (evt) {
            var payload;

            payload = TP.hc(
                        'url', eventSource.url,
                        'withCredentials', eventSource.withCredentials,
                        'readyState', eventSource.readyState
                        );

            this.signal('TP.sig.SourceOpen', arguments, payload);

            return;
        }.bind(this),
        false);

    //  Set up the event listener that will trigger when there is a *generic*
    //  message (i.e. one with no custom event type - those are registered as
    //  custom handlers).
    eventSource.addEventListener(
        'message',
        function (evt) {
            var payload;

            payload = TP.hc(
                        'origin', evt.origin,
                        'data', evt.data,
                        'lastEventId', evt.lastEventId,
                        'source', evt.source
                        );

            this.signal('TP.sig.SourceDataReceived', arguments, payload);

            return;
        }.bind(this),
        false);

    //  Set up the event listener that will trigger when there is an error.
    eventSource.addEventListener(
        'error',
        function (evt) {
            var payload;

            //  If the readyState is set to EventSource.CLOSED, then the browser
            //  is 'failing the connection'. In this case, we signal a
            //  'TP.sig.SourceClosed' and return.
            if (eventSource.readyState === EventSource.CLOSED) {
                this.signal('TP.sig.SourceClosed', arguments);

                return;
            }

            //  If the readyState is set to EventSource.CONNECTING, then the
            //  browser is trying to 'reestablish the connection'. In this case,
            //  we signal a 'TP.sig.SourceReconnecting' and return.
            if (eventSource.readyState === EventSource.CONNECTING) {
                this.signal('TP.sig.SourceReconnecting', arguments);

                return;
            }

            //  Otherwise, there was truly some sort of error, so we signal
            //  'TP.sig.SourceError' with some information
            payload = TP.hc(
                        'url', eventSource.url,
                        'withCredentials', eventSource.withCredentials,
                        'readyState', eventSource.readyState
                        );

            this.signal('TP.sig.SourceError', arguments, payload);

            return;
        }.bind(this),
        false);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.SSESignalSource.Inst.defineMethod('teardownCustomHandlers',
function(signalTypes) {

    /**
     * @name teardownCustomHandlers
     * @synopsis Tears down handlers for 'custom' server-side events.
     * @description Because the Server-Sent Events specification does not
     *     specify that the general 'message' handler will fire when there is a
     *     custom 'event' (as specified by the 'event:' tag in the received
     *     data), we look at the signals being registered and if they have a
     *     'NATIVE_NAME' slot, we use that to unregister a handler with our
     *     private EventSource objec
     * @param {Array} signalTypes An Array of TP.sig.SourceSignal subtypes to
     *     check for custom handler registration.
     * @raises TP.sig.InvalidSource
     * @returns {TP.core.SSESignalSource} The receiver.
     */

    var eventSource,
        handlerRegistry;

    if (TP.notValid(eventSource = this.get('$eventSource'))) {
        this.raise('TP.sig.InvalidSource', arguments);

        return this;
    }

    //  A map that we have kept up-to-date for handler unregistration
    handlerRegistry = this.get('$customEventHandlers');

    //  Loop over the signal types (or their names) and see if they need a
    //  custom handler registered for them.
    signalTypes.perform(
        function (aSignalType) {
            var customName,
                signalName,

                handlerFunc;

            //  If the signal type has a NATIVE_NAME slot, then remove the
            //  custom handler that we would've set up using that value as the
            //  event name.
            if (TP.notEmpty(customName = aSignalType.NATIVE_NAME)) {

                signalName = aSignalType.getSignalName();

                //  If there is a callable function registered in the handler
                //  registry under the custom event name, remove it.
                if (TP.isCallable(handlerFunc =
                                    handlerRegistry.atPut(customName))) {

                    handlerRegistry.removeKey(customName);
                    eventSource.removeEventListener(customName,
                                                    handlerFunc,
                                                    false);
                }
            }
        });

    return this;
});

//  ========================================================================
//  SIGNAL SOURCE SIGNALS
//  ========================================================================

TP.sig.Signal.defineSubtype('SourceSignal');
TP.sig.SourceSignal.Type.defineAttribute('defaultPolicy',
    TP.INHERITANCE_FIRING);

TP.sig.SourceSignal.defineSubtype('SourceOpen');
TP.sig.SourceSignal.defineSubtype('SourceDataReceived');
TP.sig.SourceSignal.defineSubtype('SourceClosed');

TP.sig.SourceSignal.defineSubtype('SourceReconnecting');

TP.sig.SourceSignal.defineSubtype('SourceError');

//  ========================================================================
//  Object Extensions
//  ========================================================================

/**
 * @type {Object}
 * @synopsis Responder Computation API extensions for Object.
 * @description These allow any Object in the system to respond to the responder
 *     computation machinery. They are typically overridden to provide real
 *     functionality.
 * @subject Responder Computation Extensions
 * @todo
 */

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lang.Object.Inst.defineMethod('isResponderFor',
function(aSignal, isCapturing) {

    /**
     * @name isResponderFor
     * @synopsis Whether or not the receiver is a responder for the supplied
     *     signal and capturing mode.
     * @param {TP.sig.ResponderSignal} aSignal The signal to check to see if the
     *     receiver is an appropriate responder.
     * @param {Boolean} isCapturing Whether or not the responder computation
     *     machinery is computing the chain for the 'capturing' phase of the
     *     event dispatch.
     * @returns {Boolean} Whether or not the receiver is a valid responder for
     *     the supplied signal and capturing mode. The default at this level is
     *     false.
     * @todo
     */

    return false;
});

//  ------------------------------------------------------------------------

TP.lang.Object.Inst.defineMethod('getNextResponder',
function(aSignal, isCapturing) {

    /**
     * @name getNextResponder
     * @synopsis Returns the next responder as computed by the receiver.
     * @param {TP.sig.ResponderSignal} aSignal The signal to check to see if the
     *     receiver is an appropriate responder.
     * @param {Boolean} isCapturing Whether or not the responder computation
     *     machinery is computing the chain for the 'capturing' phase of the
     *     event dispatch.
     * @returns {Object} The next responder as computed by the receiver.
     * @todo
     */

    return null;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
