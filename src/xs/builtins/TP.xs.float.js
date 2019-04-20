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
 * @type {TP.xs.float}
 * @summary An IEEE-754 float value (a 32-bit single precision value).
 */

//  ------------------------------------------------------------------------

TP.xs.anySimpleType.defineSubtype('float');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.float.Type.defineMethod('validate',
function(anObject) {

    /**
     * @method validate
     * @summary Returns true if the object provided meets the criteria for a
     *     valid TP.xs.float, a number defined in optional scientific notation
     *     representing a 32-bit floating point number.
     * @param {String} anObject The object to validate.
     * @returns {Boolean}
     */

    var n,
        s,
        arr;

    if (!TP.isString(anObject) && !TP.isNumber(anObject)) {
        return false;
    }

    //  certain strings are valid floats even though they're "not numbers"
    s = anObject.asString();
    if (s === 'INF' || s === '-INF' || s === 'NaN') {
        return true;
    }

    //  no whitespace allowed regardless of form
    if (/\s/.test(s)) {
        return false;
    }

    arr = s.toUpperCase().split('E');
    if (arr.getSize() > 1) {
        if (!arr.at(1).isa('TP.xs.integer')) {
            return false;
        }
    }

    try {
        if (!TP.isNumber(n = parseFloat(anObject))) {
            return false;
        }
    } catch (e) {
        return false;
    }

    //  roughly decimal value of +/-10 to the 38.53 power
    return n.isBetweenInclusive((10).pow(38.53) * -1, (10).pow(38.53));
});

//  ------------------------------------------------------------------------

TP.xs.float.Type.defineMethod(
                    'validateFacetEnumeration',
                    'TP.xs.decimal'.asType().validateFacetEnumeration);

//  ------------------------------------------------------------------------

TP.xs.float.Type.defineMethod(
                    'validateFacetMaxExclusive',
                    'TP.xs.decimal'.asType().validateFacetMaxExclusive);

//  ------------------------------------------------------------------------

TP.xs.float.Type.defineMethod(
                    'validateFacetMaxInclusive',
                    'TP.xs.decimal'.asType().validateFacetMaxInclusive);

//  ------------------------------------------------------------------------

TP.xs.float.Type.defineMethod(
                    'validateFacetMinExclusive',
                    'TP.xs.decimal'.asType().validateFacetMinExclusive);

//  ------------------------------------------------------------------------

TP.xs.float.Type.defineMethod(
                    'validateFacetMinInclusive',
                    'TP.xs.decimal'.asType().validateFacetMinInclusive);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
