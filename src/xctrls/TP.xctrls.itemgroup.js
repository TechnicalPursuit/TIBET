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
 * @type {TP.xctrls.itemgroup}
 * @summary Manages groups of items.
 */

//  ------------------------------------------------------------------------

TP.tibet.group.defineSubtype('xctrls:itemgroup');

TP.xctrls.itemgroup.addTraits(TP.dom.TogglingUIElementNode);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  Signals that we don't allow to bubble outside of ourself. Since we can
//  process the states associated with these signals, we don't want them to
//  proceed further up the chain.
TP.xctrls.itemgroup.Type.defineAttribute('opaqueBubblingSignalNames',
        TP.ac(
            'TP.sig.UIActivate',
            'TP.sig.UIDeactivate',

            'TP.sig.UIDeselect',
            'TP.sig.UISelect',

            'TP.sig.UIDisabled',
            'TP.sig.UIEnabled'
            ));

TP.xctrls.itemgroup.Type.defineAttribute('opaqueCapturingSignalNames',
        TP.ac(
            'TP.sig.DOMClick',
            'TP.sig.DOMDblClick',

            'TP.sig.DOMKeyDown',
            'TP.sig.DOMKeyPress',
            'TP.sig.DOMKeyUp',

            'TP.sig.DOMMouseDown',
            'TP.sig.DOMMouseEnter',
            'TP.sig.DOMMouseLeave',
            'TP.sig.DOMMouseOut',
            'TP.sig.DOMMouseOver',
            'TP.sig.DOMMouseUp',

            'TP.sig.DOMFocus',
            'TP.sig.DOMBlur'
        ));

TP.xctrls.itemgroup.Type.set('bidiAttrs', TP.ac('value'));

//  This tag has no associated CSS. Note how these properties are TYPE_LOCAL, by
//  design.
TP.xctrls.itemgroup.defineAttribute('styleURI', TP.NO_RESULT);
TP.xctrls.itemgroup.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.itemgroup.Inst.defineMethod('allowsMultiples',
function() {

    /**
     * @method allowsMultiples
     * @summary Returns true if the receiver is configured for multiple
     *     selection.
     * @returns {Boolean} Whether or not the receiver allows multiple selection.
     */

    //  We allow multiples if we have the 'multiple' attribute.
    return this.hasAttribute('multiple');
});

//  ------------------------------------------------------------------------

TP.xctrls.itemgroup.Inst.defineMethod('getValueElements',
function() {

    /**
     * @method getValueElements
     * @summary Returns an Array TP.dom.UIElementNodes that share a common
     *     'value object' with the receiver. That is, a change to the 'value' of
     *     the receiver will also change the value of one of these other
     *     TP.dom.UIElementNodes. By default, this method will return other
     *     elements that are part of the same 'tibet:group'.
     * @returns {TP.dom.UIElementNode[]} The Array of shared value items.
     */

    var valueTPElems;

    valueTPElems = this.getMemberElements();

    if (TP.isEmpty(valueTPElems)) {
        valueTPElems.push(this);
    } else {

        valueTPElems =
            valueTPElems.select(
                    function(aTPElem) {
                        return TP.isKindOf(aTPElem, TP.xctrls.item);
                    });
    }

    return valueTPElems;
});

//  ------------------------------------------------------------------------

TP.xctrls.itemgroup.Inst.defineMethod('isSingleValued',
function(aspectName) {

    /**
     * @method isSingleValued
     * @summary Returns true if the receiver deals with single values.
     * @description See the TP.dom.Node's 'isScalarValued()' instance method
     *     for more information.
     * @param {String} [aspectName] An optional aspect name that is being used
     *     by the caller to determine whether the receiver is single valued for.
     * @returns {Boolean} False for this type as it's not single valued.
     */

    return false;
});

//  ------------------------------------------------------------------------

TP.xctrls.itemgroup.Inst.defineHandler('UIDeactivate',
function(aSignal) {

    /**
     * @method handleUIDeactivate
     * @param {TP.sig.UIDeactivate} aSignal The signal that caused this handler
     *     to trip.
     * @returns {TP.xctrls.itemgroup} The receiver.
     */

    var domTarget,
        wrappedDOMTarget,

        newValue,
        oldValue,

        alwaysSignalChange,

        wasSignalingChange,

        toggleItems;

    if (this.shouldPerformUIHandler(aSignal)) {

        //  Get the resolved DOM target - this should be the item that was
        //  deactivated (i.e. because of a mouse up or a Enter key up, etc)
        domTarget = aSignal.getResolvedDOMTarget();

        //  Wrap it and if it's actually us (the group - maybe because the user
        //  clicked in a tiny area that doesn't contain a list item), we're not
        //  interested.
        wrappedDOMTarget = TP.wrap(domTarget);
        if (wrappedDOMTarget === this) {
            return this;
        }

        //  Grab the value of the item.
        newValue = wrappedDOMTarget.$getPrimitiveValue();
        if (TP.isEmpty(newValue)) {
            return this;
        }

        //  Grab the old value before we set it.
        oldValue = this.getValue();

        //  If we always signal change, then even if the values are equal,
        //  we will not exit here.
        alwaysSignalChange = TP.bc(this.getAttribute('alwaysSignalChange'));

        //  If we don't always signal change and the two values are equivalent,
        //  than just return.
        if (!alwaysSignalChange && TP.equal(oldValue, newValue)) {
            return this;
        }

        //  If the item was already selected, then deselect the value.
        //  Otherwise, select it.

        //  Note here how we turn off change signaling to avoid multiple
        //  unnecessary calls to render.
        wasSignalingChange = this.shouldSignalChange();
        this.shouldSignalChange(false);

        //  See if we 'toggle' items - if so and the item is selected, we'll
        //  deselect it. The default is true.
        if (this.hasAttribute('toggleItems')) {
            toggleItems = TP.bc(this.getAttribute('toggleItems'));
        } else {
            toggleItems = true;
        }

        //  If we 'toggle' items - Toggle it.
        if (toggleItems) {
            this.toggleValue(newValue);
        }

        this.changed('value', TP.UPDATE,
                        TP.hc(TP.OLDVAL, oldValue, TP.NEWVAL, newValue));

        //  If the element is bound, then update its bound value.
        //  NOTE: we use the control's display value, which might not
        //  necessarily be the value we have above. If this is multi-select
        //  group, we want the *whole* displayed value (which, in that case,
        //  would be an Array). Therefore, we need to fetch the whole display
        //  value here to set as the bound value.
        this.setBoundValueIfBound(this.getDisplayValue());

        this.shouldSignalChange(wasSignalingChange);

        //  Make sure that we stop propagation here so that we don't get any
        //  more responders further up in the chain processing this.
        aSignal.stopPropagation();
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
