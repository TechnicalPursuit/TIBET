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

        contentTPElem;

    id = this.getLocalID();

    bindingInfo = this.getBindingInfoFrom(this.getAttribute('bind:in'));
    if (bindingInfo.hasKey('data')) {
        dataInVal = bindingInfo.at('data').at('dataExprs').first();

        valueLocation = valueURI.getLocation();

        contentTPElem = TP.tpelem(
                            '<xctrls:list id="' + id + '_list"' +
                            ' bind:in="{data:' + dataInVal + '}"' +
                            ' on:dragup="TP.sig.UIDeactivate"' +
                            ' bind:io="{value: ' + valueLocation + '}"/>');
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

    return this.get('label').getContent();
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

    this.get('label').setContent(aValue);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
