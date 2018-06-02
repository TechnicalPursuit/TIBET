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
 * @type {TP.xs.IDREFS}
 * @summary A space-separated string of TP.xs.IDREF values.
 */

//  ------------------------------------------------------------------------

TP.xs.IDREF.defineSubtype('IDREFS');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  the type each item is checked against to ensure validity of the list
TP.xs.IDREFS.Type.defineAttribute('itemType', 'TP.xs.IDREF');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.IDREFS.Type.defineMethod('fromObject',
function(anObject) {

    /**
     * @method fromObject
     * @summary Creates a new instance from the object provided, if possible.
     *     For TP.xs.IDREFS the return value is a string value containing one or
     *     more TP.xs.IDREF values, each separated by a single space. Any
     *     individual elements in the object's string representation which
     *     aren't valid IDREF strings are removed in the final string.
     * @param {Object} anObject The object to use as source data.
     * @returns {String|undefined} A valid TP.xs.IDREFS representation string.
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
    //  IDREF replacement value
    arr = str.split(' ');
    arr.convert(
        function(item) {

            return item.as('TP.xs.IDREF');
        });

    //  trim out null values
    arr = arr.select(
        function(item) {

            return TP.isValid(item);
        });

    //  if all converted then join back into an IDREFS string
    return arr.join(' ');
});

//  ------------------------------------------------------------------------

//  reuse the method for list-based validation of an itemType
TP.xs.IDREFS.Type.defineMethod('validate',
                            'TP.xs.NMTOKENS'.asType().validate.copy());

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
