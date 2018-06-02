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
 * @type {TP.xs.anyURI}
 * @summary A standard URI string per the URI specification.
 */

//  ------------------------------------------------------------------------

TP.xs.anySimpleType.defineSubtype('anyURI');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.anyURI.Type.defineMethod('fromObject',
function(anObject) {

    /**
     * @method fromObject
     * @summary Creates a new instance from the object provided, if possible.
     *     This will be a URI string if the incoming data represents a string in
     *     proper URI format.
     * @param {Object} anObject The object to use as source data.
     * @returns {String|undefined} A valid TP.xs.anyUR representation string.
     */

    var str;

    if (TP.notValid(anObject)) {
        return;
    }

    //  try to get it by asking :)
    if (TP.isMethod(anObject.getLocation)) {
        str = anObject.getLocation();
        if (this.validate(str)) {
            return str;
        }
    }

    //  try to build it from the object's string value
    str = 'TP.xs.string'.from(anObject);
    if (!TP.isString(str)) {
        //  couldn't build a string rep
        return;
    }

    //  appears to be a string...validate it...
    if (!this.validate(str)) {
        //  doesn't look like we got anything URI-like
        return;
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.xs.anyURI.Type.defineMethod('validate',
function(anObject) {

    /**
     * @method validate
     * @summary Returns true if the object provided represents a valid URI
     *     string.
     * @param {String} anObject The object to validate.
     * @returns {Boolean}
     */

    if (!TP.isString(anObject)) {
        return false;
    }

    //  at least a scheme, colon, and scheme-specific part are checked here
    if (!/[^:]{1,}:[^:]{1,}/.test(anObject)) {
        return false;
    }

    return TP.isURI(TP.uc(anObject));
});

//  ------------------------------------------------------------------------

TP.xs.anyURI.Type.defineMethod('validateFacetLength',
                            'TP.xs.string'.asType().validateFacetLength);

//  ------------------------------------------------------------------------

TP.xs.anyURI.Type.defineMethod('validateFacetMaxLength',
                            'TP.xs.string'.asType().validateFacetMaxLength);

//  ------------------------------------------------------------------------

TP.xs.anyURI.Type.defineMethod('validateFacetMinLength',
                            'TP.xs.string'.asType().validateFacetMinLength);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
