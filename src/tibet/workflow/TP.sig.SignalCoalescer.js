//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/**
 * @type {TP.sig.SignalCoalescer}
 * @summary An object whose goal is to coalesce a set of signals into a single
 *     new signal. These operations form the cornerstone of using events as
 *     triggers in a Petri-net style workflow model.
 * @description When designing with events it quickly becomes necessary to
 *     support ways of blending or coalescing a set of events into a new, more
 *     semantically-interesting event. Examples are points in workflow where an
 *     Or-Join or And-Join occur and a new signal defining the transition from
 *     'waiting' to 'moving forward' is fired. Another simple example is a
 *     "gesture" made from combining multiple mouse/keyboard events such as a
 *     "grab" operation which may require a mouse down and 2 or more mouse move
 *     operations.
 *
 *     A signal coalescer leverages three key concepts: triggers, spoilers, and
 *     notifiers. Triggers are the signals a coalescer is watching for, spoilers
 *     are events which cause the coalescer to reset, and the notifier is the
 *     signal that will be sent when the receiver "hasCoalesced", meaning it has
 *     received the triggers in the order/number necessary to meet its criteria
 *     without seeing any spoilers along the way.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('sig.SignalCoalescer');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.sig.SignalCoalescer.Type.defineConstant('ORIGIN_INDEX', 0);
TP.sig.SignalCoalescer.Type.defineConstant('SIGNAL_INDEX', 1);
TP.sig.SignalCoalescer.Type.defineConstant('COUNT_INDEX', 2);
TP.sig.SignalCoalescer.Type.defineConstant('SEEN_INDEX', 3);
TP.sig.SignalCoalescer.Type.defineConstant('ORDER_INDEX', 4);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  should the instance automatically reset observation counts on success?
TP.sig.SignalCoalescer.Inst.defineAttribute('autoReset', true);

//  the container for our triggers and observations
TP.sig.SignalCoalescer.Inst.defineAttribute('triggers');

//  the container for any spoilers, signals which reset the observations
TP.sig.SignalCoalescer.Inst.defineAttribute('spoilers');

