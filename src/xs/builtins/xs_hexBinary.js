//  ========================================================================
/*
NAME:   xs_hexBinary.js
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

