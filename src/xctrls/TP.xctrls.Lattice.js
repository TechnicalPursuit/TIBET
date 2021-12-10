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

TP.xctrls.Lattice.addTraitTypes(TP.dom.SelectingUIElementNode);
TP.xctrls.Lattice.addTraitTypes(TP.dom.D3VirtualList);

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

    tpElem.set('$numSpacerRows', 0, false);

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

TP.xctrls.Lattice.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest.
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

    //  Finalize content so that static items get keys, etc. If this is a bound
    //  element, this will be called from the setData method.
    if (!tpElem.isInboundAspect('data')) {
        tpElem.finalizeContent();
    }

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Inst.defineAttribute('$dataKeys');
TP.xctrls.Lattice.Inst.defineAttribute('$rowType');
TP.xctrls.Lattice.Inst.defineAttribute('$numSpacerRows');

TP.xctrls.Lattice.Inst.defineAttribute(
    'scroller', TP.cpc('> .scroller', TP.hc('shouldCollapse', true)));

TP.xctrls.Lattice.Inst.defineAttribute(
    'group', TP.cpc('> .scroller > tibet|group', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Inst.defineMethod('computeSelectionData',
function() {

    /**
     * @method computeSelectionData
     * @summary Returns the data that will actually be used for binding into the
     *     d3.js selection.
     * @description The selection data may very well be different than the bound
     *     data that uses TIBET data binding to bind data to this control. This
     *     method allows the receiver to transform it's 'data binding data' into
     *     data appropriate for d3.js selections.
     * @returns {Object} The selection data.
     */

    var selectionData,

        currentSpacerRowCount,

        containerHeight,
        rowHeight,

        bumpRowCount,

        visibleRowCount,

        selectionDataSize,

        lowerBumpRowBounds,
        upperBumpRowBounds,

        shouldAdd,

        realDataSize,

        additionalSpacerRowCount,
        i,

        oldSpacingRowCount;

    selectionData = this.get('data');

    //  First, make sure the converted data is valid. If not, then convert it.
    if (TP.notValid(selectionData)) {
        return this;
    }

    if (TP.isValid(selectionData)) {

        currentSpacerRowCount = this.get('$numSpacerRows');

        containerHeight = this.computeHeight();
        rowHeight = this.getRowHeight();

        bumpRowCount = this.$get('$bumpRowCount');

        //  The number of rows of data in the current selection. These will
        //  also include spacing rows if previously built by this call.
        selectionDataSize = selectionData.getSize();

        //  See if the height falls within the 'bump row' (i.e. greater than the
        //  height of the real amount of data (spacer or otherwise) we have, but
        //  less than the bump row bottom edge.
        lowerBumpRowBounds = selectionDataSize * rowHeight;
        upperBumpRowBounds = (selectionDataSize + bumpRowCount) * rowHeight;

        if (containerHeight > lowerBumpRowBounds &&
            containerHeight < upperBumpRowBounds) {
            return selectionData;
        }

        //  The number of currently displayed rows is computed by dividing the
        //  containerHeight by the rowHeight. Note here that we 'round up' to
        //  make sure that we err on the side of *more* spacing rows rather than
        //  less for maximum visual crispness.
        visibleRowCount = (containerHeight / rowHeight).ceil();

        shouldAdd = true;
        if (visibleRowCount === selectionDataSize) {
            shouldAdd = false;
        }

        //  If the list is actually tall enough to display at least one row, go
        //  for it.
        if (visibleRowCount > 0) {

            //  The "real" data size is the number of total rows minus the
            //  current number of spacing rows.
            realDataSize = selectionDataSize - currentSpacerRowCount;

            if (visibleRowCount > realDataSize && shouldAdd) {

                /* eslint-disable no-extra-parens */
                additionalSpacerRowCount =
                    (visibleRowCount - selectionDataSize) + bumpRowCount;
                /* eslint-enable no-extra-parens */

                for (i = realDataSize;
                        i < realDataSize + additionalSpacerRowCount;
                            i++) {
                    selectionData.push(
                        this.createBlankRowData(selectionData.getSize()));
                    currentSpacerRowCount++;
                }

            }

            //  If there is more data in the selection than there is in the
            //  'real' data set, that means we have 'blank filler' rows. Trim
            //  off any unnecessary ones.
            if (selectionDataSize > realDataSize) {

                oldSpacingRowCount = selectionDataSize - visibleRowCount;

                for (i = selectionDataSize - 1;
                        i >= selectionDataSize - oldSpacingRowCount;
                        i--) {
                    if (selectionData.at(i).last() !== 'BLANK') {
                        break;
                    }
                    selectionData.pop();
                    currentSpacerRowCount--;
                }
            }

            //  NB: We never let this drop below 0
            this.set('$numSpacerRows', currentSpacerRowCount.max(0), false);
        }
    }

    return selectionData;
});

//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Inst.defineMethod('d3KeyFunction',
function() {

    /**
     * @method d3KeyFunction
     * @summary Returns the Function that should be used to generate keys into
     *     the receiver's data set. By default this method returns a null key
     *     function, thereby causing d3 to use each datum in the data set as the
     *     key.
     * @description This Function should take two arguments, an individual item
     *     from the receiver's data set and it's index in the overall data set,
     *     and return a value that will act as that item's key in the overall
     *     data set.
     * @returns {Function} A Function that provides a key for the supplied data
     *     item.
     */

    var adaptor,
        adaptorType;

    adaptor = this.getAttribute('ui:adaptor');
    if (TP.notEmpty(adaptor)) {
        adaptorType = TP.sys.getTypeByName(adaptor);
    } else {
        adaptorType = this.getItemTagType();
    }

    if (!TP.isType(adaptorType)) {
        return this.callNextMethod();
    }

    return adaptorType.getKeyFunction(this);
});

//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Inst.defineMethod('getDescendantsForSerialization',
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

    selectedDescendants = this.get('./*[local-name() = \'template\']');

    selectedDescendants = TP.expand(selectedDescendants);

    return selectedDescendants;
});

