//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/**
 * @type {TP.xctrls.Lattice}
 */

//  ------------------------------------------------------------------------

TP.xctrls.TemplatedTag.defineSubtype('xctrls:Lattice');

//  This type is intended to be used as a supertype of concrete types, so we
//  don't allow instance creation
TP.xctrls.Lattice.isAbstract(true);

TP.xctrls.Lattice.addTraits(TP.dom.SelectingUIElementNode);
TP.xctrls.Lattice.addTraits(TP.dom.D3VirtualList);

TP.xctrls.Lattice.Inst.resolveTrait('isReadyToRender', TP.dom.UIElementNode);
TP.xctrls.Lattice.Inst.resolveTrait('select', TP.dom.SelectingUIElementNode);
TP.xctrls.Lattice.Inst.resolveTrait('render', TP.dom.D3VirtualList);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Type.defineAttribute('opaqueCapturingSignalNames',
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

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Type.defineMethod('tagAttachComplete',
function(aRequest) {

    /**
     * @method tagAttachComplete
     * @summary Executes once the tag has been fully processed and its
     *     attachment phases are fully complete.
     * @description Because tibet:data tag content drives binds and we need to
     *     notify even without a full page load, we notify from here once the
     *     attachment is complete (instead of during tagAttachData).
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    tpElem = TP.wrap(elem);

    //  Observe ourself for when we're resized
    tpElem.observe(tpElem, TP.ac('TP.sig.DOMResize', 'TP.sig.DOMVisible'));

    tpElem.set('$numSpacingRows', 0, false);

    //  If we're not ready to render (i.e. our stylesheet hasn't loaded yet),
    //  then just return. When our stylesheet loads, it will trigger the
    //  TP.sig.DOMReady signal.
    if (!tpElem.isReadyToRender()) {
        return;
    }

    //  Signal that we are ready.
    tpElem.dispatch('TP.sig.DOMReady');

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Type.defineMethod('tagDetachComplete',
function(aRequest) {

    /**
     * @method tagDetachComplete
     * @summary Executes when the tag's detachment phases are fully complete.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    tpElem = TP.wrap(elem);

    //  We signed up with ourself for resize signals when our stylesheet was
    //  ready. We're going away now, so we need to clean up.
    tpElem.ignore(tpElem, TP.ac('TP.sig.DOMResize', 'TP.sig.DOMVisible'));

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Inst.defineAttribute('$numSpacingRows');

//  The data as massaged into what this control needs. This is reset whenever
//  the control's whole data set is reset.
TP.xctrls.Lattice.Inst.defineAttribute('$convertedData');

TP.xctrls.Lattice.Inst.defineAttribute(
    'scroller', TP.cpc('> .scroller', TP.hc('shouldCollapse', true)));

TP.xctrls.Lattice.Inst.defineAttribute(
    'group', TP.cpc('> .scroller > tibet|group', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Inst.defineMethod('focus',
function(moveAction) {

    /**
     * @method focus
     * @summary Focuses the receiver for keyboard input.
     * @param {String} moveAction The type of 'move' that the user requested.
     *     This can be one of the following:
     *          TP.FIRST
     *          TP.LAST
     *          TP.NEXT
     *          TP.PREVIOUS
     *          TP.FIRST_IN_GROUP
     *          TP.LAST_IN_GROUP
     *          TP.FIRST_IN_NEXT_GROUP
     *          TP.FIRST_IN_PREVIOUS_GROUP
     *          TP.FOLLOWING
     *          TP.PRECEDING
     * @returns {TP.xctrls.Lattice} The receiver.
     */

    //  We're not a valid focus target, but our group is.
    return this.get('group').focus(moveAction);
});

//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Inst.defineMethod('getValue',
function() {

    /**
     * @method getValue
     * @summary Returns the value of the receiver. For a UI element this method
     *     will ensure any storage formatters are invoked.
     * @returns {String} The value in string form.
     */

    var value,

        type,
        formats;

    value = this.getDisplayValue();

    //  Given that this type can represent multiple items, it may return an
    //  Array. We should check to make sure the Array isn't empty before doing
    //  any more work.
    if (TP.notEmpty(value)) {

        //  If the receiver has a 'ui:type' attribute, then try first to convert
        //  the content to that type before trying to format it.
        if (TP.notEmpty(type = this.getAttribute('ui:type'))) {
            if (!TP.isType(type = TP.sys.getTypeByName(type))) {
                return this.raise('TP.sig.InvalidType');
            } else {
                value = type.fromString(value);
            }
        }

        //  If the receiver has a 'ui:storage' attribute, then format the return
        //  value according to the formats found there.
        //  the content to that type before trying to format it.
        if (TP.notEmpty(formats = this.getAttribute('ui:storage'))) {
            value = this.$formatValue(value, formats);
        }
    }

    return value;
});

