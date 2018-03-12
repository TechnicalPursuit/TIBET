//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/**
 * @type {TP.tibet.template}
 * @summary A subtype of TP.core.CustomTag that knows how to define XML
 *     templates.
 */

//  ------------------------------------------------------------------------

TP.core.CustomTag.defineSubtype('tibet:template');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  This tag has no associated CSS. Note how these properties are TYPE_LOCAL, by
//  design.
TP.tibet.template.defineAttribute('styleURI', TP.NO_RESULT);
TP.tibet.template.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
