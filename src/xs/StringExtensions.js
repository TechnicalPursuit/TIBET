//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  String Extensions
//  ------------------------------------------------------------------------

String.Inst.defineMethod('validate',
function(anObject) {

    /**
     * @method validate
     * @summary Tests the incoming value to see if it represents a valid
     *     instance of 'anyType'.
     * @description The XML Schema specification has no canonical definition for
     *     this type's value space but to support usage for type validation we
     *     define it to exclude null and undefined.
     * @param {Object} anObject The object to test.
     * @returns {Boolean}
     */

    var type;

    if (TP.isType(type = this.asType())) {
        return type.validate(anObject);
    }

    return false;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
