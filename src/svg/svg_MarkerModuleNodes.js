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
//  TP.svg.marker
//  ========================================================================

/**
 * @type {TP.svg.marker}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:marker');

TP.svg.marker.addTraits(TP.svg.Element);

TP.svg.marker.Type.resolveTrait('cmdRunContent', TP.svg.Element);
TP.svg.marker.Inst.resolveTrait('isReadyToRender', TP.svg.Element);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.svg.marker.Type.set('uriAttrs',
        TP.ac('clip-path', 'cursor', 'filter', 'mask'));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
