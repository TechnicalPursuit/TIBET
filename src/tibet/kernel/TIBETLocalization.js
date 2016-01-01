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
subtypes provide the actual functionality for localization. The language code
for the current locale is used by "localized" types such as TP.core.PhoneNumber
to determine the specific subtype to use.

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
     * @method getLocale
     * @summary Return the current locale type.
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
     * @method setLocale
     * @summary Sets the current locale, which is used by numerous types to
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
            this.raise('TP.sig.InvalidParameter');

            locale = TP.core.Locale;
        }
    }

    //  We don't force locales to load string tables if they're not going to
    //  ever be activated via setLocale, but if we're going to use the locale we
    //  need to activate it so we can switch string tables etc.
    locale.activate();

    this.$set('locale', locale);

    return this;
});

//  ========================================================================
//  Object Extensions
//  ========================================================================

TP.defineCommonMethod('localize',
function(aLocale) {

    /**
     * @method localize
     * @summary Returns a localized string version of the receiver.
     * @param {TP.core.Locale|String} aLocale The locale to use for resolution.
     * @returns {Object} A localized version of the source object.
     */

    var locale,
        localeObj;

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
            TP.warn('Couldn\'t find locale for: ' + locale) : 0;

        return this;
    }

    return localeObj.localize(this);
});

//  ========================================================================
//  TP.core.Locale
//  ========================================================================

