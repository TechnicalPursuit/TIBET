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
 * @type {TP.sherpa.navlist}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('navlist');

TP.sherpa.navlist.addTraits(TP.core.SelectingUIElementNode);
TP.sherpa.navlist.addTraits(TP.core.D3VirtualList);

TP.sherpa.navlist.Inst.resolveTrait('select', TP.core.SelectingUIElementNode);
TP.sherpa.navlist.Inst.resolveTrait('render', TP.core.D3VirtualList);
TP.sherpa.navlist.Inst.resolveTrait('isReadyToRender', TP.core.D3VirtualList);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineAttribute(
    'scroller',
    {value: TP.cpc('> .scroller', TP.hc('shouldCollapse', true))});

TP.sherpa.navlist.Inst.defineAttribute(
    'listcontent',
    {value: TP.cpc('> .scroller > .content', TP.hc('shouldCollapse', true))});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineHandler('ItemSelected',
function(aSignal) {

    var domTarget,
        wrappedDOMTarget,

        label,
        value;

    domTarget = aSignal.getDOMTarget();

    if (TP.elementHasAttribute(domTarget, 'spacer') ||
        TP.elementHasAttribute(domTarget, 'category')) {
        return this;
    }

    wrappedDOMTarget = TP.wrap(domTarget);

    label = wrappedDOMTarget.getTextContent();

    if (wrappedDOMTarget.hasAttribute('itemName')) {
        value = wrappedDOMTarget.getAttribute('itemName');
    } else {
        value = label;
    }

    this.select(label);

    this.signal('FocusInspectorForBrowsing',
                TP.hc('targetAspect', value,
                        'domTarget', domTarget));

    return this;
});

//  ------------------------------------------------------------------------
//  TP.core.D3Tag Methods
//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineMethod('buildNewContent',
function(enterSelection) {

    /**
     * @method buildNewContent
     * @summary Builds new content onto the receiver by appending or inserting
     *     content into the supplied d3.js 'enter selection'.
     * @param {TP.extern.d3.selection} enterSelection The d3.js enter selection
     *     that new content should be appended to.
     * @returns {TP.core.D3Tag} The receiver.
     */

    var data,

        attrSelectionInfo,
        newContent,

        selectedValues,
        selectAll;

    data = this.get('data');

    attrSelectionInfo = this.getRowAttrSelectionInfo();
    newContent = enterSelection.append('li').attr(attrSelectionInfo.first(),
                                                    attrSelectionInfo.last());

    selectedValues = this.getSelectionModel().at('value');
    if (TP.notValid(selectedValues)) {
        selectedValues = TP.ac();
    } else {
        selectAll = selectedValues.hasKey(TP.ALL);
    }

    if (TP.isArray(data.first())) {
        newContent.html(
                function(d, i) {
                    //  Note how we test the whole value here - we won't have
                    //  made an Array at the place where there's a spacer slot.
                    if (/^spacer/.test(d)) {
                        return '&#160;';
                    }

                    if (/^category/.test(d[0])) {
                        return /category\s*-\s*(.+)/.exec(d[0])[1];
                    }

                    return d[0];
                }).attr(
                'itemName', function(d) {
                    return d[1];
                }).attr(
                'pclass:selected', function(d) {
                    if (selectAll) {
                        return 'true';
                    }

                    if (selectedValues.contains(d[0])) {
                        return 'true';
                    }

                    //  Returning null will cause d3.js to remove the
                    //  attribute.
                    return null;
                }).attr(
                'category', function(d) {
                    if (/^category/.test(d)) {
                        return true;
                    }

                    //  Returning null will cause d3.js to remove the
                    //  attribute.
                    return null;
                }).attr(
                'spacer', function(d) {
                    //  Note how we test the whole value here - we won't have
                    //  made an Array at the place where there's a spacer slot.
                    if (/^spacer/.test(d)) {
                        return true;
                    }

                    //  Returning null will cause d3.js to remove the
                    //  attribute.
                    return null;
                }).attr(
                'title', function(d, i) {
                    //  Note how we test the whole value here - we won't have
                    //  made an Array at the place where there's a spacer slot.
                    if (/^spacer/.test(d)) {
                        return '';
                    }

                    return d[0];
                }
            );
    } else {
        newContent.html(
                function(d, i) {
                    if (/^spacer/.test(d)) {
                        return '&#160;';
                    }

                    if (/^category/.test(d)) {
                        return /category\s*-\s*(.+)/.exec(d)[1];
                    }

                    return d;
                }).attr(
                'pclass:selected', function(d, i) {
                    if (selectAll) {
                        return 'true';
                    }

                    if (selectedValues.contains(d)) {
                        return 'true';
                    }

                    //  Returning null will cause d3.js to remove the
                    //  attribute.
                    return null;
                }).attr(
                'category', function(d, i) {
                    if (/^category/.test(d)) {
                        return true;
                    }

                    //  Returning null will cause d3.js to remove the
                    //  attribute.
                    return null;
                }).attr(
                'spacer', function(d, i) {
                    if (/^spacer/.test(d)) {
                        return true;
                    }

                    //  Returning null will cause d3.js to remove the
                    //  attribute.
                    return null;
                }).attr(
                'title', function(d, i) {
                    if (/^spacer/.test(d)) {
                        return '';
                    }

                    return d;
                });
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineMethod('computeSelectionData',
function() {

    /**
     * @method computeSelectionData
     * @summary Returns the data that will actually be used for binding into the
     *     d3.js selection.
     * @description The selection data may very well be different than the bound
     *     data that uses TIBET data binding to bind data to this control. This
     *     method allows the receiver to transform it's 'data binding data' into
     *     data appropriate for d3.js selections.
     * @returns {TP.core.D3Tag} The receiver.
     */

    var data,

        elem,

        containerHeight,
        rowHeight,

        displayedRows,

        startIndex,
        len,
        i;

    data = this.get('data');

    elem = this.getNativeNode();

    containerHeight = TP.elementGetHeight(elem);
    rowHeight = this.getRowHeight();

    if (containerHeight < rowHeight) {
        containerHeight = TP.elementGetHeight(elem.parentNode);
    }

    displayedRows = (containerHeight / rowHeight).floor();

    if (TP.isArray(data.first())) {
        startIndex = data.getSize();
        /* eslint-disable no-extra-parens */
        len = displayedRows - startIndex;
        /* eslint-enable no-extra-parens */
        for (i = startIndex; i < startIndex + len; i++) {
            data.atPut(i, TP.ac('spacer' + i, 'spacer' + i));
        }
    } else {
        //  We pad out the data, adding 1 to make sure that we cover partial
        //  rows at the bottom.
        data.pad(displayedRows, 'spacer', true);
    }

    return data;
});

//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineMethod('getKeyFunction',
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

    var data,
        keyFunc;

    data = this.get('data');

    if (TP.isArray(data.first())) {
        keyFunc = function(d) {return d[0]; };
    } else {
        keyFunc = function(d) {return d; };
    }

    return keyFunc;
});

