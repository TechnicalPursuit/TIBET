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
 * @type {TP.xs.positiveInteger}
 * @synopsis An integer whose value is greater than zero.
 */

//  ------------------------------------------------------------------------

TP.xs.nonNegativeInteger.defineSubtype('positiveInteger');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.positiveInteger.Type.defineMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Returns true if the object provided is a number greater than
     *     zero.
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

    return n > 0;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
