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
//  TP.svg.linearGradient
//  ========================================================================

/**
 * @type {TP.svg.linearGradient}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:linearGradient');

TP.svg.linearGradient.addTraits(TP.svg.Element);

TP.svg.linearGradient.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.linearGradient.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.svg.linearGradient.Type.set('uriAttrs', TP.ac('xlink:href'));

//  ========================================================================
//  TP.svg.radialGradient
//  ========================================================================

/**
 * @type {TP.svg.radialGradient}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:radialGradient');

TP.svg.radialGradient.addTraits(TP.svg.Element);

TP.svg.radialGradient.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.radialGradient.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.svg.radialGradient.Type.set('uriAttrs', TP.ac('xlink:href'));

//  ========================================================================
//  TP.svg.stop
//  ========================================================================

/**
 * @type {TP.svg.stop}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:stop');

TP.svg.stop.addTraits(TP.svg.Element);

TP.svg.stop.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.stop.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