//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Inst.defineHandler('DOMResize',
function(aSignal) {

    /**
     * @method handleDOMResize
     * @param {TP.sig.DOMResize} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.xctrls.Lattice} The receiver.
     */

    var currentRowCount,

        newRowCount;

    currentRowCount = this.$get('$endOffset') - this.$get('$startOffset');
    newRowCount = this.computeGeneratedRowCount();

    if (newRowCount !== currentRowCount) {
        //  When the number of rows changed, we have to re-render.
        this.render();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Inst.defineHandler('DOMVisible',
function(aSignal) {

    /**
     * @method handleDOMVisible
     * @param {TP.sig.DOMVisible} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.xctrls.Lattice} The receiver.
     */

    var currentRowCount,

        newRowCount;

    currentRowCount = this.$get('$endOffset') - this.$get('$startOffset');
    newRowCount = this.computeGeneratedRowCount();

    if (newRowCount !== currentRowCount) {
        //  When the number of rows changed, we have to re-render.
        this.render();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Inst.defineMethod('isScalarValued',
function(aspectName) {

    /**
     * @method isScalarValued
     * @summary Returns true if the receiver deals with scalar values.
     * @description See the TP.dom.Node's 'isScalarValued()' instance method
     *     for more information.
     * @param {String} [aspectName] An optional aspect name that is being used
     *     by the caller to determine whether the receiver is scalar valued for.
     * @returns {Boolean} For this type, this returns true.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Inst.defineMethod('refresh',
function(shouldRender, shouldRefreshBindings) {

    /**
     * @method refresh
     * @summary Updates the receiver's content by refreshing all bound elements
     *     in the document. For an HTML document this will refresh content under
     *     the body, while in an XML document all elements including the
     *     documentElement are refreshed.
     * @param {Boolean} [shouldRender] Whether or not to force (or not force)
     *     re-rendering if the data source changes. If not supplied, this
     *     parameter will default to true if the bound data changed and false if
     *     it didn't.
     * @param {Boolean} [shouldRefreshBindings] Whether or not to refresh data
     *     bindings from the receiver down (in a 'sparse' fashion). If not
     *     supplied, this parameter will default to true.
     * @returns {Boolean} Whether or not the bound value was different than the
     *     receiver already had and, therefore, truly changed.
     */

    var hasChanged;

    //  If rendering is forced, scroll to the top of the list.
    if (shouldRender) {
        this.scrollTopToRow(0);
    }

    //  Now call the next most specific method, which will re-render the
    //  receiver.
    hasChanged = this.callNextMethod();

    //  If the bound value truly changed, clear the selection.
    if (hasChanged) {
        this.setValue(null);
    }

    return hasChanged;
});

//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Inst.defineMethod('scrollTopToRow',
function(rowNum) {

    /**
     * @method scrollTopToRow
     * @summary Scroll the 'top' of the receiver to the row provided.
     * @param {Number} rowNum The number of the row to scroll to.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.xctrls.Lattice} The receiver.
     */

    var elem,
        rowHeight,
        displayedRows,

        startIndex,

        scrollAmount;

    if (!TP.isNumber(rowNum)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    elem = this.getNativeNode();

    rowHeight = this.getRowHeight();

    //  The current starting row is whatever our current scrollTop setting is
    //  divided by our row height.
    startIndex = (elem.scrollTop / rowHeight).floor();

    //  And the number of rows we're currently displaying is our overall element
    //  divided by our row height.
    displayedRows = (this.getHeight() / rowHeight).floor();

    if (rowNum === 0) {
        scrollAmount = 0;
    } else if (rowNum < startIndex + 1) {
        //  It's above the scrollable area - scroll up
        scrollAmount = rowNum * rowHeight;
    } else if (rowNum > startIndex + displayedRows - 1) {
        //  It's below the scrollable area - scroll down
        scrollAmount = (rowNum - displayedRows + 1) * rowHeight;
    } else {
        return this;
    }

    //  Adjust the scrolling amount.
    elem.scrollTop = scrollAmount;

    //  When the control scrolls without mouse involvement, we have to
    //  re-render.
    this.render();

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Inst.defineMethod('setAttrDisabled',
function(beDisabled) {

    /**
     * @method setAttrDisabled
     * @summary The setter for the receiver's disabled state.
     * @param {Boolean} beDisabled Whether or not the receiver is in a disabled
     *     state.
     * @returns {Boolean} Whether the receiver's state is disabled.
     */

    this.get('group').setAttrDisabled(beDisabled);

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Inst.defineMethod('setAttrId',
function(anID) {

    /**
     * @method setAttrId
     * @summary The setter for the receiver's id attribute.
     * @param {String} anID The ID to use for the receiver and its subelements.
     */

    var elem,

        groupElem;

    elem = this.getNativeNode();

    //  Update the group element's 'id'.
    groupElem = TP.unwrap(this.get('group'));
    TP.elementSetAttribute(groupElem, 'id', anID + '_group', true);

    //  Note - we do not call 'setAttribute()' against the receiver here - don't
    //  want to endlessly recurse ;-).
    TP.elementSetAttribute(elem, 'id', anID, true);

    //  setting an attribute returns void according to the spec
    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the receiver.
     * @returns {TP.xctrls.Lattice} The receiver.
     */

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  If we're disabled, make sure our group is too - that's what the focus
    //  management system is going to be looking at.
    if (this.hasAttribute('disabled')) {
        this.get('group').setAttribute('disabled', true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Inst.defineMethod('setValue',
function(aValue, shouldSignal) {

    /**
     * @method setValue
     * @summary Sets the value of the receiver's node. For a UI element this
     *     method will ensure any display formatters are invoked. NOTE that this
     *     method does not update the receiver's bound value if it's a bound
     *     control. In fact, this method is used in response to a change in the
     *     bound value to update the display value, so this method should avoid
     *     changes to the bound value to avoid recursions.
     * @param {Object} aValue The value to set the 'value' of the node to.
     * @param {Boolean} shouldSignal Should changes be notified. If false
     *     changes are not signaled. Defaults to this.shouldSignalChange().
     * @returns {Boolean} Whether or not the value was changed from the value it
     *     had before this method was called.
     */

    var oldValue,
        newValue,

        displayValue,

        flag;

    oldValue = this.getValue();

    newValue = this.produceValue('value', aValue);

    //  If the values are equal, then either re-render if the new value is a
    if (TP.equal(TP.str(oldValue), TP.str(newValue))) {

        //  If the new value is a collection itself, then it will have changed
        //  'beneath' us and we won't see it as a change (i.e. oldValue and
        //  newValue will be the same, because we're holding a collection of
        //  collections). In this case, we reset the convertedData (so that the
        //  re-rendering will regenerate this data and d3.js will 'see' it as a
        //  change), call render and return true (since we assume the value
        //  changed).
        //  Otherwise, we just return false

        if (TP.isCollection(newValue)) {
            this.set('$convertedData', null, false);
            this.render();

            return true;
        }

        return false;
    }

    this.setDisplayValue(newValue);

    //  signal as needed

    displayValue = this.getDisplayValue();

    //  Sometimes the display value computed from the new value can be equal to
    //  the old value. If that's *not* the case, then propagate and set the
    //  bound value.
    if (!TP.equal(oldValue, displayValue)) {
        //  NB: Use this construct this way for better performance
        if (TP.notValid(flag = shouldSignal)) {
            flag = this.shouldSignalChange();
        }

        if (flag) {
            this.$changed('value', TP.UPDATE,
                            TP.hc(TP.OLDVAL, oldValue, TP.NEWVAL, newValue));
        }

        //  If the element is bound, then update its bound value.
        this.setBoundValueIfBound(this.getValue());
    }

    return true;
});

//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Inst.defineMethod('stylesheetReady',
function(aStyleTPElem) {

    /**
     * @method stylesheetReady
     * @summary A method that is invoked when the supplied stylesheet is
     *     'ready', which means that it's attached to the receiver's Document
     *     and all of it's style has been parsed and applied.
     * @param {TP.html.style} aStyleTPElem The XHTML 'style' element that is
     *     ready.
     * @returns {TP.xctrls.Lattice} The receiver.
     */

    this.render();

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  TP.dom.D3Tag Methods
//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Inst.defineMethod('getRowHeight',
function() {

    /**
     * @method getRowHeight
     * @summary Returns the height of each element of the row. This should
     *     correspond to the 'offsetHeight' of each row when the list is
     *     rendered.
     * @returns {Number} The height of a row when rendered.
     */

    //  Headless doesn't load the stylesheet that contains the
    //  'xctrls-item-height' variable in a timely fashion, so we just hardcode a
    //  Number here.
    if (TP.sys.cfg('boot.context') === 'headless') {
        return 20;
    }

    return this.getComputedStyleProperty(
                        '--xctrls-item-height').asNumber();
});

//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Inst.defineMethod('getRowBorderHeight',
function() {

    /**
     * @method getRowBorderHeight
     * @summary Returns the height of the bottom and top borders together.
     * @returns {Number} The height of a row bottom and top borders.
     */

    return this.getComputedStyleProperty(
                        '--xctrls-item-border-height').asNumber();
});

//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Inst.defineMethod('getScrollingContainer',
function() {

    /**
     * @method getScrollingContainer
     * @summary Returns the Element that will be used as the 'scrolling
     *     container'. This is the element that will be the container of the
     *     list of items and will be translated to perform scrolling
     * @returns {Element} The element to use as the scrolling container.
     */

    return TP.unwrap(this.get('scroller'));
});

//  ------------------------------------------------------------------------
//  TP.core.SelectingUIElement Methods
//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Inst.defineMethod('allowsMultiples',
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
//  end
//  ========================================================================
