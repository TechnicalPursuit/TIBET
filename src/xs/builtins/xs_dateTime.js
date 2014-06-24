//  ========================================================================
/*
NAME:   xs_dateTime.js
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
 * @type {TP.xs.dateTime}
 * @synopsis A string representing a date and time specification according to
 *     the ISO8601 specification where all parts of the date and time components
 *     must be specified.
 */

//  ------------------------------------------------------------------------

TP.xs.anySimpleType.defineSubtype('dateTime');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  regex and indicies for splitting into a date and time around 'T'
TP.xs.dateTime.Type.defineConstant('DATETIME_REGEX',
            /^([-])*([^T]+)T([^T]+)$/);

TP.xs.dateTime.Type.defineConstant('MINUS_INDEX', 1);
TP.xs.dateTime.Type.defineConstant('DATE_INDEX', 2);
TP.xs.dateTime.Type.defineConstant('TIME_INDEX', 3);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.dateTime.Type.defineMethod('fromDate',
function(anObject) {

    /**
     * @name fromDate
     * @synopsis Constructs a new instance from the object provided, if
     *     possible. For TP.xs.dateTime the incoming object must be a properly
     *     formatted TP.xs.dateTime string, ISO 8601 string, or a Date object
     *     itself. The result is returned as a properly formatted TP.xs.dateTime
     *     string representing the incoming value.
     * @param {Object} anObject The object to use as source data.
     */

    return anObject.as('TP.iso.ISO8601');
});

//  ------------------------------------------------------------------------

TP.xs.dateTime.Type.defineMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Returns true if the object provided is a valid TP.xs.dateTime
     *     string.
     * @param {String} anObject The object to validate.
     * @returns {Boolean} 
     */

    var str,
        m,

        d,
        t;

    if (!TP.isString(anObject)) {
        return false;
    }

    str = anObject;

    m = str.match(this.get('DATETIME_REGEX'));
    if (TP.notValid(m)) {
        return false;
    }

    //  ---
    //  DATE PART
    //  ---

    d = m.at(this.get('DATE_INDEX'));
    if (!'TP.xs.date'.asType().validate(d)) {
        return false;
    }

    //  ---
    //  TIME PART
    //  ---

    t = m.at(this.get('TIME_INDEX'));
    return 'TP.xs.time'.asType().validate(t);
});

//  ------------------------------------------------------------------------

TP.xs.dateTime.Type.defineMethod('validateFacetEnumeration',
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

    var inst,
        value;

    //  convert both values to Date instances for testing
    inst = TP.dc(TP.elemenGetAttribute(aFacet, 'value'));
    value = TP.dc(aValue);

    return value.equalTo(inst);
});

//  ------------------------------------------------------------------------

TP.xs.dateTime.Type.defineMethod('validateFacetMaxExclusive',
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

    var date,
        test;

    test = TP.dc(TP.elementGetAttribute(aFacet, 'value'));
    date = TP.dc(aValue);

    return date.getTime() < test.getTime();
});

//  ------------------------------------------------------------------------

TP.xs.dateTime.Type.defineMethod('validateFacetMaxInclusive',
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

    var date,
        test;

    test = TP.dc(TP.elementGetAttribute(aFacet, 'value'));
    date = TP.dc(aValue);

    return date.getTime() <= test.getTime();
});

//  ------------------------------------------------------------------------

TP.xs.dateTime.Type.defineMethod('validateFacetMinExclusive',
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

    var date,
        test;

    test = TP.dc(TP.elementGetAttribute(aFacet, 'value'));
    date = TP.dc(aValue);

    return date.getTime() > test.getTime();
});

//  ------------------------------------------------------------------------

TP.xs.dateTime.Type.defineMethod('validateFacetMinInclusive',
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

    var date,
        test;

    test = TP.dc(TP.elementGetAttribute(aFacet, 'value'));
    date = TP.dc(aValue);

    return date.getTime() >= test.getTime();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

