//  ========================================================================
/*
NAME:   xs_integer.js
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
     * @todo
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
     * @todo
     */

    this.raise('TP.sig.UnsupportedFeature',
                arguments,
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
        str = num.asString();
        return str.getSize() <= digits;
    }

    return false;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

