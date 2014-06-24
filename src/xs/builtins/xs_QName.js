//  ========================================================================
/*
NAME:   xs_QName.js
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
 * @type {TP.xs.QName}
 * @synopsis A valid QName, a tuple (ordered pair) of the format: {TP.xs.anyURI,
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
     * @name fromObject
     * @synopsis Creates a new instance from the object provided, if possible. A
     *     QName pair (an Array) is returned when the inbound object represents
     *     a valid pair itself or can be used to acquire one.
     * @param {Object} anObject The object to use as source data.
     * @returns {Array} The QName pair in ordered pair form.
     * @todo
     */

    var pair,
                func;

    if (TP.notValid(anObject)) {
        return;
    }

    if (!TP.isPair(anObject)) {
        if (TP.isString(anObject)) {
            pair = anObject.split(' ');
        }

        if (TP.canInvoke(anObject, 'getPairs')) {
            func = function(item) {
                 // if we're not on the first iteration bail out
                 if (!func.atStart()) {
                     return TP.BREAK;
                 }

                 return true;
             };

            pair = anObject.getPairs(func).first();
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
     * @name validate
     * @synopsis Returns true if the object provided is a tuple (ordered pair in
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
        if ((str.first() !== '{') || (str.last() !== '}')) {
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

    return (('TP.xs.anyURI'.asType().validate(pair.first())) &&
            ('TP.xs.NCName'.asType().validate().pair.last()));
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

