//  ========================================================================
/*
NAME:   xs_string.js
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
     * @todo
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
     * @todo
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
     * @todo
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

