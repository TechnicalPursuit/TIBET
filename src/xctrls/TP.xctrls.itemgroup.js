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
     * @returns {Boolean} False for this type as it't not single valued.
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
     */

    var domTarget,
        wrappedDOMTarget,

        value;

    if (this.shouldPerformUIHandler(aSignal)) {

        //  Get the resolved DOM target - this should be the item that was
        //  deactivated (i.e. because of a mouse up or a Enter key up, etc)
        domTarget = aSignal.getResolvedDOMTarget();

        //  Wrap it and if it's actually us (the group - maybe because the user
        //  clicked in a tiny area that doesn't contain a list item), we're not
        //  interested.
        wrappedDOMTarget = TP.wrap(domTarget);
        if (wrappedDOMTarget === this) {
            return;
        }

        //  Grab the value of the item.
        value = wrappedDOMTarget.$getPrimitiveValue();
        if (TP.isEmpty(value)) {
            return;
        }

        //  Toggle it.
        this.toggleValue(value);

        //  If the element is bound, then update its bound value.
        //  NOTE: we use the control's display value, which might not
        //  necessarily be the value we have above. If this is multi-select
        //  group, we want the *whole* displayed value (which, in that case,
        //  would be an Array). Therefore, we need to fetch the whole display
        //  value here to set as the bound value.
        this.setBoundValueIfBound(this.getDisplayValue());

        //  Make sure that we stop propagation here so that we don't get any
        //  more responders further up in the chain processing this.
        aSignal.stopPropagation();
    }

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
