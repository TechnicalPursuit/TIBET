//  ========================================================================
/*
NAME:   xs_float.js
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
 * @type {TP.xs.float}
 * @synopsis An IEEE-754 float value (a 32-bit single precision value).
 */

//  ------------------------------------------------------------------------

TP.xs.anySimpleType.defineSubtype('float');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.float.Type.defineMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Returns true if the object provided meets the criteria for a
     *     valid TP.xs.float, a number defined in optional scientific notation
     *     representing a 32-bit floating point number.
     * @param {String} anObject The object to validate.
     * @returns {Boolean} 
     * @todo
     */

    var n,
        s,
        arr;

    if (!TP.isString(anObject) && !TP.isNumber(anObject)) {
        return false;
    }

    //  certain strings are valid floats even though they're "not numbers"
    s = anObject.asString();
    if ((s === 'INF') ||
        (s === '-INF') ||
        (s === 'NaN')) {
        return true;
    }

    //  no whitespace allowed regardless of form
    if (/\s/.test(s)) {
        return false;
    }

    arr = s.toUpperCase().split('E');
    if (arr.getSize() > 1) {
        if (!arr.at(1).isa('TP.xs.integer')) {
            return false;
        }
    }

    try {
        if (!TP.isNumber(n = parseFloat(anObject))) {
            return false;
        }
    } catch (e) {
        return false;
    }

    //  roughly decimal value of +/-10 to the 38.53 power
    return n.isBetweenInclusive((10).pow(38.53) * -1, (10).pow(38.53));
});

//  ------------------------------------------------------------------------

TP.xs.float.Type.defineMethod(
                    'validateFacetEnumeration',
                    'TP.xs.decimal'.asType().validateFacetEnumeration);

//  ------------------------------------------------------------------------

TP.xs.float.Type.defineMethod(
                    'validateFacetMaxExclusive',
                    'TP.xs.decimal'.asType().validateFacetMaxExclusive);

//  ------------------------------------------------------------------------

TP.xs.float.Type.defineMethod(
                    'validateFacetMaxInclusive',
                    'TP.xs.decimal'.asType().validateFacetMaxInclusive);

//  ------------------------------------------------------------------------

TP.xs.float.Type.defineMethod(
                    'validateFacetMinExclusive',
                    'TP.xs.decimal'.asType().validateFacetMinExclusive);

//  ------------------------------------------------------------------------

TP.xs.float.Type.defineMethod(
                    'validateFacetMinInclusive',
                    'TP.xs.decimal'.asType().validateFacetMinInclusive);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

