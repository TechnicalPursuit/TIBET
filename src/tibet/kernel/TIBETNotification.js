//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
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

/* global EventSource:false
*/

//  ========================================================================
//  Annotation
//  ========================================================================

/*
 * Annotations are simple objects which bind an object and a message. The
 * typical object used is an Error but it can be any type. Annotations are
 * introduced in the boot system as TP.boot.Annotation but use of that type is
 * restricted to boot code. Once the kernel has started loading we want the rest
 * of the system to rely on an Annotation which can fully participate in the
 * inheritance and reflection services provided by the kernel.
 */

//  ------------------------------------------------------------------------
//  TP.core.Annotation
//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.Annotation');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.Annotation.Inst.defineAttribute('object');
TP.core.Annotation.Inst.defineAttribute('message');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Annotation.Inst.defineMethod('init',
function(anObject, aMessage) {

    /**
     * @method init
     * @summary Initializes a new instance and returns it.
     * @param {Object} anObject The object to annotate. Often an Error.
     * @param {String} aMessage The message to associate with anObject.
     * @returns {TP.core.Annotation} A new instance.
     */

    //  can't be null or undefined, or have empty annotation text.
    if (anObject === null || anObject === undefined || aMessage === '') {
        throw new Error('InvalidParameter');
    }

    this.callNextMethod();

    this.$set('object', anObject);
    this.$set('message', aMessage);

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.Annotation.Inst.defineMethod('as',
function(typeOrFormat, formatParams) {

    /**
     * @method as
     * @summary Returns the receiver formatted to the type or format provided.
     * @param {Object} typeOrFormat The type, typename, or format to use.
     * @param {TP.core.Hash} formatParams Option parameters for the formatting
     *     process.
     * @returns {String} The receiver formatted to the type or format provided.
     */

    var type,
        args;

    if (TP.notValid(type = TP.sys.getTypeByName(typeOrFormat))) {
        return typeOrFormat.transform(this, formatParams);
    }

    //  if we got here we're either talking to a type that can't tell us
    //  what its name is (not good) or the receiver doesn't implement a
    //  decent as() variant for that type. In either case however all we can
    //  do is hope the type implements from() and we'll try that approach.
    if (TP.canInvoke(type, 'from')) {
        switch (arguments.length) {
            case 1:
                return type.from(this);
            case 2:
                return type.from(this, formatParams);
            default:
                //  have to build up an argument array that includes the
                //  receiver as the first argument rather than the type
                args = TP.args(arguments);
                args.atPut(0, this);
                return type.from.apply(type, args);
        }
    }
});

//  ----------------------------------------------------------------------------

TP.core.Annotation.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in HTML string format.
     */

    return TP.join(
            '<span class="TP_core_Annotation">',
            '<span data-name="object">',
                TP.htmlstr(this.$get('object')), '</span>',
            '<span data-name="message">',
                TP.htmlstr(this.$get('message')), '</span>',
            '</span>');
});

//  ----------------------------------------------------------------------------

TP.core.Annotation.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @method asJSONSource
     * @summary Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    return '{"type": "TP.core.Annotation",' +
            '"data": {"object": ' +
                TP.str(this.$get('object')).quoted('"') + ',' +
            '"message": ' +
                TP.str(this.$get('message')).quoted('"') + '}}';
});

//  ----------------------------------------------------------------------------

TP.core.Annotation.Inst.defineMethod('asString',
function() {

    /**
     * @method asString
     * @summary Returns the receiver as a simple string. Just the message is
     *     used for this output.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    return this.$get('message');
});

//  ----------------------------------------------------------------------------

TP.core.Annotation.Inst.defineMethod('asXMLString',
function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in XML string format.
     */

    return TP.join('<instance type="TP.core.Annotation"',
                            ' object="', TP.str(this.$get('object')), '"',
                            ' message="', TP.str(this.$get('message')), '"/>');
});

//  ----------------------------------------------------------------------------

TP.core.Annotation.Inst.defineMethod('toString',
function() {

    /**
     * @method toString
     * @summary Returns a string representation of the receiver.
     * @returns {String}
     */

    return TP.join(TP.str(this.$get('message')),
                            ' [', TP.str(this.$get('object')), ']');
});

//  ----------------------------------------------------------------------------
//  TP Primitive
//  ----------------------------------------------------------------------------

TP.definePrimitive('annotate',
function(anObject, aMessage) {

    /**
     * @method annotate
     * @summary Initializes a new instance and returns it.
     * @param {Object} anObject The object to annotate. Often an Error.
     * @param {String} aMessage The message to associate with anObject.
     * @returns {TP.core.Annotation} A new instance.
     */

    return TP.core.Annotation.construct(anObject, aMessage);
});

//  ----------------------------------------------------------------------------

TP.definePrimitive('isAnnotation',
function(anObject) {

    /**
     * @method isAnnotation
     * @summary Returns true if the object provided is an instance of Annotation
     *     of either the boot or core variant.
     * @param {Object} anObject The object to test.
     * @returns {Boolean} True if the object is any form of annotation.
     */

    /* eslint-disable no-extra-parens */
    return (anObject instanceof TP.boot.Annotation) ||
        TP.isKindOf(anObject, TP.core.Annotation);
    /* eslint-enable no-extra-parens */
});

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

TP.lang.Object.defineSubtype('sig.Signal');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  signal phases for DOM 2 simulation
TP.sig.Signal.Type.defineAttribute(
        'phases', TP.ac(TP.CAPTURING, TP.AT_TARGET, TP.BUBBLING));

//  does this signal type bubble? typically only DOM signals do
TP.sig.Signal.Type.defineAttribute('bubbling', false);

//  is this signal type cancelable? typically signals can be stopped
TP.sig.Signal.Type.defineAttribute('cancelable', true);

//  is the receiver a controller root, meaning controller traversal stops?
TP.sig.Signal.Type.defineAttribute('controllerRoot', null);

//  is the receiver a controller signal, meaning controllers are notified?
TP.sig.Signal.Type.defineAttribute('controllerSignal', null);

//  TIBET's default is to use observer-style firing.
TP.sig.Signal.Type.defineAttribute('defaultPolicy', TP.OBSERVER_FIRING);

//  The list of signal names for the receiving type. Serves as a cache for the
//  common instance signal name list query.
TP.sig.Signal.Type.defineAttribute('signalNames', null);

