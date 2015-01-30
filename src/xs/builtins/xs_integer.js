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
 * @type {TP.xs.integer}
 * @synopsis An integer value with no restriction on digit length.
 */

//  ------------------------------------------------------------------------

TP.xs.decimal.defineSubtype('integer');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  a regex suitable for matching an integer value with optional leading
//  sign
TP.xs.integer.Type.defineConstant('INTEGER_REGEX', /^[-+]{0,1}[0-9]{1,}$/);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.integer.Type.defineMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Returns true if the object provided represents an integer with
     *     optional leading + or - sign.
     * @param {String} anObject The object to validate.
     * @returns {Boolean}
     */

    var s;

    if (!TP.isString(anObject) && !TP.isNumber(anObject)) {
        return false;
    }

    s = anObject.asString();

    return this.get('INTEGER_REGEX').test(s);
});

//  ------------------------------------------------------------------------

TP.xs.integer.Type.defineMethod('validateFacetFractionDigits',
function(aValue, aFacet) {

    /**
     * @name validateFacetFractionDigits
     * @synopsis Tests to make sure the inbound value has no more than the
     *     specified number of fractional digits. For TP.xs.integer this will
     *     raise an TP.sig.InvalidOperation signal.
     * @param {Object} aValue The object to test.
     * @param {Element} aFacet The facet node being tested.
     * @raises TP.sig.InvalidOperation
     * @returns {Boolean}
     */

    this.raise('TP.sig.UnsupportedFeature',
                'Unsupported facet for this schema type');

    return false;
});

//  ------------------------------------------------------------------------

TP.xs.integer.Type.defineMethod('validateFacetTotalDigits',
function(aValue, aFacet) {

    /**
     * @name validateFacetTotalDigits
     * @synopsis Tests to make sure the inbound value has no more than the
     *     specified number of total digits.
     * @param {Object} aValue The object to test.
     * @param {Element} aFacet The facet node being tested.
     * @returns {Boolean}
     */

    var num,
        str,
        digits;

    //  get a numerical value for the digit count from the facet node
    digits = TP.elementGetAttribute(aFacet, 'value').asNumber();

    //  this is supposed to work on the "value space" meaning that trailing
    //  zeros aren't significant so we want to work from a number first...
    if (!TP.isNaN(num = parseFloat(aValue))) {
        str = num.asString();
        return str.getSize() <= digits;
    }

    return false;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
