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
 * @summary Types supporting various date, time, timezone, and calendar
 *     functionality.
 */

//  ========================================================================
//  TP.iso.ISO8601
//  ========================================================================

/**
 * @type {TP.iso.ISO8601}
 * @summary A type which can produce a representation of a Date in a valid ISO
 *     8601 format or parse a string in a valid 8601 format into a native
 *     JavaScript Date object.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('iso.ISO8601');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.iso.ISO8601.Type.defineConstant('ISO_DATE_REGEX',
        /^(\d{4})-?(\d{2})?-?(\d{2})?(T(\d{2})(:(\d{2})(:(\d{2})(\.(\d{1,3}))?)?)?)?(Z)?([\+\-]\d{2}:\d{2})?$/);

TP.iso.ISO8601.Type.defineConstant('ISO_TZ_REGEX', /([\+\-])(\d{2}):(\d{2})/);

//  ---
//  Formatting
//  ---

TP.iso.ISO8601.Type.defineConstant('FORMATS', TP.hc());

//  ---
//  Date component formats
//  ---

TP.iso.ISO8601.FORMATS.atPut('YYYY', '%{yyyy}');

//  year/month/day
TP.iso.ISO8601.FORMATS.atPut('YYYYMM', '%{yyyy}%{mm}');
TP.iso.ISO8601.FORMATS.atPut('YYYYMMDD', '%{yyyy}%{mm}%{dd}');

TP.iso.ISO8601.FORMATS.atPut('YYYY-MM', '%{yyyy}-%{mm}');
TP.iso.ISO8601.FORMATS.atPut('YYYY-MM-DD', '%{yyyy}-%{mm}-%{dd}');

//  year/week/day
TP.iso.ISO8601.FORMATS.atPut('YYYYWWW', '%{yyyy}W%{ww}');
TP.iso.ISO8601.FORMATS.atPut('YYYYWWWD', '%{yyyy}W%{ww}%{dw}');

TP.iso.ISO8601.FORMATS.atPut('YYYY-WWW', '%{yyyy}-W%{ww}');
TP.iso.ISO8601.FORMATS.atPut('YYYY-WWWD', '%{yyyy}-W%{ww}%{dw}');
TP.iso.ISO8601.FORMATS.atPut('YYYY-WWW-D', '%{yyyy}-W%{ww}-%{dw}');

//  year/day-of-year
TP.iso.ISO8601.FORMATS.atPut('YYYYDDD', '%{yyyy}%{dy}');
TP.iso.ISO8601.FORMATS.atPut('YYYY-DDD', '%{yyyy}-%{dy}');

//  ---
//  Time component formats
//  ---

//  the formats here will optionally have a trailing Z for zulu time, or a
//  plus (+) to symbolize using an offset time
TP.iso.ISO8601.FORMATS.atPut('HH', '%{hhi}');
TP.iso.ISO8601.FORMATS.atPut('HHZ', '%{hhi}Z');
TP.iso.ISO8601.FORMATS.atPut('HH+', '%{hhi}+');

TP.iso.ISO8601.FORMATS.atPut('HHMM', '%{hhi}%{mmn}');
TP.iso.ISO8601.FORMATS.atPut('HHMMZ', '%{hhi}%{mmn}Z');
TP.iso.ISO8601.FORMATS.atPut('HHMM+', '%{hhi}%{mmn}+');

TP.iso.ISO8601.FORMATS.atPut('HHMMSS', '%{hhi}%{mmn}%{ss}');
TP.iso.ISO8601.FORMATS.atPut('HHMMSSZ', '%{hhi}%{mmn}%{ss}Z');
TP.iso.ISO8601.FORMATS.atPut('HHMMSS+', '%{hhi}%{mmn}%{ss}+');

TP.iso.ISO8601.FORMATS.atPut('HH:MM', '%{hhi}:%{mmn}');
TP.iso.ISO8601.FORMATS.atPut('HH:MMZ', '%{hhi}:%{mmn}Z');
TP.iso.ISO8601.FORMATS.atPut('HH:MM+', '%{hhi}:%{mmn}+');

TP.iso.ISO8601.FORMATS.atPut('HH:MM:SS', '%{hhi}:%{mmn}:%{ss}');
TP.iso.ISO8601.FORMATS.atPut('HH:MM:SSZ', '%{hhi}:%{mmn}:%{ss}Z');
TP.iso.ISO8601.FORMATS.atPut('HH:MM:SS+', '%{hhi}:%{mmn}:%{ss}+');

//  ---
//  Date/Time combination formats
//  ---

//  year/month/day plus time, expanded -- this one's the default ISO
TP.iso.ISO8601.FORMATS.atPut('YYYY-MM-DDTHH:MM:SS',
                            '%{yyyy}-%{mm}-%{dd}T%{hhi}:%{mmn}:%{ss}');
TP.iso.ISO8601.FORMATS.atPut('YYYY-MM-DDTHH:MM:SSZ',
                            '%{yyyy}-%{mm}-%{dd}T%{hhi}:%{mmn}:%{ss}Z');
TP.iso.ISO8601.FORMATS.atPut('YYYY-MM-DDTHH:MM:SS+',
                            '%{yyyy}-%{mm}-%{dd}T%{hhi}:%{mmn}:%{ss}+');

//  year/month/day plus time, date condensed -- this one's used by XML-RPC
TP.iso.ISO8601.FORMATS.atPut('YYYYMMDDTHH:MM:SS',
                            '%{yyyy}%{mm}%{dd}T%{hhi}:%{mmn}:%{ss}');
TP.iso.ISO8601.FORMATS.atPut('YYYYMMDDTHH:MM:SSZ',
                            '%{yyyy}%{mm}%{dd}T%{hhi}:%{mmn}:%{ss}Z');
TP.iso.ISO8601.FORMATS.atPut('YYYYMMDDTHH:MM:SS+',
                            '%{yyyy}%{mm}%{dd}T%{hhi}:%{mmn}:%{ss}+');

//  year/month/day plus time, condensed
TP.iso.ISO8601.FORMATS.atPut('YYYYMMDDTHHMMSS',
                            '%{yyyy}%{mm}%{dd}T%{hhi}%{mmn}%{ss}');
TP.iso.ISO8601.FORMATS.atPut('YYYYMMDDTHHMMSSZ',
                            '%{yyyy}%{mm}%{dd}T%{hhi}%{mmn}%{ss}Z');
TP.iso.ISO8601.FORMATS.atPut('YYYYMMDDTHHMMSS+',
                            '%{yyyy}%{mm}%{dd}T%{hhi}%{mmn}%{ss}+');

//  year/week/day plus time, expanded
TP.iso.ISO8601.FORMATS.atPut('YYYY-WWW-DTHH:MM:SS',
                            '%{yyyy}-W%{ww}-%{dw}T%{hhi}:%{mmn}:%{ss}');
TP.iso.ISO8601.FORMATS.atPut('YYYY-WWW-DTHH:MM:SSZ',
                            '%{yyyy}-W%{ww}-%{dw}T%{hhi}:%{mmn}:%{ss}Z');
TP.iso.ISO8601.FORMATS.atPut('YYYY-WWW-DTHH:MM:SS+',
                            '%{yyyy}-W%{ww}-%{dw}T%{hhi}:%{mmn}:%{ss}+');

//  year/week/day plus time, condensed
TP.iso.ISO8601.FORMATS.atPut('YYYYWWWDTHHMMSS',
                            '%{yyyy}W%{ww}%{dw}T%{hhi}%{mmn}%{ss}');
TP.iso.ISO8601.FORMATS.atPut('YYYYWWWDTHHMMSSZ',
                            '%{yyyy}W%{ww}%{dw}T%{hhi}%{mmn}%{ss}Z');
TP.iso.ISO8601.FORMATS.atPut('YYYYWWWDTHHMMSS+',
                            '%{yyyy}W%{ww}%{dw}T%{hhi}%{mmn}%{ss}+');

//  year/day-of-year plus time, expanded
TP.iso.ISO8601.FORMATS.atPut('YYYY-DDDTHH:MM:SS',
                            '%{yyyy}-%{dy}T%{hhi}:%{mmn}:%{ss}');
TP.iso.ISO8601.FORMATS.atPut('YYYY-DDDTHH:MM:SSZ',
                            '%{yyyy}-%{dy}T%{hhi}:%{mmn}:%{ss}Z');
TP.iso.ISO8601.FORMATS.atPut('YYYY-DDDTHH:MM:SS+',
                            '%{yyyy}-%{dy}T%{hhi}:%{mmn}:%{ss}+');

//  year/day-of-year plus time, condensed
TP.iso.ISO8601.FORMATS.atPut('YYYYDDDTHHMMSS',
                            '%{yyyy}%{dy}T%{hhi}%{mmn}%{ss}');
TP.iso.ISO8601.FORMATS.atPut('YYYYDDDTHHMMSSZ',
                            '%{yyyy}%{dy}T%{hhi}%{mmn}%{ss}Z');
TP.iso.ISO8601.FORMATS.atPut('YYYYDDDTHHMMSS+',
                            '%{yyyy}%{dy}T%{hhi}%{mmn}%{ss}+');

//  named formats
TP.iso.ISO8601.FORMATS.atPut('XMLRPC',
                            '%{yyyy}%{mm}%{dd}T%{hhi}:%{mmn}:%{ss}');
TP.iso.ISO8601.FORMATS.atPut('TIMESTAMP',
                            '%{yyyy}%{mm}%{dd}T%{hhi}%{mmn}%{ss}.%{fff}');

Date.addParser(TP.iso.ISO8601);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.iso.ISO8601.Type.defineMethod('fromDate',
function(aDate, aFormat) {

    /**
     * @method fromDate
     * @summary Returns an instance of String that encodes aDate in the format
     *     according to the format string provided.
     * @description This method is used as the standard output method for most
     *     date strings. It attempts to produce a valid ISO 8601 string from the
     *     date provided according to the instructions found in the format
     *     string.
     *
     *     While the Date type in TIBET has been extended to support a wide
     *     variety of formatting strings you can only use one of the specific
     *     named formats in this call to ensure a valid 8601 string is produced.
     *
     *     There are three major variations for the date portion of an ISO 8601
     *     string:
     *
     *     YYYY[-]MM[-]DD Year, Month, Day, where each element other than year
     *     is optional.
     *
     *     YYYY[-]W[WW]-[D] Year, WeekOfYear, DayOfWeek (Note that the 'W' is
     *     an explicit 'W' here and the Day is the number of the day of the week
     *     where Monday is day 1 and Sunday is day 7 (unlike JS). Week numbers
     *     are from 01 to 53.
     *
     *     YYYY[-][D] Year, DayOfYear where DayOfYear is from 1 to 366
     *     (supports leap years).
     *
     *     These variations can optionally be combined with a time portion by
     *     adding an uppercase T between the parts as in:
     *
     *     2006-05-08T12:01:23
     *
     *     The time portion of an ISO 8601 string follows the form:
     *
     *     HH[:]MM[:]SS[.mmm][Z|[+|-]th:tm]
     *
     *     If no time zone data is provided the time is considered to be in the
     *     currently active time zone. A trailing Z indicates "zulu" or UTC
     *     time, all other values define an offset from UFC either + or - in
     *     HH:MM terms.
     * @param {Date} aDate The Date to format.
     * @param {String} aFormat The format string to use.
     * @returns {String} The formatted Date value.
     */

    if (!TP.isDate(aDate)) {
        return this.raise('TP.sig.InvalidParameter', aDate);
    }

    if (TP.isEmpty(aFormat)) {
        //  default is ISO with UTC zone
        return 'YYYY-MM-DDTHH:MM:SSZ'.transformDate(aDate);
    }

    return aFormat.transformDate(aDate);
});

