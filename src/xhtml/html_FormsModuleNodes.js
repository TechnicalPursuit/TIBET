//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/* These node type have the following hierarchy

    - '*' indicates abstract supertype
    - (parens) indicate a trait

*   TP.html.Element
*       TP.html.Attrs
            TP.html.datalist
            TP.html.fieldset
            TP.html.form
            TP.html.keygen
            TP.html.label
            TP.html.option (TP.core.SelectableItemUIElementNode)
            TP.html.optgroup
            TP.html.output
*           TP.html.Aligned
                TP.html.legend
*           TP.html.Focused
                TP.html.select (TP.core.SelectingUIElementNode)
                TP.html.textarea (TP.html.textUtilities)
*               TP.html.input
                    TP.html.inputImage
                    TP.html.inputHidden
*                   TP.html.inputVisible
*                       TP.html.inputClickable
*                           TP.html.inputCheckable (TP.core.TogglingUIElementNode)
                                TP.html.inputCheckbox
                                TP.html.inputRadio
                            TP.html.button
                            TP.html.inputButton
                            TP.html.inputColor
                            TP.html.inputDate
                            TP.html.inputDateTime
                            TP.html.inputDateTimeLocal
                            TP.html.inputMonth
                            TP.html.inputRange
                            TP.html.inputReset
                            TP.html.inputSubmit
                            TP.html.inputTime
                            TP.html.inputWeek
*                       TP.html.inputSelectable
                            TP.html.inputEmail (TP.html.textUtilities)
                            TP.html.inputFile
                            TP.html.inputNumber (TP.html.textUtilities)
                            TP.html.inputPassword (TP.html.textUtilities)
                            TP.html.inputSearch (TP.html.textUtilities)
                            TP.html.inputTel (TP.html.textUtilities)
                            TP.html.inputText (TP.html.textUtilities)
                            TP.html.inputUrl (TP.html.textUtilities)
*/

//  ========================================================================
//  TP.html.datalist (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.datalist}
 * @summary 'datalist' tag. Together with 'list' attribute for input can be
 *     used to make a combobox.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('datalist');

//  ========================================================================
//  TP.html.fieldset
//  ========================================================================

/**
 * @type {TP.html.fieldset}
 * @summary 'fieldset' tag. Group form fields.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('fieldset');

TP.html.fieldset.Type.set('booleanAttrs', TP.ac('disabled', 'willValidate'));

//  ========================================================================
//  TP.html.form
//  ========================================================================

/**
 * @type {TP.html.form}
 * @summary 'form' tag. An input form. The TP.html.form object acts as a group
 *     control for individual node component objects representing the form's
 *     items as well as a wrapper for the form operations themselves.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('form');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  Standard type transformations for element<-> node component type.

//  When a particular element is found, the type attribute is used as a
//  key into this hash to locate the TIBET type to use as a wrapper. A new
//  instance of that type is used so get() related calls always return a
//  properly wrapped dom element.
TP.html.form.Type.defineConstant('NODE_TYPE_NAMES',
    TP.hc('button', 'TP.html.inputButton',
            'image', 'TP.html.inputImage',
            'checkbox', 'TP.html.inputCheckbox',
            'color', 'TP.html.inputColor',
            'date', 'TP.html.inputDate',
            'datetime', 'TP.html.inputDateTime',
            'datetime-local', 'TP.html.inputDateTimeLocal',
            'email', 'TP.html.inputEmail',
            'file', 'TP.html.inputFile',
            'hidden', 'TP.html.inputHidden',
            'month', 'TP.html.inputMonth',
            'number', 'TP.html.inputNumber',
            'password', 'TP.html.inputPassword',
            'radio', 'TP.html.inputRadio',
            'range', 'TP.html.inputRange',
            'reset', 'TP.html.inputReset',
            'search', 'TP.html.inputSearch',
            'select-one', 'TP.html.select',
            'select-single', 'TP.html.select',
            'select-multiple', 'TP.html.select',
            'submit', 'TP.html.inputSubmit',
            'tel', 'TP.html.inputTel',
            'text', 'TP.html.inputText',
            'textarea', 'TP.html.textarea',
            'time', 'TP.html.inputTime',
            'url', 'TP.html.inputUrl',
            'week', 'TP.html.inputWeek'));

TP.html.form.Type.set('booleanAttrs', TP.ac('noValidate'));

TP.html.form.Type.set('uriAttrs', TP.ac('action'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.form.Type.defineMethod('getItemTagName',
function() {

    /**
     * @method getItemTagName
     * @summary Returns the 'default item tag name' for use it the
     *     fromArray()/fromObject() methods.
     * @returns {String} The item tag name.
     */

    return 'html:input';
});

//  ------------------------------------------------------------------------

TP.html.form.Type.defineMethod('shouldAutoWrapItems',
function(anObject, formatArgs) {

    /**
     * @method shouldAutoWrapItems
     * @summary Whether or not our fromArray() / fromObject() methods
     *     'auto-wrap items'. See those methods for more information.
     * @param {Object} anObject The Object of content to wrap in markup.
     * @param {TP.core.Hash} formatArgs An optional object containing
     *     parameters.
     * @returns {Boolean} Whether or not we automatically wrap items.
     */

    if (TP.isBoolean(formatArgs.at('autowrap'))) {
        return formatArgs.at('autowrap');
    }

    return false;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.form.Inst.defineMethod('getElementArray',
function() {

    /**
     * @method getElementArray
     * @summary Returns the Array of native elements. In the case of a form
     *     object this is the elements[] Array.
     * @returns {Array} The array of native items.
     */

    return TP.ac(this.getNativeNode().elements);
});

//  ------------------------------------------------------------------------

TP.html.form.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @method getDisplayValue
     * @summary Returns the value of the receiver. When targeting a form the
     *     returned value is the set of key/value pairs for each form control in
     *     the form.
     * @returns {TP.core.Hash} A hash containing keys and values which represent
     *     the overall value of the form.
     */

    var i,
        list,
        el,
        node,
        dict;

    node = this.getNativeNode();

    dict = TP.hc();
    list = node.elements;
    for (i = 0; i < list.length; i++) {
        el = 'TP.html.Element'.construct(list[i]);
        if (TP.notValid(el)) {
            TP.ifWarn() ?
                TP.warn(TP.annotate(
                            TP.nodeCloneNode(list[i]),
                            'Unable to acquire wrapper.')) : 0;

            continue;
        }

        dict.atPut(el.getSubmitName(), el.getValue());
    }

    return dict;
});

//  ------------------------------------------------------------------------

