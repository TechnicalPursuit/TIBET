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
 * @type {TP.html.Element}
 * @summary The TP.html.Element type is the top-level type in the xhtml node
 *     hierarchy. Note that we use the prefix html here since that is the
 *     defined canonical prefix for XHTML as well as HTML.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('html:Element');

//  can't construct concrete instances of this
TP.html.Element.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.html.Element.Type.set('booleanAttrs',
        TP.ac('translate', 'itemScope', 'hidden', 'draggable',
                'isContentEditable', 'spellcheck',
                'commandHidden', 'commandDisabled', 'commandChecked'));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.Element.Inst.defineMethod('addCSSClass',
function(aCSSClass, atEnd) {

    /**
     * @method addCSSClass
     * @summary Adds the CSS class whose name is equal to aCSSClass to this
     *     object's CSS class name list.
     * @description Note that if the 'atEnd' argument is set to 'true', this
     *     causes aCSSClass to be appended to the end of the list of CSS class
     *     names. Since the order of CSS class names is important when
     *     specifying multiple names in the same 'className' attribute for the
     *     same element (for purposes of computing precedence), this is
     *     important.
     * @param {String} aCSSClass The name of the CSS class to add.
     * @param {Boolean} atEnd Whether or not this CSS class should be added to
     *     the end of the list of CSS classes.
     * @returns {TP.html.Element} The receiver.
     */

    TP.elementAddCSSClass(this.getNativeNode(), aCSSClass, atEnd);

    return this;
});

//  ------------------------------------------------------------------------

TP.html.Element.Inst.defineMethod('getClass',
function() {

    /**
     * @method getClass
     * @summary Gets the CSS class of the receiver.
     * @returns {String} A string containing the current class name.
     */

    return TP.elementGetClass(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.html.Element.Inst.defineMethod('getStyle',
function() {

    /**
     * @method getStyle
     * @summary Gets the style of this component.
     * @returns {String} A string containing the current inline style of this
     *     element.
     */

    return TP.elementGetStyle(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.html.Element.Inst.defineMethod('removeCSSClass',
function(aCSSClass) {

    /**
     * @method removeCSSClass
     * @summary Removes the CSS class whose name is equal to aCSSClass from
     *     this object's CSS class name list.
     * @param {String} aCSSClass The name of the CSS class to remove.
     * @returns {TP.html.Element} The receiver.
     */

    TP.elementRemoveCSSClass(this.getNativeNode(), aCSSClass);

    return this;
});

//  ------------------------------------------------------------------------

TP.html.Element.Inst.defineMethod('replaceCSSClass',
function(oldCSSClass, newCSSClass) {

    /**
     * @method replaceCSSClass
     * @summary Replaces the CSS class whose name is equal to oldCSSClass with
     *     the CSS class named newCSSClass. this object's CSS class name list.
     * @param {String} oldCSSClass The name of the CSS class to replace.
     * @param {String} newCSSClass The name of the CSS class to replace it with.
     * @returns {TP.html.Element} The receiver.
     */

    TP.elementReplaceCSSClass(this.getNativeNode(),
                                oldCSSClass,
                                newCSSClass);

    return this;
});

//  ------------------------------------------------------------------------

TP.html.Element.Inst.defineMethod('setClass',
function(aClassName) {

    /**
     * @method setClass
     * @summary An optimized method to set the native element's CSS class name
     *     to aClassName.
     * @param {String} aClassName The CSS class name to set the native element's
     *     class name to.
     * @returns {TP.html.Element} The receiver.
     */

    TP.elementSetClass(this.getNativeNode(), aClassName);

    return this;
});

//  ------------------------------------------------------------------------

TP.html.Element.Inst.defineMethod('setStyle',
function(aStyle) {

    /**
     * @method setStyle
     * @summary Sets the style of this component to the style parameters given
     *     in aStyleString.
     * @param {String|TP.core.Hash} aStyle The description of the style in CSS
     *     format, or a hash of style strings.
     * @returns {TP.html.Element} The receiver.
     */

    var styleObj;

    if (TP.isString(aStyle)) {
        //  We have the whole 'style' String and we want to set it all at
        //  once.
        TP.elementSetStyle(this.getNativeNode(), aStyle);
    }

    styleObj = this.getNativeNode().style;

    //  Loop over all of the key/value pairs in the hash.
    aStyle.perform(
            function(kvPair) {

                var domPropName;

                //  Get the actual DOM property name
                domPropName = kvPair.first().asDOMName();

                //  If we got a valid DOM property, set its value on the
                //  native style object to the value at this key in the
                //  collection.
                if (TP.isString(domPropName)) {
                    styleObj[domPropName] = kvPair.last();
                }
            });

    return this;
});

//  ------------------------------------------------------------------------
//  DATA BINDING
//  ------------------------------------------------------------------------

TP.html.Element.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @method getDisplayValue
     * @summary Returns the receiver's "value" whatever that means for this
     *     type. The default operations here check for a non-empty value
     *     attribute, a value slot, and finally the text value.
     * @returns {Object} The value of the receiver.
     */

    var node,
        val;

    node = this.getNativeNode();

    //  attribute is our first choice since that's most common
    if (TP.elementHasAttribute(node, 'value')) {
        return this.getAttribute('value');
    }

    //  next choice is a value slot, but that's rare actually
    try {
        if (TP.notEmpty(val = node.value)) {
            return val;
        }
    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(e, 'Error getting display value.'),
                TP.LOG) : 0;
    }

    //  last value option is the text value
    return TP.nodeGetTextContent(node);
});

//  ------------------------------------------------------------------------

TP.html.Element.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @method setDisplayValue
     * @summary Sets the receiver's "value" whatever that means for this type.
     *     The two default operations here are to set a 'value' attribute and a
     *     'value' slot if possible.
     * @param {String} aValue The new value to set.
     * @returns {TP.html.Element} The receiver.
     */

    var node;

    node = this.getNativeNode();

    //  we'll work in pairs here, since we want to keep the DOM and XML in
    //  sync as much as possible. NOTE that few controls will actually
    //  respond positively to this, so it's typical to override this method
    this.setAttribute('value', aValue);

    try {
        if (TP.notEmpty(node.value)) {
            node.value = aValue;
        } else {
            TP.nodeSetTextContent(node, aValue);
        }
    } catch (e) {
        TP.nodeSetTextContent(node, aValue);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
