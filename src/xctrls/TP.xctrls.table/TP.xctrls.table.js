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

//  Signals that we don't allow to bubble outside of ourself. Since we can
//  process the states associated with these signals, we don't want them to
//  proceed further up the chain.
TP.xctrls.table.Type.defineAttribute('opaqueBubblingSignalNames',
        TP.ac(
            'TP.sig.UIActivate',
            'TP.sig.UIDeactivate',

            'TP.sig.UIDeselect',
            'TP.sig.UISelect',

            'TP.sig.UIDisabled',
            'TP.sig.UIEnabled'
            ));

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

TP.xctrls.table.Inst.defineAttribute('$numColumns');
TP.xctrls.table.Inst.defineAttribute('columns');

TP.xctrls.table.Inst.defineAttribute('$dataKeys');

TP.xctrls.table.Inst.defineAttribute(
    'tablecontent',
    TP.cpc('> .scroller xctrls|content', TP.hc('shouldCollapse', true)));

TP.xctrls.table.Inst.defineAttribute(
    'rows',
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
     * @returns {TP.xctrls.table} The receiver.
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

    TP.elementSetAttribute(newRowDiv, 'tibet:tag', 'TP.xctrls.item', true);

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
    this.set('$compiledTemplateContent', compiledTemplateContent, false);

    return null;
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('createBlankRowData',
function(anIndex) {

    /**
     * @method createBlankRowData
     * @summary Creates and returns a data object used for 'blank row' for use
     *     in padding logic.
     * @param {Number} anIndex The initial index as supplied by d3.
     * @returns {Object} The data object representing a blank row for this type.
     */

    var numCols,

        spacerRow,

        j,

        rowType,
        key;

    numCols = TP.ifInvalid(this.get('$numColumns'), 0);

    spacerRow = TP.ac();

    for (j = 0; j < numCols; j++) {
        spacerRow.push(TP.SPACING + anIndex + '__' + j);
    }

    rowType = this.get('$rowType');

    key = TP.ifEmpty(this.getAttribute('itemKey'),
                        TP.ac(TP.SPACING + anIndex));

    switch (rowType) {
        case TP.PAIR:
            return TP.ac(key, spacerRow);
        case TP.HASH:
            return TP.hc(key, spacerRow);
        case TP.POJO:
            return {key: spacerRow};
        case TP.ARRAY:
            return TP.ac(spacerRow);
        default:
            break;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('finalizeContent',
function() {

    /**
     * @method finalizeContent
     * @summary Updates an internal data structures from static item content
     *     that the author might have put into the receiver.
     * @description This method is called when the receiver is first awakened
     *     in order to set up any data structures that are required to treat
     *     static content as we would dynamically generated content.
     * @returns {TP.xctrls.table} The receiver.
     */

    var keys,
        allRows,

        allItems;

    keys = TP.ac();

    //  Stamp all of the *rows* in the item content with an index.
    allRows = this.get('rows');
    allRows.forEach(
        function(row, index) {
            var key;

            key = row.getAttribute(TP.DATA_KEY);
            if (TP.isEmpty(key)) {
                key = TP.genID();
                row.setAttribute(TP.DATA_KEY, key);
            }
            keys.push(key);
        });

    this.set('$dataKeys', keys, false);

    //  Stamp all of the items in the item content with an index.
    allItems = this.get('allItems');
    allItems.forEach(
        function(item, index) {
            item.setAttribute(TP.ITEM_NUM, index);
            item.addClass('item');
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('getColumns',
function() {

    /**
     * @method getColumns
     * @summary Returns an array of the receiver's column names.
     * @returns {String[]} An array of the column names.
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

TP.xctrls.table.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @method getDisplayValue
     * @summary Returns the selected value of the select list. This corresponds
     *     to the value of the currently selected item or items.
     * @exception TP.sig.InvalidValueElements
     * @returns {String|String[]} A String containing the selected value or an
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
     * @returns {TP.xctrls.table} The receiver.
     */

    var domTarget,
        wrappedDOMTarget,

        wrappedRow,
        row,

        rowIndex,

        oldValue,

        alwaysSignalChange,

        wasSignalingChange,

        toggleItems,

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
            return this;
        }

        //  If the event happend on the row itself, then just use that.
        if (wrappedDOMTarget.hasClass('row')) {
            wrappedRow = wrappedDOMTarget;
        } else {
            //  Otherwise, it probably happened in a cell, so use that.
            wrappedRow = wrappedDOMTarget.getFirstAncestorBySelector('.row');
        }

        row = TP.unwrap(wrappedRow);

        //  If the DOM target has either a 'spacer' or 'grouping' attribute,
        //  then we're not interested in adding or removing it from the
        //  selection - exit here.
        if (TP.elementHasAttribute(row, 'spacer', true) ||
            TP.elementHasAttribute(row, 'grouping', true)) {
            return this;
        }

        rowIndex = wrappedRow.getAttribute('rowNum').asNumber();
        rowIndex += this.get('$startOffset');

        //  If the item was already selected, then deselect the value.
        //  Otherwise, select it.

        if (TP.notEmpty(rowIndex)) {

            //  Grab the old value before we set it.
            oldValue = this.getValue();

            //  If we always signal change, then even if the values are equal,
            //  we will not exit here.
            alwaysSignalChange = TP.bc(this.getAttribute('alwayschange'));

            //  If we don't always signal change and the two values are
            //  equivalent, than just return.
            if (!alwaysSignalChange && TP.equal(oldValue, newValue)) {
                return this;
            }

            //  Note here how we turn off change signaling to avoid multiple
            //  unnecessary calls to render.
            wasSignalingChange = this.shouldSignalChange();
            this.shouldSignalChange(false);

            //  See if we 'toggle' items - if so and the item is selected, we'll
            //  deselect it. The default is true.
            if (this.hasAttribute('itemtoggle')) {
                toggleItems = TP.bc(this.getAttribute('itemtoggle'));
            } else {
                toggleItems = true;
            }

            if (TP.isTrue(wrappedRow.isSelected()) && toggleItems) {
                this.deselect(null, rowIndex);
            } else {
                this.select(null, rowIndex);
            }

            //  Grab the new value now that we set it.
            newValue = this.getValue();

            this.changed('value', TP.UPDATE,
                            TP.hc(TP.OLDVAL, oldValue, TP.NEWVAL, newValue));

            //  If the element is bound, then update its bound value.
            this.setBoundAspect('value', this.getValue());

            this.shouldSignalChange(wasSignalingChange);
        }

        //  Make sure that we stop propagation here so that we don't get any
        //  more responders further up in the chain processing this.
        aSignal.stopPropagation();
    }

    return this;
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
     * @returns {TP.xctrls.table} The receiver.
     */

    var lastDataItemIndex,

        currentFocusedTPElem,

        pageSize,

        startIndex,
        endIndex,

        rowTPElems,

        firstAndLastVisualItems,
        firstVisualItem,
        lastVisualItem,

        successorTPElem,

        focusRowNum;

    lastDataItemIndex = this.get('data').getSize() - 1;

    currentFocusedTPElem = this.get('focusedItem');
    rowTPElems = this.get('rows');

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

            rowTPElems = this.get('rows');
            successorTPElem = rowTPElems.first();
            break;

        case TP.LAST:

            //  Since we're returning a successor element, we're going to be
            //  re-rendering. Make sure to blur any currently focused descendant
            //  element.
            this.blurFocusedDescendantElement();

            this.scrollTopToRow(lastDataItemIndex);
            this.render();

            rowTPElems = this.get('rows');
            successorTPElem = rowTPElems.last();
            break;

        case TP.FIRST_IN_GROUP:

            //  Since we're returning a successor element, we're going to be
            //  re-rendering. Make sure to blur any currently focused descendant
            //  element.
            this.blurFocusedDescendantElement();

            focusRowNum = (startIndex - pageSize).max(0);

            this.scrollTopToRow(focusRowNum);
            this.render();

            rowTPElems = this.get('rows');
            successorTPElem = rowTPElems.first();
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

            rowTPElems = this.get('rows');
            successorTPElem = rowTPElems.first();
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

                    rowTPElems = this.get('rows');
                    successorTPElem = rowTPElems.first();
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

                    rowTPElems = this.get('rows');
                    successorTPElem = rowTPElems.at(
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

    var dataObj;

    if (TP.notValid(aDataObject)) {
        return this;
    }

    //  Grab the current data and if it's (deep) equal to the supplied data
    //  object, then there's no reason to re-render.
    dataObj = this.$get('data');
    if (TP.equal(dataObj, aDataObject)) {
        this.finalizeContent();
        return this;
    }

    //  We copy the page data here because we might modify it below.
    dataObj = TP.copy(aDataObject);

    //  Prepare the supplied data into the proper format so that keys can be
    //  computed and it can be thought of as 'rows' of data. This normally means
    //  making 'pairs' of the 'entries' of the data object.
    dataObj = this.prepareData(dataObj);

    this.$set('data', dataObj, false);

    //  Clear the selection model, since we're setting a whole new data set for
    //  the receiver.
    this.$getSelectionModel().empty();

    //  Reset the number of spacing rows to 0
    this.set('$numSpacingRows', 0, false);

    this.setAttribute('colcount', dataObj.first().getSize());

    this.set('$numColumns', dataObj.first().getSize(), false);

    if (this.isReadyToRender()) {

        //  Set the scroll position back up to the top. Note that we do this
        //  *before* the render() call to avoid rendering cells at the old
        //  scroll position, then adjusting the scroll position, which just
        //  calls another re-render and a flickering effect.
        this.getNativeNode().scrollTop = 0;

        //  When the data changes, we have to re-render.
        this.render();

        //  And we have to finalize the content again since we're not a
        //  static-only list.
        this.finalizeContent();
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

    var data,

        separator,
        value,

        columns,

        leni,
        i,

        rowType,

        massageValues,

        isArrayOfCollection,

        allowsMultiples,

        selectionEntry,

        lenj,
        j,

        dirty,
        currentEntry;

    //  empty value means clear any selection(s)
    if (TP.isEmpty(aValue)) {
        return this.deselectAll();
    }

    data = this.get('data');
    if (TP.isEmpty(data)) {
        return this;
    }

    separator = TP.ifEmpty(this.getAttribute('bind:separator'),
                            TP.sys.cfg('bind.value_separator'));

    value = aValue;

    columns = this.get('columns');
    if (TP.notValid(columns)) {
        columns = this.getInboundAspect('columns');
    }

    //  If the value is an String, split it on the separator and then wrap that
    //  into an Array, creating a 'single row'.
    if (TP.isString(value)) {
        value = value.split(separator);
        leni = value.getSize();
        for (i = 0; i < leni; i++) {
            if (TP.isNumber(value.at(i))) {
                value.atPut(i, TP.nc(value.at(i)));
            } else if (TP.isBoolean(value.at(i))) {
                value.atPut(i, TP.bc(value.at(i)));
            }
        }
    }

    rowType = this.get('$rowType');

    massageValues = function(oldValue) {
        var newObj,
            lenk,
            k,

            keys,

            retValue,

            val;

        if (TP.isArray(oldValue)) {
            switch (rowType) {
                case TP.HASH:
                    newObj = TP.hc();
                    if (TP.notEmpty(columns)) {
                        lenk = columns.getSize();
                        for (k = 0; k < lenk; k++) {
                            newObj.atPut(columns.at(k), oldValue.at(k));
                        }
                    } else {
                        keys = TP.keys(data.first());
                        lenk = keys.getSize();
                        for (k = 0; k < lenk; k++) {
                            newObj.atPut(keys.at(k), oldValue.at(k));
                        }
                    }
                    break;
                case TP.POJO:
                    newObj = {};
                    if (TP.notEmpty(columns)) {
                        lenk = columns.getSize();
                        for (k = 0; k < lenk; k++) {
                            newObj[columns.at(k)] = oldValue.at(k);
                        }
                    } else {
                        keys = TP.keys(data.first());
                        lenk = keys.getSize();
                        for (k = 0; k < lenk; k++) {
                            newObj[keys.at(k)] = oldValue.at(k);
                        }
                    }
                    break;
                default:
                    newObj = oldValue;
                    break;
            }

            retValue = newObj;
        } else if (TP.isHash(oldValue)) {
            switch (rowType) {
                case TP.ARRAY:
                    newObj = TP.ac();
                    if (TP.notEmpty(columns)) {
                        lenk = columns.getSize();
                        for (k = 0; k < lenk; k++) {
                            val = oldValue.at(columns.at(k));
                            if (TP.isDefined(val)) {
                                newObj.push(val);
                            }
                        }
                    } else {
                        newObj = oldValue.getValues();
                    }
                    break;
                default:
                    newObj = oldValue;
                    break;
            }

            retValue = newObj;
        } else if (TP.isScalarType(oldValue)) {
            retValue = TP.ac(oldValue);
        }

        return retValue;
    };

    isArrayOfCollection = TP.isArray(value) && TP.isCollection(value.first());

    if (isArrayOfCollection) {
        value = value.collect(
                    function(aCollection) {
                        return massageValues(aCollection);
                    });
    } else {
        value = massageValues(value);
    }

    allowsMultiples = this.allowsMultiples();

    selectionEntry = TP.ac();

    //  Compute a set of indexes for the data that's being supplied.
    leni = data.getSize();
    for (i = 0; i < leni; i++) {
        if (isArrayOfCollection) {
            lenj = value.getSize();
            for (j = 0; j < lenj; j++) {
                if (TP.equal(data.at(i), value.at(j))) {
                    selectionEntry.push(i);
                    if (!allowsMultiples) {
                        break;
                    }
                }
            }
        } else {
            if (TP.equal(data.at(i), value)) {
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
    leni = selectionEntry.getSize();
    for (i = 0; i < leni; i++) {
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

    var keyFunc,

        labelFunc,
        valueFunc,

        itemTagName,

        itemSelectionInfo,

        newRows,
        columns,
        newCells,

        newContent,

        shouldConstructTooltips,

        numCols,

        rowNum,

        thisref;

    //  We share this key function with d3. This will invoke 'getKeyFunction' on
    //  any adaptor that we define or the item type.
    keyFunc = this.d3KeyFunction();

    labelFunc = this.getLabelFunction();
    valueFunc = this.getValueFunction();

    itemTagName = TP.ifEmpty(this.getAttribute('itemTag'),
                                this.getType().get('defaultItemTagName'));

    itemSelectionInfo = this.getItemSelectionInfo();

    //  The enter selection has been computed by 'select()'ing the return value
    //  of the 'getSelectionContainer' method.
    newRows = enterSelection.append('xhtml:div').
                    classed('row', true).
                    attr(itemSelectionInfo.first(), itemSelectionInfo.last()).
                    attr('tibet:tag', 'TP.xctrls.item');

    newRows.each(
        function(data, index) {
            var key;

            key = TP.isCallable(keyFunc) ? keyFunc(data, index) : index;
            TP.elementSetAttribute(this, TP.DATA_KEY, key, true);

            TP.elementSetAttribute(this, 'rowNum', index, true);
        });

    columns = this.get('columns');

    newCells = newRows.selectAll(TP.D3_SELECT_ALL('html|div')).
                    data(function(row) {
                        var result,
                            keys,

                            len,
                            i;

                        if (TP.isHash(row)) {
                            result = TP.ac();
                            if (TP.isEmpty(columns)) {
                                keys = TP.keys(row);
                            } else {
                                keys = columns;
                            }

                            len = keys.getSize();
                            for (i = 0; i < len; i++) {
                                result.push(row.at(keys.at(i)));
                            }
                        } else {
                            result = row;
                        }

                        return result;
                    }).
                    enter().
                    append('xhtml:div').
                    classed('cell', true);

    newContent = newCells.append(itemTagName);

    shouldConstructTooltips = TP.bc(this.getAttribute('tooltips'));

    numCols = this.getAttribute('colcount').asNumber();

    rowNum = 0;

    //  We capture 'this' into 'thisref' here, because we'll also want to use
    //  the 'this' reference inside of the Function (it points to the DOM
    //  Element that is being updated).
    thisref = this;

    newContent.each(
        function(data, index) {
            var labelContent,
                valueContent,
                hintContent,

                hintElement;

            labelContent = TP.extern.d3.select(this).append('xctrls:label');
            labelContent.html(
                function(d, i) {
                    var val,

                        labelVal,

                        preIndex,
                        postIndex;

                    val = valueFunc(data, index);

                    //  Note how we test the whole value here - we won't
                    //  have made an Array at the place where there's a
                    //  spacer slot.
                    if (TP.regex.SPACING.test(val)) {
                        return '&#160;';
                    }

                    if (TP.regex.GROUPING.test(val)) {
                        labelVal = TP.regex.GROUPING.exec(val)[1];
                    } else {
                        labelVal = TP.str(labelFunc(data, index));
                    }

                    if (/match_result">/g.test(labelVal)) {
                        preIndex = labelVal.indexOf('<span');
                        postIndex = labelVal.indexOf('</span>') + 7;

                        labelVal =
                            TP.xmlLiteralsToEntities(
                                labelVal.slice(0, preIndex)) +
                            labelVal.slice(preIndex, postIndex) +
                            TP.xmlLiteralsToEntities(
                                labelVal.slice(postIndex));

                    } else {
                        labelVal = TP.xmlLiteralsToEntities(labelVal);
                    }

                    return labelVal;
                }
            );

            valueContent = TP.extern.d3.select(this).append('xctrls:value');
            valueContent.text(
                function(d, i) {
                    var val;

                    val = valueFunc(data, index);

                    //  Note how we test the whole value here - we won't
                    //  have made an Array at the place where there's a
                    //  spacer slot.
                    if (TP.regex.SPACING.test(val)) {
                        return '';
                    }

                    if (TP.regex.GROUPING.test(val)) {
                        return '';
                    }

                    return '__VALUE__' + rowNum + '__' + index;
                }
            );

            if (shouldConstructTooltips) {
                hintContent = TP.extern.d3.select(this).append('xctrls:hint');
                hintContent.html(
                    function(d, i) {
                        var dataVal,
                            hintVal;

                        dataVal = d;

                        //  If the data value is a SPACING or GROUPING value
                        //  then we don't want the hint/tooltip to show so we
                        //  use a special value to prevent that from happening.
                        if (TP.regex.SPACING.test(dataVal)) {
                            hintVal = TP.xctrls.hint.NO_HINT;
                        } else if (TP.regex.GROUPING.test(dataVal)) {
                            hintVal = TP.xctrls.hint.NO_HINT;
                        } else {
                            hintVal = dataVal;
                        }

                        hintVal = TP.xmlLiteralsToEntities(hintVal);

                        return '<span xmlns="' + TP.w3.Xmlns.XHTML + '">' +
                                hintVal +
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

            //  Build any additional content onto the newly created element.
            thisref.buildAdditionalContent(this);
        });

    //  Make sure that the stylesheet for the item tag is loaded. This is
    //  necessary because the author won't have actually used this tag name in
    //  the authored markup. Note that, if the stylesheet is already loaded,
    //  this method will just return.
    TP.sys.getTypeByName(itemTagName).addStylesheetTo(
                                            this.getNativeDocument());

    return newRows;
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
    if (TP.notValid(content)) {
        return null;
    }

    return TP.unwrap(content);
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
     * @returns {TP.xctrls.table} The receiver.
     */

    var valueFunc,

        selectedIndexes,
        startOffset,

        selectAll,

        groupID;

    valueFunc = this.getValueFunction();

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

            //  TODO: This looks like a Chrome bug - investigate.
            Object.setPrototypeOf(
                this, this.ownerDocument.defaultView.Element.prototype);

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
                 * @param {String} moveAction The type of 'move' that the
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

                tableTPElem = this.getFirstAncestorBySelector('xctrls|table');

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
        'disabled', function(d, i) {
            var val;

            val = TP.str(valueFunc(d[0], i));

            //  We go ahead and 'disable' the item if it's a grouping item. Note
            //  that we recommend that CSS styling be done via
            //  'pclass:disabled', so this really affects only behavior. We
            //  don't want grouping items to be able to receive events or be
            //  focusable, so setting this to true works out well.
            if (TP.regex.GROUPING.test(val)) {
                return true;
            }

            //  Returning null will cause d3.js to remove the
            //  attribute.
            return null;
        }).attr(
        'grouping', function(d, i) {
            var val;

            val = TP.str(valueFunc(d[0], i));

            if (TP.regex.GROUPING.test(val)) {
                return true;
            }

            //  Returning null will cause d3.js to remove the
            //  attribute.
            return null;
        }).attr(
        'spacer', function(d, i) {
            var val;

            val = TP.str(valueFunc(d[0], i));

            if (TP.regex.SPACING.test(val)) {
                return true;
            }

            //  Returning null will cause d3.js to remove the
            //  attribute.
            return null;
        }).attr(
        'tabindex', function(d, i) {
            var val;

            val = TP.str(valueFunc(d[0], i));

            if (TP.regex.SPACING.test(val)) {
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
            var val;

            val = TP.str(valueFunc(d[0], i));

            if (TP.regex.SPACING.test(val)) {
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
     * @returns {TP.xctrls.table} The receiver.
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
            'disabled', function(d, i) {

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
            'grouping', function(d, i) {
                if (TP.regex.GROUPING.test(d[0])) {
                    return true;
                }

                //  Returning null will cause d3.js to remove the
                //  attribute.
                return null;
            }).attr(
            'spacer', function(d, i) {
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

    var numCols,

        labelFunc,
        valueFunc,

        columns,

        thisref;

    numCols = this.getAttribute('colcount').asNumber();

    labelFunc = this.getLabelFunction();
    valueFunc = this.getValueFunction();

    columns = this.get('columns');

    //  We capture 'this' into 'thisref' here, because we'll also want to use
    //  the 'this' reference inside of the Function (it points to the DOM
    //  Element that is being updated).
    thisref = this;

    updateSelection.each(
        function(data, index) {
            var dataset,

                keys,
                len,

                j,
                datum,

                labelContent,
                valueContent;

            if (TP.isHash(data)) {
                dataset = TP.ac();
                if (TP.isEmpty(columns)) {
                    keys = TP.keys(data);
                } else {
                    keys = columns;
                }

                len = keys.getSize();
                for (j = 0; j < len; j++) {
                    dataset.push(data.at(keys.at(j)));
                }
            } else {
                dataset = data;
            }

            /* eslint-disable no-loop-func */
            for (j = 0; j < numCols; j++) {

                //  'data' is a single row of data. Grab the individual datum at
                //  that cell.
                datum = dataset.at(j);

                //  'this' is the 'row div' - select the 'div' representing its
                //  column, 'textitem' and then 'label'
                labelContent = TP.extern.d3.select(
                                    TP.nodeGetDescendantAt(this, j + '.0.0'));
                labelContent.html(
                    function(d, i) {
                        var val,
                            labelVal,

                            preIndex,
                            postIndex;

                        val = valueFunc(datum, index);

                        if (TP.regex.SPACING.test(val)) {
                            return '&#160;';
                        }

                        if (TP.regex.GROUPING.test(val)) {
                            labelVal = TP.regex.GROUPING.exec(val)[1];
                        } else {
                            labelVal = TP.str(labelFunc(datum, index));
                        }

                        if (/match_result">/g.test(labelVal)) {
                            preIndex = labelVal.indexOf('<span');
                            postIndex = labelVal.indexOf('</span>') + 7;

                            labelVal =
                                TP.xmlLiteralsToEntities(
                                    labelVal.slice(0, preIndex)) +
                                labelVal.slice(preIndex, postIndex) +
                                TP.xmlLiteralsToEntities(
                                    labelVal.slice(postIndex));

                        } else {
                            labelVal = TP.xmlLiteralsToEntities(labelVal);
                        }

                        return labelVal;
                    }
                );

                //  'this' is the 'row div' - select the 'div' representing its
                //  column, 'textitem' and then 'value'
                valueContent = TP.extern.d3.select(
                                    TP.nodeGetDescendantAt(this, j + '.0.1'));
                valueContent.text(
                    function(d, i) {

                        var val;

                        val = valueFunc(datum, index);

                        if (TP.regex.SPACING.test(val)) {
                            return '';
                        }

                        if (TP.regex.GROUPING.test(val)) {
                            return '';
                        }

                        return '__VALUE__' + index + '__' + i;
                    }
                );

                //  Update any additional content on the element.
                thisref.updateAdditionalContent(this);
            }

            /* eslint-enable no-loop-func */
        });

    return updateSelection;
});

//  ------------------------------------------------------------------------
//  TP.core.SelectingUIElementNode Methods
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
            this.dispatch('TP.sig.UIDeselect', null, TP.hc('index', anIndex));
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
            this.dispatch('TP.sig.UISelect', null, TP.hc('index', anIndex));
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
