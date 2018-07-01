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
 * @type {TP.xctrls.textitem}
 * @summary Manages textitem XControls.
 */

//  ------------------------------------------------------------------------

TP.xctrls.item.defineSubtype('xctrls:textitem');

TP.xctrls.textitem.addTraits(TP.xctrls.TemplatedTag);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  Signals that we don't allow to bubble outside of ourself. Since we can
//  process the states associated with these signals, we don't want them to
//  proceed further up the chain.
TP.xctrls.textitem.Type.defineAttribute('opaqueBubblingSignalNames',
        TP.ac(
            'TP.sig.UIActivate',
            'TP.sig.UIDeactivate',

            'TP.sig.UIDeselect',
            'TP.sig.UISelect',

            'TP.sig.UIDisabled',
            'TP.sig.UIEnabled'
            ));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xctrls.textitem.Type.defineMethod('isOpaqueBubblerFor',
function(anElement, aSignal) {

    /**
     * @method isOpaqueBubblerFor
     * @summary Returns whether the elements of this type are considered to be
     *     an 'opaque bubbler' for the supplied signal (i.e. it won't let the
     *     signal 'ascend' further up its parent hierarchy). This means that
     *     they will handle the signal themselves and not allow ancestors above
     *     them to handle it.
     * @description At this level, we override this method because, if we're a
     *     descendant of a 'grouping element' (like TP.xctrls.itemgroup,
     *     TP.xctrls.list, etc., then we return false, allowing the grouping
     *     element to determine whether it's an opaque bubbler or not.
     *     Otherwise, we just callNextMethod, which uses our
     *     'opaqueBubblingSignalNames' list and/or a defined attribute on the
     *     element.
     * @param {Element} anElem The element to check for the
     *     'tibet:opaquebubbling' attribute.
     * @param {TP.sig.Signal} aSignal The signal to check.
     * @returns {Boolean} Whether or not the receiver is opaque during the
     *     bubble phase for the signal.
     */

    var groupingAncestor;

    groupingAncestor = TP.nodeAncestorMatchingCSS(
                                        anElement,
                                        'xctrls|itemgroup,' +
                                        'xctrls|list,' +
                                        'xctrls|table');

    if (TP.isElement(groupingAncestor)) {
        return false;
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.textitem.Inst.defineMethod('getDescendantsForSerialization',
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

    selectedDescendants =
                this.get('./xctrls:label|./xctrls:value|./xctrls:hint');
    selectedDescendants = TP.expand(selectedDescendants);

    return selectedDescendants;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
