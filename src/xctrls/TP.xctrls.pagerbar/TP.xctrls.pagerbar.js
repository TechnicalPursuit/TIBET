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
 * @type {TP.xctrls.pagerbar}
 */

//  ------------------------------------------------------------------------

TP.xctrls.itemset.defineSubtype('xctrls:pagerbar');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  Signals that we don't allow to bubble outside of ourself. Since we can
//  process the states associated with these signals, we don't want them to
//  proceed further up the chain.
TP.xctrls.pagerbar.Type.defineAttribute('opaqueBubblingSignalNames',
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
TP.xctrls.pagerbar.Type.defineAttribute('defaultItemTagName',
                                        'xctrls:pageritem');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.pagerbar.Inst.defineMethod('$adjustPageValue',
function(pageValue) {

    /**
     * @method $adjustPageValue
     * @summary Adjusts the page value, taking into account that the value will
     *     be supplied using a 0-based index, but the caller will want it as
     *     1-based and also that the receiver might be configured to show
     *     next/previous and start/end buttons.
     * @param {Number} pageValue The value to adjust.
     * @returns {Number} The adjusted value.
     */

    var adjustedValue;

    adjustedValue = pageValue + 1;

    //  If the receiver is configured to show next/previous buttons, we need to
    //  subtract 1 to the page value to account for the 'previous' button.
    if (this.hasAttribute('nextprevious')) {
        adjustedValue -= 1;
    }

    //  If the receiver is configured to show start/end buttons, we need to
    //  subtract 1 to the page value to account for the 'start' button.
    if (this.hasAttribute('startend')) {
        adjustedValue -= 1;
    }

    return adjustedValue;
});

//  ------------------------------------------------------------------------

TP.xctrls.pagerbar.Inst.defineMethod('getItemLabel',
function(aDataValue, anIndex) {

    /**
     * @method getItemLabel
     * @summary Returns the value that an individual item should use as its
     *     'label' when rendering.
     * @param {Object[]} aDataValue The d3 datum at the current point of item
     *     rendering iteration.
     * @param {Number} anIndex The index of the supplied datum in its overall
     *     data set.
     * @returns {String} The value to use as the item's 'label'.
     */

    var val;

    if (/Previous|Start|Next|End/.test(aDataValue.at(1))) {
        return aDataValue.at(1);
    }

    //  Adjust the page value, taking into account off-by-1 and whether or not
    //  we're showing the next/previous and start/end items.
    val = this.$adjustPageValue(anIndex);

    return val;
});

//  ------------------------------------------------------------------------

TP.xctrls.pagerbar.Inst.defineMethod('getPageValue',
function() {

    /**
     * @method getPageValue
     * @summary Gets the *page value* of the receiver. That is, the numeric
     *     value of the page that the receiver is displaying. Note that this is
     *     a *1-based* value.
     * @returns {Number} The 1-based page value.
     */

    var value,
        pageValue;

    //  Grab the underlying data value.
    value = this.getValue();

    pageValue = this.get('$dataKeys').indexOf(value);

    //  Adjust the page value, taking into account off-by-1 and whether or not
    //  we're showing the next/previous and start/end items.
    pageValue = this.$adjustPageValue(pageValue);

    return pageValue;
});

//  ------------------------------------------------------------------------

TP.xctrls.pagerbar.Inst.defineHandler('UIDeactivate',
function(aSignal) {

    /**
     * @method handleUIDeactivate
     * @param {TP.sig.UIDeactivate} aSignal The signal that caused this handler
     *     to trip.
     * @returns {TP.xctrls.pagerbar} The receiver.
     */

    var domTarget,
        wrappedDOMTarget,

        valueTPElem,

        newValue,
        oldValue,
        oldPageValue,
        newPageValue,

        signalName,

        alwaysSignalChange,
        wasSignalingChange;

    if (this.shouldPerformUIHandler(aSignal)) {

        //  Get the DOM target as the event system originally sees it. If the
        //  event happened inside of our element with a '.close_mark' class,
        //  then we just return here. The signal dispatched from that element
        //  will handle the rest.
        domTarget = aSignal.getDOMTarget();

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

        //  Grab the value element of the list item.
        valueTPElem = wrappedDOMTarget.get('xctrls|value');
        if (TP.notValid(valueTPElem)) {
            return this;
        }

        //  And it's text content.
        newValue = valueTPElem.getTextContent();

        //  Grab the old value before we set it.
        oldValue = this.getValue();

        //  Grab the old *page value* before we set it.
        oldPageValue = this.getPageValue();

        switch (newValue) {

            case 'start':
                signalName = 'TP.sig.UIPageStart';

                newPageValue = 1;

                break;

            case 'previous':
                signalName = 'TP.sig.UIPagePrevious';

                newPageValue = oldPageValue - 1;

                break;

            case 'next':
                signalName = 'TP.sig.UIPageNext';

                newPageValue = oldPageValue + 1;

                break;

            case 'end':
                signalName = 'TP.sig.UIPageEnd';

                newPageValue = this.$get('$dataKeys').getSize();

                //  If the receiver is configured to show next/previous buttons,
                //  we need to subtract 2 to the page value to account for both
                //  the 'next' and 'previous' buttons (since we're computing
                //  from the end of the data key Array).
                if (this.hasAttribute('nextprevious')) {
                    newPageValue -= 2;
                }

                //  If the receiver is configured to show start/end buttons, we
                //  need to subtract 2 to the page value to account for both the
                //  'start' and 'end' buttons (since we're computing from the
                //  end of the data key Array).
                if (this.hasAttribute('startend')) {
                    newPageValue -= 2;
                }

                break;

            default:
                signalName = 'TP.sig.UIPageSet';

                //  We're going to use the item number as the new page value.
                newValue = valueTPElem.getParentNode().getAttribute('itemnum');

                newPageValue = newValue.asNumber();
                if (TP.isNaN(newPageValue)) {
                    newPageValue = this.get('$dataKeys').indexOf(newValue);
                }

                //  Adjust the page value, taking into account off-by-1 and
                //  whether or not we're showing the next/previous and start/end
                //  items.
                newPageValue = this.$adjustPageValue(newPageValue);

                break;
        }

        if (!TP.equal(oldPageValue, newPageValue)) {
            this.dispatch(signalName,
                            null,
                            TP.hc('pageNum', newPageValue));
        }

        //  If we always signal change, then even if the values are equal,
        //  we will not exit here. If an attribute is defined, then it takes
        //  precedence over whatever the item control returns.
        if (this.hasAttribute('alwayschange')) {
            alwaysSignalChange = TP.bc(this.getAttribute('alwayschange'));
        } else {
            alwaysSignalChange = wrappedDOMTarget.alwaysSignalChange();
        }

        //  If we don't always signal change and the two values are equivalent,
        //  than just return.
        if (!alwaysSignalChange && TP.equal(oldPageValue, newPageValue)) {
            return this;
        }

        //  If the item was already selected, then deselect the value.
        //  Otherwise, select it.

        //  Note here how we turn off change signaling to avoid multiple
        //  unnecessary calls to render.
        wasSignalingChange = this.shouldSignalChange();
        this.shouldSignalChange(false);

        this.setPageValue(newPageValue);

        //  Need to re-obtain this after setting the page value, which will
        //  alter it.
        newValue = this.getValue();

        this.changed('value', TP.UPDATE,
                        TP.hc(TP.OLDVAL, oldValue, TP.NEWVAL, newValue));

        //  If the element is bound, then update its bound value.
        this.setBoundValueIfBound(newValue);

        this.shouldSignalChange(wasSignalingChange);

        //  Make sure that we stop propagation here so that we don't get any
        //  more responders further up in the chain processing this.
        aSignal.stopPropagation();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.pagerbar.Inst.defineMethod('setData',
function(aDataObject, shouldSignal) {

    /**
     * @method setData
     * @summary Sets the receiver's data object to the supplied object.
     * @param {Object} aDataObject The object to set the receiver's internal
     *     data to.
     * @param {Boolean} [shouldSignal=true] Whether or not to signal change.
     * @returns {TP.xctrls.pagerbar} The receiver.
     */

    var dataObj,

        pageData,
        pageSize,

        groupedData,
        len,
        i,

        firstObj;

    if (TP.notValid(aDataObject)) {
        return this;
    }

    //  Make sure to unwrap this from any TP.core.Content objects, etc.
    dataObj = TP.val(aDataObject);

    //  Now, obtain a set of key/value pairs no matter what kind of data object
    //  we were handed.
    if (TP.isArray(dataObj)) {
        firstObj = dataObj.first();

        if (dataObj.getSize() === 1 &&
            TP.isCollection(firstObj) &&
            !TP.isArray(firstObj)) {
            pageData = TP.entries(firstObj);
        } else if (TP.isPair(firstObj)) {
            pageData = TP.copy(dataObj);
        } else {
            pageData = TP.entries(dataObj);
        }
    } else {
        pageData = TP.entries(dataObj);
    }

    //  Grab the 'paging size' that we're going to page the data by. If it's a
    //  Number with a size greater than 1, we generate a new data set, taking
    //  the first of each item in a group, as computed by the paging size.
    pageSize = this.getAttribute('pagesize').asNumber();
    if (TP.isNumber(pageSize) && pageSize > 1) {
        groupedData = TP.ac();

        len = pageData.getSize();
        for (i = 0; i < len; i += pageSize) {
            groupedData.push(pageData.at(i));
        }

        pageData = groupedData;
    }

    //  Unshift the starting entries on the front, if the author wanted them.

    //  NB: This looks to be in a strange order, but only because of how unshift
    //  works.
    if (this.hasAttribute('nextprevious')) {
        pageData.unshift(TP.ac('previous', 'Previous'));
    }

    if (this.hasAttribute('startend')) {
        pageData.unshift(TP.ac('start', 'Start'));
    }

    //  Push the ending entries on the back, if the author wanted them.

    if (this.hasAttribute('nextprevious')) {
        pageData.push(TP.ac('next', 'Next'));
    }

    if (this.hasAttribute('startend')) {
        pageData.push(TP.ac('end', 'End'));
    }

    this.callNextMethod(pageData, shouldSignal);

    //  Initially we always set the page value to 1.
    this.setPageValue(1);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.pagerbar.Inst.defineMethod('setPageValue',
function(aValue) {

    /**
     * @method setPageValue
     * @summary Sets the *page value* of the receiver. That is, the numeric
     *     value of the page that the receiver should be displaying.
     * @param {Number} aValue The page number value to set the receiver to. This
     *     should be a *1-based* numeric value.
     * @returns {TP.xctrls.pagerbar} The receiver.
     */

    var pageValue,

        hasNextPrevious,
        hasStartEnd,

        dataSize,

        atStart,
        atEnd,

        val,

        allItems,

        startPagerItem,
        previousPagerItem,

        nextPagerItem,
        endPagerItem;

    if (TP.isString(aValue)) {
        pageValue = aValue.asNumber();
    } else if (TP.isNumber(aValue)) {
        pageValue = aValue;
    }

    hasNextPrevious = this.hasAttribute('nextprevious');
    hasStartEnd = this.hasAttribute('startend');

    if (TP.isEmpty(this.get('$dataKeys'))) {
        return this;
    }

    dataSize = this.get('$dataKeys').getSize();

    if (hasStartEnd) {
        dataSize -= 2;
    }

    if (hasNextPrevious) {
        dataSize -= 2;
    }

    //  Subtract 1 from the page value due to the fact that the user supplied it
    //  as a 1-based number, but our data key Array is 0-based (obviously).
    pageValue = pageValue - 1;

    atStart = false;
    if (pageValue === 0) {
        atStart = true;
    }

    atEnd = false;
    if (pageValue === dataSize - 1) {
        atEnd = true;
    }

    //  If the receiver is configured to show next/previous buttons, we need to
    //  add 1 to the page value to account for the 'previous' button.
    if (hasNextPrevious) {
        pageValue += 1;
    }

    //  If the receiver is configured to show start/end buttons, we need to add
    //  1 to the page value to account for the 'start' button.
    if (hasStartEnd) {
        pageValue += 1;
    }

    //  Grab the data value at that position in our data key Array and set the
    //  *data value* to it.
    val = this.get('$dataKeys').at(pageValue);

    this.setValue(val);

    allItems = this.get('allItemContent');

    if (atStart) {
        if (hasNextPrevious) {
            startPagerItem = allItems.at(0);
            startPagerItem.setAttrDisabled(true);
        }

        if (hasStartEnd) {
            previousPagerItem = allItems.at(1);
            previousPagerItem.setAttrDisabled(true);
        }
    } else {
        if (hasNextPrevious) {
            startPagerItem = allItems.at(0);
            startPagerItem.setAttrDisabled(false);
        }

        if (hasStartEnd) {
            previousPagerItem = allItems.at(1);
            previousPagerItem.setAttrDisabled(false);
        }
    }

    if (atEnd) {
        if (hasNextPrevious) {
            if (hasStartEnd) {
                endPagerItem = allItems.at(dataSize + 3);
            } else {
                endPagerItem = allItems.at(dataSize + 2);
            }

            endPagerItem.setAttrDisabled(true);
        }

        if (hasStartEnd) {
            nextPagerItem = allItems.at(dataSize + 2);
            nextPagerItem.setAttrDisabled(true);
        }
    } else {
        if (hasNextPrevious) {
            if (hasStartEnd) {
                endPagerItem = allItems.at(dataSize + 3);
            } else {
                endPagerItem = allItems.at(dataSize + 2);
            }

            endPagerItem.setAttrDisabled(false);
        }

        if (hasStartEnd) {
            nextPagerItem = allItems.at(dataSize + 2);
            nextPagerItem.setAttrDisabled(false);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.pagerbar.Inst.defineMethod('setValue',
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

    var didChange,
        newPageValue;

    didChange = this.callNextMethod();

    if (TP.isTrue(didChange)) {
        newPageValue = this.get('$dataKeys').indexOf(aValue);
        if (newPageValue === TP.NOT_FOUND) {
            return didChange;
        }

        //  Adjust the page value, taking into account off-by-1 and whether or
        //  not we're showing the next/previous and start/end items.
        newPageValue = this.$adjustPageValue(newPageValue);

        this.setPageValue(newPageValue);
    }

    return didChange;
});

//  ========================================================================
//  TP.xctrls.pageritem
//  ========================================================================

TP.xctrls.item.defineSubtype('xctrls:pageritem');

//  Note how this property is TYPE_LOCAL, by design.
TP.xctrls.pageritem.defineAttribute('styleURI', TP.NO_RESULT);
TP.xctrls.pageritem.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.xctrls.pageritem.Type.defineAttribute('opaqueCapturingSignalNames',
        TP.ac('TP.sig.DOMMouseDown',
                'TP.sig.DOMMouseUp',
                'TP.sig.DOMMouseOver',
                'TP.sig.DOMMouseOut',
                'TP.sig.DOMFocus',
                'TP.sig.DOMBlur'));

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.pageritem.Inst.defineAttribute('label',
    TP.xpc('string(./xctrls:label)', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.pageritem.Inst.defineMethod('getValue',
function() {

    /**
     * @method getValue
     * @summary Returns the value of the receiver. This is overriding an
     *     inherited method, which is why it is done as a method, rather than as
     *     an attribute with a path alias.
     * @returns {String} The value in string form.
     */

    return this.get(
        TP.xpc('string(./xctrls:value)', TP.hc('shouldCollapse', true)));
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
