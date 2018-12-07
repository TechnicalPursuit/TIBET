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
//  TP.svg.script
//  ========================================================================

/**
 * @type {TP.svg.script}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:script');

TP.svg.script.addTraits(TP.svg.Element);

TP.svg.script.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.script.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.svg.script.Type.set('uriAttrs', TP.ac('xlink:href'));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
