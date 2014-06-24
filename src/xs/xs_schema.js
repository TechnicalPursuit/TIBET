//  ========================================================================
/*
NAME:   xs_schema.js
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
 * @type {TP.xs.schema}
 * @synopsis XMLSchema schema processing node.
 */

//  ------------------------------------------------------------------------

TP.core.ElementNode.defineSubtype('xs:schema');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  TSH Phase Support
//  ------------------------------------------------------------------------

TP.xs.schema.Type.defineMethod('tshCompile',
function(aRequest) {

    /**
     * @name tshCompile
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
    if (!TP.isElement(elem = aRequest.at('cmdNode'))) {
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
        return this.raise('TP.sig.InvalidNode', arguments);
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
