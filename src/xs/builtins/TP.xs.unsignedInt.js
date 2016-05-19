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
 * @type {TP.xs.unsignedInt}
 * @summary A value whose range is limited by unsigned 32-bit storage limits.
 */

//  ------------------------------------------------------------------------

TP.xs.nonNegativeInteger.defineSubtype('unsignedInt');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.unsignedInt.Type.defineMethod('validate',
function(anObject) {

    /**
     * @method validate
     * @summary Returns true if the object provided falls between 0 and
     *     4294967295 inclusive.
     * @param {String} anObject The object to validate.
     * @returns {Boolean}
     */

    var n;

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

    return n.isBetweenInclusive(0, 4294967295);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
