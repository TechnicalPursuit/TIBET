//  ========================================================================
/*
NAME:   svg_TextModuleNodes.js
AUTH:   William J. Edney (wje)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.

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

TP.svg.text.set('uriAttrs',
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

TP.svg.tspan.set('uriAttrs', TP.ac('fill', 'stroke'));

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

TP.svg.tref.set('uriAttrs', TP.ac('fill', 'stroke', 'xlink:href'));

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

TP.svg.textpath.set('uriAttrs', TP.ac('fill', 'stroke', 'xlink:href'));

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

TP.svg.altGlyph.set('uriAttrs', TP.ac('fill', 'stroke', 'xlink:href'));

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
