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
 * @type {xforms:email}
 * @summary A simple email type based on the XForms 1.1 draft standard.
 */

//  ------------------------------------------------------------------------

TP.xs.string.defineSubtype('xforms:email');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xforms.email.Type.defineMethod('fromObject',
function(anObject) {

    /**
     * @method fromObject
     * @summary Creates a new instance from the object provided, if possible.
     * @param {Object} anObject The object to use as source data.
     * @exception TP.sig.InvalidOperation
     * @returns {String|undefined} A valid TP.xforms.email representation
     *     string.
     */

    var str;

    str = 'TP.xs.string'.asType().from(anObject);
    if (TP.notValid(str)) {
        //  unable to produce a rep
        return;
    }

    //  remove any remaining spaces and see if what we have left would be a
    //  valid email address
    str = str.stripWhitespace();
    if (!this.validate(str)) {
        //  unable to produce a valid rep
        return;
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.xforms.email.Type.defineMethod('validate',
function(anObject) {

    /**
     * @method validate
     * @summary Returns true if the object provided is a string containing a
     *     valid email address string as defined by the XForms 1.1 draft
     *     specification's XML Schema for the Email data type.
     * @param {Object} anObject The object to test.
     * @returns {Boolean}
     */

    if (!TP.isString(anObject)) {
        return false;
    }

    //  the pattern here is from the XForms 1.1 draft
    return (/[A-Za-z0-9!#-'\*\+\-\/=\?\^_`\{-~]+(\.[A-Za-z0-9!#-'\*\+\-\/=\?\^_`\{-~ ]+)*@[A-Za-z0-9!#-'\*\+\-\/=\?\^_`\{-~]+(\.[A-Za-z0-9!#-'\*\+\-\/=\?\^_`\{-~]+)*/).test(anObject);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
