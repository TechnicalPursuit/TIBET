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
 * @type {TP.i18n.ENLocale}
 * @summary TP.i18n.ENLocale provides support for the English language,
 *     regardless of any specific country. This is the default locale used when
 *     no other locale is specified and the user's language and country codes
 *     doesn't resolve to an alternative locale.
 */

//  ------------------------------------------------------------------------

TP.i18n.Locale.defineSubtype('ENLocale');

TP.i18n.ENLocale.Type.defineAttribute('langCode', 'en');

TP.i18n.Locale.registerLocale(TP.i18n.ENLocale);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
