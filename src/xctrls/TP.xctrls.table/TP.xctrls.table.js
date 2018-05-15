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
 * @type {TP.xctrls.table}
 */

//  ------------------------------------------------------------------------

TP.xctrls.Lattice.defineSubtype('xctrls:table');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

/**
 * The tag name of the tag to use for each item if there is no template.
 * @type {String}
 */
TP.xctrls.table.Type.defineAttribute('defaultItemTagName', 'xctrls:textitem');

//  Note how this property is TYPE_LOCAL, by design.
TP.xctrls.table.defineAttribute('themeURI', TP.NO_RESULT);

TP.xctrls.table.Type.set('bidiAttrs', TP.ac('value'));

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineAttribute('columns');

TP.xctrls.table.Inst.defineAttribute(
    'tablecontent',
    TP.cpc('> .scroller xctrls|content', TP.hc('shouldCollapse', true)));

TP.xctrls.table.Inst.defineAttribute(
    'rowitems',
        TP.cpc('> .scroller xctrls|content > .row', TP.hc('shouldCollapse', false)));

TP.xctrls.table.Inst.defineAttribute(
    'focusedItem',
        TP.cpc('> .scroller xctrls|content > .row[pclass|focus]',
                TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('constructTemplateFromInline',
function() {

    /**
     * @method constructTemplateFromInline
     * @summary Constructs the template used by the receiver to generate
     *     content, if provided by the author.
     * @returns {TP.dom.D3Tag} The receiver.
     */

    var doc,

        templateContentTPElem,
        templateContentElem,
        childElems,

        itemSelectionInfo,

        newRowDiv,

        len,
        i,

        newCellDiv,

        newContentTPElem,

        compiledTemplateContent;

    doc = this.getNativeDocument();

    //  Grab the template
    templateContentTPElem = this.getTemplate();

    //  Unwrap it and grab the child *elements*.
    templateContentElem = TP.unwrap(templateContentTPElem);
    childElems = TP.nodeGetChildElements(templateContentElem);

    //  Create a div for each row.
    newRowDiv = TP.documentConstructElement(doc, 'div', TP.w3.Xmlns.XHTML);
    TP.elementAddClass(newRowDiv, 'row');

    //  Grab whatever row attribute is used for selection purposes and set that
    //  as an attribute on the row.
    itemSelectionInfo = this.getItemSelectionInfo();
    TP.elementSetAttribute(
                newRowDiv,
                itemSelectionInfo.first(),
                itemSelectionInfo.last(),
                true);

    //  Iterate over the child elements, create individual 'cell' divs and move
    //  each child element into that spot.
    len = childElems.getSize();
    for (i = 0; i < len; i++) {
        newCellDiv = TP.documentConstructElement(
                            doc, 'div', TP.w3.Xmlns.XHTML);
        TP.elementAddClass(newCellDiv, 'cell');

        //  Append the child at this index from the template into the cell
        TP.nodeAppendChild(newCellDiv, childElems.at(i), false);

        //  Append the cell into the row
        TP.nodeAppendChild(newRowDiv, newCellDiv, false);
    }

    //  Wrap it and compile it.
    newContentTPElem = TP.wrap(newRowDiv);
    newContentTPElem.compile();

    //  Note here how we remove the 'id' attribute, since we're going to be
    //  using it as a template.
    newContentTPElem.removeAttribute('id');

    //  Grab it's native node and cache that.
    compiledTemplateContent = newContentTPElem.getNativeNode();
    this.set('$compiledTemplateContent', compiledTemplateContent);

    return null;
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('getColumns',
function() {

    /**
     * @method getColumns
     * @summary Returns an array of the receiver's column names.
     * @returns {Array} An array of the column names.
     */

    var columns;

    //  Note the $get() here to avoid recursion.
    columns = this.$get('columns');

    if (TP.isArray(columns)) {
        return columns;
    }

    //  It's a Content or URI - grab its resource and then result.
    if (TP.isKindOf(columns, TP.core.Content) || TP.isURI(columns)) {
        columns = columns.getResource();
        if (TP.isValid(columns)) {
            columns = columns.get('result');
        }
    }

    return columns;
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('getDescendantsForSerialization',
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

TP.xctrls.table.Inst.defineMethod('getDisplayValue',
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

    var data,
        selectionModel,
        indexArray;

    data = this.get('data');

    selectionModel = this.$getSelectionModel();

    indexArray = selectionModel.at('index');
    if (TP.isEmpty(indexArray)) {
        return TP.ac();
    }

    if (!this.allowsMultiples()) {
        return data.at(indexArray.first());
    }

    return data.atAll(indexArray);
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineHandler('UIDeactivate',
function(aSignal) {

    /**
     * @method handleUIDeactivate
     * @param {TP.sig.UIDeactivate} aSignal The signal that caused this handler
     *     to trip.
     */

    var domTarget,
        wrappedDOMTarget,

        wrappedRow,
        row,

        rowIndex,

        wasSignalingChange,

        oldValue,
        newValue;

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

        //  If the event happend on the row itself, then just use that.
        if (wrappedDOMTarget.hasClass('row')) {
            wrappedRow = wrappedDOMTarget;
        } else {
            //  Otherwise, it probably happened in a cell, so use that.
            wrappedRow = wrappedDOMTarget.ancestorMatchingCSS('.row');
        }

        row = TP.unwrap(wrappedRow);

        //  If the DOM target has either a 'spacer' or 'grouping' attribute,
        //  then we're not interested in adding or removing it from the
        //  selection - exit here.
        if (TP.elementHasAttribute(row, 'spacer', true) ||
            TP.elementHasAttribute(row, 'grouping', true)) {
            return this;
        }

        rowIndex = wrappedRow.getParentNode().getChildIndex(row);
        rowIndex += this.get('$startOffset');

        //  If the item was already selected, then deselect the value.
        //  Otherwise, select it.

        if (TP.notEmpty(rowIndex)) {

            //  Grab the old value before we set it.
            oldValue = this.getValue();

            //  Note here how we turn off change signaling to avoid multiple
            //  unnecessary calls to render.
            wasSignalingChange = this.shouldSignalChange();
            this.shouldSignalChange(false);

            if (TP.isTrue(wrappedRow.isSelected())) {
                this.deselect(null, rowIndex);
            } else {
                this.select(null, rowIndex);
            }

            //  Grab the new value now that we set it.
            newValue = this.getValue();

            this.changed('value', TP.UPDATE,
                            TP.hc(TP.OLDVAL, oldValue, TP.NEWVAL, newValue));

            //  If the element is bound, then update its bound value.
            this.setBoundValueIfBound(this.getDisplayValue());

            this.shouldSignalChange(wasSignalingChange);
        }

        //  Make sure that we stop propagation here so that we don't get any
        //  more responders further up in the chain processing this.
        aSignal.stopPropagation();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('isSingleValued',
function(aspectName) {

    /**
     * @method isSingleValued
     * @summary For this type, since both the data and the value (selection) are
     *     never single valued, this returns false.
     * @description See the TP.dom.Node's 'isScalarValued()' instance method
     *     for more information.
     * @param {String} [aspectName] An optional aspect name that is being used
     *     by the caller to determine whether the receiver is single valued for.
     * @returns {Boolean} For this type, always returns false.
     */

    return false;
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('$refreshSelectionModelFor',
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
     * @returns {TP.xctrls.table} The receiver.
     */

    var selectionModel,
        selectAll,

        aspect,

        data,

        indexes;

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

        data = this.get('data');
        indexes = this.get('$dataKeys');

        if (TP.isEmpty(data)) {
            return this;
        }

        aspect = TP.ifInvalid(anAspect, 'value');

        switch (aspect) {

            case 'value':
                //  Remove any TP.GROUPING or TP.SPACING data rows.
                data = data.select(
                        function(anItem) {
                            if (TP.regex.GROUPING.test(anItem) ||
                                TP.regex.SPACING.test(anItem)) {
                                return false;
                            }

                            return true;
                        });

                break;

            case 'index':

                //  Remove any TP.GROUPING or TP.SPACING data rows.
                indexes = indexes.select(
                        function(anIndex) {
                            if (TP.regex.GROUPING.test(data.at(anIndex)) ||
                                TP.regex.SPACING.test(data.at(anIndex))) {
                                return false;
                            }

                            return true;
                        });

                data = indexes;

                break;

            default:

                //  It was an aspect that we don't know how to process.
                data = null;
                break;
        }

        selectionModel.atPut(aspect, data);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('scrollAndComputeFocusElement',
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
     * @returns {TP.xctrls.table} The receiver.
     */

    var lastDataItemIndex,

        currentFocusedTPElem,

        pageSize,

        startIndex,
        endIndex,

        tableTPElems,

        firstAndLastVisualItems,
        firstVisualItem,
        lastVisualItem,

        successorTPElem,

        focusRowNum;

    lastDataItemIndex = this.get('$convertedData').getSize() - 1;

    currentFocusedTPElem = this.get('focusedItem');
    tableTPElems = this.get('rowitems');

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

            tableTPElems = this.get('rowitems');
            successorTPElem = tableTPElems.first();
            break;

        case TP.LAST:

            //  Since we're returning a successor element, we're going to be
            //  re-rendering. Make sure to blur any currently focused descendant
            //  element.
            this.blurFocusedDescendantElement();

            this.scrollTopToRow(lastDataItemIndex);
            this.render();

            tableTPElems = this.get('rowitems');
            successorTPElem = tableTPElems.last();
            break;

        case TP.FIRST_IN_GROUP:

            //  Since we're returning a successor element, we're going to be
            //  re-rendering. Make sure to blur any currently focused descendant
            //  element.
            this.blurFocusedDescendantElement();

            focusRowNum = (startIndex - pageSize).max(0);

            this.scrollTopToRow(focusRowNum);
            this.render();

            tableTPElems = this.get('rowitems');
            successorTPElem = tableTPElems.first();
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

            tableTPElems = this.get('rowitems');
            successorTPElem = tableTPElems.first();
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

                    tableTPElems = this.get('rowitems');
                    successorTPElem = tableTPElems.first();
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

                    tableTPElems = this.get('rowitems');
                    successorTPElem = tableTPElems.at(
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

TP.xctrls.table.Inst.defineMethod('setData',
function(aDataObject, shouldSignal) {

    /**
     * @method setData
     * @summary Sets the receiver's data object to the supplied object.
     * @param {Object} aDataObject The object to set the receiver's internal
     *     data to.
     * @param {Boolean} [shouldSignal=true] Whether or not to signal change.
     * @returns {TP.xctrls.table} The receiver.
     */

    var dataObj,
        keys;

    //  Make sure to unwrap this from any TP.core.Content objects, etc.
    dataObj = TP.val(aDataObject);

    if (!TP.isArray(dataObj)) {
        //  TODO: Raise an exception
        return this;
    }

    this.$set('data', dataObj, false);

    //  Make sure to clear our converted data.
    this.set('$convertedData', null);

    if (TP.isValid(dataObj)) {
        keys = dataObj.getIndices().collect(
                function(item) {
                    //  Note that we want a String here.
                    return item.toString();
                });
    } else {
        keys = null;
    }

    this.set('$dataKeys', keys);

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

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('setDisplayValue',
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
     * @returns {TP.xctrls.table} The receiver.
     */

    var separator,
        value,

        allowsMultiples,

        data,

        selectionEntry,

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

    //  If the value is an String, split it on the separator and then wrap that
    //  into an Array, creating a 'single row'.
    if (TP.isString(value)) {
        value = value.split(separator);
        value = TP.ac(value);
    }

    //  If the value itself isn't an Array, then make it the first item in one.
    if (!TP.isArray(value)) {
        value = TP.ac(value);
    } else if (!TP.isArray(value.first())) {
        //  If the value's first element isn't an Array, then wrap the value
        //  (which should be an Array) in another Array, making it the first
        //  (Array) item in a nested Array.
        value = TP.ac(value);
    }

    allowsMultiples = this.allowsMultiples();

    selectionEntry = TP.ac();

    data = this.get('data');

    if (TP.isEmpty(data)) {
        return this;
    }

    //  Compute a set of indexes for the data that's being supplied.
    leni = data.getSize();
    for (i = 0; i < leni; i++) {

        lenj = value.getSize();
        for (j = 0; j < lenj; j++) {
            if (TP.equal(data.at(i), value.at(j))) {
                selectionEntry.push(i);
                if (!allowsMultiples) {
                    break;
                }
            }
        }
    }

    dirty = false;

    //  Grab the set of indexes that are already selected.
    currentEntry = this.$getSelectionModel().at('index');
    if (TP.notValid(currentEntry)) {
        currentEntry = TP.ac();
    }

    //  Iterate over the new indexes. If one of them is *not* currently
    //  selected, we set dirty to true and break.
    for (i = 0; i < selectionEntry.getSize(); i++) {
        if (!currentEntry.contains(selectionEntry.at(i))) {
            dirty = true;
            break;
        }
    }

    if (dirty) {

        //  Make sure that all of the currently selected indexes are in the new
        //  selection entry.
        if (allowsMultiples) {
            selectionEntry.addAll(currentEntry);
            selectionEntry.unique();
            selectionEntry.sort();
        }

        this.$getSelectionModel().atPut('index', selectionEntry);

        if (TP.isEmpty(selectionEntry)) {
            this.deselectAll();
        } else {
            this.render();
        }

        this.changed('selection', TP.UPDATE);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  TP.dom.D3Tag Methods
//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('buildNewContent',
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

        itemSelectionInfo,

        newRows,
        newCells,

        newContent,

        shouldConstructTooltips,

        numCols,

        rowNum;

    defaultTagName = this.getType().get('defaultItemTagName');

    itemSelectionInfo = this.getItemSelectionInfo();

    //  The enter selection has been computed by 'select()'ing the return value
    //  of the 'getSelectionContainer' method.
    newRows = enterSelection.append('xhtml:div').
                    classed('row', true).
                    attr(itemSelectionInfo.first(), itemSelectionInfo.last()).
                    attr('tibet:tag', 'TP.xctrls.item');

    newCells = newRows.selectAll('xhtml:div').
                    data(function(row) {
                        return row;
                    }).
                    enter().
                    append('xhtml:div').
                    classed('cell', true);

    newContent = newCells.append(defaultTagName);

    shouldConstructTooltips = TP.bc(this.getAttribute('tooltips'));

    numCols = this.getAttribute('colcount').asNumber();

    rowNum = 0;

    newContent.each(
        function(data, index) {
            var labelContent,
                valueContent,
                hintContent,

                hintElement;

            labelContent = TP.extern.d3.select(this).append('xctrls:label');
            labelContent.html(
                function(d) {
                    if (TP.regex.SPACING.test(d)) {
                        return '&#160;';
                    }

                    if (TP.regex.GROUPING.test(d)) {
                        return TP.regex.GROUPING.exec(d)[1];
                    }

                    return d;
                }
            );

            valueContent = TP.extern.d3.select(this).append('xctrls:value');
            valueContent.text(
                function(d) {
                    //  Note how we test the whole value here - we won't
                    //  have made an Array at the place where there's a
                    //  spacer slot.
                    if (TP.regex.SPACING.test(d)) {
                        return '';
                    }

                    if (TP.regex.GROUPING.test(d)) {
                        return '';
                    }

                    return '__VALUE__' + rowNum + '__' + index;
                }
            );

            if (shouldConstructTooltips) {
                hintContent = TP.extern.d3.select(this).append('xctrls:hint');
                hintContent.html(
                    function(d, i) {
                        return '<span xmlns="' + TP.w3.Xmlns.XHTML + '">' +
                                d +
                                '</span>';
                    }
                );

                hintElement = hintContent.node();

                TP.xctrls.hint.setupHintOn(
                    this, hintElement, TP.hc('triggerPoint', TP.MOUSE));
            }
            if (index === numCols - 1) {
                rowNum++;
            }
        });

    //  Make sure that the stylesheet for the default tag is loaded. This is
    //  necessary because the author won't have actually used this tag name in
    //  the authored markup. Note that, if the stylesheet is already loaded,
    //  this method will just return.
    TP.sys.getTypeByName(defaultTagName).addStylesheetTo(
                                            this.getNativeDocument());

    return newRows;
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('computeSelectionData',
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

        columns,

        numCols,

        containerHeight,
        rowHeight,

        computedRowCount,

        selectionDataSize,
        realDataSize,
        newSpacingRowCount,

        i,

        spacerRow,
        j;

    selectionData = this.get('$convertedData');

    //  First, make sure the converted data is valid. If not, then convert it.
    if (TP.notValid(selectionData)) {

        wholeData = this.get('data');

        if (TP.notEmpty(wholeData)) {

            columns = this.get('columns');

            if (TP.isEmpty(columns)) {
                columns = TP.ac();
            }

            if (TP.isArray(wholeData.first())) {
                //  The data structure is already an Array of Arrays - no need
                //  convert it here.

                //  We clone the data here, since we end up putting
                //  'TP.SPACING's in etc, and we don't want to pollute the
                //  original data source
                selectionData = TP.copy(wholeData);

            } else {

                selectionData = wholeData.collect(
                        function(item, index) {

                            var row,

                                keys,

                                rowArray,

                                keyLen,
                                k,

                                keyIndex;

                            row = item;

                            if (TP.isPlainObject(row)) {
                                row = TP.hc(row);
                            }

                            if (TP.isEmpty(columns)) {
                                keys = row.getKeys();
                                columns = keys;
                            } else {
                                keys = columns;
                            }

                            rowArray = TP.ac();
                            keyLen = keys.getSize();
                            for (k = 0; k < keyLen; k++) {

                                keyIndex = columns.indexOf(keys.at(k));
                                rowArray.atPut(keyIndex, row.at(keys.at(k)));
                            }

                            return rowArray;
                        });
            }

            //  If the data is an Array of Arrays, then the number of columns is
            //  whatever the size of the first item (the first Array) is
            numCols = selectionData.first().getSize();
        } else {
            numCols = 0;
        }

        this.setAttribute('colcount', numCols);

        //  Cache our converted data.
        this.set('$convertedData', selectionData);

        //  Reset the number of spacing rows to 0
        this.set('$numSpacingRows', 0);
    }

    if (TP.isValid(selectionData)) {

        containerHeight = this.computeHeight();
        rowHeight = this.getRowHeight();

        //  The number of currently displayed rows is computed by dividing the
        //  containerHeight by the rowHeight.
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

                    spacerRow = TP.ac();

                    for (j = 0; j < numCols; j++) {
                        spacerRow.push(TP.SPACING + i + '__' + j);
                    }

                    selectionData.atPut(i, spacerRow);
                }

                //  NB: We never let this drop below 0
                this.set('$numSpacingRows', newSpacingRowCount.max(0));
            }
        }
    }

    return selectionData;
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('getKeyFunction',
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
            return d + '__' + i;
        };

    return keyFunc;
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('getSelectionContainer',
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

    content = this.get('tablecontent');
    if (TP.isEmptyArray(content)) {
        return null;
    }

    return TP.unwrap(content);
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('getTemplate',
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

    var templateTPElem;

    templateTPElem = this.get(
                        TP.cpc('tibet|template',
                            TP.hc('shouldCollapse', true)));

    //  If the user didn't specify template content, then see if they provided a
    //  custom itemTag attribute.
    if (!TP.isKindOf(templateTPElem, TP.tibet.template)) {

        //  Make sure to null out the return value in case we got an empty
        //  Array.
        templateTPElem = null;
    }

    return templateTPElem;
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('finishBuildingNewContent',
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

    var selectedIndexes,
        startOffset,

        selectAll,

        groupID;

    //  Update any selection indices before we retrieve them
    this.$updateSelectionIndices();

    //  Retrieve the selection indices.
    selectedIndexes = this.$getSelectionModel().at('index');
    if (TP.notValid(selectedIndexes)) {
        selectedIndexes = TP.ac();
    }

    //  Adjust any indexes downward by the start offset
    startOffset = this.get('$startOffset');
    selectedIndexes = selectedIndexes.collect(
                        function(anIndex) {
                            return anIndex - startOffset;
                        });

    selectAll = this.$getSelectionModel().hasKey(TP.ALL);

    groupID = this.getLocalID() + '_group';

    selection.attr('tibet:tag', 'TP.xctrls.item').each(
        function(d, i) {
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

                var tableTPElem,
                    successorTPElem;

                tableTPElem = this.ancestorMatchingCSS('xctrls|table');

                successorTPElem = tableTPElem.scrollAndComputeFocusElement(
                                    moveAction);

                if (TP.isValid(successorTPElem)) {
                    return successorTPElem;
                }

                return this.callNextMethod();
            });

            //  Then, set the visual toggle based on whether the value is
            //  selected or not.
            if (selectAll || selectedIndexes.contains(i)) {
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
        'hidefocus', function(d, i) {
            return 'true';
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

TP.xctrls.table.Inst.defineMethod('finishUpdatingExistingContent',
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

    var selectedIndexes,
        startOffset,

        selectAll;

    //  Update any selection indices before we retrieve them
    this.$updateSelectionIndices();

    //  Retrieve the selection indices.
    selectedIndexes = this.$getSelectionModel().at('index');
    if (TP.notValid(selectedIndexes)) {
        selectedIndexes = TP.ac();
    }

    //  Adjust any indexes downward by the start offset
    startOffset = this.get('$startOffset');
    selectedIndexes = selectedIndexes.collect(
                        function(anIndex) {
                            return anIndex - startOffset;
                        });

    selectAll = this.$getSelectionModel().hasKey(TP.ALL);

    selection.attr('tibet:tag', 'TP.xctrls.item').each(
            function(d, i) {

                var wrappedElem;

                wrappedElem = TP.wrap(this);

                if (TP.regex.GROUPING.test(d[0]) ||
                    TP.regex.SPACING.test(d[0])) {
                    wrappedElem.$setVisualToggle(false);
                    return;
                }

                if (selectAll || selectedIndexes.contains(i)) {
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
            }).attr(
            'hidefocus', function(d, i) {
                return 'true';
            }
        );

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('updateExistingContent',
function(updateSelection) {

    /**
     * @method updateExistingContent
     * @summary Updates any existing content in the receiver by altering the
     *     content in the supplied d3.js 'update selection'.
     * @param {TP.extern.d3.selection} updateSelection The d3.js update
     *     selection that existing content should be altered in.
     * @returns {TP.extern.d3.selection} The supplied update selection.
     */

    var numCols;

    numCols = this.getAttribute('colcount').asNumber();

    updateSelection.each(
        function(data, index) {
            var i,
                datum,

                labelContent,
                valueContent;

            /* eslint-disable no-loop-func */
            for (i = 0; i < numCols; i++) {

                //  'data' is a single row of data. Grab the individual datum at
                //  that cell.
                datum = data[i];

                //  'this' is the 'row div' - select the 'div' representing its
                //  column, 'textitem' and then 'label'
                labelContent = TP.extern.d3.select(
                                    TP.nodeGetDescendantAt(this, i + '.0.0'));
                labelContent.html(
                    function() {

                        if (TP.regex.SPACING.test(datum)) {
                            return '&#160;';
                        }

                        if (TP.regex.GROUPING.test(datum)) {
                            return TP.regex.GROUPING.exec(datum)[1];
                        }

                        return datum;
                    }
                );

                //  'this' is the 'row div' - select the 'div' representing its
                //  column, 'textitem' and then 'value'
                valueContent = TP.extern.d3.select(
                                    TP.nodeGetDescendantAt(this, i + '.0.1'));
                valueContent.text(
                    function() {

                        if (TP.regex.SPACING.test(datum)) {
                            return '';
                        }

                        if (TP.regex.GROUPING.test(datum)) {
                            return '';
                        }

                        return '__VALUE__' + index + '__' + i;
                    }
                );
            }

            /* eslint-enable no-loop-func */
        });

    return updateSelection;
});

//  ------------------------------------------------------------------------
//  TP.core.SelectingUIElement Methods
//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('deselect',
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

    var value,

        dirty,
        indices;

    if (TP.isEmpty(aValue) && TP.isEmpty(anIndex)) {
        return this.deselectAll();
    }

    if (TP.notEmpty(aValue)) {
        value = aValue;

        if (!TP.isArray(value.first())) {
            value = TP.ac(value);
        }

        dirty = this.removeSelection(value, 'value');
    } else {
        dirty = this.removeSelection(anIndex, 'index');
    }

    if (dirty) {

        if (TP.notFalse(shouldSignal)) {
            this.dispatch('TP.sig.UIDeselect');
        }

        this.$updateSelectionIndices();

        indices = this.$getSelectionModel().at('index');

        if (TP.notEmpty(indices)) {
            this.scrollTopToRow(indices.first());
        }
    }

    return dirty;
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('select',
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

    var value,

        dirty,
        indices;

    if (TP.isEmpty(aValue) && TP.isEmpty(anIndex)) {
        return this.deselectAll();
    }

    if (TP.notEmpty(aValue)) {
        value = aValue;

        if (!TP.isArray(value.first())) {
            value = TP.ac(value);
        }

        dirty = this.addSelection(value, 'value');
    } else {
        dirty = this.addSelection(anIndex, 'index');
    }

    if (dirty) {

        if (TP.notFalse(shouldSignal)) {
            this.dispatch('TP.sig.UISelect');
        }

        this.$updateSelectionIndices();

        indices = this.$getSelectionModel().at('index');

        if (TP.notEmpty(indices)) {
            this.scrollTopToRow(indices.first());
        }
    }

    return dirty;
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('$updateSelectionIndices',
function() {

    /**
     * @method $updateSelectionIndices
     * @summary Updates the selection indices based on the values that are
     *     currently selected.
     * @returns {TP.xctrls.table} The receiver.
     */

    var selectionModel,

        valuesEntry,
        indicesEntry,

        data,

        leni,
        i,
        lenj,
        j;

    //  Grab the selection model and the two entries that comprise the values
    //  selection and the indices selection.
    selectionModel = this.$getSelectionModel();

    valuesEntry = selectionModel.at('value');
    indicesEntry = selectionModel.at('index');

    //  The values selection cannot be empty in order to proceed.
    if (TP.isEmpty(valuesEntry)) {
        return this;
    }

    //  If there is no entry for indices, create one. Otherwise, empty the
    //  existing one since we're going to rebuild it.
    if (TP.notValid(indicesEntry)) {
        indicesEntry = TP.ac();
        selectionModel.atPut('index', indicesEntry);
    } else {
        indicesEntry.empty();
    }

    //  Grab the overall data set.
    data = this.get('data');

    if (TP.isEmpty(data)) {
        return this;
    }

    //  Compute a set of indexes for the data that's being supplied based on the
    //  values as represented in the values selection entry.
    leni = data.getSize();
    for (i = 0; i < leni; i++) {

        lenj = valuesEntry.getSize();
        for (j = 0; j < lenj; j++) {
            if (TP.equal(data.at(i), valuesEntry.at(j))) {
                indicesEntry.push(i);
            }
        }
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
