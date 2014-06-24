//  ========================================================================
/*
NAME:   xs_NMTOKENS.js
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
 * @type {TP.xs.NMTOKENS}
 * @synopsis A string containing one or more space-separated NMTOKEN values.
 */

//  ------------------------------------------------------------------------

TP.xs.NMTOKEN.defineSubtype('NMTOKENS');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  the type each item is checked against to ensure validity of the list
TP.xs.NMTOKENS.Type.defineAttribute('itemType', 'TP.xs.NMTOKEN');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.NMTOKENS.Type.defineMethod('fromObject',
function(anObject) {

    /**
     * @name fromObject
     * @synopsis Creates a new instance from the object provided, if possible.
     *     For TP.xs.NMTOKENS the return value is a string value containing one
     *     or more TP.xs.NMTOKEN values, each separated by a single space. Any
     *     individual elements in the object's string representation which
     *     aren't valid NMTOKEN strings are removed in the final string.
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
    //  NMTOKEN replacement value
    arr = str.split(' ');
    arr.convert(
        function(item) {

            return item.as('TP.xs.NMTOKEN');
});

    //  trim out null values
    arr = arr.select(
        function(item) {

            return TP.isValid(item);
});

    //  if all converted then join back into an NMTOKENS string
    return arr.join(' ');
});

//  ------------------------------------------------------------------------

TP.xs.NMTOKENS.Type.defineMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Returns true if the object provided contains valid
     *     TP.xs.NMTOKEN entries separated by spaces.
     * @returns {Boolean} 
     */

    var parts,
        i;

    if (!TP.isString(anObject)) {
        return false;
    }

    //  a single token is also a "list"
    if (anObject.isa(this.get('itemType'))) {
        return true;
    }

    parts = anObject.split(' ');
    for (i = 0; i < parts.getSize(); i++) {
        if (!parts[i].isa(this.get('itemType'))) {
            return false;
        }
    }

    return true;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

