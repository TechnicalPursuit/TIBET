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
//  TP.svg.text
//  ========================================================================

/**
 * @type {TP.svg.text}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:text');

TP.svg.text.addTraitsFrom(TP.svg.Element);

TP.svg.text.Type.set('uriAttrs',
        TP.ac('clip-path', 'cursor', 'filter', 'mask', 'fill', 'stroke'));

//  ========================================================================
//  TP.svg.tspan
//  ========================================================================

/**
 * @type {TP.svg.tspan}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:tspan');

TP.svg.tspan.addTraitsFrom(TP.svg.Element);

TP.svg.tspan.Type.set('uriAttrs', TP.ac('fill', 'stroke'));

//  ========================================================================
//  TP.svg.tref
//  ========================================================================

/**
 * @type {TP.svg.tref}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:tref');

TP.svg.tref.addTraitsFrom(TP.svg.Element);

TP.svg.tref.Type.set('uriAttrs', TP.ac('fill', 'stroke', 'xlink:href'));

//  ========================================================================
//  TP.svg.textPath
//  ========================================================================

/**
 * @type {TP.svg.textPath}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:textpath');

TP.svg.textpath.addTraitsFrom(TP.svg.Element);

TP.svg.textpath.Type.set('uriAttrs', TP.ac('fill', 'stroke', 'xlink:href'));

//  ========================================================================
//  TP.svg.altGlyph
//  ========================================================================

/**
 * @type {TP.svg.altGlyph}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:altGlyph');

TP.svg.altGlyph.addTraitsFrom(TP.svg.Element);

TP.svg.altGlyph.Type.set('uriAttrs', TP.ac('fill', 'stroke', 'xlink:href'));

//  ========================================================================
//  TP.svg.altGlyphDef
//  ========================================================================

/**
 * @type {TP.svg.altGlyphDef}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:altGlyphDef');

TP.svg.altGlyphDef.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.altGlyphItem
//  ========================================================================

/**
 * @type {TP.svg.altGlyphItem}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:altGlyphItem');

TP.svg.altGlyphItem.addTraitsFrom(TP.svg.Element);

//  ========================================================================
//  TP.svg.glyphRef
//  ========================================================================

/**
 * @type {TP.svg.glyphRef}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('svg:glyphRef');

TP.svg.glyphRef.addTraitsFrom(TP.svg.Element);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
