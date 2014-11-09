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
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:animate');

TP.svg.animate.addTraitsFrom(TP.svg.Element);

TP.svg.animate.Type.set('uriAttrs', TP.ac('xlink:href'));

//  ========================================================================
//  TP.svg.set
//  ========================================================================

/**
 * @type {TP.svg.set}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:set');

TP.svg.set.addTraitsFrom(TP.svg.Element);

TP.svg.set.Type.set('uriAttrs', TP.ac('xlink:href'));

//  ========================================================================
//  TP.svg.animateMotion
//  ========================================================================

/**
 * @type {TP.svg.animateMotion}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:animateMotion');

TP.svg.animateMotion.addTraitsFrom(TP.svg.Element);

TP.svg.animateMotion.Type.set('uriAttrs', TP.ac('xlink:href'));

//  ========================================================================
//  TP.svg.animateTransform
//  ========================================================================

/**
 * @type {TP.svg.animateTransform}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:animateTransform');

TP.svg.animateTransform.addTraitsFrom(TP.svg.Element);

TP.svg.animateTransform.Type.set('uriAttrs', TP.ac('xlink:href'));

//  ========================================================================
//  TP.svg.animateColor
//  ========================================================================

/**
 * @type {TP.svg.animateColor}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:animateColor');

TP.svg.animateColor.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.mpath
//  ========================================================================

/**
 * @type {TP.svg.mpath}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:mpath');

TP.svg.mpath.addTraitsFrom(TP.svg.Element);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