TP.html.form.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @method setDisplayValue
     * @summary Sets the value of the receiver. When targeting a form the input
     *     is a set of key/value pairs containing the new data for the form
     *     controls.
     * @param {TP.core.Hash} aValue Hash containing key/value pairs where the
     *     keys need to map to ids or names in the form.
     * @returns {TP.html.form} The receiver.
     */

    var node,
        list,
        i,
        el;

    node = this.getNativeNode();

    if (!TP.isKindOf(aValue, TP.core.Hash)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Must provide a hash of key value pairs.');
    }

    list = node.elements;
    for (i = 0; i < list.length; i++) {
        el = 'TP.html.Element'.construct(list[i]);
        if (TP.notValid(el)) {
            TP.ifWarn() ?
                TP.warn(TP.annotate(
                            TP.nodeCloneNode(list[i]),
                            'Unable to acquire wrapper.')) : 0;

            continue;
        }

        //  rely on the individual elements to do the real work
        el.setDisplayValue(aValue.at(el.getSubmitName()));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.html.form.Inst.defineMethod('reset',
function() {

    /**
     * @method reset
     * @summary Resets the form. As a node component, however, this method
     *     provides the opportunity for custom reset pre/post processing.
     */

    var node;

    node = this.getNativeNode();

    //  TODO:   need to deal with bound element/form reset

    //  TODO:   capture potential lost data here?
    return node.reset();
});

//  ------------------------------------------------------------------------

TP.html.form.Inst.defineMethod('submit',
function() {

    /**
     * @method submit
     * @summary Submits the form. As a node component, however, this method
     *     provides the opportunity for custom submit pre/post processing.
     */

    var node;

    node = this.getNativeNode();

    //  TODO:   validation hook? parameters to control submit
    //          method/etc?
    return node.submit();
});

//  ========================================================================
//  TP.html.keygen (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.keygen}
 * @summary 'keygen' tag. Key pair generation.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('keygen');

TP.html.keygen.Type.set('booleanAttrs',
        TP.ac('autofocus', 'disabled', 'willValidate'));

//  ========================================================================
//  TP.html.label
//  ========================================================================

/**
 * @type {TP.html.label}
 * @summary 'label' tag.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('label');

//  ========================================================================
//  TP.html.optgroup
//  ========================================================================

/**
 * @type {TP.html.optgroup}
 * @summary 'optgroup' tag.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('optgroup');

TP.html.optgroup.Type.set('booleanAttrs', TP.ac('disabled'));

//  ========================================================================
//  TP.html.option
//  ========================================================================

/**
 * @type {TP.html.option}
 * @summary 'option' tag. A 'select' tag option. This type acts in the "item"
 *     role relative to an TP.html.Select object. Most methods of interest are
 *     on the TP.html.Select type.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('option');

TP.html.option.addTraits(TP.core.SelectableItemUIElementNode);

TP.html.option.Type.set('booleanAttrs',
            TP.ac('disabled', 'defaultSelected', 'selected'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.option.Type.defineMethod('generateMarkup',
function(anObject, attrStr, itemFormat, shouldAutoWrap, formatArgs, theRequest) {

    /**
     * @method generateMarkup
     * @summary Generates markup for the supplied Object using the other
     *     parameters supplied.
     * @param {Object} anObject The Object of content to wrap in markup.
     * @param {String} attrStr The String containing either the literal
     *     attribute markup or a 'template invocation' that can be used inside
     *     of a template.
     * @param {String} itemFormat The name of an 'item format', either a tag
     *     name (which defaults to the 'item tag name' of this type) or some
     *     other format type which can be applied to this type.
     * @param {Boolean} shouldAutoWrap Whether or not the markup generation
     *     machinery should 'autowrap' items of the supplied object (each item
     *     in an Array or each key/value pair in an Object).
     * @param {TP.core.Hash} formatArgs The 'formatting arguments' used by this
     *     machinery to generate item markup.
     * @param {TP.sig.Request|TP.core.Hash} theRequest An optional object
     *     containing parameters.
     * @returns {String} The markup generated by taking the supplied Object and
     *     iterating over its items.
     */

    var tagName,
        template,
        str;

    tagName = this.getCanonicalName();

    if (TP.isFalse(shouldAutoWrap)) {
        if (TP.isTrue(theRequest.at('repeat'))) {
            if (TP.isArray(anObject)) {
                template = TP.join('<', tagName,
                                    attrStr, ' value="{{$INDEX}}">',
                                    '{{.%', itemFormat, '}}',
                                    '</', tagName, '>');
            } else {
                template = TP.join('<', tagName,
                                    attrStr, ' value="{{0}}">',
                                    '{{1.%', itemFormat, '}}',
                                    '</', tagName, '>');
            }

            //  Perform the transformation.
            str = template.transform(anObject, theRequest);

            return str;
        }
    } else {
        //  Otherwise, the object that will be handed to the iteration
        //  mechanism will be [key,value] pairs, so we can use that fact
        //  to generate item tags around each one.

        //  Build a template by joining the tag name with an invocation
        //  of the itemFormat for both the key and the value.
        template = TP.join('<', tagName,
                            attrStr, ' value="{{0}}">',
                            '{{1.%', itemFormat, '}}',
                            '</', tagName, '>');

        //  Perform the transformation.
        str = template.transform(anObject, theRequest);

        return str;
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.html.option.Type.defineMethod('shouldAutoWrapItems',
function(anObject, formatArgs) {

    /**
     * @method shouldAutoWrapItems
     * @summary Whether or not our fromArray() / fromObject() methods
     *     'auto-wrap items'. See those methods for more information.
     * @param {Object} anObject The Object of content to wrap in markup.
     * @param {TP.core.Hash} formatArgs An optional object containing
     *     parameters.
     * @returns {Boolean} Whether or not we automatically wrap items.
     */

    if (TP.isBoolean(formatArgs.at('autowrap'))) {
        return formatArgs.at('autowrap');
    }

    return false;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.option.Inst.defineMethod('getLabelText',
function() {

    /**
     * @method getLabelText
     * @summary Returns the text of the label of the receiver.
     * @returns {String} The receiver's label text.
     */

    return this.getTextContent();
});

//  ------------------------------------------------------------------------

TP.html.option.Inst.defineMethod('$getMarkupValue',
function() {

    /**
     * @method $getMarkupValue
     * @summary Returns the 'value' of the receiver as authored by user in the
     *     markup. Many times this is represented as a 'value' attribute in the
     *     markup and serves as the default.
     * @returns {String} The markup value of the receiver.
     */

    return this.getAttribute('value');
});

//  ------------------------------------------------------------------------

TP.html.option.Inst.defineMethod('$getPrimitiveValue',
function() {

    /**
     * @method $getPrimitiveValue
     * @summary Returns the low-level primitive value stored by the receiver in
     *     internal storage.
     * @returns {String} The primitive value of the receiver.
     */

    return this.getNativeNode().value;
});

//  ------------------------------------------------------------------------

TP.html.option.Inst.defineMethod('$getVisualToggle',
function() {

    /**
     * @method $getVisualToggle
     * @summary Returns the low-level primitive 'toggle value' used by the
     *     receiver to display a 'selected' state.
     * @returns {Boolean} The low-level primitive 'toggle value' of the
     *     receiver.
     */

    return this.getNativeNode().selected;
});

//  ------------------------------------------------------------------------

TP.html.option.Inst.defineMethod('isSelected',
function() {

    /**
     * @method isSelected
     * @summary Returns true if the receiver is selected.
     * @returns {Boolean} Whether or not the receiver is selected.
     */

    return this.getNativeNode().selected;
});

//  ------------------------------------------------------------------------

TP.html.option.Inst.defineMethod('on',
function() {

    /**
     * @method on
     * @summary Sets the receiver's selected state to 'true'.
     * @returns {TP.html.option} The receiver.
     */

    this.getNativeNode().selected = true;

    return this;
});

//  ------------------------------------------------------------------------

TP.html.option.Inst.defineMethod('off',
function() {

    /**
     * @method off
     * @summary Sets the receiver's selected state to 'false'.
     * @returns {TP.html.option} The receiver.
     */

    this.getNativeNode().selected = false;

    return this;
});

//  ------------------------------------------------------------------------

TP.html.option.Inst.defineMethod('$setVisualToggle',
function(aToggleValue) {

    /**
     * @method $setVisualToggle
     * @summary Sets the low-level primitive 'toggle value' used by the receiver
     *     to display a 'selected' state.
     * @param {Boolean} aToggleValue Whether or not to display the receiver's
     *     'selected' state.
     * @returns {TP.html.select} The receiver.
     */

    this.getNativeNode().selected = aToggleValue;

    return this;
});

//  ========================================================================
//  TP.html.output (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.output}
 * @summary 'output' tag. Some form of output.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('output');

TP.html.output.Type.set('booleanAttrs', TP.ac('willValidate'));

//  ========================================================================
//  TP.html.textUtilities
//  ========================================================================

/**
 * @type {TP.html.textUtilities}
 * @summary A utility type that is mixed into elements that can manipulate
 *     their text value.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('html.textUtilities');

//  This type is intended to be used as a trait type only, so we don't allow
//  instance creation
TP.html.textUtilities.isAbstract(true);

TP.html.textUtilities.addTraits(TP.html.Element);

TP.html.textUtilities.Type.resolveTrait('booleanAttrs', TP.html.Element);

TP.html.textUtilities.Inst.resolveTraits(
        TP.ac('getDisplayValue', 'setDisplayValue'),
        TP.html.Element);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('clearValue',
function() {

    /**
     * @method clearValue
     * @summary Clears the entire value of the receiver.
     * @returns {TP.html.textUtilities} The receiver.
     */

    var node,

        oldVal;

    node = this.getNativeNode();

    oldVal = node.value;
    node.value = '';

    this.changed('value', TP.DELETE,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, ''));

    return this;
});

//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('clearSelection',
function() {

    /**
     * @method clearSelection
     * @summary Clears the currently selected text.
     * @returns {TP.html.textUtilities} The receiver.
     */

    var oldVal;

    oldVal = this.getSelection();

    TP.textElementReplaceSelection(this.getNativeNode(), '');

    this.changed('selection', TP.DELETE,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, ''));

    return this;
});

//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('collapseSelection',
function(toStart) {

    /**
     * @method collapseSelection
     * @summary Collapse the current selection to one end or the other.
     * @param {Boolean} toStart Whether or not to collapse the selection to the
     *     start of itself. This defaults to false (i.e. the selection will
     *     collapse to the end).
     * @returns {TP.html.textUtilities} The receiver.
     */

    var node;

    node = this.getNativeNode();

    if (TP.sys.isUA('IE')) {
        //  Nasty code to get the current indices of the selection in IE,
        //  which is going away in IE9... so why bother?
        return this;
    }

    if (toStart) {
        node.setSelectionRange(node.selectionStart, node.selectionStart);
    } else {
        node.setSelectionRange(node.selectionEnd, node.selectionEnd);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('getSelection',
function() {

    /**
     * @method getSelection
     * @summary Returns the currently selected text.
     * @returns {String} The currently selected text.
     */

    var node,
        sel;

    node = this.getNativeNode();

    if (TP.sys.isUA('IE')) {
        if (TP.notValid(sel = this.getNativeDocument().selection)) {
            return '';
        }

        return sel.createRange().text;
    }

    return node.value.substring(node.selectionStart, node.selectionEnd);
});

//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('getSelectionEnd',
function() {

    /**
     * @method getSelectionEnd
     * @summary Returns the ending index of the currently selected text.
     * @returns {Number} The ending index of the current selection.
     */

    var range,
        rangeDup,

        start,
        end;

    if (TP.sys.isUA('IE')) {
        range = this.getNativeDocument().selection.createRange();

        rangeDup = range.duplicate();
        start = 0 - rangeDup.moveStart('character', -100000) - 1;
        end = start + range.text.length;

        return end;
    }

    return this.getNativeNode().selectionEnd;
});

//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('getSelectionStart',
function() {

    /**
     * @method getSelectionStart
     * @summary Returns the starting index of the currently selected text.
     * @returns {Number} The starting index of the current selection.
     */

    var range,
        rangeDup,

        start;

    if (TP.sys.isUA('IE')) {
        range = this.getNativeDocument().selection.createRange();

        rangeDup = range.duplicate();
        start = 0 - rangeDup.moveStart('character', -100000) - 1;

        return start;
    }

    return this.getNativeNode().selectionStart;
});

