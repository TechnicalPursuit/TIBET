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
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:linearGradient');

TP.svg.linearGradient.addTraitsFrom(TP.svg.Element);

TP.svg.linearGradient.Type.set('uriAttrs', TP.ac('xlink:href'));

//  ========================================================================
//  TP.svg.radialGradient
//  ========================================================================

/**
 * @type {TP.svg.radialGradient}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:radialGradient');

TP.svg.radialGradient.addTraitsFrom(TP.svg.Element);

TP.svg.radialGradient.Type.set('uriAttrs', TP.ac('xlink:href'));

//  ========================================================================
//  TP.svg.stop
//  ========================================================================

/**
 * @type {TP.svg.stop}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:stop');

TP.svg.stop.addTraitsFrom(TP.svg.Element);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