//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Inst.defineMethod('getValueData',
function() {

    /**
     * @method getValueData
     * @summary Returns the 'value data' of the receiver. This will be the data
     *     'row' associated with the current value of the receiver.
     * @returns {Object|null} The value data of the receiver.
     */

    var value,
        item,
        itemNum,

        data;

    value = this.get('value');
    if (TP.isEmpty(value)) {
        return null;
    }

    //  Grab the DOM 'item' associated with the current value
    item = this.get('itemWithValue', value);
    if (TP.notValid(item)) {
        return null;
    }

    //  All DOM 'items' in an lattice have an item number. This will also be the
    //  index into the data for that item.
    itemNum = item.getAttribute(TP.ITEM_NUM);

    data = this.get('data');

    return data.at(itemNum);
});

//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Inst.defineMethod('finalizeContent',
function() {

    /**
     * @method finalizeContent
     * @summary Updates an internal data structures from static item content
     *     that the author might have put into the receiver.
     * @description This method is called when the receiver is first awakened
     *     in order to set up any data structures that are required to treat
     *     static content as we would dynamically generated content.
     * @returns {TP.xctrls.Lattice} The receiver.
     */

    var keys,
        allItems;

    keys = TP.ac();

    //  Stamp all of the items in the item content with an index (and possibly a
    //  data key if one wasn't put on there by the generation code - which
    //  happens in the case of static content).
    allItems = this.get('allItems');
    allItems.forEach(
        function(item, index) {
            var key;

            key = item.getAttribute(TP.DATA_KEY);
            if (TP.isEmpty(key)) {
                key = TP.genID();
                item.setAttribute(TP.DATA_KEY, key);
            }
            keys.push(key);

            item.setAttribute(TP.ITEM_NUM, index);
            item.addClass('item');
        });

    this.set('$dataKeys', keys, false);

    return this;
});

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

TP.xctrls.Lattice.Inst.defineMethod('getAllItems',
function() {

    /**
     * @method getAllItems
     * @summary Returns all of the receiver's item content, no matter whether it
     *     was statically supplied or generated dynamically.
     * @returns {TP.xctrls.item[]} All of the receiver's item content.
     */

    var getterPath,
        result;

    getterPath = TP.xpc(
                    './/' +
                    '*[local-name() = "content"]//' +
                    '*[substring(name(), string-length(name()) - 3) = "item"]',
                TP.hc('shouldCollapse', false));

    result = this.get(getterPath);

    return result;
});