//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('getValue',
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

    //  If the receiver has a 'ui:type' attribute, then try first to convert the
    //  content to that type before trying to format it.
    if (TP.notEmpty(type = this.getAttribute('ui:type'))) {
        if (!TP.isType(type = TP.sys.getTypeByName(type))) {
            return this.raise('TP.sig.InvalidType');
        } else {
            value = type.fromString(value);
        }
    }

    //  If the receiver has a 'ui:storage' attribute, then format the return
    //  value according to the formats found there.
    if (TP.notEmpty(formats = this.getAttribute('ui:storage'))) {
        value = this.$formatValue(value, formats);
    }

    return value;
});

//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('insertAfterSelection',
function(aText) {

    /**
     * @method insertAfterSelection
     * @summary Inserts the supplied text after the current selection.
     * @param {String} aText The text to insert after the current selection.
     * @returns {TP.html.textUtilities} The receiver.
     */

    var oldVal,
        newVal;

    oldVal = this.getSelection();

    this.replaceSelection(TP.join(oldVal, aText));

    newVal = this.getSelection();

    this.changed('selection', TP.INSERT,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, newVal));

    return this;
});

//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('insertBeforeSelection',
function(aText) {

    /**
     * @method insertBeforeSelection
     * @summary Inserts the supplied text before the current selection.
     * @param {String} aText The text to insert before the current selection.
     * @returns {TP.html.textUtilities} The receiver.
     */

    var oldVal,
        newVal;

    oldVal = this.getSelection();

    this.replaceSelection(TP.join(aText, oldVal));

    newVal = this.getSelection();

    this.changed('selection', TP.INSERT,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, newVal));

    return this;
});

//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('replaceSelection',
function(aText) {

    /**
     * @method replaceSelection
     * @summary Replaces the current selection with the supplied text.
     * @param {String} aText The text to replace the current selection with.
     * @returns {TP.html.textUtilities} The receiver.
     */

    var node,

        oldVal,
        newVal;

    node = this.getNativeNode();

    oldVal = this.getSelection();

    TP.textElementReplaceSelection(node, aText);

    newVal = this.getSelection();

    this.changed('selection', TP.UPDATE,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, newVal));

    return this;
});

//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('selectFromTo',
function(aStartIndex, anEndIndex) {

    /**
     * @method selectFromTo
     * @summary Selects the contents of the receiver from the supplied starting
     *     index to the supplied ending index.
     * @param {Number} aStartIndex The starting index.
     * @param {Number} aEndIndex The ending index.
     * @returns {TP.html.textUtilities} The receiver.
     */

    var node,

        range;

    node = this.getNativeNode();

    if (TP.sys.isUA('IE')) {
        range = node.createTextRange();
        range.collapse(true);
        range.moveStart('character', aStartIndex);
        range.moveEnd('character', anEndIndex - aStartIndex);
        range.select();

        return this;
    }

    node.setSelectionRange(aStartIndex, anEndIndex);

    return this;
});

//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('setCursorPosition',
function(aPosition) {

    /**
     * @method setCursorPosition
     * @summary Sets the cursor to the supplied position.
     * @param {Number} aPosition The desired cursor position.
     * @returns {TP.html.textUtilities} The receiver.
     */

    var node;

    node = this.getNativeNode();

    try {
        node.focus();
    } catch (e) {
        TP.ifError() ?
            TP.error(
                TP.ec(e,
                    'Error focusing element when setting cursor position.')) :
                    0;
    }

    //  According to the spec, the end index is one character *after* the
    //  intended selection.
    node.setSelectionRange(aPosition, aPosition + 1);

    return this;
});

//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('setCursorToEnd',
function() {

    /**
     * @method setCursorToEnd
     * @summary Sets the cursor to the end position of the receiver.
     * @returns {TP.html.textUtilities} The receiver.
     */

    try {
        this.getNativeNode().focus();
    } catch (e) {
        TP.ifError() ?
            TP.error(
                TP.ec(e,
                    'Error focusing element when setting cursor to end.')) : 0;
    }

    TP.documentCollapseSelection(this.getNativeDocument());

    return this;
});

//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('setCursorToStart',
function() {

    /**
     * @method setCursorToStart
     * @summary Sets the cursor to the start position of the receiver.
     * @returns {TP.html.textUtilities} The receiver.
     */

    try {
        this.getNativeNode().focus();
    } catch (e) {
        TP.ifError() ?
            TP.error(
                TP.ec(e,
                    'Error focusing element when setting cursor to start.')) :
                    0;
    }

    TP.documentCollapseSelection(this.getNativeDocument(), true);

    return this;
});

//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('setValue',
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
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var oldValue,
        newValue,

        flag;

    oldValue = this.getValue();

    newValue = this.produceValue(aValue);

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

TP.html.textUtilities.Inst.defineMethod('setSelection',
function(aText) {

    /**
     * @method setSelection
     * @summary Sets the current selection to the supplied text.
     * @param {String} aText The text to set the selection to.
     * @returns {TP.html.textUtilities} The receiver.
     */

    //  This method is just an alias for replaceSelection().
    this.replaceSelection(aText);

    return this;
});

//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('wrapSelection',
function(beforeText, afterText) {

    /**
     * @method wrapSelection
     * @summary Wraps the current selection with the beforeText and afterText.
     * @param {String} beforeText The text to insert before the selection.
     * @param {String} afterText The text to insert after the selection.
     * @returns {TP.html.textUtilities} The receiver.
     */

    return this.replaceSelection(TP.join(beforeText,
                                            this.getSelection(),
                                            afterText));
});

//  ========================================================================
//  TP.html.input
//  ========================================================================

/**
 * @type {TP.html.input}
 * @summary INPUT tag. Generic input control.
 * @description NOTE: for TIBET's purposes this particular node type serves as
 *     an abstract supertype from which a number of specialized types descend to
 *     allow custom behavior to be inherited.
 *
 *     Also note that while the actual xhtml DTD doesn't specify intermediate
 *     types we do so here to help maximize reuse. That means we've created
 *     several custom elements such as TP.html.inputClickable or
 *     TP.html.inputCheckable from which the various input subtypes inherit.
 */

//  ------------------------------------------------------------------------

TP.html.Focused.defineSubtype('input');

//  can't construct concrete instances of this
TP.html.input.isAbstract(true);

TP.html.input.addTraits(TP.core.EmptyElementNode);

TP.html.input.Type.resolveTraits(
        TP.ac('bidiAttrs', 'booleanAttrs', 'uriAttrs'),
        TP.html.input);

TP.html.input.Inst.resolveTraits(
        TP.ac('getContent', 'setContent'),
        TP.core.EmptyElementNode);

TP.html.input.Type.set('bidiAttrs', TP.ac('value'));

TP.html.input.Type.set('booleanAttrs',
        TP.ac('autofocus', 'defaultChecked', 'checked', 'disabled',
                'formNoValidate', 'indeterminate', 'multiple',
                'readOnly', 'required', 'willValidate'));

