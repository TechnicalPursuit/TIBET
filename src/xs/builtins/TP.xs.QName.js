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
 * @type {TP.xs.QName}
 * @summary A valid QName, a tuple (ordered pair) of the format: {TP.xs.anyURI,
 *     TP.xs.NCName}.
 */

//  ------------------------------------------------------------------------

TP.xs.anySimpleType.defineSubtype('QName');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.QName.Type.defineMethod('fromObject',
function(anObject) {

    /**
     * @method fromObject
     * @summary Creates a new instance from the object provided, if possible. A
     *     QName pair (an Array) is returned when the inbound object represents
     *     a valid pair itself or can be used to acquire one.
     * @param {Object} anObject The object to use as source data.
     * @returns {Array<String,String>} The QName pair in ordered pair form.
     */

    var pair,
        key;

    if (TP.notValid(anObject)) {
        return;
    }

    if (!TP.isPair(anObject)) {
        if (TP.isString(anObject)) {
            pair = anObject.split(' ');
        } else {
            key = TP.keys(anObject).first();
            pair = TP.ac(key, TP.objectValue(anObject, key));
        }
    }

    if (this.validate(pair)) {
        return pair;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.xs.QName.Type.defineMethod('validate',
function(anObject) {

    /**
     * @method validate
     * @summary Returns true if the object provided is a tuple (ordered pair in
     *     TIBET-speak) containing a valid TP.xs.anyURI and a valid
     *     TP.xs.NCName.
     * @param {String} anObject The object to validate.
     * @returns {Boolean}
     */

    var str,
        arr,
        pair;

    if (!TP.isString(anObject) && !TP.isPair(anObject)) {
        return false;
    }

    if (TP.isString(anObject)) {
        str = anObject.stripWhitespace();
        if (str.first() !== '{' || str.last() !== '}') {
            return false;
        }

        str = str.slice(1, -1);
        arr = str.split(',');

        if (arr.getSize() !== 2) {
            return false;
        }

        //  items will have been quoted
        if (arr.at(0).unquoted().isa('TP.xs.anyURI') &&
            arr.at(1).unquoted().isa('TP.xs.NCName')) {
            return true;
        } else {
            return false;
        }
    } else {
        pair = anObject;
    }

    /* eslint-disable no-extra-parens */
    return ('TP.xs.anyURI'.asType().validate(pair.first()) &&
            'TP.xs.NCName'.asType().validate().pair.last());
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.xs.QName.Type.defineMethod('validateFacetLength',
                            'TP.xs.string'.asType().validateFacetLength);

//  ------------------------------------------------------------------------

TP.xs.QName.Type.defineMethod('validateFacetMaxLength',
                            'TP.xs.string'.asType().validateFacetMaxLength);

//  ------------------------------------------------------------------------

TP.xs.QName.Type.defineMethod('validateFacetMinLength',
                            'TP.xs.string'.asType().validateFacetMinLength);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
