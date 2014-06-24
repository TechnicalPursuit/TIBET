//  ========================================================================
/*
NAME:   xs_NMTOKEN.js
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
 * @type {TP.xs.NMTOKEN}
 * @synopsis Represents a NMTOKEN from the XML 1.0 Second Edition spec. Roughly
 *     speaking this is a string with no commas or quotes allowed although the
 *     actual spec is based on Unicode 2.0 character classes. See the
 *     TP.core.Unicode type for more information.
 */

//  ------------------------------------------------------------------------

TP.xs.token.defineSubtype('NMTOKEN');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  a regex suitable for matching NMTOKEN values
TP.xs.NMTOKEN.Type.defineConstant('NMTOKEN_REGEX',
                                TP.rc('^(' + TP.core.Unicode.NameChar + ')+$'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.NMTOKEN.Type.defineMethod('fromObject',
function(anObject) {

    /**
     * @name fromObject
     * @synopsis Creates a new instance from the object provided, if possible.
     *     For TP.xs.NMTOKEN the return value is the string value of the
     *     incoming object after calling replace() on it to remove characters
     *     not in the Unicode NameChar spec.
     * @param {Object} anObject The object to use as source data.
     * @returns {String} The string value.
     */

    var str;

    //  calling the supertype method will return a string value if possible
    str = this.callNextMethod();
    if (!TP.isString(str)) {
        //  unable to produce a rep
        return;
    }

    //  TODO:   replace this with a more robust version based on NameChar
    return str.strip(/[,"]/g);
});

//  ------------------------------------------------------------------------

TP.xs.NMTOKEN.Type.defineMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Returns true if the object provided is a string matching the
     *     NMTOKEN construction rules for XML 1.0 Second Edition.
     * @returns {Boolean} 
     */

    if (!TP.isString(anObject)) {
        return false;
    }

    return this.get('NMTOKEN_REGEX').test(anObject);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

