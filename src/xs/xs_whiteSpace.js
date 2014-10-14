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
 * @type {TP.xs.whiteSpace}
 * @synopsis XMLSchema whiteSpace processing node. This node is used when
 *     creating simple types which require specialized whitespace processing.
 */

//  ------------------------------------------------------------------------

TP.xs.XMLSchemaCompositeType.defineSubtype('whiteSpace');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.whiteSpace.Type.defineMethod('fromObject',
function(aValue, aFacet) {

    /**
     * @name fromObject
     * @synopsis Creates a new instance from the object provided, if possible.
     *     For TP.xs.whitespace this method will attempt to process the value
     *     into another data type if the 'value' attribute on the supplied facet
     *     node is either 'collapse' (producing an 'TP.xs.token') or 'replace'
     *     (producing an 'TP.xs.normalizedString').
     * @param {Object} anObject The object to use as source data.
     * @param {Element} aFacet The facet element used to indicate what sort of
     *     whitespace processing should be performed on the supplied value.
     * @todo
     */

    var format,
        value;

    value = aValue;

    format = TP.elementGetAttribute(aFacet, 'value');
    switch (format) {
        case 'collapse':

            //  all whitespace replaced by spaces and then collapsed to
            //  single spaces
            value = 'TP.xs.token'.asType().fromObject(value);
            break;

        case 'preserve':

            //  no-op, leave whitespace alone
            break;

        case 'replace':

            //  replace whitespace with space chars (TP.xs.normalizedString)
            value = 'TP.xs.normalizedString'.asType().fromObject(value);
            break;

        default:

            this.raise('TP.sig.UnsupportedFeature',
                        'Invalid format specification for facet');

            break;
    }

    return value.asString();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
