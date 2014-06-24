//  ========================================================================
/*
NAME:   xs_gMonth.js
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
 * @type {TP.xs.gMonth}
 * @synopsis A month specification with optional time zone data in the format of
 *     --MM[timezone].
 * @todo
 */

//  ------------------------------------------------------------------------

TP.xs.anySimpleType.defineSubtype('gMonth');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  a regex capable of validating the lexical format and splitting the
//  various segments out into a match result for further testing
TP.xs.gMonth.Type.defineConstant('MONTH_REGEX',
            /^--([0-9]{2})(([Z\+\-]*)([0-9]{2})*[:]*([0-9]{2})*)$/);

//  indexes into the match result produced by the previous RegExp
TP.xs.gMonth.Type.defineConstant('MONTH_INDEX', 1);
TP.xs.gMonth.Type.defineConstant('ZONE_INDEX', 2);

//  ------------------------------------------------------------------------

TP.xs.gMonth.Type.defineMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Returns true if the object provided represents a valid XML
     *     Schema month specification.
     * @param {String} anObject The object to validate.
     * @returns {Boolean} 
     */

    var str,
        m,
        zi,
        month;

    if (!TP.isString(anObject)) {
        return false;
    }

    str = anObject;

    m = str.match(this.get('MONTH_REGEX'));
    if (TP.notValid(m)) {
        return false;
    }

    month = parseInt(m.at(this.get('MONTH_INDEX')), 10);

    //  month can't be 0, or greater than 12
    if (!month.isBetweenInclusive(1, 12)) {
        return false;
    }

    if (TP.notEmpty(zi = m.at(this.get('ZONE_INDEX')))) {
        return TP.core.TimeZone.validate(zi);
    }

    //  made it through the gauntlet
    return true;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

