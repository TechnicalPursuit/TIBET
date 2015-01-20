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
 * @type {TP.xs.complexType}
 * @synopsis XMLSchema complex node wrapper.
 */

//  ------------------------------------------------------------------------

TP.core.ElementNode.defineSubtype('xs:complexType');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xs.complexType.Inst.defineMethod('defineType',
function(forceDefinition) {

    /**
     * @name defineTypesFromElements
     * @synopsis Defines TIBET types from the XML Schema data found in the
     *     supplied set of 'type elements'. If the forceDefinition flag is true,
     *     this method will define the type even if there is already a type of
     *     that name in the system.
     * @param {Boolean} forceDefinition Whether or not type definition should be
     *     forced even if the type already exists.
     * @returns {TP.lang.RootObject.<TP.xs.XMLSchemaComplexCompositeType>} The
     *     newly defined type (or the existing type if it already exists).
     */

    var elem,

        typeName,
        type;

    elem = this.getNativeNode();

    if (TP.notEmpty(typeName = TP.elementGetAttribute(elem, 'name'))) {

        if (TP.isTrue(forceDefinition) ||
            TP.notValid(type = TP.sys.require(typeName))) {

            type = TP.xs.XMLSchemaComplexCompositeType.defineSubtype(typeName);

            //  Note here how we use 'Type.set()' so that this type and
            //  all of its subtypes can 'see' the value set here.

            type.Type.set('schemaNode', elem);
        }
    }

    return type;
});

//  ------------------------------------------------------------------------

TP.xs.complexType.Inst.defineMethod('getRepresentedType',
function() {

    /**
     * @name getRepresentedType
     * @synopsis Returns a type that this object might be 'representing'. This
     *     is used in here to return the type that the receiver is describing to
     *     the system.
     * @returns {TP.lang.RootObject.<TP.xs.XMLSchemaComplexCompositeType>} The
     *     type being represented by the receiver.
     */

    var node,
        typeName,

        type;

    node = this.getNativeNode();

    if (TP.isEmpty(typeName = TP.elementGetAttribute(node, 'name'))) {
        return this.raise('TP.sig.InvalidName');
    }

    //  If we can't get a type name with the value of our 'name' attribute, call
    //  our 'defineType()' method to try to define it and then see if we can get
    //  a valid type.
    if (!TP.isType(type = TP.sys.getTypeByName(typeName))) {

        if (!TP.isType(type = this.defineType())) {
            return this.raise('TP.sig.InvalidType');
        }
    }

    return type;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
