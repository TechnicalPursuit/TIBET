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
//  TP.svg.filter
//  ========================================================================

/**
 * @type {TP.svg.filter}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:filter');

TP.svg.filter.addTraits(TP.svg.Element);

TP.svg.filter.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.filter.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.svg.filter.Type.set('uriAttrs', TP.ac('xlink:href'));

//  ========================================================================
//  TP.svg.feBlend
//  ========================================================================

/**
 * @type {TP.svg.feBlend}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:feBlend');

TP.svg.feBlend.addTraits(TP.svg.Element);

TP.svg.feBlend.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.feBlend.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ========================================================================
//  TP.svg.feColorMatrix
//  ========================================================================

/**
 * @type {TP.svg.feColorMatrix}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:feColorMatrix');

TP.svg.feColorMatrix.addTraits(TP.svg.Element);

TP.svg.feColorMatrix.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.feColorMatrix.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ========================================================================
//  TP.svg.feComponentTransfer
//  ========================================================================

/**
 * @type {TP.svg.feComponentTransfer}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:feComponentTransfer');

TP.svg.feComponentTransfer.addTraits(TP.svg.Element);

TP.svg.feComponentTransfer.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.feComponentTransfer.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ========================================================================
//  TP.svg.feComposite
//  ========================================================================

/**
 * @type {TP.svg.feComposite}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:feComposite');

TP.svg.feComposite.addTraits(TP.svg.Element);

TP.svg.feComposite.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.feComposite.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ========================================================================
//  TP.svg.feConvolveMatrix
//  ========================================================================

/**
 * @type {TP.svg.feConvolveMatrix}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:feConvolveMatrix');

TP.svg.feConvolveMatrix.addTraits(TP.svg.Element);

TP.svg.feConvolveMatrix.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.feConvolveMatrix.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ========================================================================
//  TP.svg.feDiffuseLighting
//  ========================================================================

/**
 * @type {TP.svg.feDiffuseLighting}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:feDiffuseLighting');

TP.svg.feDiffuseLighting.addTraits(TP.svg.Element);

TP.svg.feDiffuseLighting.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.feDiffuseLighting.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ========================================================================
//  TP.svg.feDisplacementMap
//  ========================================================================

/**
 * @type {TP.svg.feDisplacementMap}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:feDisplacementMap');

TP.svg.feDisplacementMap.addTraits(TP.svg.Element);

TP.svg.feDisplacementMap.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.feDisplacementMap.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ========================================================================
//  TP.svg.feFlood
//  ========================================================================

/**
 * @type {TP.svg.feFlood}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:feFlood');

TP.svg.feFlood.addTraits(TP.svg.Element);

TP.svg.feFlood.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.feFlood.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ========================================================================
//  TP.svg.feGaussianBlur
//  ========================================================================

/**
 * @type {TP.svg.feGaussianBlur}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:feGaussianBlur');

TP.svg.feGaussianBlur.addTraits(TP.svg.Element);

TP.svg.feGaussianBlur.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.feGaussianBlur.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ========================================================================
//  TP.svg.feImage
//  ========================================================================

/**
 * @type {TP.svg.feImage}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:feImage');

TP.svg.feImage.addTraits(TP.svg.Element);

TP.svg.feImage.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.feImage.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ========================================================================
//  TP.svg.feMerge
//  ========================================================================

/**
 * @type {TP.svg.feMerge}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:feMerge');

TP.svg.feMerge.addTraits(TP.svg.Element);

TP.svg.feMerge.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.feMerge.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ========================================================================
//  TP.svg.feMergeNode
//  ========================================================================

/**
 * @type {TP.svg.feMergeNode}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:feMergeNode');

TP.svg.feMergeNode.addTraits(TP.svg.Element);

TP.svg.feMergeNode.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.feMergeNode.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ========================================================================
//  TP.svg.feMorphology
//  ========================================================================

/**
 * @type {TP.svg.feMorphology}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:feMorphology');

TP.svg.feMorphology.addTraits(TP.svg.Element);

TP.svg.feMorphology.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.feMorphology.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ========================================================================
//  TP.svg.feOffset
//  ========================================================================

/**
 * @type {TP.svg.feOffset}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:feOffset');

TP.svg.feOffset.addTraits(TP.svg.Element);

TP.svg.feOffset.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.feOffset.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ========================================================================
//  TP.svg.feSpecularLighting
//  ========================================================================

/**
 * @type {TP.svg.feSpecularLighting}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:feSpecularLighting');

TP.svg.feSpecularLighting.addTraits(TP.svg.Element);

TP.svg.feSpecularLighting.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.feSpecularLighting.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ========================================================================
//  TP.svg.feTile
//  ========================================================================

/**
 * @type {TP.svg.feTile}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:feTile');

TP.svg.feTile.addTraits(TP.svg.Element);

TP.svg.feTile.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.feTile.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ========================================================================
//  TP.svg.feTurbulence
//  ========================================================================

/**
 * @type {TP.svg.feTurbulence}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:feTurbulence');

TP.svg.feTurbulence.addTraits(TP.svg.Element);

TP.svg.feTurbulence.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.feTurbulence.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ========================================================================
//  TP.svg.feDistantLight
//  ========================================================================

/**
 * @type {TP.svg.feDistantLight}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:feDistantLight');

TP.svg.feDistantLight.addTraits(TP.svg.Element);

TP.svg.feDistantLight.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.feDistantLight.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ========================================================================
//  TP.svg.fePointLight
//  ========================================================================

/**
 * @type {TP.svg.fePointLight}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:fePointLight');

TP.svg.fePointLight.addTraits(TP.svg.Element);

TP.svg.fePointLight.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.fePointLight.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ========================================================================
//  TP.svg.feSpotLight
//  ========================================================================

/**
 * @type {TP.svg.feSpotLight}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:feSpotLight');

TP.svg.feSpotLight.addTraits(TP.svg.Element);

TP.svg.feSpotLight.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.feSpotLight.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ========================================================================
//  TP.svg.feFuncR
//  ========================================================================

/**
 * @type {TP.svg.feFuncR}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:feFuncR');

TP.svg.feFuncR.addTraits(TP.svg.Element);

TP.svg.feFuncR.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.feFuncR.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ========================================================================
//  TP.svg.feFuncG
//  ========================================================================

/**
 * @type {TP.svg.feFuncG}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:feFuncG');

TP.svg.feFuncG.addTraits(TP.svg.Element);

TP.svg.feFuncG.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.feFuncG.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ========================================================================
//  TP.svg.feFuncB
//  ========================================================================

/**
 * @type {TP.svg.feFuncB}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:feFuncB');

TP.svg.feFuncB.addTraits(TP.svg.Element);

TP.svg.feFuncB.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.feFuncB.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ========================================================================
//  TP.svg.feFuncA
//  ========================================================================

/**
 * @type {TP.svg.feFuncA}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:feFuncA');

TP.svg.feFuncA.addTraits(TP.svg.Element);

TP.svg.feFuncA.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.feFuncA.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
