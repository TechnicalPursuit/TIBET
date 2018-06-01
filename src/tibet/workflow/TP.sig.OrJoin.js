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
 * @type {TP.sig.OrJoin}
 * @summary An 'or-join' is a coalescer which will notify when any one of its
 *     configured notifiers is seen. When counts are involved an or-join can be
 *     spoiled by seeing a spoiler prior to reaching the target count for one of
 *     its triggers.
 */

//  ------------------------------------------------------------------------

TP.sig.SignalCoalescer.defineSubtype('OrJoin');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.OrJoin.Inst.defineMethod('hasCoalesced',
function(anItem) {

    /**
     * @method hasCoalesced
     * @summary Returns true if the receiver has reached a coalescing point. If
     *     true the handleSignal method will perform notification.
     * @param {Object[]} anItem A 'trigger' array. Used primarily to optimize for
     *     Or-Join scenarios.
     * @returns {Boolean} True if the receiver should signal it's notifier.
     */

    //  seen the proper count? then yes, at least one trigger qualification
    //  has been met
    return anItem.at(TP.sig.SignalCoalescer.SEEN_INDEX) ===
            anItem.at(TP.sig.SignalCoalescer.COUNT_INDEX);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