//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Inst.defineMethod('getItemTagType',
function() {

    /**
     * @method getItemTagType
     * @summary Returns the item tag type.
     * @returns {TP.meta.xctrls.item} The item tag type.
     */

    var itemTagName;

    itemTagName = TP.ifEmpty(this.getAttribute('itemTag'),
                                this.getType().get('defaultItemTagName'));

    return TP.sys.getTypeByName(itemTagName);
});

//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Inst.defineMethod('getLabelFunction',
function() {

    /**
     * @method getLabelFunction
     * @summary Returns a Function that will be used to extract the label from
     *     the data.
     * @description If the receiver defines a 'ui:adaptor' attribute, it should
     *     be naming a type. That type should respond to 'getLabelFunction' and
     *     return the Function to be used. Otherwise, the item tag type should
     *     implement 'getLabelFunction'.
     * @returns {Function} The Function that will be used to extract the label
     *     from the data.
     */

    var adaptor,
        adaptorType;

    adaptor = this.getAttribute('ui:adaptor');
    if (TP.notEmpty(adaptor)) {
        adaptorType = TP.sys.getTypeByName(adaptor);
    } else {
        adaptorType = this.getItemTagType();
    }

    if (!TP.isType(adaptorType)) {
        return this.callNextMethod();
    }

    return adaptorType.getLabelFunction(this);
});

