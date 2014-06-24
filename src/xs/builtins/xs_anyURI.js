//  ========================================================================
/*
NAME:   xs_anyURI.js
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
 * @type {TP.xs.anyURI}
 * @synopsis A standard URI string per the URI specification.
 */

//  ------------------------------------------------------------------------

TP.xs.anySimpleType.defineSubtype('anyURI');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.anyURI.Type.defineMethod('fromObject',
function(anObject) {

    /**
     * @name fromObject
     * @synopsis Creates a new instance from the object provided, if possible.
     *     This will be a URI string if the incoming data represents a string in
     *     proper URI format.
     * @param {Object} anObject The object to use as source data.
     * @returns {String} The string value.
     */

    var str;

    if (TP.notValid(anObject)) {
        return;
    }

    //  try to get it by asking :)
    if (TP.isMethod(anObject.getLocation)) {
        str = anObject.getLocation();
        if (this.validate(str)) {
            return str;
        }
    }

    //  try to build it from the object's string value
    str = 'TP.xs.string'.from(anObject);
    if (!TP.isString(str)) {
        //  couldn't build a string rep
        return;
    }

    //  appears to be a string...validate it...
    if (!this.validate(str)) {
        //  doesn't look like we got anything URI-like
        return;
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.xs.anyURI.Type.defineMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Returns true if the object provided represents a valid URI
     *     string.
     * @param {String} anObject The object to validate.
     * @returns {Boolean} 
     */

    if (!TP.isString(anObject)) {
        return false;
    }

    //  at least a scheme, colon, and scheme-specific part are checked here
    if (!/[^:]{1,}:[^:]{1,}/.test(anObject)) {
        return false;
    }

    return TP.isURI(TP.uc(anObject));
});

//  ------------------------------------------------------------------------

TP.xs.anyURI.Type.defineMethod('validateFacetLength',
                            'TP.xs.string'.asType().validateFacetLength);

//  ------------------------------------------------------------------------

TP.xs.anyURI.Type.defineMethod('validateFacetMaxLength',
                            'TP.xs.string'.asType().validateFacetMaxLength);

//  ------------------------------------------------------------------------

TP.xs.anyURI.Type.defineMethod('validateFacetMinLength',
                            'TP.xs.string'.asType().validateFacetMinLength);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

