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
 * @type {tibet:credit_card_number}
 * @summary A simple credit_card_number type used for validation.
 */

//  ------------------------------------------------------------------------

TP.xs.string.defineSubtype('tibet:credit_card_number');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tibet.credit_card_number.Type.defineMethod('validate',
function(anObject) {

    /**
     * @method validate
     * @summary Returns true if the object provided is a string containing a
     *     credit card number.
     * @param {Object} anObject The object to test.
     * @returns {Boolean}
     */

    //  A simple implementation of the Luhn formula.

    var digit,
        digits,
        flag,
        sum,
        i,
        len;

    if (!TP.isString(anObject)) {
        return false;
    }

    flag = true;
    sum = 0;
    digits = anObject.split('').reverse();

    len = digits.length;
    for (i = 0; i < len; i++) {
        digit = digits[i];
        digit = parseInt(digit, 10);

        /* eslint-disable no-extra-parens */
        if ((flag = !flag)) {
            digit *= 2;
        }
        /* eslint-enable no-extra-parens */

        if (digit > 9) {
            digit -= 9;
        }

        sum += digit;
    }

    return sum % 10 === 0;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
