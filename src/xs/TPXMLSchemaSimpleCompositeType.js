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
 * @type {TP.xs.XMLSchemaSimpleCompositeType}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.xs.XMLSchemaCompositeType.defineSubtype('XMLSchemaSimpleCompositeType');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.XMLSchemaSimpleCompositeType.Type.defineMethod('validate',
function(aValue) {

    /**
     * @name validate
     * @synopsis Returns true if the object provided it meets all of the
     *     criteria supplied in this type.
     * @param {Object} aValue The object to validate.
     * @returns {Boolean} True if the object validates against the receiver.
     */

    var schemaNode,

        list;

    if (TP.notValid(schemaNode = this.get('schemaNode'))) {
        return this.raise('TP.sig.InvalidNode',
                            'No schema definition node provided');
    }

    //  Validate against any 'TP.xs.restriction' elements we have.

    //  NB: We use nodeEvaluateXPath() here instead of
    //  nodeGetElementsByTagName() to avoid getting descendants - we want a
    //  shallow traversal.
    list = TP.nodeEvaluateXPath(schemaNode,
                                './xs:restriction',
                                TP.NODESET);
    if (TP.notEmpty(list)) {
        return this.validateRestriction(aValue, list.at(0));
    }

    //  Validate against any 'TP.xs.union' elements we have.

    //  NB: We use nodeEvaluateXPath() here instead of
    //  nodeGetElementsByTagName() to avoid getting descendants - we want a
    //  shallow traversal.
    list = TP.nodeEvaluateXPath(schemaNode,
                                './xs:union',
                                TP.NODESET);
    if (TP.notEmpty(list)) {
        return this.validateUnion(aValue, list.at(0));
    }

    //  Validate against any 'TP.xs.list' elements we have.

    //  NB: We use nodeEvaluateXPath() here instead of
    //  nodeGetElementsByTagName() to avoid getting descendants - we want a
    //  shallow traversal.
    list = TP.nodeEvaluateXPath(schemaNode,
                                './xs:list',
                                TP.NODESET);
    if (TP.notEmpty(list)) {
        return this.validateList(aValue, list.at(0));
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.xs.XMLSchemaSimpleCompositeType.Type.defineMethod('validateList',
function(aValue, listElem) {

    /**
     * @name validateList
     * @synopsis Returns true if all values provided meet the requirements of
     *     the TP.xs.list specification provided.
     * @param {String} aValue A string of whitespace separated values to
     *     validate.
     * @param {TP.xs.list} listElem The element containing the information to
     *     validate against.
     * @returns {Boolean} True if the object validates against the type
     *     information contained in the supplied TP.xs.list element.
     * @todo
     */

    var values,

        typeName,

        anonSchemaElem,
        typeID,

        type,

        i,
        list;

    if (TP.notValid(aValue)) {
        return this.raise('TP.sig.InvalidParameter',
                            'TP.xs.list validation requires non-null input');
    }

    //  If its not a String, grab the String value.
    if (!TP.isString(aValue)) {
        if (TP.canInvoke(aValue, 'asString')) {
            values = aValue.asString();
        } else if (TP.isNode(aValue)) {
            values = TP.nodeAsString(aValue);
        }
        if (TP.canInvoke(aValue, 'toString')) {
            values = aValue.toString();
        } else {
            return this.raise('TP.sig.InvalidParameter',
                                'TP.xs.list validation requires string input');
        }
    } else {
        values = aValue;
    }

    //  Start by getting the base type specification from the list element.

    //  This can either be in the form of a 'itemType' attribute on the list
    //  element or another 'TP.xs.simpleType' element with no name but that has
    //  further specializations on it.

    //  Try first form - an 'itemType' attribute on the 'TP.xs.list' element.
    typeName = TP.elementGetAttribute(listElem, 'itemType');
    if (TP.isEmpty(typeName)) {
        //  Try second form - a 'TP.xs.simpleType' element with no name under
        //  the 'TP.xs.list' element.
        if (TP.notValid(anonSchemaElem = TP.nodeGetElementsByTagName(
                                        listElem, 'simpleType').first())) {
            TP.ifWarn() ?
                TP.warn(TP.annotate(
                            listElem,
                            'Unable to locate base specification'),
                        TP.LOG) : 0;

            return true;
        }

        //  We were able to find an anonymous 'TP.xs.simpleType' element under
        //  the 'TP.xs.list' element. Generate a type name for it, create a
        //  type with that type name, and put it on the 'TP.xs.list' as the
        //  'itemType' so that we don't go through here again.
        TP.regex.INVALID_ID_CHARS.lastIndex = 0;
        typeID = TP.genID('type_').strip(TP.regex.INVALID_ID_CHARS);
        type = TP.xs.XMLSchemaSimpleCompositeType.defineSubtype(typeID);

        //  Note here how we use 'Type.set()' so that this type and all of its
        //  subtypes can 'see' the value set here.

        type.Type.set('schemaNode', anonSchemaElem);
        TP.elementSetAttribute(listElem, 'itemType', typeID);
    } else {
        //  If the typename doesn't have a namespace, then we prepend 'TP.xs.'
        typeName = /\.|:/.test(typeName) ? typeName : 'TP.xs.' + typeName;

        type = TP.sys.require(typeName);
        if (TP.notValid(type)) {
            TP.ifWarn() ?
                TP.warn(TP.annotate(
                            listElem,
                            'Unable to require() base type: ' + typeName),
                        TP.LOG) : 0;

            return true;
        }
    }

    //  Grab the values and split along whitespace.
    list = values.split(/\s+/);

    //  Iterate over each value and validate it against the type.
    for (i = 0; i < list.getSize(); i++) {
        if (!type.validate(list.at(i))) {
            return false;
        }
    }

    return true;
});

//  ------------------------------------------------------------------------

TP.xs.XMLSchemaSimpleCompositeType.Type.defineMethod('validateRestriction',
function(aValue, restrictionElem) {

    /**
     * @name validateRestriction
     * @synopsis Returns true if the value provided meets the requirements of
     *     the various restriction facets.
     * @description Restriction-based type checking is the most common form of
     *     user-defined datatyping, however there are several special case
     *     treatments that have to be handled for proper results. For example,
     *     the TP.xs.whiteSpace facet actually has to be used to alter the
     *     string value being tested before any other tests are applied.
     *     Enumerated values have to be tested as an "or" condition, as do
     *     pattern facets, but pattern facets are also "or'd" against remaining
     *     facets whereas enumerations define a standalone set of possible
     *     values.
     * @param {String} aValue The string value to test.
     * @param {TP.xs.restriction} restrictionElem The element containing the
     *     information to validate against.
     * @returns {Boolean} True if the object is a valid member of the restricted
     *     value space.
     * @todo
     */

    var value,

        typeName,
        type,

        list,
        i;

    //  capture value so we can alter it along the way as needed and make sure
    //  its a String.
    value = TP.str(aValue);

    //  start by getting the base type specification from the list element.
    //  TODO:   at the moment we only support builtin types as base types
    typeName = TP.elementGetAttribute(restrictionElem, 'base');
    if (TP.isEmpty(typeName)) {
        TP.ifWarn() ?
            TP.warn(TP.annotate(
                        restrictionElem,
                        'Unable to locate base specification'),
                    TP.LOG) : 0;

        return true;
    }

    //  If the typename doesn't have a namespace, then we prepend 'TP.xs.'
    typeName = /\.|:/.test(typeName) ? typeName : 'TP.xs.' + typeName;

    type = TP.sys.require(typeName);
    if (TP.notValid(type)) {
        TP.ifWarn() ?
            TP.warn(TP.annotate(
                        restrictionElem,
                        'Unable to require() base type: ' + typeName),
                    TP.LOG) : 0;

        return true;
    }

    //  when doing restrictions the first question is does the value meet the
    //  minimum requirements for the type...
    if (!type.validate(value)) {
        return false;
    }

    //  TP.xs.whiteSpace defines whitespace processing that should be done on
    //  the value before any other value checking is done...
    list = TP.nodeGetElementsByTagName(restrictionElem, 'whiteSpace');
    if (TP.notEmpty(list)) {
        value = 'TP.xs.whiteSpace'.asType().fromObject(value, list.at(0));
    }

    //  next check is to see if we have enumeration elements since we treat
    //  those as a sort of exclusive form of restriction (meaning that any
    //  other facets are ignored and only the enumeration values are used)
    list = TP.nodeGetElementsByTagName(restrictionElem, 'enumeration');
    if (TP.notEmpty(list)) {
        //  if we have an enumeration then the value must appear in it
        //  somewhere. we let each type test since enumerations work on the
        //  value space
        return TP.isValid(
            list.detect(
                function(item) {

                    return type.validateFacetEnumeration(value, item);
                }));
    }

    //  next check is to see if we have pattern elements since we treat those as
    //  a sort of exclusive form of restriction (meaning that any other facets
    //  are ignored and only the pattern values are used)
    list = TP.nodeGetElementsByTagName(restrictionElem, 'pattern');
    if (TP.notEmpty(list)) {
        //  if we have pattern elements then the value must match at least
        //  one pattern (they get "or'd")
        return TP.isValid(
            list.detect(
                function(item) {

                    return type.validateFacetPattern(value, item);
                }));
    }

    //  not an enumeration or pattern set so now we just have to iterate over
    //  the child nodes and ask the base type to validate each restriction
    //  (since the various facets are type-specialized)
    list = TP.nodeEvaluateXPath(restrictionElem, './*', TP.NODESET);
    for (i = 0; i < list.getSize(); i++) {
        if (!type.validateFacet(value, list.at(i))) {
            return false;
        }
    }

    return true;
});

//  ------------------------------------------------------------------------

TP.xs.XMLSchemaSimpleCompositeType.Type.defineMethod('validateUnion',
function(aValue, unionElem) {

    /**
     * @name validateUnion
     * @synopsis Returns true if all values provided meet the requirements of
     *     the TP.xs.union specification provided.
     * @param {Object} aValue The object to validate.
     * @param {TP.xs.union} unionElem The element containing the information to
     *     validate against.
     * @returns {Boolean} True if the object validates against the type
     *     information contained in the supplied TP.xs.union element.
     * @todo
     */

    var value,

        types,
        typeNames,

        i,

        typeName,
        type,

        anonSchemaElems,

        passedAtLeastOneTest;

    if (TP.notValid(aValue)) {
        return this.raise('TP.sig.InvalidParameter',
                            'TP.xs.union validation requires non-null input');
    }

    //  capture value so we can alter it along the way as needed and make sure
    //  its a String.
    value = TP.str(aValue);

    types = TP.ac();

    //  Start by getting the base type specifications from the union element.

    //  This can either be in the form of a 'memberTypes' attribute on the union
    //  element or 1 or more 'TP.xs.simpleType' elements with no name but that
    //  have further specializations on them or a combination of the two.

    //  Try first form - a 'memberTypes' attribute on the 'TP.xs.union' element.
    typeNames = TP.elementGetAttribute(unionElem, 'memberTypes');
    if (TP.notEmpty(typeNames)) {
        //  Found some member type names - split them along the whitespace.
        typeNames = typeNames.split(/\s+/);
    } else {
        typeNames = TP.ac();
    }

    //  Process whatever member type names that we found into type objects.
    for (i = 0; i < typeNames.getSize(); i++) {
        typeName = typeNames.at(i);

        //  If the typename doesn't have a namespace, then we prepend 'TP.xs.'
        typeName = /\.|:/.test(typeName) ? typeName : 'TP.xs.' + typeName;

        type = TP.sys.require(typeName);
        if (TP.notValid(type)) {
            TP.ifWarn() ?
                TP.warn(TP.annotate(
                            unionElem,
                            'Unable to require() base type: ' + typeName),
                        TP.LOG) : 0;

            return true;
        }

        types.push(type);
    }

    //  Try second form - one or more 'TP.xs.simpleType' elements with no name
    //  under the 'TP.xs.union' element.
    anonSchemaElems = TP.nodeGetElementsByTagName(unionElem, 'simpleType');

    if (TP.isEmpty(typeNames) && TP.isEmpty(anonSchemaElems)) {
        TP.ifWarn() ?
            TP.warn(TP.annotate(
                        unionElem,
                        'Unable to locate base specification'),
                    TP.LOG) : 0;

        return true;
    }

    if (TP.notEmpty(anonSchemaElems)) {
        //  We were able to find one or more anonymous 'TP.xs.simpleType'
        //  elements under the 'TP.xs.union' element. Generate a type name for
        //  each one, create a type with that type name, and then finally put
        //  those type names on the 'TP.xs.union' as the 'memberTypes' so that
        //  we don't go through here again.

        anonSchemaElems.perform(
            function(aSchemaElem) {

                var typeID,
                    type;

                TP.regex.INVALID_ID_CHARS.lastIndex = 0;
                typeID = TP.genID('type_').strip(TP.regex.INVALID_ID_CHARS);
                typeNames.push(typeID);

                type = TP.xs.XMLSchemaSimpleCompositeType.defineSubtype(typeID);
                types.push(type);

                //  Note here how we use 'Type.set()' so that this type and all
                //  of its subtypes can 'see' the value set here.

                type.Type.set('schemaNode', aSchemaElem);
            });

        TP.elementSetAttribute(unionElem, 'memberTypes', typeNames.join(' '));

        //  Don't want to find any 'TP.xs.simpleType' elements again.
        TP.nodeEmptyContent(unionElem);
    }

    passedAtLeastOneTest = false;

    //  Iterate over each value and validate it against the type.
    for (i = 0; i < types.getSize(); i++) {
        if (types.at(i).validate(value)) {
            passedAtLeastOneTest = true;
        }
    }

    return passedAtLeastOneTest;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
