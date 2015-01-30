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
 * @type {TP.xs.string}
 * @synopsis Root type for all string values. The TP.xs.string type does not
 *     constrain the value space of characters in any way.
 */

//  ------------------------------------------------------------------------

TP.xs.anySimpleType.defineSubtype('string');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.string.Type.defineMethod('fromObject',
function(anObject) {

    /**
     * @name fromObject
     * @synopsis Creates a new instance from the object provided, if possible.
     *     For TP.xs.string the return value is simply the string value of the
     *     incoming object.
     * @param {Object} anObject The object to use as source data.
     * @returns {String} The string value.
     */

    if (TP.isNull(anObject)) {
        return 'null';
    }

    if (TP.notDefined(anObject)) {
        return 'undefined';
    }

    if (TP.canInvoke(anObject, 'asString')) {
        return anObject.asString();
    } else if (TP.canInvoke(anObject, 'toString')) {
        return anObject.toString();
    } else if (TP.isNode(anObject)) {
        return TP.nodeAsString(anObject);
    }

    //  unable to return a valid rep
    return;
});

//  ------------------------------------------------------------------------

TP.xs.string.Type.defineMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Returns true if the object provided is a string. Note that
     *     since XML Schema defines string as simply any sequence of characters
     *     we choose to validate only true JavaScript string objects here.
     * @param {Object} anObject The object to test.
     * @returns {Boolean}
     */

    return TP.isString(anObject);
});

//  ------------------------------------------------------------------------

TP.xs.string.Type.defineMethod('validateFacetLength',
function(aValue, aFacet) {

    /**
     * @name validateFacetLength
     * @synopsis Tests the incoming value to make sure it is the specified
     *     length, as length is computed for the receiving type.
     * @param {Object} aValue The object to test.
     * @param {Element} aFacet The facet node being tested.
     * @returns {Boolean}
     */

    var inst,
        size;

    size = TP.elementGetAttribute(aFacet, 'value').asNumber();

    //  using fromObject gets us a properly formatted string representation
    //  of the receiver which can then use to test against
    inst = this.fromObject(aValue);
    if (TP.notValid(inst)) {
        return false;
    }

    return inst.getSize() === size;
});

//  ------------------------------------------------------------------------

TP.xs.string.Type.defineMethod('validateFacetMaxLength',
function(aValue, aFacet) {

    /**
     * @name validateFacetMaxLength
     * @synopsis Tests the incoming value to make sure it is less than the
     *     specified length, as computed for the receiving type.
     * @param {Object} aValue The object to test.
     * @param {Element} aFacet The facet node being tested.
     * @returns {Boolean}
     */

    var inst,
        size;

    size = TP.elementGetAttribute(aFacet, 'value').asNumber();

    //  using fromObject gets us a properly formatted string representation
    //  of the receiver which can then use to test against
    inst = this.fromObject(aValue);
    if (TP.notValid(inst)) {
        return false;
    }

    return inst.getSize() <= size;
});

//  ------------------------------------------------------------------------

TP.xs.string.Type.defineMethod('validateFacetMinLength',
function(aValue, aFacet) {

    /**
     * @name validateFacetMaxLength
     * @synopsis Tests the incoming value to make sure it is at least the
     *     specified length, as computed for the receiving type.
     * @param {Object} aValue The object to test.
     * @param {Element} aFacet The facet node being tested.
     * @returns {Boolean}
     */

    var inst,
        size;

    size = TP.elementGetAttribute(aFacet, 'value').asNumber();

    //  using fromObject gets us a properly formatted string representation
    //  of the receiver which can then use to test against
    inst = this.fromObject(aValue);
    if (TP.notValid(inst)) {
        return false;
    }

    return inst.getSize() >= size;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
