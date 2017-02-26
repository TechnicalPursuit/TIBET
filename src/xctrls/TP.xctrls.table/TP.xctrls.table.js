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

TP.xctrls.TemplatedTag.defineSubtype('xctrls:table');

TP.xctrls.table.addTraits(TP.core.SelectingUIElementNode);
TP.xctrls.table.addTraits(TP.core.D3VirtualList);

TP.xctrls.table.Inst.resolveTrait('isReadyToRender', TP.core.UIElementNode);
TP.xctrls.table.Inst.resolveTrait('select', TP.core.SelectingUIElementNode);
TP.xctrls.table.Inst.resolveTrait('render', TP.core.D3VirtualList);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.xctrls.table.Type.defineAttribute('opaqueCapturingSignalNames',
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

/**
 * The tag name of the tag to use for each item if there is no template.
 * @type {String}
 */
TP.xctrls.table.Type.defineAttribute('defaultItemTagName', 'xctrls:textitem');

//  Note how this property is TYPE_LOCAL, by design.
TP.xctrls.table.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xctrls.table.Type.defineMethod('tagAttachComplete',
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

    //  If we're 'ready to render', that means that we're probably being added
    //  to a rendering surface after our stylesheet and other resources are
    //  loaded, so we can just set up here and render.
    if (tpElem.isReadyToRender()) {

        //  Call render one-time to get things going. Note that tpElem *MUST* be
        //  called before the resize handler is installed below. Otherwise,
        //  we'll render twice (the resize handler will see tpElem list resizing
        //  because of tpElem render() call and will want to render again).

        //  If we are a bound element, then refresh ourselves from any bound
        //  data source we may have. This will re-render if the data actually
        //  changed.
        if (tpElem.isBoundElement()) {
            //  Note how we force this call to render by passing true. That's
            //  because the data binding will have already taken place and if no
            //  changes have taken place to that data, this method will return
            //  without re-rendering.
            tpElem.refresh(true);
        } else {
            tpElem.render();
        }

        //  Since we're already ready to render, we observe ourself for when
        //  we're resized
        tpElem.observe(tpElem, 'TP.sig.DOMResize');

        //  Signal that we are ready.
        tpElem.dispatch('TP.sig.DOMReady');
    }

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Type.defineMethod('tagAttachDOM',
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

    //  If we're disabled, make sure our group is too - that's what the focus
    //  management system is going to be looking at.
    if (TP.elementHasAttribute(elem, 'disabled', true)) {
        tpElem.get('group').setAttribute('disabled', true);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Type.defineMethod('tagDetachDOM',
function(aRequest) {

    /**
     * @method tagDetachDOM
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

    //  We signed up with ourself for resize signals when our stylesheet was
    //  ready. We're going away now, so we need to clean up.
    tpElem.ignore(tpElem, 'TP.sig.DOMResize');

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineAttribute('$numSpacingRows');

TP.xctrls.table.Inst.defineAttribute('columns');

TP.xctrls.table.Inst.defineAttribute(
    'scroller', {
        value: TP.cpc('> .scroller', TP.hc('shouldCollapse', true))
    });

TP.xctrls.table.Inst.defineAttribute(
    'tablecontent', {
        value: TP.cpc('> .scroller .content', TP.hc('shouldCollapse', true))
    });

TP.xctrls.table.Inst.defineAttribute(
    'rowitems', {
        value: TP.cpc('> .scroller .content > .row', TP.hc('shouldCollapse', false))
    });

TP.xctrls.table.Inst.defineAttribute(
    'group', {
        value: TP.cpc('> .scroller > tibet|group', TP.hc('shouldCollapse', true))
    });

TP.xctrls.table.Inst.defineAttribute(
    'focusedItem', {
        value: TP.cpc('> .scroller .content > .row[pclass|focus]', TP.hc('shouldCollapse', true))
    });

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('constructTemplateFromInline',
function() {

    /**
     * @method constructTemplateFromInline
     * @summary Constructs the template used by the receiver to generate
     *     content, if provided by the author.
     * @returns {TP.core.D3Tag} The receiver.
     */

    var doc,

        templateContentTPElem,
        templateContentElem,
        childElems,

        attrSelectionInfo,

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
    attrSelectionInfo = this.getRowAttrSelectionInfo();
    TP.elementSetAttribute(
                newRowDiv,
                attrSelectionInfo.first(),
                attrSelectionInfo.last(),
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

TP.xctrls.table.Inst.defineMethod('focus',
function(moveAction) {

    /**
     * @method focus
     * @summary Focuses the receiver for keyboard input.
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

    //  We're not a valid focus target, but our group is.
    return this.get('group').focus(moveAction);
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

    indexArray = TP.ifInvalid(selectionModel.at('index'), TP.ac());
    if (TP.isEmpty(indexArray)) {
        return TP.ac();
    }

    if (!this.allowsMultiples()) {
        return data.at(indexArray.first());
    }

    return data.atAll(indexArray);
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('getValue',
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

TP.xctrls.table.Inst.defineHandler('DOMResize',
function(aSignal) {

    /**
     * @method handleDOMResize
     * @param {TP.sig.DOMResize} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.xctrls.table} The receiver.
     */

    //  When we resize, we have to re-render. The number of rows changed.
    this.render();

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineHandler('UIActivate',
function(aSignal) {

    /**
     * @method handleUIActivate
     * @param {TP.sig.UIActivate} aSignal The signal that caused this handler
     *     to trip.
     */

    var domTarget,
        wrappedDOMTarget,

        wrappedRow,
        row,

        rowIndex;

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
        if (TP.notEmpty(rowIndex)) {

            if (TP.isTrue(wrappedRow.isSelected())) {
                this.deselect(null, rowIndex);
            } else {
                this.select(null, rowIndex);
            }
        }

        //  Make sure that we stop propagation here so that we don't get any
        //  more responders further up in the chain processing this.
        aSignal.shouldStop(true);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('isScalarValued',
function(aspectName) {

    /**
     * @method isScalarValued
     * @summary Returns true if the receiver deals with scalar values.
     * @description See the TP.core.Node's 'isScalarValued()' instance method
     *     for more information.
     * @param {String} [aspectName] An optional aspect name that is being used
     *     by the caller to determine whether the receiver is scalar valued for.
     * @returns {Boolean} For this type, this returns false.
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
    selectAll = this.$getSelectionModel().hasKey(TP.ALL);
    if (selectAll) {

        //  We default the aspect to 'index'
        aspect = TP.ifInvalid(anAspect, 'index');

        //  Empty the selection model in preparation for rebuilding it with
        //  individual items registered under the 'value' aspect.
        selectionModel.empty();

        data = this.get('data');

        if (TP.isEmpty(data)) {
            return this;
        }

        //  We get the indices here.
        indexes = data.getIndices();

        //  Remove any TP.GROUPING or TP.SPACING data rows.
        indexes = indexes.select(
                    function(anIndex) {
                        if (TP.regex.GROUPING.test(data.at(anIndex).at(0)) ||
                            TP.regex.SPACING.test(data.at(anIndex).at(0))) {
                            return false;
                        }

                        return true;
                    });

        selectionModel.atPut(aspect, indexes);
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

        firstVisualItem,
        lastVisualItem,

        successorTPElem,

        focusRowNum;

    lastDataItemIndex = this.get('data').getSize() - 1;

    currentFocusedTPElem = this.get('focusedItem');
    tableTPElems = this.get('rowitems');

    pageSize = this.getPageSize();

    startIndex = this.getStartIndex();
    endIndex = startIndex + pageSize - 1;

    firstVisualItem = tableTPElems.at(0);

    if (endIndex === lastDataItemIndex) {
        lastVisualItem = tableTPElems.last();
    } else {
        lastVisualItem = tableTPElems.at(tableTPElems.getSize() - 2);
    }

    successorTPElem = null;

    switch (moveAction) {
        case TP.FIRST:

            this.scrollTopToRow(0);
            this.render();
            tableTPElems = this.get('rowitems');
            successorTPElem = tableTPElems.first();
            break;

        case TP.LAST:

            this.scrollTopToRow(lastDataItemIndex);
            this.render();
            tableTPElems = this.get('rowitems');
            successorTPElem = tableTPElems.last();
            break;

        case TP.FIRST_IN_GROUP:

            focusRowNum = (startIndex - pageSize).max(0);

            this.scrollTopToRow(focusRowNum);
            this.render();
            tableTPElems = this.get('rowitems');
            successorTPElem = tableTPElems.first();
            break;

        case TP.LAST_IN_GROUP:

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
                    //  NB: We don't compute a new successor focus element here.
                    //  By returning null, we will force our supertype to
                    //  compute it.
                } else {
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
                    //  NB: We don't compute a new successor focus element here.
                    //  By returning null, we will force our supertype to
                    //  compute it.
                } else {
                    this.scrollTopToRow(lastDataItemIndex);
                    this.render();
                    tableTPElems = this.get('rowitems');
                    successorTPElem = tableTPElems.last();
                }
            }
            break;

        default:
            break;
    }

    return successorTPElem;
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('scrollTopToRow',
function(rowNum) {

    /**
     * @method scrollTopToRow
     * @summary Scroll the 'top' of the receiver to the row provided.
     * @param {Number} rowNum The number of the row to scroll to.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.xctrls.table} The receiver.
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

    //  Adjust the scrolling amount and call the receiver's internal rendering
    //  method.
    elem.scrollTop = scrollAmount;

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('setAttrDisabled',
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

    //  We need a single dimension Array to proceed.
    if (!TP.isArray(value)) {

        //  TODO: Raise an exception
        return this;
    }

    if (!TP.isArray(value.first())) {
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
    currentEntry = TP.ifInvalid(this.$getSelectionModel().at('index'), TP.ac());

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

TP.xctrls.table.Inst.defineMethod('setValue',
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
     * @returns {TP.xctrls.table} The receiver.
     */

    var oldValue,
        newValue,

        flag;

    oldValue = this.getValue();

    newValue = this.produceValue('value', aValue);

    //  If the values are equal, there's nothing to do here - bail out.
    if (TP.equal(TP.str(oldValue), TP.str(newValue))) {
        return this;
    }

    this.setDisplayValue(newValue);

    //  signal as needed

    //  NB: Use this construct this way for better performance
    if (TP.notValid(flag = shouldSignal)) {
        flag = this.shouldSignalChange();
    }

    if (flag) {
        this.changed('value', TP.UPDATE,
                        TP.hc(TP.OLDVAL, oldValue, TP.NEWVAL, newValue));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('stylesheetReady',
function(aStyleTPElem) {

    /**
     * @method stylesheetReady
     * @summary A method that is invoked when the supplied stylesheet is
     *     'ready', which means that it's attached to the receiver's Document
     *     and all of it's style has been parsed and applied.
     * @description Typically, the supplied stylesheet Element is the one that
     *     the receiver is waiting for so that it can finalized style
     *     computations. This could be either the receiver's 'core' stylesheet
     *     or it's current 'theme' stylesheet, if the receiver is executing in a
     *     themed environment.
     * @param {TP.html.style} aStyleTPElem The XHTML 'style' element that is
     *     ready.
     * @returns {TP.xctrls.table} The receiver.
     */

    //  Note how we put this in a Function to wait until the screen refreshes.
    (function() {

        //  Call render one-time to get things going. Note that this *MUST* be
        //  called before the resize handler is installed below. Otherwise,
        //  we'll render twice (the resize handler will see this list resizing
        //  because of this render() call and will want to render again).

        //  If we are a bound element, then refresh ourselves from any bound
        //  data source we may have. This will re-render if the data actually
        //  changed.
        if (this.isBoundElement()) {
            //  Note how we force this call to render by passing true. That's
            //  because the data binding will have already taken place and if no
            //  changes have taken place to that data, this method will return
            //  without re-rendering.
            this.refresh(true);
        } else {
            this.render();
        }

        //  We observe ourself for when we're resized and call render whenever
        //  that happens.
        this.observe(this, 'TP.sig.DOMResize');
    }.bind(this)).uponRepaint(this.getNativeWindow());

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  TP.core.D3Tag Methods
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

        attrSelectionInfo,

        newRows,
        newCells,

        newContent;

    defaultTagName = this.getType().get('defaultItemTagName');

    attrSelectionInfo = this.getRowAttrSelectionInfo();

    //  The enter selection has been computed by 'select()'ing the return value
    //  of the 'getSelectionContainer' method.
    newRows = enterSelection.append('div').
                    classed('row', true).
                    attr(attrSelectionInfo.first(), attrSelectionInfo.last()).
                    attr('tibet:tag', 'TP.xctrls.item');

    newCells = newRows.selectAll('div').
                    data(function(row) {
                        return row;
                    }).
                    enter().
                    append('div').
                    classed('cell', true);

    newContent = newCells.append(defaultTagName);

    newContent.each(
        function() {
            var labelContent,
                valueContent;

            labelContent = TP.extern.d3.select(this).append('xctrls:label');
            labelContent.html(
                function(d, i) {
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
                function(d, i) {
                    //  Note how we test the whole value here - we won't
                    //  have made an Array at the place where there's a
                    //  spacer slot.
                    if (TP.regex.SPACING.test(d)) {
                        return '';
                    }

                    if (TP.regex.GROUPING.test(d)) {
                        return '';
                    }

                    return d;
                }
            );
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

    var data,

        columns,

        numCols,

        containerHeight,
        rowHeight,

        displayedRows,

        startIndex,
        len,
        i,

        spacerRow,
        j;

    data = this.get('data');

    if (TP.notEmpty(data)) {

        columns = this.get('columns');

        if (TP.isEmpty(columns)) {
            columns = TP.ac();
        }

        if (TP.isArray(data.first())) {
            //  The data structure is already an Array of Arrays - no need
            //  convert it here.

            //  We clone the data here, since we end up putting 'TP.SPACING's in
            //  etc, and we don't want to pollute the original data source
            data = TP.copy(data);

        } else {

            data = data.collect(
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
        numCols = data.first().getSize();
    } else {
        numCols = 0;
    }

    this.setAttribute('colcount', numCols);

    containerHeight = this.computeHeight();
    rowHeight = this.getRowHeight();

    displayedRows = (containerHeight / rowHeight).floor();

    startIndex = data.getSize();
    /* eslint-disable no-extra-parens */
    len = displayedRows - startIndex;
    /* eslint-enable no-extra-parens */

    if (len > 0) {

        for (i = startIndex; i < startIndex + len; i++) {

            spacerRow = TP.ac();

            for (j = 0; j < numCols; j++) {
                spacerRow.push(TP.SPACING + i + '__' + j);
            }

            data.atPut(i, spacerRow);
        }
    }

    this.set('$numSpacingRows', len.min(0));

    return data;
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
        function(d) {
            return d[0];
        };

    return keyFunc;
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('getRowHeight',
function() {

    /**
     * @method getRowHeight
     * @summary Returns the height of each element of the row. This should
     *     correspond to the 'offsetHeight' of each row when the list is
     *     rendered.
     * @returns {Number} The height of a row when rendered.
     */

    return this.getComputedStyleProperty('--xctrls-item-height').asNumber();
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('getSelectionContainer',
function() {

    /**
     * @method getSelectionContainer
     * @summary Returns the Element that will be used as the 'root' to
     *     add/update/remove content to/from using d3.js functionality. By
     *     default, this returns the receiver's native Element.
     * @returns {Element} The element to use as the container for d3.js
     *     enter/update/exit selections.
     */

    return TP.unwrap(this.get('tablecontent'));
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('getScrollingContainer',
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

TP.xctrls.table.Inst.defineMethod('getTemplate',
function() {

    /**
     * @method getTemplate
     * @summary Returns the TP.core.Element that will be used as the 'template'
     *     to generate content under the receiver. This template can include
     *     data binding expressions that will be used, along with the receiver's
     *     data, to generate that content.
     * @returns {TP.core.ElementNode} The TP.core.ElementNode to use as the
     *     template for the receiver.
     */

    var templateTPElem;

    templateTPElem = this.get('#' + this.getLocalID() + '_template');

    return templateTPElem;
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('finishBuildingNewContent',
function(content) {

    /**
     * @method finishBuildingNewContent
     * @summary Wrap up building any new content. This is useful if the type
     *     could either use a template or not to build new content, but there is
     *     shared code used to build things no matter which method is used.
     * @param {TP.extern.d3.selection} [selection] The d3.js enter selection
     *     that new content should be appended to or altered.
     * @returns {TP.core.D3Tag} The receiver.
     */

    var selectedIndexes,
        startOffset,

        selectAll,

        groupID,

        numCols,

        defaultTagName;

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

    numCols = this.get('data').first().getSize();

    defaultTagName = this.getType().get('defaultItemTagName');

    content.attr('tibet:tag', 'TP.xctrls.item').each(
        function(d, i) {
            var clearingFragText,
                j,
                clearingFrag,
                wrappedElem;

            if (TP.regex.GROUPING.test(d[0]) ||
                TP.regex.SPACING.test(d[0])) {

                clearingFragText = '';

                for (j = 0; j < numCols; j++) {
                    clearingFragText +=
                        '<div class="cell">' +
                            '<' + defaultTagName + '>' +
                                '<xctrls:label>&#160;</xctrls:label>' +
                                '<xctrls:value/>' +
                            '</' + defaultTagName + '>' +
                        '</div>';
                }

                clearingFrag = TP.frag(clearingFragText, TP.w3.Xmlns.XHTML);

                TP.nodeSetContent(this, clearingFrag, null, false);

                return;
            }

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
                 * @param {TP.core.ElementNode} focusedTPElem The currently
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
                 * @returns {TP.core.ElementNode} The element that is the
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
     * @returns {TP.core.D3Tag} The receiver.
     */


    var selectedIndexes,
        startOffset,

        selectAll;

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

    updateSelection.each(
        function(data) {
            var labelContent,
                valueContent;

            //  If the item is a SPACING item, then just return - nothing to
            //  process.
            if (TP.regex.SPACING.test(data[0])) {
                return;
            }

            labelContent = TP.extern.d3.select(
                                    TP.nodeGetDescendantAt(this, '0.0.0'));
            labelContent.html(
                function(d, i) {

                    if (TP.regex.GROUPING.test(d)) {
                        return TP.regex.GROUPING.exec(d)[1];
                    }

                    return d;
                }
            );

            valueContent = TP.extern.d3.select(
                                    TP.nodeGetDescendantAt(this, '0.0.1'));
            valueContent.text(
                function(d, i) {

                    if (TP.regex.GROUPING.test(d)) {
                        return '';
                    }

                    return d;
                }
            );
        });

    return updateSelection;
});

//  ------------------------------------------------------------------------
//  TP.core.SelectingUIElement Methods
//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('allowsMultiples',
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

TP.xctrls.table.Inst.defineMethod('deselect',
function(aValue, anIndex) {

    /**
     * @method deselect
     * @summary De-selects (clears) the element which has the provided value (if
     *     found) or is at the provided index. Also note that if no value is
     *     provided this will deselect (clear) all selected items.
     * @param {Object} [aValue] The value to de-select. Note that this can be an
     *     Array.
     * @param {Number} [anIndex] The index of the value in the receiver's data
     *     set.
     * @returns {Boolean} Whether or not a selection was deselected.
     */

    var dirty;

    if (TP.isEmpty(aValue) && TP.isEmpty(anIndex)) {
        return this.deselectAll();
    }

    dirty = this.removeSelection(anIndex, 'index');

    if (dirty) {
        this.dispatch('TP.sig.UIDeselect');

        this.scrollTopToRow(anIndex);
    }

    return dirty;
});

//  ------------------------------------------------------------------------

TP.xctrls.table.Inst.defineMethod('select',
function(aValue, anIndex) {

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
     * @returns {Boolean} Whether or not a selection was selected.
     */

    var dirty;

    //  If allowMultiples is false, then we can use a reference to a singular
    //  value that will be used as the selected value.
    if (!this.allowsMultiples()) {
        this.$getSelectionModel().empty();
    }

    dirty = this.addSelection(anIndex, 'index');

    if (dirty) {
        this.dispatch('TP.sig.UISelect');

        this.scrollTopToRow(anIndex);
    }

    return dirty;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