TP.html.input.Type.set('uriAttrs', TP.ac('src', 'usemap'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.input.Type.defineMethod('fromArray',
function(anObject, aRequest) {

    /**
     * @method fromArray
     * @summary Returns a formatted XML String with the supplied Boolean object
     *     as the content.
     * @param {Boolean} anObject The Object to wrap in the elements.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An optional object
     *     containing parameters.
     * @returns {String} The content formatted as markup.
     */

    return anObject.as('TP.html.select', aRequest);
});

//  ------------------------------------------------------------------------

TP.html.input.Type.defineMethod('fromBoolean',
function(anObject, aRequest) {

    /**
     * @method fromBoolean
     * @summary Returns a formatted XML String with the supplied Boolean object
     *     as the content.
     * @param {Boolean} anObject The Object to wrap in the elements.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An optional object
     *     containing parameters.
     * @returns {String} The content formatted as markup.
     */

    var val,
        fieldNum;

    val = TP.str(anObject);

    fieldNum = TP.ifInvalid(aRequest.at('$INDEX'), TP.genID().slice(10));

    return TP.join('<input id="field_',
                    fieldNum,
                    '" type="checkbox" value="', val, '"/>');
});

//  ------------------------------------------------------------------------

TP.html.input.Type.defineMethod('fromDate',
function(anObject, aRequest) {

    /**
     * @method fromDate
     * @summary Returns a formatted XML String with the supplied Date object as
     *     the content.
     * @description The supplied request can contain the following keys and
     *     values that are used in this method:
     *
     *     'escapeContent' Boolean Whether or not to 'escape' the content (i.e.
     *     if it has embedded markup). This defaults to false.
     * @param {Boolean} anObject The Object to wrap in the elements.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An optional object
     *     containing parameters.
     * @returns {String} The content formatted as markup.
     */

    var val,
        fieldNum;

    if (TP.isTrue(aRequest.at('escapeContent'))) {
        val = TP.xmlLiteralsToEntities(TP.str(anObject));
    } else {
        val = TP.str(anObject);
    }

    fieldNum = TP.ifInvalid(aRequest.at('$INDEX'), TP.genID().slice(10));

    return TP.join('<input id="field_', fieldNum,
                    '" type="text" value="', val, '"/>');
});

//  ------------------------------------------------------------------------

TP.html.input.Type.defineMethod('fromNumber',
function(anObject, aRequest) {

    /**
     * @method fromNumber
     * @summary Returns a formatted XML String with the supplied Number object
     *     as the content.
     * @param {Boolean} anObject The Object to wrap in the elements.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An optional object
     *     containing parameters.
     * @returns {String} The content formatted as markup.
     */

    var val,
        fieldNum;

    if (TP.isTrue(aRequest.at('escapeContent'))) {
        val = TP.xmlLiteralsToEntities(TP.str(anObject));
    } else {
        val = TP.str(anObject);
    }

    fieldNum = TP.ifInvalid(aRequest.at('$INDEX'), TP.genID().slice(10));

    return TP.join('<input id="field_', fieldNum,
                    '" type="text" value="', val, '"/>');
});

//  ------------------------------------------------------------------------

TP.html.input.Type.defineMethod('fromString',
function(anObject, aRequest) {

    /**
     * @method fromString
     * @summary Returns a formatted XML String with the supplied String object
     *     as the content.
     * @description The supplied request can contain the following keys and
     *     values that are used in this method:
     *
     *     'escapeContent' Boolean Whether or not to 'escape' the content (i.e.
     *     if it has embedded markup). This defaults to false.
     * @param {Boolean} anObject The Object to wrap in the elements.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An optional object
     *     containing parameters.
     * @returns {String} The content formatted as markup.
     */

    var val,
        fieldNum;

    if (TP.isTrue(aRequest.at('escapeContent'))) {
        val = TP.xmlLiteralsToEntities(
                        TP.htmlEntitiesToXMLEntities(TP.str(anObject)));
    } else {
        val = TP.str(anObject);
    }

    fieldNum = TP.ifInvalid(aRequest.at('$INDEX'), TP.genID().slice(10));

    return TP.join('<input id="field_', fieldNum,
                    '" type="text" value="', val, '"/>');
});

//  ------------------------------------------------------------------------

TP.html.input.Type.defineMethod('generateMarkup',
function(anObject, attrStr, itemFormat, shouldAutoWrap, formatArgs, theRequest) {

    /**
     * @method generateMarkup
     * @summary Generates markup for the supplied Object using the other
     *     parameters supplied.
     * @param {Object} anObject The Object of content to wrap in markup.
     * @param {String} attrStr The String containing either the literal
     *     attribute markup or a 'template invocation' that can be used inside
     *     of a template.
     * @param {String} itemFormat The name of an 'item format', either a tag
     *     name (which defaults to the 'item tag name' of this type) or some
     *     other format type which can be applied to this type.
     * @param {Boolean} shouldAutoWrap Whether or not the markup generation
     *     machinery should 'autowrap' items of the supplied object (each item
     *     in an Array or each key/value pair in an Object).
     * @param {TP.core.Hash} formatArgs The 'formatting arguments' used by this
     *     machinery to generate item markup.
     * @param {TP.sig.Request|TP.core.Hash} theRequest An optional object
     *     containing parameters.
     * @returns {String} The markup generated by taking the supplied Object and
     *     iterating over its items.
     */

    var template,
        str;

    //  We use the abstract 'TP.html.input' type here for 'item formatting'.
    //  It will taste the object its receiving and return the 'correct
    //  default markup' based on that.

    if (TP.isArray(anObject)) {
        template = TP.join(
                    '<label for="field_{{$INDEX}}">',
                    'Field #{{$INDEX}}:',
                    '</label>',
                    '{{.%TP.html.input}}');
    } else {
        //  Otherwise, the object that will be handed to the iteration
        //  mechanism will be [key,value] pairs, so we can use that fact
        //  to generate item tags around each one.
        template = TP.join(
                    '<label for="field_{{$INDEX}}">',
                    '{{0}}:',
                    '</label>',
                    '{{1.%TP.html.input}}');
    }

    //  Perform the transformation.
    str = template.transform(anObject, theRequest);

    return str;
});

//  ------------------------------------------------------------------------

TP.html.input.Type.defineMethod('getConcreteType',
function(aNodeOrId) {

    /**
     * @method getConcreteType
     * @summary Returns the subtype to use for the node provided. Note that for
     *     TP.html.input elements the specific type returned is based on the
     *     value of the type attribute.
     * @param {Node|String} aNodeOrId The native node to wrap or an ID used to
     *     locate it.
     * @returns {TP.lang.RootObject.<TP.html.input>} A TP.html.input subtype
     *     type object.
     */

    var inputType,
        typeName;

    if (TP.isString(aNodeOrId)) {
        return TP.byId(aNodeOrId);
    }

    //  Default the inputType to 'text' if its not present, which is what
    //  most browsers do (i.e. if the author leaves of 'type="..."')
    if (TP.isEmpty(inputType = TP.elementGetAttribute(aNodeOrId, 'type'))) {
        inputType = 'text';
    }

    //  TP.html.form contains a map of the native element 'types'
    //  to node component types for those various types.
    typeName = TP.html.form.NODE_TYPE_NAMES.at(inputType);

    return typeName.asType();
});

//  ------------------------------------------------------------------------

TP.html.input.Type.defineMethod('shouldAutoWrapItems',
function(anObject, formatArgs) {

    /**
     * @method shouldAutoWrapItems
     * @summary Whether or not our fromArray() / fromObject() methods
     *     'auto-wrap items'. See those methods for more information.
     * @param {Object} anObject The Object of content to wrap in markup.
     * @param {TP.core.Hash} formatArgs An optional object containing
     *     parameters.
     * @returns {Boolean} Whether or not we automatically wrap items.
     */

    if (TP.isBoolean(formatArgs.at('autowrap'))) {
        return formatArgs.at('autowrap');
    }

    return false;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.input.Inst.defineMethod('isSingleValued',
function() {

    /**
     * @method isSingleValued
     * @summary Returns true if the receiver deals with single values.
     * @description See the TP.core.Node's 'isScalarValued()' instance method
     *     for more information.
     * @returns {Boolean} True when single valued.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.html.input.Inst.defineMethod('isScalarValued',
function() {

    /**
     * @method isScalarValued
     * @summary Returns true if the receiver deals with scalar values.
     * @description See the TP.core.Node's 'isScalarValued()' instance method
     *     for more information.
     * @returns {Boolean} For input types, this returns true.
     */

    return true;
});

//  ========================================================================
//  TP.html.inputVisible
//  ========================================================================

/**
 * @type {TP.html.inputVisible}
 * @summary Common functionality for those input nodes which have a visible
 *     representation.
 */

//  ------------------------------------------------------------------------

//  visible ones
TP.html.input.defineSubtype('inputVisible');

//  can't construct concrete instances of this
TP.html.inputVisible.isAbstract(true);

//  ========================================================================
//  TP.html.inputClickable
//  ========================================================================

/**
 * @type {TP.html.inputClickable}
 * @summary Common supertype for nodes that can be clicked with the mouse. This
 *     includes buttons, checkboxes, radio items, etc.
 */

//  ------------------------------------------------------------------------

//  buttons
TP.html.inputVisible.defineSubtype('inputClickable');

//  can't construct concrete instances of this
TP.html.inputClickable.isAbstract(true);

TP.backstop(TP.ac('click'), TP.html.inputClickable.getInstPrototype());

//  ------------------------------------------------------------------------

TP.html.inputClickable.Inst.defineMethod('disable',
function() {

    /**
     * @method disable
     * @summary Disables the control using the standard disabled attribute.
     * @returns {TP.html.inputClickable} The receiver.
     */

    this.setAttribute('disabled', 'true');

    return this;
});

//  ------------------------------------------------------------------------

TP.html.inputClickable.Inst.defineMethod('enable',
function() {

    /**
     * @method enable
     * @summary Enables the control by removing any disabled attribute.
     * @returns {TP.html.inputClickable} The receiver.
     */

    this.removeAttribute('disabled');

    return this;
});

//  ========================================================================
//  TP.html.inputCheckable
//  ========================================================================

/**
 * @type {TP.html.inputCheckable}
 * @summary Represents input nodes that can be 'checked' in some form. This
 *     includes checkboxes and radio items.
 */

//  ------------------------------------------------------------------------

//  check boxes / radio buttons
TP.html.inputClickable.defineSubtype('inputCheckable');
TP.html.inputCheckable.addTraits(TP.core.TogglingUIElementNode);

TP.html.inputCheckable.Inst.resolveTraits(
        TP.ac('getDisplayValue', 'setDisplayValue', 'isScalarValued'),
        TP.core.TogglingUIElementNode);

//  can't construct concrete instances of this
TP.html.inputCheckable.isAbstract(true);

TP.html.inputCheckable.Type.set('bidiAttrs', TP.ac('checked'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.inputCheckable.Type.defineMethod('onclick',
function(aTargetElem, anEvent) {

    /**
     * @method onclick
     * @param {HTMLElement} aTargetElem The target element computed for this
     *     signal.
     * @param {Event} anEvent The native event that was triggered.
     * @returns {TP.html.inputCheckable} The receiver.
     */

    var tpElem,

        valueTPElems,

        len,
        i,

        item,
        bindAttrNodes,

        bindInfoTPElem;

    tpElem = TP.wrap(aTargetElem);

    //  If the element is bound, then update its bound value.
    if (tpElem.isBoundElement()) {

        //  Since a checkable can have 1...n 'value elements', any one of them
        //  can have the binding information we need. Look for the first one
        //  that does.

        if (TP.notValid(valueTPElems = tpElem.getValueElements())) {
            return this.raise('TP.sig.InvalidValueElements');
        }

        len = valueTPElems.getSize();
        for (i = 0; i < len; i++) {

            item = valueTPElems.at(i);

            //  We look for either 'in', 'out', 'io' here to determine if the
            //  receiver is bound.
            bindAttrNodes = TP.elementGetAttributeNodesInNS(
                                item.getNativeNode(),
                                /.*:(in|out|io)/,
                                TP.w3.Xmlns.BIND);

            //  If we found binding attribute nodes, then this is the value
            //  element we're looking for. Capture it and exit.
            if (TP.notEmpty(bindAttrNodes)) {
                bindInfoTPElem = item;
                break;
            }
        }

        if (TP.notValid(bindInfoTPElem)) {
            return this.raise('TP.sig.InvalidBinding',
                                'Couldn\'t find binding info for: ' +
                                TP.str(tpElem));
        }

        //  Set our bound value, but using the binding information found on one
        //  of our 'value elements' (which might be the targeted element, but
        //  might not be).
        tpElem.setBoundValue(tpElem.getDisplayValue(),
                                bindInfoTPElem.getBindingScopeValues(),
                                bindInfoTPElem.getAttribute('bind:io'));
    }

    if (TP.isValid(tpElem) && tpElem.shouldSignalChange()) {
        tpElem.changed('value', TP.UPDATE);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.inputCheckable.Inst.defineMethod('defineBindingsUsing',
function(attrName, attrValue, scopeVals, direction, refreshImmediately) {

    /**
     * @method defineBindingsUsing
     * @summary Defines a binding between the data source as described in the
     *     supplied attribute value and the receiver.
     * @param {String} attrName The attribute name to install the binding under
     *     in the receiver.
     * @param {String} attrValue The attribute value to analyse to produce the
     *     proper binding expression.
     * @param {Array} scopeVals The list of scope values to use to qualify the
     *     binding expression.
     * @param {String} direction The binding 'direction' (i.e. which way to
     *     establish the binding connection from the data source to the
     *     receiver). Possible values here are: TP.IN, TP.OUT, TP.IO.
     * @param {Boolean} [refreshImmediately=false] Whether or not to refresh the
     *     receiver immediately after the bind is established.
     * @returns {TP.html.inputCheckable} The receiver.
     */

    var valueTPElems;

    if (attrName === 'checked') {

        //  Get all of elements that are part of our 'group', including ourself.
        valueTPElems = this.getValueElements();

        valueTPElems.perform(
            function(aTPElem) {
                TP.core.ElementNode.Inst.defineBindingsUsing.call(
                    aTPElem,
                    'value',
                    attrValue,
                    scopeVals,
                    direction,
                    refreshImmediately);
            });
    } else {
        this.callNextMethod();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.html.inputCheckable.Inst.defineMethod('destroyBindingsUsing',
function(attrName, attrValue, scopeVals, direction) {

    /**
     * @method destroyBindingsUsing
     * @summary Destroys any binding between the data source as described in the
     *     supplied attribute value and the receiver.
     * @param {String} attrName The attribute name to use to remove the binding
     *     from in the receiver.
     * @param {String} attrValue The attribute value to analyse to produce the
     *     proper binding expression.
     * @param {Array} scopeVals The list of scope values to use to qualify the
     *     binding expression.
     * @param {String} direction The binding 'direction' (i.e. which way the
     *     original binding connection was established from the data source to
     *     the receiver). Possible values here are: TP.IN, TP.OUT, TP.IO.
     * @returns {TP.html.inputCheckable} The receiver.
     */

    var valueTPElems;

    if (attrName === 'checked') {

        //  Get all of elements that are part of our 'group', including ourself.
        valueTPElems = this.getValueElements();

        valueTPElems.perform(
            function(aTPElem) {
                TP.core.ElementNode.Inst.destroyBindingsUsing.call(
                    aTPElem,
                    'value',
                    attrValue,
                    scopeVals,
                    direction);
            });
    } else {
        this.callNextMethod();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.html.inputCheckable.Inst.defineMethod('getLabelText',
function() {

    /**
     * @method getLabelText
     * @summary Returns the text of the label of the receiver.
     * @returns {String} The receiver's label text.
     */

    var val,
        labelElem;

    val = '';

    if (TP.isElement(
        labelElem = TP.byCSSPath('label[for="' + this.getLocalID() + '"]',
                                    this.getNativeDocument(),
                                    true,
                                    false))) {

        val = TP.nodeGetTextContent(labelElem);
    }

    return val;
});

//  ------------------------------------------------------------------------

TP.html.inputCheckable.Inst.defineMethod('getValueElements',
function() {

    /**
     * @method getValueElements
     * @summary Returns an Array TP.core.UIElementNodes that share a common
     *     'value object' with the receiver. That is, a change to the 'value' of
     *     the receiver will also change the value of one of these other
     *     TP.core.UIElementNodes.
     * @returns {TP.core.UIElementNode[]} The Array of shared value items.
     */

    var name,

        results;

    //  If we don't have a 'name' attribute, at least return an Array with 1
    //  item - ourself
    if (TP.isEmpty(name = this.getAttribute('name'))) {
        return TP.ac(this);
    }

    //  Run a CSS selector, which will return an Array of all of the elements
    //  (including the receiver's native node) that share the same name as the
    //  receiver. Note here how we don't collapse.
    results = TP.byCSSPath('input[name="' + name + '"]',
                            this.getNativeDocument(),
                            false);

    //  If we didn't get any nodes back from our query, at least return an Array
    //  with 1 item - ourself.
    if (TP.isEmpty(results)) {
        results = TP.ac(this);
    }

    return results;
});

//  ------------------------------------------------------------------------

TP.html.inputCheckable.Inst.defineMethod('$getMarkupValue',
function() {

    /**
     * @method $getMarkupValue
     * @summary Returns the 'value' of the receiver as authored by user in the
     *     markup. Many times this is represented as a 'value' attribute in the
     *     markup and serves as the default.
     * @returns {String} The markup value of the receiver.
     */

    return this.getAttribute('value');
});

//  ------------------------------------------------------------------------

TP.html.inputCheckable.Inst.defineMethod('$getPrimitiveValue',
function() {

    /**
     * @method $getPrimitiveValue
     * @summary Returns the low-level primitive value stored by the receiver in
     *     internal storage.
     * @returns {String} The primitive value of the receiver.
     */

    return this.getNativeNode().value;
});

//  ------------------------------------------------------------------------

TP.html.inputCheckable.Inst.defineMethod('getSubmitName',
function() {

    /**
     * @method getSubmitName
     * @summary Returns the name under which the receiver would be submitted
     *     when used in a forms context.
     * @returns {TP.html.inputRadio} The receiver.
     */

    var node,
        key;

    node = this.getNativeNode();

    key = TP.elementGetAttribute(node, 'id');
    if (TP.isEmpty(key)) {
        key = TP.elementGetAttribute(node, 'name');
    }

    return key;
});

//  ------------------------------------------------------------------------

TP.html.inputCheckable.Inst.defineMethod('$getVisualToggle',
function() {

    /**
     * @method $getVisualToggle
     * @summary Returns the low-level primitive 'toggle value' used by the
     *     receiver to display a 'checked' state.
     * @returns {Boolean} The low-level primitive 'toggle value' of the
     *     receiver.
     */

    return this.getNativeNode().checked;
});

//  ------------------------------------------------------------------------

TP.html.inputCheckable.Inst.defineMethod('isBoundElement',
function() {

    /**
     * @method isBoundElement
     * @summary Whether or not the receiver is a bound element.
     * @returns {Boolean} Whether or not the receiver is bound.
     */

    var valueTPElems,

        len,
        i,

        item,
        bindAttrNodes;

    //  Since a checkable can have 1...n 'value elements', any one of them can
    //  have the binding information we're trying to detect.

    if (TP.notValid(valueTPElems = this.getValueElements())) {
        return this.raise('TP.sig.InvalidValueElements');
    }

    len = valueTPElems.getSize();
    for (i = 0; i < len; i++) {

        item = valueTPElems.at(i);

        //  We look for either 'in', 'out', 'io' here to determine if the
        //  receiver is bound.
        bindAttrNodes = TP.elementGetAttributeNodesInNS(
                item.getNativeNode(), /.*:(in|out|io)/, TP.w3.Xmlns.BIND);

        //  If we found binding attribute nodes, then the receiver, along with
        //  whatever value elements its a member of, are bound. Return true.
        if (TP.notEmpty(bindAttrNodes)) {
            return true;
        }
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.html.inputCheckable.Inst.defineMethod('setFacet',
function(aspectName, facetName, facetValue, shouldSignal) {

    /**
     * @method setFacet
     * @summary Sets the value of the named facet of the named aspect to the
     *     value provided.
     * @param {String} aspectName The name of the aspect to set.
     * @param {String} facetName The name of the facet to set.
     * @param {Boolean} facetValue The value to set the facet to.
     * @param {Boolean} shouldSignal If false no signaling occurs. Defaults to
     *     this.shouldSignalChange().
     * @returns {TP.html.inputCheckable} The receiver.
     */

    if (aspectName === 'checked') {
        return this.setValue(facetValue, shouldSignal);
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.html.inputCheckable.Inst.defineMethod('$setVisualToggle',
function(aToggleValue) {

    /**
     * @method $setVisualToggle
     * @summary Sets the low-level primitive 'toggle value' used by the receiver
     *     to display a 'checked' state.
     * @param {Boolean} aToggleValue Whether or not to display the receiver's
     *     'checked' state.
     * @returns {TP.html.inputCheckable} The receiver.
     */

    this.getNativeNode().checked = aToggleValue;

    return this;
});

//  ========================================================================
//  TP.html.inputSelectable
//  ========================================================================

/**
 * @type {TP.html.inputSelectable}
 * @abtract Common supertype for nodes that can be selected. This includes the
 *     various text widgets for example.
 */

//  ------------------------------------------------------------------------

//  file, password, text, etc.
TP.html.inputVisible.defineSubtype('inputSelectable');

//  can't construct concrete instances of this
TP.html.inputSelectable.isAbstract(true);

//  ------------------------------------------------------------------------

TP.backstop(TP.ac('select'), TP.html.inputSelectable.getInstPrototype());

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.inputSelectable.Type.defineMethod('onchange',
function(aTargetElem, anEvent) {

    /**
     * @method onchange
     * @param {HTMLElement} aTargetElem The target element computed for this
     *     signal.
     * @param {Event} anEvent The native event that was triggered.
     * @returns {TP.html.inputSelectable} The receiver.
     */

    var tpElem;

    tpElem = TP.wrap(aTargetElem);

    //  If the element is bound, then update its bound value.
    if (tpElem.isBoundElement()) {

        tpElem.setBoundValue(tpElem.getDisplayValue(),
                                tpElem.getBindingScopeValues(),
                                tpElem.getAttribute('bind:io'));
    }

    if (TP.isValid(tpElem) && tpElem.shouldSignalChange()) {
        tpElem.changed('value', TP.UPDATE);
    }

    return this;
});

//  ========================================================================
//  TP.html.inputButton
//  ========================================================================

/**
 * @type {TP.html.inputButton}
 * @summary <input type="button"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputClickable.defineSubtype('inputButton');

//  ========================================================================
//  TP.html.inputColor
//  ========================================================================

/**
 * @type {TP.html.inputColor}
 * @summary <input type="color"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputClickable.defineSubtype('inputColor');

//  ========================================================================
//  TP.html.inputDate
//  ========================================================================

/**
 * @type {TP.html.inputDate}
 * @summary <input type="date"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputClickable.defineSubtype('inputDate');

//  ========================================================================
//  TP.html.inputDateTime
//  ========================================================================

/**
 * @type {TP.html.inputDateTime}
 * @summary <input type="datetime"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputClickable.defineSubtype('inputDateTime');

//  ========================================================================
//  TP.html.inputDateTimeLocal
//  ========================================================================

/**
 * @type {TP.html.inputDateTimeLocal
 * @summary <input type="datetime-local"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputClickable.defineSubtype('inputDateTimeLocal');

//  ========================================================================
//  TP.html.inputMonth
//  ========================================================================

/**
 * @type {TP.html.inputMonth
 * @summary <input type="month"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputClickable.defineSubtype('inputMonth');

//  ========================================================================
//  TP.html.inputRange
//  ========================================================================

/**
 * @type {TP.html.inputRange}
 * @summary <input type="range"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputClickable.defineSubtype('inputRange');

//  ========================================================================
//  TP.html.inputCheckbox
//  ========================================================================

/**
 * @type {TP.html.inputCheckbox}
 * @summary <input type="checkbox"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputCheckable.defineSubtype('inputCheckbox');

//  ------------------------------------------------------------------------

TP.html.inputCheckbox.Inst.defineMethod('isSingleValued',
function() {

    /**
     * @method isSingleValued
     * @summary Returns true if the receiver deals with single values.
     * @description See the TP.core.Node's 'isScalarValued()' instance method
     *     for more information.
     * @returns {Boolean} True when single valued.
     */

    //  Checkbox (arrays) are not single valued.
    return false;
});

//  ------------------------------------------------------------------------

TP.html.inputCheckbox.Inst.defineMethod('$generateSelectionHashFrom',
function(aValue) {

    /**
     * @method $generateSelectionHashFrom
     * @summary Returns a Hash that is driven off of the supplied value which
     *     can then be used to set the receiver's selection.
     * @returns {TP.core.Hash} A Hash that is populated with data from the
     *     supplied value that can be used for manipulating the receiver's
     *     selection.
     */

    //  If the value is just true, then populate a selection hash with the word
    //  'on' in it.
    if (aValue === true) {
        return TP.hc('on', '');
    }

    return this.callNextMethod();
});

//  ========================================================================
//  TP.html.inputEmail
//  ========================================================================

/**
 * @type {TP.html.inputEmail}
 * @summary <input type="email"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputSelectable.defineSubtype('inputEmail');

TP.html.inputEmail.addTraits(TP.html.textUtilities);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.inputEmail.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @method getDisplayValue
     * @summary Returns the value of the receiver.
     * @returns {String} The receiver's input value.
     */

    return this.getNativeNode().value;
});

//  ------------------------------------------------------------------------

TP.html.inputEmail.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @method setDisplayValue
     * @summary Sets the value of the receiver.
     * @returns {TP.html.inputEmail} The receiver.
     */

    this.getNativeNode().value = TP.str(aValue);

    return this;
});

//  ========================================================================
//  TP.html.inputFile
//  ========================================================================

/**
 * @type {TP.html.inputFile}
 * @summary <input type="file"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputSelectable.defineSubtype('inputFile');

//  ========================================================================
//  TP.html.inputHidden
//  ========================================================================

/**
 * @type {TP.html.inputHidden}
 * @summary <input type="hidden"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.input.defineSubtype('inputHidden');

//  ========================================================================
//  TP.html.inputNumber
//  ========================================================================

/**
 * @type {TP.html.inputNumber}
 * @summary <input type="number"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputSelectable.defineSubtype('inputNumber');

TP.html.inputNumber.addTraits(TP.html.textUtilities);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.inputNumber.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @method getDisplayValue
     * @summary Returns the value of the receiver.
     * @returns {String} The receiver's input value.
     */

    return this.getNativeNode().value;
});

//  ------------------------------------------------------------------------

TP.html.inputNumber.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @method setDisplayValue
     * @summary Sets the value of the receiver.
     * @returns {TP.html.inputNumber} The receiver.
     */

    this.getNativeNode().value = TP.str(aValue);

    return this;
});

//  ========================================================================
//  TP.html.inputImage
//  ========================================================================

/**
 * @type {TP.html.inputImage}
 * @summary <input type="image"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.input.defineSubtype('inputImage');

//  ========================================================================
//  TP.html.inputPassword
//  ========================================================================

/**
 * @type {TP.html.inputPassword}
 * @summary <input type="password"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputSelectable.defineSubtype('inputPassword');

TP.html.inputPassword.addTraits(TP.html.textUtilities);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.inputPassword.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @method getDisplayValue
     * @summary Returns the value of the receiver.
     * @returns {String} The receiver's input value.
     */

    return this.getNativeNode().value;
});

//  ------------------------------------------------------------------------

TP.html.inputPassword.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @method setDisplayValue
     * @summary Sets the value of the receiver.
     * @returns {TP.html.inputPassword} The receiver.
     */

    //  You can't set the value of a <input type="password"/> field

    return this;
});

//  ========================================================================
//  TP.html.inputSearch
//  ========================================================================

/**
 * @type {TP.html.inputSearch}
 * @summary <input type="search"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputSelectable.defineSubtype('inputSearch');

TP.html.inputSearch.addTraits(TP.html.textUtilities);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.inputSearch.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @method getDisplayValue
     * @summary Returns the value of the receiver.
     * @returns {String} The receiver's input value.
     */

    return this.getNativeNode().value;
});

//  ------------------------------------------------------------------------

TP.html.inputSearch.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @method setDisplayValue
     * @summary Sets the value of the receiver.
     * @returns {TP.html.inputSearch} The receiver.
     */

    this.getNativeNode().value = TP.str(aValue);

    return this;
});

//  ========================================================================
//  TP.html.inputRadio
//  ========================================================================

/**
 * @type {TP.html.inputRadio}
 * @summary <input type="radio">. This type is a wrapper for a radio group
 *     items, allowing you to set/get their value easily.
 */

//  ------------------------------------------------------------------------

TP.html.inputCheckable.defineSubtype('inputRadio');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.inputRadio.Inst.defineMethod('allowsMultiples',
function() {

    /**
     * @method allowsMultiples
     * @summary Returns false since radio buttons, by their very nature, don't
     *     allow multiple selection.
     * @returns {Boolean} Whether or not the receiver allows multiple selection.
     */

    return false;
});

//  ========================================================================
//  TP.html.inputReset
//  ========================================================================

/**
 * @type {TP.html.inputReset}
 * @summary <input type="reset"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputClickable.defineSubtype('inputReset');

//  ========================================================================
//  TP.html.inputSubmit
//  ========================================================================

/**
 * @type {TP.html.inputSubmit}
 * @summary <input type="submit"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputClickable.defineSubtype('inputSubmit');

//  ========================================================================
//  TP.html.inputTel
//  ========================================================================

/**
 * @type {TP.html.inputTel}
 * @summary <input type="tel"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputSelectable.defineSubtype('inputTel');

TP.html.inputTel.addTraits(TP.html.textUtilities);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.inputTel.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @method getDisplayValue
     * @summary Returns the value of the receiver.
     * @returns {String} The receiver's input value.
     */

    return this.getNativeNode().value;
});

//  ------------------------------------------------------------------------

TP.html.inputTel.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @method setDisplayValue
     * @summary Sets the value of the receiver.
     * @returns {TP.html.inputTel} The receiver.
     */

    this.getNativeNode().value = TP.str(aValue);

    return this;
});

