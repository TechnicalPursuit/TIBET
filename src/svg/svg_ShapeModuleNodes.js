//  ========================================================================
/*
NAME:   svg_ShapeModuleNodes.js
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
//  TP.svg.path
//  ========================================================================

/**
 * @type {TP.svg.path}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.svg.Shape.defineSubtype('path');

TP.svg.Shape.set('uriAttrs',
        TP.ac('clip-path', 'cursor', 'filter', 'marker', 'marker-start',
        'marker-mid', 'marker-end', 'mask', 'fill', 'stroke'));

//  ========================================================================
//  TP.svg.rect
//  ========================================================================

/**
 * @type {TP.svg.rect}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.svg.Shape.defineSubtype('rect');

//  ========================================================================
//  TP.svg.circle
//  ========================================================================

/**
 * @type {TP.svg.circle}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.svg.Shape.defineSubtype('circle');

//  ========================================================================
//  TP.svg.line
//  ========================================================================

/**
 * @type {TP.svg.line}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.svg.Shape.defineSubtype('line');

TP.svg.line.set('uriAttrs',
        TP.ac('clip-path', 'cursor', 'filter', 'marker', 'marker-start',
        'marker-mid', 'marker-end', 'mask', 'fill', 'stroke'));

//  ========================================================================
//  TP.svg.ellipse
//  ========================================================================

/**
 * @type {TP.svg.ellipse}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.svg.Shape.defineSubtype('ellipse');

//  ========================================================================
//  TP.svg.polyline
//  ========================================================================

/**
 * @type {TP.svg.polyline}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.svg.Shape.defineSubtype('polyline');

TP.svg.polyline.set('uriAttrs',
        TP.ac('clip-path', 'cursor', 'filter', 'marker', 'marker-start',
        'marker-mid', 'marker-end', 'mask', 'fill', 'stroke'));

//  ========================================================================
//  TP.svg.polygon
//  ========================================================================

/**
 * @type {TP.svg.polygon}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.svg.Shape.defineSubtype('polygon');

TP.svg.polygon.set('uriAttrs',
        TP.ac('clip-path', 'cursor', 'filter', 'marker', 'marker-start',
        'marker-mid', 'marker-end', 'mask', 'fill', 'stroke'));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