//  what signal should we send out when we 'coalesce'?
TP.sig.SignalCoalescer.Inst.defineAttribute('notifier');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.SignalCoalescer.Inst.defineMethod('init',
function(aSignalName) {

    /**
     * @method init
     * @summary Initializes a new instance for use. The signal name provided is
     *     the signal which will be fired when the receiver coalesces. This
     *     value defaults to the receiver's type name.
     * @param {String} aSignalName The signal type name the instance should
     *     signal when it coalesces. Default is the receiver's type name.
     * @returns {TP.sig.SignalCoalescer} The new instance.
     */

    this.callNextMethod();

    this.$set('triggers', TP.hc());
    this.$set('spoilers', TP.hc());
    this.$set('notifier', aSignalName || this.getTypeName());

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.SignalCoalescer.Inst.defineMethod('addSpoiler',
function(anOrigin, aSignal, aCount, aPolicy) {

    /**
     * @method addSpoiler
     * @summary Adds a spoiler observation to the receiver. Each spoiler is
     *     tracked by origin/signal key along with a count. The order of the
     *     spoilers may matter to certain subtypes. By default each spoiler only
     *     needs to appear once for it to reset the receiver's coalescing
     *     process.
     * @param {String} anOrigin What origin is being observed?
     * @param {String} aSignal What signal is being observed?
     * @param {Number} aCount How many instances of this spoiler are required to
     *     cause a reset?
     * @param {Function} aPolicy A registration policy. Using this you can
     *     define capture vs. bubble observations.
     * @returns {TP.sig.SignalCoalescer} The receiver.
     */

    var item,
        count,
        spoilers;

    //  make sure we get a default count
    count = TP.ifInvalid(aCount, 1);

    spoilers = this.get('spoilers');

    //  if we've already done an observe don't do another, just bump our
    //  expected count for the spoiler
    item = spoilers.at(this.computeSignalID(anOrigin, aSignal));
    if (TP.isValid(item)) {
        item.atPut(TP.sig.SignalCoalescer.COUNT_INDEX,
                    item.at(TP.sig.SignalCoalescer.COUNT_INDEX) + count);
        return this;
    }

    //  looks like a new one...put an array in place containing our spoiler
    //  data along with the required count and a current count of 0. This
    //  will get incremented when we see new signals
    spoilers.atPut(this.computeSignalID(anOrigin, aSignal),
                    TP.ac(anOrigin, aSignal, count, 0, spoilers.getSize()));

    //  the policy allows us to specify if the observation should be
    //  capturing etc.
    this.observe(anOrigin, aSignal, this, aPolicy);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.SignalCoalescer.Inst.defineMethod('addTrigger',
function(anOrigin, aSignal, aCount, aPolicy) {

    /**
     * @method addTrigger
     * @summary Adds a trigger observation to the receiver. Each trigger is
     *     tracked by origin/signal key along with a count. The order of the
     *     triggers may matter to certain subtypes. By default each trigger only
     *     needs to appear once for it to contribute to the receiver's concept
     *     of coalescing.
     * @param {String} anOrigin What origin is being observed?
     * @param {String} aSignal What signal is being observed?
     * @param {Number} aCount How many instances of this trigger are required to
     *     cause notification?
     * @param {Function} aPolicy A registration policy. Using this you can
     *     define capture vs. bubble observations.
     * @returns {TP.sig.SignalCoalescer} The receiver.
     */

    var item,
        count,
        triggers;

    //  make sure we get a default count
    count = TP.ifInvalid(aCount, 1);

    triggers = this.get('triggers');

    //  if we've already done an observe don't do another, just bump our
    //  expected count for the trigger
    item = triggers.at(this.computeSignalID(anOrigin, aSignal));
    if (TP.isValid(item)) {
        item.atPut(TP.sig.SignalCoalescer.COUNT_INDEX,
                    item.at(TP.sig.SignalCoalescer.COUNT_INDEX) + count);
        return this;
    }

    //  looks like a new one...put an array in place containing our trigger
    //  data along with the required count and a current count of 0. This
    //  will get incremented when we see new signals
    triggers.atPut(this.computeSignalID(anOrigin, aSignal),
                    TP.ac(anOrigin, aSignal, count, 0, triggers.getSize()));

    //  the policy allows us to specify if the observation should be
    //  capturing etc.
    this.observe(anOrigin, aSignal, this, aPolicy);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.SignalCoalescer.Inst.defineMethod('computeSignalID',
function(anOrigin, aSignal) {

    /**
     * @method computeSignalID
     * @summary Returns a string computed from the two parameters provided. The
     *     resulting ID is used as a key for trigger storage.
     * @param {String} anOrigin What origin is being observed?
     * @param {String} aSignal What signal is being observed?
     * @returns {String} The trigger ID.
     */

    var oKey,
        sKey;

    oKey = TP.notValid(anOrigin) ? TP.ANY : TP.id(anOrigin);
    sKey = TP.notValid(aSignal) ? TP.ANY : aSignal.getSignalName();

    return oKey + '.' + sKey;
});

//  ------------------------------------------------------------------------

TP.sig.SignalCoalescer.Inst.defineHandler('Signal',
function(aSignal) {

    /**
     * @method handleSignal
     * @summary Responds to signal notifications which drive the receiver by
     *     updating the receiver's trigger observation counts.
     * @description To support the semantics that are implied by using null, or
     *     TP.ANY for an origin in the observation phase this method will
     *     actually count an incoming signal both against a specific origin and
     *     against an undifferentiated origin, meaning that signals may be
     *     counted twice when using both specific origins and global
     *     observations in the same signal coalescer.
     * @param {TP.sig.Signal} aSignal The specific signal instance.
     * @returns {TP.sig.SignalCoalescer} The receiver.
     */

    var origin,
        id,
        item;

    //  we start with the original origin, which won't typically be ANY
    origin = aSignal.getOrigin();
    id = this.computeSignalID(origin, aSignal);

    item = this.get('triggers').at(id);
    if (TP.isValid(item)) {
        //  bump the observed count for this trigger
        item.atPut(TP.sig.SignalCoalescer.SEEN_INDEX,
                    item.at(TP.sig.SignalCoalescer.SEEN_INDEX) + 1);

        //  if the item causes us to 'coalesce' then we'll notify
        this.hasCoalesced(item);
    }

    //  when the origin wasn't ANY we'll simulate it now so that we can
    //  count triggers for "global" observations as well
    if (origin !== TP.ANY) {
        origin = TP.ANY;
        id = this.computeSignalID(origin, aSignal);

        item = this.get('triggers').at(id);
        if (TP.isValid(item)) {
            //  bump the observed count for this trigger
            item.atPut(TP.sig.SignalCoalescer.SEEN_INDEX,
                    item.at(TP.sig.SignalCoalescer.SEEN_INDEX) + 1);
        }
    }

    //  if the item causes us to 'coalesce' then we'll notify
    if (this.hasCoalesced(item)) {
        this.signal(this.get('notifier'));

        //  should we clear our observations after signaling?
        if (this.shouldAutoReset()) {
            this.resetObservations();
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.SignalCoalescer.Inst.defineMethod('hasCoalesced',
function(anItem) {

    /**
     * @method hasCoalesced
     * @summary Returns true if the receiver has reached a coalescing point. If
     *     true the handleSignal method will perform notification.
     * @param {Object[]} anItem A 'trigger' array. Used primarily to optimize for
     *     Or-Join scenarios.
     * @exception SubtypeResponsibility
     * @returns {Boolean} True if the receiver should signal it's notifier.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.sig.SignalCoalescer.Inst.defineMethod('resetObservations',
function() {

    /**
     * @method resetObservations
     * @summary Clears any counts of observed signals.
     * @returns {TP.sig.SignalCoalescer} The receiver.
     */

    //  triggers is a hash, so we want to manipulate the values which are
    //  our observation array
    this.get('triggers').perform(
        function(item) {
            item.last().atPut(TP.sig.SignalCoalescer.SEEN_INDEX, 0);
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.SignalCoalescer.Inst.defineMethod('setNotifier',
function(aSignalName) {

    /**
     * @method setNotifier
     * @summary Sets the notification signal that will be sent when the
     *     receiver coalesces.
     * @param {String} aSignalName The signal name to use.
     * @returns {TP.sig.SignalCoalescer} The receiver.
     */

    if (TP.notValid(aSignalName)) {
        return this.raise('TP.sig.InvalidSignal');
    }

    this.$set('notifier', aSignalName);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.SignalCoalescer.Inst.defineMethod('shouldAutoReset',
function(aFlag) {

    /**
     * @method shouldAutoReset
     * @summary Sets/gets the value for the auto-reset flag.
     * @param {Boolean} aFlag The setting for auto-reset.
     * @returns {Boolean}
     */

    if (TP.isDefined(aFlag)) {
        //  NOTE:   we use false here to avoid having any form of signal
        //          sent out which might confuse observers
        this.set('autoReset', aFlag, false);
    }

    return this.get('autoReset');
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
