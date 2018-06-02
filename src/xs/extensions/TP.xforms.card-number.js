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
 * @type {xforms:card_number}
 * @summary A simple ID card type based on the XForms 1.1 draft standard.
 */

//  ------------------------------------------------------------------------

TP.xs.string.defineSubtype('xforms:card_number');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xforms.card_number.Type.defineMethod('fromObject',
function(anObject) {

    /**
     * @method fromObject
     * @summary Creates a new instance from the object provided.
     * @param {Object} anObject The object to use as source data.
     * @returns {String|undefined} A valid TP.xforms.card_number representation
     *     string.
     */

    var str;

    str = 'TP.xs.string'.asType().from(anObject);
    if (TP.notValid(str)) {
        //  unable to produce a rep
        return;
    }

    //  remove any remaining spaces and see if what we have left would be a
    //  valid instance
    str = str.stripWhitespace();
    if (!this.validate(str)) {
        //  unable to produce a valid rep
        return;
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.xforms.card_number.Type.defineMethod('validate',
function(anObject) {

    /**
     * @method validate
     * @summary Returns true if the object provided is a string containing a
     *     valid ID-card_number as defined by the XForms 1.1 draft
     *     specification's XML Schema for that data type.
     * @param {Object} anObject The object to test.
     * @returns {Boolean} Whether or not the object is a String containing a
     *     valid ID-card_number.
     */

    if (!TP.isString(anObject)) {
        return false;
    }

    if (anObject.getSize() < 12 || anObject.getSize() > 19) {
        return false;
    }

    //  the pattern here is from the XForms 1.1 draft
    return (/[0-9]+/).test(anObject);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
