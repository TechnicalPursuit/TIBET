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
 * @type {TP.xs.NMTOKENS}
 * @summary A string containing one or more space-separated NMTOKEN values.
 */

//  ------------------------------------------------------------------------

TP.xs.NMTOKEN.defineSubtype('NMTOKENS');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  the type each item is checked against to ensure validity of the list
TP.xs.NMTOKENS.Type.defineAttribute('itemType', 'TP.xs.NMTOKEN');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.NMTOKENS.Type.defineMethod('fromObject',
function(anObject) {

    /**
     * @method fromObject
     * @summary Creates a new instance from the object provided, if possible.
     *     For TP.xs.NMTOKENS the return value is a string value containing one
     *     or more TP.xs.NMTOKEN values, each separated by a single space. Any
     *     individual elements in the object's string representation which
     *     aren't valid NMTOKEN strings are removed in the final string.
     * @param {Object} anObject The object to use as source data.
     * @returns {String|undefined} A valid TP.xs.NMTOKENS representation string.
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
    //  NMTOKEN replacement value
    arr = str.split(' ');
    arr.convert(
        function(item) {

            return item.as('TP.xs.NMTOKEN');
        });

    //  trim out null values
    arr = arr.select(
        function(item) {

            return TP.isValid(item);
        });

    //  if all converted then join back into an NMTOKENS string
    return arr.join(' ');
});

//  ------------------------------------------------------------------------

TP.xs.NMTOKENS.Type.defineMethod('validate',
function(anObject) {

    /**
     * @method validate
     * @summary Returns true if the object provided contains valid
     *     TP.xs.NMTOKEN entries separated by spaces.
     * @returns {Boolean}
     */

    var parts,
        i;

    if (!TP.isString(anObject)) {
        return false;
    }

    //  a single token is also a "list"
    if (anObject.isa(this.get('itemType'))) {
        return true;
    }

    parts = anObject.split(' ');
    for (i = 0; i < parts.getSize(); i++) {
        if (!parts[i].isa(this.get('itemType'))) {
            return false;
        }
    }

    return true;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
