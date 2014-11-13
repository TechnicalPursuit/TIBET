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
 * @type {TP.xs.gDay}
 * @synopsis A day specification in XML schema format (---DD) with optional time
 *     zone data.
 * @todo
 */

//  ------------------------------------------------------------------------

TP.xs.anySimpleType.defineSubtype('gDay');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  a regex capable of validating the lexical format and splitting the
//  various segments out into a match result for further testing
TP.xs.gDay.Type.defineConstant('DAY_REGEX',
            /^---([0-9]{2})(([Z\+\-]*)([0-9]{2})*[:]*([0-9]{2})*)$/);

//  indexes into the match result produced by the previous RegExp
TP.xs.gDay.Type.defineConstant('DAY_INDEX', 1);
TP.xs.gDay.Type.defineConstant('ZONE_INDEX', 2);

//  ------------------------------------------------------------------------

TP.xs.gDay.Type.defineMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Returns true if the object provided is a valid XML Schema day
     *     specification.
     * @param {String} anObject The object to validate.
     * @returns {Boolean}
     */

    var str,
        m,
        zi,
        day;

    if (!TP.isString(anObject)) {
        return false;
    }

    str = anObject;

    m = str.match(this.get('DAY_REGEX'));
    if (TP.notValid(m)) {
        return false;
    }

    day = parseInt(m.at(this.get('DAY_INDEX')), 10);

    //  spec says this is a day in an arbitrary month of 31 days
    if (!day.isBetweenInclusive(1, 31)) {
        return false;
    }

    if (TP.notEmpty(zi = m.at(this.get('ZONE_INDEX')))) {
        return TP.core.TimeZone.validate(zi);
    }

    //  made it through the gauntlet
    return true;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
