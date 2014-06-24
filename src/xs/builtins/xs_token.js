//  ========================================================================
/*
NAME:   xs_token.js
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
 * @type {TP.xs.token}
 * @synopsis An TP.xs.token is an TP.xs.normalizedString in which any sequences
 *     of spaces (\u0020) have been reduced to single spaces and any leading or
 *     trailing spaces have been removed.
 */

//  ------------------------------------------------------------------------

TP.xs.normalizedString.defineSubtype('token');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.token.Type.defineMethod('fromObject',
function(anObject) {

    /**
     * @name fromObject
     * @synopsis Creates a new instance from the object provided, if possible.
     *     For TP.xs.token the return value is simply the string value of the
     *     incoming object after calling replaceWhitespace() on it to remove
     *     tabs, CRs and LFs and then collapseWhitespace() to remove
     *     leading/trailing spaces and to shorten spans of multiple spaces to
     *     single spaces.
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

    //  should have gotten a normalized string from parent call, now just
    //  collapse any whitespace left
    return str.collapseWhitespace();
});

//  ------------------------------------------------------------------------

TP.xs.token.Type.defineMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Returns true if the object provided is a string containing
     *     tokenized whitespace, i.e. whitespace which has been converted to
     *     spaces rather than tabs, newlines, etc. and condensed into
     *     single-space elements only.
     * @param {Object} anObject The object to test.
     * @returns {Boolean} 
     */

    if (!TP.isString(anObject)) {
        return false;
    }

    //  if the string value is equal to the tokenized version then it must
    //  already be in tokenized form
    return anObject.equalTo(anObject.toString().tokenizeWhitespace());
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

