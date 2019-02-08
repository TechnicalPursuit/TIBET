//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/*
Native type extensions specific to TIBET. Note that the native types which
are collections (Array, Object, and String) are managed in the
TIBETCollections component. Notice that String is in that list. TIBET treats
String objects as collections of characters rather than a primitive type,
and supports a variety of collection API methods on them as a result. See
the TIBETCollections.js file for more information.
*/

//  ========================================================================
//  Object
//  ========================================================================

TP.defineCommonMethod('asEscapedHTML',
function() {

    /**
     * @method asEscapedHTML
     * @summary Converts the receiver into a String where any HTML entities
     *     have been converted into their escaped equivalent (i.e. have been
     *     "entitified")
     * @returns {String} The receiver with escaped HTML entities.
     */

    return TP.htmlLiteralsToEntities(TP.str(this));
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('asEscapedXML',
function() {

    /**
     * @method asEscapedXML
     * @summary Converts the receiver into a String where any XML entities have
     *     been converted into their escaped equivalent (i.e. have been
     *     "entitified")
     * @returns {String} The receiver with escaped XML entities.
     */

    return TP.xmlLiteralsToEntities(
                    TP.htmlEntitiesToXMLEntities(TP.str(this)));
});

//  ========================================================================
//  Array
//  ========================================================================

//  ========================================================================
//  Boolean
//  ========================================================================

Boolean.Type.defineMethod('parseString',
function(aString, sourceLocale) {

    /**
     * @method parseString
     * @summary Returns the Boolean value of the string provided, as localized
     *     for the target locale.
     * @param {String} aString The input string to parse.
     * @param {String|TP.i18n.Locale} sourceLocale A source xml:lang or
     *     TP.i18n.Locale defining the language or locale the string is now in.
     * @returns {Boolean} The localized Boolean value.
     */

    return TP.sys.getLocale().parseBoolean(aString, sourceLocale);
});

//  ========================================================================
//  Date
//  ========================================================================

/**
 * @summary Extensions that make using Date a bit easier.
 * @description This file contains a number of conveniences for using a Date
 *     object, including adding and subtracting days, determining whether a
 *     particular year is a leap year, getting the number of days in a
 *     particular month, etc.
 */

//  ------------------------------------------------------------------------
//  Patches
//  ------------------------------------------------------------------------

if ((new Date()).getYear() > 1900) {
    Date.Inst.defineMethod('getYear',
    function() {

        return this.getFullYear() - 1900;
    });

    Date.Inst.defineMethod('setYear',
    function(year) {

        return this.setFullYear(year + 1900);
    });
}

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  a regex capable of validating the lexical format and splitting the
//  various segments out into a match result for further testing
Date.Type.defineConstant('DURATION_REGEX',
    TP.rc('^([-])*P([0-9]+Y)*([0-9]+M)*([0-9]+D)*([T])*([0-9]+H)*([0-9]+M)*([0-9]+(\\u002e[0-9]+)*S)*$'));

//  indexes into the match result produced by the previous RegExp
Date.Type.defineConstant('DURATION_MINUS_INDEX', 1);
Date.Type.defineConstant('DURATION_YEAR_INDEX', 2);
Date.Type.defineConstant('DURATION_MONTH_INDEX', 3);
Date.Type.defineConstant('DURATION_DAY_INDEX', 4);
Date.Type.defineConstant('DURATION_T_INDEX', 5);
Date.Type.defineConstant('DURATION_HOUR_INDEX', 6);
Date.Type.defineConstant('DURATION_MINUTE_INDEX', 7);
Date.Type.defineConstant('DURATION_SECOND_INDEX', 8);
Date.Type.defineConstant('DURATION_TIME_INDEX', 9);

Date.Type.defineConstant('SPERMIN', 60);
Date.Type.defineConstant('SPERHOUR', 3600);
Date.Type.defineConstant('SPERDAY', 86400);

Date.Type.defineConstant('MSPERMIN', 60000);
Date.Type.defineConstant('MSPERHOUR', 3600000);
Date.Type.defineConstant('MSPERDAY', 86400000);

Date.Type.defineConstant('THIS_YEAR', TP.dc().getFullYear());

//  NOTE: use the daysInFebruary method for any methods that need it
Date.Type.defineConstant('DAYS_PER_MONTH',
                    TP.ac(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31));

//  NOTE: These are the default names that get loaded with the Date type.
//  If a TP.i18n.Locale gets loaded it will replace the functions that
//  get values from these arrays with ones from the locale that gets set.
//  Therefore, DO NOT access these arrays directly. Use getDayName(),
//  getShortDayName(), getMonthName(), getShortMonthName().
Date.Type.defineConstant('LONG_WEEKDAY_NAMES',
                    TP.ac('Sunday', 'Monday', 'Tuesday', 'Wednesday',
                            'Thursday', 'Friday', 'Saturday'));

Date.Type.defineConstant('SHORT_WEEKDAY_NAMES',
                    TP.ac('Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'));

Date.Type.defineConstant('LONG_MONTH_NAMES',
                    TP.ac('January', 'February', 'March', 'April', 'May',
                            'June', 'July', 'August', 'September',
                            'October', 'November', 'December'));

Date.Type.defineConstant('SHORT_MONTH_NAMES',
                    TP.ac('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
                            'Aug', 'Sep', 'Oct', 'Nov', 'Dec'));

Date.Type.defineConstant('LOCALTIME_TOKENS',
    TP.hc(
    'd', function(target) {

        return target.getDayOfMonth();
    },
    'dd', function(target) {

        return '#{00}'.transformNumber(target.getDayOfMonth());
    },
    'ddd', function(target) {

        return target.getShortDayName();
    },
    'dddd', function(target) {

        return target.getDayName();
    },
    'dw', function(target) {

        return target.getISODayOfWeek();
    },
    'dy', function(target) {

        return '#{000}'.transformNumber(target.getDayOfYear());
    },
    'ww', function(target) {

        return '#{00}'.transformNumber(target.getISOWeek());
    },
    'm', function(target) {

        return target.getISOMonth();
    },
    'mm', function(target) {

        return '#{00}'.transformNumber(target.getISOMonth());
    },
    'mmm', function(target) {

        return target.getShortMonthName();
    },
    'mmmm', function(target) {

        return target.getMonthName();
    },
    'yy', function(target) {

        return target.getFullYear().asString().slice(2);
    },
    'yyyy', function(target) {

        return target.getFullYear();
    },
    'h', function(target) {

        var hours;

        hours = target.getHours();

        if (hours > 12) {
            hours -= 12;
        }
        return hours;
    },
    'hi', function(target) {

        var hours;

        hours = target.getHours();

        return hours;
    },
    'hh', function(target) {

        var hours;

        hours = target.getHours();

        if (hours > 12) {
            hours -= 12;
        }
        return '#{00}'.transformNumber(hours);
    },
    'hhi', function(target) {

        var hours;

        hours = target.getHours();

        return '#{00}'.transformNumber(hours);
    },
    'mn', function(target) {

        return target.getMinutes();
    },
    'mmn', function(target) {

        return '#{00}'.transformNumber(target.getMinutes());
    },
    's', function(target) {

        return target.getSeconds();
    },
    'ss', function(target) {

        return '#{00}'.transformNumber(target.getSeconds());
    },
    'f', function(target) {

        return '#{0}'.transformNumber(target.getMilliseconds());
    },
    'ff', function(target) {

        return '#{00}'.transformNumber(target.getMilliseconds());
    },
    'fff', function(target) {

        return '#{000}'.transformNumber(target.getMilliseconds());
    },
    'ffff', function(target) {

        return '#{0000}'.transformNumber(target.getMilliseconds());
    },
    'fffff', function(target) {

        return '#{00000}'.transformNumber(target.getMilliseconds());
    },
    'ffffff', function(target) {

        return '#{000000}'.transformNumber(target.getMilliseconds());
    },
    'fffffff', function(target) {

        return '#{0000000}'.transformNumber(target.getMilliseconds());
    },
    'ffffffff', function(target) {

        return '#{00000000}'.transformNumber(target.getMilliseconds());
    },
    'fffffffff', function(target) {

        return '#{000000000}'.transformNumber(target.getMilliseconds());
    },
    'AMPM', function(target) {

        if (target.getHours() > 12) {
            return 'PM';
        }
        return 'AM';
    },
    'ampm', function(target) {

        if (target.getHours() > 12) {
            return 'pm';
        }
        return 'am';
    },
    'AP', function(target) {

        if (target.getHours() > 12) {
            return 'P';
        }
        return 'A';
    },
    'ap', function(target) {

        if (target.getHours() > 12) {
            return 'p';
        }
        return 'a';
    }
    ));

Date.Type.defineConstant('UTC_TOKENS',
        TP.hc(
    'd', function(target) {

        return target.getUTCDayOfMonth();
    },
    'dd', function(target) {

        return '#{00}'.transformNumber(target.getUTCDayOfMonth());
    },
    'ddd', function(target) {

        return target.getUTCShortDayName();
    },
    'dddd', function(target) {

        return target.getUTCDayName();
    },
    'dw', function(target) {

        return target.getUTCISODay();
    },
    'dy', function(target) {

        return '#{000}'.transformNumber(target.getUTCDayOfYear());
    },
    'ww', function(target) {

        return '#{00}'.transformNumber(target.getUTCISOWeek());
    },
    'm', function(target) {

        return target.getUTCISOMonth();
    },
    'mm', function(target) {

        return '#{00}'.transformNumber(target.getUTCISOMonth());
    },
    'mmm', function(target) {

        return target.getUTCShortMonthName();
    },
    'mmmm', function(target) {

        return target.getUTCMonthName();
    },
    'yy', function(target) {

        return target.getUTCFullYear().asString().slice(2);
    },
    'yyyy', function(target) {

        return target.getUTCFullYear();
    },
    'h', function(target) {

        var hours;

        hours = target.getUTCHours();

        if (hours > 12) {
            hours -= 12;
        }
        return hours;
    },
    'hi', function(target) {

        var hours;

        hours = target.getUTCHours();

        return hours;
    },
    'hh', function(target) {

        var hours;

        hours = target.getUTCHours();

        if (hours > 12) {
            hours -= 12;
        }
        return '#{00}'.transformNumber(hours);
    },
    'hhi', function(target) {

        var hours;

        hours = target.getUTCHours();

        return '#{00}'.transformNumber(hours);
    },
    'mn', function(target) {

        return target.getUTCMinutes();
    },
    'mmn', function(target) {

        return '#{00}'.transformNumber(target.getUTCMinutes());
    },
    's', function(target) {

        return target.getUTCSeconds();
    },
    'ss', function(target) {

        return '#{00}'.transformNumber(target.getUTCSeconds());
    },
    'f', function(target) {

        return '#{0}'.transformNumber(target.getUTCMilliseconds());
    },
    'ff', function(target) {

        return '#{00}'.transformNumber(target.getUTCMilliseconds());
    },
    'fff', function(target) {

        return '#{000}'.transformNumber(target.getUTCMilliseconds());
    },
    'ffff', function(target) {

        return '#{0000}'.transformNumber(target.getUTCMilliseconds());
    },
    'fffff', function(target) {

        return '#{00000}'.transformNumber(target.getUTCMilliseconds());
    },
    'ffffff', function(target) {

        return '#{000000}'.transformNumber(target.getUTCMilliseconds());
    },
    'fffffff', function(target) {

        return '#{0000000}'.transformNumber(target.getUTCMilliseconds());
    },
    'ffffffff', function(target) {

        return '#{00000000}'.transformNumber(target.getUTCMilliseconds());
    },
    'fffffffff', function(target) {

        return '#{000000000}'.transformNumber(target.getUTCMilliseconds());
    },
    'AMPM', function(target) {

        if (target.getUTCHours() > 12) {
            return 'PM';
        }
        return 'AM';
    },
    'ampm', function(target) {

        if (target.getUTCHours() > 12) {
            return 'pm';
        }
        return 'am';
    },
    'AP', function(target) {

        if (target.getUTCHours() > 12) {
            return 'P';
        }
        return 'A';
    },
    'ap', function(target) {

        if (target.getUTCHours() > 12) {
            return 'p';
        }
        return 'a';
    }
    ));

Date.Type.defineConstant('FORMATS',
    TP.hc('MMDDYY', '%{mm}%{dd}%{yy}',
            'MMDDYYYY', '%{mm}%{dd}%{yyyy}',
            'MM-DD-YY', '%{mm}-%{dd}-%{yy}',
            'MM-DD-YYYY', '%{mm}-%{dd}-%{yyyy}',
            'HH:MM ampm', '%{hh}:%{mn}%{ampm}',     //  NOTE the MM->mn here
            'HH:MM AP', '%{hh}:%{mn} %{AP}',        //  NOTE the MM->mn here
            'HH:MM ap', '%{hh}:%{mn} %{ap}',        //  NOTE the MM->mn here
            'ISO_SHORT', '%{yyyy}-%{mm}-%{dd} %{hhi}:%{mmn}:%{ss}',
            'HTTP_FORMAT', '%{ddd}, %{d} %{mmm} %{yyyy} %{hhi}:%{mmn}:%{ss}'
        ));

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  Cache the start and end DST dates for this year for higher performance
//  NB: These *MUST* be recomputed if a new locale is installed.
Date.Type.defineAttribute('thisYearStartDSTDate');
Date.Type.defineAttribute('thisYearEndDSTDate');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

Date.Type.defineMethod('addDurations',
function(firstDuration, secondDuration) {

    /**
     * @method addDurations
     * @summary Returns a new xs:duration formatted string representing the two
     *     durations added together.
     * @param {String} firstDuration An xs:duration formatted string.
     * @param {String} secondDuration An xs:duration formatted string.
     * @exception TP.sig.InvalidParameter
     * @returns {String} A new xs:duration formatted string value.
     */

    var s1,
        s2,

        sum;

    if (TP.notValid(s1 = Date.getSecondsInDuration(firstDuration))) {
        return this.raise('TP.sig.InvalidParameter',
                'First duration not a valid duration string.');
    }

    if (TP.notValid(s2 = Date.getSecondsInDuration(secondDuration))) {
        return this.raise('TP.sig.InvalidParameter',
                'Second duration not a valid duration string.');
    }

    sum = s1 + s2;

    return Date.normalizeDuration('PT' + sum + 'S');
});

//  ------------------------------------------------------------------------

Date.Type.defineMethod('normalizeDuration',
function(aDuration) {

    /**
     * @method normalizeDuration
     * @summary Returns a "normalized" duration in which the values of all day,
     *     hour, minute, and second values have been adjusted to their minimal
     *     values without altering the specified duration's length.
     * @param {String} aDuration The xs:duration formatted string to normalize.
     * @returns {String} An xs:duration formatted string.
     */

    var sum,

        years,
        months,

        days,
        hours,
        minutes,
        seconds;

    if (TP.notValid(sum = Date.getMonthsInDuration(aDuration))) {
        return this.raise('TP.sig.InvalidDuration');
    }

    years = parseInt(sum / 12, 10);
    sum -= years * 12;
    months = sum;

    sum = Date.getSecondsInDuration(aDuration);

    days = parseInt(sum / Date.SPERDAY, 10);
    sum -= days * Date.SPERDAY;

    hours = parseInt(sum / Date.SPERHOUR, 10);
    sum -= hours * Date.SPERHOUR;

    minutes = parseInt(sum / Date.SPERMIN, 10);
    sum -= minutes * Date.SPERMIN;

    seconds = sum;

    return TP.join('P', years, 'Y', months, 'M', days, 'DT', hours, 'H',
                    minutes, 'M', seconds, 'S');
});

//  ------------------------------------------------------------------------

Date.Type.defineMethod('constructAtEpoch',
function() {

    /**
     * @method constructAtEpoch
     * @summary Returns a new Date at the beginning of the epoch.
     * @description This method returns a new Date with all of its settings set
     *     to 0. This gives a Date from the beginning of when Javascript can
     *     give a date (that is, January 1, 1970, UTC).
     * @returns {Date} A new Date set to the beginning of the epoch.
     */

    var newDate;

    newDate = this.construct();
    newDate.setTime(0);

    return newDate;
});

//  ------------------------------------------------------------------------

Date.Type.defineMethod('constructDayOne',
function(aYear) {

    /**
     * @method constructDayOne
     * @summary Returns a date representing the first day (at exactly 00:00:00)
     *     of the year provided.
     * @param {Number} aYear The year to compute for.
     * @returns {Date} A Date object representing YYYY-01-01T00:00:00.
     */

    return TP.dc(TP.join('01 Jan ', aYear, ' 00:00:00'));
});

//  ------------------------------------------------------------------------

Date.Type.defineMethod('constructUTCDayOne',
function(aYear) {

    /**
     * @method constructUTCDayOne
     * @summary Returns a date representing the first day (at exactly 00:00:00)
     *     of the year provided in UTC.
     * @param {Number} aYear The year to compute for.
     * @returns {Date} A Date object representing YYYY-01-01T00:00:00Z.
     */

    return TP.dc(TP.join('01 Jan ', aYear, ' 00:00:00 GMT'));
});

//  ------------------------------------------------------------------------

Date.Type.defineMethod('daysInFebruary',
function(aYear) {

    /**
     * @method daysInFebruary
     * @summary Return the number of days in February for the year provided.
     * @param {Number} aYear The year to return the number of days in February
     *     for.
     * @exception TP.sig.InvalidParameter
     * @returns {Number} The number of days in February for aYear.
     */

    if (this.isLeapYear(aYear)) {
        return 29;
    }

    return 28;
});

//  ------------------------------------------------------------------------

Date.Type.defineMethod('daysInMonth',
function(aMonth, aYear) {

    /**
     * @method daysInMonth
     * @summary Return the number of days in the month/year provided.
     * @param {Number} aMonth A month number, starting with 1 for January (note
     *     the difference from the getMonth() return value here. Use
     *     getISOMonth()). Defaults to the current month.
     * @param {Number} aYear The year number to check against. Defaults to the
     *     current year.
     * @returns {Number} The number of days in the month and year provided.
     */

    var month,
        year;

    month = aMonth;
    if (TP.notValid(month)) {
        month = TP.dc().getISOMonth();
    }

    //  if month is feb, adjust for leap years as needed
    if (month === 2) {
        year = aYear;
        if (TP.notValid(year)) {
            year = TP.dc().getFullYear();
        }
        return this.daysInFebruary(year);
    }

    return this.DAYS_PER_MONTH.at(month - 1);
});

//  ------------------------------------------------------------------------

Date.Type.defineMethod('daysInYear',
function(aYear) {

    /**
     * @method daysInYear
     * @summary Return the number of days in the year provided.
     * @param {Number} aYear The year to return the number of days in.
     * @exception TP.sig.InvalidParameter
     * @returns {Number} The number of days in the year provided.
     */

    if (this.isLeapYear(aYear)) {
        return 366;
    }

    return 365;
});

//  ------------------------------------------------------------------------

Date.Type.defineMethod('fromDate',
function(aDate) {

    /**
     * @method fromDate
     * @summary Returns the Date provided.
     * @param {Date} aDate An existing Date object.
     * @returns {Date} The date provided.
     */

    return aDate;
});

//  ------------------------------------------------------------------------

Date.Type.defineMethod('fromString',
function(aString, sourceLocale) {

    /**
     * @method fromString
     * @summary Return the Date as parsed from the string passed in. This
     *     routine will attempt to parse the incoming date string using the
     *     current Date parsing pipeline. The default format is ISO 8601:
     *     CCCC[-]MM[-]DDTHH[:]MM[:]SS[.ss][Z|[+-]th:tm].
     * @description Date parsing from strings is a weak area in JavaScript, one
     *     that we've tried to address with TIBET. The first step in this
     *     process is to create an TP.iso.ISO8601 type which can parse and
     *     format date strings. The second is to allow you to add custom date
     *     parsers via the addParser method. And finally, we automatically
     *     attempt to parse using the current TP.i18n.Locale type in effect, so
     *     localized input can be managed.
     * @param {String} aString The Date to be parsed.
     * @param {TP.i18n.Locale|String} sourceLocale A source xml:lang or
     *     TP.i18n.Locale defining the language the string is now in.
     * @exception TP.sig.InvalidParameter
     * @returns {Date} A new Date object representing the Date encoded in the
     *     parameter.
     */

    //  kernel isn't loaded completely? use native call
    if (!TP.sys.hasKernel()) {
        return new Date(aString);
    }

    return new Date(this.parse(aString, sourceLocale));
});

//  ------------------------------------------------------------------------

Date.Type.defineMethod('getDSTEndDate',
function(aYear) {

    /**
     * @method getDSTEndDate
     * @summary Returns a new Date which is the Daylight Saving Time end date
     *     for the United States.
     * @param {Number} aYear The year to compute the Daylight Saving Time end
     *     date for.
     * @returns {Date} A new Date set to the end date for the supplied year's
     *     Daylight Saving Time.
     */

    var endDay,
        endDate;

    if (!TP.isNumber(aYear)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  Here, we compute the day in October when DST will end. Note that
    //  this is valid for the U.S. only. If a TP.i18n.Locale gets loaded it
    //  should override this method and provide the correct end day for DST
    //  (Summer) time.

    /* eslint-disable no-extra-parens */
    endDay = (31 - (((aYear * 5) / 4).floor() + 1) % 7);
    /* eslint-enable no-extra-parens */

    //  DST ends on the last Sunday in October at 02:00 in the U.S.

    //  NB: October to JS is '9', since JS counts months starting at 0
    endDate = TP.dc(aYear, 9, endDay, 2);

    //  For EU (this needs to go into some locales to become live):
    //  DST ends on the last Sunday in October at 01:00 in the E.U.

    //  endDay = (31 - (((aYear * 5) / 4).floor() + 1) % 7);
    //  endDate = TP.dc(aYear,9,endDay,1);

    return endDate;
});

//  ------------------------------------------------------------------------

Date.Type.defineMethod('getDSTStartDate',
function(aYear) {

    /**
     * @method getDSTStartDate
     * @summary Returns a new Date which is the Daylight Saving Time start date
     *     for the United States.
     * @param {Number} aYear The year to compute the Daylight Saving Time start
     *     date for.
     * @returns {Date} A new Date set to the start date for the supplied year's
     *     Daylight Saving Time.
     */

    var startDay,
        startDate;

    if (!TP.isNumber(aYear)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  Here, we compute the day in April when DST will start. Note that
    //  this is valid for the U.S. only. If a TP.i18n.Locale gets loaded it
    //  should override this method and provide the correct start day for
    //  DST (Summer) time.

    /* eslint-disable no-extra-parens */
    startDay = (2 + (6 * aYear) - (aYear / 4).floor()) % 7 + 1;
    /* eslint-enable no-extra-parens */

    //  DST starts on the first Sunday in April at 02:00 in the U.S.

    //  NB: April to JS is '3', since JS counts months starting at 0
    startDate = TP.dc(aYear, 3, startDay, 2);

    //  For EU (this needs to go into some locales to become live):
    //  DST starts on the last Sunday in March at 01:00 in the E.U.

    //  startDay = (31 - (((aYear * 5) / 4).floor() + 4) % 7);
    //  startDate = TP.dc(aYear,2,startDay,1);

    return startDate;
});

//  ------------------------------------------------------------------------

Date.Type.defineMethod('getMillisecondsInDuration',
function(aDuration) {

    /**
     * @method getMillisecondsInDuration
     * @summary Returns the number of milliseconds represented by the
     *     xs:duration provided. Note that the implementation does not use
     *     information other than the D, H, M, and S time components.
     * @param {xs:duration} aDuration The duration to convert.
     * @returns {Number} The number of milliseconds as a decimal value.
     */

    var theMatch,
        val,
        str,
        units;

    if (!TP.isString(aDuration)) {
        return this.raise('TP.sig.InvalidDuration');
    }

    str = aDuration;

    if (!Date.DURATION_REGEX.test(str)) {
        return this.raise('TP.sig.InvalidDuration');
    }

    //  split into chunks we can manage
    theMatch = str.match(Date.DURATION_REGEX);

    //  start with zero unit count
    units = 0;

    //  compute days value if any
    if (TP.notEmpty(val = theMatch.at(Date.DURATION_DAY_INDEX))) {
        units += parseInt(val.slice(0, -1), 10) * 86400;
    }

    //  compute hours value if any
    if (TP.notEmpty(val = theMatch.at(Date.DURATION_HOUR_INDEX))) {
        units += parseInt(val.slice(0, -1), 10) * 3600;
    }

    //  add minute value if any
    if (TP.notEmpty(val = theMatch.at(Date.DURATION_MINUTE_INDEX))) {
        units += parseInt(val.slice(0, -1), 10) * 60;
    }

    //  multiply the total number of units by 1000 to get an accurate
    //  millisecond number
    units = units * 1000;

    //  add second value if any
    if (TP.notEmpty(val = theMatch.at(Date.DURATION_SECOND_INDEX))) {
        units += parseInt(parseFloat(val.slice(0, -1)) * 1000, 10);
    }

    //  TODO:   verify this against XForms spec
    //  is it a negative duration? then it's a negative number of units
    if (TP.notEmpty(theMatch.at(Date.DURATION_MINUS_INDEX))) {
        return 0 - units;
    }

    return units;
});

//  ------------------------------------------------------------------------

Date.Type.defineMethod('getMonthsInDuration',
function(aDuration) {

    /**
     * @method getMonthsInDuration
     * @summary Returns the number of months represented by the xs:duration
     *     provided. Note that the implementation does not use information other
     *     than the Y and M segments in the duration.
     * @param {xs:duration} aDuration The duration to convert.
     * @returns {Number} The number of months as an integer value.
     */

    var theMatch,
        val,
        str,
        units;

    if (!TP.isString(aDuration)) {
        return this.raise('TP.sig.InvalidDuration');
    }

    str = aDuration;

    if (!Date.DURATION_REGEX.test(str)) {
        return this.raise('TP.sig.InvalidDuration');
    }

    //  split into chunks we can manage
    theMatch = str.match(Date.DURATION_REGEX);

    //  start with zero month count
    units = 0;

    //  compute year/month value if any
    if (TP.notEmpty(val = theMatch.at(Date.DURATION_YEAR_INDEX))) {
        units += parseInt(val.slice(0, -1), 10) * 12;
    }

    //  add month value if any
    if (TP.notEmpty(val = theMatch.at(Date.DURATION_MONTH_INDEX))) {
        units += parseInt(val.slice(0, -1), 10);
    }

    //  TODO:   verify this against XForms spec
    //  is it a negative duration? then it's a negative number of months
    if (TP.notEmpty(theMatch.at(Date.DURATION_MINUS_INDEX))) {
        return 0 - units;
    }

    return units;
});

//  ------------------------------------------------------------------------

Date.Type.defineMethod('getSecondsInDuration',
function(aDuration) {

    /**
     * @method getSecondsInDuration
     * @summary Returns the number of seconds represented by the xs:duration
     *     provided. Note that the implementation does not use information other
     *     than the D, H, M, and S time components.
     * @param {xs:duration} aDuration The duration to convert.
     * @returns {Number} The number of seconds as a decimal value.
     */

    var theMatch,
        val,
        str,
        units;

    if (!TP.isString(aDuration)) {
        return this.raise('TP.sig.InvalidDuration');
    }

    str = aDuration;

    if (!Date.DURATION_REGEX.test(str)) {
        return this.raise('TP.sig.InvalidDuration');
    }

    //  split into chunks we can manage
    theMatch = str.match(Date.DURATION_REGEX);

    //  start with zero unit count
    units = 0;

    //  compute days value if any
    if (TP.notEmpty(val = theMatch.at(Date.DURATION_DAY_INDEX))) {
        units += parseInt(val.slice(0, -1), 10) * 86400;
    }

    //  compute hours value if any
    if (TP.notEmpty(val = theMatch.at(Date.DURATION_HOUR_INDEX))) {
        units += parseInt(val.slice(0, -1), 10) * 3600;
    }

    //  add minute value if any
    if (TP.notEmpty(val = theMatch.at(Date.DURATION_MINUTE_INDEX))) {
        units += parseInt(val.slice(0, -1), 10) * 60;
    }

    //  add second value if any
    if (TP.notEmpty(val = theMatch.at(Date.DURATION_SECOND_INDEX))) {
        units += parseInt(val.slice(0, -1), 10);
    }

    //  TODO:   verify this against XForms spec
    //  is it a negative duration? then it's a negative number of units
    if (TP.notEmpty(theMatch.at(Date.DURATION_MINUS_INDEX))) {
        return 0 - units;
    }

    return units;
});

//  ------------------------------------------------------------------------

Date.Type.defineMethod('isLeapYear',
function(aYear) {

    /**
     * @method isLeapYear
     * @summary Return true if the year provided is a leap year.
     * @param {Number} aYear The year to test.
     * @exception TP.sig.InvalidParameter
     * @returns {Boolean} Whether or not the provided year is a leap year.
     */

    if (!TP.isNumber(aYear)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    /* eslint-disable no-extra-parens */

    //  multiples of 400 are always a leap year
    if ((aYear % 400) === 0) {
        return true;
    }

    //  can't be a leap year if it isn't divisible by 4
    if ((aYear % 4) !== 0) {
        return false;
    }

    //  we know it's divisible by 4 and not a multiple of 400 so we only
    //  need to say false if its a century mark
    if ((aYear % 100) === 0) {
        return false;
    }

    /* eslint-enable no-extra-parens */

    return true;
});

//  ------------------------------------------------------------------------

Date.Type.defineMethod('today',
function() {

    /**
     * @method today
     * @summary Returns a date representing the current day (at exactly
     *     00:00:00).
     * @returns {Date} A Date object representing today.
     */

    var today;

    today = TP.dc();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);

    return today;
});

//  ------------------------------------------------------------------------

Date.Type.defineMethod('todayUTC',
function() {

    /**
     * @method todayUTC
     * @summary Returns a date representing the current day (at exactly
     *     00:00:00) UTC.
     * @returns {Date} A Date object representing today in UTC.
     */

    var today;

    today = TP.dc();

    today.setUTCHours(0);
    today.setUTCMinutes(0);
    today.setUTCSeconds(0);
    today.setUTCMilliseconds(0);

    return today;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

Date.Inst.defineMethod('add',
function(aValue) {

    /**
     * @method add
     * @summary Adds a number of milliseconds or duration to the receiver,
     *     returning the new date produced.
     * @param {Number|String} aValue A number or string value defining the
     *     quantity to be added to the receiver. Numbers and strings are treated
     *     as durations. NOTE that this means the number should be a millisecond
     *     count defining a span of time, not a date.
     * @returns {Date} A new Date instance.
     */

    if (TP.isNumber(aValue)) {
        return TP.dc(this.getTime() + aValue);
    } else if (TP.isString(aValue)) {
        return this.addDuration(aValue);
    }

    return this.raise('TP.sig.InvalidParameter');
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('addDuration',
function(aDuration) {

    /**
     * @method addDuration
     * @summary Returns a new Date instance that is the specified duration
     *     further into the future.
     * @param {String} aDuration An xs:duration formatted string defining the
     *     duration to add.
     * @exception TP.sig.InvalidParameter
     * @returns {Date} A Date object set numDays more days than the receiver.
     */

    var aDate,
        months,
        secs;

    //  first step is to get the months in the duration and get them added
    //  to the current date's value so we advance the calendar by that
    //  number of months...
    months = Date.getMonthsInDuration(aDuration);

    aDate = TP.dc(this.getTime());
    aDate.setUTCMonth(aDate.getUTCMonth() + months);

    secs = Date.getSecondsInDuration(aDuration);

    /* eslint-disable no-extra-parens */
    return TP.dc(aDate.getTime() + (secs * 1000));
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('formatHTTPDate',
function() {

    /**
     * @method formatHTTPDate
     * @summary Returns the 'HTTP Date' format of the receiver.
     * @returns {String} The receiver formatted into HTTP Date format.
     */

    var str;

    str = TP.join('HTTP_FORMAT'.transformDate(this),
                    ' ',
                    this.getISOTimezone().strip(/[+:]/g));

    return str;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getDayName',
function() {

    /**
     * @method getDayName
     * @summary Returns the localized long format name of the day computed from
     *     the receiver.
     * @returns {String} The long format name of the day.
     */

    return TP.sys.getLocale().localizeString(
                                Date.LONG_WEEKDAY_NAMES.at(this.getDay()));
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getDayOfMonth',
function() {

    /**
     * @method getDayOfMonth
     * @summary Returns the numeric day, for example 20 for the 20th of the
     *     month.
     * @returns {Number} The numerical day number, starting with 1.
     */

    return this.getDate();
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getDayOfWeek',
function() {

    /**
     * @method getDayOfWeek
     * @summary Returns the numeric day of the week using the JavaScript view
     *     of weeks so Sunday is day 0,and Saturday is day 6. Use getISODay to
     *     return ISO 8601 day of week numbers.
     * @returns {Number} The numerical day number, starting with 1.
     */

    return this.getDay();
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getDayOfYear',
function() {

    /**
     * @method getDayOfYear
     * @summary Returns the numeric day of the year represented by the
     *     receiver.
     * @returns {Number}
     */

    return this.getDaysBetween(
                        TP.dc('01 Jan ' + this.getISOYear())) + 1;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getDaysBetween',
function(aDate) {

    /**
     * @method getDaysBetween
     * @summary Returns the number of days between the receiver and aDate.
     * @param {Date} aDate The date to use as the other boundary.
     * @exception TP.sig.InvalidParameter
     * @returns {Date} The number of days between the receiver and aDate.
     */

    if (!TP.isDate(aDate)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    return ((aDate.getTime() - this.getTime()) /
                Date.MSPERDAY).round().abs();
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getDaysExpired',
function() {

    /**
     * @method getDaysExpired
     * @summary Returns the number of days that have expired so far in the
     *     receiver's year.
     * @returns {Number} The number of days expired in the receiver's year.
     */

    var days,
        month,
        index;

    month = this.getMonth();
    days = this.getDate();

    for (index = 0; index < month; index++) {
        days += Date.DAYS_PER_MONTH[index];
    }

    /* eslint-disable no-extra-parens */
    if (Date.isLeapYear(this.getFullYear()) && (month > 1)) {
        days += 1;
    }
    /* eslint-enable no-extra-parens */

    return days;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getDaysLeft',
function() {

    /**
     * @method getDaysLeft
     * @summary Returns the number of days that are left in the receiver's
     *     year.
     * @returns {Number} The number of days left in the receiver's year.
     */

    return this.getDaysInYear() - this.getDaysExpired();
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getDaysInYear',
function() {

    /**
     * @method getDaysInYear
     * @summary Return the number of days in the receiver's year.
     * @returns {Number} The number of days in the year.
     */

    if (Date.isLeapYear(this.getFullYear())) {
        return 366;
    }

    return 365;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getDaysOfMonth',
function() {

    /**
     * @method getDaysOfMonth
     * @summary Returns an array of Date instances for the days of the month
     *     for the receiver's month.
     * @returns {Date[]} An array containing instances of Date.
     */

    var days,
        daysInMonth,

        i;

    days = TP.ac();
    daysInMonth = Date.daysInMonth(this.getISOMonth(),
                                    this.getFullYear());

    for (i = 0; i < daysInMonth; i++) {
        days.add(TP.dc(this.getFullYear(), this.getMonth(), i + 1));
    }

    return days;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getDaysOfWeek',
function() {

    /**
     * @method getDaysOfWeek
     * @summary Returns an array containing instances of Date for each day in
     *     the receiver's week.
     * @returns {Date[]} An array containing instances of Date.
     */

    var weekdays,
        ms,
        day,
        offset,
        sunday;

    //  calculate ms value of the sunday in week of day provided
    day = this.getDay();
    offset = day * Date.MSPERDAY;
    ms = this.getTime();
    sunday = ms - offset;

    /* eslint-disable no-extra-parens,no-implicit-coercion */

    //  construct array of ms values for that week
    weekdays = TP.ac();
    weekdays.add(sunday);
    weekdays.add(sunday + (1 * Date.MSPERDAY));
    weekdays.add(sunday + (2 * Date.MSPERDAY));
    weekdays.add(sunday + (3 * Date.MSPERDAY));
    weekdays.add(sunday + (4 * Date.MSPERDAY));
    weekdays.add(sunday + (5 * Date.MSPERDAY));
    weekdays.add(sunday + (6 * Date.MSPERDAY));

    /* eslint-enable no-extra-parens,no-implicit-coercion */

    //  convert ms values into date instances
    weekdays.convert(
            function(item) {

                return TP.dc(item);
            });

    return weekdays;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getISODay',
function() {

    /**
     * @method getISODay
     * @summary Returns the day number as defined by ISO 8601.
     * @description The ISO 8601 standard defines Monday as day 1 through Sunday
     *     day 7. JavaScript also defines Monday as day 1, but treats Sunday as
     *     day 0, not day 7. This routine returns Sunday's day number as 7 as
     *     defined by ISO 8601.
     * @returns {Number} The number of the receiver's day, according to ISO
     *     8601.
     */

    var day;

    day = this.getDay();

    /* eslint-disable no-extra-parens */
    //  If it's Sunday, return 7
    return (day === 0) ? 7 : day;
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getISOMonth',
function() {

    /**
     * @method getISOMonth
     * @summary Returns the month number as defined in ISO 8601, where months
     *     start with 1 for January rather than the 0 provided by native
     *     JavaScript.
     * @returns {Number} The calendar month number, starting with 1.
     */

    return this.getMonth() + 1;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getISOTime',
function(aFormat) {

    /**
     * @method getISOTime
     * @summary Returns the ISO 8601 time string for the receiver in the format
     *     provided.
     * @param {String} aFormat An TP.iso.ISO8601 time component FORMAT.
     * @returns {String} An ISO 8601 time string.
     */

    var format;

    if (TP.notEmpty(aFormat)) {
        if (/%/.test(aFormat)) {
            format = aFormat;
        } else {
            format = TP.iso.ISO8601.FORMATS.at(aFormat);
            if (TP.notValid(format)) {
                return this.raise('TP.sig.InvalidFormat',
                                    aFormat);
            }
        }
    } else {
        format = TP.iso.ISO8601.FORMATS.at('HH:MM:SS');
    }

    return this.as('TP.iso.ISO8601', format);
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getISOTimezone',
function() {

    /**
     * @method getISOTimezone
     * @summary Returns the timezone the browser is currently executing in in
     *     ISO standard notation (e.g. '-8:00').
     * @description This method returns the timezone expressed in the ISO
     *     standard notation. For 'Zulu' (UTC) time, this is the character 'Z'.
     *     For all other timezones, it is a plus or minus character ('+' or '-')
     *     followed by the hours offset, followed by a colon (':'), followed by
     *     the minutes offset. E.g. '+12:00'.
     * @returns {String} An ISO 8601 time zone string.
     */

    var offset,

        offsetHours,
        offsetMinutes,

        minuteString,
        hourString;

    offset = this.getTimezoneOffset();

    offsetHours = offset / 60;
    if (offsetHours === 0) {
        //  we're the same as UTC (that's 'Zulu' time for you military types
        //  out there). The ISO spec says to return 'Z'.
        return 'Z';
    }

    offsetMinutes = offset % 60;

    if (offsetMinutes === 0) {
        minuteString = '00';
    } else {
        minuteString = '#{0#}'.transformNumber(offsetMinutes);
    }

    //  This will strip a negative sign if we have one.
    hourString = '#{0#}'.transformNumber(offsetHours);

    //  For some reason, negative offsets mean that its 'UTC+'...
    if (offsetHours.isNegative()) {
        return TP.join('+', hourString, ':', minuteString);
    }

    return TP.join('-', hourString, ':', minuteString);
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getISOWeek',
function() {

    /**
     * @method getISOWeek
     * @summary Returns the week number as defined by ISO 8601.
     * @description Officially, week 1 of any year is the week that contains 4
     *     January (that is, the week that contains the first Thursday in
     *     January). Almost all years have 52 weeks, but years that start on a
     *     Thursday and leap years that start on a Wednesday have 53 weeks using
     *     this metric.
     *
     *     NB: This algorithm was discovered on the web page of Claus Tondering
     *     (claus@tondering.dk). He credits Stephan Potthast for it. Thanks to
     *     both Claus and Stephan!
     * @returns {Number} The number of the receiver's week, according to ISO
     *     8601.
     */

    var julianDay,
        d4,
        L,
        d1,

        weekNum;

    julianDay = this.getJulianDay().round();

    /* eslint-disable no-extra-parens */

    d4 = (julianDay + 31741 - (julianDay % 7)) % 146097 % 36524 % 1461;

    L = (d4 / 1460).floor();
    d1 = ((d4 - L) % 365) + L;

    weekNum = (d1 / 7).floor() + 1;

    /* eslint-enable no-extra-parens */

    return weekNum;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getISOYear',
function() {

    /**
     * @method getISOYear
     * @summary Returns the year number as defined in ISO 8601, also known in
     *     JavaScript as the "full year".
     * @returns {Number}
     */

    return this.getFullYear();
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getJulianDay',
function() {

    /**
     * @method getJulianDay
     * @summary Returns Julian day computed from the receiver.
     * @returns {Number} The number of the Julian day computed from the
     *     receiver.
     */

    var theMonth,
        theYear,
        theDate,
        theHour,
        theMinutes,
        theSeconds,
        theOffset,

        universalTime,

        julianDay;

    theMonth = this.getMonth() + 1;
    theYear = this.getFullYear();
    theDate = this.getDate();
    theHour = this.getHours();
    theMinutes = this.getMinutes();
    theSeconds = this.getSeconds();
    theOffset = this.getTimezoneOffset();

    universalTime = theHour + (theMinutes + theOffset) / 60.0 +
                                                    theSeconds / 3600.0;

    if (theMonth <= 2) {
        theMonth = theMonth + 12;
        theYear = theYear - 1;
    }

    julianDay = (365.25 * theYear).floor() +
                    (30.6001 * (theMonth + 1)).floor() -
                    15 + 1720996.5 + theDate + universalTime / 24.0;

    return julianDay;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getMonthName',
function() {

    /**
     * @method getMonthName
     * @summary Returns the long format name of the month computed from the
     *     receiver.
     * @returns {String} The long format name of the month.
     */

    return TP.sys.getLocale().localizeString(
                        Date.LONG_MONTH_NAMES.at(this.getMonth()));
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getShortDayName',
function() {

    /**
     * @method getShortDayName
     * @summary Returns the short format name of the day computed from the
     *     receiver.
     * @returns {String} The short format name of the day.
     */

    return TP.sys.getLocale().localizeString(
                        Date.SHORT_WEEKDAY_NAMES.at(this.getDay()));
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getShortMonthName',
function() {

    /**
     * @method getShortMonthName
     * @summary Returns the short format name of the month computed from the
     *     receiver.
     * @returns {String} The short format name of the month.
     */

    return TP.sys.getLocale().localizeString(
                        Date.SHORT_MONTH_NAMES.at(this.getMonth()));
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getStartOfMonth',
function() {

    /**
     * @method getStartOfMonth
     * @summary Returns the time in ms at which the current month started.
     * @returns {Number} The start of the current month in ms.
     */

    var ms,
        offset,
        newDay;

    //  Get today at the 'start' of the day
    newDay = Date.today();

    //  getDate returns the day of month, so we remove 1 to set the index to
    //  0 as JS wants it and compute the offset
    ms = newDay.getTime();
    offset = (newDay.getDate() - 1) * Date.MSPERDAY;

    return ms - offset;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getStartOfWeek',
function() {

    /**
     * @method getStartOfWeek
     * @summary Returns the time in ms at which the current week started
     *     (assuming weeks start on Sunday at 00:00.00.000).
     * @returns {Number} The start of the current week in ms.
     */

    var ms,
        offset,
        newDay;

    //  Get today at the 'start' of the day
    newDay = Date.today();

    //  get Day returns the proper day offset so we can use it
    ms = newDay.getTime();
    offset = newDay.getDay() * Date.MSPERDAY;

    return ms - offset;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getUTCDayName',
function() {

    /**
     * @method getUTCDayName
     * @summary Returns the localized long format name of the day computed from
     *     the receiver's UTC day.
     * @returns {String} The long format name of the day.
     */

    return TP.sys.getLocale().localizeString(
                        Date.LONG_WEEKDAY_NAMES.at(this.getUTCDay()));
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getUTCDayOfMonth',
function() {

    /**
     * @method getUTCDayOfMonth
     * @summary Returns the numeric day, for example 20 for the 20th of the
     *     month for the receiver's UTC day.
     * @returns {Number} The numerical day number, starting with 1.
     */

    return this.getUTCDate();
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getUTCDayOfWeek',
function() {

    /**
     * @method getUTCDayOfWeek
     * @summary Returns the numeric day of the week using the JavaScript view
     *     of weeks so Sunday is day 0,and Saturday is day 6. Use getISODay to
     *     return ISO 8601 day of week numbers.
     * @returns {Number} The numerical day number, starting with 1.
     */

    return this.getUTCDay();
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getUTCDayOfYear',
function() {

    /**
     * @method getUTCDayOfYear
     * @summary Returns the numeric day of the year represented by the
     *     receiver.
     * @returns {Number}
     */

    return this.getDaysBetween(
                    TP.dc('01 Jan ' + this.getUTCISOYear())) + 1;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getUTCDaysExpired',
function() {

    /**
     * @method getUTCDaysExpired
     * @summary Returns the number of days that have expired so far in the
     *     receiver's year.
     * @returns {Number} The number of days expired in the receiver's year.
     */

    var days,
        month,
        index;

    month = this.getUTCMonth();
    days = this.getUTCDate();

    for (index = 0; index < month; index++) {
        days += Date.DAYS_PER_MONTH[index];
    }

    if (Date.isLeapYear(this.getUTCFullYear()) && month > 1) {
        days += 1;
    }

    return days;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getUTCDaysLeft',
function() {

    /**
     * @method getUTCDaysLeft
     * @summary Returns the number of days that are left in the receiver's
     *     year.
     * @returns {Number} The number of days left in the receiver's year.
     */

    return this.getUTCDaysInYear() - this.getUTCDaysExpired();
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getUTCDaysInYear',
function() {

    /**
     * @method getUTCDaysInYear
     * @summary Return the number of days in the receiver's year.
     * @returns {Number} The number of days in the year.
     */

    if (Date.isLeapYear(this.getUTCFullYear())) {
        return 366;
    }

    return 365;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getUTCDaysOfMonth',
function() {

    /**
     * @method getUTCDaysOfMonth
     * @summary Returns an array of Date instances for the days of the
     *     receiver's month.
     * @returns {Date[]} An array containing instances of Date.
     */

    var days,

        daysInMonth,
        index;

    days = TP.ac();

    daysInMonth = Date.daysInMonth(this.getUTCISOMonth(),
                                    this.getUTCFullYear());

    for (index = 0; index < daysInMonth; index++) {
        days.add(TP.dc(this.getUTCFullYear(),
                        this.getUTCISOMonth(),
                        index + 1));
    }

    return days;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getUTCDaysOfWeek',
function() {

    /**
     * @method getUTCDaysOfWeek
     * @summary Returns an array containing instances of Date for each day in
     *     the receiver's week.
     * @returns {Date[]} An array containing instances of Date.
     */

    var weekdays,
        ms,
        day,
        offset,
        sunday;

    //  calculate ms value of the sunday in week of day provided
    day = this.getUTCDay();
    offset = day * Date.MSPERDAY;
    ms = this.getTime();
    sunday = ms - offset;

    /* eslint-disable no-extra-parens,no-implicit-coercion */

    //  construct array of ms values for that week
    weekdays = TP.ac();
    weekdays.add(sunday);
    weekdays.add(sunday + (1 * Date.MSPERDAY));
    weekdays.add(sunday + (2 * Date.MSPERDAY));
    weekdays.add(sunday + (3 * Date.MSPERDAY));
    weekdays.add(sunday + (4 * Date.MSPERDAY));
    weekdays.add(sunday + (5 * Date.MSPERDAY));
    weekdays.add(sunday + (6 * Date.MSPERDAY));

    /* eslint-enable no-extra-parens,no-implicit-coercion */

    //  convert ms values into date instances
    weekdays.convert(
            function(item) {

                return TP.dc(item);
            });

    return weekdays;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getUTCISODay',
function() {

    /**
     * @method getUTCISODay
     * @summary Returns the day number as defined by ISO 8601.
     * @description The ISO 8601 standard defines Monday as day 1 through Sunday
     *     day 7. JavaScript also defines Monday as day 1, but treats Sunday as
     *     day 0, not day 7. This routine returns Sunday's day number as 7 as
     *     defined by ISO 8601.
     * @returns {Number} The number of the receiver's day, according to ISO
     *     8601.
     */

    var day;

    day = this.getUTCDay();

    /* eslint-disable no-extra-parens */
    //  If it's Sunday, return 7
    return (day === 0) ? 7 : day;
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getUTCISOMonth',
function() {

    /**
     * @method getUTCISOMonth
     * @summary Returns the month number as defined in ISO 8601, where months
     *     start with 1 for January rather than the 0 provided by native
     *     JavaScript.
     * @returns {Number} The calendar month number, starting with 1.
     */

    return this.getUTCMonth() + 1;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getUTCISOTime',
function(aFormat) {

    /**
     * @method getUTCISOTime
     * @summary Returns the ISO 8601 time string for the receiver in the format
     *     provided.
     * @param {String} aFormat An ISO8601 time component FORMAT.
     * @returns {String} An ISO 8601 time string.
     */

    var format;

    if (TP.notEmpty(aFormat)) {
        if (/%/.test(aFormat)) {
            format = aFormat;
        } else {
            format = TP.iso.ISO8601.FORMATS.at(aFormat);
        }

        //  has to be valid and end in either + or Z to force UTC lookups
        if (TP.notValid(format) || !/[Z\+]$/.test(format)) {
            return this.raise('TP.sig.InvalidFormat', aFormat);
        }
    } else {
        //  NOTE the trailing Z here to force Zulu time
        format = TP.iso.ISO8601.FORMATS.at('HH:MM:SSZ');
    }

    return this.as('TP.iso.ISO8601', format);
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getUTCISOTimezone',
function() {

    /**
     * @method getUTCISOTimezone
     * @summary Returns the timezone the browser is currently executing in in
     *     ISO standard notation (e.g. '-8:00'). For UTC time this is always the
     *     constant value 'Z'.
     * @returns {String}
     */

    return 'Z';
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getUTCISOWeek',
function() {

    /**
     * @method getUTCISOWeek
     * @summary Returns the week number as defined by ISO 8601.
     * @description Officially, week 1 of any year is the week that contains 4
     *     January (that is, the week that contains the first Thursday in
     *     January). Almost all years have 52 weeks, but years that start on a
     *     Thursday and leap years that start on a Wednesday have 53 weeks using
     *     this metric.
     *
     *     NB: This algorithm was discovered on the web page of Claus Tondering
     *     (claus@tondering.dk). He credits Stephan Potthast for it. Thanks to
     *     both Claus and Stephan!
     * @returns {Number} The number of the receiver's week, according to ISO
     *     8601.
     */

    var julianDay,
        d4,
        L,
        d1,

        weekNum;

    julianDay = this.getUTCJulianDay().round();

    /* eslint-disable no-extra-parens */

    d4 = (julianDay + 31741 - (julianDay % 7)) % 146097 % 36524 % 1461;

    L = (d4 / 1460).floor();
    d1 = ((d4 - L) % 365) + L;

    weekNum = (d1 / 7).floor() + 1;

    /* eslint-enable no-extra-parens */

    return weekNum;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getUTCISOYear',
function() {

    /**
     * @method getUTCISOYear
     * @summary Returns the year number as defined in ISO 8601, also known in
     *     JavaScript as the "full year".
     * @returns {Number}
     */

    return this.getUTCFullYear();
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getUTCJulianDay',
function() {

    /**
     * @method getUTCJulianDay
     * @summary Returns Julian day computed from the receiver.
     * @returns {Number} The number of the Julian day computed from the
     *     receiver.
     */

    var theMonth,
        theYear,
        theDate,
        theHour,
        theMinutes,
        theSeconds,
        theOffset,

        universalTime,

        julianDay;

    theMonth = this.getUTCMonth() + 1;
    theYear = this.getUTCFullYear();
    theDate = this.getUTCDate();
    theHour = this.getUTCHours();
    theMinutes = this.getUTCMinutes();
    theSeconds = this.getUTCSeconds();
    theOffset = this.getUTCTimezoneOffset();

    universalTime = theHour + (theMinutes + theOffset) / 60.0 +
                                                    theSeconds / 3600.0;

    if (theMonth <= 2) {
        theMonth = theMonth + 12;
        theYear = theYear - 1;
    }

    julianDay = (365.25 * theYear).floor() +
                    (30.6001 * (theMonth + 1)).floor() -
                    15 + 1720996.5 + theDate + universalTime / 24.0;

    return julianDay;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getUTCMonthName',
function() {

    /**
     * @method getUTCMonthName
     * @summary Returns the long format name of the month computed from the
     *     receiver.
     * @returns {String} The long format name of the month.
     */

    return TP.sys.getLocale().localizeString(
                        Date.LONG_MONTH_NAMES.at(this.getUTCMonth()));
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getUTCShortDayName',
function() {

    /**
     * @method getUTCShortDayName
     * @summary Returns the short format name of the day computed from the
     *     receiver.
     * @returns {String} The short format name of the day.
     */

    return TP.sys.getLocale().localizeString(
                        Date.SHORT_WEEKDAY_NAMES.at(this.getUTCDay()));
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getUTCShortMonthName',
function() {

    /**
     * @method getUTCShortMonthName
     * @summary Returns the short format name of the month computed from the
     *     receiver.
     * @returns {String} The short format name of the month.
     */

    return TP.sys.getLocale().localizeString(
                        Date.SHORT_MONTH_NAMES.at(this.getUTCMonth()));
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getUTCStartOfMonth',
function() {

    /**
     * @method getUTCStartOfMonth
     * @summary Returns the time in ms at which the current month started.
     * @returns {Number} The start of the current month in ms.
     */

    var newDay,
        ms,
        offset;

    //  Get today at the 'start' of the day
    newDay = Date.todayUTC();

    //  getDate returns the day of month, so we remove 1 to set the index to
    //  0 as JS wants it and compute the offset
    ms = newDay.getTime();
    offset = (newDay.getUTCDate() - 1) * Date.MSPERDAY;

    return ms - offset;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getUTCStartOfWeek',
function() {

    /**
     * @method getUTCStartOfWeek
     * @summary Returns the time in ms at which the current week started
     *     (assuming weeks start on Sunday at 00:00.00.000).
     * @returns {Number} The start of the current week in ms.
     */

    var newDay,
        ms,
        offset;

    //  Get today at the 'start' of the day
    newDay = Date.todayUTC();

    //  get Day returns the proper day offset so we can use it
    ms = newDay.getTime();
    offset = newDay.getUTCDay() * Date.MSPERDAY;

    return ms - offset;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getUTCWeek',
function() {

    /**
     * @method getUTCWeek
     * @summary Returns the week number as commonly defined in the U.S. where
     *     week 1 is the week in which January 1 falls. Note that this value may
     *     differ from the ISO week number which defines week 1 as the first
     *     week with more days in January than in the previous December (i.e. at
     *     least 4 days).
     * @returns {Number} The number of the receiver's week, according to ISO
     *     8601.
     */

    var first,
        wk1start,
        since;

    //  get the first 'moment' of the year
    first = TP.dc('01 Jan ' + this.getUTCFullYear());
    first.setUTCHours(0);
    first.setUTCMinutes(0);
    first.setUTCSeconds(0);
    first.setUTCMilliseconds(0);

    //  based on that date's day of the week we need to find the first prior
    //  sunday...which will be the day number offset backwards. in other
    //  words, if the first's day number is 1 we're a monday and need to
    //  subtract 1 day to find the sunday in that week...
    wk1start = first.subtractDuration(TP.join('P', first.getUTCDay(), 'D'));

    since = this.getDaysBetween(wk1start);

    return (since / 7).floor().integer() + 1;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('getWeek',
function() {

    /**
     * @method getWeek
     * @summary Returns the week number as commonly defined in the U.S. where
     *     week 1 is the week in which January 1 falls. Note that this value may
     *     differ from the ISO week number which defines week 1 as the first
     *     week with more days in January than in the previous December (i.e. at
     *     least 4 days).
     * @returns {Number} The number of the receiver's week, according to ISO
     *     8601.
     */

    var first,
        wk1start,
        since;

    //  get the first 'moment' of the year
    first = TP.dc('01 Jan ' + this.getFullYear());
    first.setHours(0);
    first.setMinutes(0);
    first.setSeconds(0);
    first.setMilliseconds(0);

    //  based on that date's day of the week we need to find the first prior
    //  sunday...which will be the day number offset backwards. in other
    //  words, if the first's day number is 1 we're a monday and need to
    //  subtract 1 day to find the sunday in that week...
    wk1start = first.subtractDuration(TP.join('P', first.getDay(), 'D'));

    since = this.getDaysBetween(wk1start);

    return (since / 7).floor().integer() + 1;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('isBefore',
function(aDate) {

    /**
     * @method isBefore
     * @summary Returns true if the receiver is a date/time which occurs before
     *     the date/time provided.
     * @param {Date|String} aDate A date or date string.
     * @returns {Boolean}
     */

    var d;

    if (!TP.isDate(d = TP.dc(aDate))) {
        return this.raise('TP.sig.InvalidDate');
    }

    return this.getTime() < d.getTime();
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('isDSTDate',
function() {

    /**
     * @method isDSTDate
     * @summary Return true if the date is a daylight saving time (or "Summer
     *     Time" in the EU) date.
     * @exception TP.sig.InvalidParameter
     * @returns {Boolean} Whether or not its a DST date.
     */

    var aDateYear,

        thisYearStartDate,
        thisYearEndDate,

        startDateMS,
        endDateMS,
        aDateMS;

    //  Grab the year from the date.
    aDateYear = this.getFullYear();

    //  If the date we are asking about's year is the same as this year,
    //  then use precomputed start and end date values that have been (or
    //  will be if they haven't been constructed) cached on this type.
    if (aDateYear === Date.THIS_YEAR) {
        //  Construct and cache the start and end dates if they haven't
        //  already been done.

        if (TP.notValid(thisYearStartDate =
                        Date.get('thisYearStartDSTDate'))) {
            Date.set('thisYearStartDSTDate',
                        thisYearStartDate =
                            Date.getDSTStartDate(Date.THIS_YEAR));
        }

        if (TP.notValid(thisYearEndDate =
                        Date.get('thisYearEndDSTDate'))) {
            Date.set('thisYearEndDSTDate',
                        thisYearEndDate =
                            Date.getDSTEndDate(Date.THIS_YEAR));
        }

        //  Use the precomputed DST start and end dates for this year.
        startDateMS = thisYearStartDate.getTime();
        endDateMS = thisYearEndDate.getTime();
    } else {
        //  Compute the DST start and end dates using the installed DST
        //  computation functions (these can vary depending on the locale
        //  installed).
        startDateMS = Date.getDSTStartDate(this.getFullYear()).getTime();
        endDateMS = Date.getDSTEndDate(this.getFullYear()).getTime();
    }

    //  Grab the date we are asking about's MS count
    aDateMS = this.getTime();

    //  If the date we are asking about's MS count is greater than or equal
    //  to the start date's MS count or less than or equal to the end
    //  date's MS count, then it falls within the half of the year that is
    //  considered to be 'Daylight Saving Time' (or 'Summer Time' in some
    //  places).
    if (aDateMS >= startDateMS && aDateMS <= endDateMS) {
        return true;
    } else {
        return false;
    }
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('isUTCDSTDate',
function() {

    /**
     * @method isUTCDSTDate
     * @summary Return true if the date is a daylight saving time (or "Summer
     *     Time" in the EU) date.
     * @exception TP.sig.InvalidParameter
     * @returns {Boolean} Whether or not its a DST date.
     */

    var aDateYear,

        thisYearStartDate,
        thisYearEndDate,

        startDateMS,
        endDateMS,
        aDateMS;

    //  Grab the year from the date.
    aDateYear = this.getUTCFullYear();

    //  If the date we are asking about's year is the same as this year,
    //  then use precomputed start and end date values that have been (or
    //  will be if they haven't been constructed) cached on this type.
    if (aDateYear === Date.THIS_YEAR) {
        //  Construct and cache the start and end dates if they haven't
        //  already been done.

        if (TP.notValid(thisYearStartDate =
                        Date.get('thisYearStartDSTDate'))) {
            Date.set('thisYearStartDSTDate',
                        thisYearStartDate =
                            Date.getDSTStartDate(Date.THIS_YEAR));
        }

        if (TP.notValid(thisYearEndDate =
                        Date.get('thisYearEndDSTDate'))) {
            Date.set('thisYearEndDSTDate',
                        thisYearEndDate =
                            Date.getDSTEndDate(Date.THIS_YEAR));
        }

        //  Use the precomputed DST start and end dates for this year.
        startDateMS = thisYearStartDate.getTime();
        endDateMS = thisYearEndDate.getTime();
    } else {
        //  Compute the DST start and end dates using the installed DST
        //  computation functions (these can vary depending on the locale
        //  installed).
        startDateMS = Date.getDSTStartDate(this.getUTCFullYear()).getTime();
        endDateMS = Date.getDSTEndDate(this.getUTCFullYear()).getTime();
    }

    //  Grab the date we are asking about's MS count
    aDateMS = this.getTime();

    //  If the date we are asking about's MS count is greater than or equal
    //  to the start date's MS count or less than or equal to the end
    //  date's MS count, then it falls within the half of the year that is
    //  considered to be 'Daylight Saving Time' (or 'Summer Time' in some
    //  places).
    if (aDateMS >= startDateMS && aDateMS <= endDateMS) {
        return true;
    } else {
        return false;
    }
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('isSameDay',
function(aDate) {

    /**
     * @method isSameDay
     * @summary Returns true if the receiver is the same day as the date
     *     provided.
     * @param {Date} aDate The Date to use for comparison.
     * @exception TP.sig.InvalidParameter
     * @returns {Boolean}
     */

    if (!TP.isDate(aDate)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    /* eslint-disable no-extra-parens */
    return (this.getUTCFullYear() === aDate.getUTCFullYear() &&
            this.getUTCMonth() === aDate.getUTCMonth() &&
            this.getUTCDate() === aDate.getUTCDate());
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('isSameMonth',
function(aDate) {

    /**
     * @method isSameMonth
     * @summary Returns true if the receiver is the same month as the date
     *     provided.
     * @param {Date} aDate The Date to use for comparison.
     * @exception TP.sig.InvalidParameter
     * @returns {Boolean}
     */

    if (!TP.isDate(aDate)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    /* eslint-disable no-extra-parens */
    return (this.getUTCFullYear() === aDate.getUTCFullYear() &&
            this.getUTCMonth() === aDate.getUTCMonth());
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('isSameWeek',
function(aDate) {

    /**
     * @method isSameWeek
     * @summary Returns true if the receiver is the same week as the date
     *     provided.
     * @param {Date} aDate The Date to use for comparison.
     * @exception TP.sig.InvalidParameter
     * @returns {Boolean}
     */

    if (!TP.isDate(aDate)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    /* eslint-disable no-extra-parens */
    return (aDate.getTime() >= this.getUTCStartOfWeek() &&
            aDate.getTime() <= (this.getUTCStartOfWeek() +
                                                (Date.MSPERDAY * 7)));
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('isSameYear',
function(aDate) {

    /**
     * @method isSameYear
     * @summary Returns true if the receiver is the same year as the date
     *     provided.
     * @param {Date} aDate The Date to use for comparison.
     * @exception TP.sig.InvalidParameter
     * @returns {Boolean}
     */

    if (!TP.isDate(aDate)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    /* eslint-disable no-extra-parens */
    return (this.getUTCFullYear() === aDate.getUTCFullYear());
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

Date.Type.defineMethod('parseString',
function(aString, sourceLocale) {

    /**
     * @method parseString
     * @summary Returns the Date value of the string provided, as localized for
     *     the target locale.
     * @param {String} aString The input string to parse.
     * @param {String|TP.i18n.Locale} sourceLocale A source xml:lang or
     *     TP.i18n.Locale defining the language or locale the string is now in.
     * @returns {Date} The localized Date value.
     */

    return TP.sys.getLocale().parseDate(aString, sourceLocale);
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('setISOWeek',
function(aWeekNumber) {

    /**
     * @method setISOWeek
     * @summary Sets the receiver to be the same day of the week and time, but
     *     in week number N as defined by ISO 8601.
     * @description Officially, week 1 of any year is the week that contains 4
     *     January (that is, the week that contains the first Thursday in
     *     January). Almost all years have 52 weeks, but years that start on a
     *     Thursday and leap years that start on a Wednesday have 53 weeks using
     *     this metric.
     * @param {Number} aWeekNumber The number of the week in ISO 8601 terms.
     * @returns {Date} The receiver.
     */

    var week,
        sec,
        ms,

        oldVal,
        newVal;

    week = this.getISOWeek();

    if (week === aWeekNumber) {
        return this;
    }

    //  compute the difference in milliseconds
    sec = Date.getSecondsInDuration(
                TP.join('P', ((aWeekNumber - week) * 7).abs(), 'D'));

    ms = sec * 1000;

    oldVal = this.getTime();

    //  only question now is do we add or subtract :)
    if (week > aWeekNumber) {
        newVal = oldVal - ms;
    } else {
        newVal = oldVal + ms;
    }

    this.setTime(newVal);

    this.changed('time',
                    TP.UPDATE,
                    TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, newVal));

    return this;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('setUTCISOWeek',
function(aWeekNumber) {

    /**
     * @method setUTCISOWeek
     * @summary Sets the receiver to be the same day of the week and time, but
     *     in week number N as defined by ISO 8601.
     * @description Officially, week 1 of any year is the week that contains 4
     *     January (that is, the week that contains the first Thursday in
     *     January). Almost all years have 52 weeks, but years that start on a
     *     Thursday and leap years that start on a Wednesday have 53 weeks using
     *     this metric.
     * @param {Number} aWeekNumber The number of the week in ISO 8601 terms.
     * @returns {Date} The receiver.
     */

    var week,
        sec,
        ms,

        oldVal,
        newVal;

    week = this.getUTCISOWeek();

    if (week === aWeekNumber) {
        return this;
    }

    //  compute the difference in milliseconds
    sec = Date.getSecondsInDuration(
                TP.join('P', ((aWeekNumber - week) * 7).abs(), 'D'));

    ms = sec * 1000;

    oldVal = this.getTime();

    //  only question now is do we add or subtract :)
    if (week > aWeekNumber) {
        newVal = oldVal - ms;
    } else {
        newVal = oldVal + ms;
    }

    this.setTime(newVal);

    this.changed('time',
                    TP.UPDATE,
                    TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, newVal));

    return this;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('setUTCWeek',
function(aWeekNumber) {

    /**
     * @method setUTCWeek
     * @summary Sets the receiver to be the same day of the week and time, but
     *     in week number N as commonly used in the U.S.
     * @param {Number} aWeekNumber The number of the week in ISO 8601 terms.
     * @returns {Date} The receiver.
     */

    var week,
        sec,
        ms,

        oldVal,
        newVal;

    week = this.getUTCWeek();

    if (week === aWeekNumber) {
        return this;
    }

    //  compute the difference in milliseconds
    sec = Date.getSecondsInDuration(
                TP.join('P', ((aWeekNumber - week) * 7).abs(), 'D'));

    ms = sec * 1000;

    oldVal = this.getTime();

    //  only question now is do we add or subtract :)
    if (week > aWeekNumber) {
        newVal = oldVal - ms;
    } else {
        newVal = oldVal + ms;
    }

    this.setTime(newVal);

    this.changed('time',
                    TP.UPDATE,
                    TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, newVal));

    return this;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('setWeek',
function(aWeekNumber) {

    /**
     * @method setWeek
     * @summary Sets the receiver to be the same day of the week and time, but
     *     in week number N as commonly used in the U.S.
     * @param {Number} aWeekNumber The number of the week to set.
     * @returns {Date} The receiver.
     */

    var week,
        sec,
        ms,

        oldVal,
        newVal;

    week = this.getWeek();

    if (week === aWeekNumber) {
        return this;
    }

    //  compute the difference in milliseconds
    sec = Date.getSecondsInDuration(
                TP.join('P', ((aWeekNumber - week) * 7).abs(), 'D'));

    ms = sec * 1000;

    oldVal = this.getTime();

    //  only question now is do we add or subtract :)
    if (week > aWeekNumber) {
        newVal = oldVal - ms;
    } else {
        newVal = oldVal + ms;
    }

    this.setTime(newVal);

    this.changed('time',
                    TP.UPDATE,
                    TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, newVal));

    return this;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('subtract',
function(anObject) {

    /**
     * @method subtract
     * @summary Subtracts a number of milliseconds or a duration from the
     *     receiver, returning a new Date. To subtract Dates to produce
     *     durations of the difference in time use subtractDate.
     * @param {Number|String} anObject A number of milliseconds or a duration
     *     string.
     * @exception TP.sig.InvalidParameter
     * @returns {Date} A new date.
     */

    if (TP.isNumber(anObject)) {
        return TP.dc(this.getTime() - anObject);
    } else if (TP.isString(anObject)) {
        return this.subtractDuration(anObject);
    }

    return this.raise('TP.sig.InvalidParameter');
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('subtractDate',
function(aDate) {

    /**
     * @method subtractDate
     * @summary Returns a duration string representing the difference between
     *     the two dates.
     * @param {Date} aDate The date to subtract from the receiver.
     * @exception TP.sig.InvalidParameter
     * @returns {String} An xs:duration formatted string containing the
     *     difference in the two date values.
     */

    return TP.dc(this.getTime() - aDate.getTime());
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('subtractDuration',
function(aDuration) {

    /**
     * @method subtractDuration
     * @summary Returns a new Date which represents the receiver adjusted by
     *     the duration string provided.
     * @param {String} aDuration An xs:duration formatted string.
     * @exception TP.sig.InvalidParameter
     * @returns {Date} A Date object.
     */

    var aDate,
        months,
        secs;

    //  first step is to get the months in the duration and get them
    //  subtracted from the current date's value so we reverse the calendar
    //  by that number of months...
    months = Date.getMonthsInDuration(aDuration);

    aDate = TP.dc(this.getTime());
    aDate.setUTCMonth(aDate.getUTCMonth() - months);

    secs = Date.getSecondsInDuration(aDuration);

    /* eslint-disable no-extra-parens */
    return TP.dc(aDate.getTime() - (secs * 1000));
    /* eslint-enable no-extra-parens */
});

//  ========================================================================
//  Number
//  ========================================================================

/**
 * @summary Extensions that make using Number a bit easier.
 * @description This file contains functionality for the Number type that make
 *     using Numbers easier, including convenience wrappers to cover
 *     interactions with the built-in Math object. Therefore, it is no longer
 *     necessary to pass Numbers into the Math object, one can simply send the
 *     proper message to a Number.
 */

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  Constants copied over from the Math object
Number.Type.defineConstant('E', Math.E);
Number.Type.defineConstant('LN10', Math.LN10);
Number.Type.defineConstant('LN2', Math.LN2);
Number.Type.defineConstant('LOG10E', Math.LOG10E);
Number.Type.defineConstant('LOG2E', Math.LOG2E);
Number.Type.defineConstant('PI', Math.PI);
Number.Type.defineConstant('SQRT1_2', Math.SQRT1_2);
Number.Type.defineConstant('SQRT2', Math.SQRT2);

Number.Type.defineConstant('TWO_PI', Math.PI * 2);
Number.Type.defineConstant('QUARTER_PI', Math.PI / 4);
Number.Type.defineConstant('EIGHTH_PI', Math.PI / 8);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

/**
 * @These are here to support requirements for StringCollectionExtensions
 *     regarding the various formatting functions related to the substitute
 *     call.
 */

//  ------------------------------------------------------------------------

Number.Type.defineMethod('getDecimalPoint',
function() {

    /**
     * @method getDecimalPoint
     * @summary Returns the character used as the decimal point.
     * @returns {String} The decimal point character.
     */

    return TP.sys.getLocale().getDecimalPoint();
});

//  ------------------------------------------------------------------------

Number.Type.defineMethod('getThousandsGroupSize',
function() {

    /**
     * @method getThousandsGroupSize
     * @summary Returns the size of the grouping for thousands. In most Western
     *     countries, this is 3.
     * @returns {Number} The thousands grouping size.
     */

    return TP.sys.getLocale().getThousandsGroupSize();
});

//  ------------------------------------------------------------------------

Number.Type.defineMethod('getThousandsMatcher',
function() {

    /**
     * @method getThousandsMatcher
     * @summary Returns the character used to separate thousands groupings.
     * @returns {String} The thousands separator.
     */

    return TP.sys.getLocale().getThousandsMatcher();
});

//  ------------------------------------------------------------------------

Number.Type.defineMethod('getThousandsSeparator',
function() {

    /**
     * @method getThousandsSeparator
     * @summary Returns the character used to separate thousands groupings.
     * @returns {String} The thousands separator.
     */

    return TP.sys.getLocale().getThousandsSeparator();
});

//  ------------------------------------------------------------------------

Number.Type.defineMethod('random',
function() {

    /**
     * @method random
     * @summary Returns a pseudo-random number between 0.0 and 1.0.
     * @returns {Number} A number between 0.0 and 1.0.
     */

    return Math.random();
});

//  ------------------------------------------------------------------------

Number.Type.defineMethod('randomInt',
function(min, max) {

    /**
     * @method randomInt
     * @summary Returns a pseudo-random integer between the supplied min and
     *     max bounds.
     * @param {Number} min The minimum bounds of the random integer.
     * @param {Number} max The maximum bounds of the random integer.
     * @exception TP.sig.InvalidParameter
     * @returns {Number} An integer between min and max.
     */

    var div,
        randNum,

        i;

    if (!TP.isNumber(min) || !TP.isNumber(max)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    /* eslint-disable no-extra-parens */
    div = (max - min) + 1;
    /* eslint-enable no-extra-parens */
    randNum = Math.random();

    for (i = 0; i <= div - 1; i++) {
        if (randNum >= i / div && randNum < (i + 1) / div) {
            return i + min;
        }
    }
});

//  ------------------------------------------------------------------------

Number.Type.defineMethod('validate',
function(anObj) {

    /**
     * @method validate
     * @summary Tests the incoming value to see if it represents a valid
     *     instance of the receiver.
     * @param {Object} anObj The object to test.
     * @returns {Boolean} True if the object is 'valid'.
     */

    return !TP.isNaN(parseFloat(anObj));
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

Number.Inst.defineMethod('abs',
function() {

    /**
     * @method abs
     * @summary Returns the absolute value of the receiver.
     * @returns {Number} The receiver's absolute value.
     */

    return Math.abs(this);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('acos',
function() {

    /**
     * @method acos
     * @summary Returns the arc cosine of the receiver.
     * @returns {Number} The receiver's arc cosine.
     */

    return Math.acos(this);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('acosD',
function() {

    /**
     * @method acosD
     * @summary Returns the arc cosine of the receiver in degrees.
     * @returns {Number} The receiver's arc cosine in degrees.
     */

    return Math.acos(this * (180 / Math.PI));
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('almostEquals',
function(aComparison, aTolerance) {

    /**
     * @method almostEquals
     * @summary Returns whether the receiver and the supplied comparison value
     *     are equal, within the supplied tolerance.
     * @param {Number} aComparison The number to compare the receiver to.
     * @param {Number} aTolerance The tolerance to use in the comparison.
     *     Defaults to 0.
     * @returns {Boolean} Whether or not the receiver is equal to the supplied
     *     comparison, within the supplied tolerance.
     */

    var tolerance;

    tolerance = TP.ifInvalid(aTolerance, 0);

    if (this - aComparison <= tolerance) {
        return true;
    }

    return false;
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('angleDifference',
function(anAngle) {

    /**
     * @method angleDifference
     * @summary Returns the difference between the receiver (which should be an
     *     angle expressed in degrees) and the supplied angle (which should also
     *     be an angle expressed in degrees.
     * @param {Number} anAngle An angle to use expressed in degrees.
     * @returns {Number} The difference between the receiver and the supplied
     *     angle expressed in degrees.
     */

    var diff;

    diff = anAngle.standardizeAngle() - this.standardizeAngle();

    if (diff > 180) {
        diff -= 360;
    } else if (diff <= -180) {
        diff += 360;
    }

    return diff;
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('angleDx',
function(anAngle, aRadius) {

    /**
     * @method angleDx
     * @summary Returns the X part of the distance computed using the supplied
     *     angle and radius.
     * @param {Number} anAngle The angle to use expressed in degrees.
     * @param {Number} aRadius The radius to use.
     * @returns {Number} The X part of the distance for the given angle and
     *     radius.
     */

    return aRadius * anAngle.degreesToRadians().cos();
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('angleDy',
function(anAngle, aRadius) {

    /**
     * @method angleDy
     * @summary Returns the Y part of the distance computed using the supplied
     *     angle and radius.
     * @param {Number} anAngle The angle to use expressed in degrees.
     * @param {Number} aRadius The radius to use.
     * @returns {Number} The Y part of the distance for the given angle and
     *     radius.
     */

    return aRadius * anAngle.degreesToRadians().sin();
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('asColor',
function() {

    /**
     * @method asColor
     * @summary Returns the color value of the receiver (a 2 digit hex value
     *     without the leading '0x').
     * @returns {String} The receiver's color value.
     */

    var res;

    //  TODO:   remove this restriction
    if (this > 255) {
        return this.raise('TP.sig.InvalidRange');
    }

    if (this < 16) {
        res = '0' + this.toString(16);
    } else {
        res = this.toString(16);
    }

    return res;
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('asDuration',
function() {

    /**
     * @method asDuration
     * @summary Returns the 'xs:duration' value of the receiver. The receiver
     *     is assumed to be a number of millisecond count that will be
     *     translated into a duration with a fractional number of seconds.
     * @returns {String} The receiver's 'xs:duration' value.
     */

    var res,
        msFraction;

    res = 'PT';

    msFraction = (this + 0) / 1000;

    if (msFraction < 1 && msFraction.toString().charAt(0) !== '0') {
        res += '0';
    }

    res += msFraction + 'S';

    return res;
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('asHex',
function() {

    /**
     * @method asHex
     * @summary Returns the hexadecimal value of the receiver.
     * @returns {String} The receiver's hex value.
     */

    var res;

    //  TODO:   remove this restriction
    if (this > 255) {
        return this.raise('TP.sig.InvalidRange');
    }

    res = '0x';

    if (this < 16) {
        res += '0' + this.toString(16);
    } else {
        res += this.toString(16);
    }

    return res;
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('asin',
function() {

    /**
     * @method asin
     * @summary Returns the arc sine of the receiver.
     * @returns {Number} The receiver's arc sine.
     */

    return Math.asin(this);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('asinD',
function() {

    /**
     * @method asinD
     * @summary Returns the arc sine of the receiver in degrees.
     * @returns {Number} The receiver's arc sine in degrees.
     */

    return Math.asin(this * (180 / Math.PI));
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('atan',
function() {

    /**
     * @method atan
     * @summary Returns the arc tangent of the receiver.
     * @returns {Number} The receiver's arc tangent.
     */

    return Math.atan(this);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('atanD',
function() {

    /**
     * @method atanD
     * @summary Returns the arc tangent of the receiver in degrees.
     * @returns {Number} The receiver's arc tangent in degrees.
     */

    return Math.atan(this * (180 / Math.PI));
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('atan2',
function(xSize) {

    /**
     * @method atan2
     * @summary Returns the counterclockwise angle using the positive X size
     *     and the receiver as a positive Y size.
     * @param {Number} xSize The X size to use with the receiver in computing
     *     the counterclockwise angle.
     * @exception TP.sig.InvalidParameter
     * @returns {Number} The counterclockwise angle using the receiver and
     *     xSize.
     */

    if (!TP.isNumber(xSize)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    return Math.atan2(this, xSize);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('atan2D',
function(xSize) {

    /**
     * @method atan2D
     * @summary Returns the counterclockwise angle, in degrees, using the
     *     positive X size and the receiver as a positive Y size.
     * @param {Number} xSize The X size to use with the receiver in computing
     *     the counterclockwise angle.
     * @exception TP.sig.InvalidParameter
     * @returns {Number} The counterclockwise angle in degrees using the
     *     receiver and xSize.
     */

    if (!TP.isNumber(xSize)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    return Math.atan2(this, xSize) * (180 / Math.PI);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('ceil',
function() {

    /**
     * @method ceil
     * @summary Returns the closest integer value that is greater than or equal
     *     to the receiver.
     * @returns {Number} The closest integer greater than or equal to the
     *     receiver.
     */

    return Math.ceil(this);
});


//  ------------------------------------------------------------------------

Number.Inst.defineMethod('cos',
function() {

    /**
     * @method cos
     * @summary Returns the cosine of the receiver.
     * @returns {Number} The receiver's cosine.
     */

    return Math.cos(this);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('cosD',
function() {

    /**
     * @method cosD
     * @summary Returns the cosine of the receiver in degrees.
     * @returns {Number} The receiver's cosine in degrees.
     */

    return Math.cos(this * (Math.PI / 180));
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('degreesToRadians',
function() {

    /**
     * @method degreesToRadians
     * @summary Returns the receiver's value as radians, assuming that the
     *     receiver contains a number of degrees.
     * @returns {Number} The receiver's value in radians.
     */

    /* eslint-disable no-extra-parens */
    return (this * Math.PI) / 180;
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('exp',
function() {

    /**
     * @method exp
     * @summary Returns 'e' (natural log) to the power of the receiver.
     * @returns {Number} The natural log to the power of the receiver.
     */

    return Math.exp(this);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('factorial',
function() {

    /**
     * @method factorial
     * @summary Returns the factorial of the receiver.
     * @returns {Number} The factorial of the receiver.
     */

    var val,
        i;

    //  Can't do this with a negative number
    if (this < 0) {
        return 0;
    }

    val = 1;

    for (i = 1; i <= this; i++) {
        val *= i;
    }

    return val;
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('floor',
function() {

    /**
     * @method floor
     * @summary Returns the closest integer value that is lesser than or equal
     *     to the receiver.
     * @returns {Number} The closest integer lesser than or equal to the
     *     receiver.
     */

    return Math.floor(this);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('fraction',
function(aCount) {

    /**
     * @method fraction
     * @summary Returns the fractional part of the receiver without doing any
     *     rounding i.e. (123.456).fraction(2) returns 0.45.
     * @param {Number} aCount The number of decimal places.
     * @returns {Number}
     */

    var str,

        end,
        val;

    //  use primitive here to get the '.' version
    str = this.toString();

    if (!TP.regex.HAS_PERIOD.test(str)) {
        return 0;
    }

    end = TP.ifInvalid(aCount, Number.POSITIVE_INFINITY);
    val = '0.' + str.split('.').last().slice(0, end);

    return parseFloat(val);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('integer',
function() {

    /**
     * @method integer
     * @summary Returns the integer portion of the receiver.
     * @returns {Number}
     */

    if (this < 0) {
        return this.ceil();
    } else {
        return this.floor();
    }
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('isBetween',
function(minValue, maxValue) {

    /**
     * @method isBetween
     * @summary Returns whether the receiver is between the minValue and
     *     maxValue (not including the values themselves).
     * @param {Number} minValue The minimum value that the receiver has to be
     *     greater than.
     * @param {Number} maxValue The maximum value that the receiver has to be
     *     lesser than.
     * @exception TP.sig.InvalidParameter
     * @returns {Boolean} Whether the receiver is between minValue and maxValue.
     */

    if (!TP.isNumber(minValue) || !TP.isNumber(maxValue)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    /* eslint-disable no-extra-parens */
    return (this > minValue && this < maxValue);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('isBetweenInclusive',
function(minValue, maxValue) {

    /**
     * @method isBetweenInclusive
     * @summary Returns whether the receiver is between the minValue and
     *     maxValue (including the values themselves).
     * @param {Number} minValue The minimum value that the receiver has to be
     *     greater than or equal to.
     * @param {Number} maxValue The maximum value that the receiver has to be
     *     lesser than or equal to.
     * @exception TP.sig.InvalidParameter
     * @returns {Boolean} Whether the receiver is between minValue and maxValue
     *     inclusive.
     */

    if (!TP.isNumber(minValue) || !TP.isNumber(maxValue)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    /* eslint-disable no-extra-parens */
    return (this >= minValue && this <= maxValue);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('isEven',
function() {

    /**
     * @method isEven
     * @summary Returns whether the receiver is an even number.
     * @returns {Boolean} Whether or not the receiver is even.
     */

    /* eslint-disable no-extra-parens */
    return (this % 2 === 0);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('isInteger',
function() {

    /**
     * @method isInteger
     * @summary Returns whether the receiver is an integer. An integer number
     *     is defined as a number that has no fractional component.
     * @returns {Boolean} Whether or not the receiver is an integer.
     */

    /* eslint-disable no-extra-parens */
    return (this % 1 === 0);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('isNegative',
function() {

    /**
     * @method isNegative
     * @summary Returns whether the receiver is a negative number or not. A
     *     negative number is defined as a number that is less than 0.
     * @returns {Boolean} Whether or not the receiver is negative.
     */

    /* eslint-disable no-extra-parens */
    return (this < 0);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('isOdd',
function() {

    /**
     * @method isOdd
     * @summary Returns whether the receiver is an odd number.
     * @returns {Boolean} Whether or not the receiver is odd.
     */

    /* eslint-disable no-extra-parens */
    return (this % 2 === 1);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('isPositive',
function() {

    /**
     * @method isPositive
     * @summary Returns whether the receiver is a positive number or not. A
     *     positive number is defined as a number that is greater than or equal
     *     to 0.
     * @returns {Boolean} Whether or not the receiver is positive.
     */

    /* eslint-disable no-extra-parens */
    return (this >= 0);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('log2',
function() {

    /**
     * @method log2
     * @summary Returns the base-2 logarithm of the receiver.
     * @returns {Number} The receiver's base-2 logarithm.
     */

    return Math.LOG2E * Math.log(this);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('log10',
function() {

    /**
     * @method log10
     * @summary Returns the base-10 logarithm of the receiver.
     * @returns {Number} The receiver's base-10 logarithm.
     */

    return Math.LOG10E * Math.log(this);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('log',
function() {

    /**
     * @method log
     * @summary Returns the natural logarithm of the receiver.
     * @returns {Number} The receiver's natural logarithm.
     */

    return Math.log(this);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('max',
function(varargs) {

    /**
     * @method max
     * @summary Returns the largest value from the receiver and arguments. Note
     *     that you can pass multiple values to this call.
     * @param {arguments} varargs A variable list of 0 to N elements to place in
     *     the array.
     * @exception TP.sig.InvalidParameter
     * @returns {Number} The largest value found.
     */

    var result,
        i,
        check;

    /* eslint-disable consistent-this */
    result = this;
    /* eslint-enable consistent-this */

    for (i = 0; i < arguments.length; i++) {
        check = arguments[i];

        if (!TP.isNumber(check)) {
            return this.raise('TP.sig.InvalidParameter', check);
        }

        result = Math.max(result, check);
    }

    return result;
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('min',
function(varargs) {

    /**
     * @method min
     * @summary Returns the smallest value from the receiver and arguments.
     * @param {arguments} varargs A variable list of 0 to N elements to place in
     *     the array.
     * @exception TP.sig.InvalidParameter
     * @returns {Number} The smallest value found.
     */

    var result,
        i,
        check;

    /* eslint-disable consistent-this */
    result = this;
    /* eslint-enable consistent-this */

    for (i = 0; i < arguments.length; i++) {
        check = arguments[i];

        if (!TP.isNumber(check)) {
            return this.raise('TP.sig.InvalidParameter', check);
        }

        result = Math.min(result, check);
    }

    return result;
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('minMax',
function(minNum, maxNum) {

    /**
     * @method minMax
     * @summary Returns the receiver, if it is between the minNum and the
     *     maxNum, the minNum if the receiver is less than it is and the maxNum
     *     if the receiver is more than it is.
     * @param {Number} minNum The minimum number.
     * @param {Number} maxNum The maximum number.
     * @exception TP.sig.InvalidParameter
     * @returns {Number} The receiver or the minNum or the maxNum according to
     *     the method comment.
     */

    if (!TP.isNumber(minNum) || !TP.isNumber(maxNum)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    return Math.max(Math.min(this, maxNum), minNum);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('modulo',
function(aDivisor) {

    /**
     * @method modulo
     * @summary Returns the modulus of dividing the receiver by the supplied
     *     divisor.
     * @description JavaScript's modulo operator operates such that it will take
     *     the same sign as the receiver (the dividend). Other languages operate
     *     in such a way that they will return a result that has the same sign
     *     as the supplied divisor. This routine supplies an implementation of
     *     the second.
     * @param {Number} aDivisor The divisor to use in the computation.
     * @returns {Number} The modulus value that takes the same sign as the
     *     supplied divisor.
     */

    var remainder;

    remainder = this % aDivisor;

    /* eslint-disable no-extra-parens */
    return (remainder * aDivisor < 0) ? remainder + aDivisor : remainder;
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

Number.Type.defineMethod('parseString',
function(aString, sourceLocale) {

    /**
     * @method parseString
     * @summary Returns the Number value of the string provided, as localized
     *     for the target locale.
     * @param {String} aString The input string to parse.
     * @param {String|TP.i18n.Locale} sourceLocale A source xml:lang or
     *     TP.i18n.Locale defining the language or locale the string is now in.
     * @returns {Number} The localized Number value.
     */

    return TP.sys.getLocale().parseNumber(aString, sourceLocale);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('pow',
function(power) {

    /**
     * @method pow
     * @summary Returns the receiver raised to the power of 'power'.
     * @param {Number} power The power to raise the receiver to.
     * @exception TP.sig.InvalidParameter
     * @returns {Number} The receiver raised to 'power'.
     */

    if (!TP.isNumber(power)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    return Math.pow(this, power);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('radiansToDegrees',
function() {

    /**
     * @method radiansToDegrees
     * @summary Returns the receiver's value as degrees, assuming that the
     *     receiver contains a number of radians.
     * @returns {Number} The receiver's value in degrees.
     */

    /* eslint-disable no-extra-parens */
    return (this * 180) / Math.PI;
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('round',
function(places) {

    /**
     * @method round
     * @summary Returns a rounding of the receiver up or down to the nearest
     *     integer.
     * @description This function rounds .5 up. It also extends the standard
     *     'Math.round' method by taking a number of places that the receiver
     *     will be rounded to.
     * @param {Number} places The number of places to round the receiver to.
     * @returns {Number} The receiver rounded up or down.
     */

    var placesShift;

    if (TP.isNumber(places)) {
        placesShift = Math.pow(10, places);
        return Math.round(this * placesShift) / placesShift;
    }

    return Math.round(this);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('sin',
function() {

    /**
     * @method sin
     * @summary Returns the sine of the receiver.
     * @returns {Number} The receiver's sine.
     */

    return Math.sin(this);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('sinD',
function() {

    /**
     * @method sinD
     * @summary Returns the sine of the receiver in degrees.
     * @returns {Number} The receiver's sine in degrees.
     */

    return Math.sin(this * (Math.PI / 180));
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('sqrt',
function() {

    /**
     * @method sqrt
     * @summary Returns the square root of the receiver.
     * @returns {Number} The receiver's square root.
     */

    return Math.sqrt(this);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('standardizeAngle',
function() {

    /**
     * @method standardizeAngle
     * @summary Returns the supplied angle 'standardized' to be an exact number
     *     of degrees between 0 and 360.
     * @returns {Number} The receiver 'standardized' between 0 and 360.
     */

    return this.modulo(360);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('tan',
function() {

    /**
     * @method tan
     * @summary Returns the tangent of the receiver.
     * @returns {Number} The receiver's tangent.
     */

    return Math.tan(this);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('tanD',
function() {

    /**
     * @method tanD
     * @summary Returns the tangent of the receiver in degrees.
     * @returns {Number} The receiver's tangent in degrees.
     */

    return Math.tan(this * (Math.PI / 180));
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('quoted',
function(aQuoteChar) {

    /**
     * @method quoted
     * @summary Returns the receiver as a quoted string.
     * @param {String} aQuoteChar The quote char to use. Default is single
     *     quotes.
     * @returns {String}
     */

    return this.asString().quoted(aQuoteChar);
});

//  ========================================================================
//  RegExp
//  ========================================================================

/**
 * @summary Extensions that make using RegExp a bit easier.
 * @description This file contains a set of premade constant RegExps that define
 *     common punctuation characters, numbers, etc.
 */

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

RegExp.Type.defineMethod('escapeMetachars',
function(aString) {

    /**
     * @method escapeMetachars
     * @summary Escapes any RegExp metacharacters found in the supplied String.
     * @param {String} aString The String to escape any RegExp metacharacters
     *     in.
     * @returns {String} The supplied String with RegExp metacharacters escaped.
     */

    return TP.regExpEscape(aString);
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

RegExp.Inst.defineMethod('match',
function(anObject) {

    /**
     * @method match
     * @summary Returns the result of running the expression against the string
     *     value of the object provided. This method is provided so that you can
     *     pass either a String or RegExp to methods that need to query based on
     *     string/regex content.
     * @param {Object} anObject The object whose string value should be tested.
     * @returns {String[]|undefined} An array identical to the one produced by
     *     String.match().
     */

    var str;

    str = TP.str(anObject);
    if (TP.isString(str)) {
        return str.match(this);
    }

    return;
});

//  ========================================================================
//  String
//  ========================================================================

/**
 * @summary Extensions that make using Strings a bit easier, and which add
 *     support for elements such as string substitutions for output formatting.
 * @description
 */

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

String.Type.defineAttribute('$allHashMarker', TP.rc('[^?0]+', 'g'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ----------------------------------------------------------------------------

String.Type.defineMethod('initialize',
function(aName) {

    /**
     * @method initialize
     * @summary There is no initialization here, but we need a method stub to
     *     satisfy the runtime system on startup. This is required because of
     *     ECMAScript6+ type proxies and they're interaction with String when
     *     String is used to "initialize" a type that can only be found by name.
     */

    return;
});

//  ------------------------------------------------------------------------

String.Type.defineMethod('getRegisteredSubstitutions',
function() {

    /**
     * @method getRegisteredSubstitutions
     * @summary Returns a collection of registered string substitution
     *     functions.
     * @description String substitutions are done using registered substitition
     *     functions. This method returns the current registrations.
     * @returns {Object}
     */

    if (TP.notValid(this.$substitutions)) {
        this.$substitutions = new TP.boot.PHash();
    }

    return this.$substitutions;
});

//  ------------------------------------------------------------------------

String.Type.defineMethod('getSubstitution',
function(aSymbol) {

    /**
     * @method getSubstitution
     * @summary Returns a substitution registration or undefined.
     * @param {String} aSymbol A single character symbol used to identify the
     *     substitution.
     * @returns {Object}
     */

    return this.getRegisteredSubstitutions().at(aSymbol);
});

//  ------------------------------------------------------------------------

String.Type.defineMethod('parseString',
function(aString, sourceLocale) {

    /**
     * @method parseString
     * @summary Returns the String value of the string provided, as localized
     *     for the target locale. Obviously this seems a little strange, but the
     *     localization point is key here, not the type conversion aspect.
     * @param {String} aString The input string to parse.
     * @param {String|TP.i18n.Locale} sourceLocale A source xml:lang or
     *     TP.i18n.Locale defining the language the string is now in. Defaults
     *     to getTargetLanguage() which is based on the current locale's
     *     language-country value.
     * @returns {String} The localized String value.
     */

    return TP.sys.getLocale().parseString(aString, sourceLocale);
});

//  ------------------------------------------------------------------------

String.Type.defineMethod('registerSubstitution',
function(aSymbol, anExistenceTest, aDataSymbol, aRegExp, aHandler) {

    /**
     * @method registerSubstitution
     * @summary Registers a string substitution pattern and handler pair.
     * @description String substitution uses a pattern String to contain
     *     patterns of characters that will be replaced by one or more
     *     'substitution' handlers. The substitution will take place if a regex
     *     that is built of all of the 'existence tests' for all of the
     *     registered substitutions matches text in the pattern. The system
     *     automatically registers a number of these substitutions.
     *
     *     One of the most commonly used subsitutions is the 'eval'
     *     substitution, which uses delimiters similar to TSH shell syntax (ala
     *     `...`). This particular substitution is special-cased by its own
     *     regex, as it needs to be performed before all other substitutions.
     *
     *     In any case, this method is used to register a particular
     *     substitution entry with the String type.
     * @param {String} aSymbol The symbol used to identify entities for this
     *     substitution. This is what anExistenceTest should find in order to
     *     invoke this substitution.
     * @param {String} anExistenceTest This substitution's regex (as a String
     *     that will joined with other substitutions regexs) that will be used
     *     to determine if expressions processed by this substitution exist in
     *     the pattern.
     * @param {String} aDataSymbol If the dataSource has data for multiple
     *     substitution patterns, the data for this substitution will be found
     *     under this key.
     * @param {RegExp} aRegExp The regular expression used to extract content
     *     for the handler to process.
     * @param {Function} aHandler The function used to process content.
     * @returns {String} The receiver.
     */

    var subs;

    //  Register the substitution with the substitution registry
    subs = this.getRegisteredSubstitutions();
    subs.atPut(aSymbol, TP.hc('dataSymbol', aDataSymbol,
                                'matcher', aRegExp,
                                'handler', aHandler));

    //  If the String for the overall test RegExp exists, then it will be
    //  in the form of '(sub1test|sub2test)'. Slice off the last paren and
    //  add the registering substitution's existence test to the end.
    if (TP.isString(String.$subsReStr)) {
        String.$subsReStr = String.$subsReStr.slice(0, -1) +
                                '|' + anExistenceTest + ')';
    } else {
        //  Otherwise, initialize the String for the overall test RegExp to
        //  the proper value.
        String.$subsReStr = '(' + anExistenceTest + ')';
    }

    //  Make the overall test RegExp from its String.
    String.$subsRe = TP.rc(String.$subsReStr);

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

String.Inst.defineAttribute('delimiter', '');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

String.Inst.defineMethod('add',
function(varargs) {

    /**
     * @method add
     * @summary Adds one or more items, usually strings, to the receiver.
     * @param {arguments} varargs One or more objects to concatentate to the
     *     receiver in string form.
     * @returns {String} A newly formed string.
     */

    var len,
        arr,
        i;

    len = arguments.length;
    if (len > 1) {
        arr = TP.ac();
        for (i = 0; i < len; i++) {
            arr.push(arguments[i]);
        }

        return this.toString() + arr.join('');
    }

    return this.toString() + TP.str(arguments[0]);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asCleanString',
function() {

    /**
     * @method asCleanString
     * @summary Returns the 'clean' string representation of the receiver.
     *     This may have transformations in it to 'clean' the String, such as
     *     removing unnecessary namespace definitions, etc. For this type, it
     *     just returns the receiver itself.
     * @returns {String} The receiver in clean string form.
     */

    return this;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asHash',
function() {

    /**
     * @method asHash
     * @summary Returns the receiver as a TP.core.Hash using parsers
     *     available for the TP.core.Hash type. Strings conforming to query
     *     strings, CSS declarations, and other forms depend on TP.core.Hash to
     *     parse them properly. If no parser can convert the string into a
     *     proper TP.core.Hash instance then a TP.core.Hash containing the
     *     receiver as the only key will be returned.
     * @returns {TP.core.Hash} A hash of key/value pairs represented by the
     *     receiver.
     */

    var hash;

    hash = TP.core.Hash.fromString(this.asString());

    if (TP.notValid(hash)) {
        return TP.hc(this.asString(), null);
    }
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asHashedNumber',
function() {

    /**
     * @method asHashedNumber
     * @summary Returns the receiver as a hashed number using a one-way hashing
     *     function.
     * @returns {Number} The receiver as a hashed number.
     */

    /* eslint-disable no-extra-parens */
    return this.split('').reduce(
                function(a, b) {
                    var retVal;

                    retVal = ((a << 5) - a) + b.charCodeAt(0);
                    return retVal & retVal;
                },
                0);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

//  Alias this over for the convenience of the as()/format() calls
String.Inst.defineMethod('asLowerCase', TP.StringProto.toLowerCase);

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asMD5',
function(formatParams) {

    /**
     * @method asMD5
     * @summary Returns the receiver as hashed by the MD5 hash.
     * @param {TP.core.Hash|TP.sig.Request} formatParams Optional format
     *     parameters. These are parameters to a hashing result format and
     *     should contain a key of 'hashFormat' that has one of the following
     *     values:
     *          TP.HASH_B64
     *          TP.HASH_LATIN1
     *          TP.HASH_HEX
     *      The default is TP.HASH_HEX
     * @returns {String} The receiver as an MD5 hash.
     */

    var params;

    params = TP.hc(formatParams);
    params.atPutIfAbsent('hashFormat', TP.HASH_HEX);

    return TP.hash(this.asString(), TP.HASH_MD5, params.at('hashFormat'));
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asSHA1',
function(formatParams) {

    /**
     * @method asSHA1
     * @summary Returns the receiver as hashed by the SHA-1 hash.
     * @param {TP.core.Hash|TP.sig.Request} formatParams Optional format
     *     parameters. These are parameters to a hashing result format and
     *     should contain a key of 'hashFormat' that has one of the following
     *     values:
     *          TP.HASH_B64
     *          TP.HASH_LATIN1
     *          TP.HASH_HEX
     *      The default is TP.HASH_HEX
     * @returns {String} The receiver as an SHA-1 hash.
     */

    var params;

    params = TP.hc(formatParams);
    params.atPutIfAbsent('hashFormat', TP.HASH_HEX);

    return TP.hash(this.asString(), TP.HASH_SHA1, params.at('hashFormat'));
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asQueryString',
function() {

    /**
     * @method asQueryString
     * @summary Converts the receiver into a String where any characters that
     *     need to be escaped in a URI query string have been converted into
     *     their escaped equivalent.
     * @returns {String} The receiver with URI entities escaped.
     */

    return encodeURIComponent(this);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asUnicodeLiteral',
function() {

    /**
     * @method asUnicodeLiteral
     * @summary Returns a Unicode literal representation of the receiver. For
     *     instance, for a single character String of 'b', this method will
     *     return '\u0062'.
     * @returns {String} The Unicode literal String representation of the
     *     receiver.
     */

    var str,
        unicodeRetStr,
        i,
        unicodeCharStr;

    str = this.toString();
    unicodeRetStr = '';

    //  Loop and build up a 4 character Unicode representation for each
    //  character in the receiver.
    for (i = 0; i < str.length; i++) {

        unicodeCharStr = str.charCodeAt(i).toString(16).toUpperCase();

        //  Front-pad it with '0's
        while (unicodeCharStr.length < 4) {
            unicodeCharStr = '0' + unicodeCharStr;
        }

        //  Prepend a '\u' and move on to the next character in the receiver.
        unicodeCharStr = '\\u' + unicodeCharStr;
        unicodeRetStr += unicodeCharStr;
    }

    return unicodeRetStr;
});

//  ------------------------------------------------------------------------

//  Alias this over for the convenience of the as()/format() calls
String.Inst.defineMethod('asUpperCase', TP.StringProto.toUpperCase);

//  ------------------------------------------------------------------------

String.Inst.defineMethod('charToLowerCase',
function(index) {

    /**
     * @method charToLowerCase
     * @summary Returns the receiver with the character at position index in
     *     lowercase format.
     * @param {Number} index The index of the character to make lower case.
     * @exception TP.sig.InvalidIndex
     * @returns {String} The string with the character at index in lower case.
     */

    return this.slice(0, index) +
            this.charAt(index).toLowerCase() +
            this.slice(index + 1);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('charToUpperCase',
function(index) {

    /**
     * @method charToUpperCase
     * @summary Returns the receiver with the character at position index in
     *     uppercase format.
     * @param {Number} index The index of the character to make upper case.
     * @exception TP.sig.InvalidIndex
     * @returns {String} The string with the character at index in upper case.
     */

    return this.slice(0, index) +
            this.charAt(index).toUpperCase() +
            this.slice(index + 1);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('chop',
function(aTail) {

    /**
     * @method chop
     * @summary Returns the receiver with aTail removed provided the receiver
     *     ends with that character sequence.
     * @param {String} aTail The character(s) to remove if found.
     * @returns {String} A new string minus the tail.
     */

    if (this.endsWith(aTail)) {
        return this.slice(0, 0 - aTail.getSize());
    }

    //  Make sure to force the conversion to a primitive string.
    return this.toString();
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('chunkToWidth',
function(aWidth) {

    /**
     * @method chunkToWidth
     * @summary Returns an array containing the pieces of the receiver after
     *     splitting it into chunks no wider than aWidth. This is a more
     *     primitive method used by the splitToWidth method to break apart
     *     substrings without any whitespace.
     * @param {Number} aWidth The width to split the receiver chunks into.
     * @returns {String[]} The receiver split by the width provided.
     */

    var i,
        tmparr;

    tmparr = TP.ac();

    i = 0;
    while (i < this.getSize()) {
        tmparr.add(this.substr(i, aWidth));
        i += aWidth;
    }

    return tmparr;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('collapseWhitespace',
function() {

    /**
     * @method collapseWhitespace
     * @summary Returns the receiver with multiple occurrences of the space
     *     character condensed to a single occurrence in accordance with the XML
     *     Schema rules for whitespace collapse. If you also want to convert
     *     newlines and tabs to spaces, call replaceWhitespace() first. Note
     *     that leading and trailing spaces are also removed as a result of this
     *     call.
     * @returns {String} The receiver.
     */

    var res,
        re;

    res = this.replace(/\u0020\u0020/g, '\u0020');

    re = /\u0020\u0020/;
    while (re.test(res)) {
        res = res.replace(/\u0020\u0020/g, '\u0020');
    }

    res = res.trim();

    return res;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('compact',
function(aFilter) {

    /**
     * @method compact
     * @summary Returns a compact version of the receiver. In the case of
     *     string instances this is done by removing duplicate character
     *     sequences such as repeated spaces or tabs rather than by removing
     *     nulls as with other collection types.
     * @param {Selector} aFilter A Function, RegExp, or character (String) which
     *     defines which characters to compact.
     * @returns {String} A new string with the compaction done.
     */

    var filter,
        arr,
        last,
        wi,
        len,
        i,
        ch;

    //  optimize for character strings
    if (this.length < 2) {
        return this.toString();     //  watch out for moz
    }

    filter = aFilter || TP.regex.WHITESPACE;

    arr = this.split('');
    last = arr.at(0);

    wi = 1;
    len = arr.getSize();
    for (i = 1; i < len; i++) {
        ch = arr.at(i);

        //  two cases "work"...the char is not a dup of the last char, or it
        //  is a dup but that char isn't being compacted
        if (last !== ch) {
            arr[wi] = ch;
            last = ch;
            wi++;
        } else if (!filter.test(ch)) {
            arr[wi] = ch;
            last = ch;
            wi++;
        }
    }

    if (wi < len) {
        arr.length = wi;
    }

    return arr.join('');
});

//  ------------------------------------------------------------------------

//  ECMA E6 defines 'endsWith', so only install here if it doesn't exist.

if (!TP.isFunction(TP.StringProto.endsWith)) {
    String.Inst.defineMethod('endsWith',
    function(aSuffix, fromIndex) {

        /**
         * @method endsWith
         * @summary Returns true if the receiver ends with the suffix provided.
         * @param {String} aSuffix The string to check as a suffix.
         * @param {Number} [fromIndex] An optional position to start the search
         *     from.
         * @returns {Boolean} Whether or not the receiver ends with the
         *     supplied index.
         */

        var ind;

        if (TP.isEmpty(aSuffix)) {
            return false;
        }

        if ((ind = this.lastIndexOf(aSuffix, fromIndex)) === TP.NOT_FOUND) {
            return false;
        }

        /* eslint-disable no-extra-parens */
        return ind === (this.length - aSuffix.length);
        /* eslint-enable no-extra-parens */
    });
} else {
    //  Otherwise, just register the builtin.
    String.Inst.defineMethod('endsWith', TP.StringProto.endsWith); //   E6
}

//  ------------------------------------------------------------------------

String.Inst.defineMethod('escapeWhitespace',
function() {

    /**
     * @method escapeWhitespace
     * @summary Escapes any JavaScript constructs that have meaning to JS code
     *     like newlines, returns and tabs.
     * @returns {String} The string with its JS code constructs escaped.
     */

    var str;

    //  doubling escapes means we'll always have an even number in the
    //  string so they come back in properly when eval'd
    str = this.replace(/\\/g, '\\\\');

    //  convert anything that might give us an auto-semicolonoscopy ;)
    str = str.replace(/\n/g, '\\n');
    str = str.replace(/\r/g, '\\r');

    //  other common escapes should also be updated to their JS rep
    str = str.replace(/\t/g, '\\t');

    return str;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('getContent',
function() {

    /**
     * @method getContent
     * @summary Returns the receiver. This method is used in content processing
     *     to support polymorphic access to String data.
     * @returns {String}
     */

    //  Make sure to force the conversion to a primitive string.
    return this.toString();
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('getLocation',
function() {

    /**
     * @method getLocation
     * @summary Returns the receiver. This method is used to conform to the
     *     TP.uri.URI API.
     * @returns {String}
     */

    //  Make sure to force the conversion to a primitive string.
    return this.toString();
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('isSourceString',
function() {

    /**
     * @method isSourceString
     * @summary Returns true if the receiver can be thought of as a KeyValue
     *     string, meaning that it begins and ends with []s or {}s and contains
     *     at least one comma ([]) or colon ({}) and has room for at least 1
     *     character for a key and value. Due to bugs in IE with trailing commas
     *     as in [1,] we don't validate this.
     * @returns {Boolean}
     */

    if (this.getSize() < 5) {
        //  can't be a kvstring with no room for data
        return false;
    }

    if (this.first() === '{' && this.last() === '}') {
        return this.containsString(':');
    }

    if (this.first() === '[' && this.last() === ']') {
        return this.containsString(',');
    }

    return false;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('hasFragment',
function() {

    /**
     * @method hasFragment
     * @summary Returns true if the path contains a fragment reference. This is
     *     typically associated with anchors, barenames, or full XPointers.
     *     Provided for polymorphic API with TP.uri.URI.
     * @returns {Boolean}
     */

    return TP.regex.URI_FRAGMENT.test(this);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('multiReplace',
function(aHash) {

    /**
     * @method multiReplace
     * @summary Performs a 'multiple replace' on the receiver, with the
     *     supplied hash supplying the character sequences to look for and the
     *     replacements for those sequences as keys and values.
     * @description This method replaces the String found as each key in the
     *     supplied hash with the corresponding value found there.
     * @param {TP.core.Hash} aHash The replacements to perform on the receiver.
     * @returns {String} The receiver with any Strings found by matching each
     *     key in the supplied hash replaced by their corresponding value in the
     *     hash.
     */

    var str;

    //  Make sure to force the conversion to a primitive string.
    str = this.toString();

    TP.keys(aHash).perform(
        function(aKey) {
            str = str.replace(TP.rc(aKey, 'g'), aHash.at(aKey));
        });

    return str;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('overlayCharacters',
function(aSource, aChar) {

    /**
     * @method overlayCharacters
     * @summary Each char matching aChar (which defaults to @) in the
     *     receiver is replaced with a character from aSource as in:
     *
     *     "(@@@) @@@-@@@@".overlayCharacters(3035551212); ... (303) 555-1212
     * @param {Object} aSource The data source providing new characters.
     * @param {String} aChar The character to replace. Defaults to "@".
     * @returns {String} The receiver.
     * @abtract Replaces in a one-for-one fashion the characters in the receiver
     *     matching aChar with characters from aSource.
     */

    var ch,

        thePattern,

        counter,
        theMatcher,

        theSource,
        sourceSize,

        results;

    ch = TP.ifInvalid(aChar, '@');

    //  Make sure to force the conversion to a primitive string.
    thePattern = this.toString();

    counter = 0;
    theMatcher = TP.rc(ch + '{1}', 'g');

    //  Get the string representation of aSource.
    theSource = aSource.asString();
    sourceSize = theSource.getSize();

    //  Loop over the pattern, looking for matching replacement characters
    //  If one is found, replace it with the character found in the source
    //  at counter.
    results = thePattern.replace(
                theMatcher,
                function(wholeMatch) {

                    var result;

                    result = theSource.at(counter);
                    counter++;

                    //  If counter is equal to the source's length, then
                    //  we've come to the end of the source's character
                    //  data, so wrap around.
                    if (counter === sourceSize) {
                        counter = 0;
                    }

                    return result;
                });

    return results;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('overlayFloat',
function(aSource) {

    /**
     * @method overlayFloat
     * @summary Formats a floating point number according to the template
     *     information in the receiver.
     * @param {Number} aSource A data source to format.
     * @exception TP.sig.InvalidNumericTemplate
     * @returns {String} A formatted number string.
     */

    var patParts,

        sourceInteger,

        fracPat,
        fracPatSize,
        sourceFraction,

        leftPart,
        rightPart;

    //  Split the pattern along the decimal point character always used in
    //  patterns ('.') and manage parts separately
    patParts = this.split('.');

    //  If there is more than one decimal point, then something is
    //  seriously wrong...
    if (patParts.getSize() > 2) {
        this.raise('TP.sig.InvalidNumericTemplate');
        return this;
    }

    sourceInteger = aSource.integer();

    if (TP.notEmpty(fracPat = patParts.at(1))) {
        fracPatSize = fracPat.getSize();
    }

    //  found decimal point so treat each part individually
    if (patParts.getSize() === 2) {
        sourceFraction = aSource.round(fracPatSize).fraction(fracPatSize);

        //  If fracPat is empty, then the pattern had a decimal point, but no
        //  format on the right side. Therefore, no right hand digits will be
        //  displayed, but if the first right hand digit is greater than 4, then
        //  it will round the left part up...
        if (TP.isEmpty(fracPat)) {
            //  If the sourceFraction isn't zero, then it might be either
            //  .5 or 0.5, depending on the platform (.5 - Nav, 0.5 - IE)
            //  or greater, in which case we need to round up the
            //  sourceInteger. In any case, convert it to a String, split it
            //  and look at the first character in the second split segment
            //  as converted back to a Number. If it is greater than 4, then
            //  we have to round the sourceInteger up one.
            if (sourceFraction !== 0) {
                if (parseInt(
                    sourceFraction.asString().split('.').at(1).at(0),
                    10) > 4) {
                    sourceInteger++;
                }
            }

            //  In any case, there is no right hand part to the result.
            rightPart = '';
        } else {
            //  Otherwise, there were real formatting characters in the
            //  right hand side of the format.

            //  If the sourceFraction isn't zero, assign the formatted
            //  sourceFraction to the right hand part of the result. Note
            //  that the sourceFraction might either be '.x' or '0.x',
            //  depending on the platform (.x - Nav, 0.x - IE). Therefore,
            //  we need to convert it to aString, split it and format the
            //  result in the second split segment as converted back to a
            //  Number
            if (sourceFraction !== 0) {
                rightPart = fracPat.overlayInteger(
                            sourceFraction.asString().split('.').at(1),
                            TP.RIGHT);
            } else {
                //  Otherwise, just assign a formatted 0 to the right hand
                //  part of the result.
                rightPart = fracPat.overlayInteger(
                            0,
                            TP.RIGHT);
            }
        }

        leftPart = patParts.at(0).overlayInteger(
                                    sourceInteger,
                                    TP.LEFT);

        if (TP.isEmpty(leftPart) && TP.isEmpty(rightPart)) {
            return '';
        }

        if (sourceInteger.isNegative()) {
            leftPart = '-' + leftPart;
        }

        //  Put the two halves back together, using the decimal point
        //  character as determined by the Number type (which will use any
        //  locale information if it is loaded).
        return leftPart + Number.getDecimalPoint() + rightPart;
    }

    sourceFraction = aSource.fraction(1);

    //  If patParts has only 1 entry, then the pattern had no format on the
    //  right side. Therefore, no right hand digits will be displayed. But
    //  if the sourceFraction isn't zero, then it might be either .5 or
    //  0.5, depending on the platform (.5 - Nav, 0.5 - IE) or greater, in
    //  which case we need to round up the sourceInteger. In any case,
    //  convert it to a String, split it and look at the first character in
    //  the second split segment as converted back to a Number. If it is
    //  greater than 4, then we have to round the sourceInteger up one.
    if (sourceFraction !== 0) {
        if (parseInt(
            sourceFraction.asString().split('.').at(1).at(0),
            10) > 4) {
            sourceInteger++;
        }
    }

    //  In any case, return just formatting the sourceInteger

    if (sourceInteger.isNegative()) {
        return '-' + patParts.at(0).overlayInteger(sourceInteger, TP.LEFT);
    }

    return patParts.at(0).overlayInteger(sourceInteger, TP.LEFT);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('overlayInteger',
function(aSource, aSide) {

    /**
     * @method overlayInteger
     * @summary Formats an "integer" number (meaning a whole number), according
     *     to the format in the receiver. It has different rules depending on
     *     the 'side' of a possible overall 'real' number it is being formatted
     *     as a part of.
     * @description This method does *NOT* deal with negative numbers. All
     *     incoming sources are converted to Numbers and are then abs()ed. Users
     *     of this method must deal with marking up negative numbers in their
     *     own way.
     * @param {String} aSource The data source being formatted. Should be a
     *     String with a whole number.
     * @param {String} aSide The side of the decimal point the integer is on.
     *     This is useful for formatting floats in parts. This should be either
     *     TP.LEFT or TP.RIGHT.
     * @returns {String} A formatted number string.
     */

    var theSource,
        hasThousands,
        matcher,
        patStr,
        patStrLength,
        sourceStr,
        index,
        lastDigit,
        side,
        str;

    //  Quick exit - if we are empty, there is nothing to do.
    if (TP.isEmpty(this)) {
        return '';
    }

    //  Quick exit - If aSource is 0 and the format only has octothorp
    //  characters ('#'), then nothing is going to come out anyway, so just
    //  return the empty string here.
    String.$allHashMarker.lastIndex = 0;
    if (parseInt(aSource, 10) === 0 && String.$allHashMarker.test(this)) {
        return '';
    }

    side = TP.ifInvalid(aSide, TP.LEFT);

    hasThousands = false;

    /* eslint-disable consistent-this */
    patStr = this;
    /* eslint-enable consistent-this */
    patStrLength = patStr.getSize();

    //  If we're formatting a number so that it can go on the left-hand
    //  side of an overall larger real number...
    if (side === TP.LEFT) {
        //  NOTE: WE DO NOT DEAL WITH NEGATIVE NUMBERS HERE. THIS METHOD'S
        //  USERS MUST DEAL WITH NEGATIVITY IN THEIR OWN WAY!!!
        theSource = parseInt(aSource, 10).abs();
        sourceStr = theSource.toString();   //  don't let it recurse by
                                            //  calling asString here!

        //  If thousands are specified, then strip them out of the pattern
        //  and set the hasThousands flag
        matcher = Number.getThousandsMatcher();
        matcher.lastIndex = 0;
        if (matcher.test(patStr)) {
            matcher.lastIndex = 0;
            patStr = patStr.strip(matcher);
            patStrLength = patStr.getSize();
            hasThousands = true;
        }

        //  If the source string and the pattern string have the same
        //  number of characters, or the source string has a greater number
        //  of characters than the pattern string, then there is no real
        //  formatting to do, except for thousands formatting, if
        //  necessary.
        if (sourceStr.getSize() >= patStrLength) {
            if (hasThousands) {
                return sourceStr.overlayThousands();
            }

            return sourceStr;
        }

        //  Otherwise, there are fewer characters in the source string than
        //  in the pattern string, so we just need to use the source string
        //  and then prepend the proper characters onto the front,
        //  depending on the format.

        //  If theSource isn't zero, then set the initial value of the
        //  result to the source's String representation and the index to
        //  begin filling in to the difference in length between the
        //  pattern and the result (minus 1).
        if (theSource !== 0) {
            str = sourceStr;
            index = patStrLength - str.getSize() - 1;
        } else {
            //  Otherwise, there is no content in the source's String
            //  representation to start with.
            str = '';
            index = patStrLength - 1;
        }

        //  Loop backwards along the pattern string. If the character is a
        //  octothorp ('#'), place nothing and move on. If the character is
        //  a zero, place a '0' and if its a question mark, place a ' '.
        for (; index >= 0; index--) {
            if (patStr.at(index) === '#') {
                continue;
            } else if (patStr.at(index) === '0') {
                str = '0' + str;
            } else if (patStr.at(index) === '?') {
                str = ' ' + str;
            }
        }

        //  Do thousands formatting, if necessary, and return the result.
        if (hasThousands) {
            return str.overlayThousands();
        }

        //  We're done - we can exit here.
        return str;
    }

    //  If we're formatting a number so that it can go on the right-hand
    //  side of an overall larger real number...
    if (side === TP.RIGHT) {
        theSource = parseInt(aSource, 10).abs();

        //  NB: We don't detect here whether we've been passed a negative
        //  number. This would be unusual in a TP.RIGHT hand side format
        //  anyway but it also has the bad side effect of converting '01'
        //  to '1' and, although that's ok for TP.LEFT hand side format,
        //  its not for TP.RIGHT.
        sourceStr = aSource.asString();

        //  Thousands aren't allowed on the right hand side of the decimal
        matcher = Number.getThousandsMatcher();
        matcher.lastIndex = 0;
        if (matcher.test(sourceStr)) {
            this.raise('TP.sig.InvalidNumericTemplate');

            return this;
        }

        //  If the source string and the pattern string have the same
        //  number of characters, then there is no real formatting to do.
        //  Return the source string.
        if (sourceStr.getSize() === patStrLength) {
            return sourceStr;
        }

        //  If the source string is larger than the pattern string then,
        //  because we're to the right of the decimal, we're going to chop
        //  it at the number of characters in the pattern string. Also, if
        //  the digit right after the chopping index is 5 or greater, we
        //  round up the last digit in the chopped value.
        if (sourceStr.getSize() > patStrLength) {
            str = sourceStr.slice(0, 0 - (patStrLength - 1));

            if (parseInt(sourceStr.at(patStrLength), 10) > 4) {
                lastDigit = parseInt(sourceStr.at(patStrLength - 1), 10);
                str = sourceStr.slice(0, patStrLength - 1);

                /* eslint-disable no-extra-parens */
                str += (lastDigit + 1);
                /* eslint-enable no-extra-parens */
            }

            return str;
        }

        //  Otherwise, there are fewer characters in the source string than
        //  in the pattern string, so we just need to use the source string
        //  and then prepend the proper characters onto the front,
        //  depending on the format.

        //  If theSource isn't zero, then set the initial value of the
        //  result to the source's String representation and the index to
        //  begin filling in to the source's String representation's
        //  length.
        if (theSource !== 0) {
            str = sourceStr;
            index = sourceStr.getSize();
        } else {
            //  Otherwise, there is no content in the source's String
            //  representation to start with.
            str = '';
            index = 0;
        }

        //  Loop forwards along the pattern string. If the character is a
        //  hash ('#'), place nothing and move on. If the character is a
        //  zero, place a '0' and if its a question mark, place a ' '.

        //  NOTE, the leading ; is not a bug, we set the index above
        for (; index < patStrLength; index++) {
            if (patStr.at(index) === '#') {
                continue;
            } else if (patStr.at(index) === '0') {
                str += '0';
            } else if (patStr.at(index) === '?') {
                str += ' ';
            }
        }

        return str;
    }

    return null;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('overlayThousands',
function() {

    /**
     * @method overlayThousands
     * @summary Replaces/inserts the properly localized "comma" from
     *     Number.getThousandsSeparator() in the proper locations based on
     *     Number.getThousandsGroupSize().
     * @returns {String} The modified string.
     */

    var groupSize,
        separator,

        str,

        start,
        index,

        indexOfSpace,
        matcher,
        spaceyChunk,
        nonSpaceyChunk;

    groupSize = Number.getThousandsGroupSize();
    separator = Number.getThousandsSeparator();

    str = '';

    //  Loop over the receiver, slicing it back from the end according to
    //  the group size and prepending the separator onto the front of it.
    start = this.getSize() - groupSize;
    for (index = start; index >= 0; index = index - groupSize) {
        str = separator + this.slice(index, index + groupSize) + str;
    }

    //  Prepend any remaining text that didn't fit the grouping size onto
    //  the front of the result.
    str = this.slice(0, index + groupSize) + str;

    //  If we find a space in the result, then we need to find the index of
    //  the last space, slice from the beginning to just beyond it, and
    //  replace any separators with spaces. This avoids problem formats
    //  like: ' ,  1,234.56'. Then rebuild the result string with the new
    //  front piece.
    indexOfSpace = str.lastIndexOf(' ');
    if (indexOfSpace !== TP.NOT_FOUND) {
        matcher = Number.getThousandsMatcher();
        matcher.lastIndex = 0;

        spaceyChunk = str.slice(0, indexOfSpace + 1);
        spaceyChunk = spaceyChunk.strip(matcher);
        nonSpaceyChunk = str.slice(indexOfSpace + 1);

        if (nonSpaceyChunk.indexOf(',') === 0) {
            nonSpaceyChunk = nonSpaceyChunk.slice(1);
        }

        str = spaceyChunk + nonSpaceyChunk;
    } else {
        //  If the receiver divides evenly into the groupSize, then there
        //  will be a extra separator on the front of the result. Slice it
        //  off.
        if (this.getSize() % groupSize === 0) {
            str = str.slice(1);
        }
    }

    return str;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('processTP_sig_Request',
function(aRequest) {

    /**
     * @method processTP_sig_Request
     * @summary Processes the receiver's content using the request to provide
     *     control parameters. If the string can be converted into a valid XML
     *     node that node is processed, otherwise the processing is performed
     *     via the substitute method.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request or hash
     *     containing control parameters.
     * @returns {TP.sig.Response} A response containing the processing results.
     */

    var doc,
        node,
        dataSource,
        keySource,

        request,
        result,
        response;

    request = TP.request(aRequest);

    //  if the string represents markup then we work from that perspective
    if (TP.isValid(doc = TP.dom.Node.from(this))) {
        node = doc.getDocumentElement();
        return TP.process(node, request);
    }

    if (TP.isValid(request)) {
        dataSource = TP.ifKeyInvalid(request, 'dataSource', request);
        keySource = TP.ifKeyInvalid(request, 'keySource', null);
    }

    result = this.substitute(dataSource, keySource);

    response = request.getResponse(result);
    request.complete(result);

    return response;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('quoted',
function(aQuoteChar) {

    /**
     * @method quoted
     * @summary Returns the receiver as a quoted string with embedded quotes
     *     escaped. The default quote character is a single quote in keeping
     *     with TIBET coding standards which use single quoted strings for
     *     JavaScript and double quoted strings for *ML.
     * @param {String} aQuoteChar A quoting character to use. Default is "'"
     *     (single quote/apostrophe).
     * @returns {String} The string as a quoted string.
     */

    var quote,
        str;

    quote = aQuoteChar || '\'';

    //  presume if we're quoted we're already ok (and we're not a single
    //  character length)

    //  if we're quoted already (make sure to check we're not a 1 character
    //  String), we're already ok.
    if (this.first() === quote &&
        this.last() === quote &&
        this.length > 1) {
        //  Make sure to force the conversion to a primitive string.
        return this.toString();
    }

    //  Escape any JavaScript 'code constructs' (i.e. newlines, returns, tab
    //  characters, etc.)
    str = this.escapeWhitespace();

    //  now we can escape any quotes that are left and put on our outer
    //  quotation marks
    str = str.replace(TP.rc(quote, 'g'), '\\' + quote);

    return quote + str + quote;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('replaceBetweenDelimiters',
function(startDelim, endDelim, aFunction) {

    /**
     * @method replaceBetweenDelimiters
     * @summary This method finds chunks of text between two delimiters and
     *     runs the standard String 'replace()' function on each chunk, using
     *     the supplied Function as the replacement Function.
     * @param {RegExp} startDelim The RegExp to match the starting position of
     *     the chunk of text to be replaced.
     * @param {RegExp} endDelim The RegExp to match the ending position of the
     *     chunk of text to be replaced.
     * @param {Function} aFunction The Function to use to replace the text.
     * @returns {String} The entries processed for use in JavaScript Functions.
     */

    var startDelimStr,
        endDelimStr,

        fullRegExp,
        theString,

        endIndex,
        arr,
        lastLastIndex,
        results;

    //  Grab the start delimiter's RegExp, convert it to a standard String
    //  and slice off the '/'s on either end.
    startDelimStr = startDelim.toString();
    startDelimStr = startDelimStr.slice(1, startDelimStr.getSize() - 1);

    //  Grab the end delimiter's RegExp, convert it to a standard String
    //  and slice off the '/'s on either end.
    endDelimStr = endDelim.toString();
    endDelimStr = endDelimStr.slice(1, endDelimStr.getSize() - 1);

    //  Build a RegExp that uses the RegExp 'description strings' for the
    //  start and end delimiters that will ind a start delimiter and an end
    //  delimiter before any more start delimiters.
    fullRegExp = TP.rc(startDelimStr +
                                '(((.|\\n)(?!' + startDelimStr + '))+?)' +
                                endDelimStr,
                            'g');

    endIndex = 0;
    arr = TP.ac();
    lastLastIndex = 0;

    /* eslint-disable consistent-this */
    theString = this;
    /* eslint-enable consistent-this */

    //  While the results that get returned from processing theString
    //  continue to be valid, run the replacement function over the chunk
    //  of text that is found between the start and end delimiters.
    while (TP.isArray(results = fullRegExp.exec(theString))) {
        //  Set the ending index to be the index where a match was found.
        endIndex = results.index;

        //  Slice from the 'last' last index to the endIndex and append
        //  that to the result. This appends any text that was found
        //  between the last match and this match to the results.
        arr.push(theString.slice(lastLastIndex, endIndex));

        //  Grab the last index (that is, the first position of the match)
        //  and store it away.
        lastLastIndex = fullRegExp.lastIndex;

        //  Execute the replacement function supplying the result arguments
        //  at 0 and 1 (which will be the full match and the text between
        //  the delimiters, respectively) and append that to the result.
        arr.push(aFunction(results.at(0), results.at(1)));

        //  Restore the setting of the last index.
        fullRegExp.lastIndex = lastLastIndex;
    }

    //  Append whatever is left from the lastLastIndex to the end of the
    //  array
    arr.push(theString.slice(lastLastIndex));

    return arr.join('');
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('replaceWhitespace',
function(aString) {

    /**
     * @method replaceWhitespace
     * @summary Returns a copy of the string with all tabs (#x9), linefeeds
     *     (#xA), and carriage returns (#xD) replaced with spaces (#x20) per the
     *     XML Schema rules for whitespace replacement, or with aString if
     *     provided.
     * @param {String} aString The replacement string to use. This defaults to
     *     the space character (#x20).
     * @returns {String} A new string with the receiver's content after
     *     whitespace replacement.
     */

    var replacement;

    replacement = TP.ifInvalid(aString, '\u0020');

    /* eslint-disable no-control-regex */
    return this.replace(/[\u0009\u000A\u000D]/g, replacement);
    /* eslint-enable no-control-regex */
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('setDelimiter',
function(aString) {

    /**
     * @method setDelimiter
     * @summary Sets the string used to split() the receiver.
     * @param {String} aString The delimiter string. Defaults to '' to create
     *     character arrays.
     * @returns {String} The receiver.
     */

    var str;

    str = TP.ifInvalid(aString, '');

    if (this.$get('delimiter') !== str) {
        this.$set('delimiter', str);
    }

    //  Make sure to force the conversion to a primitive string.
    return this.toString();
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('sliceFrom',
function(delimiter, inclusive, last) {

    /**
     * @method sliceFrom
     * @summary Slices the receiver up to the character or string provided.
     * @param {String} delimiter The string to slice to.
     * @param {Boolean} inclusive True to include the delimiter in the returned
     *     string.
     * @param {Boolean} last True if the delimiter should be the last occurrence
     *     in the receiver.
     * @returns {String} The sliced content.
     */

    var str,
        ind,
        len;

    str = this.toString();

    ind = last === true ?
            this.lastIndexOf(delimiter) :
            this.indexOf(delimiter);

    if (ind === TP.NOT_FOUND) {
        return str;
    }
    len = delimiter.getSize();

    /* eslint-disable no-extra-parens */
    return (inclusive === true) ? str.slice(ind) : str.slice(ind + len);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('sliceTo',
function(delimiter, inclusive, last) {

    /**
     * @method sliceTo
     * @summary Slices the receiver up to the character or string provided.
     * @param {String} delimiter The string to slice to.
     * @param {Boolean} inclusive True to include the delimiter in the returned
     *     string.
     * @param {Boolean} last True if the delimiter should be the last occurrence
     *     in the receiver.
     * @returns {String} The sliced content.
     */

    var str,
        ind;

    str = this.toString();

    ind = last === true ?
            this.lastIndexOf(delimiter) :
            this.indexOf(delimiter);

    if (ind === TP.NOT_FOUND) {
        return str;
    }

    return str.slice(0, ind) + (inclusive === true) ? delimiter : '';
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('splitAtIndex',
function(index) {

    /**
     * @method splitAtIndex
     * @summary Returns an array containing the pieces of the receiver after
     *     splitting it at the index provided. The character at the specified
     *     index is placed in the second segment.
     * @param {Number} index The index to split the receiver at.
     * @exception TP.sig.InvalidIndex
     * @returns {String} The receiver split at the index provided.
     */

    var tmparr;

    tmparr = TP.ac();
    tmparr.add(this.slice(0, index));
    tmparr.add(this.slice(index));

    return tmparr;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('splitToWidth',
function(aWidth, justified, forRendering, joinChar, splitMark) {

    /**
     * @method splitToWidth
     * @summary Takes a string and splits it into an array whose contents are
     *     the longest substrings possible. The break is done using whitespace
     *     whenever possible, but can also force a break in long strings so they
     *     won't cause horizontal scrolling. The resulting array is then joined
     *     using the character provided in the 'joinChar' parameter.
     * @param {Number} aWidth The width to fit the string to.
     * @param {Boolean} justified Should output formatting try to fill text
     *     blocks in justified form, or leave a ragged right edge?
     * @param {Boolean} forRendering True if the string is intended for
     *     rendering and is likely to contain markup content to work around.
     * @param {String} joinChar The character to use to join the split array
     *     elements.
     * @param {String} splitMark The string to use for replacement of content
     *     during processing. The default is ##MARK## which shouldn't be found
     *     in most content. But on the off chance you have data that might use
     *     that you can change it here.
     * @returns {String} The split/joined string result.
     */

    var i,
        j,
        ch,
        it,
        len,
        str,
        arr,
        arr1,
        arr2,
        size,
        mark,
        width,
        resarr,
        tmparr,

        restr,
        sizer;

    width = TP.ifInvalid(aWidth, 80);

    if (this.getSize() <= width) {
        return this;
    }

    //  set a string we can use to help with format breaks. note that we
    //  allow this to be altered via parameter just in case
    mark = TP.ifInvalid(splitMark, '##MARK##');

    //  we default to newline and expect that any newlines will be converted
    //  to br's as needed based on the rendering requirements
    ch = TP.ifInvalid(joinChar, '\n');

    //  we'll do the easy case first. when we're not planning on rendering
    //  the output (at least not without escaping it) we can rely on the
    //  length we see in the string and work directly with it
    if (TP.notTrue(forRendering)) {
        //  RegExp based split
        restr = '((.){0,' + width + '}[ \\t\\n]|(.){' + width + '})';
        sizer = TP.rc(restr, 'g');

        return this.replace(sizer, '$1' + ch);
    }

    //  next case is where we have to deal with markup. the first question
    //  is whether the markup is quoted or not. if it is, we have to leave
    //  it alone, but if not we want to leverage breaks as newlines and
    //  split on them to get things started

    if (TP.isTrue(forRendering)) {
        tmparr = TP.ac();
        if (/"([^"])*<br([^"])*"/.test(this) ||
            /'([^'])*<br([^'])*'/.test(this)) {
            //  quoted, so we'll need to ignore it
            tmparr.add(this);
        } else if (/<br.?>/.test(this)) {
            //  split lines with embedded, non-quoted br's
            tmparr.add(this.split(/<br.?>/));
        } else {
            tmparr.add(this);
        }
    }

    //  at this point we have an array whose elements have been split if
    //  they had unquoted br's in them, but otherwise they're untouched...
    if (TP.isTrue(forRendering)) {
        for (i = 0; i < tmparr.length; i++) {
            //  need to work around the fact that the markup itself will
            //  throw off our length computations if we don't find a way to
            //  ignore it
            str = tmparr[i].replace(/</g, mark + '<');
            str = str.replace(/>/g, '>' + mark);
            arr = str.split(mark);

            //  odd chunks are non-markup content. this breaks apart any
            //  of them which are individually too long for the width
            for (j = 0; j < arr.length; j += 2) {
                if (TP.notEmpty(arr.at(j))) {
                    arr1 = arr.at(j).splitToWidth(width, false,
                                                    false, mark);
                    arr2 = arr1.split(mark);
                    arr.atPut(j, arr2);
                }
            }

            //  flatten out any embedded arrays so we can do final iteration
            arr = arr.flatten();

            //  odd chunks now have to be added using 'non-rendering' rules
            //  get our result array ready to accept the chunks
            resarr = TP.ac();
            resarr[0] = '';

            len = 0;
            for (j = 0; j < arr.length; j++) {
                it = arr.at(j);
                if (TP.notEmpty(it)) {
                    if (it.first() === '<' && it.last() === '>') {
                        resarr[resarr.length - 1] += it;
                    } else {

                        size = it.replace(/&.+?;/g, ' ').getSize();

                        if (len + size <= width) {

                            len += size;
                            resarr[resarr.length - 1] += it;

                        } else {

                            len = size;
                            resarr.push(it);

                        }
                    }
                }
            }

            tmparr[i] = resarr.join(ch);
            // tmparr[i] = arr.join('');
        }

        return tmparr.join(ch);
    }
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('stripComments',
function(stripSingle, stripMulti) {

    /**
     * @method stripComments
     * @summary Returns a copy of the string with all comments stripped.
     * @param {Boolean} stripSingle Should we strip single-line comments?
     *     Default is true.
     * @param {Boolean} stripMulti Should we strip multi-line comments? Default
     *     is true.
     * @returns {String}
     */

    var src,
        len,
        last,
        arr,
        inApos,
        inQuote,
        inSingle,
        inMulti,
        offset,
        ch,
        j,
        i,
        strCnt;

    src = this.toString();
    len = src.length;
    offset = 1;

    arr = TP.ac();

    last = '';
    inApos = false;
    inQuote = false;
    inSingle = false;
    inMulti = false;

    for (i = 0; i < len; i += offset) {
        ch = src.charAt(i);
        offset = 1;

        //  first question, are we currently in a comment?
        if (inSingle) {
            if (ch === '\n') {
                //  end char for the comment,
                inSingle = false;

                //  if the comment was the only thing on the line this will
                //  end up creating an empty line, but we'll put up with
                //  that for now.
                arr.push(ch);
            }

            last = ch;
            if (stripSingle === false) {
                arr.push(ch);
            }
            continue;
        } else if (inMulti) {
            //  end will be '*' + '/'
            if (last === '*' && ch === '/') {
                inMulti = false;
            }

            last = ch;
            if (stripMulti === false) {
                arr.push(ch);
            }
            continue;
        }

        //  we're not in comment so process the character for quotes etc.
        switch (ch) {
            //  might be starting/ending a string
            case '\'':

                if (inApos) {
                    if (last !== '\\') {
                        //  ending our apos string
                        inApos = false;
                    } else {
                        //  have to figure out how many leading \'s
                        //  we have. if it's an odd number we're escaped
                        j = i - 1;
                        strCnt = 0;
                        while (src.charAt(j) === '\\') {
                            strCnt++;
                            j--;
                        }

                        //  even? we're _NOT_ escaped
                        if (strCnt % 2 === 0) {
                            inApos = false;
                        }
                    }
                } else if (!inQuote && last !== '\\') {
                    //  starting an apos string
                    inApos = true;
                }

                arr.push(ch);
                break;

            //  might be starting/ending a string
            case '"':

                if (inQuote) {
                    if (last !== '\\') {
                        //  ending our string
                        inQuote = false;
                    } else {
                        //  have to figure out how many leading \'s
                        //  we have. if it's an odd number we're escaped
                        j = i - 1;
                        strCnt = 0;
                        while (src.charAt(j) === '\\') {
                            strCnt++;
                            j--;
                        }

                        //  even? we're _NOT_ escaped
                        if (strCnt % 2 === 0) {
                            inQuote = false;
                        }
                    }
                } else if (!inApos && last !== '\\') {
                    //  starting a quote string
                    inQuote = true;
                }

                arr.push(ch);
                break;

            case '/':

                //  special cases here... '/' + '/',
                //      and '/' + '*' or '*' + '/'
                //  but the last case '*' + '/' will
                //  be caught by inMulti test above

                //  if in quotes just output it
                if (inApos || inQuote) {
                    arr.push(ch);
                    break;
                }

                //  not quoted, might be single-line comment
                if (last === '/') {
                    inSingle = true;
                    last = ch;
                    break;
                }

                //  not quoted, could be lead-in to a comment
                if (src.charAt(i + 1) === '*' ||
                    src.charAt(i + 1) === '/') {
                    //  the regex /\//g inspired this check
                    if (src.charAt(i - 1) === '\\') {
                        //  we're escaped, not a comment lead-in
                        last = null;
                    } else if (stripMulti !== false &&
                                src.charAt(i + 1) === '*') {
                        //  multi-line comment lead in...capture it and
                        //  don't push to result
                        last = ch;
                        break;
                    } else if (stripSingle !== false &&
                                src.charAt(i + 1) === '/') {
                        //  single-line comment lead in...capture it and
                        //  don't push to result
                        last = ch;
                        break;
                    }
                }

                //  just a slash
                arr.push(ch);
                break;

            case '*':

                //  two special cases here... '/' + '*' and '*' + '/'
                //  but latter one is caught by inMulti test above

                //  if in quotes just output it
                if (inApos || inQuote) {
                    last = ch;
                    arr.push(ch);
                    break;
                }

                //  start of a multi-line comment
                if (last === '/') {
                    inMulti = true;
                    last = ch;
                    break;
                }

                //  just a '*'
                arr.push(ch);
                break;

            default:

                arr.push(ch);
                break;
        }

        //  keep track of what we processed last
        last = ch;
    }

    return arr.join('');
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('stripEnclosingQuotes',
function() {

    /**
     * @method stripEnclosingQuotes
     * @summary Strips enclosing quotes that are at the beginning and end of
     *     the receiver (they must be balanced quotes of the same type).
     * @returns {String} A new string with the contents of the receiver stripped
     *     of leading and trailing quotes.
     */

    return this.replace(TP.regex.QUOTED_CONTENT, '$2');
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('stripExternalBodyContent',
function() {

    /**
     * @method stripExternalBodyContent
     * @summary Returns a copy of the string with all 'external body content'
     *     (that is, img content) removed. This is part of 'sanitizing' inbound
     *     (X)HTML data.
     * @returns {String} A new string with the receiver's content but no
     *     embedded img tags.
     */

    var str;

    str = this.toString();

    TP.regex.HTML_IMG_ELEM.lastIndex = 0;
    str = str.strip(TP.regex.HTML_IMG_ELEM);

    return str;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('stripExternalHeadContent',
function() {

    /**
     * @method stripExternalHeadContent
     * @summary Returns a copy of the string with all 'external head content'
     *     (that is, script, link to stylesheets and style content) removed.
     *     This is part of 'sanitizing' inbound (X)HTML data.
     * @returns {String} A new string with the receiver's content but no
     *     embedded script, link or style tags.
     */

    var str;

    str = this.toString();

    TP.regex.HTML_SCRIPT_ELEM.lastIndex = 0;
    str = str.strip(TP.regex.HTML_SCRIPT_ELEM);

    TP.regex.HTML_CSS_LINK_ELEM.lastIndex = 0;
    str = str.strip(TP.regex.HTML_CSS_LINK_ELEM);

    TP.regex.HTML_CSS_STYLE_ELEM.lastIndex = 0;
    str = str.strip(TP.regex.HTML_CSS_STYLE_ELEM);

    return str;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('stripTags',
function() {

    /**
     * @method stripTags
     * @summary Returns a copy of the string with all tags (<blah>) stripped.
     * @returns {String} A new string with the receiver's content but no
     *     embedded tags.
     */

    return this.strip(/<\/?[^>]+>/gi);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('stripWhitespace',
function() {

    /**
     * @method stripWhitespace
     * @summary Returns a copy of the string with all whitespace stripped.
     * @returns {String} A new string with the receiver's content but no
     *     whitespace.
     */

    //  interesting thing...our RegExp patch broke this call in IE so we
    //  had to patch our patch.
    return this.strip(/\s/g);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('substitute',
function(aDataSource, aKeySource, aScope) {

    /**
     * @method substitute
     * @summary Formats aDataSource according to the template in the receiver.
     * @description Strings support a substitution operation via substitutions
     *     registered on the type. This method is the 'top-level' method
     *     supporting this operation. The built-in substitution operations
     *     supplied with this type support a "formatting" operation via
     *     substitute that allows strings of the form:
     *
     *     "aSymbol{substitutedContent}"
     *
     *     to act as format strings. The symbol defines which string
     *     substitution code should be used (see registerSubstitution()). The
     *     substitute method takes a TP.core.Hash for aDataSource and aKeySource
     *     unless the data source is atomic.
     * @param {TP.core.Hash} aDataSource An object or hash to be used for data.
     * @param {TP.core.Hash} aKeySource An object or hash to be used for
     *     resolving % {} entity keys. The values in the key hash can be simple
     *     objects which return a value or functions which operate on the
     *     corresponding data source value and return an appropriate value.
     * @param {Object} aScope The object to be used for the context of
     *     evaluating embedded JS expressions.
     * @returns {String} A formatted string.
     */

    var str,
        theDataSource,
        theKeySource,
        results;

    //  exit hatch -- no more substitution entities
    if (TP.notValid(String.$subsRe) || !String.$subsRe.test(this)) {
        return this.toString();
    }

    theDataSource = TP.ifInvalid(aDataSource, '');
    theKeySource = aKeySource;
    if (TP.notValid(theKeySource)) {
        theKeySource = TP.hc();
    }

    str = this.toString();

    //  If there are patterns matching the existence patterns for any other
    //  registered substitutions in the system, process them.
    if (TP.isRegExp(String.$subsRe)) {
        while (TP.isArray(results = str.match(String.$subsRe))) {
            str = str.substituteFor(
                        results[1],
                        theDataSource,
                        theKeySource,
                        aScope);
        }
    }

    //  recurse until exit hatch triggers (values which were substituted in
    //  the result string might themselves have expressions which need to
    //  be processed)
    return str.substitute(aDataSource, aKeySource, aScope);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('substituteFor',
function(aSymbol, aDataSource, aKeySource, aScope) {

    /**
     * @method substituteFor
     * @summary Substitutes for a single string substitution symbol.
     * @description This method handles processing for a single string
     *     substitution symbol. The substitute call passes control to this
     *     method to process each of the symbols found in the registration hash.
     * @param {String} aSymbol The symbol used to locate a substitution
     *     registration.
     * @param {TP.api.Collection} aDataSource The data source(s) being
     *     formatted.
     * @param {TP.core.Hash} aKeySource The hash for keyed formatters.
     * @param {Object} aScope The object to be used for the context of
     *     evaluating embedded JS expressions.
     * @returns {String} A formatted string.
     */

    var str,

        data,
        keys,

        thePattern,
        arr,
        counter,

        matchResult,

        sourceIndex;

    //  Attempt to retrieve a registered substitution for the symbol
    //  supplied.
    str = this.getType().getSubstitution(aSymbol);
    if (TP.notValid(str)) {
        return this;
    }

    data = TP.ifInvalid(aDataSource, '');
    keys = aKeySource;
    if (TP.notValid(keys)) {
        keys = TP.hc();
    }

    /* eslint-disable consistent-this */
    thePattern = this;
    /* eslint-enable consistent-this */

    arr = TP.ac();
    counter = 0;

    //  While the execution of the substitution's 'matcher' still finds
    //  expressions that it can process
    while (TP.isArray(matchResult = str.at('matcher').exec(thePattern))) {
        arr.push(RegExp.leftContext);

        //  Must capture this before we call any handlers in case they use
        //  RegExps too.
        thePattern = RegExp.rightContext;

        //  If aDataSource is an Array, then use the value at 'sourceIndex'
        //  in the Array as the data to the substitution's 'handler'
        //  function. Note how the sourceIndex's computation causes the
        //  index to 'wrap around' if there are more pattern expressions
        //  than there are data source values.
        if (TP.isArray(data)) {

            /* eslint-disable no-extra-parens */
            sourceIndex = counter - ((counter / data.getSize()).
                                                            integer() *
                                    data.getSize());
            /* eslint-enable no-extra-parens */

            //  Call the substitution's handler with the pattern expression
            //  found and the data at the sourceIndex in aDataSource.
            arr.push(str.at('handler')(matchResult.first(),
                                        data.at(sourceIndex),
                                        keys,
                                        aScope));
            counter++;
        } else {
            //  Call the substitution's handler with the pattern expression
            //  found and the data in aDataSource.
            arr.push(str.at('handler')(matchResult.first(),
                                        data,
                                        keys,
                                        aScope));
        }
    }

    //  Concat anything left in thePattern that did not match the
    //  substitution's 'matcher' onto the result String.
    arr.push(thePattern);

    return arr.join('');
});

//  ------------------------------------------------------------------------

//  Register a substitution for simple character substitution patterns.
//  Simple substitution patterns perform a character by character
//  substitution operation.

//  '@{@@@-@@@@}'.substitute('5551212');

String.registerSubstitution(
        '@{', '@\\{', '@', TP.rc('@\\{(.+?)\\}'),
function(anItem, aDataSource, aKeySource) {

    var theItem;

    //  Slice out the actual pattern from the enclosing '@{' and '}'
    theItem = anItem.slice(2, anItem.getSize() - 1);

    //  this is the transformation function for simple alpha substitution
    return theItem.overlayCharacters(aDataSource, '@');
});

//  ------------------------------------------------------------------------

//  Register a substitution for keyed patterns. Keyed patterns allow a value
//  or function to be associated with a particular key in the pattern:

//  No data source; object value for key
//  '%{aKey}'.substitute(null, TP.hc('aKey', '32'));

//  No data source; function value for key
//  '%{aKey}'.substitute(null, TP.hc('aKey', function () {return 'hi there'}));

//  Data source; function value for key (data value is passed into function)
//  '%{aKey}'.substitute('Bill',
//      TP.hc('aKey', function (item) {return 'Hi. My name is: ' + item}));

String.registerSubstitution(
        '%{', '%\\{', '%', TP.rc('%\\{(.+?)\\}'),
function(anItem, aDataSource, aKeySource) {

    var theItem,
        theHandler;

    //  Slice out the actual key from the enclosing '%{' and '}'
    theItem = anItem.slice(2, anItem.getSize() - 1);

    theHandler = TP.val(aKeySource, theItem);
    if (TP.notValid(theHandler)) {
        //  might be a bogus format where no key source or no key
        TP.ifWarn() ?
            TP.warn('Format handler not found for: ' + anItem) : 0;

        return aDataSource;
    }

    //  notice the call to getValue() here to allow either functions or
    //  other types to be a part of the map
    return theHandler.getValue(aDataSource);
});

//  ------------------------------------------------------------------------

/*
    Register a substitution for numeric patterns. Numeric patterns have
    special characters that they use to format numbers in certain ways. Note
    that the decimal point in the pattern plays a crucial role in how these
    special characters behave. Note also that the actual character used for
    for the decimal point in the result from a substitution is determined by
    the Number type, which uses locale information if it is loaded.

    The '#' character:

        If the pattern has exactly the same number of '#' characters as the
        source number has digits, the number is formatted appropriately:
            '#{###.##}'.substitute(123.45)      --      123.45

        If the pattern has fewer '#' characters to the right of the decimal
        point than the source number has digits, the source number is
        rounded to fit the pattern:
            '#{###.##}'.substitute(123.456)     --      123.46

        If the pattern has fewer '#' characters to the left of the decimal
        point than the source number has digits, the extra digits from the
        source number are placed anyway:
            '#{###.##}'.substitute(9123.45)     --      9123.45

        If the pattern has '#' characters to the right of the decimal and
        the source number has no digits to the right of the decimal, the
        decimal point is still displayed:
            '#{###.##}'.substitute(123)         --      123.

        If the pattern has '#' characters to the right of the decimal and
        the source number has a decimal point or a decimal point followed
        by a zero, only the decimal point is still displayed:
            '#{###.##}'.substitute(123.)        --      123.
            '#{###.##}'.substitute(123.0)       --      123.

        If the pattern has '#' characters to the left of the decimal and
        the source number has no digits to the left of the decimal other
        than '0', no digits are displayed to the right of decimal:
            '#{###.##}'.substitute(.45)         --      .45
            '#{###.##}'.substitute(0.45)        --      .45

        If the pattern has no '#' characters to the right of the decimal
        and the source number has digits to the right of the decimal and
        the first digit is 5 or greater, the number to the left of the
        decimal will be rounded up by 1:
            '#{###}'.substitute(123.55)         --      124

    The '0' character:

        This character follows the same rules as the '#' character in some
        cases:
            '#{000.00}'.substitute(123.45)      --      123.45
            '#{000.00}'.substitute(123.456)     --      123.46
            '#{000.00}'.substitute(9123.45)     --      9123.45

        except that if the source number has fewer digits than the pattern
        (either to the right or the left of the decimal place), then a '0'
        is placed in that spot:
            '#{000.00}'.substitute(123)         --      123.00
            '#{000.00}'.substitute(123.4)       --      123.40
            '#{000.00}'.substitute(.45)         --      000.45
            '#{000.00}'.substitute(0.45)        --      000.45
            '#{000.00}'.substitute(12.34)       --      012.34

    The '?' character:

        This character follows the same rules as the '0' character, except
        that a space will be placed instead of a '0' when the source number
        has fewer digits than the pattern (either to the right or the left
        of the decimal place) (here, a space is denoted by an underscore
        '_'):
            '#{???.??}'.substitute(123)         --      123.__
            '#{???.??}'.substitute(123.4)       --      123.4_
            '#{???.??}'.substitute(.45)         --      ___.45
            '#{???.??}'.substitute(0.45)        --      ___.45
            '#{???.??}'.substitute(12.34)       --      _12.34

        Note that using this character in patterns can sometimes produce a
        result that cannot be converted back into a number:
            '#{???.?0}'.substitute(123)         --      123._0

    The ',' character:

        This character is unique in that it acts as a 'toggle' to switch on
        thousands grouping'. Therefore, the mere presence of this character
        anywhere in the format 'switches on' thousands grouping. Note that
        the actual character used for the thousands separator and the
        grouping sizes are determined by the Number type, which uses locale
        information if it is loaded:
            '#{#,###.##}'.substitute(9123.45)   --      9,123.45
            '#{###,#.##}'.substitute(9123.45)   --      9,123.45

    Here is one last example that shows a commonly used format and that is
    for U.S. currency:
            '$#{#,###.00}'.substitute(89123.4)  --      $89,123.40
*/

//  ------------------------------------------------------------------------

String.registerSubstitution(
        '#{', '#\\{', '#', TP.rc('#\\{(.+?)\\}'),
function(anItem, aDataSource, aKeySource) {

    var theItem;

    //  Slice out the actual pattern from the enclosing '#{' and '}'
    theItem = anItem.slice(2, anItem.getSize() - 1);

    return theItem.overlayFloat(aDataSource);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('tabsToSpaces',
function(spaceCount) {

    /**
     * @method tabsToSpaces
     * @summary Returns a new string with any tab characters of the receiver
     *     converted to 'spaceCount' number of spaces. The default count is 4
     *     spaces per tab.
     * @param {Number} spaceCount A number of spaces per tab. Defaults to 4.
     * @returns {String} A string having the contents of the receiver with
     *     leading and trailing whitespace removed.
     */

    var repStr,
        count;

    count = TP.ifInvalid(spaceCount, 4);

    repStr = ' '.times(count);

    return this.replace(/\t/g, repStr);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('tokenizeWhitespace',
function() {

    /**
     * @method tokenizeWhitespace
     * @summary Returns the receiver with whitespace trimmed from each end, all
     *     non-space whitespace converted to spaces, and all sets of multiple
     *     spaces collapsed to a single space. This matches the requirements of
     *     XML Schema for types other than xs:string and xs:normalizedString.
     * @returns {String} A new string representing the receiver in converted
     *     form.
     */

    return this.replaceWhitespace().collapseWhitespace();
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('trimLeft',
function(aChar) {

    /**
     * @method trimLeft
     * @summary Returns a new string with the contents of the receiver after
     *     having stripped of any characters up to and including the character
     *     provided.
     * @param {String} aChar The char to trim to.
     * @returns {String} A string.
     */

    var startx;

    startx = 0;
    if (this.indexOf(aChar) !== TP.NOT_FOUND) {
        startx = this.indexOf(aChar) + 1;
    }

    return this.slice(startx);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('trimRight',
function(aChar) {

    /**
     * @method trimRight
     * @summary Returns a new string with the contents of the receiver after
     *     having stripped of any characters trailing the last occurrence of
     *     aChar.
     * @param {String} aChar The character to trim behind.
     * @returns {String} A string.
     */

    var endx;

    endx = this.getSize();
    if (this.lastIndexOf(aChar) !== TP.NOT_FOUND) {
        endx = this.lastIndexOf(aChar);
    }

    return this.slice(0, endx);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('truncate',
function(aSize, aTail) {

    /**
     * @method truncate
     * @summary Returns a new string shortened to the size specified and ending
     *     in the tail provided. If the string didn't have to be shortened it is
     *     returned directly without the tail.
     * @param {Number} aSize The size of the returned String including the
     *     length of the tail. Defaults to TP.DEFAULT_STRLEN.
     * @param {String} aTail A trailing set of characters to use to "finish" the
     *     string. Default is '...' (ellipsis).
     * @exception TP.sig.InvalidParameter
     * @returns {String} The receiver shortened to aSize with a possible
     *     ellipsis.
     */

    var tail;

    tail = TP.ifInvalid(aTail, '...');

    if (this.getSize() <= aSize) {
        //  Make sure to force the conversion to a primitive string.
        return this.toString();
    }

    return this.substr(0, aSize - tail.getSize()) + tail;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('unicodeEscaped',
function() {

    /**
     * @method unicodeEscaped
     * @summary Returns a new string with the contents of the receiver
     *     converted to escaped unicode.
     * @returns {String} A string having the contents of the receiver converted
     *     to escaped unicode.
     */

    var i,
        len,
        arr;

    arr = TP.ac();

    len = this.getSize();
    for (i = 0; i < len; i++) {
        arr.push(
            '\\u',
            this.charCodeAt(i).asHex().split('x').last().pad(4, '0'));
    }

    return arr.join('');
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('unquoted',
function(aQuoteChar) {

    /**
     * @method unquoted
     * @summary Returns the receiver with any enclosing quotes removed. Note
     *     that embedded quotes are unescaped by this process. This operation
     *     works on both single and double-quoted strings.
     * @param {String} aQuoteChar A quoting character to use. If not provided
     *     then any enclosing quotes are removed regardless of symbol.
     * @returns {String} The string as an unquoted string.
     */

    var len,
        str,
        re;

    if (TP.notEmpty(aQuoteChar)) {
        len = aQuoteChar.length;
        if (this.first(len) === aQuoteChar &&
            this.last(len) === aQuoteChar) {
            str = this.slice(len, this.getSize() - len);
            re = TP.rc('\\' + aQuoteChar, 'g');

            return str.replace(re, aQuoteChar);
        }

        return this.toString();
    }

    if (this.first() === '"' && this.last() === '"') {
        str = this.slice(1, this.getSize() - 1);

        return str.replace(/\\"/g, '"');
    }

    if (this.first() === '\'' && this.last() === '\'') {
        str = this.slice(1, this.getSize() - 1);

        return str.replace(/\\'/g, '\'');
    }

    //  Make sure to force the conversion to a primitive string.
    return this.toString();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
