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
 * @type {TP.sherpa.navlist}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('navlist');

TP.sherpa.navlist.addTraits(TP.core.SelectingUIElementNode);
TP.sherpa.navlist.addTraits(TP.core.D3Tag);

TP.sherpa.navlist.Inst.resolveTrait('select', TP.core.SelectingUIElementNode);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineAttribute(
        'listcontent',
        {value: TP.cpc('> .content', TP.hc('shouldCollapse', true))});

TP.sherpa.navlist.Inst.defineAttribute('$currentValue');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineHandler('ItemSelected',
function(aSignal) {

    var wrappedDOMTarget,

        label,
        value;

    wrappedDOMTarget = TP.wrap(aSignal.getDOMTarget());

    label = wrappedDOMTarget.getTextContent();

    if (wrappedDOMTarget.hasAttribute('itemName')) {
        value = wrappedDOMTarget.getAttribute('itemName');
    } else {
        value = wrappedDOMTarget.getTextContent();
    }

    this.select(label);

    this.signal('TraverseObject',
                TP.hc('targetID', value, 'selectionSignal', aSignal));

    return this;
});

//  ------------------------------------------------------------------------
//  TP.core.D3Tag Methods
//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineMethod('drawSelection',
function(selection) {

    /**
     * @method drawSelection
     * @summary Draws content by altering the content provided in the supplied
     *     selection.
     * @param {TP.extern.d3.selection} selection The d3.js selection that
     *     content should be updated in.
     * @returns {TP.core.D3Tag} The receiver.
     */

    var data;

    data = this.get('data');

    if (TP.isArray(data.first())) {
        selection.text(function(d) {return d[0]; }).
                        attr('itemName', function(d) {return d[1]; });
    } else {
        selection.text(function(d) {return d; });
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineMethod('getKeyFunction',
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

    var data,
        keyFunc;

    data = this.get('data');

    if (TP.isArray(data.first())) {
        keyFunc = function(d) {return d[0]; };
    } else {
        keyFunc = function(d) {return d; };
    }

    return keyFunc;
});

//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineMethod('getRepeatingSelector',
function() {

    /**
     * @method getRepeatingSelector
     * @summary Returns the selector to both select and generate repeating items
     *     under the receiver.
     * @returns {String} The selector to use to select and/or generate repeating
     *     items.
     */

    return 'li';
});

//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineMethod('getSelectionRoot',
function() {

    /**
     * @method getSelectionRoot
     * @summary Returns the Element that will be used as the 'root' to
     *     add/update/remove content to/from using d3.js functionality. By
     *     default, this returns the receiver's native Element.
     * @returns {Element} The element to use as a root for d3.js
     *     enter/update/exit selections.
     */

    return TP.unwrap(this.get('listcontent'));
});

//  ------------------------------------------------------------------------
//  TP.core.SelectingUIElement Methods
//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineMethod('allowsMultiples',
function() {

    return false;
});

//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineMethod('getValueElements',
function() {

    /**
     * @method getValueElements
     * @summary Returns an Array TP.core.UIElementNodes that share a common
     *     'value object' with the receiver. That is, a change to the 'value' of
     *     the receiver will also change the value of one of these other
     *     TP.core.UIElementNodes. By default, this method will return other
     *     elements that are part of the same 'tibet:group'.
     * @returns {TP.core.UIElementNode[]} The Array of shared value items.
     */

    return this.get('listcontent').getChildElements();
});

//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineMethod('select',
function(aValue) {

    var oldValue;

    if (TP.notEmpty(oldValue = this.get('$currentValue'))) {
        this.deselect(oldValue);
    }

    this.callNextMethod();
    this.set('$currentValue', aValue);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
