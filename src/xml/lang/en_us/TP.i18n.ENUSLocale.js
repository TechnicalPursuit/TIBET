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
 * @type {TP.i18n.ENUSLocale}
 * @summary TP.i18n.ENUSLocale provides support for the U.S. English language
 *     and related localizations. This is the default locale used when no other
 *     locale is specified and the user's language code doesn't resolve to an
 *     alternative locale.
 */

//  ------------------------------------------------------------------------

TP.i18n.ENLocale.defineSubtype('ENUSLocale');

TP.i18n.ENUSLocale.Type.defineAttribute('countryCode', 'us');

TP.i18n.Locale.registerLocale(TP.i18n.ENUSLocale);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
