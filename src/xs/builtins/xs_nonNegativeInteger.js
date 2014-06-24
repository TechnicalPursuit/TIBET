//  ========================================================================
/*
NAME:   xs_nonNegativeInteger.js
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
 * @type {TP.xs.nonNegativeInteger}
 * @synopsis An integer whose value is positive or zero.
 */

//  ------------------------------------------------------------------------

TP.xs.integer.defineSubtype('nonNegativeInteger');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.nonNegativeInteger.Type.defineMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Returns true if the object provided is a number greater than or
     *     equal to zero.
     * @param {String} anObject The object to validate.
     * @returns {Boolean} 
     */

    var n;

    if (!'TP.xs.integer'.asType().validate(anObject)) {
        return false;
    }

    try {
        if (!TP.isNumber(n = parseInt(anObject, 10))) {
            return false;
        }
    } catch (e) {
        return false;
    }

    return n >= 0;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

