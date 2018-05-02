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
 * @type {TP.xctrls.list}
 */

//  ------------------------------------------------------------------------

TP.xctrls.Lattice.defineSubtype('xctrls:list');

/**
 * The tag name of the tag to use for each item if there is no template.
 * @type {String}
 */
TP.xctrls.list.Type.defineAttribute('defaultItemTagName', 'xctrls:textitem');

//  Note how this property is TYPE_LOCAL, by design.
TP.xctrls.list.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.xctrls.list.Type.set('bidiAttrs', TP.ac('value'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xctrls.list.Type.defineMethod('onkeyup',
function(aTargetElem, anEvent) {

    /**
     * @method onkeyup
     * @summary Handles a 'keyup' native event that was dispatched against the
     *     supplied native element.
     * @param {HTMLElement} aTargetElem The target element computed for this
     *     signal.
     * @param {Event} anEvent The native event that was triggered.
     * @exception TP.sig.InvalidElement
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var listTPElem,

        accumValue,
        keyname,

        key;

    if (!TP.isElement(aTargetElem)) {
        return this.raise('TP.sig.InvalidElement');
    }

    //  First, make sure that the target element has an 'autocomplete'
    //  attribute. If not, just 'call up' and bail out.
    if (!TP.elementHasAttribute(aTargetElem, 'autocomplete')) {
        return this.callNextMethod();
    }

    listTPElem = TP.wrap(aTargetElem);

    //  Grab the value that we're accumulating for autocompletion.
    accumValue = listTPElem.get('autocompleteValue');

    //  Grab the name of the signal that would be signaled.
    keyname = TP.eventGetDOMSignalName(anEvent);

    //  If we're backing up, then slice off the last character.
    if (keyname === 'DOM_Backspace_Up') {
        if (TP.isEmpty(accumValue)) {
            return this.callNextMethod();
        }

        //  Slice off the end of the accumulated value
        accumValue = accumValue.slice(0, -1);
    } else if (keyname === 'DOM_Esc_Up') {
        //  We're exiting - set the accumulated value to the empty String.
        accumValue = '';
    } else if (TP.core.Keyboard.isPrintable(anEvent)) {

        //  If we're dealing with a printable character, then grab the virtual
        //  key that corresponds to it and append that to the accumulated value.
        key = TP.core.Keyboard.getEventVirtualKey(anEvent);
        accumValue = accumValue + key;
    } else {
        //  Otherwise, it was a non-printable key that we don't handle, so 'call
        //  up' and exit here.
        return this.callNextMethod();
    }

    //  Set the accumulated value to the newly computed value.
    listTPElem.set('autocompleteValue', accumValue);

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  The whole (unfiltered) data set being managed by the control.
TP.xctrls.list.Inst.defineAttribute('$wholeData');
TP.xctrls.list.Inst.defineAttribute('$dataKeys');

//  The accumulated value being kept by the control for autocomplete purposes.
TP.xctrls.list.Inst.defineAttribute('autocompleteValue');

//  The search object being used by the control for autocomplete purposes.
TP.xctrls.list.Inst.defineAttribute('$autocompleterSearcher');

//  The data as massaged into what this control needs. This is reset whenever
//  the control's whole data set is reset.
TP.xctrls.list.Inst.defineAttribute('$convertedData');

TP.xctrls.list.Inst.defineAttribute(
    'listcontent',
    TP.cpc('> .scroller xctrls|content', TP.hc('shouldCollapse', true)));

TP.xctrls.list.Inst.defineAttribute(
    'listitems',
    TP.cpc('> .scroller xctrls|content > xctrls|*',
                                        TP.hc('shouldCollapse', false)));

TP.xctrls.list.Inst.defineAttribute(
    'focusedItem',
    TP.cpc('> .scroller xctrls|content > xctrls|*[pclass|focus]',
            TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.list.Inst.defineMethod('filter',
function(aTerm) {

    /**
     * @method filter
     * @summary Filters the receiver's data set by using the supplied search
     *     in a fuzzy search algorithm, rerenders its content and, if the search
     *     term is not empty, a small sticky over the right hand side of the
     *     receiver to indicate to the user what the current search term value
     *     is..
     * @param {String} aTerm The search term to use to filter the data.
     * @returns {TP.xctrls.list} The receiver.
     */

    var hasFocus,

        searcher,
        searchResults,

        wholeData,

        filteredData,

        ourDocument,
        stickyTPElem,

        positionPoint,

        ourBorderVals,
        itemBorderVals,
        stickyOffset,

        xCoord,

        termWidth;

    hasFocus = this.hasFocus();

    //  If the search term is empty, then close the sticky, reset our data back
    //  to our whole data set and focus the first item.
    if (TP.isEmpty(aTerm)) {
        this.signal('CloseSticky');

        this.setData(this.$get('$wholeData'), false, true);

        if (hasFocus) {
            this.get('listitems').first().focus();
        }
    } else {

        //  Otherwise, grab the searcher to search through our data set. The
        //  searcher's matcher's data set is set in the setData call after the
        //  data it uses has been computed.
        searcher = this.get('$autocompleterSearcher');
        searcher.get('matchers').first().set(
                        'minMatchCharLength', aTerm.getSize());

        //  Use the searcher to produce a set of search results.
        searchResults = searcher.searchUsing(aTerm);

        //  Based on the type of our whole data set, generate a set of filtered
        //  data using the match results as computed by the searcher.
        wholeData = this.get('$wholeData');

        if (TP.isHash(wholeData)) {
            filteredData = TP.hc();
            searchResults.perform(
                function(aResult) {
                    filteredData.atPut(aResult.text, aResult.displayText);
                });
        } else if (TP.isPlainObject(wholeData)) {
            filteredData = {};
            searchResults.perform(
                function(aResult) {
                    filteredData[aResult.text] = aResult.displayText;
                });
        } else if (TP.isPair(wholeData.first())) {
            filteredData = TP.ac();
            searchResults.perform(
                function(aResult) {
                    filteredData.push(
                        TP.ac(aResult.text, aResult.displayText));
                });
        } else if (TP.isArray(wholeData)) {
            filteredData = searchResults.collect(
                function(aResult) {
                    return aResult.text;
                });
        }

        //  Grab our shared sticky, set it to the search term and position it
        //  relative to ourself.
        ourDocument = this.getDocument();

        stickyTPElem = TP.byId('XCtrlsListFilterSticky', ourDocument);

        positionPoint = this.getGlobalPoint();

        //  Compute our border right value and our first item's border right
        //  value. Sum that and use it as the 'stickyOffset', so that the right
        //  edge of the sticky doesn't overlay our right edge.
        ourBorderVals = TP.elementGetComputedStyleValuesInPixels(
                            this.getNativeNode(),
                            TP.ac('borderRightWidth'));
        itemBorderVals = TP.elementGetComputedStyleValuesInPixels(
                            this.get('listitems').first().getNativeNode(),
                            TP.ac('borderRightWidth'));
        stickyOffset = ourBorderVals.at('borderRightWidth') +
                        itemBorderVals.at('borderRightWidth');

        //  If we already have a valid sticky element for xctrls:list controls,
        //  then set it's content and unhide it.
        if (TP.isValid(stickyTPElem)) {
            stickyTPElem.setContent(aTerm);
            stickyTPElem.setAttribute('hidden', false);

            //  Compute the xCoord for the sticky and position it based on that.
            xCoord = positionPoint.getX() +
                        this.getWidth() -
                        stickyTPElem.getWidth() -
                        stickyOffset;

            positionPoint.setX(xCoord);
            stickyTPElem.setGlobalPosition(positionPoint);
        } else {

            //  There is no sticky currently set up, so we compute the position
            //  where we want the new sticky to appear and position it based on
            //  that.

            xCoord = positionPoint.getX() + this.getWidth();

            termWidth = TP.elementGetPixelValue(
                            this.getNativeNode(),
                            aTerm.getSize() + 'em',
                            'width',
                            false);

            xCoord -= termWidth - stickyOffset;

            positionPoint.setX(xCoord);

            //  Fire a signal to open the sticky.
            this.signal(
                'OpenSticky',
                TP.hc(
                    'overlayID', 'XCtrlsListFilterSticky',
                    'useTopLevelContentElem', true,
                    'content', aTerm,
                    'triggerTPDocument', ourDocument,
                    'triggerPoint', positionPoint));
        }

        //  If there is no filtered data, then use the whole data set.
        if (TP.isEmpty(filteredData)) {
            filteredData = wholeData;
        }

        this.deselectAll();

        //  NB: This will re-render - our focused item will be gone.
        this.setData(filteredData, false, true);

        //  Focus the first item
        if (hasFocus) {
            this.get('listitems').first().focus();
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.list.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @method getDisplayValue
     * @summary Returns the selected value of the select list. This corresponds
     *     to the value of the currently selected item or items.
     * @exception TP.sig.InvalidValueElements
     * @returns {String|Array} A String containing the selected value or an
     *     Array of zero or more selected values if the receiver is set up to
     *     allow multiple selections.
     */

    var selectionModel,
        entryArray;

    selectionModel = this.$getSelectionModel();

    entryArray = selectionModel.at('value');
    if (TP.notValid(entryArray)) {
        entryArray = TP.ac();
    }

    if (!this.allowsMultiples()) {
        return entryArray.first();
    }

    return entryArray;
});

//  ------------------------------------------------------------------------

TP.xctrls.list.Inst.defineMethod('getDescendantsForSerialization',
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

    selectedDescendants = this.get('./*[local-name() = \'template\']');

    selectedDescendants = TP.expand(selectedDescendants);

    return selectedDescendants;
});

//  ------------------------------------------------------------------------

TP.xctrls.list.Inst.defineHandler('UIDeactivate',
function(aSignal) {

    /**
     * @method handleUIDeactivate
     * @param {TP.sig.UIDeactivate} aSignal The signal that caused this handler
     *     to trip.
     */

    var domTarget,
        wrappedDOMTarget,

        altItemTag,
        itemType,

        valueTPElem,

        newValue,
        oldValue,

        wasSignalingChange;

    if (this.shouldPerformUIHandler(aSignal)) {

        //  Get the resolved DOM target - this should be the list item that was
        //  activated (i.e. because of a mouse up or a Enter key up, etc)
        domTarget = aSignal.getResolvedDOMTarget();

        //  Wrap it and if it's actually us (the list - maybe because the user
        //  clicked in a tiny area that doesn't contain a list item), we're not
        //  interested.
        wrappedDOMTarget = TP.wrap(domTarget);
        if (wrappedDOMTarget === this) {
            return;
        }

        //  See if we have an alternate item tag name that resolves to a TIBET
        //  type.
        altItemTag = this.getAttribute('itemTag');
        if (TP.notEmpty(altItemTag)) {
            itemType = TP.sys.getTypeByName(altItemTag);
        }

        //  If one couldn't be computed, then we just use our standard
        //  TP.xctrls.item
        if (!TP.isType(itemType)) {
            itemType = TP.xctrls.item;
        }

        //  If the deactivate didn't happen in a target that was one of our item
        //  types, then return. This typically happens if we're using a template
        //  and there are events happening in embedded controls.
        if (!TP.isKindOf(wrappedDOMTarget, itemType)) {
            return;
        }

        //  If the DOM target has either a 'spacer' or 'grouping' attribute,
        //  then we're not interested in adding or removing it from the
        //  selection - exit here.
        if (TP.elementHasAttribute(domTarget, 'spacer', true) ||
            TP.elementHasAttribute(domTarget, 'grouping', true)) {
            return;
        }

        //  Grab the value element of the list item.
        valueTPElem = wrappedDOMTarget.get('xctrls|value');
        if (TP.notValid(valueTPElem)) {
            return;
        }

        //  And it's text content.
        newValue = valueTPElem.getTextContent();

        //  Grab the old value before we set it.
        oldValue = this.getValue();

        //  If the two values are equivalent, than just return
        if (TP.equal(oldValue, newValue)) {
            return;
        }

        //  If the item was already selected, then deselect the value.
        //  Otherwise, select it.

        //  Note here how we turn off change signaling to avoid multiple
        //  unnecessary calls to render.
        wasSignalingChange = this.shouldSignalChange();
        this.shouldSignalChange(false);

        if (TP.isTrue(wrappedDOMTarget.isSelected())) {
            this.deselect(newValue);
        } else {
            this.select(newValue);
        }

        this.changed('value', TP.UPDATE,
                        TP.hc(TP.OLDVAL, oldValue, TP.NEWVAL, newValue));

        //  If the element is bound, then update its bound value.
        this.setBoundValueIfBound(this.getDisplayValue());

        this.shouldSignalChange(wasSignalingChange);

        //  Make sure that we stop propagation here so that we don't get any
        //  more responders further up in the chain processing this.
        aSignal.stopPropagation();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.list.Inst.defineMethod('isScalarValued',
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

TP.xctrls.list.Inst.defineMethod('$refreshSelectionModelFor',
function(anAspect) {

    /**
     * @method $refreshSelectionModelFor
     * @summary Refreshes the underlying selection model based on state settings
     *     in the UI.
     * @description Note that the aspect can be one of the following:
     *          'value'     ->  The value of the element (the default)
     *          'index'     ->  The index of the element
     * @param {String} anAspect The property of the elements to use to
     *      determine which elements should be selected.
     * @returns {TP.xctrls.list} The receiver.
     */

    var selectionModel,
        selectAll,

        aspect,

        data,

        indexes,

        selectionData;

    //  Grab the selection model.
    selectionModel = this.$getSelectionModel();

    //  If it has a TP.ALL key, then we add the entire content of the data to
    //  the selection model. This method is typically called by the
    //  removeSelection method and it means that it needs the whole list of data
    //  (if they're all selected) so that it can individually remove items from
    //  it.
    selectAll = selectionModel.hasKey(TP.ALL);
    if (selectAll) {

        //  Empty the selection model in preparation for rebuilding it with
        //  individual items registered under the 'value' aspect.
        selectionModel.empty();

        data = this.get('$dataKeys');

        if (TP.isEmpty(data)) {
            return this;
        }

        //  We default the aspect to 'value'
        aspect = TP.ifInvalid(anAspect, 'value');

        switch (aspect) {

            case 'value':
                //  Remove any TP.GROUPING or TP.SPACING data rows.
                selectionData = data.select(
                        function(anItem) {
                            if (TP.regex.GROUPING.test(anItem) ||
                                TP.regex.SPACING.test(anItem)) {
                                return false;
                            }

                            return true;
                        });

                break;

            case 'index':

                indexes = data.getIndices();

                //  Remove any TP.GROUPING or TP.SPACING data rows.
                indexes = indexes.select(
                        function(anIndex) {
                            if (TP.regex.GROUPING.test(data.at(anIndex)) ||
                                TP.regex.SPACING.test(data.at(anIndex))) {
                                return false;
                            }

                            return true;
                        });

                selectionData = indexes;

                break;

            default:

                //  It was an aspect that we don't know how to process.
                selectionData = null;
                break;
        }

        selectionModel.atPut(aspect, selectionData);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.list.Inst.defineMethod('scrollAndComputeFocusElement',
function(moveAction) {

    /**
     * @method scrollAndComputeFocusElement
     * @summary Scroll to a particular row based on the supplied move action and
     *     re-render the receiver.
     * @param {Constant} moveAction The type of 'move' that the user requested.
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
     * @returns {TP.xctrls.list} The receiver.
     */

    var lastDataItemIndex,

        currentFocusedTPElem,

        pageSize,

        startIndex,
        endIndex,

        listTPElems,

        firstAndLastVisualItems,
        firstVisualItem,
        lastVisualItem,

        successorTPElem,

        focusRowNum;

    lastDataItemIndex = this.get('$convertedData').getSize() - 1;

    currentFocusedTPElem = this.get('focusedItem');
    listTPElems = this.get('listitems');

    pageSize = this.getPageSize();

    startIndex = this.getStartIndex();
    endIndex = startIndex + pageSize - 1;

    firstAndLastVisualItems = this.getStartAndEndVisualRows();
    firstVisualItem = firstAndLastVisualItems.first();
    lastVisualItem = firstAndLastVisualItems.last();

    successorTPElem = null;

    //  Note in this block how, after we re-render, we re-query in some form or
    //  fashion to get new item elements.

    switch (moveAction) {
        case TP.FIRST:

            //  Since we're returning a successor element, we're going to be
            //  re-rendering. Make sure to blur any currently focused descendant
            //  element.
            this.blurFocusedDescendantElement();

            this.scrollTopToRow(0);
            this.render();

            listTPElems = this.get('listitems');
            successorTPElem = listTPElems.first();
            break;

        case TP.LAST:

            //  Since we're returning a successor element, we're going to be
            //  re-rendering. Make sure to blur any currently focused descendant
            //  element.
            this.blurFocusedDescendantElement();

            this.scrollTopToRow(lastDataItemIndex);
            this.render();

            listTPElems = this.get('listitems');
            successorTPElem = listTPElems.last();
            break;

        case TP.FIRST_IN_GROUP:

            //  Since we're returning a successor element, we're going to be
            //  re-rendering. Make sure to blur any currently focused descendant
            //  element.
            this.blurFocusedDescendantElement();

            focusRowNum = (startIndex - pageSize).max(0);

            this.scrollTopToRow(focusRowNum);
            this.render();

            listTPElems = this.get('listitems');
            successorTPElem = listTPElems.first();
            break;

        case TP.LAST_IN_GROUP:

            //  Since we're returning a successor element, we're going to be
            //  re-rendering. Make sure to blur any currently focused descendant
            //  element.
            this.blurFocusedDescendantElement();

            /* eslint-disable no-extra-parens */
            focusRowNum = (startIndex + pageSize).min(
                                        (lastDataItemIndex + 1) - pageSize);
            /* eslint-enable no-extra-parens */

            this.scrollTopToRow(focusRowNum + (pageSize - 1));
            this.render();

            listTPElems = this.get('listitems');
            successorTPElem = listTPElems.first();
            break;

        case TP.NEXT:

            if (currentFocusedTPElem === lastVisualItem) {
                if (endIndex < lastDataItemIndex) {
                    this.scrollTopToRow(endIndex + 1);
                    this.render();

                    successorTPElem = this.getStartAndEndVisualRows().last();
                } else {
                    //  Since we're returning a successor element, we're going
                    //  to be re-rendering. Make sure to blur any currently
                    //  focused descendant element.
                    this.blurFocusedDescendantElement();

                    this.scrollTopToRow(0);
                    this.render();

                    listTPElems = this.get('listitems');
                    successorTPElem = listTPElems.first();
                }
            }
            break;

        case TP.PREVIOUS:

            if (currentFocusedTPElem === firstVisualItem) {
                if (startIndex > 0) {
                    this.scrollTopToRow(startIndex - 1);
                    this.render();

                    successorTPElem = this.getStartAndEndVisualRows().first();
                } else {
                    //  Since we're returning a successor element, we're going
                    //  to be re-rendering. Make sure to blur any currently
                    //  focused descendant element.
                    this.blurFocusedDescendantElement();

                    this.scrollTopToRow(lastDataItemIndex);
                    this.render();

                    listTPElems = this.get('listitems');

                    successorTPElem = listTPElems.at(
                            lastDataItemIndex - this.get('$numSpacingRows'));
                }
            }
            break;

        default:
            break;
    }

    return successorTPElem;
});

//  ------------------------------------------------------------------------

TP.xctrls.list.Inst.defineMethod('setAutocompleteValue',
function(aValue) {

    /**
     * @method setAutocompleteValue
     * @summary Sets the receiver's value used for autocompletion against its
     *     data set and runs the filtering function to filter the data. Note
     *     that if an empty String is supplied here, the filter is cleared and
     *     the receiver's entire data set is once again displayed.
     * @param {String} aValue The value to use as the receiver's autocomplete
     *     value.
     * @returns {TP.xctrls.list} The receiver.
     */

    this.$set('autocompleteValue', aValue);

    if (TP.notEmpty(this.get('data'))) {
        //  Go ahead and run the filter.
        this.filter(aValue);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.list.Inst.defineMethod('setData',
function(aDataObject, shouldSignal, isFiltered) {

    /**
     * @method setData
     * @summary Sets the receiver's data object to the supplied object.
     * @param {Object} aDataObject The object to set the receiver's internal
     *     data to.
     * @param {Boolean} [shouldSignal=true] Whether or not to signal change.
     * @param {Boolean} [isFiltered=false] Whether or not this is a filtered
     *     data set being set by our filtering machinery.
     * @returns {TP.xctrls.list} The receiver.
     */

    var dataObj,
        keys,

        autoCompleteSource,
        searcher,

        autocompleteValue;

    //  Make sure to unwrap this from any TP.core.Content objects, etc.
    dataObj = TP.val(aDataObject);

    this.$set('data', dataObj, false);

    //  Make sure to clear our converted data.
    this.set('$convertedData', null);

    //  This object needs to see keys in 'Array of keys' format. Therefore, the
    //  following conversions are done:

    //  POJO / Hash:    {'foo':'bar','baz':'goo'}   -> ['foo','baz']
    //  Array of pairs: [[0,'a'],[1,'b'],[2,'c']]   -> [0, 1, 2]
    //  Array of items: ['a','b','c']               -> [0, 1, 2]

    if (TP.isValid(dataObj)) {

        //  If we have a hash as our data, this will convert it into an Array of
        //  ordered pairs (i.e. an Array of Arrays) where the first item in each
        //  Array is the key and the second item is the value.
        if (TP.isHash(dataObj)) {
            keys = dataObj.getKeys();
            autoCompleteSource = keys;
        } else if (TP.isPlainObject(dataObj)) {
            //  Make sure to convert a POJO into a TP.core.Hash
            keys = TP.hc(dataObj).getKeys();
            autoCompleteSource = keys;
        } else if (TP.isPair(dataObj.first())) {
            keys = dataObj.collect(
                    function(item) {
                        //  Note that we want a String here.
                        return item.first().toString();
                    });
            autoCompleteSource = keys;
        } else if (TP.isArray(dataObj)) {
            keys = dataObj.getIndices().collect(
                    function(item) {
                        //  Note that we want a String here.
                        return item.toString();
                    });
            autoCompleteSource = dataObj;
        }

        this.set('$dataKeys', keys);
    } else {
        this.set('$dataKeys', null);
    }

    //  Clear the selection model, since we're setting a whole new data set for
    //  the receiver.
    this.$getSelectionModel().empty();

    if (this.isReadyToRender()) {

        //  Set the scroll position back up to the top. Note that we do this
        //  *before* the render() call to avoid rendering cells at the old
        //  scroll position, then adjusting the scroll position, which just
        //  calls another re-render and a flickering effect.
        this.getNativeNode().scrollTop = 0;

        //  When the data changes, we have to re-render.
        this.render();
    }

    //  If we're configured to allow autocomplete, then check to see if we're
    //  setting the filtered data set or not. If we're not, then set the whole
    //  data to the supplied data and configure the autocompleter searcher, if
    //  there is one, with the data set that we've computed for it.
    if (this.hasAttribute('autocomplete')) {
        if (TP.notTrue(isFiltered)) {
            this.$set('$wholeData', dataObj, false);

            searcher = this.get('$autocompleterSearcher');
            if (TP.isValid(searcher)) {
                searcher.get('matchers').first().set(
                                        'dataSet', autoCompleteSource);
            }

            autocompleteValue = this.get('autocompleteValue');
            if (TP.notEmpty(autocompleteValue)) {
                this.filter(autocompleteValue);
            }
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.list.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @method setDisplayValue
     * @summary Sets the receivers' value to the value provided (if it matches
     *     the value of an item in the group). Note that any selected items not
     *     provided in aValue are cleared, which is different than the behavior
     *     of selectValue() which simply adds the new selected items to the
     *     existing selection.
     * @param {Object} aValue The value to set (select) in the receiver. For a
     *     select list this might be an array.
     * @exception TP.sig.InvalidValueElements
     * @returns {TP.xctrls.list} The receiver.
     */

    var separator,
        value,

        allowsMultiples,

        dataKeys,

        selectionEntry,

        firstSelectionIndex,

        leni,
        i,

        lenj,
        j,

        dirty,
        currentEntry;

    //  empty value means clear any selection(s)
    if (TP.isEmpty(aValue)) {
        return this.deselectAll();
    }

    separator = TP.ifEmpty(this.getAttribute('bind:separator'),
                            TP.sys.cfg('bind.value_separator'));

    value = aValue;

    //  If the value is an Array and has a size of 1, just use that item.
    //  Otherwise, turn the Array into String representations of the objects it
    //  contains.
    if (TP.isArray(value)) {
        if (value.getSize() === 1) {
            value = value.first();
        } else {

            //  Iterate over each item, getting it's String value and possibly
            //  making a new nested Array by splitting on any separator if it
            //  exists.
            value = value.collect(
                            function(aVal) {
                                var val;

                                val = TP.str(aVal);
                                val = val.split(separator).collapse();

                                return val;
                            });

            //  Make sure to flatten the resultant Array.
            value = value.flatten();
        }
    } else {

        if (TP.isPlainObject(value)) {
            value = TP.hc(value);
        }

        if (TP.isHash(value)) {
            value = value.getValues();
        }
    }

    if (TP.isString(value)) {
        value = value.split(separator).collapse();
    }

    allowsMultiples = this.allowsMultiples();

    //  watch for multiple selection issues
    if (TP.isArray(value) && !allowsMultiples) {
        value = value.at(0);
    }

    selectionEntry = TP.ac();

    dataKeys = this.get('$dataKeys');

    if (TP.isEmpty(dataKeys)) {
        return this;
    }

    firstSelectionIndex = TP.NOT_FOUND;

    leni = dataKeys.getSize();

    if (TP.isArray(value)) {

        for (i = 0; i < leni; i++) {

            lenj = value.getSize();
            for (j = 0; j < lenj; j++) {
                if (dataKeys.at(i) === value.at(j)) {
                    selectionEntry.push(value.at(j));
                    if (firstSelectionIndex === TP.NOT_FOUND) {
                        firstSelectionIndex = i;
                    }
                    if (!allowsMultiples) {
                        break;
                    }
                }
            }

            if (dirty && !allowsMultiples) {
                break;
            }
        }

    } else {

        for (i = 0; i < leni; i++) {

            if (dataKeys.at(i) === value) {
                selectionEntry.push(value);
                if (firstSelectionIndex === TP.NOT_FOUND) {
                    firstSelectionIndex = i;
                }
                if (!allowsMultiples) {
                    break;
                }
            }
        }
    }

    dirty = false;

    currentEntry = this.$getSelectionModel().at('value');
    if (!TP.equal(currentEntry, selectionEntry)) {
        dirty = true;
    }

    if (dirty) {
        this.$getSelectionModel().atPut('value', selectionEntry);

        if (TP.isEmpty(selectionEntry)) {
            this.deselectAll();
        } else {
            this.render();
        }

        this.scrollTopToRow(firstSelectionIndex);

        this.changed('selection', TP.UPDATE);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.list.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the receiver.
     * @returns {TP.xctrls.list} The receiver.
     */

    var newSearcher;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    if (this.hasAttribute('autocomplete')) {

        newSearcher = TP.xctrls.Searcher.construct();
        newSearcher.addMatcher(
                            TP.xctrls.ListMatcher.construct(
                                'XCTRLS_LIST_' + this.getLocalID()));

        this.set('$autocompleterSearcher', newSearcher);

        //  NB: We use $set() here or otherwise we end up trying to update
        //  currently non-existent GUI.
        this.$set('autocompleteValue', '');
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.list.Inst.defineMethod('teardown',
function() {

    /**
     * @method teardown
     * @summary Tears down the receiver by performing housekeeping cleanup, like
     *     ignoring signals it's observing, etc.
     * @returns {TP.xctrls.list} The receiver.
     */

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    if (this.hasAttribute('autocomplete')) {
        this.signal('CloseSticky');
    }

    return this;
});

//  ------------------------------------------------------------------------
//  TP.dom.D3Tag Methods
//  ------------------------------------------------------------------------

TP.xctrls.list.Inst.defineMethod('buildNewContent',
function(enterSelection) {

    /**
     * @method buildNewContent
     * @summary Builds new content onto the receiver by appending or inserting
     *     content into the supplied d3.js 'enter selection'.
     * @param {TP.extern.d3.selection} enterSelection The d3.js enter selection
     *     that new content should be appended to.
     * @returns {TP.extern.d3.selection} The supplied enter selection or a new
     *     selection containing any new content that was added.
     */

    var defaultTagName,

        attrSelectionInfo,
        newContent,

        shouldConstructTooltips;

    defaultTagName = this.getType().get('defaultItemTagName');

    attrSelectionInfo = this.getRowAttrSelectionInfo();

    newContent = enterSelection.append(defaultTagName).attr(
                    attrSelectionInfo.first(), attrSelectionInfo.last());

    shouldConstructTooltips = TP.bc(this.getAttribute('tooltips'));

    newContent.each(
        function() {
            var labelContent,
                valueContent,
                hintContent,

                hintElement;

            labelContent = TP.extern.d3.select(this).append('xctrls:label');
            labelContent.html(
                function(d, i) {

                    if (TP.regex.SPACING.test(d[0])) {
                        return '&#160;';
                    }

                    if (TP.regex.GROUPING.test(d[0])) {
                        return TP.regex.GROUPING.exec(d[0])[1];
                    }

                    return d[1];
                }
            );

            valueContent = TP.extern.d3.select(this).append('xctrls:value');
            valueContent.text(
                function(d, i) {

                    if (TP.regex.SPACING.test(d[0])) {
                        return '';
                    }

                    if (TP.regex.GROUPING.test(d[0])) {
                        return '';
                    }

                    return d[0];
                }
            );

            if (shouldConstructTooltips) {
                hintContent = TP.extern.d3.select(this).append('xctrls:hint');
                hintContent.html(
                    function(d, i) {
                        return '<span xmlns="' + TP.w3.Xmlns.XHTML + '">' +
                                d[0] +
                                '</span>';
                    }
                );

                hintElement = hintContent.node();

                TP.xctrls.hint.setupHintOn(
                    this, hintElement, TP.hc('triggerPoint', TP.MOUSE));
            }
        });

    //  Make sure that the stylesheet for the default tag is loaded. This is
    //  necessary because the author won't have actually used this tag name in
    //  the authored markup. Note that, if the stylesheet is already loaded,
    //  this method will just return.
    TP.sys.getTypeByName(defaultTagName).addStylesheetTo(
                                            this.getNativeDocument());

    return newContent;
});

//  ------------------------------------------------------------------------

TP.xctrls.list.Inst.defineMethod('computeSelectionData',
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
        wholeData,

        containerHeight,
        rowHeight,

        computedRowCount,
        selectionDataSize,

        realDataSize,

        newSpacingRowCount,
        i;

    selectionData = this.get('$convertedData');

    //  First, make sure the converted data is valid. If not, then convert it.
    if (TP.notValid(selectionData)) {

        wholeData = this.get('data');

        //  This object needs to see data in 'key/value pair' format. Therefore,
        //  the following conversions are done:

        //  Array of items: ['a','b','c']   ->  [[0,'a'],[1,'b'],[2,'c']]
        //  Array of pairs: [[0,'a'],[1,'b'],[2,'c']]   ->  unchanged
        //  POJO / Hash:    {'foo':'bar','baz':'goo'}   ->
        //                                      [['foo','bar'],['baz','goo']]

        //  If we have a hash as our data, this will convert it into an Array of
        //  ordered pairs (i.e. an Array of Arrays) where the first item in each
        //  Array is the key and the second item is the value.
        if (TP.isHash(wholeData)) {
            selectionData = wholeData.getKVPairs();
        } else if (TP.isPlainObject(wholeData)) {
            //  Make sure to convert a POJO into a TP.core.Hash
            selectionData = TP.hc(wholeData).getKVPairs();
        } else if (!TP.isPair(wholeData.first())) {
            //  Massage the data Array into an Array of pairs (unless it already
            //  is)
            selectionData = wholeData.getKVPairs();
        } else {
            //  If we didn't do any transformations to the data, we make sure to
            //  clone it here, since we end up putting 'TP.SPACING's in etc, and
            //  we don't want to pollute the original data source.
            selectionData = TP.copy(wholeData);
        }

        //  Cache our converted data.
        this.set('$convertedData', selectionData);

        //  Reset the number of spacing rows to 0
        this.set('$numSpacingRows', 0);
    }

    if (TP.isValid(selectionData)) {

        containerHeight = this.computeHeight();
        rowHeight = this.getRowHeight();

        //  The number of currently displayed rows is computed by dividing the
        //  containerHeight by the rowHeight
        computedRowCount = (containerHeight / rowHeight).floor();

        //  The number of rows of data in the current selection. These will
        //  also include spacing rows if previously built by this call.
        selectionDataSize = selectionData.getSize();

        if (computedRowCount === selectionDataSize) {
            return selectionData;
        }

        //  If the list is actually tall enough to display at least one row, go
        //  for it.
        if (computedRowCount > 0) {

            //  The "real" data size is the number of total rows minus the
            //  number of spacing rows.
            realDataSize = selectionDataSize - this.get('$numSpacingRows');

            if (computedRowCount > realDataSize) {

                /* eslint-disable no-extra-parens */
                newSpacingRowCount = (computedRowCount - realDataSize) + 1;
                /* eslint-enable no-extra-parens */

                for (i = realDataSize;
                        i < realDataSize + newSpacingRowCount;
                            i++) {
                    selectionData.atPut(i, TP.ac(TP.SPACING + i, i));
                }

                //  NB: We never let this drop below 0
                this.set('$numSpacingRows', newSpacingRowCount.max(0));
            }
        }
    }

    return selectionData;
});

//  ------------------------------------------------------------------------

TP.xctrls.list.Inst.defineMethod('getKeyFunction',
function() {

    /**
     * @method getKeyFunction
     * @summary Returns the Function that should be used to generate keys into
     *     the receiver's data set.
     * @description This Function should take a single argument, an individual
     *     item from the receiver's data set, and return a value that will act
     *     as that item's key in the overall data set. The default version
     *     returns the item itself.
     * @returns {Function} A Function that provides a key for the supplied data
     *     item.
     */

    var keyFunc;

    keyFunc =
        function(d, i) {
            return d[0] + '__' + i;
        };

    return keyFunc;
});

//  ------------------------------------------------------------------------

TP.xctrls.list.Inst.defineMethod('getSelectionContainer',
function() {

    /**
     * @method getSelectionContainer
     * @summary Returns the Element that will be used as the 'root' to
     *     add/update/remove content to/from using d3.js functionality. By
     *     default, this returns the receiver's native Element.
     * @returns {Element|null} The element to use as the container for d3.js
     *     enter/update/exit selections.
     */

    var content;

    content = this.get('listcontent');
    if (TP.isEmptyArray(content)) {
        return null;
    }

    return TP.unwrap(content);
});

//  ------------------------------------------------------------------------

TP.xctrls.list.Inst.defineMethod('getTemplate',
function() {

    /**
     * @method getTemplate
     * @summary Returns the TP.core.Element that will be used as the 'template'
     *     to generate content under the receiver. This template can include
     *     data binding expressions that will be used, along with the receiver's
     *     data, to generate that content.
     * @returns {TP.dom.ElementNode} The TP.dom.ElementNode to use as the
     *     template for the receiver.
     */

    var templateTPElem,
        itemTagName,

        templateContentTPElem,
        compiledTemplateContent;

    templateTPElem = this.get(
                        TP.cpc('tibet|template', TP.hc('shouldCollapse', true)));

    //  If the user didn't specify template content, then see if they provided a
    //  custom itemTag attribute.
    if (!TP.isKindOf(templateTPElem, TP.tibet.template)) {

        //  Make sure to null out the return value in case we got an empty
        //  Array.
        templateTPElem = null;

        itemTagName = this.getAttribute('itemTag');
        if (TP.notEmpty(itemTagName)) {

            //  Build a template element, using the supplied item tag name and
            //  building a label/value pair containing expressions that will be
            //  populated to the bound data.
            templateContentTPElem = TP.wrap(
                TP.xhtmlnode(
                    '<span>' +
                        '<' + itemTagName + '>' +
                            '<xctrls:label>[[value.1]]</xctrls:label>' +
                            '<xctrls:value>[[value.0]]</xctrls:value>' +
                        '</' + itemTagName + '>' +
                    '</span>')
                );

            //  Compile it.
            templateContentTPElem.compile();

            compiledTemplateContent = templateContentTPElem.getNativeNode();

            //  Cache that.
            this.set('$compiledTemplateContent', compiledTemplateContent);
        }
    }

    return templateTPElem;
});

//  ------------------------------------------------------------------------

TP.xctrls.list.Inst.defineMethod('finishBuildingNewContent',
function(selection) {

    /**
     * @method finishBuildingNewContent
     * @summary Wrap up building any new content. This is useful if the type
     *     could either use a template or not to build new content, but there is
     *     shared code used to build things no matter which method is used.
     * @param {TP.extern.d3.selection} [selection] The d3.js enter selection
     *     that new content should be appended to or altered.
     * @returns {TP.dom.D3Tag} The receiver.
     */

    var selectedValues,
        selectAll,

        groupID;

    selectedValues = this.$getSelectionModel().at('value');
    if (TP.notValid(selectedValues)) {
        selectedValues = TP.ac();
    }

    selectAll = this.$getSelectionModel().hasKey(TP.ALL);

    groupID = this.getLocalID() + '_group';

    selection.each(
        function(d) {
            var wrappedElem;

            wrappedElem = TP.wrap(this);

            //  Install a local version of 'computeSuccessorFocusElement' on
            //  the wrapped element.
            wrappedElem.defineMethod('computeSuccessorFocusElement',
            function(focusedTPElem, moveAction) {

                /**
                 * @method computeSuccessorFocusElement
                 * @summary Computes the 'successor' focus element using the
                 *     currently focused element (if there is one) and the
                 *     move action.
                 * @param {TP.dom.ElementNode} focusedTPElem The currently
                 *     focused element. This may be null if no element is
                 *     currently focused.
                 * @param {Constant} moveAction The type of 'move' that the
                 *     user requested.
                 *     This can be one of the following:
                 *         TP.FIRST
                 *         TP.LAST
                 *         TP.NEXT
                 *         TP.PREVIOUS
                 *         TP.FIRST_IN_GROUP
                 *         TP.LAST_IN_GROUP
                 *         TP.FIRST_IN_NEXT_GROUP
                 *         TP.FIRST_IN_PREVIOUS_GROUP
                 *         TP.FOLLOWING
                 *         TP.PRECEDING
                 * @returns {TP.dom.ElementNode} The element that is the
                 *         successor focus element.
                 */

                var listTPElem,
                    successorTPElem;

                listTPElem = this.ancestorMatchingCSS('xctrls|list');

                successorTPElem = listTPElem.scrollAndComputeFocusElement(
                                    moveAction);

                if (TP.isValid(successorTPElem)) {
                    return successorTPElem;
                }

                return this.callNextMethod();
            });

            //  Then, set the visual toggle based on whether the value is
            //  selected or not. Note that we convert to a String to make sure
            //  the proper comparison with selected values (which will contain
            //  only Strings).
            if (selectAll || selectedValues.contains(d[0].toString())) {
                wrappedElem.$setVisualToggle(true);
                return;
            }

            wrappedElem.$setVisualToggle(false);
        }).attr(
        'disabled', function(d) {

            //  We go ahead and 'disable' the item if it's a grouping item. Note
            //  that we recommend that CSS styling be done via
            //  'pclass:disabled', so this really affects only behavior. We
            //  don't want grouping items to be able to receive events or be
            //  focusable, so setting this to true works out well.
            if (TP.regex.GROUPING.test(d[0])) {
                return true;
            }

            //  Returning null will cause d3.js to remove the
            //  attribute.
            return null;
        }).attr(
        'grouping', function(d) {
            if (TP.regex.GROUPING.test(d[0])) {
                return true;
            }

            //  Returning null will cause d3.js to remove the
            //  attribute.
            return null;
        }).attr(
        'spacer', function(d) {
            if (TP.regex.SPACING.test(d[0])) {
                return true;
            }

            //  Returning null will cause d3.js to remove the
            //  attribute.
            return null;
        }).attr(
        'tabindex', function(d, i) {
            if (TP.regex.SPACING.test(d[0])) {
                //  Returning null will cause d3.js to remove the
                //  attribute.
                return null;
            }

            return '0';
        }).attr(
        'tibet:group', function(d, i) {
            if (TP.regex.SPACING.test(d[0])) {
                //  Returning null will cause d3.js to remove the
                //  attribute.
                return null;
            }

            return groupID;
        }
    );

    return this;
}, {
    patchCallee: false
});

//  ------------------------------------------------------------------------

TP.xctrls.list.Inst.defineMethod('finishUpdatingExistingContent',
function(selection) {

    /**
     * @method finishUpdatingExistingContent
     * @summary Wrap up altering any existing content. This is useful if the
     *     type could either use a template or not to alter existing content,
     *     but there is shared code used to alter things no matter which method
     *     is used.
     * @param {TP.extern.d3.selection} [selection] The d3.js update selection
     *     that new content should be appended to or altered.
     * @returns {TP.dom.D3Tag} The receiver.
     */

    var selectedValues,
        selectAll;

    selectedValues = this.$getSelectionModel().at('value');
    if (TP.notValid(selectedValues)) {
        selectedValues = TP.ac();
    }

    selectAll = this.$getSelectionModel().hasKey(TP.ALL);

    selection.each(
            function(d) {

                var wrappedElem;

                wrappedElem = TP.wrap(this);

                if (TP.regex.GROUPING.test(d[0]) ||
                    TP.regex.SPACING.test(d[0])) {
                    wrappedElem.$setVisualToggle(false);
                    return;
                }

                //  Then, set the visual toggle based on whether the value is
                //  selected or not. Note that we convert to a String to make
                //  sure the proper comparison with selected values (which will
                //  contain only Strings).
                if (selectAll || selectedValues.contains(d[0].toString())) {
                    wrappedElem.$setVisualToggle(true);
                    return;
                }

                wrappedElem.$setVisualToggle(false);
            }).attr(
            'disabled', function(d) {

                //  We go ahead and 'disable' the item if it's a grouping item.
                //  Note that we recommend that CSS styling be done via
                //  'pclass:disabled', so this really affects only behavior. We
                //  don't want grouping items to be able to receive events or be
                //  focusable, so setting this to true works out well.
                if (TP.regex.GROUPING.test(d[0])) {
                    return true;
                }

                //  Returning null will cause d3.js to remove the
                //  attribute.
                return null;
            }).attr(
            'grouping', function(d) {
                if (TP.regex.GROUPING.test(d[0])) {
                    return true;
                }

                //  Returning null will cause d3.js to remove the
                //  attribute.
                return null;
            }).attr(
            'spacer', function(d) {
                if (TP.regex.SPACING.test(d[0])) {
                    return true;
                }

                //  Returning null will cause d3.js to remove the
                //  attribute.
                return null;
            }
        );

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.list.Inst.defineMethod('stylesheetReady',
function(aStyleTPElem) {

    /**
     * @method stylesheetReady
     * @summary A method that is invoked when the supplied stylesheet is
     *     'ready', which means that it's attached to the receiver's Document
     *     and all of it's style has been parsed and applied.
     * @param {TP.html.style} aStyleTPElem The XHTML 'style' element that is
     *     ready.
     * @returns {TP.xctrls.list} The receiver.
     */

    var ourDocument,
        stickyTPElem;

    //  If we're configured for autocomplete, then make sure that we have a
    //  'sticky' control available for our use.
    if (this.hasAttribute('autocomplete')) {

        ourDocument = this.getDocument();
        stickyTPElem = TP.byId('XCtrlsListFilterSticky', ourDocument);

        //  If we can't obtain the sticky element for xctrls:list elements, then
        //  preload one using the ID for the sticky that is shared amongst all
        //  xctrls:list elements
        if (TP.notValid(stickyTPElem)) {
            TP.xctrls.sticky.preload(
                                TP.hc(
                                    'triggerTPDocument', ourDocument,
                                    'overlayID', 'XCtrlsListFilterSticky'));
        }
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xctrls.list.Inst.defineMethod('updateExistingContent',
function(updateSelection) {

    /**
     * @method updateExistingContent
     * @summary Updates any existing content in the receiver by altering the
     *     content in the supplied d3.js 'update selection'.
     * @param {TP.extern.d3.selection} updateSelection The d3.js update
     *     selection that existing content should be altered in.
     * @returns {TP.extern.d3.selection} The supplied update selection.
     */

    updateSelection.each(
        function(data) {
            var labelContent,
                valueContent;

            labelContent = TP.extern.d3.select(
                                    TP.nodeGetChildElementAt(this, 0));
            labelContent.html(
                function(d, i) {

                    if (TP.regex.SPACING.test(data[0])) {
                        return '&#160;';
                    }

                    if (TP.regex.GROUPING.test(data[0])) {
                        return TP.regex.GROUPING.exec(data[0])[1];
                    }

                    return data[1];
                }
            );

            valueContent = TP.extern.d3.select(
                                    TP.nodeGetChildElementAt(this, 1));
            valueContent.text(
                function(d, i) {

                    if (TP.regex.SPACING.test(data[0])) {
                        return '';
                    }

                    if (TP.regex.GROUPING.test(data[0])) {
                        return '';
                    }

                    return data[0];
                }
            );
        });

    return updateSelection;
});

//  ------------------------------------------------------------------------
//  TP.core.SelectingUIElement Methods
//  ------------------------------------------------------------------------

TP.xctrls.list.Inst.defineMethod('deselect',
function(aValue, anIndex, shouldSignal) {

    /**
     * @method deselect
     * @summary De-selects (clears) the element which has the provided value (if
     *     found) or is at the provided index. Also note that if no value is
     *     provided this will deselect (clear) all selected items.
     * @param {Object} [aValue] The value to de-select. Note that this can be an
     *     Array.
     * @param {Number} [anIndex] The index of the value in the receiver's data
     *     set.
     * @param {Boolean} [shouldSignal=true] Should selection changes be signaled.
     *     If false changes to the selection are not signaled. Defaults to true.
     * @returns {Boolean} Whether or not a selection was deselected.
     */

    var dataKeys,

        matches,

        len,
        i,

        value,

        itemIndex,

        selectVal,

        retVal;

    dataKeys = this.get('$dataKeys');

    //  If aValue is a RegExp, then we use it to test against all of the value
    //  elements 'primitive value'. If we find one that matches, then we use
    //  that as the value to remove from our selection.
    if (TP.isRegExp(aValue)) {

        matches = TP.ac();

        len = dataKeys.getSize();
        for (i = 0; i < len; i++) {

            value = dataKeys.at(i);

            if (aValue.test(value)) {
                matches.push(value);
            }
        }

        selectVal = matches;
    } else {
        selectVal = aValue;
    }

    //  If we don't allow multiples, but the selection value is an Array, reduce
    //  it to its first item.
    if (!this.allowsMultiples() && TP.isArray(selectVal)) {
        selectVal = selectVal.first();
    }

    //  Call our next-most-specific version of this method which will return
    //  whether or not our selection changed.
    retVal = this.callNextMethod(selectVal, anIndex, shouldSignal);

    //  If our selection changed, then cause things to scroll to it.
    if (retVal) {

        if (TP.isArray(selectVal)) {
            itemIndex = dataKeys.indexOf(selectVal.first());
        } else {
            itemIndex = dataKeys.indexOf(selectVal);
        }

        this.scrollTopToRow(itemIndex);
    }

    return retVal;
});

//  ------------------------------------------------------------------------

TP.xctrls.list.Inst.defineMethod('select',
function(aValue, anIndex, shouldSignal) {

    /**
     * @method select
     * @summary Selects the element which has the provided value (if found) or
     *     is at the provided index.
     *     Note that this method is roughly identical to setDisplayValue() with
     *     the exception that, if the receiver allows multiple selection, this
     *     method does not clear existing selections when processing the
     *     value(s) provided.
     * @param {Object} [aValue] The value to select. Note that this can be an
     *     Array.
     * @param {Number} [anIndex] The index of the value in the receiver's data
     *     set.
     * @param {Boolean} [shouldSignal=true] Should selection changes be signaled.
     *     If false changes to the selection are not signaled. Defaults to true.
     * @returns {Boolean} Whether or not a selection was selected.
     */

    var dataKeys,

        matches,

        len,
        i,

        value,

        itemIndex,

        selectVal,

        retVal;

    dataKeys = this.get('$dataKeys');

    //  If aValue is a RegExp, then we use it to test against all of the value
    //  elements 'primitive value'. If we find one that matches, then we use
    //  that as the value to add to our selection.
    if (TP.isRegExp(aValue)) {

        matches = TP.ac();

        len = dataKeys.getSize();
        for (i = 0; i < len; i++) {

            value = dataKeys.at(i);

            if (aValue.test(value)) {
                matches.push(value);
            }
        }

        selectVal = matches;
    } else {
        selectVal = aValue;
    }

    //  If we don't allow multiples, but the selection value is an Array, reduce
    //  it to its first item.
    if (!this.allowsMultiples() && TP.isArray(selectVal)) {
        selectVal = selectVal.first();
    }

    //  Call our next-most-specific version of this method which will return
    //  whether or not our selection changed.
    retVal = this.callNextMethod(selectVal, anIndex, shouldSignal);

    //  If our selection changed, then cause things to scroll to it.
    if (retVal) {

        if (TP.isArray(selectVal)) {
            itemIndex = dataKeys.indexOf(selectVal.first());
        } else {
            itemIndex = dataKeys.indexOf(selectVal);
        }

        this.scrollTopToRow(itemIndex);
    }

    return retVal;
}, {
    patchCallee: true
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
