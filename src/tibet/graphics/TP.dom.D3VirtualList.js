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
 * @type {TP.dom.D3VirtualList}
 * @summary A subtype of the TP.dom.D3Tag trait type that is used to add
 *     'virtual scrolling behavior to any type that implements a scrolling list.
 * @description This code is a heavily adapted version of the d3.js virtual
 *     scrolling routine found here:
 *          http://www.billdwhite.com/wordpress/2014/05/17/d3-scalability-virtual-scrolling-for-large-visualizations/
 *      It has been adapted to not be specific to SVG and to conform to TIBET
 *      linting conventions.
 */

//  ------------------------------------------------------------------------

TP.dom.D3Tag.defineSubtype('D3VirtualList');

//  This type is intended to be used as a trait type only, so we don't allow
//  instance creation
TP.dom.D3VirtualList.isAbstract(true);

//  We don't need to order instances of these types.
TP.dom.D3VirtualList.Type.set('shouldOrder', false);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.dom.D3VirtualList.Inst.defineAttribute('$virtualScroller');

TP.dom.D3VirtualList.Inst.defineAttribute('$bumpRowCount');

TP.dom.D3VirtualList.Inst.defineAttribute('$startOffset');
TP.dom.D3VirtualList.Inst.defineAttribute('$endOffset');
TP.dom.D3VirtualList.Inst.defineAttribute('$computedRowCount');

TP.dom.D3VirtualList.Inst.defineAttribute('scrollFactor');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.dom.D3VirtualList.Type.defineMethod('tagAttachDOM',
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

    //  Perform set up for instances of this type.
    tpElem.setup();

    return;
});

//  ------------------------------------------------------------------------

TP.dom.D3VirtualList.Type.defineMethod('tagDetachDOM',
function(aRequest) {

    /**
     * @method tagDetachDOM
     * @summary Performs any 'detach' logic when the node is detached from its
     *     owning document.
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

    //  Perform tear down for instances of this type.
    tpElem.teardown();

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.dom.D3VirtualList.Inst.defineMethod('adjustIterationIndex',
function(anIndex) {

    /**
     * @method adjustIterationIndex
     * @summary Adjusts any iteration index that we use when building or
     *     updating templated content.
     * @param {Number} anIndex The initial index as supplied by d3.
     * @returns {Number} The adjusted index.
     */

    //  At this level, this method returns the number it was handed plus the
    //  current start offset that it is tracking.
    return anIndex + this.$get('$startOffset');
});

//  ------------------------------------------------------------------------

