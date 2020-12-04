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

TP.xctrls.combo.Inst.defineAttribute('comboInput',
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

TP.xctrls.combo.Inst.defineMethod('focus',
function(moveAction) {

    /**
     * @method focus
     * @summary Focuses the receiver for keyboard input.
     * @description Whenever we are focused, we focus our input field.
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
     *          TP.PRECEDING.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var input;

    input = this.get('comboInput');

    return input.focus(moveAction);
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
     * @returns {Object|null} The visual value of the receiver's UI node.
     */

    var val;

    //  Our display value is whatever the label is displaying. That might be a
    //  blank if the value was set to something that's not in our list.

    val = this.get('comboInput').getValue();
    if (TP.isEmpty(val)) {
        val = null;
    }

    return val;
});

//  ------------------------------------------------------------------------

TP.xctrls.combo.Inst.defineHandler('UIDidClose',
function(aSignal) {

    /**
     * @method handleUIDidClose
     * @param {TP.sig.UIDidClose} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.xctrls.combo} The receiver.
     */

    //  The popupList has just closed. After the next repaint focus our input
    //  field.
    (function() {
        return this.focus();
    }.bind(this)).queueAfterNextRepaint(this.getNativeWindow());

    return this;
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
        signame,

        popupList;

    //  Get the signal origin - this might be an item in the popupList
    origin = aSignal.getOrigin();
    signame = aSignal.getSignalName();

    popupList = this.get('popupContentFirstElement');

    //  If the popupList is valid (which means it's open) and it contains signal
    //  origin, then that means it was a 'focus shifting' signal happening
    //  *inside* of the popupList content. Stop propagation up this responder
    //  chain and send it over to the popupList to handle.
    if (TP.isValid(popupList) && popupList.contains(origin)) {
        aSignal.stopPropagation();

        return popupList[TP.composeHandlerName(signame)](aSignal);
    }

    //  Otherwise, it happened inside of ourself - just call up to our
    //  supertype.
    return this.callNextMethod();
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

    var content,

        contentValue,
        contentLabel;

    content = this.get('popupContentFirstElement');

    if (TP.isValid(content)) {
        content.setDisplayValue(aValue);

        //  Grab the display value and trying to find a matching item in our
        //  list.
        contentValue = content.getDisplayValue();

        //  If we found a matching item, we'll use it's label text as our
        //  input's value. Otherwise, we'll set our input's value to the empty
        //  String.
        contentLabel = content.getLabelForValue(contentValue);
        contentLabel = TP.ifEmpty(contentLabel, '');

        this.get('comboInput').setValue(contentLabel);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
