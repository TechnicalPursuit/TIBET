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
 * @type {TP.xs.NMTOKEN}
 * @summary Represents a NMTOKEN from the XML 1.0 Second Edition spec. Roughly
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
     * @method fromObject
     * @summary Creates a new instance from the object provided, if possible.
     *     For TP.xs.NMTOKEN the return value is the string value of the
     *     incoming object after calling replace() on it to remove characters
     *     not in the Unicode NameChar spec.
     * @param {Object} anObject The object to use as source data.
     * @returns {String|undefined} A valid TP.xs.NMTOKEN representation string.
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
     * @method validate
     * @summary Returns true if the object provided is a string matching the
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
