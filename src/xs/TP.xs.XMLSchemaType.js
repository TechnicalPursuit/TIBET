//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------


/**
 * @type {TP.core.XMLSchemaType}
 * @summary The common supertype for all XML Schema-defined data types.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('xs.XMLSchemaType');

//  ------------------------------------------------------------------------

TP.xs.XMLSchemaType.Type.defineMethod('fromString',
function(aString, sourceLocale) {

    /**
     * @method fromString
     * @summary Returns a new instance from the string provided by processing
     *     the String into another type.
     * @description For XML Schema data types, we have no 'parsers' - but the
     *     types themselves take a String and convert it into an instance by
     *     calling fromObject(). Therefore we override this method and just call
     *     fromObject().
     * @param {String} aString The content string to parse.
     * @param {String|TP.i18n.Locale} sourceLocale A source xml:lang or
     *     TP.i18n.Locale defining the language the string is now in. Defaults
     *     to getTargetLanguage() which is based on the current locale's
     *     language-country value.
     * @returns {Object} An instance of the receiver, if parsing of the string
     *     is successful.
     */

    return this.fromObject(aString, sourceLocale);
});

//  ------------------------------------------------------------------------

TP.xs.XMLSchemaType.Type.defineMethod('validate',
function(anObject) {

    /**
     * @method validate
     * @summary Returns true if the object provided it meets all of the
     *     criteria supplied in this type.
     * @param {Object} aValue The object to validate.
     * @returns {Boolean} True if the object validates against the receiver.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
