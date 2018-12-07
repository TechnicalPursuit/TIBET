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
//  TP.svg.cursor
//  ========================================================================

/**
 * @type {TP.svg.cursor}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:cursor');

TP.svg.cursor.addTraits(TP.svg.Element);

TP.svg.cursor.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.cursor.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.svg.cursor.Type.set('uriAttrs', TP.ac('xlink:href'));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
