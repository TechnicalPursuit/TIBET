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
 * @type {TP.xs.long}
 * @synopsis A value whose range is limited by 64-bit storage limits.
 */

//  ------------------------------------------------------------------------

TP.xs.integer.defineSubtype('long');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.long.Type.defineMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Returns true if the object provided is between
     *     -9223372036854775808 and 9223372036854775807 inclusive.
     * @param {String} anObject The object to validate.
     * @returns {Boolean}
     */

    var n,
        s;

    if (!'TP.xs.integer'.asType().validate(anObject)) {
        return false;
    }

    try {
        if (!TP.isNumber(n = parseInt(anObject, 10))) {
            return false;
        }
    } catch (e) {
        return false;
    }

    s = anObject.toString();

    if (s.startsWith('-')) {
        return s.slice(1) <= '9223372036854775808';
    }

    return s <= '9223372036854775807';
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
