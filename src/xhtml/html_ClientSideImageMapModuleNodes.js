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
//  TP.html.area
//  ========================================================================

/**
 * @type {TP.html.area}
 * @summary 'area' tag. A clickable area.
 */

//  ------------------------------------------------------------------------

TP.html.Focused.defineSubtype('area');

TP.html.area.Type.set('booleanAttrs', TP.ac('noHref'));

TP.html.area.Type.set('uriAttrs', TP.ac('href'));

TP.html.area.addTraits(TP.dom.EmptyElementNode);

TP.html.area.Type.resolveTraits(
        TP.ac('booleanAttrs', 'uriAttrs'),
        TP.html.area);

TP.html.area.Inst.resolveTraits(
        TP.ac('getContent', 'setContent'),
        TP.dom.EmptyElementNode);

//  ========================================================================
//  TP.html.map
//  ========================================================================

/**
 * @type {TP.html.map}
 * @summary 'map' tag. Client-side image map.
 */

//  ------------------------------------------------------------------------

//  ID is required in this subtype.
TP.html.Attrs.defineSubtype('map');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
