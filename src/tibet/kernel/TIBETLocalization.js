//  ========================================================================
/*
NAME:   TIBETLocalization.js
AUTH:   Scott Shattuck (ss), William J. Edney (wje)
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
The types and methods in this file are here to support localization in a variety
of forms. Of particular interest is providing support for localizing strings,
data formats, and data validations for built-in types like Number, Boolean, and
Date.

Extension types such as phone numbers, social security numbers, and other types
which are locale-specific are found in the xml/lang section of the library.
These are often loaded using the import functionality in TIBET to let the system
load specific "language packs" on demand. Much of the functionality in those
modules relies on TIBET "type clusters" which return a locale-specific subtype
from a top-level type's construct() call.

The TIBET object maintains the "current locale" while the various TP.core.Locale
subtypes provide the actual functionality for localization. The language code for
the current locale is used by "localized" types such as TP.core.PhoneNumber to
determine the specific subtype to use.

Methods on the TIBET hash for aqcuiring the current "source language" and the
current "target language" provide the default values translation.
*/

//  ========================================================================
//  TIBET Locale Extensions
//  ========================================================================

//  the default locale, which is configured lazily to support setting via
//  the application startup process
TP.sys.defineAttribute('locale');

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getLocale',
function() {

    /**
     * @name getLocale
     * @synopsis Return the current locale type.
     * @returns {TP.lang.RootObject.<TP.core.Locale>} A TP.core.Locale subtype
     *     type object.
     */

    var locale;

    locale = this.$get('locale');

    if (TP.notValid(locale)) {
        return TP.core.Locale;
    }

    return locale;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('setLocale',
function(aLocale) {

    /**
     * @name setLocale
     * @synopsis Sets the current locale, which is used by numerous types to
     *     provide localization support.
     * @param {TP.lang.RootObject.<TP.core.Locale>} A TP.core.Locale subtype
     *     type object.
     */

    var lang,
        locale;

    if (TP.isEmpty(aLocale)) {
        //  no locale? request for default one based on users language when
        //  possible, or US-EN when not available.
        lang = TP.sys.env('tibet.xmllang', 'en-us').toLowerCase();

        locale = TP.core.Locale.getLocaleById(lang);

        if (TP.notValid(locale)) {
            locale = TP.core.Locale;
        }
    } else {
        if (TP.isString(aLocale)) {
            //  this might be null, but clearing the value will cause the
            //  getLocale() routine to return the default
            locale = TP.core.Locale.getLocaleById(aLocale);
        } else if (TP.canInvoke(aLocale, 'localizeString')) {
            locale = aLocale;
        } else {
            this.raise('TP.sig.InvalidParameter', arguments);

            locale = TP.core.Locale;
        }
    }

    this.$set('locale', locale);

    return this;
});

//  ========================================================================
//  Object Extensions
//  ========================================================================

TP.defineCommonMethod('localize',
function(aLocale, sourceLocale, forceRefresh) {

    /**
     * @name localize
     * @synopsis Returns a localized string version of the receiver.
     * @param {TP.core.Locale|String} aLocale The locale to use for resolution.
     * @param {TP.core.Locale|String} sourceLocale A source xml:lang or
     *     TP.core.Locale defining the language the string is now in. Defaults
     *     to getTargetLanguage() which is based on the current locale's
     *     language-country value.
     * @param {Boolean} forceRefresh True to force the new object to be built
     *     from a refreshed resource bundle.
     * @returns {Object} A localized version of the source object.
     * @todo
     */

    var locale,
        localeObj;

    TP.debug('break.locale_localize');

    locale = TP.ifInvalid(aLocale, TP.sys.getLocale());

    //  allow passage of the locale's ID string
    if (TP.isString(locale)) {
        localeObj = TP.core.Locale.getLocaleById(locale);
    } else {
        localeObj = locale;
    }

    if (TP.notValid(localeObj)) {
        //  The best we can do is log a warning and return the original
        //  object unlocalized.

        TP.ifWarn() ?
            TP.warn('Couldn\'t find locale for: ' + locale,
                    TP.LOG,
                    arguments) : 0;

        return this;
    }

    return localeObj.localize(this, sourceLocale, forceRefresh);
});

//  ========================================================================
//  TP.core.Locale
//  ========================================================================

/**
 * @type {TP.core.Locale}
 * @synopsis TP.core.Locale is the supertype from which all locales inherit.
 *     Locales are the control point for localization in TP.sys.
 * @description TP.core.Locales are the focal point of TIBET's
 *     internationalization system. Each locale is associated with a
 *     language/country code as specified in ISO 639. Therefore, the
 *     TP.core.Locale for U.S. English is registered under the key 'en-us'. If a
 *     locale existed for French Canadian, it would be registered under 'fr-ca'.
 *     
 *     The TIBET boot property 'locale' defines the default locale to load when
 *     an application starts. If this value is not specified it defaults to
 *     'en-us'.
 *     
 *     When the current locale is set (via TP.sys.setLocale(aLocale)), it takes
 *     over responsibility for several localization functions including offering
 *     support for string translation, data formats, and data validations. Also
 *     supported are parse routines specific to dealing with Boolean, Number,
 *     Date, and String input.
 *     
 *     Additional support for localization of content is provided by the
 *     TP.core.URI type's rewrite function, which uses the current locale's
 *     language code as a qualifier for locating URI aliases and other mapping
 *     data. See the TP.core.URI type for more information.
 * @todo
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core:Locale');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineAttribute('langCode', '');
TP.core.Locale.Type.defineAttribute('countryCode', '');

//  Boolean defaults
TP.core.Locale.Type.defineAttribute('falseStrings',
            TP.ac('0', '', 'n', 'N', 'no', 'No', 'NO', 'f', 'F',
                'false', 'False', 'FALSE'));

TP.core.Locale.Type.defineAttribute('trueStrings',
            TP.ac('1', 'y', 'Y', 'yes', 'Yes', 'YES', 't', 'T',
                'true', 'True', 'TRUE'));

//  Date defaults
TP.core.Locale.Type.defineAttribute('longMonthNames',
            TP.ac('January', 'February', 'March', 'April',
                'May', 'June', 'July', 'August', 'September', 'October',
                'November', 'December'));

TP.core.Locale.Type.defineAttribute('longWeekdayNames',
            TP.ac('Sunday', 'Monday', 'Tuesday',
                'Wednesday', 'Thursday', 'Friday', 'Saturday'));

TP.core.Locale.Type.defineAttribute('shortMonthNames',
            TP.ac('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'));

TP.core.Locale.Type.defineAttribute('shortWeekdayNames',
            TP.ac('Sun', 'Mon', 'Tue', 'Wed', 'Thu',
                'Fri', 'Sat'));

TP.core.Locale.Type.defineAttribute('dateFormat',
    '%{yyyy}-%{mm}-%{dd}T%{hhi}:%{mmn}:%{ss}Z');    //  iso UTC
    //'%{dddd}, %{mmmm} %{dd}, %{yyyy} %{hhi}:%{mmn}:%{ss}'); // utc

//  Number defaults
TP.core.Locale.Type.defineAttribute('numberFormat', '#{#,###}');
TP.core.Locale.Type.defineAttribute('thousandsMatcher', /,/g);
TP.core.Locale.Type.defineAttribute('thousandsSeparator', ',');
TP.core.Locale.Type.defineAttribute('decimalPoint', '.');
TP.core.Locale.Type.defineAttribute('thousandsGroupSize', 3);

//  the ISO key, which is the language code plus country code if the country code
//  isn't empty.
TP.core.Locale.Type.defineAttribute('langID');

//  the current XML node containing localized string translations
TP.core.Locale.Type.defineAttribute('stringXML');

//  string value of the current string table, for use in regex testing
TP.core.Locale.Type.defineAttribute('stringSTR');

TP.core.Locale.Type.defineAttribute('locales', TP.hc());

//  the language code for this locale. this value is typically set by
//  the locale as part of the type's definition. we default them to
//  empty strings to avoid getting null values when building out our ID
//  etc.
//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('getISOKey',
function() {

    /**
     * @name getISOKey
     * @synopsis Returns the receiver's ISO key, for a Locale the language code
     *     plus country code if the country code isn't empty.
     * @returns {String} The receiver's language code.
     */

    var id,
        country;

    if (TP.notEmpty(id = this.get('langID'))) {
        return id;
    }

    if (TP.notEmpty(country = this.$get('countryCode'))) {
        id = TP.join(this.get('langCode'), '-', country);
    } else {
        id = this.get('langCode');
    }

    this.$set('langID', id);

    return id;
});

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('getLocaleById',
function(aLocaleID) {

    /**
     * @name getLocaleById
     * @synopsis Returns the TP.core.Locale subtype registered under the
     *     language code provided. Note that the language code should be the
     *     full four-character language code, such as en-us or fr-ca when
     *     possible, to ensure proper resolution.
     * @param {String} aLocaleID The language-country code to look up.
     * @returns {TP.lang.RootObject.<TP.core.Locale>} A TP.core.Locale subtype
     *     type object.
     */

    var loc;

    //  first test is for an exact match
    if (TP.isType(loc = this.get('locales').at(aLocaleID))) {
        return loc;
    }

    //  perhaps not registered, but can be found by name?
    if (TP.isType(loc = TP.sys.require(
                aLocaleID.strip('-').toUpperCase() + 'Locale'))) {
        TP.core.Locale.registerLocale(loc);
        return loc;
    }

    //  alternative is for the language without country code
    if (TP.isType(loc =
                    this.get('locales').at(aLocaleID.split('-').first()))) {
        return loc;
    }

    //  perhaps not registered, but can be found for language only?
    if (TP.isType(loc = TP.sys.require(
                aLocaleID.split('-').first().toUpperCase() + 'Locale'))) {
        TP.core.Locale.registerLocale(loc);
        return loc;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('registerLocale',
function(aLocale, aKey) {

    /**
     * @name registerLocale
     * @synopsis Registers the locale provided under the locale's language code,
     *     allowing it to be found quickly. Note that by using one or more calls
     *     and different keys you can map a particular locale as the handler for
     *     a number of language and country code combinations.
     * @param {TP.lang.RootObject.<TP.core.Locale>} A TP.core.Locale subtype
     *     type object.
     * @param {String} aKey The language-country code key to use to register
     *     this locale.
     * @returns {TP.lang.RootObject.<TP.core.Locale>} A TP.core.Locale subtype
     *     type object.
     * @todo
     */

    var key;

    if (!TP.isSubtypeOf(aLocale, TP.core.Locale)) {
        return this.raise('TP.sig.InvalidLocale', arguments, aLocale);
    }

    key = TP.ifInvalid(aKey, aLocale.getISOKey());

    //  NOTE the reference to the TP.core.Locale type here rather than
    //  "this", so we use the shared hash
    TP.core.Locale.get('locales').atPut(key, aLocale);

    return this;
});

//  ========================================================================
//  Formatting Support
//  ========================================================================

/**
 * @The localize() series of methods provide for localized formatting of data,
 *     i.e. "output formatting".
 * @todo
 */

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('localize',
function(anObject, sourceLocale, forceRefresh) {

    /**
     * @name localize
     * @synopsis Returns a localized version of the object provided. This method
     *     serves as a top-level dispatcher which routes the object to a proper
     *     handler function by type. NOTE that no localization is attempted by
     *     the TP.core.Locale type itself, so unless a locale is installed via
     *     TP.sys.setLocale() this method will return the original object.
     * @param {Object} anObject The object to localize.
     * @param {String|TP.core.Locale} sourceLocale A source xml:lang or
     *     TP.core.Locale defining the language the string is now in. Defaults
     *     to getTargetLanguage() which is based on the current locale's
     *     language-country value.
     * @param {Boolean} forceRefresh True to force the new object to be built
     *     from a refreshed resource bundle.
     * @returns {Object} A localized version of the source object.
     * @todo
     */

    var tname,
        fname;

    TP.debug('break.locale_localize');

    //  we'll be using the type name to switch, or build a method lookup key
    //  so we start there
    tname = TP.tname(anObject);

    //  the "big four" for localization are boolean, date, number, and
    //  string which we test for here
    switch (tname) {
        case 'String':

            return this.localizeString(anObject,
                                        sourceLocale,
                                        forceRefresh);
        case 'Boolean':

            return this.localizeBoolean(anObject,
                                        sourceLocale,
                                        forceRefresh);
        case 'Number':

            return this.localizeNumber(anObject,
                                        sourceLocale,
                                        forceRefresh);
        case 'Date':

            return this.localizeDate(anObject,
                                        sourceLocale,
                                        forceRefresh);
        default:

            //  default is to do simplified "callBestMethod" approach
            fname = 'localize' + tname;
            if (TP.canInvoke(this, fname)) {
                return this.fname(anObject, forceRefresh);
            }

            break;
    }

    //  if all else fails we just return the object
    return anObject;
});

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('localizeBoolean',
function(aBoolean, sourceLocale, forceRefresh) {

    /**
     * @name localizeBoolean
     * @synopsis Returns the translated string value of the boolean provided.
     * @param {Boolean} aBoolean The boolean to localize.
     * @param {String|TP.core.Locale} sourceLocale A source xml:lang or
     *     TP.core.Locale defining the language the string is now in. Defaults
     *     to getTargetLanguage() which is based on the current locale's
     *     language-country value.
     * @param {Boolean} forceRefresh True to force the new object to be built
     *     from a refreshed resource bundle.
     * @returns {String} The translation of the boolean, or the boolean if no
     *     translation was found.
     * @todo
     */

    var str;

    str = aBoolean ? 'true' : 'false';

    return this.localizeString(str, sourceLocale, forceRefresh);
});

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('getFalseStrings',
function() {

    /**
     * @name getFalseStrings
     * @synopsis Returns the strings used for comparing to the 'false' value. In
     *     this type, this method does nothing. Subtypes should override to
     *     provide real functionality.
     * @returns {Array} The array of string values that is considered to be
     *     'false'.
     * @todo
     */

    return this.$get('falseStrings');
});

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('getTrueStrings',
function() {

    /**
     * @name getTrueStrings
     * @synopsis Returns the strings used for comparing to the 'true' value. In
     *     this type, this method does nothing. Subtypes should override to
     *     provide real functionality.
     * @returns {Array} The array of string values that is considered to be
     *     'true'.
     * @todo
     */

    return this.$get('trueStrings');
});

//  ------------------------------------------------------------------------
//  Date Formatting
//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('localizeDate',
function(aDate, sourceLocale, forceRefresh) {

    /**
     * @name localizeDate
     * @synopsis Returns the translated string value of the date provided.
     * @param {Date} aDate The date to localize.
     * @param {String|TP.core.Locale} sourceLocale A source xml:lang or
     *     TP.core.Locale defining the language the string is now in. Defaults
     *     to getTargetLanguage() which is based on the current locale's
     *     language-country value.
     * @param {Boolean} forceRefresh True to force the new object to be built
     *     from a refreshed resource bundle.
     * @returns {String} The translation of the date, or the date if no
     *     translation was found.
     * @todo
     */

    var format;

    if (TP.notEmpty(format = this.getDateFormat())) {
        return format.transformDate(aDate);
    }

    return aDate;

    //  first pass always produces english since that's what JS works from,
    //  now we want to process that into an alternative based on the locale

    //  TODO:   optimize this series, there has to be a better way. This is
    //          pure brute force and pretty slow :(

    /*
    en = TP.core.Locale.getLongMonthNames();
    re = this.getLongMonthNames();

    for (i = 0; i < en.length; i++) {
        str = str.replace(en.at(i), re.at(i));
    };

    en = TP.core.Locale.getLongWeekdayNames();
    re = this.getLongWeekdayNames();

    for (i = 0; i < en.length; i++) {
        str = str.replace(en.at(i), re.at(i));
    };

    en = TP.core.Locale.getShortMonthNames();
    re = this.getShortMonthNames();

    for (i = 0; i < en.length; i++) {
        str = str.replace(en.at(i), re.at(i));
    };

    en = TP.core.Locale.getShortWeekdayNames();
    re = this.getShortWeekdayNames();

    for (i = 0; i < en.length; i++) {
        str = str.replace(en.at(i), re.at(i));
    };

    return str;
    */
});

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('getDateFormat',
function() {

    /**
     * @name getDateFormat
     * @synopsis Returns the substitution format ('%{m}%{d}%{y}') to use as the
     *     format for localized dates.
     * @returns {String} The formatting date string.
     */

    return this.$get('dateFormat');
});

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('getLongMonthNames',
function() {

    /**
     * @name getLongMonthNames
     * @synopsis Returns an array of long month names with values that are
     *     similar to 'January' to 'December' in this locale corresponding to
     *     integers 0 - 11. In this type, this method does nothing. Subtypes
     *     should override to provide real functionality.
     * @returns {Array} An array of long month names.
     * @todo
     */

    return this.$get('longMonthNames');
});

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('getLongWeekdayNames',
function() {

    /**
     * @name getLongWeekdayNames
     * @synopsis Returns an array of long weekday names with values that are
     *     similar to 'Sunday' to 'Saturday' in this locale corresponding to
     *     integers 0 - 7. In this type, this method does nothing. Subtypes
     *     should override to provide real functionality.
     * @returns {Array} An array of long weekday names.
     * @todo
     */

    return this.$get('longWeekdayNames');
});

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('getShortMonthNames',
function() {

    /**
     * @name getShortMonthNames
     * @synopsis Returns an array of short month names with values that are
     *     similar to 'Jan' to 'Dec' in this locale corresponding to integers 0
     *     - 11. In this type, this method does nothing. Subtypes should
     *     override to provide real functionality.
     * @returns {Array} An array of short month names.
     * @todo
     */

    return this.$get('shortMonthNames');
});

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('getShortWeekdayNames',
function() {

    /**
     * @name getShortWeekdayNames
     * @synopsis Returns an array of short weekday names with values that are
     *     similar to 'Sun' to 'Sat' in this locale corresponding to integers 0
     *     - 7. In this type, this method does nothing. Subtypes should override
     *     to provide real functionality.
     * @returns {Array} An array of short weekday names.
     * @todo
     */

    return this.$get('shortWeekdayNames');
});

//  ------------------------------------------------------------------------
//  Number Formatting
//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('localizeNumber',
function(aNumber, sourceLocale, forceRefresh) {

    /**
     * @name localizeNumber
     * @synopsis Returns the translated string value of the number provided.
     * @param {Number} aNumber The number to localize.
     * @param {String|TP.core.Locale} sourceLocale A source xml:lang or
     *     TP.core.Locale defining the language the string is now in. Defaults
     *     to getTargetLanguage() which is based on the current locale's
     *     language-country value.
     * @param {Boolean} forceRefresh True to force the new object to be built
     *     from a refreshed resource bundle.
     * @returns {String} The translation of the number, or the number if no
     *     translation was found.
     * @todo
     */

    var format;

    if (TP.notEmpty(format = this.getNumberFormat())) {
        return format.transformNumber(aNumber);
    }

    return aNumber;
});

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('getNumberFormat',
function() {

    /**
     * @name getNumberFormat
     * @synopsis Returns the substitution format (i.e. '#{#,###}') to use as the
     *     format for localized numbers.
     * @returns {String} The formatting string.
     */

    return this.$get('numberFormat');
});

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('getThousandsMatcher',
function() {

    /**
     * @name getThousandsMatcher
     * @synopsis Returns a regex used when detecting thousands digits.
     * @returns {String} The regular expression used to match thousands.
     */

    return this.$get('thousandsMatcher');
});

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('getThousandsSeparator',
function() {

    /**
     * @name getThousandsSeparator
     * @synopsis Returns the character used when separating thousands digits. In
     *     this type, this method does nothing. Subtypes should override to
     *     provide real functionality.
     * @returns {String} The character used to separate thousands.
     */

    return this.$get('thousandsSeparator');
});

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('getDecimalPoint',
function() {

    /**
     * @name getDecimalPoint
     * @synopsis Returns the character used for a decimal point. In this type,
     *     this method does nothing. Subtypes should override to provide real
     *     functionality.
     * @returns {String} The character used for a decimal point.
     */

    return this.$get('decimalPoint');
});

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('getThousandsGroupSize',
function() {

    /**
     * @name getThousandsGroupSize
     * @synopsis Returns the size of the thousands grouping. For most locales
     *     this is 3, however Japan uses 4.
     * @returns {Number} The size of the thousands group.
     */

    return this.$get('thousandsGroupSize');
});

//  ------------------------------------------------------------------------
//  String Formatting
//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('localizeString',
function(aString, sourceLocale, forceRefresh) {

    /**
     * @name localizeString
     * @synopsis Returns the translated value of the string provided.
     * @param {String} aString The string to localize.
     * @param {String|TP.core.Locale} sourceLocale A source xml:lang or
     *     TP.core.Locale defining the language the string is now in. Defaults
     *     to getTargetLanguage() which is based on the current locale's
     *     language-country value.
     * @param {Boolean} forceRefresh True to force the new object to be built
     *     from a refreshed resource bundle.
     * @returns {String} The translation of the string, or the string if no
     *     translation was found.
     * @todo
     */

    var source,
        lang,

        map,
        key,

        xml,
        xp,
        seg,
        tu,
        str;

    if (TP.isEmpty(aString)) {
        return aString;
    }

    //  source defaults to the current user language in effect
    source = TP.ifInvalid(sourceLocale, TP.sys.getSourceLanguage());

    if (!TP.isString(source)) {
        source = source.getISOKey();
    }

    lang = this.getISOKey();

    if (!source || !lang || (source === lang)) {
        return aString;
    }

    //  get the string representation of our translation map
    map = this.$getStringXMLString(forceRefresh);
    if (TP.notValid(map)) {
        //  apparently we don't have a string bundle to work with
        return aString;
    }

    //  regex tests are fastest to see if we need to look deeper. if the
    //  regex fails we can just return the string without xpath overhead
    key = aString.asString();
    try {
        if (TP.notTrue(TP.rc(key).test(map))) {
            return aString;
        }
    } catch (e) {
        //  typical case here is something the regex parser thinks isn't
        //  valid as a regex (invalid quantifier etc) so we have to keep
        //  going
    }

    //  trick now is to find the parent containing our "key", which is the
    //  string value
    xml = this.getStringXML();

    //  this should get us the segment whose value matches the key in the
    //  source language...
    xp = TP.join('//*[local-name() = "tuv" and @xml:lang = "',
                source.toLowerCase(),
                '"]/*[local-name() = "seg" and text() = ',
                key.quoted('"'),
                ']');

    seg = TP.nodeEvaluateXPath(xml, xp, TP.FIRST_NODE, false);

    //  not found for this language for some reason, so just return
    if (TP.notValid(seg)) {
        //  second chance is that we have a root language match...
        if (TP.regex.HAS_HYPHEN.test(source)) {
            xp = TP.join('//*[local-name() = "tuv" and @xml:lang = "',
                        source.split('-').first().toLowerCase(),
                        '"]/*[local-name() = "seg" and text() = ',
                        key.quoted('"'),
                        ']');

            seg = TP.nodeEvaluateXPath(xml, xp, TP.FIRST_NODE, false);

            if (TP.notValid(seg)) {
                return aString;
            }
        } else {
            return aString;
        }
    }

    //  we want the segment's parent TU element (/tmx/body/tu/tvu/seg) for
    //  the next query
    tu = seg.parentNode.parentNode;

    //  now ask for the target language's translation in that language
    xp = TP.join('string(./*[local-name() = "tuv" and @xml:lang = "',
                    lang.toLowerCase(),
                    '"]/*[local-name() = "seg"]/text())');

    str = TP.nodeEvaluateXPath(tu, xp, TP.FIRST_NODE, false);

    if (TP.notEmpty(str)) {
        return str;
    }

    //  if the lang has a hyphen we can also search for the "root language"
    if (TP.regex.HAS_HYPHEN.test(lang)) {
            xp = TP.join('string(./*[local-name() = "tuv" and @xml:lang = "',
                            lang.split('-').first().toLowerCase(),
                            '"]/*[local-name() = "seg"]/text())');

            str = TP.nodeEvaluateXPath(tu, xp, TP.FIRST_NODE, false);
    }

    if (TP.notEmpty(str)) {
        return str;
    }

    return aString;
});

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('$getStringXMLString',
function(forceRefresh) {

    /**
     * @name $getStringXMLString
     * @synopsis Private method which returns the string table in string form.
     *     This offers a fast way to test for a string's value via regular
     *     expression matching rather than XPath.
     * @param {Boolean} forceRefresh True to force the string form to be built
     *     from a refreshed copy of the string XML document.
     * @returns {String} The string table in string form.
     */

    var str,
        node;

    if (TP.isTrue(forceRefresh)) {
        this.$set('stringSTR', null);
    }

    if (TP.notValid(str = this.$get('stringSTR'))) {
        if (TP.notValid(node = this.getStringXML(forceRefresh))) {
            str = '';
            this.$set('stringSTR', str);
        } else {
            str = TP.nodeAsString(node);
            this.$set('stringSTR', str);
        }
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('getStringXML',
function(forceRefresh) {

    /**
     * @name getStringXML
     * @synopsis Returns the XML document containing the locale's string
     *     mappings. The root file name for the file containing these strings is
     *     found in the TIBET boot property 'strings'.
     * @param {Boolean} forceRefresh True to force the string form to be built
     *     from a refreshed copy of the string XML document.
     * @returns {DocumentNode} The native document element for the locale's
     *     string file.
     * @dicussion TIBET can localize strings by using either a single string
     *     file or a set of string files, one per language code, or a mix of the
     *     two strategies. When asked for a string table (XML) TIBET uses the
     *     boot property 'strings' to find the file name to use. This file name
     *     is typically strings.xml. The file name is used as a template in the
     *     sense that TIBET will split off any extension, add the language code
     *     with underscores (ie. strings_en_us.xml for US English) and try to
     *     load the file. If that file doesn't exist the root file is loaded
     *     (strings.xml) and used. Note that since each locale will only use one
     *     string file all strings needing translation in that language should
     *     be included in the file.
     * @todo
     */

    var node,
        flag,

        fname,
        parts,
        url;

    //  if we're being asked to refresh clear our cached copy
    if (TP.isTrue(forceRefresh)) {
        this.$set('stringXML', null);
    }

    //  if we've got a cached version use that
    if (TP.isNode(node = this.$get('stringXML'))) {
        return node;
    }

    flag = TP.sys.shouldLogRaise();
    TP.sys.shouldLogRaise(false);

    try {
        try {
            //  first choice is whatever the boot system parameter tells us
            if (TP.notEmpty(fname = TP.sys.cfg('tibet.strings'))) {
                parts = fname.split('.');

                //  the final url here should resemble strings_en_us.xml
                //  where the en_us portion is the receiver's language code
                url = TP.uc(
                    parts.join(
                        '_' +
                        this.getISOKey().toLowerCase().replace('-', '_') +
                        '.'));

                if (TP.isURI(url)) {
                    node = url.getNativeNode(TP.hc('async', false));
                }
            }
        } catch (e) {
        }

        if (TP.notValid(node)) {
            url = TP.uc(TP.sys.cfg('tibet.string_file'));
            if (TP.isURI(url)) {
                node = url.getNativeNode(TP.hc('async', false));
            }
        }
    } catch (e) {
    } finally {
        if (TP.notValid(node)) {
            node = TP.documentFromString(
                        '<tmx xmlns="' + TP.w3.Xmlns.TMX + '"></tmx>');
        }

        this.$set('stringXML', node);

        TP.sys.shouldLogRaise(flag);
    }

    return node;
});

//  ========================================================================
//  Parsing Support
//  ========================================================================

//  ------------------------------------------------------------------------
//  Boolean Parsing
//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('parseBoolean',
function(aString, sourceLocale) {

    /**
     * @name parseBoolean
     * @synopsis Returns the Boolean value of the string provided, as localized
     *     for the receiving locale.
     * @param {String} aString The input string to parse.
     * @param {String|TP.core.Locale} sourceLocale A source xml:lang or
     *     TP.core.Locale defining the language the string is now in. Defaults
     *     to getTargetLanguage() which is based on the current locale's
     *     language-country value.
     * @returns {Boolean} The localized Boolean value.
     * @todo
     */

    var str;

    TP.debug('break.locale_parse');

    str = this.localizeString(aString, sourceLocale);

    //  match against our false strings and consider everything else true
    return !this.getFalseStrings().containsString(str);
});

//  ------------------------------------------------------------------------
//  Date Parsing
//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('parseDate',
function(aString, sourceLocale) {

    /**
     * @name parseDate
     * @synopsis Returns the Date value of the string provided, as localized for
     *     the receiving locale.
     * @param {String} aString The input string to parse.
     * @param {String|TP.core.Locale} sourceLocale A source xml:lang or
     *     TP.core.Locale defining the language the string is now in. Defaults
     *     to getTargetLanguage() which is based on the current locale's
     *     language-country value.
     * @returns {Date} The localized Date value.
     * @todo
     */

    TP.debug('break.locale_parse');

    //  the typical originator for a parse() is the object itself, so we'll
    //  normally have gone through Date.parse() which first tries the TIBET
    //  supplied parsers for maximum correctness and flexibility and then
    //  the now-somewhat-less sad (as of ECMAScript E5) native Date.parse()
    //  routine.
    //  By the time we get here all we can do is use the standard Date
    //  constructor or hope a subtype overrides with smarter logic for that
    //  locale.
    return new Date(aString);
});

//  ------------------------------------------------------------------------
//  Number Parsing
//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('parseNumber',
function(aString, sourceLocale) {

    /**
     * @name parseNumber
     * @synopsis Returns the Number value of the string provided, as localized
     *     for the receiving locale.
     * @param {String} aString The input string to parse.
     * @param {String|TP.core.Locale} sourceLocale A source xml:lang or
     *     TP.core.Locale defining the language the string is now in. Defaults
     *     to getTargetLanguage() which is based on the current locale's
     *     language-country value.
     * @returns {Number} The localized Number value.
     * @todo
     */

    var str,
        sep;

    TP.debug('break.locale_parse');

    str = aString;

    //  watch for strings with "thousandsSeparators" in them
    sep = this.getThousandsSeparator();
    str = str.strip(sep, '');

    //  with thousands separator gone we now change decimal point to
    //  the one JS expects ('.')
    sep = this.getDecimalPoint();
    str = str.replace(sep, '.');

    /* jshint -W053 */
    return new Number(str);
    /* jshint +W053 */
});

//  ------------------------------------------------------------------------
//  String Parsing
//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('parseString',
function(aString, sourceLocale) {

    /**
     * @name parseString
     * @synopsis Returns the String value of the string provided, as localized
     *     for the receiving locale.
     * @param {String} aString The input string to parse.
     * @param {String|TP.core.Locale} sourceLocale A source xml:lang or
     *     TP.core.Locale defining the language the string is now in. Defaults
     *     to getTargetLanguage() which is based on the current locale's
     *     language-country value.
     * @returns {String} The localized String value.
     * @todo
     */

    TP.debug('break.locale_parse');

    return this.localizeString(aString, sourceLocale);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