//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineMethod('getRootUpdateSelection',
function(rootSelection) {

    /**
     * @method getRootUpdateSelection
     * @summary Creates the 'root' update selection that will be used as the
     *     starting point to begin d3.js drawing operations.
     * @returns {d3.Selection} The receiver.
     */

    return rootSelection.selectAll('li');
});

//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineMethod('getRowHeight',
function() {

    /**
     * @method getRowHeight
     * @summary Returns the height of each element of the row. This should
     *     correspond to the 'offsetHeight' of each row when the list is
     *     rendered.
     * @returns {Number} The height of a row when rendered.
     */

    return 20;
});

//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineMethod('getSelectionContainer',
function() {

    /**
     * @method getSelectionContainer
     * @summary Returns the Element that will be used as the 'root' to
     *     add/update/remove content to/from using d3.js functionality. By
     *     default, this returns the receiver's native Element.
     * @returns {Element} The element to use as the container for d3.js
     *     enter/update/exit selections.
     */

    return TP.unwrap(this.get('listcontent'));
});

//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineMethod('getScrollingContainer',
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

TP.sherpa.navlist.Inst.defineMethod('updateExistingContent',
function(updateSelection) {

    /**
     * @method updateExistingContent
     * @summary Updates any existing content in the receiver by altering the
     *     content in the supplied d3.js 'update selection'.
     * @param {TP.extern.d3.selection} updateSelection The d3.js update
     *     selection that existing content should be altered in.
     * @returns {TP.core.D3Tag} The receiver.
     */

    var data,

        selectedValues,
        selectAll;

    data = this.get('data');

    selectedValues = this.getSelectionModel().at('value');
    if (TP.notValid(selectedValues)) {
        selectedValues = TP.ac();
    } else {
        selectAll = selectedValues.hasKey(TP.ALL);
    }

    if (TP.isArray(data.first())) {
        updateSelection.html(
                function(d, i) {

                    //  Note how we test the whole value here - we won't have
                    //  made an Array at the place where there's a spacer slot.
                    if (/^spacer/.test(d)) {
                        return '&#160;';
                    }

                    if (/^category/.test(d[0])) {
                        return /category\s*-\s*(.+)/.exec(d[0])[1];
                    }

                    return d[0];
                }).attr(
                'itemName', function(d) {
                    return d[1];
                }).attr(
                'pclass:selected', function(d) {
                    if (selectAll) {
                        return 'true';
                    }

                    if (selectedValues.contains(d[0])) {
                        return 'true';
                    }

                    //  Returning null will cause d3.js to remove the
                    //  attribute.
                    return null;
                }).attr(
                'category', function(d) {
                    if (/^category/.test(d)) {
                        return true;
                    }

                    //  Returning null will cause d3.js to remove the
                    //  attribute.
                    return null;
                }).attr(
                'spacer', function(d) {
                    //  Note how we test the whole value here - we won't have
                    //  made an Array at the place where there's a spacer slot.
                    if (/^spacer/.test(d)) {
                        return true;
                    }

                    //  Returning null will cause d3.js to remove the
                    //  attribute.
                    return null;
                }).attr(
                'title', function(d) {
                    //  Note how we test the whole value here - we won't have
                    //  made an Array at the place where there's a spacer slot.
                    if (/^spacer/.test(d)) {
                        return '';
                    }

                    return d[0];
                }
            );
    } else {
        updateSelection.html(
                function(d, i) {
                    if (/^spacer/.test(d)) {
                        return '&#160;';
                    }

                    if (/^category/.test(d)) {
                        return /category\s*-\s*(.+)/.exec(d)[1];
                    }

                    return d;
                }).attr(
                'pclass:selected', function(d, i) {
                    if (selectAll) {
                        return 'true';
                    }

                    if (selectedValues.contains(d)) {
                        return 'true';
                    }

                    //  Returning null will cause d3.js to remove the
                    //  attribute.
                    return null;
                }).attr(
                'category', function(d, i) {
                    if (/^category/.test(d)) {
                        return true;
                    }

                    //  Returning null will cause d3.js to remove the
                    //  attribute.
                    return null;
                }).attr(
                'spacer', function(d, i) {
                    if (/^spacer/.test(d)) {
                        return true;
                    }

                    //  Returning null will cause d3.js to remove the
                    //  attribute.
                    return null;
                }).attr(
                'title', function(d, i) {
                    if (/^spacer/.test(d)) {
                        return '';
                    }

                    return d;
                });
    }

    return this;
});

