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
 * @type {TP.sherpa.Element}
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('sherpa.Element');

TP.sherpa.Element.addTraits(TP.core.NonNativeUIElementNode);

TP.sherpa.Element.Inst.resolveTraits(
        TP.ac('$setAttribute', 'removeAttribute', 'select', 'signal'),
        TP.core.UIElementNode);

//  ------------------------------------------------------------------------
//  Halo focusing methods
//  ------------------------------------------------------------------------

TP.sherpa.Element.Inst.defineMethod('haloCanBlur',
function(aHalo, aSignal) {

    return false;
});

//  ------------------------------------------------------------------------

TP.sherpa.Element.Inst.defineMethod('haloCanFocus',
function(aHalo, aSignal) {

    return false;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
