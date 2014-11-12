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
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:filter');

TP.svg.filter.addTraitsFrom(TP.svg.Element);

TP.svg.filter.Type.set('uriAttrs', TP.ac('xlink:href'));

//  ========================================================================
//  TP.svg.feBlend
//  ========================================================================

/**
 * @type {TP.svg.feBlend}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:feBlend');

TP.svg.feBlend.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.feColorMatrix
//  ========================================================================

/**
 * @type {TP.svg.feColorMatrix}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:feColorMatrix');

TP.svg.feColorMatrix.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.feComponentTransfer
//  ========================================================================

/**
 * @type {TP.svg.feComponentTransfer}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:feComponentTransfer');

TP.svg.feComponentTransfer.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.feComposite
//  ========================================================================

/**
 * @type {TP.svg.feComposite}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:feComposite');

TP.svg.feComposite.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.feConvolveMatrix
//  ========================================================================

/**
 * @type {TP.svg.feConvolveMatrix}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:feConvolveMatrix');

TP.svg.feConvolveMatrix.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.feDiffuseLighting
//  ========================================================================

/**
 * @type {TP.svg.feDiffuseLighting}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:feDiffuseLighting');

TP.svg.feDiffuseLighting.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.feDisplacementMap
//  ========================================================================

/**
 * @type {TP.svg.feDisplacementMap}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:feDisplacementMap');

TP.svg.feDisplacementMap.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.feFlood
//  ========================================================================

/**
 * @type {TP.svg.feFlood}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:feFlood');

TP.svg.feFlood.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.feGaussianBlur
//  ========================================================================

/**
 * @type {TP.svg.feGaussianBlur}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:feGaussianBlur');

TP.svg.feGaussianBlur.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.feImage
//  ========================================================================

/**
 * @type {TP.svg.feImage}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:feImage');

TP.svg.feImage.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.feMerge
//  ========================================================================

/**
 * @type {TP.svg.feMerge}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:feMerge');

TP.svg.feMerge.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.feMergeNode
//  ========================================================================

/**
 * @type {TP.svg.feMergeNode}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:feMergeNode');

TP.svg.feMergeNode.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.feMorphology
//  ========================================================================

/**
 * @type {TP.svg.feMorphology}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:feMorphology');

TP.svg.feMorphology.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.feOffset
//  ========================================================================

/**
 * @type {TP.svg.feOffset}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:feOffset');

TP.svg.feOffset.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.feSpecularLighting
//  ========================================================================

/**
 * @type {TP.svg.feSpecularLighting}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:feSpecularLighting');

TP.svg.feSpecularLighting.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.feTile
//  ========================================================================

/**
 * @type {TP.svg.feTile}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:feTile');

TP.svg.feTile.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.feTurbulence
//  ========================================================================

/**
 * @type {TP.svg.feTurbulence}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:feTurbulence');

TP.svg.feTurbulence.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.feDistantLight
//  ========================================================================

/**
 * @type {TP.svg.feDistantLight}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:feDistantLight');

TP.svg.feDistantLight.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.fePointLight
//  ========================================================================

/**
 * @type {TP.svg.fePointLight}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:fePointLight');

TP.svg.fePointLight.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.feSpotLight
//  ========================================================================

/**
 * @type {TP.svg.feSpotLight}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:feSpotLight');

TP.svg.feSpotLight.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.feFuncR
//  ========================================================================

/**
 * @type {TP.svg.feFuncR}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:feFuncR');

TP.svg.feFuncR.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.feFuncG
//  ========================================================================

/**
 * @type {TP.svg.feFuncG}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:feFuncG');

TP.svg.feFuncG.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.feFuncB
//  ========================================================================

/**
 * @type {TP.svg.feFuncB}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:feFuncB');

TP.svg.feFuncB.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.feFuncA
//  ========================================================================

/**
 * @type {TP.svg.feFuncA}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:feFuncA');

TP.svg.feFuncA.addTraitsFrom(TP.svg.Element);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