//  ========================================================================
//  TP.html.inputText
//  ========================================================================

/**
 * @type {TP.html.inputText}
 * @summary <input type="text"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputSelectable.defineSubtype('inputText');

TP.html.inputText.addTraits(TP.html.textUtilities);

TP.html.inputText.Type.resolveTraits(
        TP.ac('bidiAttrs', 'booleanAttrs', 'uriAttrs'),
        TP.html.inputText);

TP.html.inputText.Inst.resolveTraits(
        TP.ac('getValue', 'setValue'),
        TP.html.textUtilities);

TP.html.inputText.Inst.resolveTraits(
        TP.ac('getContent', 'setContent'),
        TP.core.EmptyElementNode);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.inputText.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @method getDisplayValue
     * @summary Returns the value of the receiver.
     * @returns {String} The receiver's formatted input value.
     */

    return this.getNativeNode().value;
});

//  ------------------------------------------------------------------------

TP.html.inputText.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @method setDisplayValue
     * @summary Sets the value of the receiver.
     * @returns {TP.html.inputText} The receiver.
     */

    this.getNativeNode().value = TP.str(aValue);

    return this;
});

//  ========================================================================
//  TP.html.inputTime
//  ========================================================================

/**
 * @type {TP.html.inputTime}
 * @summary <input type="time"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputClickable.defineSubtype('inputTime');

//  ========================================================================
//  TP.html.inputWeek
//  ========================================================================

/**
 * @type {TP.html.inputWeek}
 * @summary <input type="week"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputClickable.defineSubtype('inputWeek');

//  ========================================================================
//  TP.html.inputUrl
//  ========================================================================

/**
 * @type {TP.html.inputUrl}
 * @summary <input type="url"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputSelectable.defineSubtype('inputUrl');

TP.html.inputUrl.addTraits(TP.html.textUtilities);

TP.html.inputUrl.Type.resolveTraits(
        TP.ac('bidiAttrs', 'booleanAttrs', 'uriAttrs'),
        TP.html.inputUrl);

TP.html.inputUrl.Inst.resolveTraits(
        TP.ac('getValue', 'setValue'),
        TP.html.textUtilities);

TP.html.inputUrl.Inst.resolveTraits(
        TP.ac('getContent', 'setContent'),
        TP.core.EmptyElementNode);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.inputUrl.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @method getDisplayValue
     * @summary Returns the value of the receiver.
     * @returns {String} The receiver's formatted input value.
     */

    return this.getNativeNode().value;
});

