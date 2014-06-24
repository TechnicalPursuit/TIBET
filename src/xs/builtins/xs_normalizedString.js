//  ========================================================================
/*
NAME:   xs_normalizedString.js
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
 * @type {TP.xs.normalizedString}
 * @synopsis An TP.xs.normalizedString is an TP.xs.string in which any tabs
 *     (\u0009), linefeeds (\u000A) and carriage returns (\u000D) have been
 *     replaced with spaces (\u0020).
 */

//  ------------------------------------------------------------------------

TP.xs.string.defineSubtype('normalizedString');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.normalizedString.Type.defineMethod('fromObject',
function(anObject) {

    /**
     * @name fromObject
     * @synopsis Creates a new instance from the object provided, if possible.
     *     For TP.xs.normalizedString the return value is the string value of
     *     the incoming object after calling replaceWhitespace() on it to remove
     *     tabs, CRs and LFs.
     * @param {Object} anObject The object to use as source data.
     * @returns {String} The string value.
     */

    var str;

    //  calling this on TP.xs.string will return a string if at all possible
    str = this.callNextMethod();

    if (!TP.isString(str)) {
        //  unable to produce a rep
        return;
    }

    //  normalized strings have tabs, crs, and lfs replaced with spaces
    return str.replaceWhitespace();
});

//  ------------------------------------------------------------------------

TP.xs.normalizedString.Type.defineMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Returns true if the object provided is a string containing
     *     normalized whitespace, i.e. whitespace which has been converted to
     *     spaces rather than tabs, newlines, etc.
     * @param {Object} anObject The object to test.
     * @returns {Boolean} 
     */

    //  same test as our supertype, has to be a string to start out with
    if (!TP.isString(anObject)) {
        return false;
    }

    //  is the string equal to the same string after whitespace replacement?
    //  if so then it's already in that form
    return anObject.equalTo(anObject.toString().replaceWhitespace());
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

