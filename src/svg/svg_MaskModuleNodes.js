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
//  TP.svg.mask
//  ========================================================================

/**
 * @type {TP.svg.mask}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:mask');

TP.svg.mask.addTraits(TP.svg.Element);

TP.svg.mask.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.mask.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.svg.mask.Type.set('uriAttrs',
        TP.ac('clip-path', 'cursor', 'filter', 'mask'));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
