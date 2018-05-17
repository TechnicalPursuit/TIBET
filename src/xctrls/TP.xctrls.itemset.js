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
 * @type {TP.xctrls.itemset}
 */

//  ------------------------------------------------------------------------

TP.xctrls.TemplatedTag.defineSubtype('xctrls.itemset');

//  This type is intended to be used as either a trait type or supertype of
//  concrete types, so we don't allow instance creation
TP.xctrls.itemset.isAbstract(true);

TP.xctrls.itemset.addTraits(TP.dom.SelectingUIElementNode);
TP.xctrls.itemset.addTraits(TP.dom.D3Tag);

TP.xctrls.itemset.Inst.resolveTrait('isReadyToRender', TP.dom.UIElementNode);
TP.xctrls.itemset.Inst.resolveTrait('select', TP.dom.SelectingUIElementNode);
TP.xctrls.itemset.Inst.resolveTrait('render', TP.dom.D3Tag);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

/**
 * The tag name of the tag to use for each item if there is no template.
 * @type {String}
 */
TP.xctrls.itemset.Type.defineAttribute('defaultItemTagName', 'xctrls:item');

/**
 * Whether or not the tag wants 'close mark' elements to allow individual
 * items to be closed (i.e. removed)
 * @type {String}
 */
TP.xctrls.itemset.Type.defineAttribute('wantsCloseMarks', false);