//  is the receiver a signaling root, meaning inheritance traversal stops?
TP.sig.Signal.Type.defineAttribute('signalRoot', null);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sig.Signal.Type.defineMethod('defineSubtype',
function() {

    /**
     * @method defineSubtype
     * @summary Creates a new subtype. This particular override ensures that all
     *     direct subtypes of TP.sig.Signal serve as signaling roots, meaning
     *     that you never signal a raw TP.sig.Signal without a spoofed signal
     *     name.
     * @returns {TP.sig.Signal} A new signal-derived type object.
     */

    var type;

    type = this.callNextMethod();

    if (this === TP.sig.Signal) {
        type.isSignalingRoot(true);
    }

    return type;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Type.defineMethod('fire',
function(anOrigin, aPayload, aPolicy) {

    /**
     * @method fire
     * @summary Activates a signal instance via the policy specified. The
     *     instance in question will be whatever the receiver returns in
     *     response to an empty construct() call. Use construct().fire()
     *     directly if you need to configure the signal instance manually.
     * @param {Object} anOrigin Optional origin for this call.
     * @param {Array} aPayload Optional signal arguments.
     * @param {Function} aPolicy A firing policy function.
     * @returns {TP.sig.Signal} The signal.
     */

    return this.construct().fire(anOrigin, aPayload, aPolicy);
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Type.defineMethod('getDefaultPolicy',
function() {

    /**
     * @method getDefaultPolicy
     * @summary Returns the default firing policy to use for signals of this
     *     type when no other policy is provided.
     * @returns {String} The firing policy name such as TP.OBSERVER_FIRING.
     */

    return this.$get('defaultPolicy');
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Type.defineMethod('getPhases',
function() {

    /**
     * @method getPhases
     * @summary Returns the different phases a signal might be at during
     *     firing. These typically correspond to the DOM phases.
     * @returns {Array}
     */

    return this.phases;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Type.defineMethod('getSignalName',
function() {

    /**
     * @method getSignalName
     * @summary Returns the name of the signal. This method is added to the
     *     type to allow the type and instances to work polymorphically in
     *     defining the signal name.
     * @returns {String}
     */

    //  By default, the signal name is the type name
    return this.getName();
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Type.defineMethod('getSignalNames',
function() {

    /**
     * @method getSignalNames
     * @summary Returns the list of signal names from this type through
     *     TP.sig.Signal by traversing it's supertype chain..
     * @returns {String}
     */

    var names,
        type;

    names = this.$get('signalNames');
    if (TP.isValid(names)) {
        //  Copy so we don't have issues with changes to this list by callers.
        return names.slice(0);
    }

    names = TP.ac();

    /* eslint-disable consistent-this */

    type = this;

    while (type) {
        names.push(type.getSignalName());
        if (type === TP.sig.Signal) {
            break;
        }
        type = type.getSupertype();
    }

    /* eslint-enable consistent-this */

    this.$set('signalNames', names, false);

    return names.slice(0);
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Type.defineMethod('getSignalOwner',
function() {

    /**
     * @method getSignalOwner
     * @summary Returns the name of the signal's owner, an object which takes
     *     responsibility for observations of this signal type. Default is null
     *     since most signals aren't "owned".
     * @returns {Object} The receiver's owner.
     */

    return null;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Type.defineMethod('getSupertypeSignalNames',
function() {

    /**
     * @method getSupertypeSignalNames
     * @summary Returns the 'supertypes signal names' - that is, each supertype
     *     name encoded as a signal name.
     * @returns {Array} An Array of supertype signal names.
     */

    var type;

    type = this.getSupertype();

    if (TP.canInvoke(type, 'getSignalNames')) {
        return type.getSignalNames();
    }

    return TP.ac();
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Type.defineMethod('isBubbling',
function() {

    /**
     * @method isBubbling
     * @summary Returns true if the signal bubbles. This is typically only used
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
     * @method isCancelable
     * @summary Returns true if the signal can be cancelled (i.e. it will
     *     respond to a stopPropagation() message by allowing itself to stop
     *     being sent to qualified handlers.
     * @returns {Boolean} True if the signal can be cancelled.
     */

    return this.$get('cancelable');
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Type.defineMethod('isControllerRoot',
function(aFlag) {

    /**
     * @method isControllerRoot
     * @summary Combined setter/getter for whether signals of this type act
     *     as the 'root' for controller signaling. This stops the receiving
     *     type's supertypes from being passed through the controller chain.
     * @param {Boolean} aFlag
     * @returns {Boolean}
     */

    if (aFlag !== undefined) {
        this.$set('controllerRoot', aFlag);
    }

    return this.$get('controllerRoot') === true;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Type.defineMethod('isControllerSignal',
function(aFlag) {

    /**
     * @method isControllerSignal
     * @summary Combined setter/getter for whether signals of this type will
     *     stop before traversing the TIBET controller chain. Only controller
     *     signals (Routing, Workflow, UI signals, etc)  notify controllers.
     * @param {Boolean} aFlag
     * @returns {Boolean} Whether or not signals of this type will traverse the
     *     TIBET controller chain or not.
     */

    if (aFlag !== undefined) {
        this.$set('controllerSignal', aFlag);
    }

    return this.$get('controllerSignal') === true;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Type.defineMethod('isSignalingRoot',
function(aFlag) {

    /**
     * @method isSignalingRoot
     * @summary Combined setter/getter for whether signals of this type form a
     *     local signaling root. When true certain forms of signaling will stop
     *     traversing supertypes and stop with the receiver.
     * @param {Boolean} aFlag
     * @returns {Boolean} Whether or not signals of this type will stop
     *     traversing supertypes in certain forms of signaling.
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

//  skip handlers whose IDs are in this list. this is used to help avoid
//  duplicate notification of registered handlers. a handler can
//  "re-register" for notifications during processing if it needs to be
//  notified for each match that finds it
TP.sig.Signal.Inst.defineAttribute('notifiedHandlers');

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

//  the computed responder chain for the signal. used by policies which leverage
//  responder chains for context during signal firing.
TP.sig.Signal.Inst.defineAttribute('responderChain');

//  currently executing handler
TP.sig.Signal.Inst.defineAttribute('currentHandler');

//  the pseudo-name for this signal, used for handler matching. when this is
//  empty/null it will default to the receiving signal's type name.
TP.sig.Signal.Inst.defineAttribute('signalName');

//  should default processing be prevented? this is used primarily by UI
//  signals but it can also be leveraged by other signal types.
TP.sig.Signal.Inst.defineAttribute('$shouldPrevent', false);

//  has the signal been asked to stop propagation? note that for signals
//  for which isCancelable is false this value is ignored
TP.sig.Signal.Inst.defineAttribute('$shouldStop', false);

//  has the signal been asked to stop propagation immediately? Ignored if
//  the signal is not cancellable.
TP.sig.Signal.Inst.defineAttribute('$shouldStopImmediately', false);

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
     * @method init
     * @summary Initialize a new signal instance.
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
     * @method addIfAbsent
     * @summary Using the key/value pair provided assign the value to the key
     *     in the receiver if the key doesn't already exist.
     * @param {TPOrderedPair|String} anItemOrKey The ordered pair to add, or the
     *     key for a pair.
     * @param {Object} aValue Optional value to store when the first argument is
     *     a string.
     * @exception TP.sig.InvalidPair
     * @returns {Object} The key's value after processing.
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
        return this.raise('TP.sig.InvalidParameter', 'Invalid key or item.');
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
function(depth, level) {

    /**
     * @method asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @param {Number} [depth=1] Optional max depth to descend into target.
     * @param {Number} [level=1] Passed by machinery, don't provide this.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    var marker,
        str,
        $depth,
        $level;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asDumpString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    str = '[' + this.getSignalName() + ' :: ';

    $depth = TP.ifInvalid(depth, 1);
    $level = TP.ifInvalid(level, 0);

    try {
        if ($level > $depth) {
            str += '@' + TP.id(this) + ']';
        } else {
            str += '(' + TP.dump(this.getPayload(), $depth, $level + 1) + ')' + ']';
        }
    } catch (e) {
        str += '(' + TP.str(this.getPayload()) + ')' + ']';
    } finally {
        delete this[marker];
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver.
     * @returns {String} The receiver in HTML string format.
     */

    var marker,
        str;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asHTMLString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    try {
        str = '<span class="TP_sig_Signal ' +
                TP.escapeTypeName(TP.tname(this)) + '">' +
                    '<span data-name="payload">' +
                        TP.htmlstr(this.getPayload()) +
                     '</span>' +
                 '</span>';
    } catch (e) {
        str = this.toString();
    } finally {
        delete this[marker];
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @method asJSONSource
     * @summary Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    var marker,
        str;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asJSONSource';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    try {
        str = '{"type":' + this.getTypeName().quoted('"') + ',' +
                '"data":{"signame":' + this.getSignalName().quoted('"') + ',' +
                '"payload":' + TP.jsonsrc(this.getPayload()) + '}}';
    } catch (e) {
        str = this.toString();
    } finally {
        delete this[marker];
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @method asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    var marker,
        str;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asPrettyString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    try {
        str = '<dl class="pretty ' + TP.escapeTypeName(TP.tname(this)) + '">' +
                    '<dt>Type name</dt>' +
                    '<dd class="pretty typename">' +
                        this.getTypeName() +
                    '</dd>' +
                    TP.pretty(this.getPayload()) +
                    '</dl>';
    } catch (e) {
        str = this.toString();
    } finally {
        delete this[marker];
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('asString',
function(verbose) {

    /**
     * @method asString
     * @summary Returns the receiver as a string.
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the TP.sig.Signal's String representation. The default is true.
     * @returns {String} The receiver as a String.
     */

    var marker,
        wantsVerbose,
        str;

    wantsVerbose = TP.ifInvalid(verbose, true);
    if (!wantsVerbose) {
        return this.getSignalName() + TP.OID_PREFIX +
                this.toString().split(TP.OID_PREFIX).last();
    }

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    //  NB: We force the TP.str() rep of the payload to be verbose.
    try {
        str = this.getSignalName() +
                ' :: ' +
                '(' + TP.str(this.getPayload(), true) + ')';
    } catch (e) {
        str = this.toString();
    } finally {
        delete this[marker];
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('asSource',
function() {

    /**
     * @method asSource
     * @summary Returns the receiver as a TIBET source code string.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    var marker,
        payload,
        str,
        keys;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asSource';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

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
    } finally {
        delete this[marker];
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('asXMLString',
function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver.
     * @returns {String} The receiver in XML string format.
     */

    var marker,
        str;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asXMLString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    try {
        str = '<instance type="' + TP.tname(this) + '">' +
                    '<payload>' +
                        TP.xmlstr(this.getPayload()) +
                     '</payload>' +
                 '</instance>';
    } catch (e) {
        str = this.toString();
    } finally {
        delete this[marker];
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('at',
function(aKey) {

    /**
     * @method at
     * @summary Returns the value of the named parameter from the receiver's
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
                TP.ifError() ?
                    TP.error(
                        TP.ec(
                            e,
                            'Error retrieving signal payload property:' + aKey),
                        TP.SIGNAL_LOG) : 0;
            }
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('atIfInvalid',
function(anIndex, aDefault) {

    /**
     * @method atIfInvalid
     * @summary Returns the value at the index provided or the default value if
     *     the key returns null or undefined.
     * @param {Object} anIndex The index of the value to return.
     * @param {Object} aDefault The default value to return if invalid.
     * @returns {Object} The element at anIndex in this collection.
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
     * @method atIfNull
     * @summary Returns the value at the index provided or the default value if
     *     the key returns specifically null.
     * @param {Object} anIndex The index of the value to return.
     * @param {Object} aDefault The default value to return if null.
     * @returns {Object} The element at anIndex in this collection.
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
     * @method atIfUndefined
     * @summary Returns the value at the index provided or the default value if
     *     the key returns specifically undefined.
     * @param {Object} anIndex The index of the value to return.
     * @param {Object} aDefault The default value to return if undefined.
     * @returns {Object} The element at anIndex in this collection.
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
     * @method atPut
     * @summary Defines a key/value pair in the receiver's payload, provided
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
        TP.ifError() ?
            TP.error(
                TP.ec(e, 'Error setting signal payload property:' + aKey),
                TP.SIGNAL_LOG) : 0;
    }

    this.raise('TP.sig.InvalidPayload',
                    'Unable to set payload parameter: ' + aKey);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('atPutIfAbsent',
function(aKey, aValue) {

    /**
     * @method atPutIfAbsent
     * @summary Defines a key/value pair in the receiver's payload, provided
     *     that the payload does not already contain a value for the key in
     *     question.
     * @description Note that this method does not signal 'Change', even if it's
     *     'shouldSignalChange' attribute is true. Observe the payload for
     *     change notification.
     * @param {String} aKey The key for the parameter.
     * @param {Object} aValue The value for the parameter.
     * @returns {Object} The key's value after processing.
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

TP.sig.Signal.Inst.defineMethod('clearNotifications',
function() {

    /**
     * @method clearNotifications
     * @summary Clears any tracked handlers from the receiver's list so that
     *     all handlers are "renewed". Tracking allow a handler to be invoked
     *     once even if it's been registered multiple times. Clearing them means
     *     the same handler can be reinvoked.
     * @returns {TP.sig.Signal} The receiver.
     */

    var skips;

    //  empty so when reusing a signal instance we can reuse the list too
    if (TP.isValid(skips = this.get('notifiedHandlers'))) {
        skips.empty();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('computeSignalName',
function() {

    /**
     * @method computeSignalName
     * @summary Computes the signal name. By default, this is the receiver's
     *     type name.
     * @returns {String} The signal name of the receiver.
     */

    return this.getTypeName();
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('copy',
function() {

    /**
     * @method copy
     * @summary Returns a 'copy' of the receiver. Actually, a new instance
     *     whose value is equalTo that of the receiver.
     * @returns {TP.sig.Signal} A shallow copy of the receiver.
     */

    var newinst;

    newinst = this.getType().construct();

    newinst.origin = this.origin;
    newinst.context = this.context;

    newinst.listener = this.listener;

    newinst.notifiedHandlers = this.notifiedHandlers;

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
     * @method fire
     * @summary Activates the signal instance via the policy specified. The
     *     signal should have been fully configured prior to invocation of this
     *     method.
     * @param {Object} anOrigin Optional origin for this call.
     * @param {Array} aPayload Optional signal arguments.
     * @param {Function} aPolicy A firing policy function.
     * @returns {TP.sig.Signal} The signal.
     */

    var origin;

    //  allow refiring of signals
    this.stopPropagation(false);

    //  don't prevent default unless told (again)
    this.preventDefault(false);

    //  default our origin to whatever may already have been set, or to the
    //  receiver itself, which is part of what makes "fire" different from
    //  simple signaling
    if (TP.isValid(anOrigin)) {
        origin = anOrigin;
    } else {
        origin = TP.ifInvalid(this.getOrigin(), this);
    }
    this.setOrigin(origin);

    //  instrument with current firing time
    this.$set('time', Date.now());

    //  if the signal has an origin fire from there, otherwise the
    //  signal itself will be the origin
    return TP.signal(this.getOrigin(), this, aPayload, aPolicy);
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getActiveTime',
function() {

    /**
     * @method getActiveTime
     * @summary Returns the active time from fire() to the current time in
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

TP.sig.Signal.Inst.defineMethod('getDocument',
function() {

    /**
     * @method getDocument
     * @summary Returns the document from which the signal originated. This is
     *     typically the TIBET window's document, but it can vary when UI events
     *     are involved.
     * @returns {TP.core.Document} The document that the signal originated in.
     */

    return this.getWindow().getDocument();
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getElapsedTime',
function() {

    /**
     * @method getElapsedTime
     * @summary Returns the total elapsed time from fire() to completion. When
     *     the signal is not done being processed this method returns NaN.
     * @returns {Number} The elapsed time of the receiver.
     */

    return this.$get('elapsed') || NaN;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getOrigin',
function() {

    /**
     * @method getOrigin
     * @summary Returns the origin of the signal.
     * @returns {Object} The origin of the receiver.
     */

    return this.origin;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getParameters',
function() {

    /**
     * @method getParameters
     * @summary Returns the signal's parameters, which are typically encoded in
     *     the receiver's payload. The semantics of this call are slightly
     *     different however, only returning the payload when it implements the
     *     at/atPut methods. You should not manipulate this hash to set
     *     properties since it isn't guaranteed to not be a copy or temporary
     *     empty result set.
     * @returns {TP.core.Hash|TP.sig.Request} Parameter data (typically).
     */

    var params;

    params = this.getPayload();
    if (TP.isValid(params)) {
        if (TP.canInvokeInterface(params, TP.ac('at', 'atPut'))) {
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
     * @method getPayload
     * @summary Returns the optional arguments to the signal.
     * @returns {Object} The payload of the receiver.
     */

    return this.payload;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getPhase',
function() {

    /**
     * @method getPhase
     * @summary Returns the currently executing phase of the signal.
     * @returns {String} The currently executing phase of the receiver.
     */

    return this.phase;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getProperty',
function(attributeName) {

    /**
     * @method getProperty
     * @summary Returns the value, if any, for the attribute provided.
     * @description This method takes over when get() fails to find a specific
     *     getter or an aspect adapted getter. For signals we vary the default
     *     implementation in that no inferencing or backstop invocation occurs
     *     when attempting to look up values. If the receiver doesn't have the
     *     method or attribute processing stops there.
     * @param {String} attributeName The name of the attribute to get.
     * @returns {Object} The value of the named property in the receiver.
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
     * @method getRequestID
     * @summary A synonymn for getOrigin for non-request/response signal types.
     *     Provided to ensure polymorphic support for workflow signal
     *     processing.
     * @returns {Object} The request ID of the receiver.
     */

    return this.origin;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getResolvedTargetGlobalID',
function() {

    /**
     * @method getResolvedTargetGlobalID
     * @summary Returns the global id of the 'resolved' target of the signal.
     *     For most events this is the same as the origin, but for DOM events,
     *     particularly those with a native event component, this will often be
     *     the global ID of the 'resolved' target element.
     * @returns {String} The 'global ID' of the 'resolved' target of the
     *     receiver.
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
            inst = payload.resolvedTarget;
            id = TP.gid(inst);
        }
    } else if (TP.isElement(payload)) {
        //  element payloads we can leverage an ID from
        id = TP.gid(payload);
    } else if (TP.isHash(payload)) {
        //  if we got a hash we can ask it
        id = payload.at('elementGlobalID');
    }

    if (TP.notEmpty(id)) {
        return id;
    }

    return this.getOrigin();
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getSignalName',
function() {

    /**
     * @method getSignalName
     * @summary Returns the signal name. This corresponds most often to the
     *     Signal's type name but will differ in the case of spoofed signals.
     * @returns {String} The signal name of the receiver.
     */

    var signame;

    if (TP.isEmpty(signame = this.$get('signalName'))) {
        signame = this.computeSignalName();
        this.$set('signalName', signame, false);
    }

    return signame;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getSignalNames',
function() {

    /**
     * @method getSignalNames
     * @summary Returns the all of the receiver's 'signal names' - that is,
     *     the 'type' signal name, all of the supertypes signal names *and* the
     *     receiver's direct *signal* name (if it's a spoofed signal and has a
     *     different name than it's type).
     * @description Note that this method is different than
     *     'getTypeSignalNames()' below in that this method will always use the
     *     signal name, even for the receiving type - which for a spoofed signal
     *     will be different than its type name.
     * @returns {Array} An Array of signal names.
     */

    var names;

    names = this.getTypeSignalNames();

    if (!names.contains(this.getSignalName())) {
        names.unshift(this.getSignalName());
    }

    return names;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getSupertypeSignalNames',
function() {

    /**
     * @method getSupertypeSignalNames
     * @summary Returns the 'supertypes signal names' - that is, each supertype
     *     name encoded as a signal name.
     * @returns {Array} An Array of supertype signal names.
     */

    var type;

    type = this.getType().getSupertype();

    if (TP.canInvoke(type, 'getSignalNames')) {
        return type.getSignalNames();
    }

    return TP.ac();
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getSignalOrigin',
function() {

    /**
     * @method getSignalOrigin
     * @summary Returns the origin of the signal. This is an alias for
     *     getOrigin to maintain API symmetry with getSignalName.
     * @returns {String} The signal origin of the receiver.
     */

    return this.getOrigin();
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getTarget',
function() {

    /**
     * @method getTarget
     * @summary Returns the target of the signal. For most events this is the
     *     origin _object_, but for DOM events, particularly those with a native
     *     event component, this will be the element.
     * @returns {Object} The target of the receiver.
     */

    var payload,
        origin,
        inst,
        id;

    //  DOM-based signals, which are the most common consumers of a "target",
    //  are usually provided either the original event or a hash with specific
    //  keys

    payload = this.getPayload();

    if (TP.isEvent(payload)) {
        inst = TP.eventGetTarget(payload);
    } else if (TP.isElement(payload)) {
        inst = payload;
    } else if (TP.canInvoke(payload, 'at')) {
        id = payload.at('elementGlobalID');
        if (TP.notEmpty(id)) {
            if (TP.isValid(inst = TP.bySystemId(id))) {
                if (TP.canInvoke(inst, 'getNativeNode')) {
                    inst = inst.getNativeNode();
                }
            }
        } else {
            inst = payload.at('target');
        }
    } else {
        origin = this.getOrigin();
        if (TP.isValid(origin)) {
            if (TP.isString(origin)) {
                inst = TP.bySystemId(origin);
            } else {
                inst = origin;
            }

            if (TP.canInvoke(inst, 'getNativeNode')) {
                inst = inst.getNativeNode();
            }
        }
    }

    return inst;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getTypeSignalNames',
function() {

    /**
     * @method getTypeSignalNames
     * @summary Returns the list of signal names acquired from the receiver's
     *     type and its supertypes up through TP.sig.Signal. This differs from
     *     getSignalNames in that 'type signal' names will never include
     *     spoofed signal names in the result list.
     * @returns {Array} An Array of signal type names.
     */

    return this.getType().getSignalNames();
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getWindow',
function() {

    /**
     * @method getWindow
     * @summary Returns the window from which the signal originated. This is
     *     typically the TIBET window, but it can vary when UI events are
     *     involved.
     * @returns {TP.core.Window} The window object that the receiver occurred
     *     in.
     */

    var payload,
        canvasWin;

    payload = this.getPayload();

    if (TP.isEvent(payload)) {
        canvasWin = TP.win(payload.view);
        if (TP.notValid(canvasWin)) {
            canvasWin = TP.sys.getUICanvas();
        }
        return canvasWin;
    }

    if (TP.canInvoke(payload, 'at')) {
        canvasWin = TP.win(payload.at('view'));
        if (TP.notValid(canvasWin)) {
            canvasWin = TP.sys.getUICanvas();
        }
        return canvasWin;
    }

    //  We didn't get a valid signal payload object, but we can try to use
    //  the UICanvas's window anyway.
    if (TP.isWindow(canvasWin = TP.sys.getUICanvas(true))) {
        return TP.wrap(canvasWin);
    }

    //  Can't do any good here. No payload and no canvas window. Just
    //  hand back the 'tibet' window.
    return TP.wrap(window);
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('hasNotified',
function(aHandler, aContext) {

    /**
     * @method hasNotified
     * @summary Returns true if the signal should skip over notification of the
     *     handler ID provided. This method works along with the trackHandler
     *     method to let the signaling system support turning off multiple
     *     notifications to a handler of a particular signal instance.
     * @param {String|Object} aHandler A handler whose ID will be checked
     *     against the notification list for this instance.
     * @param {Object} aContext The object context that the handler is currently
     *     executing in. Note that this and the handler can be the same object
     *     in some circumstances
     * @returns {Boolean} True if the signal should not be presented to the
     *     handler for processing.
     */

    var skips,
        handlerKey,
        skipCount;

    if (TP.notValid(skips = this.get('notifiedHandlers'))) {
        return false;
    }

    if (TP.notValid(aHandler)) {
        return true;
    }

    //  The handlerKey is made up of the context ID, the handler's ID and the
    //  current signal name. This allows proper skip/renew behavior when
    //  dispatching through an inheritance hierarchy of signals.
    handlerKey = aContext.getID() +
                    '_' +
                    aHandler.getID() +
                    '_' +
                    this.getID();

    skipCount = skips.at(handlerKey);
    if (TP.isValid(skipCount)) {
        return skipCount > 0;
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('isBubbling',
function() {

    /**
     * @method isBubbling
     * @summary Returns true if the signal bubbles. This is typically only used
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
     * @method isCancelable
     * @summary Returns true if the signal can be cancelled (i.e. it will
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

TP.sig.Signal.Inst.defineMethod('isControllerRoot',
function(aFlag) {

    /**
     * @method isControllerRoot
     * @summary Combined setter/getter for whether signals of this type form a
     *     local signaling root. When true certain forms of signaling will stop
     *     traversing supertypes and stop with the receiver.
     * @param {Boolean} aFlag
     * @returns {Boolean} Whether or not the receiver can be considered a
     *     'signaling root'.
     */

    var type,
        sigType;

    type = this.getType();

    sigType = TP.sig.SignalMap.$getSignalType(this, type);
    if (TP.isString(sigType)) {
        sigType = TP.sys.getTypeByName(sigType);
    }

    if (!TP.isType(sigType)) {
        sigType = type;
    }

    return sigType.isControllerRoot(aFlag);
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('isControllerSignal',
function(aFlag) {

    /**
     * @method isControllerSignal
     * @summary Combined setter/getter for whether signals of this type will
     *     stop before traversing the TIBET controller chain. Only controller
     *     signals (Routing, Workflow, UI signals, etc)  notify controllers.
     * @param {Boolean} aFlag
     * @returns {Boolean} Whether or not signals of this type will traverse the
     *     TIBET controller chain or not.
     */

    var type,
        sigType;

    type = this.getType();

    sigType = TP.sig.SignalMap.$getSignalType(this, type);
    if (TP.isString(sigType)) {
        sigType = TP.sys.getTypeByName(sigType);
    }

    if (!TP.isType(sigType)) {
        sigType = type;
    }

    return sigType.isControllerSignal(aFlag);
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('isRecyclable',
function(aFlag) {

    /**
     * @method isRecyclable
     * @summary Returns true if the signal can be recycled.
     * @param {Boolean} aFlag A new setting. Optional.
     * @returns {Boolean} True if the signal can be recycled.
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
     * @method isSignalingRoot
     * @summary Combined setter/getter for whether signals of this type form a
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
     * @method isSpoofed
     * @summary Returns true if the signal is 'spoofed' - that is, it has a
     *     custom signal name different from its type name.
     * @returns {Boolean} True if the signal is spoofed.
     */

    return this.getTypeName() !== TP.expandSignalName(this.getSignalName());
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('preventDefault',
function(aFlag) {

    /**
     * @method preventDefault
     * @summary Tells a potential handler to not perform whatever default
     *     action it might perform.
     * @description Note that this method does not signal 'Change', even if it's
     *     'shouldSignalChange' attribute is true.
     * @param {Boolean} aFlag Prevent default: yes or no?
     * @returns {Boolean} True if the signal should not perform its default
     *     action.
     */

    var flag;

    flag = TP.ifInvalid(aFlag, true);

    return this.shouldPrevent(flag);
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('release',
function() {

    /**
     * @method release
     * @summary Clears the receiver's recyclable flag, allowing it to be
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
     * @method recycle
     * @summary Prepares the receiver for a new usage cycle.
     * @returns {TP.sig.Signal} The receiver.
     */

    this.origin = null;
    this.context = null;

    this.listener = null;

    this.notifiedHandlers = null;

    this.phase = null;

    this.payload = null;

    this.recyclable = false;

    this.signalName = null;

    this.$shouldPrevent = false;
    this.$shouldStop = false;

    this.$shouldScanSupers = false;

    this.target = null;
    this.time = null;

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('removeKey',
function(aKey) {

    /**
     * @method removeKey
     * @summary Removes a key (and it's attendant value) from the receiver's
     *     payload, provided that the payload can handle a removeKey operation.
     * @description Note that this method does not signal 'Change', even if it's
     *     'shouldSignalChange' attribute is true. Observe the payload for
     *     change notification.
     * @param {String} aKey The key for the parameter.
     * @returns {TP.sig.Signal} The receiver.
     */

    var payload;

    payload = this.getPayload();
    if (TP.notValid(payload)) {
        return this;
    }

    if (TP.canInvoke(payload, 'removeKey')) {
        payload.removeKey(aKey);

        return this;
    }

    this.raise('TP.sig.InvalidPayload',
                    'Unable to remove payload key: ' + aKey);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('renewHandler',
function(aHandler, aContext) {

    /**
     * @method renewHandler
     * @summary Tells the signal instance to reset a specific handler ID so
     *     that the handler can be told multiple times about a single signal
     *     instance. Usually invoked by the handler itself so it can be invoked
     *     multiple times.
     * @param {String|Object} aHandler The handler or handler ID that was
     *     being skipped due to prior notification for a particular sequence.
     * @param {Object} aContext The object context that the handler is currently
     *     executing in. Note that this and the handler can be the same object
     *     in some circumstances
     */

    var handlerKey,
        skips,

        skipCount;

    if (TP.notValid(aHandler)) {
        return;
    }

    //  The handlerKey is made up of the context ID, the handler's ID and the
    //  current signal name. This allows proper skip/renew behavior when
    //  dispatching through an inheritance hierarchy of signals.
    handlerKey = aContext.getID() +
                    '_' +
                    aHandler.getID() +
                    '_' +
                    this.getID();

    if (TP.notValid(skips = this.$get('notifiedHandlers'))) {
        skips = TP.hc();
        this.$set('notifiedHandlers', skips, false);
    }

    //  Decrement the count (or set it to -1). This works in conjunction with
    //  the trackHandler method (which increments or sets to 1) to allow a
    //  'count' to be kept for accurate nested behavior.
    skipCount = skips.at(handlerKey);
    if (TP.isValid(skipCount)) {
        skipCount -= 1;
    } else {
        skipCount = -1;
    }

    //  any non-true value should work here
    return skips.atPut(handlerKey, skipCount);
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('setOrigin',
function(anOrigin) {

    /**
     * @method setOrigin
     * @summary Sets the origin of the signal.
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
     * @method setPayload
     * @summary Sets the payload/parameter object of the signal.
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
     * @method setPhase
     * @summary Sets the phase of the signal.
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
function(aSignalName, clearNotifications) {

    /**
     * @method setSignalName
     * @summary Defines the name of the signal.
     * @description By default a signal's name matches its type, but to support
     *     lightweight signals whose only differentiation is their name we allow
     *     TP.sig.Signal and other subtypes to stand in for a subtype simply by
     *     changing their names. An additional side-effect of this call is that
     *     any previous notification list is cleared since the instance's name,
     *     and hence the handlers being invoked, could change.
     * @param {String} aSignalName The name this instance should report as being
     *     its signal name.
     * @param {Boolean} clearNotifications Whether or not to 'clear' any
     *     notification list that the instance may have. This is true by default.
     * @returns {TP.sig.Signal} The receiver.
     */

    this.$set('signalName', aSignalName);

    if (TP.isFalse(clearNotifications)) {
        //  reset processing controls so execution can happen under new name
        this.clearNotifications();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('shouldLog',
function() {

    /**
     * @method shouldLog
     * @summary Returns true when the signal can be logged during signal
     *     processing. The default is true for most signals, but many types of
     *     signals have to check TIBET configuration flags to see if they can
     *     currently be logged.
     * @returns {Boolean} True if the signal can be logged.
     */

    return this.getType().shouldLog();
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('shouldPrevent',
function(aFlag) {

    /**
     * @method shouldPrevent
     * @summary Returns true if the signal handler(s) should not perform the
     *     default action. If a flag is provided this flag is used to set the
     *     prevent status.
     * @description Note that this method does not signal 'Change', even if it's
     *     'shouldSignalChange' attribute is true.
     * @param {Boolean} aFlag Prevent default: yes or no?
     * @returns {Boolean} True if the signal should not perform its default
     *     action.
     */

    if (TP.isDefined(aFlag)) {
        this.$shouldPrevent = aFlag;
    }

    return this.$shouldPrevent;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('shouldScanSupertypes',
function(aFlag) {

    /**
     * @method shouldScanSupertypes
     * @summary Returns true if the signal should notify observers aggressively
     *     by scanning supertypes during notification. Note that this is not the
     *     same as inheritance firing. See notifyObservers for more info.
     * @param {Boolean} aFlag Scan supertypes?
     * @returns {Boolean} True if the signal should scan supertypes.
     */

    if (TP.isDefined(aFlag)) {
        this.$shouldScanSupers = aFlag;
    }

    return this.$shouldScanSupers;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('shouldStop',
function(aFlag) {

    /**
     * @method shouldStop
     * @summary Returns true if the signal should stop propagating. If a flag
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

TP.sig.Signal.Inst.defineMethod('shouldStopImmediately',
function(aFlag) {

    /**
     * @method shouldStopImmediately
     * @summary Returns true if the signal should stop propagating immediately.
     *     If a flag is provided this flag is used to set the propagation state.
     * @description Note that this method does not signal 'Change', even if it's
     *     'shouldSignalChange' attribute is true.
     * @param {Boolean} aFlag Stop propagating immedidately: yes or no?
     * @returns {Boolean} True if the signal should stop propagation
     *     immediately.
     */

    //  if we're not cancelable this is a no-op
    if (!this.isCancelable()) {
        return false;
    }

    if (TP.isDefined(aFlag)) {
        this.$shouldStopImmediately = aFlag;
    }

    return this.$shouldStopImmediately;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('stopImmediatePropagation',
function(aFlag) {

    /**
     * @method stopImmediatePropagation
     * @summary Tells the signal to stop propagation immediately. This call is
     *     similar to stopPropagation for DOM-oriented signals but will cause
     *     propagation to stop within a specific set of handlers for a
     *     particular node even if all handlers at that level have not fired.
     * @description Note that this method does not signal 'Change', even if it's
     *     'shouldSignalChange' attribute is true.
     * @param {Boolean} aFlag Stop propagating immediately: yes or no?
     * @returns {Boolean} True if the signal should stop propagation.
     */

    var flag;

    flag = TP.ifInvalid(aFlag, true);

    return this.shouldStopImmediately(flag);
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('stopPropagation',
function(aFlag) {

    /**
     * @method stopPropagation
     * @summary Tells the signal to stop propagation -- subject to the
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

TP.sig.Signal.Inst.defineMethod('trackHandler',
function(aHandler, aContext) {

    /**
     * @method trackHandler
     * @summary Tells the signal instance to track a specific handler ID. This
     *     can be called on the signal instance at any time, but is typically
     *     called by the signaling system to avoid duplicate notifications
     *     during DOM traversals.
     * @param {String|Object} aHandler The handler or handler ID to skip for a
     *     particular signaling sequence.
     * @param {Object} aContext The object context that the handler is currently
     *     executing in. Note that this and the handler can be the same object
     *     in some circumstances
     */

    var handlerKey,
        skips,

        skipCount;

    if (TP.notValid(aHandler)) {
        return;
    }

    //  The handlerKey is made up of the context ID, the handler's ID and the
    //  current signal name. This allows proper skip/renew behavior when
    //  dispatching through an inheritance hierarchy of signals.
    handlerKey = aContext.getID() +
                    '_' +
                    aHandler.getID() +
                    '_' +
                    this.getID();

    if (TP.notValid(skips = this.$get('notifiedHandlers'))) {
        skips = TP.hc();
        this.$set('notifiedHandlers', skips, false);
    }

    //  Increment the count (or set it to 1). This works in conjunction with
    //  the renewHandler method (which increments or sets to -1) to allow a
    //  'count' to be kept for accurate nested behavior.
    skipCount = skips.at(handlerKey);
    if (TP.notValid(skipCount)) {
        skipCount = 1;
    } else {
        skipCount += 1;
    }

    return skips.atPut(handlerKey, skipCount);
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

//  ------------------------------------------------------------------------

TP.definePrimitive('ec',
function(anError, aMessage) {

    /**
     * @method ec
     * @summary Constructs a new TP.sig.Exception using anError as the key
     *     element of the payload. An optional message augmenting the Error's
     *     native message can also be provided.
     * @param {Error} anError The Error object to use as the key element of the
     *     payload.
     * @param {String} aMessage The message to use as the message of the
     *     TP.sig.Exception. If this message is empty, the message from the
     *     Error object is used.
     */

    var msg;

    msg = TP.isEmpty(aMessage) ? anError.message : aMessage;

    return TP.sig.Exception.construct(TP.hc('error', anError,
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
     * @method getLevel
     * @summary Returns the severity level associated with this type.
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
     * @method asSource
     * @summary Returns the receiver as a TIBET source code string.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    var marker,
        err,
        msg,
        str,
        keys;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asSource';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    err = this.at('error');
    if (TP.isError(err)) {
        msg = err.message || err.toString();
    } else if (TP.isValid(err)) {
        msg = TP.str(err) || err.toString();
    } else {
        msg = this.getMessage();
    }

    try {
        str = this.getTypeName() + '.construct(' +
                'TP.hc(' +
                    '\'error\', ' + TP.src(err) + ', ' +
                    '\'message\', ' + '\'' + msg + '\'' +
                '))';

        //  Make sure to remove the 'payload' key since we already use the
        //  payload in the constructor.
        keys = this.getUniqueValueKeys();
        keys.remove('payload');

        str += this.$generateSourceSets(keys);
    } catch (e) {
        str = this.toString();
    } finally {
        delete this[marker];
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.sig.Exception.Inst.defineMethod('asDumpString',
function(depth, level) {

    /**
     * @method asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @param {Number} [depth=1] Optional max depth to descend into target.
     *     IGNORED for this type.
     * @param {Number} [level=1] Passed by machinery, don't provide this.
     *     IGNORED for this type.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    var marker,
        err,
        msg,
        str;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asDumpString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    err = this.at('error');
    if (TP.isError(err)) {
        msg = TP.str(err) || err.toString();
        msg += TP.getStackInfo(err).join('\n');
    } else if (TP.isValid(err)) {
        msg = TP.str(err) || err.toString();
    } else {
        msg = this.getMessage();
    }

    str = '[' + this.getSignalName() + ' :: ';

    try {
        str += '(' + msg + ')' + ']';
    } catch (e) {
        str += '(' + TP.str(this.getPayload()) + ')' + ']';
    } finally {
        delete this[marker];
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.sig.Exception.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver.
     * @returns {String} The receiver in HTML string format.
     */

    var marker,
        err,
        msg,
        str;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asHTMLString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    err = this.at('error');
    if (TP.isValid(err)) {
        msg = TP.str(err) || err.toString();
    } else {
        msg = this.getMessage();
    }

    try {
        if (TP.isValid(err)) {
            str = '<span class="TP_sig_Exception ' +
                    TP.escapeTypeName(TP.tname(this)) + '">' +
                        '<span data-name="payload">' +
                            TP.htmlstr(err) +
                         '</span>' +
                     '</span>';
        } else {
            str = '<span class="TP_sig_Exception ' +
                    TP.escapeTypeName(TP.tname(this)) + '">' +
                        '<span data-name="payload"><span data-name="message">' +
                            TP.htmlstr(msg) +
                         '</span></span>' +
                     '</span>';
        }

    } catch (e) {
        str = this.toString();
    } finally {
        delete this[marker];
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.sig.Exception.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @method asJSONSource
     * @summary Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    var marker,
        err,
        msg,
        str;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asJSONSource';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    err = this.at('error');
    if (TP.isValid(err)) {
        msg = TP.str(err) || err.toString();
    } else {
        msg = this.getMessage();
    }

    try {
        if (TP.isValid(err)) {
            str = '{"type":' + this.getTypeName().quoted('"') + ',' +
                    '"data":{' +
                        '"signame":' +
                             this.getSignalName().quoted('"') + ',' +
                        '"payload":' + TP.jsonsrc(err) +
                    '}}';
        } else {
            str = '{"type":' + this.getTypeName().quoted('"') + ',' +
                    '"data":{' +
                        '"signame":' +
                             this.getSignalName().quoted('"') + ',' +
                        '"payload":{"message":' + TP.jsonsrc(msg) + '}' +
                    '}}';
        }

    } catch (e) {
        str = this.toString();
    } finally {
        delete this[marker];
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.sig.Exception.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @method asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    var marker,
        err,
        msg,
        str;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asPrettyString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    err = this.at('error');
    if (TP.isValid(err)) {
        msg = TP.str(err) || err.toString();
    } else {
        msg = this.getMessage();
    }

    try {
        if (TP.isValid(err)) {
            str = '<dl class="pretty ' + TP.escapeTypeName(TP.tname(this)) +
                            '">' +
                        '<dt>Type name</dt>' +
                        '<dd class="pretty typename">' +
                            this.getTypeName() +
                        '</dd>' +
                        TP.pretty(err) +
                        '</dl>';
        } else {
            str = '<dl class="pretty ' + TP.escapeTypeName(TP.tname(this)) +
                            '">' +
                        '<dt>Type name</dt>' +
                        '<dd class="pretty typename">' +
                            this.getTypeName() +
                        '</dd>' +
                        TP.pretty(msg) +
                        '</dl>';
        }

    } catch (e) {
        str = this.toString();
    } finally {
        delete this[marker];
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.sig.Exception.Inst.defineMethod('asString',
function(verbose) {

    /**
     * @method asString
     * @summary Returns a reasonable string represention of the exception.
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the TP.sig.Exception's String representation. The default is true.
     * @returns {String} The receiver as a String
     */

    var marker,
        err,
        msg,
        wantsVerbose,
        str;

    wantsVerbose = TP.ifInvalid(verbose, true);
    if (!wantsVerbose) {
        return this.getSignalName() + TP.OID_PREFIX +
                this.toString().split(TP.OID_PREFIX).last();
    }

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    err = this.at('error');
    if (TP.isValid(err)) {
        msg = TP.str(err) || err.toString();
    } else {
        msg = this.getMessage();
    }

    try {
        str = this.getSignalName() +
                ' :: ' +
                '(' + msg + ')';
    } catch (e) {
        str = this.toString();
    } finally {
        delete this[marker];
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.sig.Exception.Inst.defineMethod('asXMLString',
function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver.
     * @returns {String} The receiver in XML string format.
     */

    var marker,
        err,
        msg,
        str;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asXMLString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    err = this.at('error');
    if (TP.isValid(err)) {
        msg = TP.str(err) || err.toString();
    } else {
        msg = this.getMessage();
    }

    try {
        if (TP.isValid(err)) {
            str = '<instance type="' + TP.tname(this) + '">' +
                        '<payload>' +
                            TP.xmlstr(err) +
                         '</payload>' +
                     '</instance>';
        } else {
            str = '<instance type="' + TP.tname(this) + '">' +
                        '<payload><message>' +
                            TP.xmlstr(msg) +
                         '</message></payload>' +
                     '</instance>';
        }

    } catch (e) {
        str = this.toString();
    } finally {
        delete this[marker];
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.sig.Exception.Inst.defineMethod('getError',
function() {

    /**
     * @method getError
     * @summary Returns the Error object, if any, associated with this
     *     exception. This object is typically found in the payload under the
     *     key 'error'.
     * @returns {Error} A native Error object.
     */

    return this.at('error');
});

//  ------------------------------------------------------------------------

TP.sig.Exception.Inst.defineMethod('getLevel',
function() {

    /**
     * @method getLevel
     * @summary Returns the severity level associated with this instance.
     * @returns {Number} The severity level of the receiver.
     */

    return this.getType().getLevel();
});

//  ------------------------------------------------------------------------

TP.sig.Exception.Inst.defineMethod('getMessage',
function() {

    /**
     * @method getMessage
     * @summary Returns the message(s), if any, associated with this instance.
     * @returns {String} The message entry/entries associated with the receiver.
     */

    return this.at('message');
});

//  ------------------------------------------------------------------------
//  TOP LEVEL SIGNALS/EXCEPTIONS
//  ------------------------------------------------------------------------

//  create benign messaging signal types
TP.sig.Signal.defineSubtype('TRACE');
TP.sig.Signal.defineSubtype('DEBUG');
TP.sig.Signal.defineSubtype('INFO');
TP.sig.Signal.defineSubtype('SYSTEM');

//  build up logging exception hierarchy
TP.sig.Exception.defineSubtype('WARN');

TP.sig.WARN.defineSubtype('ERROR');
TP.sig.ERROR.defineSubtype('FATAL');

TP.sig.TRACE.Type.defineAttribute('$level', TP.TRACE);
TP.sig.DEBUG.Type.defineAttribute('$level', TP.DEBUG);
TP.sig.INFO.Type.defineAttribute('$level', TP.INFO);
TP.sig.WARN.Type.defineAttribute('$level', TP.WARN);
TP.sig.ERROR.Type.defineAttribute('$level', TP.ERROR);
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

//  Don't signal Change at the controller level.
//  NOTE this is a LOCAL assignment so subtypes don't inherit it.
TP.sig.Change.isControllerRoot(true);

//  ------------------------------------------------------------------------

TP.sig.Change.Inst.defineMethod('getAction',
function() {

    /**
     * @method getAction
     * @summary Returns the action which caused the sender to change.
     * @returns {String} The action of the receiver.
     */

    return this.at('action');
});

//  ------------------------------------------------------------------------

TP.sig.Change.Inst.defineMethod('getAspect',
function() {

    /**
     * @method getAspect
     * @summary Returns the aspect of the sender which changed.
     * @returns {String} The aspect of the receiver.
     */

    return this.at('aspect');
});

//  ------------------------------------------------------------------------

TP.sig.Change.Inst.defineMethod('getSource',
function() {

    /**
     * @method getSource
     * @summary Returns the object to be used as the data source to retrieve the
     *     receiver's value from.
     * @returns {Object} The source to use as the data source to get this
     *     signal's value.
     */

    var source;

    //  Attempt to get the value using either the target or the origin and the
    //  aspect.
    if (!TP.isValid(source = this.at('target'))) {
        source = this.getOrigin();
        if (TP.isString(source)) {
            source = TP.sys.getObjectById(source);
            if (TP.notValid(source)) {
                return;
            }
        }
    }

    return source;
});

//  ------------------------------------------------------------------------

TP.sig.Change.Inst.defineMethod('getValue',
function() {

    /**
     * @method getValue
     * @summary Returns the new value.
     * @returns {String} The value of the receiver.
     */

    var value,
        source,
        aspect,

        retVal;

    value = this.at(TP.NEWVAL);
    if (TP.isValid(value)) {
        return value;
    }

    //  If the payload has 'path', use that - otherwise use the aspect.
    aspect = this.at('path') || this.getAspect();
    if (TP.isEmpty(aspect)) {
        return;
    }

    //  Get the source object that we will use to ask the value of
    source = this.getSource();

    //  If we can invoke 'get' on that source, see if we get a valid value by
    //  doing a 'get' on it. If we don't get a valid value, try again by
    //  creating an access path from the aspect.
    if (TP.canInvoke(source, 'get')) {

        retVal = source.get(aspect);

        if (TP.notValid(retVal)) {
            retVal = source.get(TP.apc(aspect));
        }
    }

    return retVal;
});

//  ------------------------------------------------------------------------
//  TP.sig.IndexChange
//  ------------------------------------------------------------------------

/*
*/

//  ------------------------------------------------------------------------

TP.sig.Change.defineSubtype('IndexChange');

//  ------------------------------------------------------------------------
//  TP.sig.FacetChange
//  ------------------------------------------------------------------------

/*
*/

//  ------------------------------------------------------------------------

TP.sig.Change.defineSubtype('FacetChange');

//  ------------------------------------------------------------------------

TP.sig.FacetChange.Inst.defineMethod('getFacet',
function() {

    /**
     * @method getFacet
     * @summary Returns the facet of the sender which changed.
     * @returns {String} The facet of the receiver.
     */

    return this.at('facet');
});

//  ------------------------------------------------------------------------

TP.sig.FacetChange.defineSubtype('ReadonlyChange');
TP.sig.FacetChange.defineSubtype('RelevantChange');
TP.sig.FacetChange.defineSubtype('RequiredChange');
TP.sig.FacetChange.defineSubtype('ValidChange');

//  ------------------------------------------------------------------------
//  TP.sig.ValueChange
//  ------------------------------------------------------------------------

/*
*/

//  ------------------------------------------------------------------------

TP.sig.FacetChange.defineSubtype('ValueChange');

//  ------------------------------------------------------------------------
//  TP.sig.StructureChange
//  ------------------------------------------------------------------------

/*
*/

//  ------------------------------------------------------------------------

TP.sig.ValueChange.defineSubtype('StructureChange');

//  ------------------------------------------------------------------------
//  TP.sig.StructureInsert / TP.sig.StructureDelete
//  ------------------------------------------------------------------------

/*
*/

//  ------------------------------------------------------------------------

TP.sig.StructureChange.defineSubtype('StructureInsert');
TP.sig.StructureChange.defineSubtype('StructureDelete');

//  ------------------------------------------------------------------------
//  TP.sig.RouteChange
//  ------------------------------------------------------------------------

/*
*/

//  ------------------------------------------------------------------------

TP.sig.Change.defineSubtype('RouteChange');

//  Routing events in particular should inform the controller chain.
TP.sig.RouteChange.Type.isControllerSignal(true);

//  RouteChange is a special form of Change which should not traverse higher.
//  NOTE this is a LOCAL assignment so subtypes don't inherit it.
TP.sig.RouteChange.isSignalingRoot(true);

//  The sequence that the router will fire these is:

//      Exit
//      Enter
//      Finalize

//  The signal type for entering a route
TP.sig.RouteChange.defineSubtype('RouteEnter');

//  The signal type for exiting a route
TP.sig.RouteChange.defineSubtype('RouteExit');

//  The signal type for finalizing a route
TP.sig.RouteChange.defineSubtype('RouteFinalize');

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

TP.lang.Object.defineSubtype('sig.SignalMap');

//  ------------------------------------------------------------------------

//  for reimporting we test here
if (TP.notValid(TP.sig.SignalMap.interests)) {
    TP.sig.SignalMap.interests = TP.constructOrphanObject();

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
                    /Change$/);
TP.sig.SignalMap.Type.defineConstant(
                    'INDEX_CHANGE_REGEX',
                    /Index[0-9]+Change$/);
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

TP.sig.SignalMap.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    //  turn off logging unless we're debugging the internals of notification
    this.shouldLog(false);

    return;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('$computeOriginID',
function(anOrigin) {

    var orgid;

    orgid = TP.isValid(anOrigin) ? TP.id(anOrigin) : TP.ANY;
    if (orgid === '*' || orgid === '') {
        orgid = TP.ANY;
    }

    return orgid;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('$computeSignalName',
function(aSignal) {

    var signame;

    signame = TP.isValid(aSignal) ? aSignal.getSignalName() : TP.ANY;
    if (TP.notValid(signame) || signame === '*' || signame === '') {
        signame = TP.ANY;
    }

    return signame;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('$constructHandlerEntries',
function(anOrigin, aSignal, aHandler, aPhase, propagate, defaultAction, anObserver, xmlEvent) {

    /**
     * @method $constructHandlerEntries
     * @summary Creates 1..n signal map entries for the interest specified.
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

    if (TP.isEmpty(anOrigin) || anOrigin === '*') {
        origins = TP.ANY;
    } else {
        origins = anOrigin;
    }
    origins = origins.split(' ');

    if (TP.isEmpty(aSignal) || aSignal === '*') {
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
            } else {    //  NOT XML EVENTS
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

    return handlers;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('$getDefaultTypeForPolicy',
function(aPolicy) {

    /**
     * @method $getDefaultTypeForPolicy
     * @summary Returns the default type of signal of the policy provided.
     *     Default signal types are used by the system for 'spoofed' signals
     *     (i.e. when a real signal type isn't provided).
     * @param {Function|String} aPolicy The policy specification.
     * @returns {TP.lang.RootObject.<TP.core.Signal>} The default signal type
     *     for the provided policy.
     */

    switch (aPolicy) {
        case TP.EXCEPTION_FIRING:
            return TP.sig.Exception;
        case TP.DOM_FIRING:
            return TP.sig.DOMSignal;
        case TP.RESPONDER_FIRING:
            return TP.sig.ResponderSignal;

        case TP.OBSERVER_FIRING:
        case TP.INHERITANCE_FIRING:
        case TP.FIRE_ONE:
        default:
            return TP.sig.Signal;
    }
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('$getPolicyName',
function(aPolicy) {

    /**
     * @method $getPolicyName
     * @summary Returns the public name of the policy provided. If the policy
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
     * @method $getSignalInstance
     * @summary Returns a signal instance for use. This is optimized via the
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
     */

    var sig,
        sigType;

    if (TP.isString(aSignal) || !TP.canInvoke(aSignal, 'clearNotifications')) {
        sigType = TP.sig.SignalMap.$getSignalType(aSignal, defaultType);

        if (TP.isType(sigType)) {
            TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE ?
                TP.trace('Using signal type named: ' +
                                sigType.getName(),
                            TP.SIGNAL_LOG) : 0;

            sig = sigType.construct(aPayload);
            sig.$set('signalName', aSignal.getSignalName());

            TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE ?
                TP.trace('Returning instance with signalName: ' +
                                sig.getSignalName(),
                            TP.SIGNAL_LOG) : 0;
        } else {
            TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE ?
                TP.trace('Failed to find signal instance for: ' + aSignal,
                            TP.SIGNAL_LOG) : 0;

            sig = aSignal;
        }
    } else {
        TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE ?
            TP.trace('Returning supplied signal instance: ' + aSignal,
                        TP.SIGNAL_LOG) : 0;

        sig = aSignal;
    }

    //  Ensure the signal gets any payload that was provided explicitly.
    if (TP.isValid(aPayload)) {
        if (sig.getPayload() !== aPayload) {
            sig.setPayload(aPayload);
        }
    }

    //  make sure the signal can be run cleanly against all handlers within
    //  a particular policy activation
    if (TP.canInvoke(sig, 'clearNotifications')) {
        sig.clearNotifications();
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
     * @method $getSignalType
     * @summary Returns a signal type for use by looking up the type matching
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
     */

    var aTypeName,
        sigType,
        defaultType,
        match;

    //  if we've got a string turn it into a signal type reference
    if (TP.isString(aSignal)) {
        TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE ?
            TP.trace('Getting type for aSignal string: ' + aSignal,
                        TP.SIGNAL_LOG) : 0;

        //  the signal type name will be the signal name.
        aTypeName = TP.expandSignalName(aSignal);

        if (TP.notValid(sigType = TP.sys.getTypeByName(aTypeName))) {
            TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE ?
                TP.trace('No signal type named: ' + aTypeName,
                            TP.SIGNAL_LOG) : 0;

            //  try to get the best default signal possible here
            if (TP.sig.SignalMap.ERROR_REGEX.test(aSignal) ||
                TP.sig.SignalMap.ERROR_CODE_REGEX.test(aSignal)) {
                defaultType = TP.ifInvalid(aDefaultType, TP.sig.ERROR);
            } else if (TP.sig.SignalMap.WARN_REGEX.test(aSignal)) {
                defaultType = TP.ifInvalid(aDefaultType, TP.sig.WARN);
            } else if (TP.sig.SignalMap.CHANGE_REGEX.test(aSignal)) {
                //  Change comes in terms of facets...so we need to test for
                //  those to determine best supertype here.
                match = aSignal.match(
                    /(Value|Valid|Required|Relevant|Readonly)Change$/);
                if (TP.isValid(match)) {
                    if (TP.isValid(TP.sig[match[0]])) {
                        defaultType = TP.sig[match[0]];
                    }
                }

                //  One other class of changes is structural/crud changes...
                if (TP.notValid(defaultType)) {
                    match = aSignal.match(
                        /Structure(Insert|Update|Delete|Change)/);
                    if (TP.isValid(match)) {
                        if (TP.isValid(TP.sig[match[0]])) {
                            defaultType = TP.sig[match[0]];
                        } else {
                            //  We know it's a Structure thing...
                            defaultType = TP.sig.StructureChange;
                        }
                    }

                    defaultType = TP.ifInvalid(defaultType, TP.sig.ValueChange);
                }

            } else if (TP.sig.SignalMap.INDEX_CHANGE_REGEX.test(aSignal)) {
                defaultType = TP.ifInvalid(aDefaultType, TP.sig.IndexChange);
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

TP.sig.SignalMap.defineMethod('$isInterestSuspended',
function(anOrigin, aSignal) {

    /**
     * @method $isInterestSuspended
     * @summary Returns true if the combination of origin and signal ID is
     *     marked as suspended in the signal map.
     * @param {String} anOrigin What origin are we checking?
     * @param {String|tp.sig.Signal} aSignal What signal name?
     * @returns {Boolean} Whether or not a particular origin/signal ID is
     *     suspended or not.
     */

    var orgid,
        signame,
        entry;

    orgid = TP.sig.SignalMap.$computeOriginID(anOrigin);
    signame = TP.sig.SignalMap.$computeSignalName(aSignal);

    entry = TP.sig.SignalMap.interests[orgid + '.' + signame];

    if (TP.isValid(entry)) {
        return entry.suspend === true;
    } else if (!TP.regex.HAS_PERIOD.test(signame)) {
        //  If the signame didn't have a period, then it might be a spoofed
        //  signal name, but the registration would've been made using a
        //  'full signal' name (i.e. prefixed by 'TP.sig.').
        entry = TP.sig.SignalMap.interests[orgid + '.' + 'TP.sig.' + signame];

        if (TP.isValid(entry)) {
            return entry.suspend === true;
        }
    }
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('$registerHandlerEntry',
function(aHandlerEntry, quiet) {

    /**
     * @method $registerHandlerEntry
     * @summary Registers the supplied signal map entry into the signal map.
     * @description Note that no duplicate entries are made meaning each handler
     *     is notified only once per signal occurrence unless the TIBET flag
     *     shouldAllowDuplicateInterests() returns true. Also, if the enclosing
     *     interest container has already been created for another handler, and
     *     is suspended, it will remain suspended until a resume is invoked. If
     *     the specific entry is suspended it will be reactivated as a result
     *     of this call.
     * @param {Object} aHandlerEntry A listener entry.
     * @param {Boolean} quiet True to quietly ignore duplicate entries.
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
        handlerID,
        phase,
        win;

    map = TP.sig.SignalMap.interests;

    orgid = TP.sig.SignalMap.$computeOriginID(aHandlerEntry.target);
    signame = TP.sig.SignalMap.$computeSignalName(aHandlerEntry.event);

    //  ---
    //  origin/signal owner notification
    //  ---

    //  ensure owners such as mouse and keyboard know about this event.
    origin = TP.isTypeName(orgid) ? TP.sys.getTypeByName(orgid) : orgid;
    if (TP.canInvoke(origin, 'addObserver')) {
        origin.addObserver(orgid, signame);
    }

    //  some events require interaction with an "owner", typically a
    //  TP.core.Device, responsible for events of that type which may also
    //  decide to manage observations directly
    type = TP.isTypeName(signame) ? TP.sys.getTypeByName(signame) : signame;

    //  special case here for keyboard events since their names are often
    //  synthetic and we have to map to the true native event type
    if (TP.notValid(type)) {
        if (TP.regex.KEY_EVENT.test(signame)) {
            type = TP.sys.getTypeByName('TP.sig.DOMKeySignal');
        }
    }

    //  If we have a type we need to ask it if events of that type have a signal
    //  owner. If so we'll need to let that type manage observations as well.
    if (TP.canInvoke(type, 'getSignalOwner') &&
        TP.isValid(owner = type.getSignalOwner())) {

        if (owner !== origin && TP.canInvoke(owner, 'addObserver')) {
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
        TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE ?
            TP.trace('Interest root not found.',
                        TP.SIGNAL_LOG) : 0;

        entry = TP.constructOrphanObject();
        entry.target = orgid;
        entry.event = signame;
        entry.listeners = [];
        map[id] = entry;

        root = entry;
    }

    entry = null;

    handlerID = aHandlerEntry.handler;

    //  some handler entries have id's and some are inline functions. we use
    //  the handler attribute to hold this data just as in XML Events
    if (TP.notEmpty(handlerID)) {
        phase = aHandlerEntry.phase;

        entry = root.listeners.detect(
                function(item) {
                    return item.handler === handlerID && item.phase === phase;
                });

        if (TP.notValid(entry)) {
            TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE ?
                    TP.trace('Listener not found.',
                    TP.SIGNAL_LOG) : 0;
        }
    }

    //  if we find an entry we have two options, first if the entry "isn't
    //  really there" because it's in a remove state we can reactivate it
    if (TP.isValid(entry)) {
        if (TP.isTrue(quiet)) {
            return;
        }

        if (!TP.sys.shouldAllowDuplicateInterests()) {
            TP.ifWarn() && TP.$DEBUG && TP.$$VERBOSE ?
                TP.warn(
                    TP.join('Duplicate interest registration for origin: ',
                            orgid, ' signal: ',
                            signame, ' handler: ',
                            handlerID, ' ignored.'),
                    TP.SIGNAL_LOG) : 0;

            return;
        }

        if (entry.suspend === true) {
            TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE ?
                TP.trace('Listener currently flagged as suspended.',
                            TP.SIGNAL_LOG) : 0;

            delete entry.suspend;

            return;
        }

        if (entry.remove === true) {
            TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE ?
                TP.trace('Listener currently flagged as removed.',
                            TP.SIGNAL_LOG) : 0;

            delete entry.remove;

            return;
        }
    }

    TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE ?
        TP.trace('Creating new listener entry.',
                    TP.SIGNAL_LOG) : 0;

    //  Simple. Just use the object provided.
    entry = aHandlerEntry;

    //  if no handler ID at this point we must have an inline function to use,
    //  if the handler ID is a JS URI then we have an inline expression. either
    //  way we have to convert the JS into a function we can use
    if (TP.isEmpty(handlerID) || handlerID.startsWith('java' + 'script:')) {
        if (TP.isEmpty(handlerID)) {
            TP.ifWarn() ?
                TP.warn(TP.annotate(
                            entry,
                            'Invalid handler in listener.'),
                        TP.SIGNAL_LOG) : 0;
        } else {
            //  NOTE we have to run the TP.xmlEntitiesToLiterals() call here
            //  since XML will require quotes etc. to be in entity form
            source = TP.xmlEntitiesToLiterals(handlerID.strip(/javascript:/));

            //  build a function wrapper, using double quoting to match
            //  how attribute would likely be quoted in the source.
            source = 'function (triggerSignal) {' + source + '};';
        }

        TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE ?
            TP.trace('Found function source: ' + source,
                        TP.SIGNAL_LOG) : 0;

        //  if we have source, try to get a function handle to it
        if (TP.isString(source)) {
            //  generate a unique hash to use as a handler ID so we don't
            //  keep generating new functions for anonymous handlers
            hash = TP.hash(source, TP.HASH_MD5);

            //  note the lookup here which uses regOnly true to avoid longer
            //  searches since we know we're dealing with registered objects
            //  when using hash keys
            if (TP.isValid(TP.sys.getObjectById(hash, true))) {
                handlerID = hash;

                //  have to check for duplicate again...
                entry.handler = handlerID;

                return TP.sig.SignalMap.$registerHandlerEntry(entry);
            } else {
                try {
                    win = window;
                    /* eslint-disable no-eval */
                    eval('win.$$handler = ' + source);
                    /* eslint-enable no-eval */
                    win.$$handler.setID(hash);
                    handlerID = win.$$handler.getID();

                    //  register the object so it can be found during
                    //  notification but do it only when we had to build the
                    //  object ourselves, otherwise we presume the developer
                    //  has registered it themselves, or will when they're
                    //  ready
                    TP.sys.registerObject(win.$$handler, handlerID,
                                            true, false);
                } catch (e) {
                    TP.ifError() ?
                        TP.error(
                            TP.ec(e, 'Problem creating handler function.'),
                            TP.SIGNAL_LOG) : 0;

                    return;
                }
            }
        }
    } else if (handlerID.startsWith('#')) {
        //  local document ID reference, should have been converted to a
        //  global ID but TP.byId() will default to TP.sys.getUICanvas()
        void 0;
    }

    if (TP.isValid(handlerID)) {
        entry.handler = handlerID;

        root.listeners.push(entry);

        TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE ?
            TP.trace('Listener entry created for ID: ' + handlerID,
                        TP.SIGNAL_LOG) : 0;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('$removeHandlerEntry',
function(aHandlerEntry) {

    /**
     * @method $removeHandlerEntry
     * @summary Removes the supplied signal map entry from the signal map.
     * @param {Object} aHandlerEntry A listener entry.
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
        phase,
        handlerID,
        handler,
        removals;

    map = TP.sig.SignalMap.interests;

    orgid = TP.sig.SignalMap.$computeOriginID(aHandlerEntry.target);
    signame = TP.sig.SignalMap.$computeSignalName(aHandlerEntry.event);

    //  ---
    //  origin/signal owner notification
    //  ---

    //  ensure owners such as mouse and keyboard know about this event.
    origin = TP.isTypeName(orgid) ? TP.sys.getTypeByName(orgid) : orgid;
    if (TP.canInvoke(origin, 'removeObserver')) {
        origin.removeObserver(orgid, signame);
    }

    //  some events require interaction with an "owner", typically a
    //  TP.core.Device, responsible for events of that type which may also
    //  decide to manage observations directly
    type = TP.isTypeName(signame) ? TP.sys.getTypeByName(signame) : signame;

    //  special case here for keyboard events since their names are often
    //  synthetic and we have to map to the true native event type
    if (TP.notValid(type)) {
        if (TP.regex.KEY_EVENT.test(signame)) {
            type = TP.sys.getTypeByName('TP.sig.DOMKeySignal');
        }
    }

    //  If we have a type we need to ask it if events of that type have a signal
    //  owner. If so we'll need to let that type manage observations as well.
    if (TP.canInvoke(type, 'getSignalOwner') &&
        TP.isValid(owner = type.getSignalOwner())) {

        if (owner !== origin && TP.canInvoke(owner, 'removeObserver')) {
            owner.removeObserver(orgid, signame);
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
        TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE ?
            TP.trace('Interest root not found.',
                        TP.SIGNAL_LOG) : 0;

        return;
    }

    entry = null;

    handlerID = aHandlerEntry.handler;

    //  If the handle points to a registered Function, unregister it from
    //  the common URI registry.
    if (/Function\$\w+/.test(handlerID)) {
        handler = TP.uc('urn:tibet:' + handlerID);
        handler.unregister();
    }

    //  some handler entries have id's and some are inline functions. we use
    //  the handler attribute to hold this data just as in XML Events
    if (TP.notEmpty(handlerID)) {
        phase = aHandlerEntry.phase;

        entry = root.listeners.detect(
                function(item) {
                    return item.handler === handlerID && item.phase === phase;
                });

        if (TP.notValid(entry)) {
            TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE ?
                    TP.trace('Listener not found.',
                    TP.SIGNAL_LOG) : 0;

            return;
        }
    }

    if (TP.isValid(entry)) {

        if (entry.suspend === true) {
            TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE ?
                TP.trace('Listener currently flagged as suspended.',
                            TP.SIGNAL_LOG) : 0;

            delete entry.suspend;

            return;
        }
    }

    TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE ?
        TP.trace('Removing listener entry.',
                    TP.SIGNAL_LOG) : 0;

    //  Simple. Just use the object provided.
    entry = aHandlerEntry;

    if (TP.isValid(handlerID)) {
        entry.handler = handlerID;

        //  Select the set of 'removals' by matching on all 4 criteria.
        removals = root.listeners.select(
                        function(anEntry) {
                            return anEntry.event === entry.event &&
                                    anEntry.handler === entry.handler &&
                                    anEntry.observer === entry.observer &&
                                    anEntry.target === entry.target;
                        });

        root.listeners.removeAll(removals, TP.IDENTITY);

        if (TP.isEmpty(root.listeners)) {
            delete map[id];
        }

        TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE ?
            TP.trace('Listener entry removed for ID: ' + handlerID,
                        TP.SIGNAL_LOG) : 0;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('$registerInterest',
function(anOrigin, aSignal, aHandler, isCapturing) {

    /**
     * @method $registerInterest
     * @summary Creates a signal map entry for the interest specified.
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
     */

    var orgid,
        map,
        signame,
        root,
        entry,
        id,
        handlerID,

        urnLocation,
        existingURN,
        urn;

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

    map = TP.sig.SignalMap.interests;
    id = orgid + '.' + signame;
    root = map[id];

    //  no root? no interests yet so we need to create a container
    if (TP.notValid(root)) {
        TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE ?
            TP.trace('Interest root not found.',
                        TP.SIGNAL_LOG) : 0;

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
        TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE ?
                TP.trace('Listener entry not found.',
                TP.SIGNAL_LOG) : 0;
    }

    //  if we find an entry we have two options, first if the entry "isn't
    //  really there" because it's in a remove state we can reactivate it.
    if (TP.isValid(entry)) {
        if (!TP.sys.shouldAllowDuplicateInterests()) {

            TP.ifWarn() && TP.$DEBUG && TP.$$VERBOSE ?
                TP.warn(
                    TP.join('Duplicate interest registration for origin: ',
                            orgid, ' signal: ',
                            signame, ' handler: ',
                            handlerID, ' ignored.'),
                    TP.SIGNAL_LOG) : 0;

            return;
        }

        if (entry.suspend === true) {
            TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE ?
                TP.trace('Listener entry currently flagged as suspended.',
                            TP.SIGNAL_LOG) : 0;

            delete entry.suspend;

            //  ensure we're looking at the same handler instance, not
            //  just the same ID by updating the registration
            TP.sys.registerObject(aHandler, handlerID, true, false);

            return;
        }

        if (entry.remove === true) {
            TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE ?
                TP.trace('Listener entry currently flagged as removed.',
                            TP.SIGNAL_LOG) : 0;

            delete entry.remove;

            //  ensure we're looking at the same handler instance, not
            //  just the same ID by updating the registration
            TP.sys.registerObject(aHandler, handlerID, true, false);

            return;
        }
    }

    TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE ?
        TP.trace('Creating listener entry.',
                    TP.SIGNAL_LOG) : 0;

    //  if we arrived here there must not have been an entry already
    entry = TP.constructOrphanObject();
    entry.target = orgid;
    entry.event = signame;

    if (isCapturing) {
        entry.phase = 'capture';
    }

    entry.handler = handlerID;

    //  If the handler ID isn't already a URI, then we create a TIBET URN out of
    //  it.
    if (!TP.isURIString(handlerID)) {

        //  Prepend the standard TIBET URN prefix onto the handler ID and check
        //  to see if there's already a URI registered under that location. Note
        //  that we have to do this check *before* the 'TP.uc()' call (as it
        //  will create an entry if one doesn't exist).
        urnLocation = TP.TIBET_URN_PREFIX + handlerID;
        existingURN = TP.core.URI.instances.containsKey(urnLocation);

        urn = TP.uc(urnLocation);

        //  If there was no existing URI, then that means we're creating this
        //  one just to hold the handler. Therefore, we mark it with a local
        //  attribute to keep a 'registration count' so that the
        //  '$removeInterest' call below will unregister it when that count
        //  reaches 0.
        if (!existingURN) {
            urn.defineAttribute('$regCount');
            urn.set('$regCount', 0, false);
        }

        //  If the urn owns a '$regCount' slot, then increment the registration
        //  count.
        if (TP.owns(urn, '$regCount')) {
            urn.set('$regCount', urn.get('$regCount') + 1);
        }

        //  Set the handler as our newly created URI's resource. Note here how
        //  we pass a request that tells the setResource to *not* signal
        //  change, since we're really just setting things up.
        urn.setResource(aHandler, TP.request('signalChange', false));
    }

    root.listeners.push(entry);

    TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE ?
        TP.trace(TP.join('Listener entry created for ID: ',
                            handlerID, ' with handler: ', aHandler),
                    TP.SIGNAL_LOG) : 0;

    return;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('$removeInterest',
function(anOrigin, aSignal, aHandler, isCapturing) {

    /**
     * @method $removeInterest
     * @summary Removes the signal map entry for the specific interest
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
     */

    var orgid,
        signame,

        map,
        id,
        root,

        handlerID,
        entry,

        handler,

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

    map = TP.sig.SignalMap.interests;
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
                    function(listener) {
                        return listener.phase === 'capture';
                    });

        } else if (TP.isFalse(isCapturing)) {
            list = root.listeners.select(
                    function(listener) {
                        return listener.phase !== 'capture';
                    });
        } else {
            list = root.listeners;
        }

        TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE ?
            TP.trace('Removing ' + list.length + ' listener entries.',
                        TP.SIGNAL_LOG) : 0;

        /* eslint-disable no-loop-func */
        for (i = 0; i < list.length; i++) {
            item = list.at(i);

            //  Flag for removal.
            item.remove === true;

            //  If we're supposed to remove entirely next step is to compact.
            if (!TP.sys.shouldIgnoreViaFlag()) {
                root.listeners = list.select(
                                    function(listener) {
                                        return listener.remove !== true;
                                    });
            }
        }
        /* eslint-enable no-loop-func */
    } else {
        handlerID = TP.gid(aHandler);

        entry = root.listeners.detect(
                function(listener) {
                    return listener.handler === handlerID;
                });

        if (TP.isValid(entry)) {
            entry.remove = true;

            if (!TP.sys.shouldIgnoreViaFlag()) {
                list = root.listeners;
                root.listeners = list.select(
                                    function(listener) {
                                        return listener.remove !== true;
                                    });
            }
        }

        //  If the handle points to a URI that was created just for this
        //  handler, then remove it from the common URI registry. See the
        //  '$registerInterest' call above for more on how & why these URIs get
        //  created.

        if (!TP.isURIString(handlerID)) {
            handlerID = TP.TIBET_URN_PREFIX + handlerID;
        }

        handler = TP.uc(handlerID);

        //  If the handler is a TIBET URN, then it may have a registration count
        //  local attribute (see the '$registerInterest call above).
        if (TP.isKindOf(handler, TP.core.TIBETURN) &&
            TP.owns(handler, '$regCount')) {

            //  Decrement the registration count
            handler.set('$regCount', handler.get('$regCount') - 1);

            //  If the registration count is 0, remove the URN from
            //  TP.core.URI's instance dictionary.
            if (handler.get('$regCount') === 0) {
                TP.core.URI.removeInstance(handler);
            }
        }
    }

    if (TP.isEmpty(root.listeners)) {
        delete map[id];
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.Type.defineMethod('getListeners',
function(anOrigin, aSignal, captureState) {

    /**
     * @method getListeners
     * @summary Returns all listener entries found for the origin/signal name
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

    map = TP.sig.SignalMap.interests;
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
        if (item.suspend === true || item.remove === true) {
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

TP.sig.SignalMap.Type.defineMethod('notifyControllers',
function(aSignal, handlerFlags) {

    /**
     * @method notifyControllers
     * @summary Notifies any controllers in the controller chain managed by the
     *     current application instance. This method is the link between the
     *     standard observe/ignore signal notification process and the
     *     larger-scale application responder-chain notification sequence.
     * @param {TP.sig.Signal} aSignal The signal passed to handlers.
     * @param {Object} [handlerFlags] A method parameter set.
     *     Properties can be any combination of the following:
     *          {String} [startSignal] The signal name to start considering
     *                  handlers if the supplied signal has more than one signal
     *                  name. This parameter is optional and, if not supplied,
     *                  all of the signal names as computed from the supplied
     *                  signal will be used.
     *          {Boolean} [dontTraverseSpoofs=false] True will mean that
     *                  traversing up the supertype chain will be disabled for
     *                  'spoofed' signals (i.e. signals where the signal name
     *                  doesn't match the type name).
     *          {Boolean} [dontTraverseHierarchy=false] True will turn off any
     *                  form of signal hierarchy traversal.
     *          {String} [skipName] A string used to mask off certain handler
     *                  names such as high-level default handlers.
     *          {String} [phase] ('*', TP.CAPTURING, TP.AT_TARGET,
     *                  TP.BUBBLING). The default is whatever phase the supplied
     *                  signal is in.
     */

    var app,
        controllers,
        len,
        i,
        ignore,
        type,
        controller,
        handler,
        oldHandler;

    if (!TP.sys.hasLoaded()) {
        return;
    }

    //  Verify this signal type should be propagated through controller chain.
    //  Most are but some like processing/workflow signals are intended for a
    //  local audience and are likely to be converted to promises over time so
    //  we don't want to create dependencies on them being propogated.
    if (aSignal.isSpoofed()) {
        type = TP.sys.getTypeByName(aSignal.getSignalName());
        if (TP.isType(type)) {
            if (!type.isControllerSignal() || type.isControllerRoot()) {
                ignore = true;
            }
        }
    } else if (!aSignal.isControllerSignal() || aSignal.isControllerRoot()) {
        ignore = true;
    }

    if (ignore) {
        /*
        TP.debug('notifyControllers ignoring ' + aSignal.getSignalName() +
            ' sig? ' + aSignal.isControllerSignal() + ' root? ' +
            aSignal.isControllerRoot());
        */
        return;
    }

    app = TP.sys.getApplication();
    controllers = app.getControllers(aSignal);

    len = controllers.getSize();
    for (i = 0; i < len; i++) {
        if (aSignal.shouldStop() || aSignal.shouldStopImmediately()) {
            return;
        }

        //  Find/fire best handler for each controller.
        controller = controllers.at(i);
        handler = controller.getBestHandler(aSignal, handlerFlags);

        if (TP.isCallable(handler)) {
            if (!aSignal.hasNotified(handler, controller)) {
                try {
                    oldHandler = aSignal.$get('currentHandler');
                    aSignal.$set('currentHandler', handler, false);
                    handler.call(controller, aSignal);
                } catch (e) {
                    //  TODO: handler exception
                    //  TODO: Add a callback check at the handler/owner level?
                    TP.error('HandlerException: ' + e.message + ' in: ' +
                        TP.id(TP.owner(handler)) + ':' + TP.name(handler));
                } finally {
                    //  set up so we won't tell it again unless it resets
                    aSignal.trackHandler(handler, controller);
                    aSignal.$set('currentHandler', oldHandler, false);
                }
            }
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.Type.defineMethod('notifyObservers',
function(anOrigin, aSignalName, aSignal, options) {

    /**
     * @method notifyObservers
     * @summary Notifies all handlers found for the origin/signal name pair
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
     * @param {TP.core.Hash} options Options including the following slots:
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
     * @param {Boolean} scanSupertypes True to force full inheritance checking.
     *     In other words, assume a handler observes 'StateInput' thinking
     *     they'll be told about all subtypes of 'StateInput'. That's not quite
     *     how it works without this flag tho. The handler will only be invoked
     *     if the receiver implements handleStateInput. If they implement a
     *     handleFluffyInput method it won't be called, even if the signal is a
     *     FluffyInput signal. Yeah, it's complicated. We have to identify
     *     handlers by checking the entire supertype list.
     */

    var opts,
        checkTarget,
        scanSupertypes,
        i,
        entry,
        items,
        check,
        capture,
        orgid,
        signame,
        signalNames,
        item,
        phase,
        oldHandler,
        handlerResult,
        handler,
        originalOrigin,
        hFunc,
        observer,
        xml_target,
        targetID;

    //  callers need to already have set up a signal instance
    if (TP.notValid(aSignal)) {
        return;
    }

    opts = TP.hc(options);

    //  should we respect stopPropagation calls?
    check = TP.ifInvalid(opts.at('checkPropagation'), true);

    checkTarget = TP.ifInvalid(opts.at('checkTarget'), false);
    scanSupertypes =
        opts.at('scanSupertypes') || aSignal.shouldScanSupertypes();

    entry = opts.at('aSigEntry');

    //  two variant here. if check and "standard shouldStop" are true then we
    //  stop OR if shouldStopImmediately is true, regarless of check state.
    if (check && aSignal.shouldStop() || aSignal.shouldStopImmediately()) {
        return;
    }

    //  don't let signals get passed with TP.ANY as an origin, but ensure we can
    //  put things back the way they were once we're finished
    originalOrigin = aSignal.getOrigin();
    if (originalOrigin === TP.ANY) {
        aSignal.setOrigin(null);
    }

    //  set our capture state flag so we can test as needed
    capture = opts.at('captureState');

    //  capture the current origin for interest lookup purposes
    //  orgid = (TP.notValid(anOrigin)) ? TP.ANY : TP.id(anOrigin);

    //  capture the signal use we're using for lookup purposes
    //  signame = (TP.notValid(aSignalName)) ? TP.ANY : aSignalName.getID();

    orgid = TP.sig.SignalMap.$computeOriginID(anOrigin);
    signame = TP.sig.SignalMap.$computeSignalName(aSignalName);

//  TODO: make this "official". but BEWARE!!! you can't log these to the DOM or
//  things go to hell in a hurry.
/*
if (!signame.match(/DOMMouse/)) {
top.console.log('notifyObservers: ' + ' origin: ' + orgid + ' signal: ' + signame +
        ' capturing: ' + capture);
}
*/

    if (TP.isValid(entry)) {

        //  Get a shallow copy of the listeners so any handler activity that
        //  affects the list won't affect our current iteration work.
        items = entry.listeners.slice(0);

    } else {

        if (scanSupertypes) {
            signalNames = aSignal.getSignalNames();
        } else {
            signalNames = TP.ac(signame);
        }

        items = TP.ac();

        signalNames.forEach(
                function(name) {

                    //  Don't include the root unless it was explicitly
                    //  provided.
                    /* eslint-disable no-extra-parens */
                    if (scanSupertypes && (name === 'TP.sig.Signal')) {
                        return;
                    }
                    /* eslint-enable no-extra-parens */

                    //  Note we don't bother with sorting out capture vs. bubble
                    //  here, we put the burden of that on the observe process
                    //  which manages order in the listener node list for a
                    //  particular interest. This optimizes for runtime dispatch
                    //  since observes can persist in XML, and across multiple
                    //  content display invocations, meaning they're called only
                    //  once in most cases
                    entry = TP.sig.SignalMap.interests[orgid + '.' + name];

                    if (TP.notValid(entry)) {

                        //  If the name didn't have a period, then it might be a
                        //  spoofed signal name, but the registration would've
                        //  been made using a 'full signal' name (i.e. prefixed
                        //  by 'TP.sig.').
                        if (!TP.regex.HAS_PERIOD.test(name)) {
                            entry = TP.sig.SignalMap.interests[
                                orgid + '.' + 'TP.sig.' + name];
                        }

                        if (TP.notValid(entry)) {
                            TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE ?
                                TP.trace(TP.join('Interest not found for: ',
                                                    orgid, '.', name),
                                            TP.SIGNAL_LOG) : 0;

                            aSignal.setOrigin(originalOrigin);

                            return;
                        }
                    }

                    //  If the entire block of interests is suspended then do
                    //  not notify
                    if (entry.suspend === true) {
                        TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE ?
                            TP.trace(TP.join('Interest for: ',
                                                orgid, '.', signame,
                                                ' is flagged as suspended.'),
                                        TP.SIGNAL_LOG) : 0;

                        aSignal.setOrigin(originalOrigin);

                        return;
                    }

                    //  Get a shallow copy of the listeners so any handler
                    //  activity that affects the list won't affect our current
                    //  iteration work.
                    items = items.concat(entry.listeners);
                });
    }

    //  try/finally for signal stack
    try {
        //  make sure the signal stack is up to date by doing a
        //  "push" of the new signal
        TP.$signal_stack.push(aSignal);

        targetID = aSignal.getResolvedTargetGlobalID();

        for (i = 0; i < items.length; i++) {
            //  two variant here. if check and "standard shouldStop" are true
            //  then we stop OR if shouldStopImmediately is true, regardless of
            //  check state since shouldStopImmediately implied we check after
            //  each and every handler invocation regardless.
            if (check && aSignal.shouldStop() ||
                    aSignal.shouldStopImmediately()) {
                aSignal.setOrigin(originalOrigin);
                return;
            }

            item = items[i];

            //  if the specific handler is suspended or flagged for removal then
            //  just skip it
            if (item.suspend === true || item.remove === true) {
                TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE ?
                        TP.trace('Listener ' + i +
                                 ' is suspended or removed.',
                                 TP.SIGNAL_LOG) : 0;

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

            //  if we're using strict XMLEvent or DOM firing then we have to
            //  check to see if the signal's target matches the specified
            //  dom_target if there is one
            if (checkTarget) {
                xml_target = item.xml_target;
                observer = item.observer;

                if (TP.notEmpty(xml_target) && xml_target !== TP.ANY) {
                    if (xml_target !== targetID &&
                        xml_target !== observer) {
                        TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE ?
                                TP.trace(TP.join('DOM target check ',
                                ' wanted: ', xml_target,
                                ' found: ', targetID,
                                '. Skipping listener: ',
                                TP.str(item)),
                                TP.SIGNAL_LOG) : 0;

                        continue;
                    }
                }
            }

            //  acquire a handle to an actual handler instance by asking TIBET
            //  for whatever object is found at that ID. Note that this allows
            //  handlers to be swapped out from under observations without
            //  affecting the signal map itself.

            //  a side effect of having objects registered under 'tibet:urn's is
            //  that the handler can't be the TIBETURN URI itself. Therefore, if
            //  the item's handler starts with 'tibet:urn', then go ahead and
            //  use the URI object as the handler object.
            if (TP.regex.TIBET_URN.test(item.handler)) {
                handler = TP.uc(item.handler);
            } else {
                //  Otherwise, just get the handler by it's system ID
                handler = TP.bySystemId(item.handler);
            }

            if (TP.notValid(handler)) {
                TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE ?
                        TP.trace('Could not find handler with ID: ' +
                        item.handler,
                        TP.SIGNAL_LOG) : 0;
                continue;
            }

            //  If we're being asked to check the target, then we're being
            //  invoked from a policy that expects DOM semantics. We set the
            //  phase explicitly in this case, since the AT_TARGET phase is
            //  meaningless *when computing handler names*. I.e. the DOM has the
            //  notion of AT_TARGET, but not when computing handlers. Handlers
            //  are either capturing or bubbling.
            if (checkTarget) {
                //  It's easy to determine this based on the 'captureState'
                //  flag (which is what capture was set to).
                if (capture) {
                    phase = TP.CAPTURING;
                } else {
                    phase = TP.BUBBLING;
                }
            } else {
                //  Otherwise, set the phase to null and let the 'handle' call
                //  determine which handler to use based on the phase of the
                //  signal itself.
                phase = null;
            }

            if (TP.sys.shouldThrowHandlers()) {

                //  check for multiple notification bypass, or even a
                //  signal-configured ignore hook prior to firing
                if (!aSignal.hasNotified(handler, handler)) {

                    //  put a reference to the listener node itself where the
                    //  handler(s) can get to it when needed
                    aSignal.set('listener', item);

                    //  run the handler, making sure we can catch any exceptions
                    //  that are signaled

                    try {
                        //  NOTE that if we're observing TP.ANY signals, we
                        //  don't supply a 'starting signal name' and we skip
                        //  spoofs and traversing the signal hierarchy, as that
                        //  doesn't make sense.

                        oldHandler = aSignal.$get('currentHandler');
                        aSignal.$set('currentHandler', handler, false);

                        if (signame === TP.ANY) {
                            handlerResult = handler.handle(
                                aSignal,
                                {
                                    startSignal: TP.ANY,
                                    dontTraverseHierarchy: true,
                                    dontTraverseSpoofs: true,
                                    phase: phase
                                });
                        } else {
                            handlerResult = handler.handle(
                                aSignal,
                                {
                                    startSignal: signame,
                                    phase: phase
                                });
                        }
                    } finally {
                        //  set up so we won't tell it again unless it resets
                        if (handlerResult !== TP.NOT_FOUND) {
                            aSignal.trackHandler(handler, handler);
                        }
                        aSignal.$set('currentHandler', oldHandler, false);
                    }
                }
            } else {
                //  check for multiple notification bypass, or even a
                //  signal-configured skip hook prior to firing
                if (!aSignal.hasNotified(handler, handler)) {

                    try {

                        //  put a reference to the listener node itself where
                        //  the handler(s) can get to it when needed
                        aSignal.set('listener', item);

                        //  run the handler, making sure we can catch any
                        //  exceptions that are signaled

                        //  NOTE that if we're observing TP.ANY signals, we
                        //  don't supply a 'starting signal name' and we skip
                        //  spoofs and traversing the signal hierarchy, as that
                        //  doesn't make sense.

                        oldHandler = aSignal.$get('currentHandler');
                        aSignal.$set('currentHandler', handler, false);

                        if (signame === TP.ANY) {
                            handlerResult = handler.handle(
                                aSignal,
                                {
                                    startSignal: TP.ANY,
                                    dontTraverseHierarchy: true,
                                    dontTraverseSpoofs: true,
                                    phase: phase
                                });
                        } else {
                            handlerResult = handler.handle(
                                aSignal,
                                {
                                    startSignal: signame,
                                    phase: phase
                                });
                        }

                        //  TODO: add check here regarding removal of the
                        //  handler? this would be an alternative to cleanup
                        //  policies, simply setting state or adding functions
                        //  to the handlers themselves which return true when
                        //  the handler should be removed.

                        //  if so we can simply suspend the item so it is
                        //  skipped rather than removing the node
                    } catch (e) {

                        //  TODO: handler exception
                        //  TODO: Add a callback check at the handler/owner
                        //  level?

                        try {

                            //  see if we can get the actual function in
                            //  question so we have better debugging capability
                            hFunc = handler.getBestHandler(aSignal);

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
                                        TP.SIGNAL_LOG) : 0;
                            } else {
                                TP.ifError() ?
                                        TP.error(
                                        TP.ec(e,
                                        TP.join('Error in: ', orgid,
                                                '.', signame,
                                                ' responder: ',
                                                handler.getID())),
                                        TP.SIGNAL_LOG) : 0;
                            }
                        } catch (e2) {
                            TP.ifError() ?
                                    TP.error(
                                    TP.ec(e2,
                                    TP.join('Error getting handler for: ', orgid,
                                            '.', signame)),
                                    TP.SIGNAL_LOG) : 0;
                        }

                        //  register the handler if TIBET is configured for
                        //  that so that the suspended function can be acquired
                        //  by the developer for debugging
                        if (TP.sys.shouldRegisterLoggers()) {
                            TP.sys.registerObject(handler, null, true, false);
                        }
                    } finally {
                        //  set up so we won't tell it again unless it resets
                        if (handlerResult !== TP.NOT_FOUND) {
                            aSignal.trackHandler(handler, handler);
                        }
                        aSignal.$set('currentHandler', oldHandler, false);
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
                TP.SIGNAL_LOG) : 0;

        //  If we're throwing handlers, then rethrow the Error object.
        if (TP.sys.shouldThrowHandlers()) {
            throw e;
        }
    } finally {
        //  "pop" the signal stack, throwing away the last signal and making the
        //  current signal the one at the end of the stack (or null)
        TP.$signal_stack.pop();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('FIRE_ONE',
function(anOrigin, aSignal, aPayload, aType) {

    /**
     * @method FIRE_ONE
     * @summary Fires a single signal from a single origin.
     * @param {Object} anOrigin The originator of the signal.
     * @param {String|TP.sig.Signal} aSignal The signal to fire.
     * @param {Object} aPayload Optional argument object.
     * @param {String|TP.sig.Signal} aType A default type to use when the signal
     *     type itself isn't found and a new signal subtype must be created.
     *     Defaults to TP.sig.Signal.
     * @returns {TP.sig.Signal} The signal.
     */

    var sig,
        origin,
        orgid,
        signame;

    //  Ensure a valid signal instance, defaulting to TP.sig.Signal instance.
    sig = TP.sig.SignalMap.$getSignalInstance(
        TP.ifInvalid(aSignal, TP.sig.Signal), aPayload, aType);

    if (!TP.isKindOf(sig, TP.sig.Signal)) {
        return;
    }

    //  Ensure a valid origin, defaulting to TP.ANY when not provided.
    origin = TP.ifInvalid(anOrigin, TP.ANY);
    orgid = TP.id(origin);

    //  Configure signal instance.
    sig.setOrigin(origin);
    signame = sig.getSignalName();

    TP.sig.SignalMap.notifyObservers(orgid, signame, sig,
        TP.hc('checkPropagation', true));

    //  Make sure we should continue with controller stack notifications.
    if (sig.shouldStop() || sig.shouldStopImmediately()) {
        sig.isRecyclable(true);
        return sig;
    }

    //  don't repeat if the signal name was already TP.ANY
    if (signame !== TP.ANY) {
        TP.sig.SignalMap.notifyObservers(orgid, null, sig,
            TP.hc('checkPropagation', true));

        //  Make sure we should continue with controller stack notifications.
        if (sig.shouldStop() || sig.shouldStopImmediately()) {
            sig.isRecyclable(true);
            return sig;
        }
    }

    //  don't repeat if the origin name was already TP.ANY
    if (orgid !== TP.ANY) {
        TP.sig.SignalMap.notifyObservers(null, signame, sig,
            TP.hc('checkPropagation', true));

        //  Make sure we should continue with controller stack notifications.
        if (sig.shouldStop() || sig.shouldStopImmediately()) {
            sig.isRecyclable(true);
            return sig;
        }
    }

    //  Final step is to notify controllers which completes the responder chain.
    TP.sig.SignalMap.notifyControllers(sig);

    //  once the signal has been fired we can clear it for reuse
    sig.isRecyclable(true);

    return sig;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('OBSERVER_FIRING',
function(anOrigin, signalSet, aPayload, aType) {

    /**
     * @method OBSERVER_FIRING
     * @summary Fires one or more signals from one or more origins.
     * @param {Object} anOrigin The originator or originators of the signal(s).
     * @param {String|TP.sig.Signal} signalSet The signal(s) to fire.
     * @param {Object} aPayload Optional argument object for signal instance.
     * @param {String|TP.sig.Signal} [aType=TP.sig.Signal] A default type to use
     *     when signal type isn't found and a new signal subtype must be created.
     * @returns {TP.sig.Signal} The returned instance from the signal sequence.
     */

    var policy,
        origin,
        i,
        j,
        res;

    policy = TP.sig.SignalMap.FIRE_ONE;

    //  deal with possibility that origin IS an array
    /* eslint-disable no-extra-parens */
    if ((TP.isArray(anOrigin) && !anOrigin.isOriginSet()) ||
        (!TP.isArray(anOrigin))) {
    /* eslint-enable no-extra-parens */

        //  only one origin
        origin = anOrigin;

        if (TP.isArray(signalSet)) {
            //  array of signals but only the array as an origin
            for (j = 0; j < signalSet.getSize(); j++) {
                res = policy(
                    origin, signalSet.at(j), aPayload, aType);
            }
        } else {
            //  one signal, one origin
            res = policy(origin, signalSet, aPayload, aType);
        }
    } else if (TP.isArray(anOrigin)) {
        //  otherwise, its an Array, but its an Array of 'origin sets'.
        if (TP.isArray(signalSet)) {
            //  array of origins, array of signals
            for (i = 0; i < anOrigin.getSize(); i++) {
                origin = anOrigin.at(i);

                for (j = 0; j < signalSet.getSize(); j++) {
                    res = policy(
                        origin, signalSet.at(j), aPayload, aType);
                }
            }
        } else {
            //  array of origins, one signal
            for (i = 0; i < anOrigin.getSize(); i++) {
                origin = anOrigin.at(i);
                res = policy(origin, signalSet, aPayload, aType);
            }
        }
    }

    return res;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('DOM_FIRING',
function(originSet, aSignal, aPayload, aType) {

    /**
     * @method DOM_FIRING
     * @summary Fires a single signal across a series of origins which should be
     *     provided in DOM containment order. This policy implements DOM Level2
     *     signaling without relying on addEventListener for the elements. All
     *     capturing, target, and bubbling phase processes are fully supported.
     *     NOTE that TIBET supports an extension via the on: namespace which
     *     lets DOM signals use alternative signal names if on:{event} is found
     *     at an element as the DOM is traversed.
     * @param {Array|Object} originSet The set of origins for the signal. The
     *     list should be provided from the document down to the target element.
     *     If a single origin is provided
     * @param {String|TP.sig.Signal} aSignal The signal to fire.
     * @param {Object} aPayload Optional argument object for the signal instance.
     * @param {String|TP.sig.Signal} aType A default type to use when the signal
     *     type itself isn't found and a new signal subtype must be created.
     *     Defaults to TP.sig.Signal.
     * @returns {TP.sig.Signal} The signal.
     */

    var map,
        sig,
        signame,
        orgid,
        target,
        i,
        entry,
        evt,
        eventType,
        onstarEvtName,
        onstarSigFullName,
        onstarSigShortName,
        onAttrDetector,
        origins,
        origin,
        originType,
        originArray,
        len,
        originGlobalID,
        sigdata;

    //  in the DOM model we can only fire if we have a signal and origin
    if (TP.notValid(aSignal) || TP.notValid(originSet)) {
        return TP.sig.SignalMap.raise('TP.sig.InvalidDOMSignal');
    }

    //  DOMUISignal types can give us their event (and that's what is typically
    //  fired via DOM_FIRING). We leverage the event to support on: remapping.
    if (TP.canInvoke(aSignal, 'getEvent')) {
        evt = aSignal.getEvent();

        if (TP.isEvent(evt)) {

            //  This will be something like 'click', 'change', etc.
            eventType = aSignal.getEventType();

            //  Make sure the name exists as a key in the native event signal
            //  map.
            if (TP.NON_OBSERVED_ON_ATTRS.hasKey(eventType)) {

                //  Note how we capture both the low-level event name and the
                //  higher level signal name here. The author could've used
                //  either one.
                onstarEvtName = eventType;
                onstarSigFullName = TP.NON_OBSERVED_ON_ATTRS.at(eventType);
                onstarSigShortName = TP.contractSignalName(onstarSigFullName);

                //  Note here how the detector searches for attributes in the
                //  TP.w3.Xmlns.ON namespace, in case the user hasn't used the
                //  'on:' prefix. This detector function is used below.
                onAttrDetector = function(attrNode) {

                    var localName;

                    localName = TP.attributeGetLocalName(attrNode);

                    /* eslint-disable no-extra-parens */
                    return ((localName === onstarEvtName ||
                                localName === onstarSigFullName ||
                                localName === onstarSigShortName) &&
                            attrNode.namespaceURI === TP.w3.Xmlns.ON);
                    /* eslint-enable no-extra-parens */
                };
            }
        }
    }

    map = TP.sig.SignalMap.interests;

    //  get a valid signal instance configured
    sig = TP.sig.SignalMap.$getSignalInstance(aSignal, aPayload, aType);
    if (!TP.isKindOf(sig, TP.sig.Signal)) {
        return;
    }

    //  one or more origins are required. warn if we don't get an array.
    if (!TP.isArray(originSet)) {
        //  TODO: this causes sherpa logging to recurse endlessly due to furing
        //  DOMContentLoaded without an origin array every time it appends.
        // TP.ifWarn() ? TP.warn('DOM firing without origin array: ' +
            // TP.ifEmpty(sig.getSignalName(), TP.ANY)) : 0;
        origins = TP.ac(originSet);
    } else {
        origins = originSet;
    }

    //  set up the signal name, using TP.ANY if we can't get one
    if (TP.isEmpty(signame = sig.getSignalName())) {
        //  TODO: this can potentially cause sherpa to recurse. commented out
        //  for now. see comments in earlier block.
        // TP.ifWarn() ? TP.warn('DOM firing without signal name from: ' +
        //    origins.join(', ')) : 0;
        signame = TP.ANY;
    }

    //  without a target we've got trouble in DOM firing since the target
    //  defines when we stop capturing and start bubbling...
    target = sig.getResolvedTargetGlobalID();

    //  as we loop downward we'll keep track of orgids that have event
    //  listeners registered. this keeps us from doing the lookups twice
    originArray = TP.ac();


    //  ---
    //  Process CAPTURING
    //  ---

    //  set the phase to capturing to get started
    sig.setPhase(TP.CAPTURING);

    //  loop down through the list until we reach the target, performing the
    //  lookups and notifying any capturing handlers as we descend
    len = origins.getSize();
    for (i = 0; i < len; i++) {
        //  we enter this loop in capturing phase, so we want to do at least
        //  one pass before making any changes to phase etc.

        origin = origins.at(i);

        //  check each one as we pass for any on: remapping. if found we need to
        //  ensure that element is in our origin list for the bubbling phase.
        if (TP.isCallable(onAttrDetector) && TP.isElement(origin)) {
            if (TP.elementGetAttributeNodes(origin).detect(onAttrDetector)) {
                //  Found an on: mapping for this origin...
                originArray.push(origin);
            }
        }

        //  global id

        //  work with ID's for map entries (GC issues)
        orgid = TP.gid(origin);

        //  be sure to update the signal as we rotate orgids
        sig.setOrigin(orgid);

        //  if there's an entry for this origin/signal pair then we'll check
        //  it again when we do the bubbling pass...
        if (TP.isValid(entry = map[orgid + '.' + signame])) {

            if (originArray.last() !== origin) {
                originArray.push(origin);
            }

            //  start with most specific, which is origin and signal
            //  listeners. this also happens to be all the DOM standard
            //  really supports, they don't have a way to specify any signal
            //  type from an origin
            TP.sig.SignalMap.notifyObservers(orgid, signame, sig,
                TP.hc('checkPropagation', false,
                        'captureState', true,
                        'aSigEntry', entry,
                        'checkTarget', true));
        }

        //  as long as we didn't default the signal to "ANY" we'll check
        //  that as well
        if (signame !== TP.ANY) {
            //  if there's an entry for this origin and TP.ANY then we'll
            //  check it again when we do the bubbling pass...
            if (TP.isValid(entry = map[orgid + '.' + TP.ANY])) {

                if (originArray.last() !== origin) {
                    originArray.push(origin);
                }

                //  while we're dropping down we'll check this origin for
                //  any capturing handlers that are blanket signal handlers
                TP.sig.SignalMap.notifyObservers(orgid, null, sig,
                    TP.hc('checkPropagation', false,
                            'captureState', true,
                            'aSigEntry', entry,
                            'checkTarget', true));
            }
        }

        //  Capture the global origin id before resetting it to the local id.
        //  We'll use it later for comparison.
        originGlobalID = orgid;

        //  local id

        //  work with ID's for map entries (GC issues)
        orgid = TP.lid(origin);

        //  be sure to update the signal as we rotate orgids
        sig.setOrigin(orgid);

        //  if there's an entry for this origin/signal pair then we'll check
        //  it again when we do the bubbling pass...
        if (TP.isValid(entry = map[orgid + '.' + signame])) {

            if (originArray.last() !== origin) {
                originArray.push(origin);
            }

            //  start with most specific, which is origin and signal
            //  listeners. this also happens to be all the DOM standard
            //  really supports, they don't have a way to specify any signal
            //  type from an origin
            TP.sig.SignalMap.notifyObservers(orgid, signame, sig,
                TP.hc('checkPropagation', false,
                        'captureState', true,
                        'aSigEntry', entry,
                        'checkTarget', true));
        }

        //  as long as we didn't default the signal to "ANY" we'll check
        //  that as well
        if (signame !== TP.ANY) {
            //  if there's an entry for this origin and TP.ANY then we'll
            //  check it again when we do the bubbling pass...
            if (TP.isValid(entry = map[orgid + '.' + TP.ANY])) {

                if (originArray.last() !== origin) {
                    originArray.push(origin);
                }

                //  while we're dropping down we'll check this origin for
                //  any capturing handlers that are blanket signal handlers
                TP.sig.SignalMap.notifyObservers(orgid, null, sig,
                    TP.hc('checkPropagation', false,
                            'captureState', true,
                            'aSigEntry', entry,
                            'checkTarget', true));
            }
        }

        //  propagation

        //  if any of the handlers at this origin "level" said to stop then
        //  we stop now before traversing to a new level in the DOM
        if (sig.shouldStop() || sig.shouldStopImmediately()) {

            //  reset the signal's phase to the original setting - null
            sig.setPhase(null);

            //  reset the signal's origin so we don't confuse things in the
            //  final notification process by making it the original target ID
            sig.setOrigin(target);

            return sig;
        }

        //  are we on the way down or up? if we've reached the target we'll
        //  want to stop once we do a final notification of any capturing
        //  handlers at the target level
        if (originGlobalID === target) {
            sig.setPhase(TP.AT_TARGET);
            break;
        }
    }


    //  ---
    //  Process AT_TARGET / BUBBLING
    //  ---


    //  flip the origin array around so we work "bottom up" to bubble
    originArray.reverse();

    //  now loop back through the bubbling list which was populated as we
    //  searched down toward the target. in most cases this list is a lot
    //  shorter than the downward list since most origins don't have
    //  registrations
    len = originArray.getSize();
    for (i = 0; i < len; i++) {

        origin = originArray.at(i);

        if (TP.isElement(origin)) {
            //  Grab the TIBET wrapper type for the element and query it to see
            //  if the current element is considered to be 'opaque' for the
            //  event at it's level as it bubbles.
            if (TP.isType(originType =
                            TP.core.ElementNode.getConcreteType(origin))) {
                if (originType.isOpaqueBubblerFor(origin, sig)) {
                    //  If the type has returned true here, that means that
                    //  we're to stop processing this signal after this origin
                    //  is processed. To do so is quite simple. Truncate the
                    //  originArray that we built during the capturing
                    //  processing (making sure to set the 'len' local variable
                    //  so that the loop will exit).
                    originArray = originArray.slice(0, i + 1);
                    len = i + 1;
                }
            }
        }

        //  If a detector function was defined and our origin is an Element,
        //  then we are eligible for 'on:' remapping.
        if (TP.isCallable(onAttrDetector) && TP.isElement(origin)) {

            if (TP.elementGetAttributeNodes(origin).detect(onAttrDetector)) {
                //  Found an on: mapping for this origin...

                //  NB: We can use 'on:' here even if the user didn't, since the
                //  'true' in the 3rd parameter will cause a search of the
                //  TP.w3.Xmlns.ON namespace if an attribute prefixed by 'on:'
                //  isn't found.

                //  First, try the event name.
                if (TP.elementHasAttribute(
                            origin, 'on:' + onstarEvtName, true)) {
                    sigdata = TP.elementGetAttribute(
                                origin,
                                'on:' + onstarEvtName,
                                true);
                } else if (TP.elementHasAttribute(
                            origin, 'on:' + onstarSigFullName, true)) {

                    //  Next, try the 'full signal name' (which we would have
                    //  gotten from the TP.NON_OBSERVED_ON_ATTRS above).
                    sigdata = TP.elementGetAttribute(
                                origin,
                                'on:' + onstarSigFullName,
                                true);
                } else {
                    //  Last, try the 'short signal name'
                    sigdata = TP.elementGetAttribute(
                                origin,
                                'on:' + onstarSigShortName,
                                true);
                }

                //  If we were able to successfully extract signal data, then
                //  queue up a signal that will fire based on this data.
                if (TP.notEmpty(sigdata)) {
                    TP.queueSignalFromData(
                                sigdata,
                                origin,
                                sig,
                                null,   //  payload
                                null,   //  policy
                                TP.sig.ResponderSignal);
                }

                continue;
            }
        }

        //  global id

        //  always work with ID's for map entries (GC issues)
        orgid = TP.gid(origin);

        //  be sure to update the signal as we rotate orgids
        sig.setOrigin(orgid);

        //  continue with most specific, which is origin and signal pair.
        TP.sig.SignalMap.notifyObservers(orgid, signame, sig,
                    TP.hc('checkPropagation', false,
                            'captureState', false,
                            'checkTarget', true));

        //  notifyObservers will default null to TP.ANY so if we just did
        //  that one don't do it again
        if (signame !== TP.ANY) {
            //  next in bubble is for the origin itself, but any signal...
            TP.sig.SignalMap.notifyObservers(orgid, null, sig,
                    TP.hc('checkPropagation', false,
                            'captureState', false,
                            'checkTarget', true));
        }

        //  local id

        //  always work with ID's for map entries (GC issues)
        orgid = TP.lid(origin);

        //  be sure to update the signal as we rotate orgids
        sig.setOrigin(orgid);

        //  continue with most specific, which is origin and signal pair.
        TP.sig.SignalMap.notifyObservers(orgid, signame, sig,
                    TP.hc('checkPropagation', false,
                            'captureState', false,
                            'checkTarget', true));

        //  notifyObservers will default null to TP.ANY so if we just did
        //  that one don't do it again
        if (signame !== TP.ANY) {
            //  next in bubble is for the origin itself, but any signal...
            TP.sig.SignalMap.notifyObservers(orgid, null, sig,
                    TP.hc('checkPropagation', false,
                            'captureState', false,
                            'checkTarget', true));
        }

        //  propagation

        //  if any of the handlers at this origin "level" said to stop then
        //  we stop now before traversing to a new level in the DOM
        if (sig.shouldStop() || sig.shouldStopImmediately()) {

            //  reset the signal's phase to the original setting - null
            sig.setPhase(null);

            //  reset the signal's origin so we don't confuse things in the
            //  final notification process by making it the original target ID
            sig.setOrigin(target);

            return sig;
        }

        //  once we've run through the *target* (i.e. AT_TARGET) for bubbling
        //  handlers we'll set this to TP.BUBBLING for the rest of the
        //  iterations. Note that since the regular DOM has no notion of
        //  separate AT_TARGET and BUBBLING handlers for the target itself,
        //  we've really just run a bubbling handler, but with the phase set to
        //  AT_TARGET. Now that that's done, we can move on to the true bubbling
        //  phase, starting with the next origin in the list.
        if (sig.getPhase() === TP.AT_TARGET) {
            //  if the signal bubbles then we continue, otherwise we'll stop
            //  here
            if (!sig.isBubbling()) {
                break;
            }

            sig.setPhase(TP.BUBBLING);
        }
    }

    //  reset the signal's phase to the original setting - null
    sig.setPhase(null);

    //  reset the signal's origin so we don't confuse things in the final
    //  notification process by making it the original target ID
    sig.setOrigin(target);

    //  last but not least is the check for observers of the signal from any
    //  origin, but note that we only do this notification check once (since
    //  the signal name isn't changing during the DOM traversal process) and
    //  that we notify capturers, check for stopPropagation, then bubble
    TP.sig.SignalMap.notifyObservers(null, signame, sig,
                    TP.hc('checkPropagation', false,
                            'captureState', true,
                            'checkTarget', true));

    if (sig.shouldStop() || sig.shouldStopImmediately()) {
        return sig;
    }

    TP.sig.SignalMap.notifyObservers(null, signame, sig,
                    TP.hc('checkPropagation', false,
                            'captureState', false,
                            'checkTarget', true));

    return sig;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('RESPONDER_FIRING',
function(anOrigin, aSignal, aPayload, aType) {

    /**
     * @method RESPONDER_FIRING
     * @summary Fires signals across a series of responders. Responder chain
     *     computation is based on the DOM but is sparse, including only those
     *     elements with either a tibet:ctrl or tibet:tag (or both). Unlike
     *     DOM_FIRING the RESPONDER_FIRING policy also includes the application
     *     controller stack in the capture and bubble phase processing. As a
     *     result RESPONDER_FIRING is a general purpose policy that can handle
     *     application widgets and their controllers very effectively.
     * @param {Object} anOrigin The originator of the signal.
     * @param {String|TP.sig.Signal} aSignal The signal to fire.
     * @param {Object} aPayload Optional argument object.
     * @param {String|TP.sig.Signal} aType A default type to use when the signal
     *     type itself isn't found and a new signal subtype must be created.
     *     Defaults to TP.sig.Signal.
     * @returns {TP.sig.Signal} The signal.
     */

    var sig,
        target,
        origin,
        responders,
        i,
        len,
        responder,
        shouldContinue;

    if (TP.notValid(aSignal)) {
        return TP.sig.SignalMap.raise('TP.sig.InvalidSignal');
    }

    //  Must be able to create a signal instance or no point in continuing.
    sig = TP.sig.SignalMap.$getSignalInstance(aSignal, aPayload, aType);
    if (!TP.isKindOf(sig, TP.sig.Signal)) {
        return;
    }

    //  Update any newly created signal to have the proper origin.
    if (TP.notValid(sig.getOrigin())) {
        sig.setOrigin(anOrigin);
    }

    //  Capture initial target and origin data. We use these to ensure we
    //  message controllers properly during both capturing and bubbling.
    target = sig.getTarget();
    origin = sig.getOrigin();

    //  ---
    //  Capturing phase...controllers
    //  ---

    //  set the phase to capturing to get started
    sig.setPhase(TP.CAPTURING);

    TP.sig.SignalMap.notifyControllers(sig);

    //  After processing make sure we should continue with the next phase.
    if (sig.shouldStop() || sig.shouldStopImmediately()) {
        return;
    }

    //  ---
    //  Capturing phase...responders
    //  ---

    //  If the signal has a target and that's a target node then we can do a
    //  responder-chain computation.
    if (TP.isNode(target)) {

        responders = TP.nodeGetResponderChain(target, sig);

        if (TP.notEmpty(responders)) {

            //  Initial array comes in target-to-parent order which is inverted
            //  from what we want for capturing phase so we reverse for this
            //  step.
            responders.reverse();

            len = responders.getSize();
            for (i = 0; i < len; i++) {
                responder = responders.at(i);

                //  Each responder is an element. We want to notify any
                //  tibet:ctrl and tibet:tag found on the element.
                shouldContinue = TP.sig.SignalMap.$notifyResponders(
                                                            responder, sig);

                //  Always check whether we should continue. Any form of stop
                //  propagation setting will cause responder signals to stop.
                if (!shouldContinue ||
                    sig.shouldStop() ||
                    sig.shouldStopImmediately()) {
                    return sig;
                }
            }
        }
    }

    //  ---
    //  At-target phase...responders
    //  ---

    sig.setPhase(TP.AT_TARGET);

    //  NOTE that we only do this if the target is a responder element...
    //  otherwise we don't really have a valid 'at target' step.
    if (TP.isValid(target) &&
        TP.nodeGetResponderElement(target, sig) === target) {

        //  tibet:ctrl and tibet:tag found on the element.
        shouldContinue = TP.sig.SignalMap.$notifyResponders(target, sig);

        //  if any of the handlers at this origin "level" said to stop
        //  then we stop now before executing the bubbling handlers.
        if (!shouldContinue ||
            sig.shouldStop() ||
            sig.shouldStopImmediately()) {
            return sig;
        }
    }

    //  ---
    //  Bubbling phase...responders
    //  ---

    //  we're bubbling... we're bubbling...
    sig.setPhase(TP.BUBBLING);

    if (TP.notEmpty(responders)) {

        //  convert back to target-to-ancestor ordering for bubbling phase.
        responders.reverse();

        //  if the signal bubbles then we continue, otherwise we'll stop
        if (!sig.isBubbling()) {
            return sig;
        }

        len = responders.getSize();
        for (i = 0; i < len; i++) {
            responder = responders.at(i);

            //  Each responder is an element. We want to notify any tibet:ctrl
            //  and tibet:tag found on the element.
            shouldContinue = TP.sig.SignalMap.$notifyResponders(responder, sig);

            //  Always check whether we should continue. Any form of stop
            //  propagation setting will cause responder signals to stop.
            if (!shouldContinue ||
                sig.shouldStop() ||
                sig.shouldStopImmediately()) {
                return sig;
            }
        }
    }

    //  ---
    //  Bubbling phase...controllers
    //  ---

    //  Restore the "entry" origin to whatever value we captured. This avoids
    //  any issues due to notifications revolving the origin for signaling.
    sig.setOrigin(origin);

    TP.sig.SignalMap.notifyControllers(sig);

    return sig;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('$notifyResponders',
function(target, signal) {

    /**
     * @method $notifyResponders
     * @summary Notifies any tibet:ctrl and/or tibet:tag objects associated with
     *     a specific target element. This method is a helper for the
     *     RESPONDER_FIRING policy and not typically invoked directly.
     * @param {Element} target The element to notify for.
     * @param {TP.sig.Signal} signal The signal to handle.
     * @returns {Boolean} Whether or not to continue signalling responders along
     *     the responder chain.
     */

    var id,
        lastType,
        type,
        responder;

    //  tibet:ctrl

    id = TP.elementGetAttribute(target, 'tibet:ctrl', true);
    if (TP.notEmpty(id)) {

        //  First, try to look up the responder by 'global ID'
        responder = TP.bySystemId(id);
        if (TP.notValid(responder)) {

            //  Next, try to look it up by 'local ID', relative to the context
            //  (i.e. page) that the target it in (which is obtained by
            //  supplying the target).
            responder = TP.byId(id, target);
        }

        if (TP.notValid(responder)) {
            TP.ifWarn() ?
                TP.warn('Unable to resolve tibet:ctrl ' + id + '.') : 0;
        }

        if (TP.isValid(responder)) {
            if (TP.isType(responder)) {
                lastType = responder;
            } else {
                lastType = responder.getType();
            }

            if (TP.canInvoke(responder, 'handle')) {
                signal.setOrigin(target);
                responder.handle(signal);
            } else {
                return this.raise('InvalidController',
                                    TP.sc('Controller: ', id,
                                            ' cannot invoke "handle" using: ',
                                            signal.getSignalName()));
            }

            //  Don't proceed to tibet:tag without checking for propagation.
            //  Note that we only check for 'stop immediately' here because
            //  we're at the same 'DOM element' level for the next check of
            //  'tibet:tag'.
            if (signal.shouldStopImmediately()) {
                return false;
            }
        }
    }

    //  tibet:tag

    id = TP.elementGetAttribute(target, 'tibet:tag', true);
    if (TP.notEmpty(id)) {
        responder = TP.bySystemId(id);
        if (TP.notValid(responder)) {
            TP.ifWarn() ?
                TP.warn('Unable to resolve tibet:tag ' + id + '.') : 0;
        } else {
            //  tibet:tag is typically a type name reference but we want to wrap
            //  the element in an instance and get it to respond.
            if (TP.isType(responder)) {
                type = responder;
                responder = responder.construct(target);
            } else {
                type = responder.getType();
            }

            //  Don't dispatch twice to an instance of the same type.
            if (type !== lastType) {
                lastType = type;

                if (TP.canInvoke(responder, 'handle')) {
                    signal.setOrigin(target);
                    responder.handle(signal);
                } else {
                    this.raise('InvalidResponder',
                            TP.sc('Responder: ', id,
                                    ' cannot handle: ', signal.getSignalName()));
                }

                //  Don't proceed to tibet:tag without checking for propagation.
                //  Note that we only check for 'stop immediately' here because
                //  we're at the same 'DOM element' level for the next check of
                //  'tibet:tag'.
                if (signal.shouldStopImmediately()) {
                    return false;
                }
            }
        }
    }

    //  isResponderFor

    type = TP.nodeGetConcreteType(target);
    if (type !== lastType) {
        responder = TP.wrap(target);
        if (TP.canInvoke(responder, 'handle')) {
            signal.setOrigin(target);
            responder.handle(signal);
        } else {
            this.raise('InvalidResponder',
                    TP.sc('Responder: ', id,
                            ' cannot handle: ', signal.getSignalName()));
        }
    }

    //  Depending on the signal's phase, we check to see if the type is
    //  configured to be opaque for either the capturing or bubbling phase. If
    //  it is, then we return false because we don't want the rest of the
    //  responder chain to be processed (for that phase).
    if (signal.getPhase() === TP.CAPTURING) {
        return !type.isOpaqueCapturerFor(target, signal);
    } else if (signal.getPhase() === TP.BUBBLING) {
        return !type.isOpaqueBubblerFor(target, signal);
    }

    return true;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('EXCEPTION_FIRING',
function(anOrigin, signalSet, aPayload, aType) {

    /**
     * @method EXCEPTION_FIRING
     * @summary Fires a series of exceptions from the origin provided until a
     *     handler for one of the exception types/supertypes stops signal
     *     propagation.
     * @param {Object} anOrigin The originator of the signal.
     * @param {Array|TP.sig.Signal} signalSet The signal(s) to fire.
     * @param {Object} aPayload Optional argument object.
     * @param {String|TP.sig.Signal} aType A default type to use when the signal
     *     type itself isn't found and a new signal subtype must be created.
     *     Defaults to TP.sig.Exception.
     * @returns {TP.sig.Signal} The signal.
     */

    var i,
        sig,
        orgid,
        signame,
        aSignal,
        orig,
        aSet,
        fixedName;

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
        TP.sig.SignalMap.notifyObservers(orgid, signame, sig,
                    TP.hc('checkPropagation', true));

        if (sig.shouldStop() || sig.shouldStopImmediately()) {
            break;
        }

        //  don't repeat if the signal name was already TP.ANY
        if (signame !== TP.ANY) {
            //  notify specific observers for the origin and any signal but
            //  only do this the first time through the loop (since the
            //  observation results won't change as we iterate)
            if (i === 0) {
                TP.sig.SignalMap.notifyObservers(orgid, null, sig,
                    TP.hc('checkPropagation', true));

                if (sig.shouldStop() || sig.shouldStopImmediately()) {
                    break;
                }
            }
        }

        //  notify observers of the signal from any origin
        if (orgid !== TP.ANY) {
            TP.sig.SignalMap.notifyObservers(null, signame, sig,
                    TP.hc('checkPropagation', true));

            if (sig.shouldStop() || sig.shouldStopImmediately()) {
                break;
            }
        }

        //  For controller notification we want to ensure the signal instance
        //  has the actual signal name for this iteration. We set it back after
        //  attempting invocation.
        try {
            fixedName = sig.getSignalName();
            sig.setSignalName(signame);

            TP.sig.SignalMap.notifyControllers(sig, {dontTraverseSpoofs: true});
        } catch (e) {
            //  Catch is required for older IE versions and void is needed to
            //  keep lint happy. The notify call handles error reporting.
            void 0;
        } finally {
            sig.setSignalName(fixedName);
        }
    }

    return sig;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('INHERITANCE_FIRING',
function(anOrigin, aSignal, aPayload, aType) {

    /**
     * @method INHERITANCE_FIRING
     * @summary Fires a signal ensuring that observers of supertypes of that
     *     signal are notified. This is a single origin/single signal policy.
     * @param {Object} anOrigin The originator of the signal.
     * @param {TP.sig.Signal} aSignal The signal to fire.
     * @param {Object} aPayload Optional argument object.
     * @param {String|TP.sig.Signal} aType A default type to use when the signal
     *     type itself isn't found and a new signal subtype must be created.
     *     Defaults to TP.sig.Signal.
     * @returns {TP.sig.Signal} The signal.
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
        fixedName,
        isSpoofed;

    aSig = aSignal;

    if (TP.isArray(aSignal)) {
        if (aSignal.length >= 1) {
            TP.ifError() ?
                TP.error(
                    'Invalid Signal Array For Firing Policy. Truncating.',
                    TP.SIGNAL_LOG) : 0;

            aSig = aSignal[0];
        } else {    //  oops, empty array
            TP.ifError() ?
                TP.error(
                    'Invalid Signal For Firing Policy. Terminating.',
                    TP.SIGNAL_LOG) : 0;

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

        //  as we loop across signal names we may be stopped, so check that.
        if (i > 0 && (sig.shouldStop() || sig.shouldStopImmediately())) {
            break;
        }

        //  notify specific observers for the signal/origin combo
        TP.sig.SignalMap.notifyObservers(orgid, signame, sig,
                    TP.hc('checkPropagation', true));

        if (sig.shouldStop() || sig.shouldStopImmediately()) {
            break;
        }

        //  don't repeat if the signal name was already TP.ANY
        if (signame !== TP.ANY) {
            //  notify specific observers for the origin and any signal but
            //  only do this the first time through the loop (since the
            //  observation results won't change as we iterate)
            if (i === 0) {
                TP.sig.SignalMap.notifyObservers(orgid, null, sig,
                    TP.hc('checkPropagation', true));

                if (sig.shouldStop() || sig.shouldStopImmediately()) {
                    break;
                }
            }
        }

        //  notify observers of the signal from any origin
        if (orgid !== TP.ANY) {
            TP.sig.SignalMap.notifyObservers(null, signame, sig,
                    TP.hc('checkPropagation', true));

            if (sig.shouldStop() || sig.shouldStopImmediately()) {
                break;
            }
        }

        //  For controller notification we want to ensure the signal instance
        //  has the actual signal name for this iteration. We set it back after
        //  attempting invocation.
        try {
            fixedName = sig.getSignalName();
            sig.setSignalName(signame);

            TP.sig.SignalMap.notifyControllers(sig);
        } catch (e) {
            void 0;     //  TODO: verify we want to do this here.
        } finally {
            sig.setSignalName(fixedName);
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
            void 0;
        } else {
            type = type.getSupertype();
        }
    }

    return sig;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('BIND_FIRING',
function(originSet, aSignal, aPayload, aType) {


    /**
     * @method BIND_FIRING
     * @summary
     * @param {Array|Object} originSet The originator(s) of the signal. Unused
     *     for this firing policy.
     * @param {String|TP.sig.Signal} aSignal The signal to fire.
     * @param {Object} aPayload Optional argument object.
     * @param {String|TP.sig.Signal} aType A default type to use when the signal
     *     type itself isn't found and a new signal subtype must be created.
     *     Defaults to TP.sig.Signal.
     * @returns {TP.sig.Signal} The signal.
     */

    var sig,

        payload,
        scope,
        evt,

        origin,
        target,

        scopeVals,
        scopeURI,

        resource,
        handler,

        orgid;

    if (TP.notValid(aSignal)) {
        return TP.sig.SignalMap.raise('TP.sig.InvalidSignal');
    }

    //  get a valid signal instance configured
    sig = TP.sig.SignalMap.$getSignalInstance(aSignal, aPayload, aType);
    if (!TP.isKindOf(sig, TP.sig.Signal)) {
        return;
    }

    if (TP.notValid(payload = aPayload)) {
        //  TODO: Raise an exception
        return sig;
    }

    //  If no scope was defined, then we see if we can compute one via an event
    //  target.
    if (TP.notValid(scope = payload.at('scope'))) {

        //  Make sure that we have both an Event and an Event target.
        if (TP.isEvent(evt = payload.at('trigger').getEvent())) {

            if (TP.isElement(origin = originSet)) {
                //  Wrap the origin and compute its binding scope values.
                scopeVals = TP.wrap(origin).getBindingScopeValues();
            } else if (TP.isElement(target = TP.eventGetTarget(evt))) {
                //  Wrap the target and compute its binding scope values.
                scopeVals = TP.wrap(target).getBindingScopeValues();
            }

            //  Join all of the scope value fragments together and set the scope
            //  in the payload.
            if (TP.isEmpty(scopeVals)) {
                TP.ifWarn() ? TP.warn('Bind firing without scope values: ') : 0;
                return sig;
            }

            scope = TP.uriJoinFragments.apply(TP, scopeVals);
            payload.atPut('scope', scope);
        }
    }

    //  If we didn't end up with a scope or if a URI can't be computed from it,
    //  then exit here.
    if (TP.notValid(scope) || !TP.isURI(scopeURI = TP.uc(scope))) {
        //  TODO: Raise an exception
        return sig;
    }

    //  Make sure that we can get a resource result for the scope - note here
    //  how we query the primary URI for its resource. The handler will be on
    //  that object's result.

    //  NB: We assume 'async' of false here.
    if (TP.notValid(resource =
                    scopeURI.getPrimaryURI().getResource().get('result'))) {
        //  TODO: Raise an exception
        return sig;
    }

    //  If the 'origin set' wasn't an Array, then we don't have real origins.
    //  Compute one from the local ID of the 'origin set' and set that to be the
    //  origin of the signal.
    if (!TP.isArray(originSet)) {
        orgid = TP.lid(originSet);
        sig.setOrigin(orgid);
    }

    //  Look for handlers, but only explicit ones. This routing is called by
    //  policies which handle all looping of inheritance chains etc for us.
    handler = resource.getBestHandler(
        sig,
        {
            startSignal: null,
            dontTraverseHierarchy: true,
            dontTraverseSpoofs: true
        });

    if (TP.isCallable(handler)) {
        try {
            handler.call(resource, sig);
        } catch (e) {
            //  TODO: handler exception
            //  TODO: Add a callback check at the handler/owner level?
            TP.error('HandlerException: ' + e.message + ' in: ' +
                TP.id(TP.owner(handler)) + ':' + TP.name(handler));
        }
    }

    return sig;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('REGISTER_CAPTURING',
function(anOrigin, aSignal, aHandler) {

    /**
     * @method REGISTER_CAPTURING
     * @summary Handles registration of a capturing handler for the
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
                if (TP.canInvoke(anOrigin, 'shouldSignalChange')) {
                    anOrigin.shouldSignalChange(true);
                }
            } else {
                //  a string ID -- try to get handle to obj
                /*
                (ss)    commented out to avoid excessive overhead
                inst = TP.bySystemId(anOrigin.getID());
                if (TP.isMutable(inst)) {
                    inst.shouldSignalChange(true);
                };
                */
                void 0;
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
     * @method REGISTER_NONCAPTURING
     * @summary Handles registration of a non-capturing handler for the
     *     registration data provided.
     * @param {String} anOrigin The origin to register interest in.
     * @param {TP.sig.Signal|String} aSignal The signal or signal name to
     *     register interest in.
     * @param {Object|String} aHandler The handler or handler ID being
     *     registered.
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
                if (TP.canInvoke(anOrigin, 'shouldSignalChange')) {
                    anOrigin.shouldSignalChange(true);
                }
            } else {
                //  a string ID -- try to get handle to obj
                /*
                (ss)    commented out to avoid excessive overhead
                inst = TP.bySystemId(anOrigin.getID());
                if (TP.isMutable(inst)) {
                    inst.shouldSignalChange(true);
                };
                */
                void 0;
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
     * @method REMOVE_CAPTURING
     * @summary Removes registration of a capturing handler for the
     *     registration data provided. If no handler is provided ALL capturing
     *     notifications for the signal/origin pair are removed.
     * @param {String} anOrigin The origin to register interest in.
     * @param {TP.sig.Signal|String} aSignal The signal or signal name to
     *     register interest in.
     * @param {Object|String} aHandler The handler or handler ID being
     *     registered.
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
     * @method REMOVE_NONCAPTURING
     * @summary Removes registration of a non-capturing handler for the
     *     registration data provided. If no handler is provided ALL capturing
     *     notifications for the signal/origin pair are removed.
     * @param {String} anOrigin The origin to register interest in.
     * @param {TP.sig.Signal|String} aSignal The signal or signal name to
     *     register interest in.
     * @param {Object|String} aHandler The handler or handler ID being
     *     registered.
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
     * @method RESUME
     * @summary Resumes signaling status for a particular origin/signal pair.
     * @param {String} anOrigin The origin to resume interest in.
     * @param {TP.sig.Signal|String} aSignal The signal or signal name to resume
     *     interest in.
     */

    var entry,
        orgid,
        signame;

    orgid = TP.sig.SignalMap.$computeOriginID(anOrigin);
    signame = TP.sig.SignalMap.$computeSignalName(aSignal);

    entry = TP.sig.SignalMap.interests[orgid + '.' + signame];

    if (TP.isValid(entry)) {
        delete entry.suspend;
    } else if (!TP.regex.HAS_PERIOD.test(signame)) {
        //  If the signame didn't have a period, then it might be a spoofed
        //  signal name, but the registration would've been made using a
        //  'full signal' name (i.e. prefixed by 'TP.sig.').
        entry = TP.sig.SignalMap.interests[orgid + '.' + 'TP.sig.' + signame];

        if (TP.isValid(entry)) {
            delete entry.suspend;
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.defineMethod('SUSPEND',
function(anOrigin, aSignal) {

    /**
     * @method SUSPEND
     * @summary Suspends signaling status for a particular origin/signal pair.
     * @param {String} anOrigin The origin to suspend interest in.
     * @param {TP.sig.Signal|String} aSignal The signal or signal name to
     *     suspend interest in.
     */

    var entry,
        orgid,
        signame;

    orgid = TP.sig.SignalMap.$computeOriginID(anOrigin);
    signame = TP.sig.SignalMap.$computeSignalName(aSignal);

    entry = TP.sig.SignalMap.interests[orgid + '.' + signame];

    if (TP.isValid(entry)) {
        entry.suspend = true;
    } else if (!TP.regex.HAS_PERIOD.test(signame)) {
        //  If the signame didn't have a period, then it might be a spoofed
        //  signal name, but the registration would've been made using a
        //  'full signal' name (i.e. prefixed by 'TP.sig.').
        entry = TP.sig.SignalMap.interests[orgid + '.' + 'TP.sig.' + signame];

        if (TP.isValid(entry)) {
            entry.suspend = true;
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.SignalMap.$ignore = function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @method $ignore
     * @summary The primary observation removal method. This method is
     *     typically invoked via the ignore instance method on most objects, you
     *     don't normally need to invoke it yourself.
     * @param {Object|Array} anOrigin An origin (or origins) to ignore.
     * @param {TP.sig.Signal|String|Array} aSignal A signal (or signals) to
     *     ignore from the origin(s).
     * @param {Function} aHandler The specific handler to turn off, if any.
     * @param {Function} aPolicy The policy if any. Should be 'capture' to
     *     remove capturing handlers. Default is non-capturing.
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

    //  NB: Note the direct comparison to false here - this is by design if the
    //  creator of an Array which is being observed has explicitly set this to
    //  false.
    if (origins.isOriginSet() === false) {
        return;
    }

    len = origins.getSize();
    for (i = 0; i < len; i++) {
        //  all observations are done conditionally based on whether the
        //  origin or "owner" of a particular signal wants to adjust the map
        //  after being given the chance to handle them directly.
        origin = TP.isTypeName(origins.at(i)) ?
                    TP.sys.getTypeByName(origins.at(i)) :
                    origins.at(i);

        if (TP.canInvoke(origin, 'removeObserver')) {
            //  If we were supplied a String, make sure it's a fully
            //  expanded signal name.
            if (TP.isString(aSignal)) {
                typename = TP.expandSignalName(aSignal);
                if (!TP.isType(signal = TP.sys.getTypeByName(typename))) {
                    //  Must be a spoofed signal - just use original name.
                    signal = aSignal;
                }
            } else {
                signal = aSignal;
            }

            switch (origin.removeObserver.getArity()) {
                case 4:
                    adjustMap = origin.removeObserver(origin, signal, aHandler,
                        aPolicy);
                    break;
                case 3:
                    adjustMap = origin.removeObserver(signal, aHandler, aPolicy);
                    break;
                default:
                    adjustMap = origin.removeObserver(signal, aHandler);
                    break;
            }

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
                TP.sys.getTypeByName(typename) :
                typename;

        //  special case here for keyboard events since their names are
        //  often synthetic and we have to map to the true native event
        if (!TP.isType(type)) {
            if (TP.regex.KEY_EVENT.test(typename)) {
                type = TP.sys.getTypeByName('TP.sig.DOMKeySignal');
            }
        }

        if (TP.isType(type) &&
            TP.canInvoke(type, 'getSignalOwner') &&
            TP.isValid(owner = type.getSignalOwner())) {
            if (owner !== origin && TP.canInvoke(owner, 'removeObserver')) {

                switch (owner.removeObserver.getArity()) {
                    case 4:
                        adjustMap = owner.removeObserver(anOrigin, typename,
                            aHandler, aPolicy);
                        break;
                    case 3:
                        adjustMap = owner.removeObserver(typename, aHandler,
                            aPolicy);
                        break;
                    default:
                        adjustMap = owner.removeObserver(typename, aHandler);
                        break;
                }

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
    } else if (TP.isArray(aSignal)) {
        //  It's an Array - check to make sure each one is a real type. If we
        //  can't resolve to a type name then it must be a spoofed signal.
        signal = aSignal.collect(
                        function(sig) {
                            var sigTypeName;

                            sigTypeName = TP.expandSignalName(sig);
                            if (TP.notEmpty(sigTypeName) &&
                                TP.isType(TP.sys.getTypeByName(sigTypeName))) {
                                return sigTypeName;
                            }

                            return sig;
                        });
    } else if (TP.notEmpty(typename = TP.expandSignalName(aSignal)) &&
                TP.isType(TP.sys.getTypeByName(typename))) {
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
     * @method $invokePolicy
     * @summary General purpose signal invocation method. Each policy gets
     *     invoked from this entry point.
     * @param {Object|Array} origins An origin or origins.
     * @param {TP.sig.Signal|Array} signals A signal or signals.
     * @param {Function} handler The handler if any.
     * @param {Function} policy The policy if any.
     */

    var i,
        j;

    //  deal with possibility that origin IS an array
    /* eslint-disable no-extra-parens */
    if ((TP.isArray(origins) && !origins.isOriginSet()) ||
        !TP.isArray(origins)) {
    /* eslint-enable no-extra-parens */
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
     * @method $observe
     * @summary The primary observation installation method. This method is
     *     typically invoked via the observe instance method on most objects,
     *     you don't normally need to invoke it yourself.
     * @param {Object|Array} anOrigin An origin (or origins) to observe.
     * @param {TP.sig.Signal|String|Array} aSignal A signal (or signals) to
     *     observe from the origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @param {Function} aPolicy The policy if any. Should be 'capture' to
     *     configure a capturing handler. Default is non-capturing.
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
                        TP.SIGNAL_LOG) : 0;

        return;
    }

    if (!TP.isArray(origins = anOrigin)) {
        origins = TP.ac(anOrigin);
        origins.isOriginSet(true);
    }

    //  NB: Note the direct comparison to false here - this is by design if the
    //  creator of an Array which is being observed has explicitly set this to
    //  false.
    if (origins.isOriginSet() === false) {
        return;
    }

    len = origins.getSize();
    for (i = 0; i < len; i++) {
        //  all observations are done conditionally based on whether the
        //  origin or "owner" of a particular signal wants to adjust the map
        //  after being given the chance to handle them directly.
        origin = TP.isTypeName(origins.at(i)) ?
                    TP.sys.getTypeByName(origins.at(i)) :
                    origins.at(i);

        if (TP.canInvoke(origin, 'addObserver')) {
            //  If we were supplied a String, make sure it's a fully
            //  expanded signal name.
            if (TP.isString(aSignal)) {
                typename = TP.expandSignalName(aSignal);
                if (!TP.isType(signal = TP.sys.getTypeByName(typename))) {
                    //  Must be a spoofed signal - just use original name.
                    signal = aSignal;
                }
            } else {
                signal = aSignal;
            }

            switch (origin.addObserver.getArity()) {
                case 4:
                    adjustMap = origin.addObserver(origin, signal, aHandler,
                        aPolicy);
                    break;
                case 3:
                    adjustMap = origin.addObserver(signal, aHandler, aPolicy);
                    break;
                default:
                    adjustMap = origin.addObserver(signal, aHandler);
                    break;
            }

            if (!adjustMap) {
                return;
            }
        }
    }

    if (!TP.isArray(typenames = aSignal)) {
        typenames = TP.ac();
        if (TP.isValid(aSignal)) {
            typenames.push(aSignal);
        }
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
                TP.sys.getTypeByName(typename) :
                typename;

        //  special case here for keyboard events since their names are
        //  often synthetic and we have to map to the true native event
        if (!TP.isType(type)) {
            if (TP.regex.KEY_EVENT.test(typename)) {
                type = TP.sys.getTypeByName('TP.sig.DOMKeySignal');
            }
        }

        if (TP.isType(type) &&
            TP.canInvoke(type, 'getSignalOwner') &&
            TP.isValid(owner = type.getSignalOwner())) {
            if (owner !== origin && TP.canInvoke(owner, 'addObserver')) {

                switch (owner.addObserver.getArity()) {
                    case 4:
                        adjustMap = owner.addObserver(anOrigin, typename,
                            aHandler, aPolicy);
                        break;
                    case 3:
                        adjustMap = owner.addObserver(typename, aHandler,
                            aPolicy);
                        break;
                    default:
                        adjustMap = owner.addObserver(typename, aHandler);
                        break;
                }

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
    } else if (TP.isArray(aSignal)) {
        //  It's an Array - check to make sure each one is a real type. If we
        //  can't resolve to a type name then it must be a spoofed signal.
        signal = aSignal.collect(
                        function(sig) {
                            var sigTypeName;

                            sigTypeName = TP.expandSignalName(sig);
                            if (TP.notEmpty(sigTypeName) &&
                                TP.isType(TP.sys.getTypeByName(sigTypeName))) {
                                return sigTypeName;
                            }

                            return sig;
                        });
    } else if (TP.notEmpty(typename = TP.expandSignalName(aSignal)) &&
                TP.isType(TP.sys.getTypeByName(typename))) {
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
     * @method $resume
     * @summary The primary observation resume method. When an observation has
     *     been suspended this method will resume active notifications for it.
     * @param {Object|Array} anOrigin An origin (or origins) to resume
     *     notifications for.
     * @param {TP.sig.Signal|String|Array} aSignal A signal (or signals) to
     *     resume signaling from the origin(s).
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

    //  NB: Note the direct comparison to false here - this is by design if the
    //  creator of an Array which is being observed has explicitly set this to
    //  false.
    if (origins.isOriginSet() === false) {
        return;
    }

    len = origins.getSize();
    for (i = 0; i < len; i++) {
        //  all observations are done conditionally based on whether the
        //  origin or "owner" of a particular signal wants to adjust the map
        //  after being given the chance to handle them directly.
        origin = TP.isTypeName(origins.at(i)) ?
                    TP.sys.getTypeByName(origins.at(i)) :
                    origins.at(i);

        if (TP.canInvoke(origin, 'resumeObserver')) {
            //  If we were supplied a String, make sure it's a fully
            //  expanded signal name.
            if (TP.isString(aSignal)) {
                typename = TP.expandSignalName(aSignal);
                if (!TP.isType(signal = TP.sys.getTypeByName(typename))) {
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
        typenames = TP.ac();
        if (TP.isValid(aSignal)) {
            typenames.push(aSignal);
        }
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
                TP.sys.getTypeByName(typename) :
                typename;

        //  special case here for keyboard events since their names are
        //  often synthetic and we have to map to the true native event
        if (!TP.isType(type)) {
            if (TP.regex.KEY_EVENT.test(typename)) {
                type = TP.sys.getTypeByName('TP.sig.DOMKeySignal');
            }
        }

        if (TP.isType(type) &&
            TP.canInvoke(type, 'getSignalOwner') &&
            TP.isValid(owner = type.getSignalOwner())) {
            if (owner !== origin && TP.canInvoke(owner, 'resumeObserver')) {
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
    } else if (TP.isArray(aSignal)) {
        //  It's an Array - check to make sure each one is a real type. If we
        //  can't resolve to a type name then it must be a spoofed signal.
        signal = aSignal.collect(
                        function(sig) {
                            var sigTypeName;

                            sigTypeName = TP.expandSignalName(sig);
                            if (TP.notEmpty(sigTypeName) &&
                                TP.isType(TP.sys.getTypeByName(sigTypeName))) {
                                return sigTypeName;
                            }

                            return sig;
                        });
    } else if (TP.notEmpty(typename = TP.expandSignalName(aSignal)) &&
                TP.isType(TP.sys.getTypeByName(typename))) {
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
     * @method $suspend
     * @summary The primary observation suspention method. When an observation
     *     has been suspended the registration is maintained but notifications
     *     are not made until a TP.resume().
     * @param {Object|Array} anOrigin An origin (or origins) to suspend
     *     notifications for.
     * @param {TP.sig.Signal|String|Array} aSignal A signal (or signals) to
     *     suspend signaling from the origin(s).
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

    //  NB: Note the direct comparison to false here - this is by design if the
    //  creator of an Array which is being observed has explicitly set this to
    //  false.
    if (origins.isOriginSet() === false) {
        return;
    }

    len = origins.getSize();
    for (i = 0; i < len; i++) {
        //  all observations are done conditionally based on whether the
        //  origin or "owner" of a particular signal wants to adjust the map
        //  after being given the chance to handle them directly.
        origin = TP.isTypeName(origins.at(i)) ?
                    TP.sys.getTypeByName(origins.at(i)) :
                    origins.at(i);

        if (TP.canInvoke(origin, 'suspendObserver')) {
            //  If we were supplied a String, make sure it's a fully
            //  expanded signal name.
            if (TP.isString(aSignal)) {
                typename = TP.expandSignalName(aSignal);
                if (!TP.isType(signal = TP.sys.getTypeByName(typename))) {
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
                TP.sys.getTypeByName(typename) :
                typename;

        //  special case here for keyboard events since their names are
        //  often synthetic and we have to map to the true native event
        if (!TP.isType(type)) {
            if (TP.regex.KEY_EVENT.test(typename)) {
                type = TP.sys.getTypeByName('TP.sig.DOMKeySignal');
            }
        }

        if (TP.isType(type) &&
            TP.canInvoke(type, 'getSignalOwner') &&
            TP.isValid(owner = type.getSignalOwner())) {
            if (owner !== origin &&
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
    } else if (TP.isArray(aSignal)) {
        //  It's an Array - check to make sure each one is a real type. If we
        //  can't resolve to a type name then it must be a spoofed signal.
        signal = aSignal.collect(
                        function(sig) {
                            var sigTypeName;

                            sigTypeName = TP.expandSignalName(sig);
                            if (TP.notEmpty(sigTypeName) &&
                                TP.isType(TP.sys.getTypeByName(sigTypeName))) {
                                return sigTypeName;
                            }

                            return sig;
                        });
    } else if (TP.notEmpty(typename = TP.expandSignalName(aSignal)) &&
                TP.isType(TP.sys.getTypeByName(typename))) {
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
function(anOrigin, aSignal, aPayload, aPolicy, aType, isCancelable, isBubbling) {

    /**
     * @method signal
     * @summary Signals activity to registered observers. Any additional
     *     arguments are passed to the registered handlers along with the origin
     *     and event.
     * @param {Object} anOrigin The originator of the signal.
     * @param {String|TP.sig.Signal} aSignal The signal to fire.
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
    //  TODO: remove this feature
    if (TP.signal.$suspended) {
        return;
    }

    //  all observations are done conditionally based on whether the origin
    //  or "owner" of a particular signal wants to signal the map after
    //  being given the chance to handle them directly.
    //  TODO: probably not getTypeByName(), should be getTypeByName?
    origin = TP.isTypeName(anOrigin) ? TP.sys.getTypeByName(anOrigin) : anOrigin;
    if (TP.canInvoke(origin, 'signalObservers')) {
        shouldSignalMap = origin.signalObservers(
                                            anOrigin, aSignal,
                                            aPayload, aPolicy, aType,
                                            isCancelable, isBubbling);
        if (!shouldSignalMap) {
            return;
        }
    }

    //  NB: We go after the signal name and then unescape it here, rather
    //  than the actual type name. This is done because of spoofed signals.
    //  TODO: simply aSignal.getSignalName without type check
    signame = TP.isString(aSignal) ? aSignal : aSignal.getSignalName();

    //  some events require interaction with an "owner", typically a
    //  TP.core.Device, responsible for events of that type which may also
    //  decide to manage observations directly

    //  If the signal name looks like it could be a type name, try to get the
    //  type behind it. First check what was handed to us and if that doesn't
    //  resolve to a type, expand the signal name and check again.
    if (TP.isTypeName(signame)) {
        if (!TP.isType(type = TP.sys.getTypeByName(signame))) {
            type = TP.sys.getTypeByName(TP.expandSignalName(signame));
        }
    }

    //  If we were using a spoofed signal name we may not have a real type, but
    //  we need one to determine if the signal is of a type that has an owner,
    //  or default firing policy etc. Note that we give preference to any
    //  'default' signal type that was passed in and, if that doesn't exist,
    //  then ask the signal instance itself.
    if (TP.notValid(type)) {
        if (TP.isValid(aType)) {
            type = aType;
        } else {
            type = TP.sig.SignalMap.$getSignalType(
                        aSignal,
                        TP.sig.SignalMap.$getDefaultTypeForPolicy(aPolicy));
        }
    }

    //  special case here for keyboard events since their names are often
    //  synthetic and we have to map to the true native event
    if (TP.notValid(type)) {
        //  TODO:   log when we get here. this really shouldn't be happening
        //  that often, we should be getting a real signal from devices.
        if (TP.regex.KEY_EVENT.test(signame)) {
            type = TP.sys.getTypeByName('TP.sig.DOMKeySignal');
        /*
         * TODO: Test this - it should be correct.
        } else {
            type = TP.isType(aType) ?
                            aType :
                            TP.sys.getTypeByName(aType);
        */
        }
    }

    //  all observations are done conditionally based on whether the origin
    //  or "owner" of a particular signal wants to signal the map after
    //  being given the chance to handle them directly.
    if (TP.canInvoke(type, 'getSignalOwner') &&
        TP.isValid(owner = type.getSignalOwner())) {
        if (owner !== origin && TP.canInvoke(owner, 'signalObservers')) {
            shouldSignalMap = owner.signalObservers(
                                                anOrigin, aSignal,
                                                aPayload, aPolicy, type,
                                                isCancelable, isBubbling);
            if (!shouldSignalMap) {
                return;
            }
        }
    }

    //  see if ignore is on at the 'origin' level, meaning we're not
    //  currently allowing any signals from that origin to flow
    if (TP.isValid(anOrigin)) {
        //  TODO: method call here, not private property access.
        if (anOrigin.$suspended) {
            return TP.sys.fireNextSignal();
        }
    }

    //  TODO:   remove this feature
    //  if signaling is turned off then do not notify
    if (TP.sig.SignalMap.interests.suspend === true) {
        if (TP.ifTrace() && TP.$DEBUG && TP.$$VERBOSE) {
            TP.sys.logSignal('Root interest map is suspended.',
                            TP.DEBUG);
        }

        return;
    }

    //  don't log signals when processing events from the other logs to
    //  help reduce the potential for recursive logging. The activity and
    //  error logs, as well as the signal log itself, are definite no-nos.
    if (TP.sys.shouldLogSignals()) {

        //  TODO: sigstr is signame...why a second variable here?
        sigstr = aSignal.getSignalName();
        //  TODO: sigtype is type from above...why a second variable here?
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
                                            TP.annotate(aSignal, str),
                                            TP.DEBUG) : 0;
                    } finally {
                        TP.sys.shouldLogStack(flag);
                    }
                } else {
                    TP.ifTrace() ? TP.sys.logSignal(
                                            TP.annotate(aSignal, str),
                                            TP.DEBUG) : 0;
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
                //  TODO:   make the default signaling policy an attribute of
                //          the signaling system somewhere so that it can be
                //          configured.
                pol = TP.sig.SignalMap.OBSERVER_FIRING;
            } else if (!TP.isCallable(pol) &&
                        !TP.isCallable(pol = TP.sig.SignalMap[pol])) {
                //  TODO:   make the default signaling policy an attribute of
                //          the signaling system somewhere so that it can be
                //          configured.
                pol = TP.sig.SignalMap.OBSERVER_FIRING;
            }
        }
    }

    //  hand off to policy do do the actual firing of the signal(s)
    sig = pol(anOrigin, aSignal, aPayload, type,
                isCancelable, isBubbling);

    //  TODO:   dramatically expand on the ability to track stats across signal
    //  types and for individual signal types.
    if (TP.sys.shouldTrackSignalStats()) {
        end = Date.now();
        delta = end - sig.get('time');

        sig.$set('elapsed', delta);

        TP.sys.$statistics.$signals = TP.sys.$statistics.$signals ||
                                        TP.ac();
        TP.sys.$statistics.$signals.push(delta);

        if (TP.sys.$statistics.$signals.length >
                TP.sys.cfg('signal.max_stats')) {
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
function(anOrigin, anException, aPayload) {

    /**
     * @method raise
     * @summary Raise an exception.
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
     * @param {Object} aPayload Optional argument object.
     */

    var i,
        str,
        orig,
        args,
        supers,
        aSignal,
        exceptions,
        flag,
        inst,
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
                        TP.ifError() ?
                            TP.error(
                                TP.ec(e, 'Error generating payload string.'),
                                TP.SIGNAL_LOG) : 0;
                    }
                }
            } else {
                args = '';
            }

            if (TP.isValid(orig) && TP.isValid(eType.getSignalName)) {
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
                    TP.trace(str);
                    break;
                case TP.INFO:
                    TP.info(str);
                    break;
                case TP.WARN:
                    TP.isValid(aPayload) ?
                        TP.warn(TP.annotate(aPayload, str)) :
                        TP.warn(str);
                    break;
                case TP.ERROR:
                    TP.isValid(aPayload) ?
                        TP.error(TP.annotate(aPayload, str)) :
                        TP.error(str);
                    break;
                case TP.FATAL:
                    TP.isValid(aPayload) ?
                        TP.fatal(TP.annotate(aPayload, str)) :
                        TP.fatal(str);
                    break;
                case TP.SYSTEM:
                    TP.system(str);
                    break;
                default:
                    TP.isValid(aPayload) ?
                        TP.error(TP.annotate(aPayload, str)) :
                        TP.error(str);
                    break;
            }
        }
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

    //  dispatch with EXCEPTION firing policy. The TP.EXCEPTION_FIRING policy
    //  performs a list-oriented process which stops when the signal is
    //  "handled" at a particular exception.
    inst = TP.signal(orig, exceptions, aPayload, TP.EXCEPTION_FIRING);

    //  if the type's handled flag is still false then we throw a real error
    if (TP.sys.shouldThrowExceptions()) {

        //  one issue is that we want assertion throwing managed by its own
        //  flag so we do a secondary check here
        if (aSignal.getSignalName() !== 'AssertionFailed') {

            //  If the signal instance was handled (preventDefault() was
            //  invoked) then we don't want to throw.
            if (inst.shouldPrevent()) {
                return;
            }

            str = aSignal.asString();
            if (TP.isValid(aPayload)) {
                str += ' - ' + TP.str(aPayload);
            }
            throw new Error(str);
        }
    }

    return;
});

//  ========================================================================
//  Native Type Extensions
//  ========================================================================

String.Inst.defineMethod('fire',
function(anOrigin, aPayload, aPolicy) {

    /**
     * @method fire
     * @summary Creates and activates the signal instance via the policy
     *     specified. The signal name will be set to the string value.
     * @param {Object} anOrigin Optional origin for this call.
     * @param {Array} aPayload Optional signal arguments.
     * @param {Function} aPolicy A firing policy function.
     * @returns {TP.sig.Signal} The signal.
     */

    return TP.signal(anOrigin, '' + this, aPayload, aPolicy);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
