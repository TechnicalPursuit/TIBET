//  ========================================================================
/*
NAME:   xs_Name.js
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
 * @type {TP.xs.Name}
 * @synopsis A valid XML 1.0 Second Edition Name value.
 */

//  ------------------------------------------------------------------------

TP.xs.token.defineSubtype('Name');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  a regex suitable for matching Name values using the proper Unicode
//  constants.
TP.xs.Name.Type.defineConstant(
    'NAME_REGEX',
    TP.rc('^(' + TP.core.Unicode.Letter + '|_|:)(' + TP.core.Unicode.NameChar + ')*$'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.Name.Type.defineMethod('fromObject',
function(anObject) {

    /**
     * @name fromObject
     * @synopsis Creates a new instance from the object provided, if possible.
     *     For TP.xs.Name the return value is a string that must meet the
     *     TP.xs.Name validation rules meaning it must start with a Unicode
     *     Letter, an underscore, or a colon. Remaining character values may be
     *     any valid Unicode NameChar.
     * @param {Object} anObject The object to use as source data.
     * @returns {String} The string value.
     */

    var str;

    //  TP.xs.NMTOKEN values are essentially valid names so start there...
    str = 'TP.xs.NMTOKEN'.asType().from(anObject);
    if (!TP.isString(str)) {
        //  unable to produce a rep
        return;
    }

    //  remove any leading non-name characters...
    str = str.strip(/^\./);
    str = str.strip(
                TP.rc('^[' + TP.core.Unicode.Extender + '|' +
                                    TP.core.Unicode.CombiningChar + '|' +
                                    TP.core.Unicode.Digit +
                                ']'));

    if (!this.validate(str)) {
        //  unable to produce a valid name rep
        return;
    }

    //  if the result string is a valid TP.xs.Name then return it
    return str;
});

//  ------------------------------------------------------------------------

TP.xs.Name.Type.defineMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Returns true if the object provided contains a valid Name in
     *     conformance to the XML 1.0 Second Edition spec.
     * @returns {Boolean} 
     */

    if (!TP.isString(anObject)) {
        return false;
    }

    return this.get('NAME_REGEX').test(anObject);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

