//  ========================================================================
/*
NAME:   xs_boolean.js
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
 * @type {TP.xs.boolean}
 * @synopsis A boolean string representation. Valid XML Schema booleans are
 *     "true", "false", "0", and "1".
 */

//  ------------------------------------------------------------------------

TP.xs.anySimpleType.defineSubtype('boolean');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.boolean.Type.defineMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Returns true if the object provided represents a boolean in XML
     *     Schema format. Acceptable values are the strings true, false, 0, and
     *     1.
     * @param {String} anObject The object to validate.
     * @returns {Boolean} 
     */

    var str;

    str = TP.tostr(anObject);

    return TP.isTrue(str) ||
            (str === 'true') ||
            TP.isFalse(str) ||
            (str === 'false') ||
            (str === 0) ||
            (str === '0') ||
            (str === 1) ||
            (str === '1');
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

