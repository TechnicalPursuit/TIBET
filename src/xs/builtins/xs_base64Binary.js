//  ========================================================================
/*
NAME:   xs_base64Binary.js
AUTH:   Scott Shattuck (ss)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.

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

