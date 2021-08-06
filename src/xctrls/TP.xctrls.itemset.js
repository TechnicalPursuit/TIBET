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
        tpElem,

        templateStandinElem,

        templateTPElem,
        templateElem,

        assemblyElem,
        contentTemplateTPElem,

        templateParentElem;

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

    //  Create a span that will stand in for the template.
    templateStandinElem = TP.xhtmlnode('<span class="templated"/>');

    //  If the user authored a valid tibet:template element, then we replace it
    //  with our standin and move it to be the last child in the assembly.
    templateTPElem = tpElem.get(' tibet|template');
    if (TP.isValid(templateTPElem)) {
        //  Replace the template with the standin.
        templateElem = templateTPElem.getNativeNode();
        TP.elementReplaceWith(templateElem, templateStandinElem);

        //  Find the assembly element and append the tibet:template as it's last
        //  child.
        assemblyElem = tpElem.get(' span[tibet|assembly="' +
                        tpElem.getCanonicalName() +
                        '"]').getNativeNode();
        TP.nodeAppendChild(assemblyElem, templateElem, false);
    } else {
        //  Otherwise, there was no authored tibet:template element, but we
        //  still need the standin since other machinery in this type uses that
        //  for things like querying for static item elements the author might
        //  have placed inside of
        contentTemplateTPElem = tpElem.get(' xctrls|content > tibet|acp');

        //  If there was a valid 'tibet:acp' element (as generated by ACP
        //  expressions), then use that to place the standin. Otherwise, just
        //  use the content element.
        if (TP.isValid(contentTemplateTPElem)) {
            templateParentElem = contentTemplateTPElem.getNativeNode();
        } else {
            templateParentElem = tpElem.get('contentElement').getNativeNode();
        }

        TP.nodeAppendChild(templateParentElem, templateStandinElem);
    }

    //  Finalize content so that static items get keys, etc. If this is a bound
    //  element, this will be called from the setData method.
    if (!tpElem.isAspectBoundIn('data')) {
        tpElem.finalizeContent();
    }

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineAttribute('$dataKeys');

TP.xctrls.itemset.Inst.defineAttribute(
    'contentElement',
    TP.cpc('> span tibet|group xctrls|content', TP.hc('shouldCollapse', true)));

TP.xctrls.itemset.Inst.defineAttribute(
    'group',
    TP.cpc('> span tibet|group', TP.hc('shouldCollapse', true)));

TP.xctrls.itemset.Inst.defineAttribute(
    'templatedItemContent',
    TP.cpc('> span tibet|group xctrls|content span.templated', TP.hc('shouldCollapse', true)));

TP.xctrls.itemset.Inst.defineAttribute(
    'itemWithIndex',
    TP.xpc('.//*[substring(name(), string-length(name()) - 3) = "item"' +
                    ' and @itemnum="{{0}}"]',
        TP.hc('shouldCollapse', true)));

TP.xctrls.itemset.Inst.defineAttribute(
    'itemWithKey',
    TP.xpc('.//*[substring(name(), string-length(name()) - 3) = "item"' +
                    ' and @datakey="{{0}}"]',
        TP.hc('shouldCollapse', true)));

TP.xctrls.itemset.Inst.defineAttribute(
    'itemWithLabel',
    TP.xpc('.//xctrls:label[.//text() = "{{0}}"]/' +
            'ancestor::*[contains(@class, "item")]',
        TP.hc('shouldCollapse', true)));

