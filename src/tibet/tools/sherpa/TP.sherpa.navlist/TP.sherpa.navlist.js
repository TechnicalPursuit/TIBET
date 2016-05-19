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
TP.sherpa.navlist.addTraits(TP.core.D3ScrollingList);

TP.sherpa.navlist.Inst.resolveTrait('select', TP.core.SelectingUIElementNode);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineAttribute(
    'scroller',
    {value: TP.cpc('> .scroller', TP.hc('shouldCollapse', true))});

TP.sherpa.navlist.Inst.defineAttribute(
    'listcontent',
    {value: TP.cpc('> .scroller > .content', TP.hc('shouldCollapse', true))});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineHandler('ItemSelected',
function(aSignal) {

    var domTarget,
        wrappedDOMTarget,

        label,
        value;

    domTarget = aSignal.getDOMTarget();
    wrappedDOMTarget = TP.wrap(domTarget);

    label = wrappedDOMTarget.getTextContent();

    if (wrappedDOMTarget.hasAttribute('itemName')) {
        value = wrappedDOMTarget.getAttribute('itemName');
    } else {
        value = label;
    }

    this.select(label);

    this.signal('FocusInspectorForBrowsing',
                TP.hc('targetAspect', value,
                        'domTarget', domTarget));

    return this;
});

//  ------------------------------------------------------------------------
//  TP.core.D3Tag Methods
//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineMethod('buildNewContent',
function(enterSelection) {

    /**
     * @method buildNewContent
     * @summary Builds new content onto the receiver by appending or inserting
     *     content into the supplied d3.js 'enter selection'.
     * @param {TP.extern.d3.selection} enterSelection The d3.js enter selection
     *     that new content should be appended to.
     * @returns {TP.core.D3Tag} The receiver.
     */

    var data,

        attrSelectionInfo,
        newContent,

        currentValue;

    data = this.get('data');

    attrSelectionInfo = this.getRowAttrSelectionInfo();
    newContent = enterSelection.append('li').attr(attrSelectionInfo.first(),
                                                    attrSelectionInfo.last());

    currentValue = this.get('$currentValue');

    if (TP.isArray(data.first())) {
        newContent.text(
                function(d, i) {
                    if (d[0] === currentValue) {
                        TP.elementSetAttribute(
                                this, 'pclass:selected', true, true);
                    }

                    return d[0];
                }).attr('itemName', function(d) {return d[1]; });
    } else {
        newContent.text(
                function(d, i) {
                    if (d === currentValue) {
                        TP.elementSetAttribute(
                                this, 'pclass:selected', true, true);
                    }

                    return d;
                });
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

TP.sherpa.navlist.Inst.defineMethod('getRootUpdateSelection',
function(rootSelection) {

    /**
     * @method getRootUpdateSelection
     * @summary Creates the 'root' update selection that will be used as the
     *     starting point to begin d3.js drawing operations.
     * @returns {d3.Selection} The receiver.
     */

    return rootSelection.selectAll('li');
});

//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineMethod('getRowHeight',
function() {

    /**
     * @method getRowHeight
     * @summary Returns the height of each element of the row. This should
     *     correspond to the 'offsetHeight' of each row when the list is
     *     rendered.
     * @returns {Number} The height of a row when rendered.
     */

    return 20;
});

//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineMethod('getSelectionContainer',
function() {

    /**
     * @method getSelectionContainer
     * @summary Returns the Element that will be used as the 'root' to
     *     add/update/remove content to/from using d3.js functionality. By
     *     default, this returns the receiver's native Element.
     * @returns {Element} The element to use as the container for d3.js
     *     enter/update/exit selections.
     */

    return TP.unwrap(this.get('listcontent'));
});

//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineMethod('getScrollingContainer',
function() {

    /**
     * @method getScrollingContainer
     * @summary Returns the Element that will be used as the 'scrolling
     *     container'. This is the element that will be the container of the
     *     list of items and will be translated to perform scrolling
     * @returns {Element} The element to use as the scrolling container.
     */

    return TP.unwrap(this.get('scroller'));
});

//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineMethod('updateExistingContent',
function(updateSelection) {

    /**
     * @method updateExistingContent
     * @summary Updates any existing content in the receiver by altering the
     *     content in the supplied d3.js 'update selection'.
     * @param {TP.extern.d3.selection} updateSelection The d3.js update
     *     selection that existing content should be altered in.
     * @returns {TP.core.D3Tag} The receiver.
     */

    var data,
        newContent,

        currentValue;

    data = this.get('data');
    newContent = updateSelection.select('li');

    currentValue = this.get('$currentValue');

    if (TP.isArray(data.first())) {
        newContent.text(
                function(d, i) {
                    if (d[0] === currentValue) {
                        TP.elementSetAttribute(
                                this, 'pclass:selected', true, true);
                    }

                    return d[0];
                }).attr('itemName', function(d) {return d[1]; });
    } else {
        newContent.text(
                function(d, i) {
                    if (d === currentValue) {
                        TP.elementSetAttribute(
                                this, 'pclass:selected', true, true);
                    }

                    return d;
                });
    }

    return this;
});

//  ------------------------------------------------------------------------
//  TP.core.SelectingUIElement Methods
//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineMethod('allowsMultiples',
function() {

    /**
     * @method allowsMultiples
     * @summary Returns true by default.
     * @returns {Boolean} Whether or not the receiver allows multiple selection.
     */

    return false;
});

//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineMethod('getSelectedElements',
function() {

    /**
     * @method getSelectedElements
     * @summary Returns an Array TP.core.UIElementNodes that are 'selected'
     *     within the receiver.
     * @returns {TP.core.UIElementNode[]} The Array of selected
     *     TP.core.UIElementNodes.
     */

    return TP.byCSSPath('li[pclass|selected]', this);
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

    /**
     * @method select
     * @summary Selects the option with the value provided if found. Note that
     *     this method is roughly identical to setDisplayValue with the
     *     exception that this method does not clear existing selections when
     *     processing the value(s) provided. When no specific values are
     *     provided this method will selectAll.
     * @param {Object} aValue The value to select. Note that this can be an
     *     array.
     * @exception TP.sig.InvalidOperation
     * @exception TP.sig.InvalidValueElements
     * @returns {Boolean} Whether or not a selection was selected.
     */

    var retVal,
        selectedElements;

    retVal = this.callNextMethod();

    selectedElements = this.getSelectedElements();

    if (TP.notEmpty(selectedElements)) {

        selectedElements.last().smartScrollIntoView(TP.VERTICAL, true);
    }

    return retVal;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
