//  ========================================================================
/*
NAME:   xs_language.js
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
 * @type {TP.xs.language}
 * @synopsis An XML Schema language code. The values for this type are not
 *     currently validated, however the lexical format of an RFC3066 string is
 *     checked.
 */

//  ------------------------------------------------------------------------

TP.xs.token.defineSubtype('language');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.language.Type.defineMethod('fromObject',
function(anObject) {

    /**
     * @name fromObject
     * @synopsis Creates a new instance from the object provided, if possible.
     *     For TP.xs.language an attempt is made to acquire the string value of
     *     the object which is then checked for conformance to the
     *     TP.xs.language format rules. If the value would appear to be a valid
     *     TP.xs.language string it is returned.
     * @param {Object} anObject The object to use as source data.
     * @raises TP.sig.InvalidOperation
     */

    var str;

    str = 'TP.xs.token'.asType().from(anObject);
    if (TP.notValid(str)) {
        //  unable to produce a rep
        return;
    }

    //  remove any remaining spaces and see if what we have left would be a
    //  valid language code
    str = str.stripWhitespace();
    if (!this.validate(str)) {
        //  unable to produce a valid rep
        return;
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.xs.language.Type.defineMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Returns true if the object provided is a string containing a
     *     valid RFC 3066 language code formatted string. Note that no specific
     *     checks are currently done to confirm that the value exists as a
     *     registered language code.
     * @param {Object} anObject The object to test.
     * @returns {Boolean} 
     */

    if (!TP.isString(anObject)) {
        return false;
    }

    //  the following pattern is drawn from RFC 3066 and the XML Schema
    //  specification for TP.xs.language
    return (/^[a-zA-Z]{1,8}(-[a-zA-Z0-9]{1,8})*$/).test(anObject);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

