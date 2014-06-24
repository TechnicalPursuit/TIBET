//  ========================================================================
/*
NAME:   xs_complexType.js
AUTH:   Scott Shattuck (ss), William J. Edney (wje)
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
 * @type {TP.xs.complexType}
 * @synopsis XMLSchema complex type wrapper.
 */

//  ------------------------------------------------------------------------

TP.xs.XMLSchemaCompositeType.defineSubtype('complexType');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.complexType.Type.defineMethod('defineTypesFromElements',
function(typeElems, forceDefinition) {

    /**
     * @name defineTypesFromElements
     * @synopsis Defines TIBET types from the XML Schema data found in the
     *     supplied set of 'type elements'. If the forceDefinition flag is true,
     *     this method will define the type even if there is already a type of
     *     that name in the system.
     * @param {Array} typeElems An Array of Elements that contain XML Schema
     *     type information.
     * @param {Boolean} forceDefinition Whether or not type definition should be
     *     forced even if the type already exists.
     * @returns {TP.lang.RootObject.<TP.xs.complexType>} The receiver.
     * @todo
     */

    typeElems.perform(
        function(aSchemaElem) {

            var typeName,
                type;

            if (TP.notEmpty(
                typeName = TP.elementGetAttribute(aSchemaElem, 'name'))) {
                if (TP.isTrue(forceDefinition) ||
                    TP.notValid(type = TP.sys.require(typeName))) {
                    type = 'TP.xs.complexType'.defineSubtype(typeName);

                    //  Note here how we use 'Type.set()' so that this type and
                    //  all of its subtypes can 'see' the value set here.

                    type.Type.set('schemaNode', aSchemaElem);
                }
            }
    });

    return this;
});

//  ------------------------------------------------------------------------

TP.xs.complexType.Type.defineMethod('validate',
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

    if (TP.notValid(schemaNode = this.get('schemaNode'))) {
        return this.raise('TP.sig.InvalidNode',
                            arguments,
                            'No schema definition node provided');
    }

    //  Our TP.xs.complexType should only contain 'compositors' (i.e.
    //  TP.xs.sequence or TP.xs.choice)
    if (TP.notValid(retVal = this.validateCompositors(aValue, schemaNode))) {
        return false;
    }

    return retVal;
});

//  ------------------------------------------------------------------------

TP.xs.complexType.Type.defineMethod('validateChoice',
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

TP.xs.complexType.Type.defineMethod('validateCompositors',
function(aValue, aNode) {

    /**
     * @name validateCompositors
     * @synopsis Tests the value against all of the compositor elements
     *     (TP.xs.sequence or TP.xs.choice) in the supplied Node.
     * @param {Object} aValue The object to validate.
     * @param {Element} aNode The element containing the compositors to validate
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
            aNode,
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
    list = TP.nodeEvaluateXPath(aNode, './xs:sequence', TP.NODESET);
    if (TP.notEmpty(list)) {
        retVal = this.validateSequence(aValue, list.at(0));
    }

    //  If 'retVal' is still true, process the 'TP.xs.choice' elements
    if (retVal) {
        //  NB: We use nodeEvaluateXPath() here instead of
        //  nodeGetElementsByTagName() to avoid getting descendants - we want a
        //  shallow traversal.
        list = TP.nodeEvaluateXPath(aNode, './xs:choice', TP.NODESET);
        if (TP.notEmpty(list)) {
            retVal = this.validateChoice(aValue, list.at(0));
        }
    }

    //  We don't process 'all' elements

    return retVal;
});

//  ------------------------------------------------------------------------

TP.xs.complexType.Type.defineMethod('validateElements',
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
                    TP.warn(TP.boot.$annotate(
                                list.at(i),
                                'Unable to require() base type: ' + typeName),
                            TP.LOG,
                            arguments) : 0;

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

    //  If we're a sequence, all test must've passed in order to return true
    //  from this method.
    if (isSequence) {
        //return passCount === list.getSize();
    } else {
        //  Otherwise, if we're a choice, only one test must've passed in order
        //  to return true from this method.
        //return passCount > 0;
    }
});

//  ------------------------------------------------------------------------

TP.xs.complexType.Type.defineMethod('validateSequence',
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