//  ------------------------------------------------------------------------
//  TP.core.SelectingUIElement Methods
//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineMethod('allowsMultiples',
function() {

    /**
     * @method allowsMultiples
     * @summary Returns true by default.
     * @returns {Boolean} Whether or not the receiver allows multiple selection.
     */

    return false;
});

//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineMethod('select',
function(aValue) {

    /**
     * @method select
     * @summary Selects the element which has the provided value (if found).
     *     Note that this method is roughly identical to setDisplayValue() with
     *     the exception that this method does not clear existing selections
     *     when processing the value(s) provided. When no specific values are
     *     provided this method will selectAll.
     * @param {Object} aValue The value to select. Note that this can be an
     *     array.
     * @exception TP.sig.InvalidOperation
     * @exception TP.sig.InvalidValueElements
     * @returns {Boolean} Whether or not a selection was selected.
     */

    var retVal,
        data,

        len,
        i,

        itemIndex,

        concreteVal,

        elem,
        rowHeight,
        displayedRows,

        startIndex,

        scrollAmount;

    data = this.get('data');

    //  If our data is an Array of Arrays, grab the first element in each Array
    //  (because that's what we draw in the rendering routines in this type when
    //  that is the case).
    if (TP.isArray(data.first())) {
        data = data.collect(
                    function(anArr) {
                        return anArr.first();
                    });
    }

    if (TP.isRegExp(aValue)) {

        itemIndex = TP.NOT_FOUND;

        len = data.getSize();
        for (i = 0; i < len; i++) {
            if (aValue.test(data.at(i))) {
                itemIndex = i;
                break;
            }
        }
    } else {
        //  Look for the value in our data and get its index.
        itemIndex = data.indexOf(aValue);
    }

    concreteVal = data.at(itemIndex);

    //  Now that we have a concrete value, call to our supertype to set it as
    //  the current value, etc.
    retVal = this.callNextMethod(concreteVal);

    //  If we found one, then cause things to scroll to it.
    if (itemIndex !== TP.NOT_FOUND) {

        elem = this.getNativeNode();

        rowHeight = this.getRowHeight();

        startIndex = (elem.scrollTop / rowHeight).floor();
        displayedRows = (TP.elementGetHeight(elem) / rowHeight).floor();

        if (itemIndex < startIndex + 1) {
            //  It's above the scrollable area - scroll up
            scrollAmount = startIndex * rowHeight;
        } else if (itemIndex > startIndex + displayedRows - 1) {
            //  It's below the scrollable area - scroll down
            scrollAmount = (itemIndex - displayedRows + 1) * rowHeight;
        } else {
            return retVal;
        }

        //  Adjust the scrolling amount and call the receiver's internal
        //  rendering method.
        elem.scrollTop = scrollAmount;
    }

    return retVal;
},
{patchCallee: true});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
