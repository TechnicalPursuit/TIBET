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
 * @type {TP.xs.XMLSchemaComplexCompositeType}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.xs.XMLSchemaCompositeType.defineSubtype('XMLSchemaComplexCompositeType');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.XMLSchemaComplexCompositeType.Type.defineMethod('validate',
function(aValue) {

    /**
     * @name validate
     * @synopsis Returns true if the object provided it meets all of the
     *     criteria supplied in this type.
     * @param {Object} aValue The object to validate.
     * @returns {Boolean} True if the object validates against the receiver.
     */

    var schemaNode,
        retVal;

    if (TP.notValid(aValue)) {
        return this.raise('TP.sig.InvalidParameter',
                            'No object provided to validate');
    }

    if (TP.notValid(schemaNode = this.get('schemaNode'))) {
        return this.raise('TP.sig.InvalidNode',
                            'No schema definition node provided');
    }

    //  This type should only contain 'compositors' (i.e. TP.xs.sequence or
    //  TP.xs.choice)
    if (TP.notValid(retVal = this.validateCompositors(aValue, schemaNode))) {
        return false;
    }

    return retVal;
});

//  ------------------------------------------------------------------------

TP.xs.XMLSchemaComplexCompositeType.Type.defineMethod('validateChoice',
function(aValue, choiceElem) {

    /**
     * @name validateChoice
     * @synopsis Returns true if only one value provided meet the requirements
     *     of the TP.xs.choice specification provided.
     * @param {Object} aValue The object to validate.
     * @param {TP.xs.choice} choiceElem The element containing the information
     *     to validate against.
     * @returns {Boolean} True if the object validates against the type
     *     information contained in the supplied TP.xs.choice element.
     * @todo
     */

    var numValidElems,
        allElems,

        elemsAreValid,
        compsAreValid;

    allElems = TP.nodeEvaluateXPath(choiceElem, './xs:element', TP.NODESET);

    if (TP.notEmpty(allElems)) {
        //  Validate any TP.xs.element elements that occur under our supplied
        //  TP.xs.choice element.
        numValidElems = this.validateElements(aValue, choiceElem);

        //  The underlying elements are only valid if one and only one is valid.
        elemsAreValid = (numValidElems === 1);
    }

    //  Validate against any nested compositors. If there are no nested
    //  compositors, then we just return the value of the TP.xs.element
    //  validation.
    if (TP.notValid(compsAreValid = this.validateCompositors(
                                                    aValue, choiceElem))) {
        //  No compositors, just elements
        return elemsAreValid;
    } else if (TP.isEmpty(allElems)) {
        //  No elements, just compositors
        return compsAreValid;
    }

    //  We had both

    //  'TP.xs.choice' is a mutually exclusive construct, so only one of these
    //  can be true - the other must be false.
    if ((elemsAreValid && !compsAreValid) ||
        (compsAreValid && !elemsAreValid)) {
        return true;
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.xs.XMLSchemaComplexCompositeType.Type.defineMethod('validateCompositors',
function(aValue, anElem) {

    /**
     * @name validateCompositors
     * @synopsis Tests the value against all of the compositor elements
     *     (TP.xs.sequence or TP.xs.choice) in the supplied Node.
     * @param {Object} aValue The object to validate.
     * @param {Element} anElem The element containing the compositors to validate
     *     against.
     * @returns {Boolean|null} True if the object validates against the type
     *     information contained in the supplied compositor elements under the
     *     supplied node. This method returns null if there are no compositor
     *     elements under the supplied node.
     * @todo
     */

    var list,

        retVal;

    //  Make sure we actually have some 'compositor' elements under the supplied
    //  element.
    list = TP.nodeEvaluateXPath(
            anElem,
            './*[local-name() = "sequence" or local-name() = "choice"]',
            TP.NODESET);

    if (TP.isEmpty(list)) {
        return null;
    }

    //  We initialize the return value to true, but each 'validate*' should set
    //  it to its own value. That's the value we'll return as all of the
    //  'TP.xs.*' elements have to be true in order for this method to return
    //  true.
    retVal = true;

    //  Process all 'sequence' elements

    //  NB: We use nodeEvaluateXPath() here instead of
    //  nodeGetElementsByTagName() to avoid getting descendants - we want a
    //  shallow traversal.
    list = TP.nodeEvaluateXPath(anElem, './xs:sequence', TP.NODESET);
    if (TP.notEmpty(list)) {
        retVal = this.validateSequence(aValue, list.at(0));
    }

    //  If 'retVal' is still true, process the 'TP.xs.choice' elements
    if (retVal) {
        //  NB: We use nodeEvaluateXPath() here instead of
        //  nodeGetElementsByTagName() to avoid getting descendants - we want a
        //  shallow traversal.
        list = TP.nodeEvaluateXPath(anElem, './xs:choice', TP.NODESET);
        if (TP.notEmpty(list)) {
            retVal = this.validateChoice(aValue, list.at(0));
        }
    }

    //  We don't process 'all' elements

    return retVal;
});

//  ------------------------------------------------------------------------

TP.xs.XMLSchemaComplexCompositeType.Type.defineMethod('validateElements',
function(aValue, anElem) {

    /**
     * @name validateElements
     * @synopsis Returns true if all values provided meet the requirements of
     *     the TP.xs.element elements under the supplied element.
     * @param {Object} aValue The object to validate.
     * @param {TP.xs.choice|TP.xs.sequence} anElem The element containing the
     *     TP.xs.elements to validate against.
     * @returns {Number} The number of elements that the object successfully
     *     validated against.
     * @todo
     */

    var value,

        isSequence,

        list,

        passCount,

        len,
        i,

        accessorName,
        typeName,

        type,

        slotValue;

    if (TP.notValid(aValue)) {
        return true;
    }

    //  Make sure the value is wrapped.
    value = TP.wrap(aValue);

    isSequence = (TP.name(anElem) === 'xs:sequence');

    //  NB: We use nodeEvaluateXPath() here instead of
    //  nodeGetElementsByTagName() to avoid getting descendants - we want a
    //  shallow traversal.
    list = TP.nodeEvaluateXPath(anElem, './xs:element', TP.NODESET);

    //  Keep track of how many tests we pass
    passCount = 0;

    if (TP.notEmpty(list)) {
        len = list.getSize();
        for (i = 0; i < len; i++) {

            //  TODO: Process 'ref' attributes
            //  TODO: Process 'minOccurs'/'maxOccurs' attributes

            if (TP.isEmpty(accessorName =
                            TP.elementGetAttribute(list.at(i), 'name'))) {
                //  Can't find an accessor name and its a TP.xs.sequence? Then
                //  at least one of the TP.xs.element elements cannot be
                //  validated against, so we might as well return false here.
                if (isSequence) {
                    return false;
                } else {
                    //  Otherwise its a TP.xs.choice, so see if one of the
                    //  other TP.xs.element elements can validate.
                    continue;
                }
            }

            if (TP.isEmpty(typeName =
                            TP.elementGetAttribute(list.at(i), 'type'))) {
                //  Can't find a type name and its a TP.xs.sequence? Then at
                //  least one of the TP.xs.element elements cannot be validated
                //  against, so we might as well return false here.
                if (isSequence) {
                    return false;
                } else {
                    //  Otherwise its a TP.xs.choice, so see if one of the other
                    //  TP.xs.element elements can validate.
                    continue;
                }
            }

            //  We were able to get a valid type name and a valid accessor name.
            //  See if we can grab the value using the accessor against the
            //  supplied object and validate against the type.

            //  If the typename doesn't have a namespace, then we prepend
            //  'TP.xs.'
            typeName = /\.|:/.test(typeName) ? typeName : 'TP.xs.' + typeName;

            type = TP.sys.require(typeName);
            if (TP.notValid(type)) {
                TP.ifWarn() ?
                    TP.warn(TP.annotate(
                                list.at(i),
                                'Unable to require() base type: ' + typeName),
                            TP.LOG) : 0;

                return true;
            }

            if (TP.isValid(slotValue = value.get(accessorName))) {
                if (type.validate(slotValue)) {
                    //  It successfully validated - kick the pass count.
                    passCount++;
                }
            }
        }
    }

    return passCount;
});

//  ------------------------------------------------------------------------

TP.xs.XMLSchemaComplexCompositeType.Type.defineMethod('validateSequence',
function(aValue, sequenceElem) {

    /**
     * @name validateSequence
     * @synopsis Returns true if all values provided meet the requirements of
     *     the TP.xs.sequence specification provided.
     * @param {Object} aValue The object to validate.
     * @param {TP.xs.sequence} unionElem The element containing the information
     *     to validate against.
     * @returns {Boolean} True if the object validates against the type
     *     information contained in the supplied TP.xs.sequence element.
     * @todo
     */

    var numValidElems,
        allElems,

        elemsAreValid,
        compsAreValid;

    allElems = TP.nodeEvaluateXPath(sequenceElem, './xs:element', TP.NODESET);

    if (TP.notEmpty(allElems)) {
        //  Validate any TP.xs.element elements that occur under our supplied
        //  TP.xs.sequence element.
        numValidElems = this.validateElements(aValue, sequenceElem);

        //  The underlying elements are only valid if all of them are.
        elemsAreValid = (numValidElems === allElems.getSize());
    }

    //  Validate against any nested compositors. If there are no nested
    //  compositors, then we just return the value of the TP.xs.element
    //  validation.
    if (TP.notValid(compsAreValid = this.validateCompositors(
                                                aValue, sequenceElem))) {
        //  No compositors, just elements
        return elemsAreValid;
    } else if (TP.isEmpty(allElems)) {
        //  No elements, just compositors
        return compsAreValid;
    }

    //  We had both
    return (elemsAreValid && compsAreValid);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
