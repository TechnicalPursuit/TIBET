//  ========================================================================
/*
NAME:   xs_decimal.js
AUTH:   Scott Shattuck (ss)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.

*/
//  ------------------------------------------------------------------------

/**
 * @type {TP.xs.decimal}
 * @synopsis A decimal number containing an optional decimal point and leading +
 *     or - sign descriptor.
 * @todo
 */

//  ------------------------------------------------------------------------

TP.xs.anySimpleType.defineSubtype('decimal');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  a regex suitable for matching a decimal value with optional leading sign
TP.xs.decimal.Type.defineConstant('DECIMAL_REGEX',
                                /^[-+]{0,1}[0-9]*[\.]*[0-9]*$/);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.decimal.Type.defineMethod('fromObject',
function(anObject) {

    /**
     * @name fromObject
     * @synopsis Constructs a new instance from the object provided, if
     *     possible. For TP.xs.decimal this method will attempt to construct a
     *     decimal string representation of the incoming object.
     * @param {Object} anObject The object to use as source data.
     */

    var n,
        s;

    if (TP.notValid(anObject)) {
        return;
    }

    if (TP.isMethod(anObject.as)) {
        n = anObject.as(Number);
    } else {
        n = Number.from(anObject);
    }

    if (TP.notValid(n)) {
        return;
    }

    s = n.asString();
    if (!/\./.test(s)) {
        s += '.0';
    }

    return s;
});

//  ------------------------------------------------------------------------

TP.xs.decimal.Type.defineMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Returns true if the object provided either is a decimal string,
     *     or a number with a valid decimal string representation.
     * @param {String} anObject The object to validate.
     * @returns {Boolean} 
     */

    var s;

    //  must be either a number or string value
    if (!TP.isString(anObject) && !TP.isNumber(anObject)) {
        return false;
    }

    s = anObject.asString();

    //  has to be at least one digit
    if (!/[0-9]/.test(s)) {
        return false;
    }

    //  the matcher here handles the overall format once we know there's at
    //  least one digit
    return this.get('DECIMAL_REGEX').test(s);
});

//  ------------------------------------------------------------------------

TP.xs.decimal.Type.defineMethod('validateFacetEnumeration',
function(aValue, aFacet) {

    /**
     * @name validateFacetEnumeration
     * @synopsis Tests the incoming value against a specific enumeration value
     *     found in the facet provided.
     * @param {Object} aValue The object to test.
     * @param {Element} aFacet The facet node being tested.
     * @returns {Boolean} 
     * @todo
     */

    var inst;

    inst = this.fromObject(TP.elementGetAttribute(aFacet, 'value'));

    //  note the test here, which says are inst and aValue equivalent when
    //  both are converted to Number
    return TP.ac(inst, aValue).equalAs(Number);
});

//  ------------------------------------------------------------------------

TP.xs.decimal.Type.defineMethod('validateFacetFractionDigits',
function(aValue, aFacet) {

    /**
     * @name validateFacetFractionDigits
     * @synopsis Tests to make sure the inbound value has no more than the
     *     specified number of fractional digits.
     * @param {Object} aValue The object to test.
     * @param {Element} aFacet The facet node being tested.
     * @returns {Boolean} 
     * @todo
     */

    var num,
        str,
        digits;

    //  get a numerical value for the digit count from the facet node
    digits = TP.elementGetAttribute(aFacet, 'value').asNumber();

    //  this is supposed to work on the "value space" meaning that trailing
    //  zeros aren't significant so we want to work from a number first...
    if (!TP.isNaN(num = parseFloat(aValue))) {
        str = num.fraction().asString().split('.').last();
        return str.getSize() <= digits;
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.xs.decimal.Type.defineMethod('validateFacetMaxExclusive',
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

    var num,
        limit;

    //  we need both items in numerical form so we can test values
    try {
        limit = TP.nc(TP.elementGetAttribute(aFacet, 'value'));
        num = TP.nc(aValue);
    } catch (e) {
        return false;
    }

    return num < limit;
});

//  ------------------------------------------------------------------------

TP.xs.decimal.Type.defineMethod('validateFacetMaxInclusive',
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

    var num,
        limit;

    //  we need both items in numerical form so we can test values
    try {
        limit = TP.nc(TP.elementGetAttribute(aFacet, 'value'));
        num = TP.nc(aValue);
    } catch (e) {
        return false;
    }

    return num <= limit;
});

//  ------------------------------------------------------------------------

TP.xs.decimal.Type.defineMethod('validateFacetMinExclusive',
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

    var num,
        limit;

    //  we need both items in numerical form so we can test values
    try {
        limit = TP.nc(TP.elementGetAttribute(aFacet, 'value'));
        num = TP.nc(aValue);
    } catch (e) {
        return false;
    }

    return num > limit;
});

//  ------------------------------------------------------------------------

TP.xs.decimal.Type.defineMethod('validateFacetMinInclusive',
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

    var num,
        limit;

    //  we need both items in numerical form so we can test values
    try {
        limit = TP.nc(TP.elementGetAttribute(aFacet, 'value'));
        num = TP.nc(aValue);
    } catch (e) {
        return false;
    }

    return num >= limit;
});

//  ------------------------------------------------------------------------

TP.xs.decimal.Type.defineMethod('validateFacetTotalDigits',
function(aValue, aFacet) {

    /**
     * @name validateFacetTotalDigits
     * @synopsis Tests the incoming value to see if has no more than the maximum
     *     number of decimal digits specified in the facet.
     * @param {Object} aValue The object to test.
     * @param {Element} aFacet The facet node being tested.
     * @returns {Boolean} 
     * @todo
     */

    var num,
        str,
        digits;

    //  get a numerical value for the digit count from the facet node
    digits = TP.elementGetAttribute(aFacet, 'value').asNumber();

    //  this is supposed to work on the "value space" meaning that leading
    //  and trailing zeros aren't significant so we want to work from a
    //  number first...
    if (!TP.isNaN(num = parseFloat(aValue))) {
        str = num.asString();
        return str.getSize() <= digits;
    }

    return false;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

