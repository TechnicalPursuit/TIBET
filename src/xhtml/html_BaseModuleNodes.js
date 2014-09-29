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
//  html:base
//  ========================================================================

/**
 * @type {html:base}
 * @synopsis 'base' tag. Document base URI.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('base');

TP.html.base.addTraitsFrom(TP.core.EmptyElementNode);
TP.html.base.Inst.resolveTraits(
        TP.ac('getContent', 'setContent'),
        TP.core.EmptyElementNode);

//  Resolve the traits right away as type methods of this type are called during
//  content processing when we only have type methods involved.
TP.html.base.executeTraitResolution();

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
