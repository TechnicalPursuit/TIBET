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
 * @type {TP.xs.gYearMonth}
 * @summary An XML Schema gYearMonth string in the form [-]YYYY-MM followed by
 *     an optional time zone specification.
 */

//  ------------------------------------------------------------------------

TP.xs.anySimpleType.defineSubtype('gYearMonth');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  a regex capable of validating the lexical format and splitting the
//  various segments out into a match result for further testing
TP.xs.gYearMonth.Type.defineConstant('YEARMONTH_REGEX',
    /^([-])*([0-9]{4,})-([0-9]{2})(([Z\+\-]*)([0-9]{2})*[:]*([0-9]{2})*)$/);

//  indexes into the match result produced by the previous RegExp
TP.xs.gYearMonth.Type.defineConstant('MINUS_INDEX', 1);
TP.xs.gYearMonth.Type.defineConstant('YEAR_INDEX', 2);
TP.xs.gYearMonth.Type.defineConstant('MONTH_INDEX', 3);
TP.xs.gYearMonth.Type.defineConstant('ZONE_INDEX', 4);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.gYearMonth.Type.defineMethod('validate',
function(anObject) {

    /**
     * @method validate
     * @summary Returns true if the object provided is a valid year/month
     *     specification in XML Schema format.
     * @param {String} anObject The object to validate.
     * @returns {Boolean}
     */

    var str,
        m,
        zi,
        year,
        month;

    if (!TP.isString(anObject)) {
        return false;
    }

    str = anObject;

    m = str.match(this.get('YEARMONTH_REGEX'));
    if (TP.notValid(m)) {
        return false;
    }

    year = m.at(this.get('YEAR_INDEX'));
    if ((year.getSize() > 4) && year.startsWith('0')) {
        //  year can't start with 0 if longer than 4 digits
        return false;
    }
    year = parseInt(year, 10);

    month = parseInt(m.at(this.get('MONTH_INDEX')), 10);

    //  month can't be 0, or greater than 12
    if (!month.isBetweenInclusive(1, 12)) {
        return false;
    }

    //  check on time zone separately
    if (TP.notEmpty(zi = m.at(this.get('ZONE_INDEX')))) {
        return TP.core.TimeZone.validate(zi);
    }

    //  made it through the gauntlet
    return true;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
