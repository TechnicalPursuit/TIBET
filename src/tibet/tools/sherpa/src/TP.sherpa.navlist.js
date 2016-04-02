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

TP.sherpa.navlist.addTraits(TP.core.D3Tag);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineAttribute(
        'listcontent',
        {value: TP.cpc('> .content', TP.hc('shouldCollapse', true))});

//  ------------------------------------------------------------------------
//  Instance Methods
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

TP.sherpa.navlist.Inst.defineMethod('setSelectedItem',
function(itemLabel) {

    var listContentElem,
        selectedItems,
        listItem;

    listContentElem = this.get('listcontent').getNativeNode();

    selectedItems = TP.byCSSPath('.selected', listContentElem, false, false);

    if (TP.notEmpty(selectedItems)) {
        selectedItems.perform(
                function(anElement) {
                    TP.elementRemoveClass(anElement, 'selected');
                });
    }

    listItem = TP.nodeEvaluateXPath(
                    listContentElem,
                    './/*[contains(., "' + itemLabel + '")]',
                    TP.FIRST_NODE);

    if (TP.isElement(listItem)) {
        TP.elementAddClass(listItem, 'selected');
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineHandler('ItemSelected',
function(aSignal) {

    var wrappedDOMTarget,
        itemName;

    wrappedDOMTarget = TP.wrap(aSignal.getDOMTarget());

    if (wrappedDOMTarget.hasAttribute('itemName')) {
        itemName = wrappedDOMTarget.getAttribute('itemName');
    } else {
        itemName = wrappedDOMTarget.getTextContent();
    }

    this.signal('TraverseObject',
                TP.hc('targetID', itemName, 'selectionSignal', aSignal));

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
