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
 * @type {TP.xs.Name}
 * @summary A valid XML 1.0 Second Edition Name value.
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
     * @method fromObject
     * @summary Creates a new instance from the object provided, if possible.
     *     For TP.xs.Name the return value is a string that must meet the
     *     TP.xs.Name validation rules meaning it must start with a Unicode
     *     Letter, an underscore, or a colon. Remaining character values may be
     *     any valid Unicode NameChar.
     * @param {Object} anObject The object to use as source data.
     * @returns {String|undefined} A valid TP.xs.name representation string.
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
     * @method validate
     * @summary Returns true if the object provided contains a valid Name in
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
