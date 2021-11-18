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
 * @type {TP.xctrls.imageitem}
 * @summary Manages imageitem XControls.
 */

//  ------------------------------------------------------------------------

TP.xctrls.item.defineSubtype('xctrls:imageitem');

TP.xctrls.imageitem.addTraits(TP.xctrls.TemplatedTag);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  Signals that we don't allow to bubble outside of ourself. Since we can
//  process the states associated with these signals, we don't want them to
//  proceed further up the chain.
TP.xctrls.imageitem.Type.defineAttribute('opaqueBubblingSignalNames',
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

TP.xctrls.imageitem.Type.defineMethod('isOpaqueBubblerFor',
function(anElement, aSignal, signalNames) {

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
     *     'tibet:opaque-bubbling' attribute.
     * @param {TP.sig.Signal} aSignal The signal to check.
     * @param {String[]} [signalNames] The list of signal names to use when
     *     computing opacity for the signal. This is an optional parameter. If
     *     this method needs the list of signal names and this parameter is not
     *     provided, it can be derived from the supplied signal itself.
     * @returns {Boolean} Whether or not the receiver is opaque during the
     *     bubble phase for the signal.
     */

    var groupingAncestor;

    groupingAncestor = TP.nodeDetectAncestorMatchingCSS(
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
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.imageitem.Inst.defineAttribute('imageElem',
    TP.cpc('> xctrls|image', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.imageitem.Inst.defineMethod('getDescendantsForSerialization',
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

TP.xctrls.imageitem.Inst.defineMethod('$getPrimitiveValue',
function() {

    /**
     * @method $getPrimitiveValue
     * @summary Returns the low-level primitive value stored by the receiver in
     *     internal storage.
     * @returns {String} The primitive value of the receiver.
     */

    var value;

    //  Go after child text of 'xctrls:value'
    value = this.get('string(.//xctrls:value)');

    if (TP.isEmpty(value)) {
        value = this.$getVisualToggle();
    }

    return value;
});

//  ------------------------------------------------------------------------

TP.xctrls.imageitem.Inst.defineMethod('$getVisualToggle',
function() {

    /**
     * @method $getVisualToggle
     * @summary Returns the low-level primitive 'toggle value' used by the
     *     receiver to display a 'selected' state.
     * @returns {Boolean} The low-level primitive 'toggle value' of the
     *     receiver.
     */

    return this.$isInState('pclass:selected');
});

//  ------------------------------------------------------------------------

TP.xctrls.imageitem.Inst.defineMethod('setAttrDisabled',
function(beDisabled) {

    /**
     * @method setAttrDisabled
     * @summary The setter for the receiver's disabled state.
     * @param {Boolean} beDisabled Whether or not the receiver is in a disabled
     *     state.
     * @returns {Boolean} Whether the receiver's state is disabled.
     */

    var imageElem;

    imageElem = this.get('imageElem');

    if (TP.isTrue(beDisabled)) {
        imageElem.$setAttribute('disabled', true, false);
        imageElem.$setAttribute('pclass:disabled', 'true', false);
    } else {
        imageElem.removeAttribute('disabled');
        imageElem.removeAttribute('pclass:disabled');
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xctrls.imageitem.Inst.defineMethod('$setVisualToggle',
function(aToggleValue) {

    /**
     * @method $setVisualToggle
     * @summary Sets the low-level primitive 'toggle value' used by the receiver
     *     to display a 'selected' state.
     * @param {Boolean} aToggleValue Whether or not to display the receiver's
     *     'selected' state.
     * @returns {TP.xctrls.imageitem} The receiver.
     */

    this.$isInState('pclass:selected', aToggleValue);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
