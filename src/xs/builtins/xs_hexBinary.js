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
 * @type {TP.xs.hexBinary}
 * @synopsis A hexBinary string, a string containing a Hex representation of a
 *     binary value.
 */

//  ------------------------------------------------------------------------

TP.xs.anySimpleType.defineSubtype('hexBinary');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  a regex which can match one or more binary octets in hex form
TP.xs.hexBinary.Type.defineConstant('HEXBINARY_REGEX', /^[0-9a-fA-F]{2,}$/);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.hexBinary.Type.defineMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Returns true if the object provided contains a string matching
     *     the restricted character set of a hexBinary encoded string.
     * @param {String} anObject The object to validate.
     * @returns {Boolean}
     */

    if (!TP.isString(anObject)) {
        return false;
    }

    return this.get('HEXBINARY_REGEX').test(anObject) &&
            anObject.getSize().isEven();
});

//  ------------------------------------------------------------------------

TP.xs.hexBinary.Type.defineMethod(
                        'validateFacetLength',
                        'TP.xs.string'.asType().validateFacetLength);

//  ------------------------------------------------------------------------

TP.xs.hexBinary.Type.defineMethod(
                        'validateFacetMaxLength',
                        'TP.xs.string'.asType().validateFacetMaxLength);

//  ------------------------------------------------------------------------

TP.xs.hexBinary.Type.defineMethod(
                        'validateFacetMinLength',
                        'TP.xs.string'.asType().validateFacetMinLength);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
