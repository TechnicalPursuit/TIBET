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
 * @type {TP.xs.date}
 * @synopsis A string representing a date and optional time zone data in the
 *     format [-]YYYY-MM-DD followed by Z for UTC time, or a +/- prefixed HH:MM
 *     timezone offset.
 * @todo
 */

//  ------------------------------------------------------------------------

TP.xs.anySimpleType.defineSubtype('date');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  a regex capable of validating the lexical format and splitting the
//  various segments out into a match result for further testing
TP.xs.date.Type.defineConstant(
        'DATE_REGEX',
        /^([-])*([0-9]{4,})-([0-9]{2})-([0-9]{2})(([Z\+\-]*)([0-9]{2})*[:]*([0-9]{2})*)$/);

//  indexes into the match result produced by the previous RegExp
TP.xs.date.Type.defineConstant('MINUS_INDEX', 1);
TP.xs.date.Type.defineConstant('YEAR_INDEX', 2);
TP.xs.date.Type.defineConstant('MONTH_INDEX', 3);
TP.xs.date.Type.defineConstant('DAY_INDEX', 4);
TP.xs.date.Type.defineConstant('ZONE_INDEX', 5);

//  ------------------------------------------------------------------------

TP.xs.date.Type.defineMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Returns true if the object provided it meets the criteria for a
     *     valid date string with optional time zone data.
     * @param {String} anObject The object to validate.
     * @returns {Boolean} 
     * @todo
     */

    var str,
        m,

        year,
        month,
        day,
        zi;

    if (!TP.isString(anObject)) {
        return false;
    }

    str = anObject;

    m = str.match(this.get('DATE_REGEX'));
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
    day = parseInt(m.at(this.get('DAY_INDEX')), 10);

    //  month can't be 0, or greater than 12
    if (!month.isBetweenInclusive(1, 12)) {
        return false;
    }

    //  day can't be 0, or greater than the days in that month
    if (!day.isBetweenInclusive(1, Date.daysInMonth(month, year))) {
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

TP.xs.date.Type.defineMethod('validateFacetMaxExclusive',
function(aValue, aFacet) {

    /**
     * @name validateFacetMaxExclusive
     * @synopsis Tests the incoming value to see if its value is less than the
     *     value provided in the facet specification.
     * @param {Object} aValue The object to test.
     * @param {Element} aFacet The facet node being tested.
     * @returns {Boolean} 
     * @todo
     */

    var m1,
        year1,
        month1,
        day1,
        zone1,

        m2,
        year2,
        month2,
        day2,
        zone2;

    m1 = aValue.match(this.get('DATE_REGEX'));
    m2 = TP.elementGetAttribute(aFacet, 'value').match(
                                            this.get('DATE_REGEX'));

    zone1 = m1.at(this.get('ZONE_INDEX'));
    zone2 = m2.at(this.get('ZONE_INDEX'));

    //  if we got differing zone data then we've got issues
    if (zone1 !== zone2) {
        return this.raise('TP.sig.UnsupportedFeature', arguments,
                    'Timezone comparisons not currently supported.');
    }

    year1 = parseInt(m1.at(this.get('YEAR_INDEX')), 10);
    year2 = parseInt(m2.at(this.get('YEAR_INDEX')), 10);

    if (year1 > year2) {
        return false;
    }

    if (year1 < year2) {
        return true;
    }

    month1 = parseInt(m1.at(this.get('MONTH_INDEX')), 10);
    month2 = parseInt(m2.at(this.get('MONTH_INDEX')), 10);

    if (month1 > month2) {
        return false;
    }

    if (month1 < month2) {
        return true;
    }

    day1 = parseInt(m1.at(this.get('DAY_INDEX')), 10);
    day2 = parseInt(m2.at(this.get('DAY_INDEX')), 10);

    if (day1 >= day2) {
        return false;
    }

    if (day1 < day2) {
        return true;
    }
});

//  ------------------------------------------------------------------------

TP.xs.date.Type.defineMethod('validateFacetMaxInclusive',
function(aValue, aFacet) {

    /**
     * @name validateFacetMaxInclusive
     * @synopsis Tests the incoming value to see if it is less than or equal to
     *     the value specified in the facet node.
     * @param {Object} aValue The object to test.
     * @param {Element} aFacet The facet node being tested.
     * @returns {Boolean} 
     * @todo
     */

    var m1,
        year1,
        month1,
        day1,
        zone1,

        m2,
        year2,
        month2,
        day2,
        zone2;

    m1 = aValue.match(this.get('DATE_REGEX'));
    m2 = TP.elementGetAttribute(aFacet, 'value').match(
                                            this.get('DATE_REGEX'));

    zone1 = m1.at(this.get('ZONE_INDEX'));
    zone2 = m2.at(this.get('ZONE_INDEX'));

    //  if we got differing zone data then we've got issues
    if (zone1 !== zone2) {
        return this.raise('TP.sig.UnsupportedFeature', arguments,
                    'Timezone comparisons not currently supported.');
    }

    year1 = parseInt(m1.at(this.get('YEAR_INDEX')), 10);
    year2 = parseInt(m2.at(this.get('YEAR_INDEX')), 10);

    if (year1 > year2) {
        return false;
    }

    if (year1 < year2) {
        return true;
    }

    month1 = parseInt(m1.at(this.get('MONTH_INDEX')), 10);
    month2 = parseInt(m2.at(this.get('MONTH_INDEX')), 10);

    if (month1 > month2) {
        return false;
    }

    if (month1 < month2) {
        return true;
    }

    day1 = parseInt(m1.at(this.get('DAY_INDEX')), 10);
    day2 = parseInt(m2.at(this.get('DAY_INDEX')) , 10);

    if (day1 > day2) {
        return false;
    }

    if (day1 <= day2) {
        return true;
    }
});

//  ------------------------------------------------------------------------

TP.xs.date.Type.defineMethod('validateFacetMinExclusive',
function(aValue, aFacet) {

    /**
     * @name validateFacetMinExclusive
     * @synopsis Tests the incoming value to verify that it is larger than the
     *     minimum value provided in the facet.
     * @param {Object} aValue The object to test.
     * @param {Element} aFacet The facet node being tested.
     * @returns {Boolean} 
     * @todo
     */

    var m1,
        year1,
        month1,
        day1,
        zone1,

        m2,
        year2,
        month2,
        day2,
        zone2;

    m1 = aValue.match(this.get('DATE_REGEX'));
    m2 = TP.elementGetAttribute(aFacet, 'value').match(
                                            this.get('DATE_REGEX'));

    zone1 = m1.at(this.get('ZONE_INDEX'));
    zone2 = m2.at(this.get('ZONE_INDEX'));

    //  if we got differing zone data then we've got issues
    if (zone1 !== zone2) {
        return this.raise('TP.sig.UnsupportedFeature', arguments,
                    'Timezone comparisons not currently supported.');
    }

    year1 = parseInt(m1.at(this.get('YEAR_INDEX')), 10);
    year2 = parseInt(m2.at(this.get('YEAR_INDEX')), 10);

    if (year1 < year2) {
        return false;
    }

    if (year1 > year2) {
        return true;
    }

    month1 = parseInt(m1.at(this.get('MONTH_INDEX')), 10);
    month2 = parseInt(m2.at(this.get('MONTH_INDEX')), 10);

    if (month1 < month2) {
        return false;
    }

    if (month1 > month2) {
        return true;
    }

    day1 = parseInt(m1.at(this.get('DAY_INDEX')), 10);
    day2 = parseInt(m2.at(this.get('DAY_INDEX')), 10);

    if (day1 <= day2) {
        return false;
    }

    if (day1 > day2) {
        return true;
    }
});

//  ------------------------------------------------------------------------

TP.xs.date.Type.defineMethod('validateFacetMinInclusive',
function(aValue, aFacet) {

    /**
     * @name validateFacetMinInclusive
     * @synopsis Tests the incoming value to make sure its value is at least the
     *     value provided in the facet node.
     * @param {Object} aValue The object to test.
     * @param {Element} aFacet The facet node being tested.
     * @returns {Boolean} 
     * @todo
     */

    var m1,
        year1,
        month1,
        day1,
        zone1,

        m2,
        year2,
        month2,
        day2,
        zone2;

    m1 = aValue.match(this.get('DATE_REGEX'));
    m2 = TP.elementGetAttribute(aFacet, 'value').match(
                                            this.get('DATE_REGEX'));

    zone1 = m1.at(this.get('ZONE_INDEX'));
    zone2 = m2.at(this.get('ZONE_INDEX'));

    //  if we got differing zone data then we've got issues
    if (zone1 !== zone2) {
        return this.raise('TP.sig.UnsupportedFeature', arguments,
                    'Timezone comparisons not currently supported.');
    }

    year1 = parseInt(m1.at(this.get('YEAR_INDEX')), 10);
    year2 = parseInt(m2.at(this.get('YEAR_INDEX')), 10);

    if (year1 < year2) {
        return false;
    }

    if (year1 > year2) {
        return true;
    }

    month1 = parseInt(m1.at(this.get('MONTH_INDEX')), 10);
    month2 = parseInt(m2.at(this.get('MONTH_INDEX')), 10);

    if (month1 < month2) {
        return false;
    }

    if (month1 > month2) {
        return true;
    }

    day1 = parseInt(m1.at(this.get('DAY_INDEX')), 10);
    day2 = parseInt(m2.at(this.get('DAY_INDEX')), 10);

    if (day1 < day2) {
        return false;
    }

    if (day1 >= day2) {
        return true;
    }
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

