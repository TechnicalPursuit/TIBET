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
 * @type {TP.xs.schema}
 * @synopsis XMLSchema schema processing node.
 */

//  ------------------------------------------------------------------------

TP.core.ElementNode.defineSubtype('xs:schema');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.xs.schema.Type.defineMethod('tagCompile',
function(aRequest) {

    /**
     * @name tagCompile
     * @synopsis Convert the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        elemTPNode,

        redefine;

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    //  Get a handle to a TP.core.Node representing an instance of this
    //  element type wrapped around elem. Note that this will both ensure a
    //  unique 'id' for the element and register it.
    elemTPNode = TP.tpnode(elem);

    //  If the 'tibet:redefine' attribute is true, then force redefinition
    //  of the types.
    redefine = TP.elementGetAttribute(
                elem, 'tibet:redefine', true) === 'true' ?
                true :
                false;

    elemTPNode.defineTypes(redefine);

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xs.schema.Inst.defineMethod('defineTypes',
function(forceDefinition) {

    /**
     * @name defineTypes
     * @synopsis Define the types in TIBET that have their XML Schema markup
     *     under the receiver.
     * @param {Boolean} forceDefinition Whether or not to force definition of
     *     the types even if they're already defined.
     * @raises TP.sig.InvalidNode
     * @returns {'TP.xs.schema'} The receiver.
     */

    var node,

        schemaElems;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode');
    }

    //  Process simple types

    if (TP.notEmpty(schemaElems =
                    TP.nodeGetElementsByTagName(node, 'simpleType'))) {

        //  Wrap the elems to get their wrapped equivalent
        schemaElems = TP.wrap(schemaElems);

        //  Loop over them and define the type they represent.
        schemaElems.perform(
                function(aTPElement) {
                    aTPElement.defineType(forceDefinition);
                });
    }

    //  Process complex types

    if (TP.notEmpty(schemaElems =
                    TP.nodeGetElementsByTagName(node, 'complexType'))) {

        //  Wrap the elems to get their wrapped equivalent
        schemaElems = TP.wrap(schemaElems);

        //  Loop over them and define the type they represent.
        schemaElems.perform(
                function(aTPElement) {
                    aTPElement.defineType(forceDefinition);
                });
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
