//  ========================================================================
/*
NAME:   TP.core.DELocale.js
AUTH:   Scott Shattuck (ss)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.

*/
//  ------------------------------------------------------------------------

/**
 * @type {TP.core.DELocale}
 * @synopsis TP.core.DELocale provides support for the German language and
 *     related localizations.
 */

//  ------------------------------------------------------------------------

TP.core.Locale.defineSubtype('DELocale');

TP.core.DELocale.Type.defineAttribute('langCode', 'de');

TP.core.DELocale.Type.defineAttribute('falseStrings',
    TP.ac('0', '', 'nein', 'Nein', 'NEIN', 'n', 'N',
        'f', 'F', 'falsch', 'Falsch', 'FALSCH'));

TP.core.DELocale.Type.defineAttribute('longMonthNames',
    TP.ac('Januar', 'Februar', 'Marz', 'April', 'Mai', 'Juni', 'Juli',
        'August', 'September', 'Oktober', 'November', 'Dezember'));

TP.core.DELocale.Type.defineAttribute('shortMonthNames',
    TP.ac('Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul',
        'Aug', 'Sep', 'Okt', 'Nov', 'Dez'));

TP.core.DELocale.Type.defineAttribute('longWeekdayNames',
    TP.ac('Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag',
        'Frietag', 'Samstag'));

//  TODO:   probably wrong, translation help appreciated :)
TP.core.DELocale.Type.defineAttribute('shortWeekdayNames',
    TP.ac('Son', 'Mon', 'Die', 'Mit', 'Don', 'Fri', 'Sam'));

//  TODO:   rework the locale registration process so this isn't necessary.
TP.core.Locale.registerLocale(TP.core.DELocale);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
