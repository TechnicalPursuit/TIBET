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
//  TP.svg.view
//  ========================================================================

/**
 * @type {TP.svg.view}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:view');

TP.svg.view.addTraits(TP.svg.Element);

TP.svg.view.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.view.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
