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
//  TP.svg.pattern
//  ========================================================================

/**
 * @type {TP.svg.pattern}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:pattern');

TP.svg.pattern.addTraitTypes(TP.svg.Element);

TP.svg.pattern.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.pattern.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.svg.pattern.Type.set('uriAttrs',
        TP.ac('clip-path', 'cursor', 'filter', 'mask', 'xlink:href'));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
