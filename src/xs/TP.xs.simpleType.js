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
 * @type {TP.xs.simpleType}
 * @summary XMLSchema simple node wrapper.
 */

//  ------------------------------------------------------------------------

TP.dom.ElementNode.defineSubtype('xs.simpleType');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xs.simpleType.Inst.defineMethod('defineType',
function() {

    /**
     * @method defineType
     * @summary Defines a TIBET type from the XML Schema data found in the
     *     receiver's schema node.
     * @returns {TP.meta.xs.XMLSchemaSimpleCompositeType} The newly defined type
     *     (or the existing type if it already exists).
     */

    var elem,

        typeName,

        forceDefinition,
        type;

    elem = this.getNativeNode();

    if (TP.notEmpty(typeName = TP.elementGetAttribute(elem, 'name'))) {

        forceDefinition =
            TP.bc(TP.elementGetAttribute(elem, 'tibet:redefine', true));

        if (TP.isTrue(forceDefinition) ||
            !TP.isType(type = TP.sys.getTypeByName(typeName))) {

            type = TP.xs.XMLSchemaSimpleCompositeType.defineSubtype(typeName);

            //  Note here how we use 'Type.set()' so that this type and
            //  all of its subtypes can 'see' the value set here.

            type.Type.set('schemaNode', elem);
        }
    }

    return type;
});

//  ------------------------------------------------------------------------

TP.xs.simpleType.Inst.defineMethod('getRepresentedType',
function() {

    /**
     * @method getRepresentedType
     * @summary Returns a type that this object might be 'representing'. This
     *     is used in here to return the type that the receiver is describing to
     *     the system.
     * @returns {TP.meta.xs.XMLSchemaSimpleCompositeType} The type being
     *     represented by the receiver.
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
