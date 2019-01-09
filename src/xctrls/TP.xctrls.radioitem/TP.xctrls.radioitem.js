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
 * @type {TP.xctrls.radioitem}
 * @summary Manages radioitem XControls.
 */

//  ------------------------------------------------------------------------

TP.xctrls.item.defineSubtype('xctrls:radioitem');

TP.xctrls.radioitem.addTraits(TP.xctrls.TemplatedTag);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.radioitem.Inst.defineAttribute('valuePElem',
    TP.cpc('> *[tibet|pelem="value"]', TP.hc('shouldCollapse', true)));

//  Signals that we don't allow to bubble outside of ourself. Since we can
//  process the states associated with these signals, we don't want them to
//  proceed further up the chain.
TP.xctrls.radioitem.Type.defineAttribute('opaqueBubblingSignalNames',
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

TP.xctrls.radioitem.Type.defineMethod('isOpaqueBubblerFor',
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
     *     TP.xctrls.list, etc.), then we return false, allowing the grouping
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

TP.xctrls.radioitem.Inst.defineMethod('$getVisualToggle',
function() {

    /**
     * @method $getVisualToggle
     * @summary Returns the low-level primitive 'toggle value' used by the
     *     receiver to display a 'checked' state.
     * @returns {Boolean} The low-level primitive 'toggle value' of the
     *     receiver.
     */

    return this.$isInState('pclass:checked');
});

//  ------------------------------------------------------------------------

TP.xctrls.radioitem.Inst.defineMethod('getDescendantsForSerialization',
function() {

    /**
     * @method getDescendantsForSerialization
     * @summary Returns an Array of descendants of the receiver to include in
     *     the receiver's serialization. Typically, these will be nodes that
     *     will be 'slotted' into the receiver by the author and not nodes that
     *     the template generated 'around' the slotted nodes.
     * @returns {TP.dom.Node[]} An Array of descendant nodes to serialize.
     */

    var selectedDescendants;

    selectedDescendants =
                this.get('./xctrls:label|./xctrls:value|./xctrls:hint');
    selectedDescendants = TP.expand(selectedDescendants);

    return selectedDescendants;
});

//  ------------------------------------------------------------------------

TP.xctrls.radioitem.Inst.defineMethod('setAttrDisabled',
function(beDisabled) {

    /**
     * @method setAttrDisabled
     * @summary The setter for the receiver's disabled state.
     * @param {Boolean} beDisabled Whether or not the receiver is in a disabled
     *     state.
     * @returns {Boolean} Whether the receiver's state is disabled.
     */

    var valuePElem;

    valuePElem = this.get('valuePElem');

    if (TP.isTrue(beDisabled)) {
        valuePElem.$setAttribute('disabled', true, false);
        valuePElem.$setAttribute('pclass:disabled', 'true', false);
    } else {
        valuePElem.removeAttribute('disabled');
        valuePElem.removeAttribute('pclass:disabled');
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xctrls.radioitem.Inst.defineMethod('$setVisualToggle',
function(aToggleValue) {

    /**
     * @method $setVisualToggle
     * @summary Sets the low-level primitive 'toggle value' used by the receiver
     *     to display a 'checked' state.
     * @param {Boolean} aToggleValue Whether or not to display the receiver's
     *     'checked' state.
     * @returns {TP.xctrls.radioitem} The receiver.
     */

    this.$isInState('pclass:checked', aToggleValue);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
