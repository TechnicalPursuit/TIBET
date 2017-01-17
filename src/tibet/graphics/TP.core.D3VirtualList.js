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
 * @type {TP.core.D3VirtualList}
 * @summary A subtype of the TP.core.D3Tag trait type that is used to add
 *     'virtual scrolling behavior to any type that implements a scrolling list.
 * @description This code is a heavily adapted version of the d3.js virtual
 *     scrolling routine found here:
 *          http://www.billdwhite.com/wordpress/2014/05/17/d3-scalability-virtual-scrolling-for-large-visualizations/
 *      It has been adapted to not be specific to SVG and to conform to TIBET
 *      linting conventions.
 */

//  ------------------------------------------------------------------------

TP.core.D3Tag.defineSubtype('D3VirtualList');

//  This type is intended to be used as a trait type only, so we don't allow
//  instance creation
TP.core.D3VirtualList.isAbstract(true);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.D3VirtualList.Inst.defineAttribute('$startOffset');
TP.core.D3VirtualList.Inst.defineAttribute('$endOffset');
TP.core.D3VirtualList.Inst.defineAttribute('$totalRows');
TP.core.D3VirtualList.Inst.defineAttribute('$dataSize');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.D3VirtualList.Inst.defineMethod('adjustIterationIndex',
function(anIndex) {

    /**
     * @method adjustIterationIndex
     * @summary Adjusts any iteration index that we use when building or
     *     updating templated content.
     * @param {Number} The initial index as supplied by d3.
     * @returns {Number} The adjusted index.
     */

    //  At this level, this method returns the number it was handed plus the
    //  current start offset that it is tracking.
    return anIndex + this.$get('$startOffset');
});

//  ------------------------------------------------------------------------

TP.core.D3VirtualList.Inst.defineMethod('computeHeight',
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

    //  If we have a direct 'height' value set on the '.style' property, then
    //  that overrides everything - return it.

    //  NB: Note here how we go after the *local* style object, *not* the
    //  computed style object.
    styleObj = TP.elementGetStyleObj(this.getNativeNode());
    if (TP.notEmpty(styleObj.height)) {
        return currentHeight;
    }

    //  If we have a 'maximum height' in our computed style then return the
    //  maximum height.
    maxHeight = this.getComputedStyleProperty('max-height', true);
    if (TP.isNumber(maxHeight)) {
        return maxHeight;
    }

    //  If we have a 'minimum height' in our computed style and the current
    //  height is less than (shouldn't be, according to CSS) or equal to that,
    //  then return the minium height.
    minHeight = this.getComputedStyleProperty('min-height', true);
    if (TP.isNumber(minHeight) && currentHeight <= minHeight) {
        return minHeight;
    }

    rowHeight = this.getRowHeight();

    //  See if a fixed size is available
    fixedSize = this.getAttribute('size');
    fixedSize = fixedSize.asNumber();

    if (TP.isNumber(fixedSize)) {
        fixedSize = fixedSize * rowHeight;
    } else {
        fixedSize = 0;
    }

    //  If we have a fixed size due to a 'size' attribute, and the current
    //  height is less than that, then return that.
    if (fixedSize !== 0 && currentHeight < fixedSize) {
        return fixedSize;
    }

    //  If the current height is less than the row height, then return that.
    if (currentHeight < rowHeight) {
        return rowHeight;
    }

    return currentHeight;
});

//  ------------------------------------------------------------------------

TP.core.D3VirtualList.Inst.defineMethod('getRowAttrSelectionInfo',
function() {

    /**
     * @method getRowAttrSelectionInfo
     * @summary Returns an Array that contains an attribute name and attribute
     *     value that will be used to 'select' all of the rows of the receiver.
     *     Therefore, the receiver needs to stamp this attribute and value on
     *     each row in its drawing machinery methods.
     * @returns {Array} A pair containing the attribute name and value.
     */

    return TP.ac('class', 'row');
});

//  ------------------------------------------------------------------------

