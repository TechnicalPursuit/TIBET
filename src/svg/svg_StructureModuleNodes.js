//  ========================================================================
/*
NAME:   svg_StructureModuleNodes.js
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