//  ------------------------------------------------------------------------

TP.html.inputUrl.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @method setDisplayValue
     * @summary Sets the value of the receiver.
     * @returns {TP.html.inputUrl} The receiver.
     */

    this.getNativeNode().value = TP.str(aValue);

    return this;
});

//  ========================================================================
//  TP.html.legend
//  ========================================================================

/**
 * @type {TP.html.legend}
 * @summary 'legend' tag. Fieldset label.
 */

//  ------------------------------------------------------------------------

TP.html.Aligned.defineSubtype('legend');

//  ========================================================================
//  TP.html.select
//  ========================================================================

/**
 * @type {TP.html.select}
 * @summary 'select' tag. Single or multiple selection control.
 */

//  ------------------------------------------------------------------------

TP.html.Focused.defineSubtype('select');

TP.html.select.addTraits(TP.core.SelectingUIElementNode);

//  ------------------------------------------------------------------------

TP.html.select.Type.set('booleanAttrs',
        TP.ac('autofocus', 'disabled', 'multiple', 'required', 'willValidate'));

TP.html.select.Type.set('bidiAttrs', TP.ac('value'));

TP.backstop(TP.ac('add', 'remove'), TP.html.select.getInstPrototype());

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.select.Type.defineMethod('getItemTagName',
function() {

    /**
     * @method getItemTagName
     * @summary Returns the 'default item tag name' for use it the
     *     fromArray()/fromObject() methods.
     * @returns {String} The ID of the observer.
     */

    return 'html:option';
});