//  ------------------------------------------------------------------------

TP.iso.ISO8601.Type.defineMethod('fromString',
function(aString, sourceLocale) {

    /**
     * @method fromString
     * @summary Attempts to parse the string provided into a Date, then convert
     *     that Date into a valid TP.iso.ISO8601 formatted string. If successful
     *     the ISO string is returned.
     * @param {String} aString The potential date string.
     * @param {TP.i18n.Locale|String} sourceLocale A source xml:lang or locale
     *     defining the language the string is now in.
     * @returns {String} An TP.iso.ISO8601 string.
     */

    var dateStr;

    //  use Date's fromString routine since it's the most flexible parser
    dateStr = Date.fromString(aString, sourceLocale);

    //  if we got a valid date then format it as TP.iso.ISO8601
    if (TP.isDate(dateStr)) {
        return this.fromDate(dateStr);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.iso.ISO8601.Type.defineMethod('parse',
function(aString) {

    /**
     * @method parse
     * @summary Return the Date defined by the string provided.
     * @description This routine is invoked by the Date type when running its
     *     list of registered Date parsers in an attempt to parse an input
     *     string.
     *
     *     ISO 8601 is the default date format for TIBET both in terms of
     *     output and input. This type is automatically registered with the Date
     *     type as a date parser to ensure we can at least process standard JS
     *     date and ISO 8601 date formats.
     *
     *     There are three major variations for the date portion of an ISO 8601
     *     string:
     *
     *     YYYY[-]MM[-]DD Year, Month, Day
     *
     *     YYYY[-]W[KK]-[D] Year, WeekOfYear, DayOfWeek (Note that the 'W' is
     *     an explicit 'W' here and the Day is the number of the day of the week
     *     where Monday is day 1 and Sunday is day 7 (unlike JS). Week numbers
     *     are from 01 to 53.
     *
     *     YYYY[-][D] Year, DayOfYear where DayOfYear is from 1 to 366 (in leap
     *     years).
     *
     *     These variations can optionally be combined with a time portion by
     *     adding an uppercase T between the parts as in:
     *
     *     2006-05-08T12:01:23
     *
     *     The time portion of an ISO 8601 string follows the form:
     *
     *     HH[:]MM[:]SS[.mmm][Z|[+|-]th:tm]
     *
     *     If no time zone data is provided the time is considered to be in the
     *     currently active time zone. A trailing Z indicates "zulu" or UTC
     *     time, all other values define an offset from UFC either + or - in
     *     HH:MM terms.
     * @param {String} aString An TP.iso.ISO8601 string.
     * @exception TP.sig.InvalidParameter
     * @returns {Date|null} A new Date object representing the Date encoded in
     *     the parameter.
     */

    var parts,
        dateStr,
        timeStr,

        isUTC,
        arr,
        newDate,
        dow,
        duration,
        timeMatcher,
        zoneMatcher;

    if (!TP.isString(aString)) {
        return null;
    }

    //  someone who's better with regular expressions can probably do this
    //  a lot faster, but we'll take it in smaller steps...

    //  split on T so we can deal with date and time separately
    parts = aString.split('T');
    dateStr = parts.at(0);
    timeStr = parts.at(1);

    //  now the question is, what do we do when there's no 'T' since YYYY
    //  and HHMM look a lot alike to a regex :)

    //  if the time portion is empty (no T), but we see a :, Z, +, or - then
    //  we're really looking at a time specification, not a date
    if (TP.notValid(timeStr) && /[Z:\+\-]/.test(dateStr)) {
        timeStr = dateStr;
        dateStr = null;
    }

    //  when there's a time component and we've got either a Z or offset
    //  then all our other operations have to be UTC-based
    if (TP.isString(timeStr) && TP.regex.HAS_TIMEZONE.test(timeStr)) {
        isUTC = true;
    } else {
        isUTC = false;
    }

    //  process date component if any
    if (TP.isString(dateStr)) {
        //  remove optional dashes to make this easier
        dateStr = dateStr.strip(/\-/g);

        //  date portion could be y, y-m, y-m-d, y-w, y-w-d, or y-d
        if (/W/.test(dateStr)) {
            //  either y-w or y-w-d with optional -'s
            if (TP.isEmpty(arr =
                            dateStr.match(/^(\d{4})W(\d{2})(\d{1})?$/))) {
                return null;
            }

            //  must be a year and week if there was a match
            newDate = isUTC ?
                        Date.constructUTCDayOne(arr.at(1)) :
                        Date.constructDayOne(arr.at(1));

            newDate.setISOWeek(arr.at(2));

            //  the day is optional, and defines the day of the week
            //  intended...
            if (TP.isString(arr.at(3))) {
                if (arr.at(3) !== 1) {
                    dow = isUTC ?
                            newDate.getUTCDayOfWeek() :
                            newDate.getDayOfWeek();

                    duration = TP.join('P', arr.at(3) - dow, 'D');
                    newDate = newDate.addDuration(duration);
                }
            }
        } else if (dateStr.getSize() === 7) {
            //  no W but only 7 digits means year plus day-of-year
            if (TP.notValid(arr = dateStr.match(/^(\d{4})(\d{3})$/))) {
                return null;
            }

            //  must be a year and day if there was a match
            newDate = isUTC ?
                        Date.constructUTCDayOne(arr.at(1)) :
                        Date.constructDayOne(arr.at(1));

            duration = TP.join('P', arr.at(2) - 1, 'D');
            newDate = newDate.addDuration(duration);
        } else {
            //  4, 6, or 8 digits
            if (TP.notValid(arr =
                            dateStr.match(/^(\d{4})(\d{2})?(\d{2})?$/))) {
                return null;
            }

            if (isUTC) {
                newDate = Date.constructUTCDayOne(arr.at(1));
                TP.isString(arr.at(2)) ?
                        newDate.setUTCMonth(arr.at(2) - 1) : null;
                TP.isString(arr.at(3)) ?
                        newDate.setUTCDate(arr.at(3)) : null;
            } else {
                newDate = Date.constructDayOne(arr.at(1));
                TP.isString(arr.at(2)) ?
                        newDate.setMonth(arr.at(2) - 1) : null;
                TP.isString(arr.at(3)) ?
                        newDate.setDate(arr.at(3)) : null;
            }
        }
    }

    //  process time component if any
    if (TP.isString(timeStr)) {
        //  if this is a time-only entry then it's for today
        if (TP.notValid(newDate)) {
            newDate = isUTC ? Date.todayUTC() : Date.today();
        }

        //  first remove colons to make things easier
        timeStr = timeStr.strip(/:/g);

        //  no time zone in this portion, just hh:mn:ss.fff
        timeMatcher = /^(\d{2})(\d{2})?(\d{2})?(\.(\d*))?/;

        if (TP.notValid(arr = timeStr.match(timeMatcher))) {
            return null;
        }

        //  set hours, minutes, seconds, milliseconds as needed
        if (isUTC) {
            TP.isString(arr.at(1)) ?
                    newDate.setUTCHours(arr.at(1)) : null;
            TP.isString(arr.at(2)) ?
                    newDate.setUTCMinutes(arr.at(2)) : null;
            TP.isString(arr.at(3)) ?
                    newDate.setUTCSeconds(arr.at(3)) : null;
            TP.isString(arr.at(5)) ?
                    newDate.setUTCMilliseconds(arr.at(5)) : null;
        } else {
            TP.isString(arr.at(1)) ?
                    newDate.setHours(arr.at(1)) : null;
            TP.isString(arr.at(2)) ?
                    newDate.setMinutes(arr.at(2)) : null;
            TP.isString(arr.at(3)) ?
                    newDate.setSeconds(arr.at(3)) : null;
            TP.isString(arr.at(5)) ?
                    newDate.setMilliseconds(arr.at(5)) : null;
        }

        //  utc here means there's timezone data involved
        if (isUTC) {
            if (/Z/.test(timeStr)) {
                //  no offset, GMT...and we're already there so return
                return newDate;
            } else {
                //  offset time, hhmm
                zoneMatcher = /[\+\-](\d{2})(\d{2})$/;

                if (TP.notValid(arr = timeStr.match(zoneMatcher))) {
                    return null;
                }

                //  use +/- to determine what to do with the offset duration
                //  data since we can't actually set the timezone
                if (/\+/.test(timeStr)) {
                    newDate = newDate.addDuration(
                        TP.join('PT', arr.at(1), 'H', arr.at(2), 'M'));
                } else {
                    newDate = newDate.subtractDuration(
                        TP.join('PT', arr.at(1), 'H', arr.at(2), 'M'));
                }
            }
        }
    }

    return newDate;
});

//  ------------------------------------------------------------------------

TP.iso.ISO8601.Type.defineMethod('validate',
function(anObj) {

    /**
     * @method validate
     * @summary Tests the incoming value to see if it represents a valid
     *     instance of the receiver.
     * @param {Object} anObj The object to test.
     * @returns {Boolean} True if the object is 'valid'.
     */

    //  if we can turn it into a date using our parse logic it's valid
    return TP.isDate(this.parse(anObj));
});

//  ========================================================================
//  TP.core.TimeZone
//  ========================================================================

/**
 * @type {TP.core.TimeZone}
 * @summary A helper class for xs:time, xs:date, and similar XMLSchema types
 *     which require timezone formatting/validation assistance.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.TimeZone');

//  ------------------------------------------------------------------------

//  a regex capable of validating the lexical format and splitting the
//  various segments out into a match result for further testing
TP.core.TimeZone.Type.defineConstant('ZONE_REGEX',
                            /^([Z\+\-])([0-9]{2})*[:]*([0-9]{2})*$/);

//  indexes into the match result produced by the previous RegExp
TP.core.TimeZone.Type.defineConstant('ZONE_INDEX', 1);
TP.core.TimeZone.Type.defineConstant('ZONE_HOUR_INDEX', 2);
TP.core.TimeZone.Type.defineConstant('ZONE_MINUTE_INDEX', 3);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.TimeZone.Type.defineMethod('validate',
function(anObject) {

    /**
     * @method validate
     * @summary Returns true if the object provided it meets the criteria for a
     *     valid time string with optional time zone data.
     * @param {Object} anObject The object whose value should be verified.
     * @returns {Boolean} True if the object is 'valid'.
     */

    var str,
        zoneMatch,

        zoneIndex,
        zoneHour,
        zoneMinute;

    if (!TP.isString(anObject)) {
        return false;
    }

    //  allow validation of a time zone as "local timezone"
    if (TP.isEmpty(anObject)) {
        return true;
    }

    str = anObject;

    zoneMatch = str.match(this.get('ZONE_REGEX'));
    if (TP.notValid(zoneMatch)) {
        return false;
    }

    //  ---
    //  TIME ZONE
    //  ---

    zoneIndex = zoneMatch.at(this.get('ZONE_INDEX'));
    zoneHour = zoneMatch.at(this.get('ZONE_HOUR_INDEX'));
    zoneMinute = zoneMatch.at(this.get('ZONE_MINUTE_INDEX'));

    //  can't be Z if there's a ZH or ZM (has to be a +)
    if (zoneIndex === 'Z') {
        if (TP.isString(zoneHour) || TP.isString(zoneMinute)) {
            return false;
        }
    } else if (zoneIndex === '+' || zoneIndex === '-') {
        if (TP.notValid(zoneHour) || TP.notValid(zoneMinute)) {
            return false;
        }

        //  hours can't be more than 14
        if (parseInt(zoneHour, 10) > 14) {
            return false;
        }

        //  if zone hours are 14, zone minutes must be 0
        if (parseInt(zoneHour, 10) === 14 && parseInt(zoneMinute, 10) !== 0) {
            return false;
        }
    }

    //  made it through the gauntlet
    return true;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
