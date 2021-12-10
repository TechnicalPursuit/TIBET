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
//  TP.svg.animate
//  ========================================================================

/**
 * @type {TP.svg.animate}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:animate');

TP.svg.animate.addTraitTypes(TP.svg.Element);

TP.svg.animate.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.animate.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.svg.animate.Type.set('uriAttrs', TP.ac('xlink:href'));

//  ========================================================================
//  TP.svg.set
//  ========================================================================

/**
 * @type {TP.svg.set}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:set');

TP.svg.set.addTraitTypes(TP.svg.Element);

TP.svg.set.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.set.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.svg.set.Type.set('uriAttrs', TP.ac('xlink:href'));

//  ========================================================================
//  TP.svg.animateMotion
//  ========================================================================

/**
 * @type {TP.svg.animateMotion}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:animateMotion');

TP.svg.animateMotion.addTraitTypes(TP.svg.Element);

TP.svg.animateMotion.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.animateMotion.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.svg.animateMotion.Type.set('uriAttrs', TP.ac('xlink:href'));

//  ========================================================================
//  TP.svg.animateTransform
//  ========================================================================

/**
 * @type {TP.svg.animateTransform}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:animateTransform');

TP.svg.animateTransform.addTraitTypes(TP.svg.Element);

TP.svg.animateTransform.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.animateTransform.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.svg.animateTransform.Type.set('uriAttrs', TP.ac('xlink:href'));

//  ========================================================================
//  TP.svg.animateColor
//  ========================================================================

/**
 * @type {TP.svg.animateColor}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:animateColor');

TP.svg.animateColor.addTraitTypes(TP.svg.Element);

TP.svg.animateColor.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.animateColor.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ========================================================================
//  TP.svg.mpath
//  ========================================================================

/**
 * @type {TP.svg.mpath}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:mpath');

TP.svg.mpath.addTraitTypes(TP.svg.Element);

TP.svg.mpath.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.mpath.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
