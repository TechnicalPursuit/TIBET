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
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:text');

TP.svg.text.addTraits(TP.svg.Element);

TP.svg.text.Type.set('uriAttrs',
        TP.ac('clip-path', 'cursor', 'filter', 'mask', 'fill', 'stroke'));

//  ========================================================================
//  TP.svg.tspan
//  ========================================================================

/**
 * @type {TP.svg.tspan}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:tspan');

TP.svg.tspan.addTraits(TP.svg.Element);

TP.svg.tspan.Type.set('uriAttrs', TP.ac('fill', 'stroke'));

//  ========================================================================
//  TP.svg.tref
//  ========================================================================

/**
 * @type {TP.svg.tref}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:tref');

TP.svg.tref.addTraits(TP.svg.Element);

TP.svg.tref.Type.set('uriAttrs', TP.ac('fill', 'stroke', 'xlink:href'));

//  ========================================================================
//  TP.svg.textPath
//  ========================================================================

/**
 * @type {TP.svg.textPath}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:textpath');

TP.svg.textpath.addTraits(TP.svg.Element);

TP.svg.textpath.Type.set('uriAttrs', TP.ac('fill', 'stroke', 'xlink:href'));

//  ========================================================================
//  TP.svg.altGlyph
//  ========================================================================

/**
 * @type {TP.svg.altGlyph}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:altGlyph');

TP.svg.altGlyph.addTraits(TP.svg.Element);

TP.svg.altGlyph.Type.set('uriAttrs', TP.ac('fill', 'stroke', 'xlink:href'));

//  ========================================================================
//  TP.svg.altGlyphDef
//  ========================================================================

/**
 * @type {TP.svg.altGlyphDef}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:altGlyphDef');

TP.svg.altGlyphDef.addTraits(TP.svg.Element);

//  ========================================================================
//  TP.svg.altGlyphItem
//  ========================================================================

/**
 * @type {TP.svg.altGlyphItem}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:altGlyphItem');

TP.svg.altGlyphItem.addTraits(TP.svg.Element);

//  ========================================================================
//  TP.svg.glyphRef
//  ========================================================================

/**
 * @type {TP.svg.glyphRef}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:glyphRef');

TP.svg.glyphRef.addTraits(TP.svg.Element);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
