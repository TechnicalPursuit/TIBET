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
 * @type {TP.xs.boolean}
 * @summary A boolean string representation. Valid XML Schema booleans are
 *     "true", "false", "0", and "1".
 */

//  ------------------------------------------------------------------------

TP.xs.anySimpleType.defineSubtype('boolean');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.boolean.Type.defineMethod('validate',
function(anObject) {

    /**
     * @method validate
     * @summary Returns true if the object provided represents a boolean in XML
     *     Schema format. Acceptable values are the strings true, false, 0, and
     *     1.
     * @param {String} anObject The object to validate.
     * @returns {Boolean}
     */

    var str;

    str = TP.tostr(anObject);

    return TP.isTrue(str) ||
            (str === 'true') ||
            TP.isFalse(str) ||
            (str === 'false') ||
            (str === 0) ||
            (str === '0') ||
            (str === 1) ||
            (str === '1');
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