//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Inst.defineMethod('getTemplate',
function() {

    /**
     * @method getTemplate
     * @summary Returns the TP.dom.ElementNode that will be used as the
     *     'template' to generate content under the receiver. This template can
     *     include data binding expressions that will be used, along with the
     *     receiver's data, to generate that content.
     * @returns {TP.dom.ElementNode} The TP.dom.ElementNode to use as the
     *     template for the receiver.
     */

    var templateTPElem;

    templateTPElem = this.get(
                        TP.cpc('tibet|template',
                            TP.hc('shouldCollapse', true)));

    //  If the user didn't specify template content, then see if they provided a
    //  custom itemtag attribute.
    if (!TP.isKindOf(templateTPElem, TP.tibet.template)) {

        //  Make sure to null out the return value in case we got an empty
        //  Array.
        templateTPElem = null;
    }

    return templateTPElem;
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

TP.xctrls.Lattice.Inst.defineMethod('getValueFunction',
function() {

    /**
     * @method getValueFunction
     * @summary Returns a Function that will be used to extract the value from
     *     the data.
     * @description If the receiver defines a 'ui:adaptor' attribute, it should
     *     be naming a type. That type should respond to 'getValueFunction' and
     *     return the Function to be used. Otherwise, the item tag type should
     *     implement 'getValueFunction'.
     * @returns {Function} The Function that will be used to extract the value
     *     from the data.
     */

    var adaptor,
        adaptorType;

    adaptor = this.getAttribute('ui:adaptor');
    if (TP.notEmpty(adaptor)) {
        adaptorType = TP.sys.getTypeByName(adaptor);
    } else {
        adaptorType = this.getItemTagType();
    }

    if (!TP.isType(adaptorType)) {
        return this.callNextMethod();
    }

    return adaptorType.getValueFunction(this);
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

    this.render();

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

    this.render();

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

TP.xctrls.Lattice.Inst.defineMethod('prepareData',
function(aDataObject) {

    /**
     * @method prepareData
     * @summary Returns data that has been 'prepared' for usage by the receiver.
     * @param {Object} aDataObject The original object supplied to the receiver
     *     as it's 'data object'.
     * @returns {Object} The data object 'massaged' into a data format suitable
     *     for use by the receiver.
     */

    var dataObj,
        testSample,
        sampleType;

    //  Make sure to unwrap this from any TP.core.Content objects, etc.
    dataObj = TP.val(aDataObject);

    //  Now, make sure that we have an Array no matter what kind of data object
    //  we were handed.
    if (!TP.isArray(dataObj)) {
        if (TP.canInvoke(dataObj, 'asArray')) {
            dataObj = dataObj.asArray();
        } else {
            dataObj = Array.from(dataObj);
        }
    }

    testSample = dataObj.first();

    if (TP.isPair(testSample)) {
        sampleType = TP.PAIR;
    } else if (TP.isHash(testSample)) {
        sampleType = TP.HASH;
    } else if (TP.isPlainObject(testSample)) {
        sampleType = TP.POJO;
    } else {
        sampleType = TP.ARRAY;
    }

    this.set('$rowType', sampleType);

    return dataObj;
});

//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Inst.defineMethod('refresh',
function(shouldRender, shouldRefreshBindings, localRefreshInfo) {

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
     * @param {Boolean} [shouldRefreshBindings=true] Whether or not to refresh
     *     data bindings from the receiver down (in a 'sparse' fashion).
     * @param {TP.core.Hash} [localRefreshInfo] Information about a local-only
     *     refresh that can be used to specifically target binds that occur only
     *     *locally* on the receiver (i.e. where the receiver itself has the
     *     'bind:*' attribute). Note that if this is supplied, that a *local
     *     only* refresh will be performed and it will be the responsibility of
     *     the caller to refresh any descendant bindings, scoped to the receiver
     *     or not.
     * @returns {Boolean} Whether or not the bound value was different than the
     *     receiver already had and, therefore, truly changed.
     */

    var hasChanged,
        updatedAspects;

    //  If rendering is forced, scroll to the top of the list.
    if (shouldRender) {
        this.scrollTopToRow(0);
    }

    //  Now call the next most specific method, which will re-render the
    //  receiver.
    hasChanged = this.callNextMethod();

    //  If the bound value truly changed, clear the selection.
    if (hasChanged) {

        //  If we're doing a local-only refresh, and the aspect that is being
        //  updated is either 'data' or 'value', then reset the value to null.
        //  Otherwise, leave it alone.
        if (TP.isValid(localRefreshInfo)) {
            updatedAspects = localRefreshInfo.at('updatadAspects');
            if (TP.isArray(updatedAspects) &&
                (updatedAspects.contains('data') ||
                    updatedAspects.contains('value'))) {
                this.setValue(null);
            }
        } else {
            //  A 'general' refresh - reset the value to null.
            this.setValue(null);
        }
    }

    return hasChanged;
});

//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Inst.defineMethod('removeOldContent',
function(exitSelection) {

    /**
     * @method removeOldContent
     * @summary Removes any existing content in the receiver by altering the
     *     content in the supplied d3.js 'exit selection'.
     * @param {TP.extern.d3.selection} exitSelection The d3.js exit selection
     *     that existing content should be altered in.
     * @returns {TP.dom.D3Tag} The receiver.
     */

    var keys,
        keyFunc;

    //  Make sure to remove the keys of any 'exit selection' elements that are
    //  going away from the '$dataKeys' Array to avoid pollution.

    keys = this.get('$dataKeys');
    if (TP.notEmpty(keys)) {
        keyFunc = this.d3KeyFunction();

        exitSelection.each(
            function(data, index) {
                var key;

                key = TP.isCallable(keyFunc) ? keyFunc(data, index) : index;
                keys.remove(key);
            });
    }

    return this.callNextMethod();
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
        this.setBoundAspect('value', this.getValue());
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

    var height;

    //  Headless doesn't load the stylesheet that contains the
    //  'xctrls-item-height' variable in a timely fashion, so we just hardcode a
    //  Number here.
    if (TP.sys.isHeadless()) {
        return 20;
    }

    height = this.getComputedStyleProperty('--xctrls-item-height').asNumber();

    if (TP.isNumber(height)) {
        return height;
    }

    return 20;
});

//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Inst.defineMethod('getRowBorderHeight',
function() {

    /**
     * @method getRowBorderHeight
     * @summary Returns the height of the bottom and top borders together.
     * @returns {Number} The height of a row bottom and top borders.
     */

    var height;

    //  Headless doesn't load the stylesheet that contains the
    //  'xctrls-item-height' variable in a timely fashion, so we just hardcode a
    //  Number here.
    if (TP.sys.isHeadless()) {
        return 1;
    }

    height = this.getComputedStyleProperty(
        '--xctrls-item-border-height').asNumber();

    if (TP.isNumber(height)) {
        return height;
    }

    return 1;
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
//  TP.core.SelectingUIElementNode Methods
//  ------------------------------------------------------------------------

TP.xctrls.Lattice.Inst.defineMethod('allowsMultiples',
function() {

    /**
     * @method allowsMultiples
     * @summary Returns true if the receiver is configured for multiple
     *     selection.
     * @returns {Boolean} Whether or not the receiver allows multiple selection.
     */

    //  We allow multiples if we have the 'multiple' attribute and it's true.
    return TP.bc(this.getAttribute('multiple')) === true;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
