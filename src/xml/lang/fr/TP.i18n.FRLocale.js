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
 * @type {TP.i18n.FRLocale}
 * @summary TP.i18n.FRLocale provides support for the French language and
 *     related localizations.
 */

//  ------------------------------------------------------------------------

TP.i18n.Locale.defineSubtype('FRLocale');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.i18n.FRLocale.Type.defineAttribute('langCode', 'fr');

TP.i18n.FRLocale.Type.defineAttribute('thousandsSeparator', '.');
TP.i18n.FRLocale.Type.defineAttribute('decimalPoint', ',');

TP.i18n.Locale.registerLocale(TP.i18n.FRLocale);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
