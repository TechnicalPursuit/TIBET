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
 * @summary XMLSchema schema processing node.
 */

//  ------------------------------------------------------------------------

TP.core.ElementNode.defineSubtype('xs:schema');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xs.schema.Inst.defineMethod('defineTypes',
function() {

    /**
     * @method defineTypes
     * @summary Define the types in TIBET that have their XML Schema markup
     *     under the receiver.
     * @exception TP.sig.InvalidNode
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
                    aTPElement.defineType();
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
                    aTPElement.defineType();
                });
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