TP.xctrls.itemset.Type.defineAttribute('opaqueCapturingSignalNames',
        TP.ac(
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

TP.xctrls.itemset.Type.set('bidiAttrs', TP.ac('value'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xctrls.itemset.Type.defineMethod('tagAttachComplete',
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

    //  If we're not ready to render (i.e. our stylesheet hasn't loaded yet),
    //  then just return. When our stylesheet loads, it will trigger the
    //  TP.sig.DOMReady signal.
    if (!tpElem.isReadyToRender()) {
        return this;
    }

    //  Signal that we are ready.
    tpElem.dispatch('TP.sig.DOMReady');

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Type.defineMethod('tagAttachDOM',
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
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineAttribute('$dataKeys');

//  The data as massaged into what this control needs. This is reset whenever
//  the control's whole data set is reset.
TP.xctrls.itemset.Inst.defineAttribute('$convertedData');

TP.xctrls.itemset.Inst.defineAttribute(
    'content',
    TP.cpc('> span tibet|group xctrls|content', TP.hc('shouldCollapse', true)));

TP.xctrls.itemset.Inst.defineAttribute(
    'group',
    TP.cpc('> span tibet|group', TP.hc('shouldCollapse', true)));

TP.xctrls.itemset.Inst.defineAttribute(
    'templatedItemContent',
    TP.cpc('> span tibet|group xctrls|content span.templated', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('allowsMultiples',
function() {

    /**
     * @method allowsMultiples
     * @summary Returns true by default.
     * @returns {Boolean} Whether or not the receiver allows multiple selection.
     */

    return false;
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('getAllItemContent',
function() {

    /**
     * @method getAllItemContent
     * @summary Returns all of the receiver's item content, no matter whether it
     *     was statically supplied or generated dynamically.
     * @returns {TP.xctrls.item[]} All of the receiver's item content.
     */

    var defaultTagName,
        defaultTagSelector,

        getterPath;

    //  Grab the default tag name and change it into something that can be used
    //  by a CSS selector.
    defaultTagName = this.getType().get('defaultItemTagName');
    defaultTagSelector = defaultTagName.replace(':', '|');

    //  Build a path to all items (descendants somewhere under the
    //  'xctrls|content' element).
    getterPath = TP.cpc(
                    '> span tibet|group xctrls|content ' + defaultTagSelector,
                    TP.hc('shouldCollapse', false));

    return this.get(getterPath);
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('getDisplayValue',
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

    return entryArray.first();
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('getFocusedItem',
function() {

    /**
     * @method getFocusedItem
     * @summary Returns the focused item under the receiver.
     * @returns {TP.xctrls.item} The focused item.
     */

    var defaultTagName,
        defaultTagSelector,

        getterPath;

    //  Grab the default tag name and change it into something that can be used
    //  by a CSS selector.
    defaultTagName = this.getType().get('defaultItemTagName');
    defaultTagSelector = defaultTagName.replace(':', '|');

    getterPath = TP.cpc('> span tibet|group xctrls|content ' +
                        defaultTagSelector + '[pclass|focus]',
                    TP.hc('shouldCollapse', true));

    return this.get(getterPath);
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('getFollowingStaticItemContent',
function() {

    /**
     * @method getFollowingStaticItemContent
     * @summary Returns the receiver's static item content that occurs after
     *     any dynamic item content.
     * @returns {TP.xctrls.item[]} The receiver's static item content that
     *     follows any dynamic item content.
     */

    var defaultTagName,
        defaultTagSelector,

        getterPath;

    //  Grab the default tag name and slice off the 'local name' that can be
    //  used in an XPath.
    defaultTagName = this.getType().get('defaultItemTagName');
    defaultTagSelector = defaultTagName.slice(defaultTagName.indexOf(':') + 1);

    //  Build a path to only items that occur after the dynamic, templated
    //  content.
    getterPath = TP.xpc('.//*[@class = "templated"]/following-sibling::*/' +
                        '*[local-name() = "' + defaultTagSelector + '"]',
                    TP.hc('shouldCollapse', false));

    return this.get(getterPath);
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('getPrecedingStaticItemContent',
function() {

    /**
     * @method getPrecedingStaticItemContent
     * @summary Returns the receiver's static item content that occurs before
     *     any dynamic item content.
     * @returns {TP.xctrls.item[]} The receiver's static item content that
     *     precedes any dynamic item content.
     */

    var defaultTagName,
        defaultTagSelector,

        getterPath;

    //  Grab the default tag name and slice off the 'local name' that can be
    //  used in an XPath.
    defaultTagName = this.getType().get('defaultItemTagName');
    defaultTagSelector = defaultTagName.slice(defaultTagName.indexOf(':') + 1);

    //  Build a path to only items that occur before the dynamic, templated
    //  content.
    getterPath = TP.xpc('.//*[@class = "templated"]/preceding-sibling::*/' +
                        '*[local-name() = "' + defaultTagSelector + '"]',
                    TP.hc('shouldCollapse', false));

    return this.get(getterPath);
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('getValue',
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

TP.xctrls.itemset.Inst.defineMethod('focus',
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
     * @returns {TP.xctrls.itemset} The receiver.
     */

    //  We're not a valid focus target, but our group is.
    return this.get('group').focus(moveAction);
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineHandler('UIDeactivate',
function(aSignal) {

    /**
     * @method handleUIDeactivate
     * @param {TP.sig.UIDeactivate} aSignal The signal that caused this handler
     *     to trip.
     */

    var domTarget,
        wrappedDOMTarget,

        valueTPElem,

        newValue,
        oldValue,

        wasSignalingChange;

    if (this.shouldPerformUIHandler(aSignal)) {

        //  Get the DOM target as the event system originally sees it. If the
        //  event happened inside of our element with a '.close_mark' class,
        //  then we just return here. The signal dispatched from that element
        //  will handle the rest.
        domTarget = aSignal.getDOMTarget();
        if (TP.elementHasClass(domTarget, 'close_mark')) {
            return;
        }

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

TP.xctrls.itemset.Inst.defineMethod('isScalarValued',
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

TP.xctrls.itemset.Inst.defineMethod('refresh',
function(shouldRender) {

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
     * @returns {Boolean} Whether or not the bound value was different than the
     *     receiver already had and, therefore, truly changed.
     */

    var hasChanged;

    //  Clear the selection.
    this.setValue(null);

    //  Now call the next most specific method, which will re-render the
    //  receiver and the (now empty) selection.
    hasChanged = this.callNextMethod();

    return hasChanged;
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('$refreshSelectionModelFor',
function(anAspect) {

    /**
     * @method $refreshSelectionModelFor
     * @summary Refreshes the underlying selection model based on state settings
     *     in the UI.
     * @description Note that the aspect can be one of the following:
     *          'value'     ->  The value of the element (the default)
     * @param {String} anAspect The property of the elements to use to
     *      determine which elements should be selected.
     * @returns {TP.xctrls.itemset} The receiver.
     */

    var selectionModel,
        selectAll,

        aspect,

        data;

    //  Grab the selection model.
    selectionModel = this.$getSelectionModel();

    //  If it has a TP.ALL key, then we add the entire content of the data to
    //  the selection model. This method is typically called by the
    //  removeSelection method and it means that it needs the whole list of data
    //  (if they're all selected) so that it can individually remove items from
    //  it.
    selectAll = this.$getSelectionModel().hasKey(TP.ALL);
    if (selectAll) {

        //  We default the aspect to 'value'
        aspect = TP.ifInvalid(anAspect, 'value');

        //  Empty the selection model in preparation for rebuilding it with
        //  individual items registered under the 'value' aspect.
        selectionModel.empty();

        data = this.get('$dataKeys');

        if (TP.isEmpty(data)) {
            return this;
        }

        selectionModel.atPut(aspect, data);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('removeItem',
function(itemValue) {

    /**
     * @method removeItem
     * @summary Removes the item that has a value matching the supplied value.
     * @param {String} itemValue The value of the item to remove. This will be
     *     used to match the first item with that value, and so it should be
     *     unique.
     * @returns {TP.xctrls.itemset} The receiver.
     */

    var keys,

        dataIndex,
        data,

        newValue;

    //  Grab our keys and find the index of the supplied value in them.
    keys = this.get('$dataKeys');
    dataIndex = keys.indexOf(itemValue);

    if (dataIndex === TP.NOT_FOUND) {
        return this;
    }

    data = this.get('data');

    //  If the index is greater than 0, then we'll set our value to 1 less than
    //  the current value.
    if (dataIndex > 0) {
        newValue = keys.at(dataIndex - 1);
    } else {

        //  Otherwise, set our value to the second key (which will become the
        //  first key after the removal).
        newValue = keys.at(1);
    }

    //  Remove the datum at the removal index. Note that this will recompute our
    //  data and data keys if we are bound!
    data.removeAt(dataIndex);

    //  Set our new value, passing true to trigger change notification.
    this.setValue(newValue, true);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('setAttrDisabled',
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

TP.xctrls.itemset.Inst.defineMethod('setAttrId',
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

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('setData',
function(aDataObject, shouldSignal) {

    /**
     * @method setData
     * @summary Sets the receiver's data object to the supplied object.
     * @param {Object} aDataObject The object to set the receiver's internal
     *     data to.
     * @param {Boolean} [shouldSignal=true] Whether or not to signal change.
     * @returns {TP.xctrls.itemset} The receiver.
     */

    var dataObj,
        keys,

        precedingStaticContent,
        followingStaticContent,

        staticKeys;

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
        } else if (TP.isPlainObject(dataObj)) {
            //  Make sure to convert a POJO into a TP.core.Hash
            keys = TP.hc(dataObj).getKeys();
        } else if (TP.isPair(dataObj.first())) {
            keys = dataObj.collect(
                    function(item) {
                        //  Note that we want a String here.
                        return item.first().toString();
                    });
        } else if (TP.isArray(dataObj)) {
            keys = dataObj.getIndices().collect(
                    function(item) {
                        //  Note that we want a String here.
                        return item.toString();
                    });
        }

        //  Grab any static content that precedes the templated, dynamic content
        //  and add its values to our Array of data keys.
        precedingStaticContent = this.get('precedingStaticItemContent');
        if (!TP.isEmptyArray(precedingStaticContent)) {
            staticKeys = precedingStaticContent.collect(
                            function(anItem) {
                                return anItem.get('value');
                            });
            Array.prototype.unshift.apply(keys, staticKeys);
        }

        //  Grab any static content that follows the templated, dynamic content
        //  and add its values to our Array of data keys.
        followingStaticContent = this.get('followingStaticItemContent');
        if (!TP.isEmptyArray(followingStaticContent)) {
            staticKeys = followingStaticContent.collect(
                            function(anItem) {
                                return anItem.get('value');
                            });
            Array.prototype.push.apply(keys, staticKeys);
        }

        this.set('$dataKeys', keys);

    } else {
        this.set('$dataKeys', null);
    }

    //  Clear the selection model, since we're setting a whole new data set for
    //  the receiver.
    this.$getSelectionModel().empty();

    if (this.isReadyToRender()) {

        //  When the data changes, we have to re-render.
        this.render();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('setDisplayValue',
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
     * @returns {TP.xctrls.itemset} The receiver.
     */

    var separator,
        value,

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

    //  watch for multiple selection issues
    if (TP.isArray(value)) {
        value = value.at(0);
    }

    selectionEntry = TP.ac();

    data = this.get('$dataKeys');

    if (TP.isEmpty(data)) {
        return this;
    }

    leni = data.getSize();

    if (TP.isArray(value)) {

        for (i = 0; i < leni; i++) {

            lenj = value.getSize();
            for (j = 0; j < lenj; j++) {
                if (data.at(i) === value.at(j)) {
                    selectionEntry.push(value.at(j));
                    break;
                }
            }

            if (dirty) {
                break;
            }
        }

    } else {

        for (i = 0; i < leni; i++) {

            if (data.at(i) === value) {
                selectionEntry.push(value);
                break;
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

        this.changed('selection', TP.UPDATE);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('setValue',
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
     * @returns {TP.xctrls.itemset} The receiver.
     */

    var oldValue,
        newValue,

        displayValue,

        flag;

    oldValue = this.getValue();

    newValue = this.produceValue('value', aValue);

    //  Note the conversion to a String here - from now own, we'll be comparing
    //  with our data keys, which are all Strings.
    newValue = TP.str(newValue);

    //  If the values are equal, there's nothing to do here - bail out.
    if (TP.equal(TP.str(oldValue), newValue)) {
        return this;
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
        this.setBoundValueIfBound(this.getDisplayValue());
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('stylesheetReady',
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
     * @returns {TP.sherpa.menucontent} The receiver.
     */

    //  If we're not awakening this tag, then exit - we want none of the
    //  machinery here to execute.
    if (this.hasAttribute('tibet:noawaken')) {
        return this;
    }

    //  Note how we put this in a Function to wait until the screen refreshes.
    (function() {

        //  Call render one-time to get things going.
        this.render();

    }.bind(this)).queueForNextRepaint(this.getNativeWindow());

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  TP.dom.D3Tag Methods
//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('buildNewContent',
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

        newContent,

        shouldConstructCloseMarks,
        shouldConstructTooltips;

    defaultTagName = this.getType().get('defaultItemTagName');

    newContent = enterSelection.append(defaultTagName);

    shouldConstructCloseMarks = this.getType().get('wantsCloseMarks');
    shouldConstructTooltips = TP.bc(this.getAttribute('tooltips'));

    newContent.each(
        function() {
            var labelContent,
                markContent,
                valueContent,
                hintContent,

                hintElement;

            labelContent = TP.extern.d3.select(this).append('xctrls:label');
            labelContent.html(
                function(d, i) {
                    return d[1];
                }
            );

            if (shouldConstructCloseMarks) {
                markContent = TP.extern.d3.select(this).insert('xhtml:div');
                markContent.classed('close_mark', true);
            }

            valueContent = TP.extern.d3.select(this).append('xctrls:value');
            valueContent.text(
                function(d, i) {
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
                    this, hintElement, TP.hc('corner', TP.SOUTHEAST));
            }
        });

    return newContent;
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('computeSelectionData',
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
        wholeData;

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
    }

    return selectionData;
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('getKeyFunction',
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

TP.xctrls.itemset.Inst.defineMethod('getRootUpdateSelection',
function(containerSelection) {

    /**
     * @method getRootUpdateSelection
     * @summary Creates the 'root' update selection that will be used as the
     *     starting point to begin d3.js drawing operations.
     * @param {TP.extern.d3.selection} containerSelection The selection made by
     *     having d3.js select() the receiver's 'selection container'.
     * @returns {TP.extern.d3.Selection} The receiver.
     */

    var defaultTagName,
        defaultTagSelector;

    defaultTagName = this.getType().get('defaultItemTagName');
    defaultTagSelector = defaultTagName.replace(':', '|');

    return containerSelection.selectAll(defaultTagSelector);
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('getSelectionContainer',
function() {

    /**
     * @method getSelectionContainer
     * @summary Returns the Element that will be used as the 'root' to
     *     add/update/remove content to/from using d3.js functionality. By
     *     default, this returns the receiver's native Element.
     * @returns {Element} The element to use as the container for d3.js
     *     enter/update/exit selections.
     */

    var content;

    content = this.get('templatedItemContent');
    if (TP.isEmptyArray(content)) {
        return null;
    }

    return TP.unwrap(content);
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('getTemplate',
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

        prebuiltTemplateTPElem,
        compiledTemplateContent;

    templateTPElem = this.get(
                        TP.cpc('tibet|template',
                            TP.hc('shouldCollapse', true)));

    //  If the user didn't specify template content, then see if they provided a
    //  custom itemTag attribute.
    if (!TP.isKindOf(templateTPElem, TP.tibet.template)) {

        //  Make sure to null out the return value in case we got an empty
        //  Array.
        templateTPElem = null;

        //  If the author specified an 'itemTag' attribute, then we use that in
        //  a prebuilt template that we'll define here.
        itemTagName = this.getAttribute('itemTag');
        if (TP.notEmpty(itemTagName)) {

            //  Build a template element, using the supplied item tag name and
            //  building a label/value pair containing expressions that will be
            //  populated to the bound data.
            prebuiltTemplateTPElem = TP.wrap(
                TP.xhtmlnode(
                    '<span>' +
                        '<' + itemTagName + '>' +
                            '<xctrls:label>[[value.1]]</xctrls:label>' +
                            '<xctrls:value>[[value.0]]</xctrls:value>' +
                        '</' + itemTagName + '>' +
                    '</span>')
                );

            //  Compile it.
            prebuiltTemplateTPElem.compile();

            compiledTemplateContent = prebuiltTemplateTPElem.getNativeNode();

            //  Cache that.
            this.set('$compiledTemplateContent', compiledTemplateContent);
        }
    }

    return templateTPElem;
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('finishBuildingNewContent',
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

        groupID,

        precedingStaticContent,
        followingStaticContent;

    selectedValues = this.$getSelectionModel().at('value');
    if (TP.notValid(selectedValues)) {
        selectedValues = TP.ac();
    }

    groupID = this.getLocalID() + '_group';

    selection.each(
        function(d) {
            var wrappedElem;

            this.__proto__ = this.ownerDocument.defaultView.Element.prototype;

            wrappedElem = TP.wrap(this);

            //  Then, set the visual toggle based on whether the value is
            //  selected or not. Note that we convert to a String to make sure
            //  the proper comparison with selected values (which will contain
            //  only Strings).
            if (selectedValues.contains(d[0].toString())) {
                wrappedElem.$setVisualToggle(true);
                return;
            }

            wrappedElem.$setVisualToggle(false);
        }).attr(
        'tabindex', function(d, i) {
            return '0';
        }).attr(
        'tibet:group', function(d, i) {
            return groupID;
        }
    );

    //  Grab any static content that precedes the templated, dynamic content
    //  and, if its value matches any of the selected values, then toggle it on.
    //  Otherwise, toggle it off.
    precedingStaticContent = this.get('precedingStaticItemContent');
    if (!TP.isEmptyArray(precedingStaticContent)) {
        precedingStaticContent.forEach(
            function(anItem) {
                if (selectedValues.contains(anItem.get('value'))) {
                    anItem.$setVisualToggle(true);
                } else {
                    anItem.$setVisualToggle(false);
                }
            });
    }

    //  Grab any static content that follows the templated, dynamic content
    //  and, if its value matches any of the selected values, then toggle it on.
    //  Otherwise, toggle it off.
    followingStaticContent = this.get('followingStaticItemContent');
    if (!TP.isEmptyArray(followingStaticContent)) {
        followingStaticContent.forEach(
            function(anItem) {
                if (selectedValues.contains(anItem.get('value'))) {
                    anItem.$setVisualToggle(true);
                } else {
                    anItem.$setVisualToggle(false);
                }
            });
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('finishUpdatingExistingContent',
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

        precedingStaticContent,
        followingStaticContent;

    selectedValues = this.$getSelectionModel().at('value');
    if (TP.notValid(selectedValues)) {
        selectedValues = TP.ac();
    }

    selection.each(
            function(d) {

                var wrappedElem;

                wrappedElem = TP.wrap(this);

                //  Then, set the visual toggle based on whether the value is
                //  selected or not. Note that we convert to a String to make
                //  sure the proper comparison with selected values (which will
                //  contain only Strings).
                if (selectedValues.contains(d[0].toString())) {
                    wrappedElem.$setVisualToggle(true);
                    return;
                }

                wrappedElem.$setVisualToggle(false);
            }
        );

    //  Grab any static content that precedes the templated, dynamic content
    //  and, if its value matches any of the selected values, then toggle it on.
    //  Otherwise, toggle it off.
    precedingStaticContent = this.get('precedingStaticItemContent');
    if (!TP.isEmptyArray(precedingStaticContent)) {
        precedingStaticContent.forEach(
            function(anItem) {
                if (selectedValues.contains(anItem.get('value'))) {
                    anItem.$setVisualToggle(true);
                } else {
                    anItem.$setVisualToggle(false);
                }
            });
    }

    //  Grab any static content that follows the templated, dynamic content
    //  and, if its value matches any of the selected values, then toggle it on.
    //  Otherwise, toggle it off.
    followingStaticContent = this.get('followingStaticItemContent');
    if (!TP.isEmptyArray(followingStaticContent)) {
        followingStaticContent.forEach(
            function(anItem) {
                if (selectedValues.contains(anItem.get('value'))) {
                    anItem.$setVisualToggle(true);
                } else {
                    anItem.$setVisualToggle(false);
                }
            });
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('updateExistingContent',
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

                    return data[1];
                }
            );

            valueContent = TP.extern.d3.select(
                                    TP.nodeGetChildElementAt(this, 2));
            valueContent.text(
                function(d, i) {

                    return data[0];
                }
            );
        });

    return updateSelection;
});

//  ------------------------------------------------------------------------
//  TP.core.SelectingUIElement Methods
//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('deselect',
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

    var data,

        matches,

        len,
        i,

        value,

        selectVal;

    data = this.get('$dataKeys');

    //  If aValue is a RegExp, then we use it to test against all of the value
    //  elements 'primitive value'. If we find one that matches, then we use
    //  that as the value to remove from our selection.
    if (TP.isRegExp(aValue)) {

        matches = TP.ac();

        len = data.getSize();
        for (i = 0; i < len; i++) {

            value = data.at(i);

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
    return this.callNextMethod(selectVal, anIndex, shouldSignal);
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('select',
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

    var data,

        matches,

        len,
        i,

        value,

        selectVal;

    data = this.get('$dataKeys');

    //  If aValue is a RegExp, then we use it to test against all of the value
    //  elements 'primitive value'. If we find one that matches, then we use
    //  that as the value to add to our selection.
    if (TP.isRegExp(aValue)) {

        matches = TP.ac();

        len = data.getSize();
        for (i = 0; i < len; i++) {

            value = data.at(i);

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
    return this.callNextMethod(selectVal, anIndex, shouldSignal);
}, {
    patchCallee: true
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
