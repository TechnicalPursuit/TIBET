//  ========================================================================
/*
NAME:   TP.core.XMLSchemaType.js
AUTH:   William J. Edney (wje)
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
 * @type {TP.core.XMLSchemaType}
 * @synopsis The common supertype for all XML Schema-defined data types.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('xs:XMLSchemaType');

//  ------------------------------------------------------------------------

TP.xs.XMLSchemaType.Type.defineMethod('fromString',
function(aString, sourceLocale) {

    /**
     * @name fromString
     * @synopsis Returns a new instance from the string provided by processing
     *     the String into another type.
     * @description For XML Schema data types, we have no 'parsers' - but the
     *     types themselves take a String and convert it into an instance by
     *     calling fromObject(). Therefore we override this method and just call
     *     fromObject().
     * @param {String} aString The content string to parse.
     * @param {String|TP.core.Locale} sourceLocale A source xml:lang or
     *     TP.core.Locale defining the language the string is now in. Defaults
     *     to getTargetLanguage() which is based on the current locale's
     *     language-country value.
     * @returns {Object} An instance of the receiver, if parsing of the string
     *     is successful.
     * @todo
     */

    return this.fromObject(aString, sourceLocale);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
