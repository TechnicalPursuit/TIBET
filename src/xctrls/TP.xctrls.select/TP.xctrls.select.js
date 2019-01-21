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
 * @type {TP.xctrls.select}
 * @summary Manages select XControls.
 */

//  ------------------------------------------------------------------------

TP.xctrls.picker.defineSubtype('xctrls:select');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.xctrls.select.Type.set('bidiAttrs', TP.ac('value'));

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.select.Inst.defineAttribute('label',
    TP.cpc('> xctrls|button > xctrls|label',
            TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.select.Inst.defineMethod('constructContent',
function(valueURI) {

    /**
     * @method constructContent
     * @summary Constructs the content element that will go into the picker.
     * @param {TP.uri.URI} valueURI The URI to use to set the 'value' of the
     *     control.
     * @returns {TP.dom.ElementNode} The content element.
     */

    var id,

        bindingInfo,
        dataInVal,

        valueLocation,

        str,
        contentTPElem;

    id = this.getLocalID();

    bindingInfo = this.getBindingInfoFrom(
                            'bind:in', this.getAttribute('bind:in'));

    //  If the binding information had a 'data' key, then that means that the
    //  author provided an expression for us to obtain data for the list.
    if (bindingInfo.hasKey('data')) {

        //  Grab the value of the first expression.
        dataInVal = bindingInfo.at('data').at('dataExprs').first();

        //  Use the location of the 'value' URI that was supplied to us.
        valueLocation = valueURI.getLocation();

        //  Build the markup for the list, using the 'data' location for the
        //  'bind:in' and the 'value' location for the 'bind:io'.
        str = '<xctrls:list id="' + id + '_list"' +
                ' bind:in="{data:' + dataInVal + '}"' +
                ' on:dragup="TP.sig.UIDeactivate"' +
                ' bind:io="{value: ' + valueLocation + '}"';

        //  If the author supplied a 'ui:incremental' attribute, pass that along
        //  to the list.
        if (this.hasAttribute('ui:incremental')) {
            str += ' ui:incremental="' +
                    this.getAttribute('ui:incremental') +
                    '"';
        }

        str += '/>';

        contentTPElem = TP.tpelem(str);
        contentTPElem.compile();
    }

    return contentTPElem;
});

//  ------------------------------------------------------------------------

TP.xctrls.select.Inst.defineMethod('getDescendantsForSerialization',
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

    selectedDescendants = this.get('./xctrls:hint');

    selectedDescendants = TP.expand(selectedDescendants);

    return selectedDescendants;
});

//  ------------------------------------------------------------------------

TP.xctrls.select.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @method getDisplayValue
     * @summary Gets the display, or visual, value of the receiver's node.
     * @returns {Object} The visual value of the receiver's UI node.
     */

    var initialVal,

        popupList,

        itemWithLabel,
        value;

    initialVal = this.get('label').getContent();

    popupList = this.get('popupContentFirstElement');

    itemWithLabel = popupList.get('itemWithLabel', initialVal);
    if (TP.notEmpty(itemWithLabel)) {
        value = itemWithLabel.$getMarkupValue();
    } else {
        value = initialVal;
    }

    return value;
});

//  ------------------------------------------------------------------------

TP.xctrls.select.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @method setDisplayValue
     * @summary Sets the display, or visual, value of the receiver's node. You
     *     don't normally call this method directly, instead call setValue().
     * @param {Object} aValue The value to set.
     * @returns {TP.xctrls.select} The receiver.
     */

    var popupList,

        itemWithValue,
        label;

    popupList = this.get('popupContentFirstElement');

    itemWithValue = popupList.get('itemWithValue', aValue);
    if (TP.notEmpty(itemWithValue)) {
        label = itemWithValue.getLabelText();
    } else {
        label = aValue;
    }

    this.get('label').setContent(label);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