//  ------------------------------------------------------------------------

TP.html.select.Type.defineMethod('onchange',
function(aTargetElem, anEvent) {

    /**
     * @method onchange
     * @param {HTMLElement} aTargetElem The target element computed for this
     *     signal.
     * @param {Event} anEvent The native event that was triggered.
     * @returns {TP.html.select} The receiver.
     */

    var tpElem;

    tpElem = TP.wrap(aTargetElem);

    //  If the element is bound, then update its bound value.
    if (tpElem.isBoundElement()) {
        tpElem.setBoundValue(tpElem.getDisplayValue(),
                                tpElem.getBindingScopeValues(),
                                tpElem.getAttribute('bind:io'));
    }

    if (TP.isValid(tpElem) && tpElem.shouldSignalChange()) {
        tpElem.changed('value', TP.UPDATE);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.html.select.Type.defineMethod('shouldAutoWrapItems',
function(anObject, formatArgs) {

    /**
     * @method shouldAutoWrapItems
     * @summary Whether or not our fromArray() / fromObject() methods
     *     'auto-wrap items'. See those methods for more information.
     * @param {Object} anObject The Object of content to wrap in markup.
     * @param {TP.core.Hash} formatArgs An optional object containing
     *     parameters.
     * @returns {Boolean} Whether or not we automatically wrap items.
     */

    if (TP.isBoolean(formatArgs.at('autowrap'))) {
        return formatArgs.at('autowrap');
    }

    return false;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.select.Inst.defineMethod('allowsMultiples',
function() {

    /**
     * @method allowsMultiples
     * @summary Returns true if the receiver is configured for multiple
     *     selection.
     * @returns {Boolean} Whether or not the receiver allows multiple selection.
     */

    /* eslint-disable no-extra-parens */
    return (this.getNativeNode().type === 'select-multiple');
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.html.select.Inst.defineMethod('deselectAll',
function() {

    /**
     * @method deselectAll
     * @summary Clears any current selection(s).
     * @exception TP.sig.InvalidValueElements
     * @returns {TP.html.select} The receiver.
     */

    this.callNextMethod();

    this.getNativeNode().selectedIndex = -1;

    return this;
});

//  ------------------------------------------------------------------------

TP.html.select.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @method getDisplayValue
     * @summary Returns the selected value of the select list. This corresponds
     *     to the value of the currently selected item or items.
     * @returns {String|Array} A String containing the selected value or an
     *     Array of zero or more selected values if the receiver is set up to
     *     allow multiple selections.
     */

    var valueTPElems,
        theIndex,
        selectionArray,
        len,
        i,

        item;

    if (TP.notValid(valueTPElems = this.getValueElements())) {
        return this.raise('TP.sig.InvalidValueElements');
    }

    //  If this Select isn't set up to allow multiple selection, then just
    //  return the value of the element at the native element's selected
    //  index.
    if (!this.allowsMultiples()) {
        if ((theIndex = this.getNativeNode().selectedIndex) === TP.NOT_FOUND) {
            return null;
        }

        return TP.unwrap(valueTPElems.at(theIndex)).value;
    }

    selectionArray = TP.ac();

    //  Loop over all of the elements and if the element at the index is
    //  selected, add it to the Array of selected elements.
    len = valueTPElems.getSize();
    for (i = 0; i < len; i++) {

        item = valueTPElems.at(i);

        if (item.$getVisualToggle()) {
            selectionArray.push(TP.unwrap(item).value);
        }
    }

    return selectionArray;
});

//  ------------------------------------------------------------------------

TP.html.select.Inst.defineMethod('getValue',
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

    //  If the receiver has a 'ui:type' attribute, then try first to convert the
    //  content to that type before trying to format it.
    if (TP.notEmpty(type = this.getAttribute('ui:type'))) {
        if (!TP.isType(type = TP.sys.getTypeByName(type))) {
            return this.raise('TP.sig.InvalidType');
        } else {
            value = type.fromString(value);
        }
    }

    //  If the receiver has a 'ui:storage' attribute, then format the return
    //  value according to the formats found there.
    if (TP.notEmpty(formats = this.getAttribute('ui:storage'))) {
        value = this.$formatValue(value, formats);
    }

    return value;
});

//  ------------------------------------------------------------------------

TP.html.select.Inst.defineMethod('getValueElements',
function() {

    /**
     * @method getValueElements
     * @summary Returns an Array TP.core.UIElementNodes that share a common
     *     'value object' with the receiver. That is, a change to the 'value' of
     *     the receiver will also change the value of one of these other
     *     TP.core.UIElementNodes.
     * @returns {TP.core.UIElementNode[]} The Array of shared value items.
     */

    //  For some reason, on IE, the 'options' Array doesn't work properly. It
    //  returns the native node of the receiver.

    //  So we query by CSS instead. Note here how we don't collapse.
    return TP.byCSSPath('option', this.getNativeNode(), false);
});

//  ------------------------------------------------------------------------

TP.html.select.Inst.defineMethod('isScalarValued',
function() {

    /**
     * @method isScalarValued
     * @summary Returns true if the receiver deals with scalar values.
     * @description See the TP.core.Node's 'isScalarValued()' instance method
     *     for more information.
     * @returns {Boolean} For input types, this returns true.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.html.select.Inst.defineMethod('removeSelection',
function(aValue, optionProperty) {

    /**
     * @method removeSelection
     * @summary Removes the selection matching the criteria if found. Note that
     *     this method does not clear existing selections when processing the
     *     value(s) provided.
     * @description Note that the aspect can be one of the following, which will
     *      be the property used with each 'option' element to determine which
     *      of them will be deselected.
     *          'value'     ->  The value of the option (the default)
     *          'label'     ->  The label of the option
     *          'id'        ->  The id of the option
     *          'index'     ->  The numerical index of the option
     * @param {Object|Array} aValue The value to use when determining the
     *      options to remove from the selection. Note that this can be an
     *      Array.
     * @param {String} optionProperty The property of the option elements to use
     *      to determine which options should be deselected.
     * @exception TP.sig.InvalidOperation,TP.sig.InvalidValueElements
     * @returns {Boolean} Whether or not a selection was removed.
     */

    var dirty;

    dirty = this.callNextMethod();

    if (dirty) {

        if (!this.allowsMultiples()) {
            //  If the receiver doesn't allow multiples and dirty was true, that
            //  means there are no selections now so make sure to set
            //  selectedIndex to -1 here - some browsers don't seem to set this
            //  to -1 when all options are deselected and it definitely helps
            //  when reading the value back out.
            this.getNativeNode().selectedIndex = -1;
        }
    }

    return dirty;
});

//  ------------------------------------------------------------------------

TP.html.select.Inst.defineMethod('setDisplayValue',
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
     * @returns {TP.html.select} The receiver.
     */

    var valueTPElems,
        separator,
        value,

        dict,
        len,
        i,

        dirty,
        deselectCount,

        item;

    //  empty value means clear any selection(s)
    if (TP.isEmpty(aValue)) {
        return this.deselectAll();
    }

    if (TP.notValid(valueTPElems = this.getValueElements())) {
        return this.raise('TP.sig.InvalidValueElements');
    }

    separator = TP.ifEmpty(this.getAttribute('bind:separator'),
                            TP.sys.cfg('bind.value_separator'));

    if (TP.isString(aValue)) {
        value = aValue.split(separator).collapse();
    } else {
        value = aValue;
    }

    //  watch for multiple selection issues
    if (TP.isArray(value) && !this.allowsMultiples()) {
        value = value.at(0);
    }

    //  Generate a selection hash. This should populate the hash with keys that
    //  match 1...n values in the supplied value.
    dict = this.$generateSelectionHashFrom(value);

    dirty = false;
    deselectCount = 0;

    len = valueTPElems.getSize();
    for (i = 0; i < len; i++) {

        item = valueTPElems.at(i);

        if (dict.containsKey(item.$getPrimitiveValue())) {
            if (!item.$getVisualToggle()) {
                dirty = true;
            }
            item.$setVisualToggle(true);
        } else {
            if (item.$getVisualToggle()) {
                dirty = true;
            }
            item.$setVisualToggle(false);
            deselectCount++;
        }
    }

    //  If there are no selections now, make sure to set selectedIndex to -1
    //  here - some browsers don't seem to set this to -1 when all options are
    //  deselected and it definitely helps when reading the value back out.
    if (deselectCount === i) {
        this.getNativeNode().selectedIndex = -1;
    }

    if (dirty) {
        this.changed('selection', TP.UPDATE);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.html.select.Inst.defineMethod('setValue',
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
     * @returns {TP.html.select} The receiver.
     */

    var oldValue,
        newValue,

        flag;

    oldValue = this.getValue();

    newValue = this.produceValue(aValue);

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

//  ========================================================================
//  TP.html.textarea
//  ========================================================================

/**
 * @type {TP.html.textarea}
 * @summary 'textarea' tag. Multiline text input.
 */

//  ------------------------------------------------------------------------

TP.html.Focused.defineSubtype('textarea');

TP.html.textarea.addTraits(TP.html.textUtilities);

TP.html.textarea.Type.resolveTraits(
        TP.ac('booleanAttrs', 'bidiAttrs'),
        TP.html.textarea);

TP.html.textarea.Inst.resolveTraits(
        TP.ac('getValue', 'setValue'),
        TP.html.textUtilities);

TP.html.textarea.Type.set('bidiAttrs', TP.ac('value'));

TP.html.textarea.Type.set('booleanAttrs',
        TP.ac('autofocus', 'disabled', 'readOnly', 'required', 'willValidate'));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.backstop(TP.ac('select'), TP.html.textarea.getInstPrototype());

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.textarea.Type.defineMethod('onchange',
function(aTargetElem, anEvent) {

    /**
     * @method onchange
     * @param {HTMLElement} aTargetElem The target element computed for this
     *     signal.
     * @param {Event} anEvent The native event that was triggered.
     * @returns {TP.html.textarea} The receiver.
     */

    var tpElem;

    tpElem = TP.wrap(aTargetElem);

    //  If the element is bound, then update its bound value.
    if (tpElem.isBoundElement()) {
        tpElem.setBoundValue(tpElem.getDisplayValue(),
                                tpElem.getBindingScopeValues(),
                                tpElem.getAttribute('bind:io'));
    }

    if (TP.isValid(tpElem) && tpElem.shouldSignalChange()) {
        tpElem.changed('value', TP.UPDATE);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.textarea.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @method getDisplayValue
     * @summary Returns the value of the receiver.
     * @returns {String} The receiver's formatted input value.
     */

    return this.getNativeNode().value;
});

//  ------------------------------------------------------------------------

TP.html.textarea.Inst.defineMethod('isSingleValued',
function() {

    /**
     * @method isSingleValued
     * @summary Returns true if the receiver deals with single values.
     * @description See the TP.core.Node's 'isScalarValued()' instance method
     *     for more information.
     * @returns {Boolean} True when single valued.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.html.textarea.Inst.defineMethod('isScalarValued',
function() {

    /**
     * @method isScalarValued
     * @summary Returns true if the receiver deals with scalar values.
     * @description See the TP.core.Node's 'isScalarValued()' instance method
     *     for more information.
     * @returns {Boolean} For input types, this returns true.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.html.textarea.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @method setDisplayValue
     * @summary Sets the value of the receiver.
     * @returns {TP.html.textarea} The receiver.
     */

    this.getNativeNode().value = TP.str(aValue);

    return this;
});

//  ========================================================================
//  TP.html.button
//  ========================================================================

/**
 * @type {TP.html.button}
 * @summary 'button' tag.
 * @description NOT the same as <input type="button"> due largely to rendering
 *     differences. The attributes and behavior are largely similar, however.
 *     This tag type supports content between the opening/closing button tags
 *     unlike the input form of this control which has no closing tag and hence
 *     no content.
 */

//  ------------------------------------------------------------------------

TP.html.inputClickable.defineSubtype('button');

TP.html.button.Type.set('booleanAttrs',
            TP.ac('autofocus', 'disabled', 'formNoValidate', 'willValidate'));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