/**
 * @type {TP.core.Locale}
 * @summary TP.core.Locale is the supertype from which all locales inherit.
 *     Locales are the control point for localization in TP.sys.
 * @summary TP.core.Locales are the focal point of TIBET's
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
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.Locale');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  the language code for this locale. this value is typically set by the locale
//  as part of the type's definition. we default them to empty strings to avoid
//  getting null values when building out our ID etc.
TP.core.Locale.Type.defineAttribute('langCode', '');

//  the country code for the locale. not set in all cases, but a good example is
//  'us' for en-us and 'gb' for en-gb as defined by those locales.
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
TP.core.Locale.Type.defineAttribute('numberFormat', '#{#,###.##########}');
TP.core.Locale.Type.defineAttribute('thousandsMatcher', /,/g);
TP.core.Locale.Type.defineAttribute('thousandsSeparator', ',');
TP.core.Locale.Type.defineAttribute('decimalPoint', '.');
TP.core.Locale.Type.defineAttribute('thousandsGroupSize', 3);

//  the ISO key, which is the language code plus country code if the country
//  code isn't empty.
TP.core.Locale.Type.defineAttribute('langID');

TP.core.Locale.Type.defineAttribute('locales', TP.hc());

//  ------------------------------------------------------------------------
//  Type.Local Attributes/Methods
//  ------------------------------------------------------------------------

//  The system string table. All string localization calls ultimately try to
//  find a key/value mapping in this object, which is maintained in raw form
//  to support usage of slices of this content as the system's TP.msg object.
//  NOTE that this is a raw object, not a hash or other augmented object so
//  as a result we have to use the full descriptor syntax of defineAttribute.
TP.core.Locale.defineAttribute('strings', {value: {}});

//  ------------------------------------------------------------------------

TP.core.Locale.defineConstant('ROOT_ISO_KEY', 'root');

//  ------------------------------------------------------------------------

TP.core.Locale.defineMethod('registerLocale',
function(aLocale, aKey) {

    /**
     * @method registerLocale
     * @summary Registers the locale provided under the locale's language code,
     *     allowing it to be found quickly. Note that by using one or more calls
     *     and different keys you can map a particular locale as the handler for
     *     a number of language and country code combinations.
     * @param {TP.meta.Locale} aLocale A TP.core.Locale subtype type object.
     * @param {String} aKey The language-country code key to use to register
     *     this locale.
     * @returns {TP.meta.Locale} A TP.core.Locale subtype type object.
     */

    var key;

    if (!TP.isSubtypeOf(aLocale, TP.core.Locale)) {
        return this.raise('TP.sig.InvalidLocale', aLocale);
    }

    key = TP.ifInvalid(aKey, aLocale.getISOKey());

    //  NOTE the reference to the TP.core.Locale type here rather than
    //  "this", so we use the shared hash
    TP.core.Locale.get('locales').atPut(key, aLocale);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Locale.defineMethod('getLocaleById',
function(aLocaleID) {

    /**
     * @method getLocaleById
     * @summary Returns the TP.core.Locale subtype registered under the
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
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('activate',
function() {

    /**
     * @method activate
     * @summary Ensures any resources such as string table content is loaded for
     *     the receiver.
     * @return {TP.core.Locale} The receiver.
     */

    var locales,
        msg;

    msg = {};

    //  Loop over our supertypes to ensure we catch things like en for en-gb.
    locales = this.getSupertypes();
    locales.unshift(this);
    locales = locales.slice(0, locales.indexOf(TP.core.Locale) + 1);
    locales.reverse();

    locales.forEach(
            function(locale) {
                var dict;

                dict = locale.getISOStrings();
                TP.keys(dict).forEach(function(key) {
                    msg[key] = dict[key];
                });
            });

    //  Update the map reference.
    TP.msg = msg;

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('getISOKey',
function() {

    /**
     * @method getISOKey
     * @summary Returns the receiver's ISO key, for a Locale the language code
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

TP.core.Locale.Type.defineMethod('getISOStrings',
function(aKey) {

    /**
     * @method getISOStrings
     * @param {String} aKey The language-country code key to use to register
     *     this locale.
     * @return {Object} The populated string dictionary for the key.
     */

    var iso,
        strings,
        dict;

    //  Get the key we'll be registering under. This depends on the receiving
    //  locale's iso key by default.
    iso = TP.ifInvalid(aKey, this.getISOKey());
    iso = TP.ifEmpty(iso, TP.core.Locale.ROOT_ISO_KEY);

    //  Check for existing string definitions for this locale/key and create it
    //  if it's not found.
    strings = TP.core.Locale.get('strings');
    dict = strings[iso];
    if (TP.notValid(dict)) {
        dict = {};
        strings[iso] = dict;
    }

    return dict;
});

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('registerStrings',
function(dictionary) {

    /**
     * @method registerStrings
     * @summary Registers one or more key/value pairs as localizable strings.
     *     The keys ultimately are leveraged via TP.msg[key] for use in code
     *     Values are provided in response to localizeString, TP.sc(), and
     *     String.construct methods.
     * @param {Object|TP.lang.Hash} dictionary The set of key/value pairs.
     * @return {Object} The resulting populated string lookup object.
     */

    var iso,
        data,
        dict,
        current;

    if (TP.isEmpty(dictionary)) {
        return this.raise('InvalidParameter',
            'Empty or non-existing string data.');
    }

    if (TP.isString(dictionary)) {
        try {
            data = JSON.parse(dictionary);
        } catch (e) {
            return this.raise('InvalidParameter',
                'Non-JSON string table data in string form.');
        }
    } else {
        data = dictionary;
    }

    //  Get our locale-specific string table, building as necessary.
    dict = this.getISOStrings(iso);

    //  Iterate over data (hash, obj, etc) and load up our strings.
    TP.keys(data).forEach(
            function(key) {
                if (TP.canInvoke(data, 'at')) {
                    dict[key] = data.at(key);
                } else {
                    dict[key] = data[key];
                }
            });

    //  Force reactivation of the current locale. We can't be sure that the
    //  strings just registered don't fall somewhere along the lookup chain.
    current = TP.sys.getLocale();
    if (TP.isValid(current)) {
        current.activate();
    }

    return dict;
});

//  ========================================================================
//  Formatting Support
//  ========================================================================

/**
 * @The localize() series of methods provide for localized formatting of data,
 *     i.e. "output formatting".
 */

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('localize',
function(anObject) {

    /**
     * @method localize
     * @summary Returns a localized version of the object provided. This method
     *     serves as a top-level dispatcher which directs the object to a proper
     *     handler function by type. NOTE that no localization is attempted by
     *     the TP.core.Locale type itself, so unless a locale is installed via
     *     TP.sys.setLocale() this method will return the original object.
     * @param {Object} anObject The object to localize.
     * @returns {Object} A localized version of the source object.
     */

    var tname,
        fname;

    //  we'll be using the type name to switch, or build a method lookup key
    //  so we start there
    tname = TP.tname(anObject);

    //  the "big four" for localization are boolean, date, number, and
    //  string which we test for here
    switch (tname) {
        case 'String':

            return this.localizeString(anObject);
        case 'Boolean':

            return this.localizeBoolean(anObject);
        case 'Number':

            return this.localizeNumber(anObject);
        case 'Date':

            return this.localizeDate(anObject);
        default:

            //  default is to do simplified "callBestMethod" approach
            fname = 'localize' + tname;
            if (TP.canInvoke(this, fname)) {
                return this.fname(anObject);
            }

            break;
    }

    //  if all else fails we just return the object
    return anObject;
});

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('localizeBoolean',
function(aBoolean) {

    /**
     * @method localizeBoolean
     * @summary Returns the translated string value of the boolean provided.
     * @param {Boolean} aBoolean The boolean to localize.
     * @returns {String} The translation of the boolean, or the boolean if no
     *     translation was found.
     */

    var str;

    str = aBoolean.toString();

    return this.localizeString(str);
});

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('getFalseStrings',
function() {

    /**
     * @method getFalseStrings
     * @summary Returns the strings used for comparing to the 'false' value. In
     *     this type, this method does nothing. Subtypes should override to
     *     provide real functionality.
     * @returns {Array} The array of string values that is considered to be
     *     'false'.
     */

    return this.$get('falseStrings');
});

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('getTrueStrings',
function() {

    /**
     * @method getTrueStrings
     * @summary Returns the strings used for comparing to the 'true' value. In
     *     this type, this method does nothing. Subtypes should override to
     *     provide real functionality.
     * @returns {Array} The array of string values that is considered to be
     *     'true'.
     */

    return this.$get('trueStrings');
});

//  ------------------------------------------------------------------------
//  Date Formatting
//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('localizeDate',
function(aDate) {

    /**
     * @method localizeDate
     * @summary Returns the translated string value of the date provided.
     * @param {Date} aDate The date to localize.
     * @returns {String} The translation of the date, or the date if no
     *     translation was found.
     */

    var format,

        i,
        en,
        str,

        names;

    if (TP.notEmpty(format = this.getDateFormat())) {
        str = format.transformDate(aDate);
    } else {
        str = aDate.toString();
    }

    //  first pass always produces english since that's what JS works from,
    //  now we want to process that into an alternative based on the locale

    //  TODO:   optimize this series by creating/escaping a RegExp and doing
    //          replacement. This is pure brute force and pretty slow :(

    en = TP.core.Locale.getLongMonthNames();
    names = this.getLongMonthNames();

    for (i = 0; i < en.length; i++) {
        str = str.replace(en.at(i), names.at(i));
    }

    en = TP.core.Locale.getLongWeekdayNames();
    names = this.getLongWeekdayNames();

    for (i = 0; i < en.length; i++) {
        str = str.replace(en.at(i), names.at(i));
    }

    en = TP.core.Locale.getShortMonthNames();
    names = this.getShortMonthNames();

    for (i = 0; i < en.length; i++) {
        str = str.replace(en.at(i), names.at(i));
    }

    en = TP.core.Locale.getShortWeekdayNames();
    names = this.getShortWeekdayNames();

    for (i = 0; i < en.length; i++) {
        str = str.replace(en.at(i), names.at(i));
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('getDateFormat',
function() {

    /**
     * @method getDateFormat
     * @summary Returns the substitution format ('%{m}%{d}%{y}') to use as the
     *     format for localized dates.
     * @returns {String} The formatting date string.
     */

    return this.$get('dateFormat');
});

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('getLongMonthNames',
function() {

    /**
     * @method getLongMonthNames
     * @summary Returns an array of long month names with values that are
     *     similar to 'January' to 'December' in this locale corresponding to
     *     integers 0 - 11. In this type, this method does nothing. Subtypes
     *     should override to provide real functionality.
     * @returns {Array} An array of long month names.
     */

    return this.$get('longMonthNames');
});

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('getLongWeekdayNames',
function() {

    /**
     * @method getLongWeekdayNames
     * @summary Returns an array of long weekday names with values that are
     *     similar to 'Sunday' to 'Saturday' in this locale corresponding to
     *     integers 0 - 7. In this type, this method does nothing. Subtypes
     *     should override to provide real functionality.
     * @returns {Array} An array of long weekday names.
     */

    return this.$get('longWeekdayNames');
});

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('getShortMonthNames',
function() {

    /**
     * @method getShortMonthNames
     * @summary Returns an array of short month names with values that are
     *     similar to 'Jan' to 'Dec' in this locale corresponding to integers 0
     *     - 11. In this type, this method does nothing. Subtypes should
     *     override to provide real functionality.
     * @returns {Array} An array of short month names.
     */

    return this.$get('shortMonthNames');
});

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('getShortWeekdayNames',
function() {

    /**
     * @method getShortWeekdayNames
     * @summary Returns an array of short weekday names with values that are
     *     similar to 'Sun' to 'Sat' in this locale corresponding to integers 0
     *     - 7. In this type, this method does nothing. Subtypes should override
     *     to provide real functionality.
     * @returns {Array} An array of short weekday names.
     */

    return this.$get('shortWeekdayNames');
});

//  ------------------------------------------------------------------------
//  Number Formatting
//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('localizeNumber',
function(aNumber) {

    /**
     * @method localizeNumber
     * @summary Returns the translated string value of the number provided.
     * @param {Number} aNumber The number to localize.
     * @returns {String} The translation of the number, or the number if no
     *     translation was found.
     */

    var oldLocale,
        format,

        retVal;

    //  Because Number formatting relies on properties of the 'current locale'
    //  such as 'thousandsSeparator', etc. and these properties are accessed on
    //  *the current locale* as the Number is formatted, we must temporarily set
    //  the current locale to ourself.

    oldLocale = TP.sys.getLocale();
    TP.sys.setLocale(this);

    if (TP.notEmpty(format = this.getNumberFormat())) {
        retVal = format.transformNumber(aNumber);
    } else {
        retVal = aNumber;
    }

    //  Restore the locale we came in with
    TP.sys.setLocale(oldLocale);

    return retVal;
});

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('getNumberFormat',
function() {

    /**
     * @method getNumberFormat
     * @summary Returns the substitution format (i.e. '#{#,###}') to use as the
     *     format for localized numbers.
     * @returns {String} The formatting string.
     */

    return this.$get('numberFormat');
});

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('getThousandsMatcher',
function() {

    /**
     * @method getThousandsMatcher
     * @summary Returns a regex used when detecting thousands digits.
     * @returns {String} The regular expression used to match thousands.
     */

    return this.$get('thousandsMatcher');
});

//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('getThousandsSeparator',
function() {

    /**
     * @method getThousandsSeparator
     * @summary Returns the character used when separating thousands digits. In
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
     * @method getDecimalPoint
     * @summary Returns the character used for a decimal point. In this type,
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
     * @method getThousandsGroupSize
     * @summary Returns the size of the thousands grouping. For most locales
     *     this is 3, however Japan uses 4.
     * @returns {Number} The size of the thousands group.
     */

    return this.$get('thousandsGroupSize');
});

//  ------------------------------------------------------------------------
//  String Formatting
//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('localizeString',
function(aString) {

    /**
     * @method localizeString
     * @summary Returns the translated value of the string if one has been
     * registered via registerString(s).
     * @param {String} aString The string to localize.
     * @returns {String} The translation of the string, or the string if no
     *     translation was found.
     */

    var str,
        dict;

    if (TP.isEmpty(aString)) {
        return aString;
    }

    //  Make sure we have a string primitive.
    str = '' + aString;

    //  If we're current then we can defer to the TP.msg content.
    if (TP.sys.getLocale() === this) {
        return TP.msg[str] || str;
    }

    dict = this.getISOStrings();

    return dict[str] || str;
});

//  ========================================================================
//  Parsing Support
//  ========================================================================

//  ------------------------------------------------------------------------
//  Boolean Parsing
//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('parseBoolean',
function(aString) {

    /**
     * @method parseBoolean
     * @summary Returns the Boolean value of the string provided, as localized
     *     for the receiving locale.
     * @param {String} aString The input string to parse.
     * @returns {Boolean} The localized Boolean value.
     */

    var str;

    str = this.localizeString(aString);

    //  match against our false strings and consider everything else true
    return !this.getFalseStrings().containsString(str);
});

