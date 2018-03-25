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
//  TP.svg.color_profile
//  ========================================================================

/**
 * @type {TP.svg.color_profile}
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('svg:color_profile');

TP.svg.color_profile.addTraits(TP.svg.Element);

TP.svg.color_profile.Type.set('uriAttrs', TP.ac('xlink:href'));

//  For markup generation purposes, this type's 'localName' uses a dash
//  ('-'), not an underscore ('_') like we had to use for the type name.
TP.svg.color_profile.set('localName', 'color-profile');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
