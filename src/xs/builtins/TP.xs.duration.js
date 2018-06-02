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
 * @type {TP.xs.duration}
 * @summary A string representing a span of time as -PnYnMnDTnHnMnS where n
 *     represents an integer or decimal (for seconds) amount. Note that only one
 *     "segment" of time must be present for the duration to be valid. If that
 *     segment is a segment of hours, minutes, or seconds then the T must also
 *     be present.
 */

//  ------------------------------------------------------------------------

TP.xs.anySimpleType.defineSubtype('duration');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

/*
The following 4 dates are used per XML Schema as test dates for duration
comparisons.
*/

TP.xs.duration.Type.defineConstant('COMPARISON_DATE_ONE',
                                TP.dc('1696-09-00T00:00:00Z'));

TP.xs.duration.Type.defineConstant('COMPARISON_DATE_TWO',
                                TP.dc('1697-02-01T00:00:00Z'));

TP.xs.duration.Type.defineConstant('COMPARISON_DATE_THREE',
                                TP.dc('1903-03-01T00:00:00Z'));

TP.xs.duration.Type.defineConstant('COMPARISON_DATE_FOUR',
                                TP.dc('1903-07-01T00:00:00Z'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.duration.Type.defineMethod('fromObject',
function(anObject) {

    /**
     * @method fromObject
     * @summary Constructs a new instance from the object provided, if
     *     possible. For TP.xs.duration this method throws an exception unless
     *     the inbound object's string value is a valid duration string itself.
     * @param {Object} anObject The object to use as source data.
     * @exception TP.sig.InvalidParameter
     * @returns {String|undefined} A valid duration representation string.
     */

    var str;

    if (!TP.isValid(anObject)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    if (TP.isMethod(anObject.asString)) {
        str = anObject.asString();
    } else if (TP.isMethod(anObject.toString)) {
        str = anObject.toString();
    } else if (TP.isNode(anObject)) {
        str = TP.nodeAsString(anObject);
    }

    if (!this.validate(str)) {
        return;
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.xs.duration.Type.defineMethod('validate',
function(anObject) {

    /**
     * @method validate
     * @summary Returns true if the object provided is a conforming duration
     *     string of the form -PnYnMnDTnHnMnS.
     * @param {String} anObject The object to validate.
     * @returns {Boolean} Whether or not the object is a String containing a
     *     valid duration.
     */

    var str,
        m;

    if (!TP.isString(anObject)) {
        return false;
    }

    str = anObject;

    //  must start with P or optional minus sign and one or more numbers OR
    //  a T signifying this will be a (T)ime specification
    if (!/^[-]*P[0-9T]+/.test(str)) {
        return false;
    }

    //  seems to match basic requirements meaning it starts off right and
    //  has at least one segment. next we split it into segments
    m = str.match(Date.DURATION_REGEX);
    if (TP.notValid(m)) {
        return false;
    }

    /* eslint-disable no-extra-parens */
    //  if there's a T, there has to be at least one of H, M, or S
    if (TP.notEmpty(m.at(Date.DURATION_T_INDEX))) {
        return (TP.notEmpty(m.at(Date.DURATION_HOUR_INDEX)) ||
                TP.notEmpty(m.at(Date.DURATION_MINUTE_INDEX)) ||
                TP.notEmpty(m.at(Date.DURATION_SECOND_INDEX)));
    } else {
        return (TP.isEmpty(m.at(Date.DURATION_HOUR_INDEX)) &&
                TP.isEmpty(m.at(Date.DURATION_MINUTE_INDEX)) &&
                TP.isEmpty(m.at(Date.DURATION_SECOND_INDEX)));
    }
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.xs.duration.Type.defineMethod('validateFacetEnumeration',
function(aValue, aFacet) {

    /**
     * @method validateFacetEnumeration
     * @summary Tests the incoming value against a specific enumeration value
     *     found in the facet provided.
     * @param {Object} aValue The object to test.
     * @param {Element} aFacet The facet node being tested.
     * @returns {Boolean}
     */

    var inst,
        value;

    //  convert both values to normalized form for testing
    inst = Date.normalizeDuration(TP.elementGetAttribute(aFacet, 'value'));
    value = Date.normalizeDuration(aValue);

    return inst === value;
});

//  ------------------------------------------------------------------------

TP.xs.duration.Type.defineMethod('validateFacetMaxExclusive',
function(aValue, aFacet) {

    /**
     * @method validateFacetMaxExclusive
     * @summary Tests the incoming value to see if its value is less than the
     *     value provided in the facet specification.
     * @param {Object} aValue The object to test.
     * @param {Element} aFacet The facet node being tested.
     * @returns {Boolean}
     */

    var test;

    test = this.fromObject(TP.elementGetAttribute(aFacet, 'value'));

    /* eslint-disable no-extra-parens */
    if ((this.COMPARISON_DATE_ONE.addDuration(test).getTime() >
        this.COMPARISON_DATE_ONE.addDuration(aValue).getTime()) &&
        (this.COMPARISON_DATE_TWO.addDuration(test).getTime() >
        this.COMPARISON_DATE_TWO.addDuration(aValue).getTime()) &&
        (this.COMPARISON_DATE_THREE.addDuration(test).getTime() >
        this.COMPARISON_DATE_THREE.addDuration(aValue).getTime()) &&
        (this.COMPARISON_DATE_FOUR.addDuration(test).getTime() >
        this.COMPARISON_DATE_FOUR.addDuration(aValue).getTime())) {
        return true;
    }
    /* eslint-enable no-extra-parens */

    return false;
});

//  ------------------------------------------------------------------------

TP.xs.duration.Type.defineMethod('validateFacetMaxInclusive',
function(aValue, aFacet) {

    /**
     * @method validateFacetMaxInclusive
     * @summary Tests the incoming value to see if it is less than or equal to
     *     the value specified in the facet node.
     * @param {Object} aValue The object to test.
     * @param {Element} aFacet The facet node being tested.
     * @returns {Boolean}
     */

    var test;

    test = this.fromObject(TP.elementGetAttribute(aFacet, 'value'));

    /* eslint-disable no-extra-parens */
    if ((this.COMPARISON_DATE_ONE.addDuration(test).getTime() >=
        this.COMPARISON_DATE_ONE.addDuration(aValue).getTime()) &&
        (this.COMPARISON_DATE_TWO.addDuration(test).getTime() >=
        this.COMPARISON_DATE_TWO.addDuration(aValue).getTime()) &&
        (this.COMPARISON_DATE_THREE.addDuration(test).getTime() >=
        this.COMPARISON_DATE_THREE.addDuration(aValue).getTime()) &&
        (this.COMPARISON_DATE_FOUR.addDuration(test).getTime() >=
        this.COMPARISON_DATE_FOUR.addDuration(aValue).getTime())) {
        return true;
    }
    /* eslint-enable no-extra-parens */

    return false;
});

//  ------------------------------------------------------------------------

TP.xs.duration.Type.defineMethod('validateFacetMinExclusive',
function(aValue, aFacet) {

    /**
     * @method validateFacetMinExclusive
     * @summary Tests the incoming value to verify that it is larger than the
     *     minimum value provided in the facet.
     * @param {Object} aValue The object to test.
     * @param {Element} aFacet The facet node being tested.
     * @returns {Boolean}
     */

    var test;

    test = this.fromObject(TP.elementGetAttribute(aFacet, 'value'));

    /* eslint-disable no-extra-parens */
    if ((this.COMPARISON_DATE_ONE.addDuration(test).getTime() <
        this.COMPARISON_DATE_ONE.addDuration(aValue).getTime()) &&
        (this.COMPARISON_DATE_TWO.addDuration(test).getTime() <
        this.COMPARISON_DATE_TWO.addDuration(aValue).getTime()) &&
        (this.COMPARISON_DATE_THREE.addDuration(test).getTime() <
        this.COMPARISON_DATE_THREE.addDuration(aValue).getTime()) &&
        (this.COMPARISON_DATE_FOUR.addDuration(test).getTime() <
        this.COMPARISON_DATE_FOUR.addDuration(aValue).getTime())) {
        return true;
    }
    /* eslint-enable no-extra-parens */

    return false;
});

//  ------------------------------------------------------------------------

TP.xs.duration.Type.defineMethod('validateFacetMinInclusive',
function(aValue, aFacet) {

    /**
     * @method validateFacetMinInclusive
     * @summary Tests the incoming value to make sure its value is at least the
     *     value provided in the facet node.
     * @param {Object} aValue The object to test.
     * @param {Element} aFacet The facet node being tested.
     * @returns {Boolean}
     */

    var test;

    test = this.fromObject(TP.elementGetAttribute(aFacet, 'value'));

    /* eslint-disable no-extra-parens */
    if ((this.COMPARISON_DATE_ONE.addDuration(test).getTime() <=
        this.COMPARISON_DATE_ONE.addDuration(aValue).getTime()) &&
        (this.COMPARISON_DATE_TWO.addDuration(test).getTime() <=
        this.COMPARISON_DATE_TWO.addDuration(aValue).getTime()) &&
        (this.COMPARISON_DATE_THREE.addDuration(test).getTime() <=
        this.COMPARISON_DATE_THREE.addDuration(aValue).getTime()) &&
        (this.COMPARISON_DATE_FOUR.addDuration(test).getTime() <=
        this.COMPARISON_DATE_FOUR.addDuration(aValue).getTime())) {
        return true;
    }
    /* eslint-enable no-extra-parens */

    return false;
});

//  ------------------------------------------------------------------------

TP.xs.duration.Type.defineMethod('getMonthsInDuration',
function(anObject) {

    /**
     * @method getMonthsInDuration
     * @summary Returns the number of months represented by the TP.xs.duration
     *     provided. Note that the implementation does not use information other
     *     than the Y and M segments in the duration.
     * @param {TP.xs.duration} aDuration The duration to convert.
     * @returns {Number} The number of months as an integer value.
     */

    var str;

    //  have to start with a real duration
    if (TP.notValid(str = this.from(anObject))) {
        return this.raise('TP.sig.InvalidDuration');
    }

    return Date.getMonthsInDuration(str);
});

//  ------------------------------------------------------------------------

TP.xs.duration.Type.defineMethod('getSecondsInDuration',
function(anObject) {

    /**
     * @method getSecondsInDuration
     * @summary Returns the number of seconds represented by the TP.xs.duration
     *     provided. Note that the implementation does not use information other
     *     than the D, H, M, and S time components.
     * @param {TP.xs.duration} aDuration The duration to convert.
     * @returns {Number} The number of seconds as a decimal value.
     */

    var str;

    //  have to start with a real duration
    if (TP.notValid(str = this.from(anObject))) {
        return this.raise('TP.sig.InvalidDuration');
    }

    return Date.getSecondsInDuration(str);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
