//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/**
 * @type {TP.xs.token}
 * @summary An TP.xs.token is an TP.xs.normalizedString in which any sequences
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
     * @method fromObject
     * @summary Creates a new instance from the object provided, if possible.
     *     For TP.xs.token the return value is simply the string value of the
     *     incoming object after calling replaceWhitespace() on it to remove
     *     tabs, CRs and LFs and then collapseWhitespace() to remove
     *     leading/trailing spaces and to shorten spans of multiple spaces to
     *     single spaces.
     * @param {Object} anObject The object to use as source data.
     * @returns {String|undefined} A valid TP.xs.token representation string.
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
     * @method validate
     * @summary Returns true if the object provided is a string containing
     *     tokenized whitespace, i.e. whitespace which has been converted to
     *     spaces rather than tabs, newlines, etc. and condensed into
     *     single-space elements only.
     * @param {Object} anObject The object to test.
     * @returns {Boolean} Whether or not the object is a String containing a
     *     valid tokenized whitespace.
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
