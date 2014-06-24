//  ========================================================================
/*
NAME:   TP.sig.AndJoin.js
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
//  ------------------------------------------------------------------------

/**
 * @type {TP.sig.AndJoin}
 * @synopsis An 'and-join' is a coalescer which notifies when a specific
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
     * @name hasCoalesced
     * @synopsis Returns true if the receiver has reached a coalescing point. If
     *     true the handleSignal method will perform notification.
     * @param {Array} anItem A 'trigger' array. Used primarily to optimize for
     *     Or-Join scenarios.
     * @returns {Boolean} True if the receiver should signal it's notifier.
     * @todo
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
        //  TP.lang.Hash does but it isn't really a solid guarantee
        keys = TP.keys(triggers);

        id = this.computeSignalID(anItem.at(TP.sig.SignalCoalescer.ORIGIN_INDEX),
                                anItem.at(TP.sig.SignalCoalescer.SIGNAL_INDEX));

        //  if order matters then the rule is simple, there can't be any
        //  triggers 'in front' of us that aren't full. if there are any
        //  that aren't full then this signal is out of order and we reset
        ndx = keys.getPosition(id);
        if (TP.notValid(ndx)) {
            //  oops! didn't find our index!
            this.raise('TP.sig.InvalidTriggerID', arguments);
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
     * @name shouldAllowOverflow
     * @synopsis Sets/gets the value for the allow-overflow flag. If this flag
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
     * @name shouldOrderMatter
     * @synopsis Sets/gets the value for the order-matters flag. If this flag is
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

