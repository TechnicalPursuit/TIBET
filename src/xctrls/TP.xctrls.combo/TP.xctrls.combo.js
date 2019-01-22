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
 * @type {TP.xctrls.combo}
 * @summary Manages combo XControls.
 */

//  ------------------------------------------------------------------------

TP.xctrls.picker.defineSubtype('xctrls:combo');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.xctrls.combo.Type.set('bidiAttrs', TP.ac('value'));

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.combo.Inst.defineAttribute('dataURI');

TP.xctrls.combo.Inst.defineAttribute('input',
    TP.cpc('> html|input',
            TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.combo.Inst.defineMethod('constructContent',
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

        //  Capture the URI holding our data so that we can refer to it when
        //  getting or setting the display value.
        this.set('dataURI', TP.uc(dataInVal));

        //  Use the location of the 'value' URI that was supplied to us.
        valueLocation = valueURI.getLocation();

        //  Build the markup for the list, using the 'data' location for the
        //  'bind:in' and the 'value' location for the 'bind:io'.
        str = '<xctrls:list id="' + id + '_list"' +
                ' bind:in="{data: ' + dataInVal + '}"' +
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

TP.xctrls.combo.Inst.defineMethod('getDescendantsForSerialization',
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

TP.xctrls.combo.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @method getDisplayValue
     * @summary Gets the display, or visual, value of the receiver's node.
     * @returns {Object} The visual value of the receiver's UI node.
     */

    var initialVal,

        dataObj,

        value;

    initialVal = this.get('input').getValue();

    //  Since the popup might not be shown, we need to access the data directly.

    dataObj = this.get('dataURI').getContent();

    //  If we have a hash as our data, this will convert it into an Array of
    //  ordered pairs (i.e. an Array of Arrays) where the first item in each
    //  Array is the key and the second item is the value.
    if (TP.isHash(dataObj)) {
        value = dataObj.getKeysForValue(initialVal).first();
    } else if (TP.isPlainObject(dataObj)) {
        value = TP.hc(dataObj).getKeysForValue(initialVal).first();
    } else if (TP.isPair(dataObj.first())) {
        value = dataObj.detect(
                    function(pair) {
                        return pair.last() === initialVal;
                    });
        if (TP.isValid(value)) {
            value = value.first();
        }
    } else if (TP.isArray(dataObj)) {
        value = dataObj.indexOf(initialVal);
        if (value === TP.NOT_FOUND) {
            value = null;
        }
    }

    if (TP.notValid(value)) {
        value = initialVal;
    }

    return value;
});

//  ------------------------------------------------------------------------

TP.xctrls.combo.Inst.defineHandler('UIFocusComputation',
function(aSignal) {

    /**
     * @method handleUIFocusComputation
     * @param {TP.sig.UIFocusComputation} aSignal The signal that caused this
     *     handler to trip.
     * @returns {TP.xctrls.combo} The receiver.
     */

    var origin,

        triggerTargetTPElem,

        popupList,
        input,

        moveAction;

    //  Get the signal origin - this might be an item in the popupList
    origin = aSignal.getOrigin();

    //  The trigger target is the actual element that generated the signal.
    triggerTargetTPElem = TP.wrap(aSignal.at('trigger').getTarget());

    popupList = this.get('popupContentFirstElement');
    input = this.get('input');

    if (popupList.contains(origin) &&
        triggerTargetTPElem.identicalTo(input)) {

        aSignal.stopPropagation();

        moveAction = aSignal.getType().get('moveAction');

        this.signal('ClosePopup');

        input.moveFocus(moveAction, false);
    }

    return this;
},
{
    phase: TP.CAPTURING
});

//  ------------------------------------------------------------------------

TP.xctrls.combo.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @method setDisplayValue
     * @summary Sets the display, or visual, value of the receiver's node. You
     *     don't normally call this method directly, instead call setValue().
     * @param {Object} aValue The value to set.
     * @returns {TP.xctrls.combo} The receiver.
     */

    var dataObj,

        inputVal;

    //  Since the popup might not be shown, we need to access the data directly.

    dataObj = this.get('dataURI').getContent();

    if (TP.isHash(dataObj)) {
        inputVal = dataObj.at(aValue);
    } else if (TP.isPlainObject(dataObj)) {
        inputVal = TP.hc(dataObj).at(aValue);
    } else if (TP.isPair(dataObj.first())) {
        inputVal = dataObj.detect(
                    function(pair) {
                        return pair.first() === aValue;
                    });
        if (TP.isValid(inputVal)) {
            inputVal = inputVal.last();
        }
    } else if (TP.isArray(dataObj)) {
        inputVal = dataObj.at(aValue);
    }

    if (TP.notValid(inputVal)) {
        inputVal = aValue;
    }

    this.get('input').setValue(inputVal);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
