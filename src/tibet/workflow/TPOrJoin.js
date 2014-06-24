//  ========================================================================
/*
NAME:   TP.sig.OrJoin.js
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
 * @type {TP.sig.OrJoin}
 * @synopsis An 'or-join' is a coalescer which will notify when any one of its
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
     * @name hasCoalesced
     * @synopsis Returns true if the receiver has reached a coalescing point. If
     *     true the handleSignal method will perform notification.
     * @param {Array} anItem A 'trigger' array. Used primarily to optimize for
     *     Or-Join scenarios.
     * @returns {Boolean} True if the receiver should signal it's notifier.
     * @todo
     */

    //  seen the proper count? then yes, at least one trigger qualification
    //  has been met
    return anItem.at(TP.sig.SignalCoalescer.SEEN_INDEX) ===
            anItem.at(TP.sig.SignalCoalescer.COUNT_INDEX);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

