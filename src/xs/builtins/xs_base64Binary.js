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
 * @type {TP.xs.base64Binary}
 * @synopsis A base64 encoded string value. Note that this implementation
 *     matches the TP.atob() and TP.btoa() function input/output format which
 *     does not include spaces as a requirement of a valid base64 encoded
 *     string.
 */

//  ------------------------------------------------------------------------

TP.xs.anySimpleType.defineSubtype('base64Binary');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  a regex which matches the lexical character values of a base64 string
TP.xs.base64Binary.Type.defineConstant('BASE64_REGEX',
                /^[0-9a-zA-Z\+\/\u0009\u000A\u000D\u0020]+[\=]*$/);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.base64Binary.Type.defineMethod('fromObject',
function(anObject) {

    /**
     * @name fromObject
     * @synopsis Returns a base64 encoded string representing the incoming
     *     object.
     * @param {Object} anObject The object to encode.
     * @returns {String} A valid base64-encoded string.
     */

    var s;

    if (TP.notValid(anObject)) {
        return;
    }

    if (TP.canInvoke(anObject, 'asString')) {
        s = anObject.asString();
    } else if (TP.canInvoke(anObject, 'toString')) {
        s = anObject.toString();
    } else if (TP.isNode(anObject)) {
        s = TP.nodeAsString(anObject);
    } else {
        return;
    }

    return TP.btoa(s);
});

//  ------------------------------------------------------------------------

TP.xs.base64Binary.Type.defineMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Returns true if the object provided contains a string matching
     *     the restricted character set of a base64 encoded string.
     * @param {String} anObject The object to validate.
     * @returns {Boolean}
     */

    if (!TP.isString(anObject)) {
        return false;
    }

    return this.get('BASE64_REGEX').test(anObject) &&
            anObject.getSize().isEven();
});

//  ------------------------------------------------------------------------

TP.xs.base64Binary.Type.defineMethod(
                        'validateFacetLength',
                        'TP.xs.string'.asType().validateFacetLength);

//  ------------------------------------------------------------------------

TP.xs.base64Binary.Type.defineMethod(
                        'validateFacetMaxLength',
                        'TP.xs.string'.asType().validateFacetMaxLength);

//  ------------------------------------------------------------------------

TP.xs.base64Binary.Type.defineMethod(
                        'validateFacetMinLength',
                        'TP.xs.string'.asType().validateFacetMinLength);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