TP.core.D3VirtualList.Inst.defineMethod('getRowHeight',
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

TP.core.D3VirtualList.Inst.defineMethod('getPageSize',
function() {

    /**
     * @method getPageSize
     * @summary Returns the visual 'page size' in terms of number of rows.
     * @returns {Number} The page size in rows.
     */

    var rowHeight,

        displayedRowCount;

    rowHeight = this.getRowHeight();

    //  And the number of rows we're currently displaying is our overall element
    //  divided by our row height.
    displayedRowCount = (this.getHeight() / rowHeight).floor();

    return displayedRowCount;
});

//  ------------------------------------------------------------------------

TP.core.D3VirtualList.Inst.defineMethod('getStartIndex',
function() {

    /**
     * @method getStartIndex
     * @summary Returns the 'start index'. That is, the number of the first
     *     visual row.
     * @returns {Number} The start index.
     */

    var elem,
        rowHeight,

        startIndex;

    elem = this.getNativeNode();

    rowHeight = this.getRowHeight();

    //  The current starting row is whatever our current scrollTop setting is
    //  divided by our row height.
    startIndex = (elem.scrollTop / rowHeight).floor();

    return startIndex;
});

//  ------------------------------------------------------------------------

TP.core.D3VirtualList.Inst.defineMethod('getScrollingContainer',
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

TP.core.D3VirtualList.Inst.defineMethod('isReadyToRender',
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

TP.core.D3VirtualList.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver.
     * @returns {TP.core.D3Tag} The receiver.
     */

    var allData,

        rowHeight,
        scrollingContent,
        scrollerElem,
        viewportElem,
        totalRows,

        attrSelectionInfo,

        virtualScroller;

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

        this.get('rootSelection').selectAll('*').remove();

        return this;
    }

    allData = this.computeSelectionData();

    rowHeight = this.getRowHeight();

    //  Call upon the virtual scroller method

    //  The content that will actually be scrolled.
    scrollingContent = this.getSelectionContainer();

    //  The element that will perform the scrolling.
    scrollerElem = this.getScrollingContainer();

    //  The element that forms the outer viewport
    viewportElem = this.getNativeNode();

    //  The number of total rows of data
    totalRows = allData.getSize();

    //  Row 'selection' criteria - an Array with the name of the attribute as
    //  the first value and the value of the attribute as the second value.
    attrSelectionInfo = this.getRowAttrSelectionInfo();

    virtualScroller = TP.extern.d3.VirtualScroller();

    virtualScroller.
        rowHeight(rowHeight).
        enter(this.d3Enter.bind(this)).
        update(this.d3Update.bind(this)).
        exit(this.d3Exit.bind(this)).
        scroller(TP.extern.d3.select(scrollerElem)).
        totalRows(totalRows).
        viewport(TP.extern.d3.select(viewportElem)).
        target(viewportElem).
        selectionInfo(attrSelectionInfo).
        control(this);

    virtualScroller.data(allData, this.getKeyFunction());

    TP.extern.d3.select(scrollingContent).call(virtualScroller);

    return this;
});

//  ------------------------------------------------------------------------

