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
 * @synopsis XMLSchema simple node wrapper.
 */

//  ------------------------------------------------------------------------

TP.core.ElementNode.defineSubtype('xs:simpleType');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xs.simpleType.Inst.defineMethod('defineType',
function(forceDefinition) {

    /**
     * @name defineTypesFromElements
     * @synopsis Defines TIBET types from the XML Schema data found in the
     *     supplied set of 'type elements'. If the forceDefinition flag is true,
     *     this method will define the type even if there is already a type of
     *     that name in the system.
     * @param {Boolean} forceDefinition Whether or not type definition should be
     *     forced even if the type already exists.
     * @returns {TP.lang.RootObject.<TP.xs.XMLSchemaSimpleCompositeType>} The
     *     newly defined type (or the existing type if it already exists).
     */

    var elem,

        typeName,
        type;

    elem = this.getNativeNode();

    if (TP.notEmpty(typeName = TP.elementGetAttribute(elem, 'name'))) {

        if (TP.isTrue(forceDefinition) ||
            TP.notValid(type = TP.sys.require(typeName))) {

            type = TP.xs.XMLSchemaSimpleCompositeType.defineSubtype(typeName);

            //  Note here how we use 'Type.set()' so that this type and
            //  all of its subtypes can 'see' the value set here.

            type.Type.set('schemaNode', elem);
        }
    }

    return type;
});

});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
