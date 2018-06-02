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
 * @type {TP.xs.NCName}
 * @summary A "non-colonized" Name, i.e. an TP.xs.Name with no colons.
 */

//  ------------------------------------------------------------------------

TP.xs.Name.defineSubtype('NCName');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.NCName.Type.defineMethod('fromObject',
function(anObject) {

    /**
     * @method fromObject
     * @summary Creates a new instance from the object provided, if possible.
     *     For TP.xs.NCName the return value is a string that is a valid
     *     TP.xs.Name with colons removed.
     * @param {Object} anObject The object to use as source data.
     * @returns {String|undefined} A valid TP.xs.NCName representation string.
     */

    var str;

    //  calling the supertype method will return a string value if possible
    str = this.callNextMethod();
    if (!TP.isString(str)) {
        //  couldn't build a rep
        return;
    }

    //  remove colons to make the result an NCName
    return str.strip(/:/g);
});

//  ------------------------------------------------------------------------

TP.xs.NCName.Type.defineMethod('validate',
function(anObject) {

    /**
     * @method validate
     * @summary Returns true if the object provided is a valid non-colonized
     *     name.
     * @returns {Boolean}
     */

    //  this ensures it's a string of the valid format (but might have
    //  colons)
    if (!'TP.xs.Name'.asType().validate(anObject)) {
        return false;
    }

    //  check for colons
    return !TP.regex.HAS_COLON.test(anObject);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
