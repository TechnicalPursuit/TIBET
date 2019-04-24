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
 * @type {TP.tibet.content}
 * @summary A subtype of TP.dom.ElementNode that implements a way of describing
 *     a 'content type', along with its attendant data types and aspect
 *     mappings, in markup.
 */

//  ------------------------------------------------------------------------

TP.dom.ElementNode.defineSubtype('tibet:content');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.tibet.content.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        elemTPNode,

        supertypeName,
        supertype,
        typeName,

        forceDefinition,

        type,

        schema,
        schemaLocs,

        computeFacetSetting,

        aspectTPElems;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    //  Get a handle to a TP.dom.Node representing an instance of this
    //  element type wrapped around elem. Note that this will both ensure a
    //  unique 'id' for the element and register it.
    elemTPNode = TP.tpnode(elem);

    if (TP.isEmpty(supertypeName = elemTPNode.getAttribute('baseType'))) {
        return this.raise(
                    'TP.sig.InvalidParameter',
                    'Couldn\'t find an attribute defining the baseType type');
    }

    if (!TP.isType(supertype = TP.sys.getTypeByName(supertypeName))) {
        return this.raise(
                    'TP.sig.InvalidType',
                    'Couldn\'t find the baseType type');
    }

    if (TP.isEmpty(typeName = elemTPNode.getAttribute('name'))) {
        return this.raise(
                    'TP.sig.InvalidParameter',
                    'Couldn\'t find an attribute defining the type');
    }

    //  If the tag has an attribute named 'redefine' that resolves to true, or
    //  we can't find a type matching the name given in the 'name' attribute,
    //  then we define our type here.
    forceDefinition = TP.bc(elemTPNode.getAttribute('redefine'));
    if (TP.isTrue(forceDefinition) ||
            !TP.isType(type = TP.sys.getTypeByName(typeName))) {
        type = supertype.defineSubtype(typeName);
    }

    //  Import any schemas required - they'll be a set of space-separated URLs
    if (TP.notEmpty(schema = elemTPNode.getAttribute('schema'))) {
        if (TP.notEmpty(schemaLocs = schema.split(' '))) {
            schemaLocs.perform(
                function(aSchemaLoc) {
                    var schemaURI,

                        fetchParams,

                        resp,
                        schemaObj;

                    schemaURI = TP.uc(aSchemaLoc);
                    fetchParams = TP.hc('async', false, 'resultType', TP.WRAP);

                    if (schemaURI.getExtension() === 'json') {
                        fetchParams.atPut('contenttype',
                                            TP.json.JSONSchemaContent);
                    }

                    resp = schemaURI.getResource(fetchParams);

                    if (TP.isValid(schemaObj = resp.get('result'))) {
                        if (TP.isKindOf(schemaObj, TP.dom.XMLDocumentNode)) {
                            schemaObj = schemaObj.getDocumentElement();
                        }
                    }

                    if (TP.canInvoke(schemaObj, 'defineTypes')) {
                        schemaObj.defineTypes();
                    }
                });
        }
    }

    //  Define a convenience Function that we use below to try to create the
    //  correct kind of Object to use as the facet setting.
    computeFacetSetting = function(facetSrc) {
        if (/\s*(true|false)\s*/.test(facetSrc)) {
            return TP.bc(facetSrc);
        } else if (TP.regex.ONLY_NUM.test(facetSrc)) {
            return TP.nc(facetSrc);
        } else if (/\s*\[.+\]\s*/.test(facetSrc)) {
            return TP.tostr(facetSrc).split(',');
        } else if (TP.regex.JS_IDENTIFIER.test.facetSrc) {
            return facetSrc;
        }

        return TP.apc(facetSrc);
    };

    //  Grab all of the members of this content, iterate over them and build up
    //  a set of aspect facet settings for the newly-defined type.
    if (TP.notEmpty(aspectTPElems = TP.byCSSPath('> tibet|aspect', elem))) {

        aspectTPElems.perform(
                function(aTPElem) {
                    var name,
                        descriptor,
                        val,
                        typeVal;

                    if (TP.isEmpty(name = aTPElem.getAttribute('name'))) {
                        return this.raise(
                                    'TP.sig.InvalidParameter',
                                    'Couldn\'t find an aspect name');
                    }

                    descriptor = {};

                    //  ---

                    //  'readonly'
                    if (TP.notEmpty(val = aTPElem.getAttribute('readonly'))) {
                        descriptor.readonly = computeFacetSetting(val);
                    }

                    //  ---

                    //  'relevant'
                    if (TP.notEmpty(val = aTPElem.getAttribute('relevant'))) {
                        descriptor.relevant = computeFacetSetting(val);
                    }

                    //  ---

                    //  'required'
                    if (TP.notEmpty(val = aTPElem.getAttribute('required'))) {
                        descriptor.required = computeFacetSetting(val);
                    }

                    //  ---

                    //  'valid'

                    descriptor.valid = {};

                    if (TP.notEmpty(val = aTPElem.getAttribute('dataType'))) {
                        if (!TP.isType(typeVal = TP.sys.getTypeByName(val))) {
                            return this.raise(
                                        'TP.sig.InvalidType',
                                        'Couldn\'t find the type: ' + val);
                        }
                        descriptor.valid.dataType = typeVal;
                    }

                    if (TP.notEmpty(val =
                                    aTPElem.getAttribute('enumeration'))) {
                        descriptor.valid.enumeration = computeFacetSetting(val);
                    }

                    if (TP.notEmpty(val =
                                    aTPElem.getAttribute('equal'))) {
                        descriptor.valid.equal = computeFacetSetting(val);
                    }

                    if (TP.notEmpty(val =
                                    aTPElem.getAttribute('fractionDigits'))) {
                        descriptor.valid.fractionDigits =
                                                computeFacetSetting(val);
                    }

                    if (TP.notEmpty(val =
                                    aTPElem.getAttribute('length'))) {
                        descriptor.valid.length = computeFacetSetting(val);
                    }

                    if (TP.notEmpty(val =
                                    aTPElem.getAttribute('maxExclusive'))) {
                        descriptor.valid.maxExclusive = computeFacetSetting(val);
                    }

                    if (TP.notEmpty(val =
                                    aTPElem.getAttribute('maxInclusive'))) {
                        descriptor.valid.maxInclusive = computeFacetSetting(val);
                    }

                    if (TP.notEmpty(val =
                                    aTPElem.getAttribute('maxLength'))) {
                        descriptor.valid.maxLength = computeFacetSetting(val);
                    }

                    if (TP.notEmpty(val =
                                    aTPElem.getAttribute('maxValue'))) {
                        descriptor.valid.maxValue = computeFacetSetting(val);
                    }

                    if (TP.notEmpty(val =
                                    aTPElem.getAttribute('minExclusive'))) {
                        descriptor.valid.minExclusive = computeFacetSetting(val);
                    }

                    if (TP.notEmpty(val =
                                    aTPElem.getAttribute('minInclusive'))) {
                        descriptor.valid.minInclusive = computeFacetSetting(val);
                    }

                    if (TP.notEmpty(val =
                                    aTPElem.getAttribute('minLength'))) {
                        descriptor.valid.minLength = computeFacetSetting(val);
                    }

                    if (TP.notEmpty(val =
                                    aTPElem.getAttribute('minValue'))) {
                        descriptor.valid.minValue = computeFacetSetting(val);
                    }

                    if (TP.notEmpty(val =
                                    aTPElem.getAttribute('notEqual'))) {
                        descriptor.valid.notEqual = computeFacetSetting(val);
                    }

                    if (TP.notEmpty(val =
                                    aTPElem.getAttribute('pattern'))) {
                        if (TP.isString(descriptor.valid.pattern =
                                                computeFacetSetting(val))) {
                            descriptor.valid.pattern =
                                    TP.rc(descriptor.valid.pattern);
                        }
                    }

                    if (TP.notEmpty(val =
                                    aTPElem.getAttribute('totalDigits'))) {
                        descriptor.valid.totalDigits = computeFacetSetting(val);
                    }

                    //  ---

                    //  'value' is treated specially by the 'defineAttribute'
                    //  call below.
                    if (TP.notEmpty(val = aTPElem.getAttribute('value'))) {
                        val = computeFacetSetting(val);
                    }

                    //  ---

                    //  Define the attribute on the type, using the descriptor
                    //  that we just built up.
                    type.Inst.defineAttribute(name, val, descriptor);
                }.bind(this));
    }

    return;
});

//  ========================================================================
//  TP.tibet.aspect
//  ========================================================================

/**
 * @type {TP.tibet.aspect}
 * @summary A subtype of TP.dom.ElementNode that implements a way of describing
 *     an 'aspect' of a 'content type', along with rules about it. It is defined
 *     so that development when the Sherpa is loaded does not cause an
 *     'autodefinition' of a missing tag.
 */

//  ------------------------------------------------------------------------

TP.dom.ElementNode.defineSubtype('tibet:aspect');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
