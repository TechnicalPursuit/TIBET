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
 * @type {TP.xs.gYear}
 * @summary A year specification with optional time zone data in the form
 *     [-]YYYY with optional additional year digits to handle larger years (this
 *     is true for all XML Schema year representations).
 */

//  ------------------------------------------------------------------------

TP.xs.anySimpleType.defineSubtype('gYear');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  a regex capable of validating the lexical format and splitting the
//  various segments out into a match result for further testing
TP.xs.gYear.Type.defineConstant('YEAR_REGEX',
    /^([-])*([0-9]{4,})(([Z\+\-]*)([0-9]{2})*[:]*([0-9]{2})*)$/);

//  indexes into the match result produced by the previous RegExp
TP.xs.gYear.Type.defineConstant('MINUS_INDEX', 1);
TP.xs.gYear.Type.defineConstant('YEAR_INDEX', 2);
TP.xs.gYear.Type.defineConstant('ZONE_INDEX', 3);

//  ------------------------------------------------------------------------

TP.xs.gYear.Type.defineMethod('validate',
function(anObject) {

    /**
     * @method validate
     * @summary Returns true if the object provided represents a valid year
     *     with optional timezone data.
     * @param {String} anObject The object to validate.
     * @returns {Boolean}
     */

    var str,
        m,
        zi,
        year;

    if (!TP.isString(anObject)) {
        return false;
    }

    str = anObject;

    m = str.match(this.get('YEAR_REGEX'));
    if (TP.notValid(m)) {
        return false;
    }

    year = m.at(this.get('YEAR_INDEX'));
    if ((year.getSize() > 4) && year.startsWith('0')) {
        //  year can't start with 0 if longer than 4 digits
        return false;
    }
    year = parseInt(year, 10);

    if (TP.notEmpty(zi = m.at(this.get('ZONE_INDEX')))) {
        return TP.core.TimeZone.validate(zi);
    }

    //  made it through the gauntlet
    return true;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
