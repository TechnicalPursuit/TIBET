//  ========================================================================
/*
NAME:   xforms_email.js
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
 * @type {xforms:email}
 * @synopsis A simple email type based on the XForms 1.1 draft standard.
 */

//  ------------------------------------------------------------------------

TP.xs.string.defineSubtype('xforms:email');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xforms.email.Type.defineMethod('fromObject',
function(anObject) {

    /**
     * @name fromObject
     * @synopsis Creates a new instance from the object provided, if possible.
     * @param {Object} anObject The object to use as source data.
     * @raises TP.sig.InvalidOperation
     */

    var str;

    str = 'TP.xs.string'.asType().from(anObject);
    if (TP.notValid(str)) {
        //  unable to produce a rep
        return;
    }

    //  remove any remaining spaces and see if what we have left would be a
    //  valid email address
    str = str.stripWhitespace();
    if (!this.validate(str)) {
        //  unable to produce a valid rep
        return;
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.xforms.email.Type.defineMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Returns true if the object provided is a string containing a
     *     valid email address string as defined by the XForms 1.1 draft
     *     specification's XML Schema for the Email data type.
     * @param {Object} anObject The object to test.
     * @returns {Boolean} 
     */

    if (!TP.isString(anObject)) {
        return false;
    }

    //  the pattern here is from the XForms 1.1 draft
    return (/[A-Za-z0-9!#-'\*\+\-\/=\?\^_`\{-~]+(\.[A-Za-z0-9!#-'\*\+\-\/=\?\^_`\{-~ ]+)*@[A-Za-z0-9!#-'\*\+\-\/=\?\^_`\{-~]+(\.[A-Za-z0-9!#-'\*\+\-\/=\?\^_`\{-~]+)*/).test(anObject);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

