//  ========================================================================
/*
NAME:   xs_NOTATION.js
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
 * @type {TP.xs.NOTATION}
 * @synopsis A valid NOTATION attribute as defined in XML 1.0. Currently not
 *     supported in any form.
 */

//  ------------------------------------------------------------------------

TP.xs.anySimpleType.defineSubtype('NOTATION');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.NOTATION.Type.defineMethod('fromObject',
function(anObject) {

    /**
     * @name fromObject
     * @synopsis Constructs a new instance from the object provided, if
     *     possible. For TP.xs.NOTATION this method raises an exception since
     *     you can't construct a NOTATION in this fashion.
     * @param {Object} anObject The object to use as source data.
     */

    //  no NOTATION construction methods exist at the moment
    return;
});

//  ------------------------------------------------------------------------

TP.xs.NOTATION.Type.defineMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Returns true if the object provided is a valid TP.xs.NOTATION.
     *     This check is currently unimplemented and always returns false.
     * @param {String} anObject The object to validate.
     * @returns {Boolean} 
     */

    return false;
});

//  ------------------------------------------------------------------------

TP.xs.NOTATION.Type.defineMethod('validateFacetLength',
                            'TP.xs.string'.asType().validateFacetLength);

//  ------------------------------------------------------------------------

TP.xs.NOTATION.Type.defineMethod('validateFacetMaxLength',
                            'TP.xs.string'.asType().validateFacetMaxLength);

//  ------------------------------------------------------------------------

TP.xs.NOTATION.Type.defineMethod('validateFacetMinLength',
                            'TP.xs.string'.asType().validateFacetMinLength);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

