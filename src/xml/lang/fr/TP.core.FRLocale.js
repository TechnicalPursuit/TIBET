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
 * @type {TP.core.FRLocale}
 * @summary TP.core.FRLocale provides support for the French language and
 *     related localizations.
 */

//  ------------------------------------------------------------------------

TP.core.Locale.defineSubtype('FRLocale');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.FRLocale.Type.defineAttribute('langCode', 'fr');

TP.core.FRLocale.Type.defineAttribute('thousandsSeparator', '.');
TP.core.FRLocale.Type.defineAttribute('decimalPoint', ',');

TP.core.Locale.registerLocale(TP.core.FRLocale);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
