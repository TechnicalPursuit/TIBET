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
//  TP.svg.path
//  ========================================================================

/**
 * @type {TP.svg.path}
 */

//  ------------------------------------------------------------------------

TP.svg.Shape.defineSubtype('path');

TP.svg.Shape.Type.set('uriAttrs',
        TP.ac('clip-path', 'cursor', 'filter', 'marker', 'marker-start',
        'marker-mid', 'marker-end', 'mask', 'fill', 'stroke'));

//  ========================================================================
//  TP.svg.rect
//  ========================================================================

/**
 * @type {TP.svg.rect}
 */

//  ------------------------------------------------------------------------

TP.svg.Shape.defineSubtype('rect');

//  ========================================================================
//  TP.svg.circle
//  ========================================================================

/**
 * @type {TP.svg.circle}
 */

//  ------------------------------------------------------------------------

TP.svg.Shape.defineSubtype('circle');

//  ========================================================================
//  TP.svg.line
//  ========================================================================

/**
 * @type {TP.svg.line}
 */

//  ------------------------------------------------------------------------

TP.svg.Shape.defineSubtype('line');

TP.svg.line.Type.set('uriAttrs',
        TP.ac('clip-path', 'cursor', 'filter', 'marker', 'marker-start',
        'marker-mid', 'marker-end', 'mask', 'fill', 'stroke'));

//  ========================================================================
//  TP.svg.ellipse
//  ========================================================================

/**
 * @type {TP.svg.ellipse}
 */

//  ------------------------------------------------------------------------

TP.svg.Shape.defineSubtype('ellipse');

//  ========================================================================
//  TP.svg.polyline
//  ========================================================================

/**
 * @type {TP.svg.polyline}
 */

//  ------------------------------------------------------------------------

TP.svg.Shape.defineSubtype('polyline');

TP.svg.polyline.Type.set('uriAttrs',
        TP.ac('clip-path', 'cursor', 'filter', 'marker', 'marker-start',
        'marker-mid', 'marker-end', 'mask', 'fill', 'stroke'));

//  ========================================================================
//  TP.svg.polygon
//  ========================================================================

/**
 * @type {TP.svg.polygon}
 */

//  ------------------------------------------------------------------------

TP.svg.Shape.defineSubtype('polygon');

TP.svg.polygon.Type.set('uriAttrs',
        TP.ac('clip-path', 'cursor', 'filter', 'marker', 'marker-start',
        'marker-mid', 'marker-end', 'mask', 'fill', 'stroke'));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
