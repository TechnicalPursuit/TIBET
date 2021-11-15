//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/**
 * @type {TP.xctrls.item}
 * @summary A common supertype for all xctrls 'item' types.
 */

//  ------------------------------------------------------------------------

TP.tag.CustomTag.defineSubtype('xctrls:item');

TP.xctrls.item.addTraits(TP.dom.SelectableItemUIElementNode);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  This tag has no associated CSS. Note how these properties are TYPE_LOCAL, by
//  design.
TP.xctrls.item.defineAttribute('styleURI', TP.NO_RESULT);
TP.xctrls.item.defineAttribute('themeURI', TP.NO_RESULT);

TP.xctrls.item.Type.defineAttribute('opaqueCapturingSignalNames',
        TP.ac('TP.sig.DOMMouseDown',
                'TP.sig.DOMMouseUp',
                'TP.sig.DOMMouseOver',
                'TP.sig.DOMMouseOut',
                'TP.sig.DOMFocus',
                'TP.sig.DOMBlur',
                'TP.sig.DOMClick'));

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.item.Inst.defineAttribute('label',
    TP.xpc('string(./xctrls:label)', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xctrls.item.Type.defineMethod('getKeyFunction',
function(ownerElement) {

    /**
     * @method getKeyFunction
     * @summary Returns a Function that will be used to extract the key from
     *     the data.
     * @description If the supplied owner element (an itemset or some other
     *     container holding multiple items) defines a 'itemKey' attribute, it
     *     should be naming a 'slot' on the data that should be used as the key.
     *     Then, the returned key function will use that slot name to query the
     *     data for the key.
     *     If no slot name is provided under the 'itemKey' attribute on the
     *     supplied owner element, then the value of the data will be used by
     *     the returned function as the key.
     * @param {TP.dom.UIElementNode} ownerElement The element that owns this item
     *     (either an itemset or other element capable of handling items).
     * @returns {Function} The Function that will be used to extract the key
     *     from the data.
     */

    var slotName,
        func;

    if (TP.canInvoke(ownerElement, 'getAttribute')) {
        slotName = ownerElement.getAttribute('itemKey');
    }

    if (TP.notEmpty(slotName)) {
        func = function(d, i) {
            if (TP.isScalarType(d)) {
                return d;
            }

            if (TP.canInvoke(d, 'at')) {
                return d.at(slotName);
            } else if (TP.canInvoke(d, 'get')) {
                return d.get(slotName);
            } else {
                return i;
            }
        };
    } else {
        //  By default we use the 'value' as the key.
        func = this.getValueFunction(ownerElement);
    }

    return func;
});

//  ------------------------------------------------------------------------

TP.xctrls.item.Type.defineMethod('getLabelFunction',
function(ownerElement) {

    /**
     * @method getLabelFunction
     * @summary Returns a Function that will be used to extract the label from
     *     the data.
     * @description This method will return a Function that returns the label of
     *     the data based on whether the data is a scalar value or not.
     *     - If the data is a scalar value, then that value is returned 'whole'.
     *     - If the data is not a scalar value, then:
     *         - If the supplied owner element (an itemset or some other
     *         container holding multiple items) defines a 'itemLabel'
     *         attribute, it should be naming a 'slot' on the data that should
     *         be used as the label. The returned label function will use that
     *         slot name to query the data for the label.
     *         -  If no slot name is provided under the 'itemLabel' attribute on
     *         the supplied owner element, then slot '0' of the data will be
     *         used by the returned function as the key (because, by default,
     *         items handle key/value pair Arrays).
     * @returns {Function} The Function that will be used to extract the label
     *     from the data.
     */

    var slotName,
        func;

    if (TP.canInvoke(ownerElement, 'getAttribute')) {
        slotName = ownerElement.getAttribute('itemLabel');
    }

    slotName = TP.ifEmpty(slotName, 1);

    func = function(d, i) {
        if (TP.isScalarType(d)) {
            return d;
        }

        if (TP.canInvoke(d, 'at')) {
            return d.at(slotName);
        } else {
            return d.get(slotName);
        }
    };

    return func;
});

//  ------------------------------------------------------------------------

TP.xctrls.item.Type.defineMethod('getValueFunction',
function(ownerElement) {

    /**
     * @method getValueFunction
     * @summary Returns a Function that will be used to extract the value from
     *     the data.
     * @description This method will return a Function that returns the value of
     *     the data based on whether the data is a scalar value or not.
     *     - If the data is a scalar value, then that value is returned 'whole'.
     *     - If the data is not a scalar value, then:
     *         - If the supplied owner element (an itemset or some other
     *         container holding multiple items) defines a 'itemValue'
     *         attribute, it should be naming a 'slot' on the data that should
     *         be used as the value. The returned value function will use that
     *         slot name to query the data for the value.
     *         -  If no slot name is provided under the 'itemValue' attribute on
     *         the supplied owner element, then slot '0' of the data will be
     *         used by the returned function as the key (because, by default,
     *         items handle key/value pair Arrays).
     * @returns {Function} The Function that will be used to extract the value
     *     from the data.
     */

    var slotName,
        func;

    if (TP.canInvoke(ownerElement, 'getAttribute')) {
        slotName = ownerElement.getAttribute('itemValue');
    }

    slotName = TP.ifEmpty(slotName, 0);

    func = function(d, i) {
        if (TP.isScalarType(d)) {
            return d;
        }

        if (TP.canInvoke(d, 'at')) {
            return d.at(slotName);
        } else if (TP.canInvoke(d, 'get')) {
            return d.get(slotName);
        } else {
            return i;
        }
    };

    return func;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.item.Inst.defineMethod('alwaysSignalChange',
function() {

    /**
     * @method alwaysSignalChange
     * @summary Returns whether or not activating/deactivating this item will
     *     always signal a change, even if the underlying value isn't changing.
     * @returns {Boolean} Whether or not to always signal a change. The default
     *     is false.
     */

    return false;
});

//  ------------------------------------------------------------------------

TP.xctrls.item.Inst.defineMethod('getItemHolder',
function() {

    /**
     * @method getItemHolder
     * @summary Returns the element holding the set of items (of which the
     *     receiver should be one).
     * @returns {TP.xctrls.Element} The element holding the receiver and its
     *     sibling items.
     */

    return TP.wrap(
                TP.nodeDetectAncestorMatchingCSS(
                    this.getNativeNode(),
                    '*[class~="itemholder"]'));
});

//  ------------------------------------------------------------------------

TP.xctrls.item.Inst.defineMethod('getLabelText',
function() {

    /**
     * @method getLabelText
     * @summary Returns the text of the label of the receiver.
     * @returns {String} The receiver's label text.
     */

    var labelValue;

    //  Go after child text of 'xctrls:label'
    labelValue = this.get('string(.//xctrls:label)');

    return labelValue;
});

//  ------------------------------------------------------------------------

TP.xctrls.item.Inst.defineMethod('$getMarkupValue',
function() {

    /**
     * @method $getMarkupValue
     * @summary Returns the 'value' of the receiver as authored by user in the
     *     markup. Many times this is represented as a 'value' attribute in the
     *     markup and serves as the default.
     * @returns {String} The markup value of the receiver.
     */

    var textValue;

    //  Go after child text of 'xctrls:value'
    textValue = this.get('string(.//xctrls:value)');

    return textValue;
});

//  ------------------------------------------------------------------------

TP.xctrls.item.Inst.defineMethod('$getPrimitiveValue',
function() {

    /**
     * @method $getPrimitiveValue
     * @summary Returns the low-level primitive value stored by the receiver in
     *     internal storage.
     * @returns {String} The primitive value of the receiver.
     */

    var textValue;

    //  Go after child text of 'xctrls:value'
    textValue = this.get('string(.//xctrls:value)');

    return textValue;
});

//  ------------------------------------------------------------------------

TP.xctrls.item.Inst.defineMethod('getValue',
function() {

    /**
     * @method getValue
     * @summary Returns the value of the receiver. This is overriding an
     *     inherited method, which is why it is done as a method, rather than as
     *     an attribute with a path alias.
     * @returns {String} The value in string form.
     */

    return this.get(
        TP.xpc('string(.//xctrls:value)', TP.hc('shouldCollapse', true)));
});

//  ------------------------------------------------------------------------

TP.xctrls.item.Inst.defineMethod('$getVisualToggle',
function() {

    /**
     * @method $getVisualToggle
     * @summary Returns the low-level primitive 'toggle value' used by the
     *     receiver to display a 'selected' state.
     * @returns {Boolean} The low-level primitive 'toggle value' of the
     *     receiver.
     */

    return this.$isInState('pclass:selected');
});

//  ------------------------------------------------------------------------

TP.xctrls.item.Inst.defineMethod('$setVisualToggle',
function(aToggleValue) {

    /**
     * @method $setVisualToggle
     * @summary Sets the low-level primitive 'toggle value' used by the receiver
     *     to display a 'selected' state.
     * @param {Boolean} aToggleValue Whether or not to display the receiver's
     *     'selected' state.
     * @returns {TP.xctrls.item} The receiver.
     */

    this.$isInState('pclass:selected', aToggleValue);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