TP.dom.D3VirtualList.Inst.defineMethod('createBlankRowData',
function(anIndex) {

    /**
     * @method createBlankRowData
     * @summary Creates and returns a data object used for 'blank row' for use
     *     in padding logic.
     * @param {Number} anIndex The initial index as supplied by d3.
     * @returns {Object} The data object representing a blank row for this type.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.dom.D3VirtualList.Inst.defineMethod('computeHeight',
function() {

    /**
     * @method computeHeight
     * @summary Computes the receiver's height based on a variety of factors,
     *     including direct 'height' value, min/max height settings or a fixed
     *     'size' attribute on the receiver.
     * @returns {Number} The height of the receiver when rendered.
     */

    var rowHeight,
        fixedSize,

        currentHeight,

        styleObj,

        minHeight,
        maxHeight;

    //  NOTE: In this method, we follow the HTML5 semantics of allowing the CSS
    //  to 'override' whatever setting was given in the 'size' attribute.

    //  Get the current, computed height
    currentHeight = this.getHeight();

    //  We need to subtract *our own* (vertical) border
    currentHeight -=
        this.getComputedStyleProperty('border-top-width').asNumber() +
        this.getComputedStyleProperty('border-bottom-width').asNumber();

    //  If we have a direct 'height' value set on the '.style' property, then
    //  that overrides everything - return it.

    //  NB: Note here how we go after the *local* style object, *not* the
    //  computed style object.
    styleObj = TP.elementGetStyleObj(this.getNativeNode());
    if (TP.notEmpty(styleObj.height)) {
        return currentHeight;
    }

    rowHeight = this.getRowHeight();
    if (!TP.isNumber(rowHeight)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    //  See if a fixed size is available.
    fixedSize = this.getAttribute('size');
    fixedSize = fixedSize.asNumber();

    if (TP.isNumber(fixedSize)) {
        currentHeight = fixedSize * rowHeight;
    }

    //  If we have a 'maximum height' in our computed style then return the
    //  maximum height.
    maxHeight = this.getComputedStyleProperty('max-height', true);
    if (TP.isNumber(maxHeight) && maxHeight > 0 &&
        currentHeight >= maxHeight) {
        return maxHeight;
    }

    //  If we have a 'minimum height' in our computed style and the current
    //  height is less than (shouldn't be, according to CSS) or equal to that,
    //  then return the minium height.
    minHeight = this.getComputedStyleProperty('min-height', true);
    if (TP.isNumber(minHeight) && minHeight > 0 &&
        currentHeight <= minHeight) {
        return minHeight;
    }

    //  If the current height is less than the row height (a single row height),
    //  then return that.
    if (currentHeight < rowHeight) {
        return rowHeight;
    }

    return currentHeight;
});

//  ------------------------------------------------------------------------

TP.dom.D3VirtualList.Inst.defineMethod('computeGeneratedRowCount',
function() {

    /**
     * @method computeGeneratedRowCount
     * @summary Returns the number of rows that the receiver has actually
     *     generated to display its data.
     * @returns {Number} The number of actual row elements that the receiver
     *     generated.
     */

    var viewportHeight,
        rowHeight,

        computedRowCount,

        borderSize;

    viewportHeight = this.computeHeight();

    //  The current row height.
    rowHeight = this.getRowHeight();
    if (!TP.isNumber(rowHeight)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    this.$set('$bumpRowCount', 0, false);

    //  Viewport height less than row height. Default to 1 row.
    if (viewportHeight < rowHeight) {
        computedRowCount = 1;
    } else {
        computedRowCount = (viewportHeight / rowHeight).round();

        //  Grab the border size
        borderSize = this.getRowBorderHeight();
        if (!TP.isNumber(borderSize)) {
            return this.raise('TP.sig.InvalidNumber');
        }

        //  Double the border size to ensure enough overlap.
        borderSize *= 2;

        //  If the viewport, minus the border height, doesn't fall on an even
        //  boundary, then increment the count by 1, so that we get an overlap
        //  to avoid 'blank' spaces.
        if ((viewportHeight - borderSize) / rowHeight > computedRowCount) {
            computedRowCount += 1;
            this.$set('$bumpRowCount', 1, false);
        }
    }

    return computedRowCount;
});

//  ------------------------------------------------------------------------

TP.dom.D3VirtualList.Inst.defineMethod('getItemSelectionInfo',
function() {

    /**
     * @method getItemSelectionInfo
     * @summary Returns an Array that contains an attribute name and attribute
     *     value that will be used to 'select' all of the items in the template
     *     of the receiver.
     *     Therefore, the receiver needs to stamp this attribute and value on
     *     each item in its drawing machinery methods.
     * @returns {String[]} A pair containing the attribute name and value.
     */

    return TP.ac('class', 'row');
});

//  ------------------------------------------------------------------------

TP.dom.D3VirtualList.Inst.defineMethod('getRowHeight',
function() {

    /**
     * @method getRowHeight
     * @summary Returns the height of each element of the row. This should
     *     correspond to the 'offsetHeight' of each row when the list is
     *     rendered.
     * @returns {Number} The height of a row when rendered.
     */

    //  The target type really needs to override this, so we return 0 here.
    return 0;
});

//  ------------------------------------------------------------------------

TP.dom.D3VirtualList.Inst.defineMethod('getRowBorderHeight',
function() {

    /**
     * @method getRowBorderHeight
     * @summary Returns the height of the bottom and top borders together.
     * @returns {Number} The height of a row bottom and top borders.
     */

    //  The target type really needs to override this, so we return 0 here.
    return 0;
});

//  ------------------------------------------------------------------------

TP.dom.D3VirtualList.Inst.defineMethod('getPageSize',
function() {

    /**
     * @method getPageSize
     * @summary Returns the visual 'page size' in terms of number of rows.
     * @returns {Number} The page size in rows.
     */

    var rowHeight,

        displayedRowCount;

    rowHeight = this.getRowHeight();
    if (!TP.isNumber(rowHeight)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    //  And the number of rows we're currently displaying is our overall element
    //  divided by our row height.
    displayedRowCount = (this.getHeight() / rowHeight).floor();

    return displayedRowCount;
});

//  ------------------------------------------------------------------------

TP.dom.D3VirtualList.Inst.defineMethod('getScrollingContainer',
function() {

    /**
     * @method getScrollingContainer
     * @summary Returns the Element that will be used as the 'scrolling
     *     container'. This is the element that will be the container of the
     *     list of items and will be translated to perform scrolling
     * @returns {Element} The element to use as the scrolling container.
     */

    return this.getNativeNode();
});

//  ------------------------------------------------------------------------

TP.dom.D3VirtualList.Inst.defineMethod('getStartIndex',
function() {

    /**
     * @method getStartIndex
     * @summary Returns the 'start index'. That is, the number of the first
     *     generated row (which, because of how scrolling overlap works, might
     *     or might not be the actual first visible row, but we can still use
     *     this to do next/previous focusing calculations).
     * @returns {Number} The start index.
     */

    var elem,
        rowHeight,

        startIndex;

    elem = this.getNativeNode();

    rowHeight = this.getRowHeight();
    if (!TP.isNumber(rowHeight)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    //  The current starting row is whatever our current scrollTop setting is
    //  divided by our row height. Note here how we 'ceil()' the value to get
    //  the maximum. This is important for our calculations.
    startIndex = (elem.scrollTop / rowHeight).ceil();

    return startIndex;
});

//  ------------------------------------------------------------------------

TP.dom.D3VirtualList.Inst.defineMethod('getStartAndEndVisualRows',
function() {

    /**
     * @method getStartAndEndVisualRows
     * @summary Returns the elements that represent the actual *visible* first
     *     and last rows.
     * @returns {TP.dom.UIElementNode[]} An Array pair where the first item is
     *     the first *visual* element and the last item is the last *visual*
     *     element.
     */

    var items,

        data,
        lastDataIndex,

        pageSize,

        firstVisualItem,
        lastVisualItem,

        lastVisualElem,
        rect,
        lastIsClipped;

    //  Grab all of the *visual* elements under the selection container. Note
    //  that this may contain a hidden element at the top or bottom, which we
    //  specifically computed for earlier when computing the generated row
    //  count, so that empty partial blank space won't show.
    items = TP.wrap(this.getSelectionContainer()).getChildElements();

    //  Grab our selection data and the last index that it contains.
    data = this.computeSelectionData();
    lastDataIndex = data.getSize() - 1;

    pageSize = this.getPageSize();

    //  If the last index is less than or equal to our page size, then we're not
    //  any larger than a page and the measurements will be exact. Simply return
    //  the first and last item.
    if (lastDataIndex <= pageSize) {
        firstVisualItem = items.at(0);
        lastVisualItem = items.at(pageSize - 1);
    } else {

        //  Otherwise, grab the native Element of the last item.
        lastVisualElem = items.last().getNativeNode();

        //  Grab it's bounding rectangle.
        rect = lastVisualElem.getBoundingClientRect();

        //  If it's height - top is greater than the receiver's overall height,
        //  then it's the last item that's 'clipped and hidden'.
        /* eslint-disable no-extra-parens */
        lastIsClipped = (rect.top - rect.height) > this.getHeight();
        /* eslint-enable no-extra-parens */

        //  Compute the proper first & last items, depending on whether it's the
        //  last item that's being clipped and hidden or not.
        if (lastIsClipped) {
            firstVisualItem = items.at(0);
            lastVisualItem = items.at(pageSize - 1);
        } else {
            firstVisualItem = items.at(1);
            lastVisualItem = items.at(pageSize);
        }
    }

    return TP.ac(firstVisualItem, lastVisualItem);
});

//  ------------------------------------------------------------------------

TP.dom.D3VirtualList.Inst.defineHandler('DOMMouseWheel',
function(aSignal) {

    /**
     * @method handleDOMMouseWheel
     * @summary Handles notifications of mouse wheel signals.
     * @param {TP.sig.DOMMouseWheel} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.dom.D3VirtualList} The receiver.
     */

    var elem,
        nativeWindow,

        scrollRendering,

        scrollFactor,

        thisref,

        performRender;

    elem = this.getNativeNode();
    nativeWindow = this.getNativeWindow();

    scrollRendering = false;

    scrollFactor = this.get('scrollFactor');

    thisref = this;

    performRender =
        function() {
            if (!scrollRendering) {
                nativeWindow.requestAnimationFrame(
                    function() {
                        elem.scrollTop +=
                            aSignal.getWheelDelta() * scrollFactor;
                        thisref.$internalRender();
                        scrollRendering = false;
                    });
                scrollRendering = true;
            }
        };

    performRender();

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.D3VirtualList.Inst.defineMethod('$internalRender',
function(desiredScrollTop) {

    /**
     * @method $internalRender
     * @summary This method contains the actual machinery of rendering the
     *     virtual list.
     * @param {Number} [desiredScrollTop] The value of where the receiver's
     *     scrolling element's 'scrollTop' should be. This will default to the
     *     receiver's scrolling element's current scrollTop value.
     * @returns {TP.dom.D3VirtualList} The receiver.
     */

    var rowHeight,
        bumpRowCount,

        scrollerElem,
        viewportElem,

        container,

        itemSelectionInfo,

        computedRowCount,

        selectionData,

        totalRows,

        allData,

        finalRowCount,

        scroller,
        scrollTop,

        totalHeight,
        minHeight,

        position,

        startOffset,
        endOffset,

        oldStartOffset,
        oldEndOffset,
        oldComputedRowCount,

        d3UpdateFunc,

        thisref,

        rowSelector,

        d3EnterFunc,
        d3ExitFunc,
        d3DataIdFunc;

    rowHeight = this.getRowHeight();
    bumpRowCount = this.$get('$bumpRowCount');

    scrollerElem = this.getScrollingContainer();

    //  The element that forms the outer viewport
    viewportElem = this.getNativeNode();

    //  The content that will actually be scrolled.
    container = TP.extern.d3.select(this.getSelectionContainer());
    if (TP.notValid(container.node()) ||
        TP.notValid(container.node().style)) {
        return;
    }

    computedRowCount = this.computeGeneratedRowCount();

    //  Give the list 50% more rows that whatever it is we're displaying to give
    //  some overlap for less flicker.
    computedRowCount *= 1.5;

    //  The d3 selection data.
    selectionData = this.computeSelectionData();

    //  The number of total rows of data.
    totalRows = selectionData.getSize();

    allData = TP.ifEmpty(selectionData, TP.ac());

    finalRowCount = totalRows;
    if (bumpRowCount > 0) {
        finalRowCount -= bumpRowCount;
    }

    //  The element that will perform the scrolling.
    scroller = TP.extern.d3.select(scrollerElem);

    scrollTop = TP.ifInvalid(desiredScrollTop, viewportElem.scrollTop);

    minHeight = this.getComputedStyleProperty('min-height', true);
    if (!TP.isNumber(minHeight)) {
        minHeight = 0;
    }

    /* eslint-disable no-extra-parens */
    totalHeight = Math.max(minHeight, (finalRowCount * rowHeight));
    /* eslint-enable no-extra-parens */

    //  both style and attr height values seem to be respected
    scroller.style('height', totalHeight + 'px');

    position = Math.floor(scrollTop / rowHeight);

    finalRowCount = totalRows;

    //  Calculate the start offset (if there are 'bump rows', add them
    //  and then 1 to offset 0 position vs totalRow count diff)
    if (bumpRowCount > 0) {
        finalRowCount -= 1;
        startOffset = Math.max(
        0,
        Math.min(
            position,
            finalRowCount - computedRowCount + bumpRowCount + 1));

        endOffset = startOffset + computedRowCount + bumpRowCount + 1;
    } else {
        startOffset = Math.max(
        0,
        Math.min(
            position,
            finalRowCount - computedRowCount));

        endOffset = startOffset + computedRowCount;
    }

    oldStartOffset = this.$get('$startOffset');
    oldEndOffset = this.$get('$endOffset');
    oldComputedRowCount = this.$get('$computedRowCount');

    d3UpdateFunc = this.d3Update.bind(this);

    thisref = this;

    if (oldStartOffset === startOffset &&
        oldEndOffset === endOffset &&
        oldComputedRowCount === computedRowCount) {

        container.each(
            function() {
                var rowUpdateSelection,
                    newData;

                //  do not update .transitioning elements
                rowUpdateSelection =
                    container.selectAll('.row:not(.transitioning)');

                //  compute the new data slice
                newData = allData.slice(
                            startOffset,
                            Math.min(endOffset, finalRowCount));

                //  Just update the individual datums for each row.
                rowUpdateSelection.each(
                    function(oldData, index) {
                        var val;

                        //  Grab the new value. If it doesn't exist,
                        //  then ask the control to create a blank row
                        //  for the row at our index.
                        val = newData[index];
                        if (TP.notValid(val)) {
                            val = thisref.createBlankRowData(index);
                        }

                        //  Select ourself as the element and set the
                        //  individual datum.
                        TP.extern.d3.select(this).datum(val);
                    });

                rowUpdateSelection.call(d3UpdateFunc);
            });
    } else {

        /* eslint-disable no-extra-parens */
        container.style(
                'transform',
                'translate(0px, ' +
                            (position * rowHeight) + 'px)');
        /* eslint-enable no-extra-parens */

        this.$set('$startOffset', startOffset, false);
        this.$set('$endOffset', endOffset, false);
        this.$set('$computedRowCount', computedRowCount, false);

        //  Row 'selection' criteria - an Array with the name of the attribute as
        //  the first value and the value of the attribute as the second value.
        itemSelectionInfo = this.getItemSelectionInfo();

        //  build a selector that will be used to 'select' rows.
        rowSelector = '*[' + itemSelectionInfo.first() +
                        '~=' +
                        '"' + itemSelectionInfo.last() + '"' +
                        ']';

        d3EnterFunc = this.d3Enter.bind(this);
        d3ExitFunc = this.d3Exit.bind(this);

        d3DataIdFunc = this.d3KeyFunction();

        //  slice out visible rows from data and display
        container.each(
            function() {
                var newData,

                    rowSelection,
                    rowUpdateSelection;

                //  compute the new data slice
                newData = allData.slice(
                            startOffset,
                            Math.min(endOffset, finalRowCount));

                rowSelection = container.selectAll(rowSelector).
                                data(newData, d3DataIdFunc);

                rowSelection.exit().call(d3ExitFunc).remove();

                rowSelection.enter().call(d3EnterFunc);
                rowSelection.order();

                //  do not position .transitioning elements
                rowUpdateSelection =
                    container.selectAll('.row:not(.transitioning)');

                rowUpdateSelection.call(d3UpdateFunc);

                rowUpdateSelection.each(
                    function(d, i) {
                        TP.extern.d3.select(this).style(
                                'transform',
                                function() {
                                    /* eslint-disable no-extra-parens */
                                    return 'translate(0px,' +
                                            (i * rowHeight) + 'px)';
                                    /* eslint-enable no-extra-parens */
                                });
                    });
            });
    }

    //  Signal to observers that this control has rendered.
    this.signal('TP.sig.DidRenderData');

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.D3VirtualList.Inst.defineMethod('isReadyToRender',
function() {

    /**
     * @method isReadyToRender
     * @summary Whether or not the receiver is 'ready to render'. Normally, this
     *     means that all of the resources that the receiver relies on to render
     *     have been loaded.
     * @returns {Boolean} Whether or not the receiver is ready to render.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.dom.D3VirtualList.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver.
     * @returns {TP.dom.D3VirtualList} The receiver.
     */

    var containerSelection;

    //  If we're not ready to render, then don't. Another process will have to
    //  re-trigger the rendering process.

    //  Note that the 'shouldRender' check is a strict check for the value of
    //  'false' (the Boolean value of false). This can't just be a 'falsey'
    //  value.
    if (!this.isReadyToRender() || TP.isFalse(this.get('shouldRender'))) {
        return this;
    }

    //  Select all of the elements in the root selector container
    this.d3SelectContainer();

    //  If the data is not valid, then empty the root selection (keeping the
    //  root itself intact for future updates).
    if (TP.notValid(this.get('data'))) {

        containerSelection = this.get('containerSelection');
        if (TP.isValid(containerSelection)) {
            containerSelection.selectAll('*').remove();

            //  Signal to observers that this control has rendered.
            this.signal('TP.sig.DidRender');
        }

        return this;
    }

    this.$internalRender();

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.D3VirtualList.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the receiver.
     * @returns {TP.dom.D3VirtualList} The receiver.
     */

    var elem;

    //  The element that forms the outer viewport
    elem = this.getNativeNode();

    this.observe(this, 'TP.sig.DOMMouseWheel');

    //  Register ourself as a 'mousewheel' capturer. Since all we're doing is
    //  scrolling when the mousewheel is spun, we don't want the regular
    //  'invokeObservers' machinery to run in the event system. This helps with
    //  scrolling performance and flicker.
    TP.$mousewheel_capturer_cache.push(elem);

    this.set('scrollFactor', 5);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.D3VirtualList.Inst.defineMethod('teardown',
function() {

    /**
     * @method teardown
     * @summary Tears down the receiver by performing housekeeping cleanup, like
     *     ignoring signals it's observing, etc.
     * @returns {TP.dom.D3VirtualList} The receiver.
     */

    var elem;

    //  The element that forms the outer viewport
    elem = this.getNativeNode();

    this.ignore(this, 'TP.sig.DOMMouseWheel');

    //  Remove ourself as a 'mousewheel capturer'.
    TP.$mousewheel_capturer_cache.splice(
        TP.$mousewheel_capturer_cache.indexOf(elem), 1);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