//  ------------------------------------------------------------------------
//  Date Parsing
//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('parseDate',
function(aString) {

    /**
     * @method parseDate
     * @summary Returns the Date value of the string provided, as localized for
     *     the receiving locale.
     * @param {String} aString The input string to parse.
     * @returns {Date} The localized Date value.
     */

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
function(aString) {

    /**
     * @method parseNumber
     * @summary Returns the Number value of the string provided, as localized
     *     for the receiving locale.
     * @param {String} aString The input string to parse.
     * @returns {Number} The localized Number value.
     */

    var str,
        sep;

    str = aString;

    //  watch for strings with "thousandsSeparators" in them
    sep = this.getThousandsSeparator();
    str = str.strip(sep, '');

    //  with thousands separator gone we now change decimal point to
    //  the one JS expects ('.')
    sep = this.getDecimalPoint();
    str = str.replace(sep, '.');

    /* jshint -W053 */
    /* eslint-disable no-new-wrappers */
    return new Number(str);
    /* eslint-enable no-new-wrappers */
    /* jshint +W053 */
});

//  ------------------------------------------------------------------------
//  String Parsing
//  ------------------------------------------------------------------------

TP.core.Locale.Type.defineMethod('parseString',
function(aString) {

    /**
     * @method parseString
     * @summary Returns the String value of the string provided, as localized
     *     for the receiving locale.
     * @param {String} aString The input string to parse.
     * @returns {String} The localized String value.
     */

    return this.localizeString(aString);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
