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
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input for the shell.
     * @returns {Constant} TP.CONTINUE which means that all child content of the
     *     current node will be skipped.
     */

    var elem,
        elemTPNode,

        redefine;

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return TP.CONTINUE;
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

    return TP.CONTINUE;
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

    //  Note that we don't want to have TP.wrap()ed 'simpleType' nodes since
    //  we've already got a type named 'TP.xs.simpleType' and its not a node
    //  type.
    if (TP.notEmpty(schemaElems =
                    TP.nodeGetElementsByTagName(node, 'simpleType'))) {
        TP.xs.simpleType.defineTypesFromElements(schemaElems, forceDefinition);
    }

    //  Process complex types

    //  Note that we don't want to have TP.wrap()ed 'complexType' nodes
    //  since we've already got a type named 'TP.xs.complexType' and its not
    //  a node type.
    if (TP.notEmpty(schemaElems =
                    TP.nodeGetElementsByTagName(node, 'complexType'))) {
        TP.xs.complexType.defineTypesFromElements(schemaElems, forceDefinition);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
