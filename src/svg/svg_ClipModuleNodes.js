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
//  TP.svg.clipPath
//  ========================================================================

/**
 * @type {TP.svg.clipPath}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:clipPath');

TP.svg.clipPath.addTraits(TP.svg.Element);

TP.svg.clipPath.Type.set('uriAttrs',
                            TP.ac('clip-path', 'cursor', 'filter', 'mask'));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
