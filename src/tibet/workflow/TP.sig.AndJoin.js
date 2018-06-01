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
 * @type {TP.sig.AndJoin}
 * @summary An 'and-join' is a coalescer which notifies when a specific
 *     combination of triggers has been witnessed. The order of the triggers can
 *     matter, as can the count. Spoilers seen before the entire triggering
 *     sequence has been observed will typically reset the coalescer so it
 *     starts over in attempting to coalesce.
 */

//  ------------------------------------------------------------------------

TP.sig.SignalCoalescer.defineSubtype('AndJoin');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  defines whether the triggering data was provided in order and whether
//  notification should only happen if observations happen in that order
TP.sig.AndJoin.Inst.defineAttribute('orderMatters', false);

//  defines whether 'extra' notifications of a particular trigger are
//  allowed. If not then any extra signal seen before all triggers are seen
//  will cause a failure/reset.
TP.sig.AndJoin.Inst.defineAttribute('allowOverflow', true);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.AndJoin.Inst.defineMethod('hasCoalesced',
function(anItem) {

    /**
     * @method hasCoalesced
     * @summary Returns true if the receiver has reached a coalescing point. If
     *     true the handleSignal method will perform notification.
     * @param {Object[]} anItem A 'trigger' array. Used primarily to optimize for
     *     Or-Join scenarios.
     * @returns {Boolean} True if the receiver should signal it's notifier.
     */

    var triggers,
        item,
        keys,
        vals,
        id,
        i,
        ndx,
        len;

    triggers = this.get('triggers');

    //  if observations have to occur in order things are much more complex
    if (this.shouldOrderMatter()) {
        //  TODO: DANGEROUS, relies on hash keeping keys in order, which
        //  TP.core.Hash does but it isn't really a solid guarantee
        keys = TP.keys(triggers);

        id = this.computeSignalID(anItem.at(TP.sig.SignalCoalescer.ORIGIN_INDEX),
                                anItem.at(TP.sig.SignalCoalescer.SIGNAL_INDEX));

        //  if order matters then the rule is simple, there can't be any
        //  triggers 'in front' of us that aren't full. if there are any
        //  that aren't full then this signal is out of order and we reset
        ndx = keys.getPosition(id);
        if (TP.notValid(ndx)) {
            //  oops! didn't find our index!
            this.raise('TP.sig.InvalidTriggerID');
            return false;
        }

        //  loop across each entry, verifying it conforms to requirements
        for (i = 0; i < ndx; i++) {
            item = triggers.at(keys.at(i));

            //  if we're not allowed to overflow but the item did we reset
            if (!this.shouldAllowOverflow()) {
                if (item.at(TP.sig.SignalCoalescer.SEEN_INDEX) >
                    item.at(TP.sig.SignalCoalescer.COUNT_INDEX)) {
                    this.resetObservations();
                    return false;
                }
            }

            //  if the count for this item isn't accurate and we're not to
            //  the new item yet then we're out of order...prior slots
            //  aren't "complete" before we saw the new trigger
            if (item.at(TP.sig.SignalCoalescer.SEEN_INDEX) !==
                item.at(TP.sig.SignalCoalescer.COUNT_INDEX)) {
                this.resetObservations();
                return false;
            }
        }

        //  passed the first test...question is, are we done?
        if (keys.last() === id) {
            //  we're last...that's a start...are the counts equal?
            return item.at(TP.sig.SignalCoalescer.SEEN_INDEX) ===
                    item.at(TP.sig.SignalCoalescer.COUNT_INDEX);
        } else {
            return false;
        }
    } else {
        //  order doesn't matter...whew...

        //  reset condition here would be the new item overflowing
        if (!this.shouldAllowOverflow()) {
            if (item.at(TP.sig.SignalCoalescer.SEEN_INDEX) >
                item.at(TP.sig.SignalCoalescer.COUNT_INDEX)) {
                this.resetObservations();
                return false;
            }
        }

        //  only question left is are we all matched up?
        vals = triggers.getValues();
        len = vals.getSize();
        for (i = 0; i < len; i++) {
            item = vals.at(i);
            if (item.at(TP.sig.SignalCoalescer.SEEN_INDEX) !==
                item.at(TP.sig.SignalCoalescer.COUNT_INDEX)) {
                return false;
            }
        }

        return true;
    }
});

//  ------------------------------------------------------------------------

TP.sig.AndJoin.Inst.defineMethod('shouldAllowOverflow',
function(aFlag) {

    /**
     * @method shouldAllowOverflow
     * @summary Sets/gets the value for the allow-overflow flag. If this flag
     *     is true the receiver will allow extra notifications to occur.
     * @param {Boolean} aFlag
     * @returns {Boolean}
     */

    if (TP.isDefined(aFlag)) {
        //  NOTE:   we use false here to avoid having any form of signal
        //          sent out which might confuse observers
        this.$set('allowOverflow', aFlag, false);
    }

    return this.$get('allowOverflow');
});

//  ------------------------------------------------------------------------

TP.sig.AndJoin.Inst.defineMethod('shouldOrderMatter',
function(aFlag) {

    /**
     * @method shouldOrderMatter
     * @summary Sets/gets the value for the order-matters flag. If this flag is
     *     true the receiver will require notifications to happen in the same
     *     order they are registered.
     * @param {Boolean} aFlag
     * @returns {Boolean}
     */

    if (TP.isDefined(aFlag)) {
        //  NOTE:   we use false here to avoid having any form of signal
        //          sent out which might confuse observers
        this.$set('orderMatters', aFlag, false);
    }

    return this.$get('orderMatters');
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