TP.extern.d3.VirtualScroller = function() {

    var enter,
        update,
        exit,
        allData,
        dataid,
        scroller,
        viewport,
        totalRows,
        position,
        rowHeight,
        totalHeight,
        minHeight,
        viewportHeight,
        visibleRows,
        target,
        selectionInfo,
        delta,
        dispatch,
        control,

        scrollerFunc;

    enter = null;
    update = null;
    exit = null;
    allData = TP.ac();
    dataid = null;
    scroller = null;
    viewport = null;
    totalRows = 0;
    position = 0;
    rowHeight = 0;
    totalHeight = 0;
    minHeight = 0;
    viewportHeight = 0;
    visibleRows = 0;
    target = null;
    selectionInfo = null;
    delta = 0;
    control = null;
    dispatch = TP.extern.d3.dispatch('pageDown', 'pageUp');

    scrollerFunc = function(container) {

        var render,
            scrollRenderFrame;

        render = function(resize) {

            var scrollTop,
                lastPosition;

            //  re-calculate height of viewport and # of visible row
            if (resize) {
                viewportHeight = TP.wrap(viewport.node()).computeHeight();

                if (viewportHeight < rowHeight) {
                    //  List height less than row height. Default to 1 row.
                    visibleRows = 1;
                } else {

                    //  Otherwise, grab the 'maximum' and then add 1 to pad it
                    //  out. This makes sure that we have complete coverage
                    //  rather than 'half rows'.
                    visibleRows = Math.ceil(viewportHeight / rowHeight) + 1;
                }
            }
            scrollTop = viewport.node().scrollTop;

            /* eslint-disable no-extra-parens */
            totalHeight = Math.max(minHeight, (totalRows * rowHeight));
            /* eslint-enable no-extra-parens */

            //  both style and attr height values seem to be respected
            scroller.style('height', totalHeight + 'px');

            lastPosition = position;
            position = Math.floor(scrollTop / rowHeight);
            delta = position - lastPosition;

            scrollRenderFrame(position);
        };

        control.$internalRender = render;

        scrollRenderFrame = function(scrollPosition) {

            var rowSelector,

                startOffset,
                endOffset,

                oldStartOffset,
                oldTotalRows,
                oldDataSize;

            //  build a selector that will be used to 'select' rows.
            rowSelector = '*[' + selectionInfo.first() +
                            '~=' +
                            '"' + selectionInfo.last() + '"' +
                            ']';

            //  calculate positioning (use + 1 to offset 0 position vs
            //  totalRow count diff)
            startOffset = Math.max(
                        0,
                        Math.min(scrollPosition, totalRows - visibleRows + 1));
            endOffset = startOffset + visibleRows;

            oldStartOffset = control.$get('$startOffset');
            oldTotalRows = control.$get('$totalRows');
            oldDataSize = control.$get('$dataSize');

            if (oldStartOffset === startOffset &&
                oldTotalRows === totalRows &&
                oldDataSize === allData.getSize()) {

                container.each(
                    function() {
                        var rowUpdateSelection;

                        //  do not update .transitioning elements
                        rowUpdateSelection =
                            container.selectAll('.row:not(.transitioning)');
                        rowUpdateSelection.call(update);
                    });
            } else {

                /* eslint-disable no-extra-parens */
                container.style(
                        'transform',
                        'translate(0px, ' + (scrollPosition * rowHeight) + 'px)');
                /* eslint-enable no-extra-parens */

                control.$set('$startOffset', startOffset, false);
                control.$set('$endOffset', endOffset, false);
                control.$set('$totalRows', totalRows, false);
                control.$set('$dataSize', allData.getSize(), false);

                //  slice out visible rows from data and display
                container.each(
                    function() {
                        var rowSelection,
                            rowUpdateSelection;

                        rowSelection = container.selectAll(rowSelector).
                            data(
                                allData.slice(
                                    startOffset,
                                    Math.min(endOffset, totalRows)), dataid);

                        rowSelection.exit().call(exit).remove();

                        rowSelection.enter().call(enter);
                        rowSelection.order();

                        //  do not update or position .transitioning elements
                        rowUpdateSelection =
                            container.selectAll('.row:not(.transitioning)');

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

            //  dispatch events
            /* eslint-disable no-extra-parens */
            if (endOffset > (allData.length - visibleRows)) {
            /* eslint-enable no-extra-parens */
                dispatch.pageDown({
                    delta: delta
                });
            } else if (startOffset < visibleRows) {
                dispatch.pageUp({
                    delta: delta
                });
            }
        };

        //  make render function publicly visible
        scrollerFunc.render = render;

        //  call render on scrolling event
        viewport.on('scroll.scrollerFunc', render, true);

        //  call render() to start
        render(true);
    };

    scrollerFunc.control = function(_) {

        if (!arguments.length) {
            return control;
        }

        control = _;

        return scrollerFunc;
    };

    scrollerFunc.data = function(_, __) {

        if (!arguments.length) {
            return allData;
        }

        allData = _;
        dataid = __;

        return scrollerFunc;
    };

    scrollerFunc.dataid = function(_) {

        if (!arguments.length) {
            return dataid;
        }

        dataid = _;

        return scrollerFunc;
    };

    scrollerFunc.enter = function(_) {

        if (!arguments.length) {
            return enter;
        }

        enter = _;

        return scrollerFunc;
    };

    scrollerFunc.update = function(_) {

        if (!arguments.length) {
            return update;
        }

        update = _;

        return scrollerFunc;
    };

    scrollerFunc.exit = function(_) {

        if (!arguments.length) {
            return exit;
        }

        exit = _;

        return scrollerFunc;
    };

    scrollerFunc.totalRows = function(_) {

        if (!arguments.length) {
            return totalRows;
        }

        totalRows = _;

        return scrollerFunc;
    };

    scrollerFunc.rowHeight = function(_) {

        if (!arguments.length) {
            return rowHeight;
        }

        rowHeight = Number(_);

        return scrollerFunc;
    };

    scrollerFunc.totalHeight = function(_) {

        if (!arguments.length) {
            return totalHeight;
        }

        totalHeight = Number(_);

        return scrollerFunc;
    };

    scrollerFunc.minHeight = function(_) {

        if (!arguments.length) {
            return minHeight;
        }

        minHeight = Number(_);

        return scrollerFunc;
    };

    scrollerFunc.position = function(_) {

        if (!arguments.length) {
            return position;
        }

        position = Number(_);
        if (viewport) {
            viewport.node().scrollTop = position;
        }

        return scrollerFunc;
    };

    scrollerFunc.scroller = function(_) {

        if (!arguments.length) {
            return scroller;
        }

        scroller = _;

        return scrollerFunc;
    };

    scrollerFunc.viewport = function(_) {

        if (!arguments.length) {
            return viewport;
        }

        viewport = _;

        return scrollerFunc;
    };

    scrollerFunc.target = function(_) {

        if (!arguments.length) {
            return target;
        }

        target = _;

        return scrollerFunc;
    };

    scrollerFunc.selectionInfo = function(_) {

        if (!arguments.length) {
            return selectionInfo;
        }

        selectionInfo = _;

        return scrollerFunc;
    };

    scrollerFunc.delta = function() {
        return delta;
    };

    TP.extern.d3.rebind(scrollerFunc, dispatch, 'on');

    return scrollerFunc;
};

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
