//  ========================================================================
/*
NAME:   xs_ENTITIES.js
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
 * @type {TP.xs.ENTITIES}
 * @synopsis A space-separated list of TP.xs.ENTITY values.
 */

//  ------------------------------------------------------------------------

TP.xs.ENTITY.defineSubtype('ENTITIES');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  the type each item is checked against to ensure validity of the list
TP.xs.ENTITIES.Type.defineAttribute('itemType', 'TP.xs.ENTITY');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.ENTITIES.Type.defineMethod('fromObject',
function(anObject) {

    /**
     * @name fromObject
     * @synopsis Creates a new instance from the object provided, if possible.
     *     For TP.xs.ENTITIES the return value is a string value containing one
     *     or more TP.xs.ENTITY values, each separated by a single space. Any
     *     individual elements in the object's string representation which
     *     aren't valid ENTITY strings are removed in the final string.
     * @param {Object} anObject The object to use as source data.
     * @returns {String} The string value.
     */

    var str,
        arr;

    //  first step is to get a normalized string from the source
    str = 'TP.xs.token'.asType().from(anObject);
    if (!TP.isString(str)) {
        //  unable to produce a rep
        return;
    }

    //  split on space and replace elements in the array inline with their
    //  IDREF replacement value
    arr = str.split(' ');
    arr.convert(
        function(item) {

            return item.as('TP.xs.ENTITY');
});

    //  trim out null values
    arr = arr.select(
        function(item) {

            return TP.isValid(item);
});

    //  if all converted then join back into an IDREFS string
    return arr.join(' ');
});

//  ------------------------------------------------------------------------

//  reuse the method for list-based validation of an itemType
TP.xs.ENTITIES.Type.defineMethod('validate',
                            'TP.xs.NMTOKENS'.asType().validate.copy());

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