TP.xctrls.itemset.Inst.defineAttribute(
    'itemWithValue',
    TP.xpc('.//xctrls:value[.//text() = "{{0}}"]/' +
            'ancestor::*[contains(@class, "item")]',
        TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('allowsMultiples',
function() {

    /**
     * @method allowsMultiples
     * @summary Returns false by default.
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

    var precedingResult,

        getterPath,

        result;

    //  Build a path to all items (descendants somewhere under the
    //  'xctrls:content' element).

    //  NB: This will return its results already reversed - check the method for
    //  more info.
    precedingResult = this.getPrecedingStaticItemContent();

    //  Now that we have the preceding items, grab the rest of them.
    getterPath = TP.xpc(
            './/*[@class = "templated"]/*' +
            ' | ' +
            './/*[@class = "templated"]/following-sibling::*' +
                    '[substring(name(), string-length(name()) - 3) = "item"]',
        TP.hc('shouldCollapse', false));

    result = precedingResult.concat(this.get(getterPath));

    return result;
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('getDescendantsForSerialization',
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

TP.xctrls.itemset.Inst.defineMethod('getDisplayValue',
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

    var getterPath;

    getterPath = TP.cpc('> span tibet|group xctrls|content ' +
                        '*[pclass|focus]',
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

    var getterPath;

    //  Build a path to only items that occur after the dynamic, templated
    //  content.
    getterPath = TP.xpc(
                    './/*[@class = "templated"]/following-sibling::*' +
                    '[substring(name(), string-length(name()) - 3) = "item"]',
                TP.hc('shouldCollapse', false));

    return this.get(getterPath);
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('getKeyForValue',
function(itemValue) {

    /**
     * @method getKeyForValue
     * @summary Returns the key in the receiver's data set that matches the
     *     supplied value. Note that if there are multiple values that match the
     *     supplied value, the key matching the first one will be returned.
     * @param {String} itemKey The value of the item to match.
     * @returns {Object|null} The key that matches the supplied value in the
     *     receiver's data set.
     */

    var item;

    item = this.get('itemWithValue', itemValue);
    if (TP.isValid(item)) {
        return item.getAttribute(TP.DATA_KEY);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('getItemTagType',
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

TP.xctrls.itemset.Inst.defineMethod('getPrecedingStaticItemContent',
function() {

    /**
     * @method getPrecedingStaticItemContent
     * @summary Returns the receiver's static item content that occurs before
     *     any dynamic item content.
     * @returns {TP.xctrls.item[]} The receiver's static item content that
     *     precedes any dynamic item content.
     */

    var getterPath,
        result;

    //  Build a path to only items that occur before the dynamic, templated
    //  content.
    getterPath = TP.xpc(
                    './/*[@class = "templated"]/preceding-sibling::*' +
                    '[substring(name(), string-length(name()) - 3) = "item"]',
                TP.hc('shouldCollapse', false));

    result = this.get(getterPath);

    //  Reverse the result since 'preceding-sibling' will traverse back up from
    //  our templated content and we want 'document order'.
    result.reverse();

    return result;
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

TP.xctrls.itemset.Inst.defineMethod('getValueData',
function() {

    /**
     * @method getValueValue
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

    //  If the call returned an Array, then it has more than 1 of the same
    //  value. In this case, we warn and just use the first item.
    if (TP.isArray(item)) {
        TP.ifWarn() ?
            TP.warn('More than 1 item has the same value of: ' + value) : 0;
        item = item.first();
    }

    //  All DOM 'items' in an itemset have an item number. This will also be the
    //  index into the data for that item.
    itemNum = item.getAttribute(TP.ITEM_NUM);

    data = this.get('data');

    return data.at(itemNum);
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('getValueForKey',
function(itemKey) {

    /**
     * @method getValueForKey
     * @summary Returns the item in the receiver's data set that matches the
     *     supplied key.
     * @param {String} itemKey The key of the item to match. This will be
     *     used to match the first item with that key, and so it should be
     *     unique.
     * @returns {Object|null} The item that matches the supplied key in the
     *     receiver's data set.
     */

    var keys,

        data,

        hasStaticContent,

        valueFunc,

        dataIndex,

        staticItem;

    data = this.get('data');

    //  If we're data bound, then all of our keys (static and dynamic) will be
    //  found in '$dataKeys'.
    if (TP.notEmpty(data)) {
        keys = this.get('$dataKeys');

        hasStaticContent = data.getSize() !== keys.getSize();

        //  If we have static content, then we need to slice off those keys from
        //  the front and back.
        if (hasStaticContent) {
            keys = keys.slice(this.getPrecedingStaticItemContent().getSize(),
                                -this.getFollowingStaticItemContent().getSize());
        }

        dataIndex = keys.indexOf(itemKey);

        if (dataIndex === TP.NOT_FOUND) {
            staticItem = this.get('itemWithKey', itemKey);
            if (TP.isValid(staticItem)) {
                return staticItem.getValue();
            }
        }

        valueFunc = this.getValueFunction();

        return valueFunc(data.at(dataIndex), dataIndex);
    } else {
        //  We must have a purely static set of items. Their keys will be in the
        //  DOM.
        staticItem = this.get('itemWithKey', itemKey);
        if (TP.isValid(staticItem)) {
            return staticItem.getValue();
        }
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('finalizeContent',
function() {

    /**
     * @method finalizeContent
     * @summary Updates an internal data structures from static item content
     *     that the author might have put into the receiver.
     * @description This method is called when the receiver is first awakened
     *     in order to set up any data structures that are required to treat
     *     static content as we would dynamically generated content.
     * @returns {TP.xctrls.itemset} The receiver.
     */

    var keys,
        allItems;

    keys = TP.ac();

    //  Stamp all of the items in the item content with an index.
    allItems = this.get('allItemContent');
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

TP.xctrls.itemset.Inst.defineMethod('focus',
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
     * @returns {TP.xctrls.itemset} The receiver.
     */

    var domTarget,
        wrappedDOMTarget,

        valueTPElem,

        newValue,
        oldValue,

        dataIndex,

        alwaysSignalChange,

        wasSignalingChange,

        toggleItems,

        precedingStaticContent,
        precedingSize;

    if (this.shouldPerformUIHandler(aSignal)) {

        //  Get the DOM target as the event system originally sees it. If the
        //  event happened inside of our element with a '.close_mark' class,
        //  then we just return here. The signal dispatched from that element
        //  will handle the rest.
        domTarget = aSignal.getDOMTarget();
        if (TP.elementHasClass(domTarget, 'close_mark')) {
            return this;
        }

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
        if (TP.notValid(valueTPElem) ||
            !TP.canInvoke(valueTPElem, 'getTextContent')) {
            return this;
        }

        //  And it's text content.
        newValue = valueTPElem.getTextContent();

        //  Grab the old value before we set it.
        oldValue = this.getValue();

        //  Grab the itemnum as a Number - this is an index into our data.
        dataIndex = wrappedDOMTarget.getAttribute(TP.ITEM_NUM).asNumber();

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
        if (!alwaysSignalChange && TP.equal(oldValue, newValue)) {
            return this;
        }

        //  If the item was already selected, then deselect the value.
        //  Otherwise, select it.

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

        precedingStaticContent = this.get('precedingStaticItemContent');
        precedingSize = precedingStaticContent.getSize();

        //  If the data index is greater than or equal to the number of entries
        //  in our data plus the size of the 'preceding static content', then
        //  its a selection in the 'following static content' and the index
        //  should be TP.NOT_FOUND
        if (dataIndex >= this.get('data').getSize() + precedingSize) {
            dataIndex = TP.NOT_FOUND;
        } else {
            //  Otherwise, the index into our data that this item represents is
            //  its itemnum minus the number of items in the 'preceding static
            //  content'.
            if (!TP.isEmptyArray(precedingStaticContent)) {
                dataIndex -= precedingSize;
            }
        }

        if (TP.isTrue(wrappedDOMTarget.isSelected()) && toggleItems) {
            this.deselect(newValue, dataIndex);
        } else {
            this.select(newValue, dataIndex);
        }

        this.changed('value', TP.UPDATE,
                        TP.hc(TP.OLDVAL, oldValue, TP.NEWVAL, newValue));

        //  If the element is bound, then update its bound value.
        this.setBoundValueIfBound(this.getValue());

        this.shouldSignalChange(wasSignalingChange);

        //  Make sure that we stop propagation here so that we don't get any
        //  more responders further up in the chain processing this.
        aSignal.stopPropagation();
    }

    return this;
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

TP.xctrls.itemset.Inst.defineMethod('prepareData',
function(aDataObject) {

    /**
     * @method prepareData
     * @summary Returns data that has been 'prepared' for usage by the receiver.
     * @param {Object} aDataObject The original object supplied to the receiver
     *     as it's 'data object'.
     * @returns {Object} The data object 'massaged' into a data format suitable
     *     for use by the receiver.
     */

    var dataObj;

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

    return dataObj;
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

        keys;

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

        keys = this.get('$dataKeys');

        if (TP.isEmpty(keys)) {
            return this;
        }

        selectionModel.atPut(aspect, keys);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('removeItem',
function(itemKey) {

    /**
     * @method removeItem
     * @summary Removes the item that has a value matching the supplied value.
     * @param {String} itemKey The value of the item to remove. This will be
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
    dataIndex = keys.indexOf(itemKey);

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

    //  setting an attribute returns void according to the spec
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

    var dataObj;

    if (TP.notValid(aDataObject)) {
        return this;
    }

    //  Prepare the supplied data into the proper format so that keys can be
    //  computed and it can be thought of as 'rows' of data. This normally means
    //  making 'pairs' of the 'entries' of the data object.
    dataObj = this.prepareData(aDataObject);

    this.$set('data', dataObj, false);

    //  Clear the selection model, since we're setting a whole new data set for
    //  the receiver.
    this.$getSelectionModel().empty();

    if (this.isReadyToRender()) {

        //  When the data changes, we have to re-render.
        this.render();

        //  And we have to finalize the content again since we're not a
        //  static-only itemset.
        this.finalizeContent();
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

        keys,

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

    keys = this.get('$dataKeys');

    if (TP.isEmpty(keys)) {
        return this;
    }

    leni = keys.getSize();

    if (TP.isArray(value)) {

        for (i = 0; i < leni; i++) {

            lenj = value.getSize();
            for (j = 0; j < lenj; j++) {
                if (keys.at(i) === value.at(j)) {
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

            if (keys.at(i) === value) {
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
     * @returns {Boolean} Whether or not the value was changed from the value it
     *     had before this method was called.
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
        this.setBoundValueIfBound(this.getValue());
    }

    return true;
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
     * @returns {TP.xctrls.itemset} The receiver.
     */

    //  If we're not awakening this tag, then exit - we want none of the
    //  machinery here to execute.
    if (this.hasAttribute('tibet:no-awaken')) {
        return this;
    }

    //  Note how we put this in a Function to wait until the screen refreshes.
    (function() {

        //  Call render one-time to get things going.
        this.render();

    }.bind(this)).queueBeforeNextRepaint(this.getNativeWindow());

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

    var labelFunc,
        valueFunc,
        keyFunc,

        itemTagName,

        newContent,

        shouldConstructCloseMarks,
        shouldConstructTooltips;

    //  We share this key function with d3. This will invoke 'getKeyFunction' on
    //  any adaptor that we define or the item type.
    keyFunc = this.d3KeyFunction();

    labelFunc = this.getLabelFunction();
    valueFunc = this.getValueFunction();

    itemTagName = TP.ifEmpty(this.getAttribute('itemTag'),
                                this.getType().get('defaultItemTagName'));

    newContent = enterSelection.append(itemTagName);

    shouldConstructCloseMarks = this.getType().get('wantsCloseMarks');
    shouldConstructTooltips = TP.bc(this.getAttribute('tooltips'));

    newContent.each(
        function(data, index) {
            var key,

                labelContent,
                markContent,
                valueContent,
                hintContent,

                hintElement;

            key = TP.isCallable(keyFunc) ? keyFunc(data, index) : index;
            TP.elementSetAttribute(this, TP.DATA_KEY, key, true);

            labelContent = TP.extern.d3.select(this).append('xctrls:label');
            labelContent.html(
                function(d, i) {

                    var labelVal,

                        preIndex,
                        postIndex;

                    labelVal = TP.str(labelFunc(d, index));

                    //  TODO: Pass 'labelVal' through 'ui:display' attribute

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

            TP.extern.d3.select(this).attr(
                'pclass:disabled', function(d, i) {
                    if (valueFunc(d, index) === TP.DISABLED) {
                        return 'disabled';
                    }
                    return null;
                }
            );

            if (shouldConstructCloseMarks) {
                markContent = TP.extern.d3.select(this).insert('xhtml:div');
                markContent.classed('close_mark', true);
            }

            valueContent = TP.extern.d3.select(this).append('xctrls:value');
            valueContent.text(
                function(d, i) {
                    return valueFunc(d, index);
                }
            );

            if (shouldConstructTooltips) {
                hintContent = TP.extern.d3.select(this).append('xctrls:hint');
                hintContent.html(
                    function(d, i) {
                        return '<span xmlns="' + TP.w3.Xmlns.XHTML + '">' +
                                TP.xmlLiteralsToEntities(
                                    valueFunc(d, index)) +
                                '</span>';
                    }
                );

                hintElement = hintContent.node();

                TP.xctrls.hint.setupHintOn(
                    this,
                    hintElement,
                    TP.hc('alignmentCompassCorner', TP.SOUTHEAST));
            }
        });

    //  Make sure that the stylesheet for the item tag is loaded. This is
    //  necessary because the author won't have actually used this tag name in
    //  the authored markup. Note that, if the stylesheet is already loaded,
    //  this method will just return.
    TP.sys.getTypeByName(itemTagName).addStylesheetTo(
                                            this.getNativeDocument());

    return newContent;
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('d3KeyFunction',
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

    //  It's highly unlikely that we couldn't obtain an adaptor type, but in
    //  case that happened, exit here.
    if (!TP.isType(adaptorType)) {
        return this.callNextMethod();
    }

    return adaptorType.getKeyFunction(this);
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('getLabelFunction',
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

TP.xctrls.itemset.Inst.defineMethod('getRootUpdateSelection',
function(containerSelection) {

    /**
     * @method getRootUpdateSelection
     * @summary Creates the 'root' update selection that will be used as the
     *     starting point to begin d3.js drawing operations.
     * @param {TP.extern.d3.selection} containerSelection The selection made by
     *     having d3.js select() the receiver's 'selection container'.
     * @returns {TP.extern.d3.Selection}
     */

    var itemTagName,
        defaultTagSelector;

    itemTagName = TP.ifEmpty(this.getAttribute('itemTag'),
                                this.getType().get('defaultItemTagName'));

    defaultTagSelector = itemTagName.replace(':', '|');

    return containerSelection.selectAll(TP.D3_SELECT_ALL(defaultTagSelector));
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
    if (TP.notValid(content)) {
        return null;
    }

    return TP.unwrap(content);
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('getTemplate',
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

    var templateTPElem,
        itemTagName,

        prebuiltTemplateTPElem,
        compiledTemplateContent;

    templateTPElem = this.get(
                        TP.cpc('tibet|template',
                            TP.hc('shouldCollapse', true)));

    //  If the user didn't specify template content, then see if they provided a
    //  custom itemtag attribute.
    if (!TP.isKindOf(templateTPElem, TP.tibet.template)) {

        //  Make sure to null out the return value in case we got an empty
        //  Array.
        templateTPElem = null;

        //  If the author specified an 'itemtag' attribute, then we use that in
        //  a prebuilt template that we'll define here.
        itemTagName = this.getAttribute('itemtag');
        if (TP.notEmpty(itemTagName)) {

            //  Build a template element, using the supplied item tag name and
            //  building a label/value pair containing expressions that will be
            //  populated to the bound data.
            prebuiltTemplateTPElem = TP.wrap(
                TP.xhtmlnode(
                    '<tibet:template>' +
                        '<' + itemTagName + '>' +
                            '<xctrls:label>[[value.1]]</xctrls:label>' +
                            '<xctrls:value>[[value.0]]</xctrls:value>' +
                        '</' + itemTagName + '>' +
                    '</tibet:template>')
                );

            //  Compile it.
            prebuiltTemplateTPElem.compile();

            compiledTemplateContent = prebuiltTemplateTPElem.getNativeNode();

            //  Cache that.
            this.set('$compiledTemplateContent',
                        compiledTemplateContent,
                        false);
        }
    }

    return templateTPElem;
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('getValueFunction',
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

TP.xctrls.itemset.Inst.defineMethod('finishBuildingNewContent',
function(selection) {

    /**
     * @method finishBuildingNewContent
     * @summary Wrap up building any new content. This is useful if the type
     *     could either use a template or not to build new content, but there is
     *     shared code used to build things no matter which method is used.
     * @param {TP.extern.d3.selection} [selection] The d3.js enter selection
     *     that new content should be appended to or altered.
     * @returns {TP.xctrls.itemset} The receiver.
     */

    var valueFunc,

        selectedValues,

        groupID,

        precedingStaticContent,
        followingStaticContent,

        allItems;

    valueFunc = this.getValueFunction();

    selectedValues = this.$getSelectionModel().at('value');
    if (TP.notValid(selectedValues)) {
        selectedValues = TP.ac();
    }

    groupID = this.getLocalID() + '_group';

    selection.each(
        function(d, i) {
            var wrappedElem,
                val;

            //  TODO: This looks like a Chrome bug - investigate.
            Object.setPrototypeOf(
                this, this.ownerDocument.defaultView.Element.prototype);

            wrappedElem = TP.wrap(this);

            val = TP.str(valueFunc(d, i));

            //  Then, set the visual toggle based on whether the value is
            //  selected or not. Note that we convert to a String to make sure
            //  the proper comparison with selected values (which will contain
            //  only Strings).
            if (selectedValues.contains(val)) {
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

    //  Stamp all of the items in the item content with an index.
    allItems = this.get('allItemContent');
    allItems.forEach(
        function(item, index) {
            item.setAttribute(TP.ITEM_NUM, index);
            item.addClass('item');
        });

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
     * @returns {TP.xctrls.itemset} The receiver.
     */

    var valueFunc,

        selectedValues,

        precedingStaticContent,
        followingStaticContent,

        allItems;

    valueFunc = this.getValueFunction();

    selectedValues = this.$getSelectionModel().at('value');
    if (TP.notValid(selectedValues)) {
        selectedValues = TP.ac();
    }

    selection.each(
        function(d, i) {

            var wrappedElem,
                val;

            wrappedElem = TP.wrap(this);

            val = TP.str(valueFunc(d, i));

            //  Then, set the visual toggle based on whether the value is
            //  selected or not. Note that we convert to a String to make
            //  sure the proper comparison with selected values (which will
            //  contain only Strings).
            if (selectedValues.contains(val)) {
                wrappedElem.$setVisualToggle(true);
                return;
            }

            wrappedElem.$setVisualToggle(false);
        });

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

    //  Stamp all of the items in the item content with an index.
    allItems = this.get('allItemContent');
    allItems.forEach(
        function(item, index) {
            item.setAttribute(TP.ITEM_NUM, index);
            item.addClass('item');
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('removeOldContent',
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
    keyFunc = this.d3KeyFunction();

    exitSelection.each(
        function(data, index) {
            var key;

            key = TP.isCallable(keyFunc) ? keyFunc(data, index) : index;
            keys.remove(key);
        });

    return this.callNextMethod();
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

    var labelFunc,
        valueFunc;

    labelFunc = this.getLabelFunction();
    valueFunc = this.getValueFunction();

    updateSelection.each(
        function(data, index) {
            var labelContent,
                valueContent;

            labelContent = TP.extern.d3.select(
                                    TP.nodeGetChildElementAt(this, 0));
            labelContent.html(
                function(d, i) {

                    var labelVal,

                        preIndex,
                        postIndex;

                    labelVal = TP.str(labelFunc(d, index));

                    //  TODO: Pass 'labelVal' through 'ui:display' attribute

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

            TP.extern.d3.select(this).attr(
                'pclass:disabled', function(d, i) {
                    if (valueFunc(d, index) === TP.DISABLED) {
                        return 'disabled';
                    }
                    return null;
                }
            );

            valueContent = TP.extern.d3.select(
                                    TP.nodeGetChildElementAt(this, 2));
            valueContent.text(
                function(d, i) {
                    return valueFunc(data, index);
                }
            );
        });

    return updateSelection;
});

//  ------------------------------------------------------------------------

TP.xctrls.itemset.Inst.defineMethod('updateTemplatedItemContent',
function(itemElement, datum, index, groupIndex, allData, registry) {

    /**
     * @method updateTemplatedItemContent
     * @summary Updates the supplied element, which may contain data binding
     *     expressions in it, using the supplied data.
     * @param {Element} itemElement The top-level element to update. Either this
     *     element or its descendants will contain data binding expressions.
     * @param {Object} datum The individual data item out of the receiver's
     *     entire set that is currently being processed.
     * @param {Number} index The 0-based index of the supplied datum in the
     *     overall data set that is currently being processed.
     * @param {Number} groupIndex The index of the current group. This is useful
     *     when processing nested selections.
     * @param {Object[]} allData The receiver's entire data set, provided here
     *     as a convenience.
     * @param {TP.core.Hash} registry The registry of data binding expressions
     *     that was built the first time buildNewContentFromTemplate was called.
     *     This will contain keys of the whole attribute value containing the
     *     whole expression mapped to an Array of the individual data
     *     expressions inside and to a transformation Function that would've
     *     been generated if necessary.
     * @returns {TP.dom.D3Tag} The receiver.
     */

    var key,
        adaptor,
        adaptorType,
        keyFunc;

    this.callNextMethod();

    //  Make sure that the supplied element has a data key. If it doesn't, then
    //  we use similar logic to when items are generated from dynamic data where
    //  a template does not get used.

    key = itemElement.getAttribute(TP.DATA_KEY);
    if (TP.isEmpty(key)) {
        adaptor = this.getAttribute('ui:adaptor');
        if (TP.notEmpty(adaptor)) {
            adaptorType = TP.sys.getTypeByName(adaptor);
        } else {
            adaptorType = TP.wrap(itemElement).getType();
        }

        if (!TP.isType(adaptorType)) {
            keyFunc = TP.RETURN_ARG0;
        } else {
            keyFunc = adaptorType.getKeyFunction(this);
        }

        key = TP.isCallable(keyFunc) ? keyFunc(datum, index) : index;
        TP.elementSetAttribute(itemElement, TP.DATA_KEY, key, true);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  TP.core.SelectingUIElementNode Methods
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

    var keys,

        matches,

        len,
        i,

        value,

        selectVal;

    keys = this.get('$dataKeys');

    //  If aValue is a RegExp, then we use it to test against all of the value
    //  elements 'primitive value'. If we find one that matches, then we use
    //  that as the value to remove from our selection.
    if (TP.isRegExp(aValue)) {

        matches = TP.ac();

        len = keys.getSize();
        for (i = 0; i < len; i++) {

            value = keys.at(i);

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

    var keys,

        matches,

        len,
        i,

        value,

        selectVal;

    keys = this.get('$dataKeys');

    //  If aValue is a RegExp, then we use it to test against all of the value
    //  elements 'primitive value'. If we find one that matches, then we use
    //  that as the value to add to our selection.
    if (TP.isRegExp(aValue)) {

        matches = TP.ac();

        len = keys.getSize();
        for (i = 0; i < len; i++) {

            value = keys.at(i);

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
