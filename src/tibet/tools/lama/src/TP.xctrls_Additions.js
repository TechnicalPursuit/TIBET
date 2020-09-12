//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

//  ========================================================================
//  TP.xctrls.* Additions
//  ========================================================================

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.Element.Inst.defineMethod('hudCanDrop',
function(aHUD, targetTPElem) {

    /**
     * @method hudCanDrop
     * @summary Returns whether or not the hud should allow the supplied element
     *     to be dropped into the receiver.
     * @param {TP.lama.hud} aHUD The hud that is requesting whether or not
     *     it can drop the supplied element into the receiver.
     * @param {TP.lama.hud} droppingTPElem The element that is being dropped.
     * @returns {Boolean} Whether or not the hud can drop the supplied target
     *     into the receiver.
     */

    //  No element can be dropped into any xctrls element by default.
    return false;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
