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
//  TP.html.base
//  ========================================================================

/**
 * @type {TP.html.base}
 * @summary 'base' tag. Document base URI.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('base');

TP.html.base.addTraits(TP.dom.EmptyElementNode);

TP.html.base.Inst.resolveTraits(
        TP.ac('getContent', 'setContent'),
        TP.dom.EmptyElementNode);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
