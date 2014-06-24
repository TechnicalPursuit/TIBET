//  ========================================================================
/*
NAME:   xs_NCName.js
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
 * @type {TP.xs.NCName}
 * @synopsis A "non-colonized" Name, i.e. an TP.xs.Name with no colons.
 */

//  ------------------------------------------------------------------------

TP.xs.Name.defineSubtype('NCName');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.NCName.Type.defineMethod('fromObject',
function(anObject) {

    /**
     * @name fromObject
     * @synopsis Creates a new instance from the object provided, if possible.
     *     For TP.xs.NCName the return value is a string that is a valid
     *     TP.xs.Name with colons removed.
     * @param {Object} anObject The object to use as source data.
     * @returns {String} The string value.
     */

    var str;

    //  calling the supertype method will return a string value if possible
    str = this.callNextMethod();
    if (!TP.isString(str)) {
        //  couldn't build a rep
        return;
    }

    //  remove colons to make the result an NCName
    return str.strip(/:/g);
});

//  ------------------------------------------------------------------------

TP.xs.NCName.Type.defineMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Returns true if the object provided is a valid non-colonized
     *     name.
     * @returns {Boolean} 
     */

    //  this ensures it's a string of the valid format (but might have
    //  colons)
    if (!'TP.xs.Name'.asType().validate(anObject)) {
        return false;
    }

    //  check for colons
    return !TP.regex.HAS_COLON.test(anObject);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

