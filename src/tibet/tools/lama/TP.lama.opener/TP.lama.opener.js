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
 * @type {TP.lama.opener}
 */

//  ------------------------------------------------------------------------

TP.lama.TemplatedTag.defineSubtype('opener');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lama.opener.Inst.defineHandler('UIToggle',
function(aSignal) {

    /**
     * @method handleUIToggle
     * @summary Causes the receiver to toggle the name of the state supplied in
     *     the signal payload. This state name is defaulted to 'closed'.
     * @description At this level, this method overrides the standard
     *     implementation to just allow the signal to pass (and propagate
     *     upwards). This is because we're never actually 'toggling the toggle'.
     * @param {TP.sig.UIToggle} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.lama.opener} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
