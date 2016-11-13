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
 * @type {TP.sherpa.toggle}
 */

//  ------------------------------------------------------------------------

TP.sherpa.Element.defineSubtype('toggle');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.toggle.Inst.defineHandler('UIActivate', function() {

    /**
     * @method handleUIActivate
     * @param {TP.sig.UIActivate} aSignal The signal that caused this handler to
     *     trip.
     */

    this.signal('ToggleSherpa');

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
