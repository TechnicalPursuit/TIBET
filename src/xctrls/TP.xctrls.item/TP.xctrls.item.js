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
        TP.xpc('string(./xctrls:value)', TP.hc('shouldCollapse', true)));
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
