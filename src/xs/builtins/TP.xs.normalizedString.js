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
 * @type {TP.xs.normalizedString}
 * @summary An TP.xs.normalizedString is an TP.xs.string in which any tabs
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
     * @method fromObject
     * @summary Creates a new instance from the object provided, if possible.
     *     For TP.xs.normalizedString the return value is the string value of
     *     the incoming object after calling replaceWhitespace() on it to remove
     *     tabs, CRs and LFs.
     * @param {Object} anObject The object to use as source data.
     * @returns {String|undefined} A valid TP.xs.normalizedString representation
     *     string.
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
     * @method validate
     * @summary Returns true if the object provided is a string containing
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
