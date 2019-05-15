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
 * @type {tibet:email_list}
 * @summary A simple type containing a space, newline or comma separated list of
 *     email addresses.
 */

//  ------------------------------------------------------------------------

TP.xs.string.defineSubtype('tibet:email_list');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tibet.email_list.Type.defineMethod('validate',
function(anObject) {

    /**
     * @method validate
     * @summary Returns true if the object provided is a string containing a
     *     list of valid email addresses.
     * @param {Object} anObject The object to test.
     * @returns {Boolean}
     */

    var val,

        len,
        i;

    if (!TP.isString(anObject)) {
        return false;
    }

    val = anObject.split(/ \n,/);

    len = val.getSize();
    for (i = 0; i < len; i++) {
        if (!TP.xforms.email.validate(val.at(i))) {
            return false;
        }
    }

    return true;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
