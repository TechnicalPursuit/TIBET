//  ========================================================================
/*
NAME:   xs_whiteSpace.js
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
                        arguments,
                        'Invalid format specification for facet');

            break;
    }

    return value.asString();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
