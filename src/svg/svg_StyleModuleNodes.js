//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

//  ========================================================================
//  TP.svg.style
//  ========================================================================

/**
 * @type {TP.svg.style}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:style');

TP.svg.style.addTraits(TP.svg.Element);

TP.svg.style.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.style.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
