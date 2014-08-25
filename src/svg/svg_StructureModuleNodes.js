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
//  TP.svg.svg
//  ========================================================================

/**
 * @type {TP.svg.svg}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:svg');

TP.svg.svg.addTraitsFrom(TP.svg.Element);

TP.svg.svg.set('uriAttrs', TP.ac('clip-path', 'cursor', 'filter', 'mask'));

//  ========================================================================
//  TP.svg.g
//  ========================================================================

/**
 * @type {TP.svg.g}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:g');

TP.svg.g.addTraitsFrom(TP.svg.Element);

TP.svg.g.set('uriAttrs', TP.ac('clip-path', 'cursor', 'filter', 'mask'));

//  ========================================================================
//  TP.svg.defs
//  ========================================================================

/**
 * @type {TP.svg.defs}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:defs');

TP.svg.defs.addTraitsFrom(TP.svg.Element);

TP.svg.defs.set('uriAttrs', TP.ac('clip-path', 'cursor', 'filter', 'mask'));

//  ========================================================================
//  TP.svg.desc
//  ========================================================================

/**
 * @type {TP.svg.desc}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:desc');

TP.svg.desc.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.title
//  ========================================================================

/**
 * @type {TP.svg.title}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:title');

TP.svg.title.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.metadata
//  ========================================================================

/**
 * @type {TP.svg.metadata}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:metadata');

TP.svg.metadata.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.symbol
//  ========================================================================

/**
 * @type {TP.svg.symbol}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:symbol');

TP.svg.symbol.addTraitsFrom(TP.svg.Element);

TP.svg.symbol.set('uriAttrs', TP.ac('clip-path', 'cursor', 'filter', 'mask'));

//  ========================================================================
//  TP.svg.use
//  ========================================================================

/**
 * @type {TP.svg.use}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:use');

TP.svg.use.addTraitsFrom(TP.svg.Element);

TP.svg.use.set('uriAttrs', TP.ac('clip-path', 'cursor', 'filter', 'mask'));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
