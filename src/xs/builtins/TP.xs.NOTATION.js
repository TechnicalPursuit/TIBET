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
 * @type {TP.xs.NOTATION}
 * @summary A valid NOTATION attribute as defined in XML 1.0. Currently not
 *     supported in any form.
 */

//  ------------------------------------------------------------------------

TP.xs.anySimpleType.defineSubtype('NOTATION');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.NOTATION.Type.defineMethod('fromObject',
function(anObject) {

    /**
     * @method fromObject
     * @summary Constructs a new instance from the object provided, if
     *     possible. For TP.xs.NOTATION this method raises an exception since
     *     you can't construct a NOTATION in this fashion.
     * @param {Object} anObject The object to use as source data.
     * @returns {String|undefined} A valid TP.xs.NOTATION representation string.
     */

    //  no NOTATION construction methods exist at the moment
    return;
});

//  ------------------------------------------------------------------------

TP.xs.NOTATION.Type.defineMethod('validate',
function(anObject) {

    /**
     * @method validate
     * @summary Returns true if the object provided is a valid TP.xs.NOTATION.
     *     This check is currently unimplemented and always returns false.
     * @param {String} anObject The object to validate.
     * @returns {Boolean}
     */

    return false;
});

//  ------------------------------------------------------------------------

TP.xs.NOTATION.Type.defineMethod('validateFacetLength',
                            'TP.xs.string'.asType().validateFacetLength);

//  ------------------------------------------------------------------------

TP.xs.NOTATION.Type.defineMethod('validateFacetMaxLength',
                            'TP.xs.string'.asType().validateFacetMaxLength);

//  ------------------------------------------------------------------------

TP.xs.NOTATION.Type.defineMethod('validateFacetMinLength',
                            'TP.xs.string'.asType().validateFacetMinLength);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
