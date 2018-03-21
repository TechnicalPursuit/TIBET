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
 * @type {TP.xctrls.button}
 * @summary Manages button XControls.
 */

//  ------------------------------------------------------------------------

TP.xctrls.TemplatedTag.defineSubtype('xctrls:button');

//  ------------------------------------------------------------------------

TP.xctrls.button.Inst.defineMethod('getDescendantsForSerialization',
function() {

    /**
     * @method getDescendantsForSerialization
     * @summary Returns an Array of descendants of the receiver to include in
     *     the receiver's serialization. Typically, these will be nodes that
     *     will be 'slotted' into the receiver by the author and not nodes that
     *     the template generated 'around' the slotted nodes.
     * @returns {TP.core.node[]} An Array of descendant nodes to serialize.
     */

    var selectedDescendants;

    selectedDescendants = this.get('./xctrls:label|./xctrls:value|./xctrls:hint');
    selectedDescendants = TP.expand(selectedDescendants);

    return selectedDescendants;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
