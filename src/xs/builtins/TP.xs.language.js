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
 * @type {TP.xs.language}
 * @summary An XML Schema language code. The values for this type are not
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
     * @method fromObject
     * @summary Creates a new instance from the object provided, if possible.
     *     For TP.xs.language an attempt is made to acquire the string value of
     *     the object which is then checked for conformance to the
     *     TP.xs.language format rules. If the value would appear to be a valid
     *     TP.xs.language string it is returned.
     * @param {Object} anObject The object to use as source data.
     * @exception TP.sig.InvalidOperation
     * @returns {String|undefined} A valid TP.xs.language representation string.
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
     * @method validate
     * @summary Returns true if the object provided is a string containing a
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
