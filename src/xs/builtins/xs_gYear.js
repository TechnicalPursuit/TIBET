//  ========================================================================
/*
NAME:   xs_gYear.js
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
 * @type {TP.xs.gYear}
 * @synopsis A year specification with optional time zone data in the form
 *     [-]YYYY with optional additional year digits to handle larger years (this
 *     is true for all XML Schema year representations).
 * @todo
 */

//  ------------------------------------------------------------------------

TP.xs.anySimpleType.defineSubtype('gYear');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  a regex capable of validating the lexical format and splitting the
//  various segments out into a match result for further testing
TP.xs.gYear.Type.defineConstant('YEAR_REGEX',
    /^([-])*([0-9]{4,})(([Z\+\-]*)([0-9]{2})*[:]*([0-9]{2})*)$/);

//  indexes into the match result produced by the previous RegExp
TP.xs.gYear.Type.defineConstant('MINUS_INDEX', 1);
TP.xs.gYear.Type.defineConstant('YEAR_INDEX', 2);
TP.xs.gYear.Type.defineConstant('ZONE_INDEX', 3);

//  ------------------------------------------------------------------------

TP.xs.gYear.Type.defineMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Returns true if the object provided represents a valid year
     *     with optional timezone data.
     * @param {String} anObject The object to validate.
     * @returns {Boolean} 
     * @todo
     */

    var str,
        m,
        zi,
        year;

    if (!TP.isString(anObject)) {
        return false;
    }

    str = anObject;

    m = str.match(this.get('YEAR_REGEX'));
    if (TP.notValid(m)) {
        return false;
    }

    year = m.at(this.get('YEAR_INDEX'));
    if ((year.getSize() > 4) && year.startsWith('0')) {
        //  year can't start with 0 if longer than 4 digits
        return false;
    }
    year = parseInt(year, 10);

    if (TP.notEmpty(zi = m.at(this.get('ZONE_INDEX')))) {
        return TP.core.TimeZone.validate(zi);
    }

    //  made it through the gauntlet
    return true;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

