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
 * @type {TP.sherpa.breadcrumb}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('breadcrumb');

TP.sherpa.breadcrumb.addTraits(TP.core.D3Tag);

TP.sherpa.breadcrumb.Inst.defineAttribute(
        'listcontent',
        {value: TP.cpc('> .content', TP.hc('shouldCollapse', true))});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.breadcrumb.Inst.defineMethod('getLabel',
function(anItem) {

    /**
     * @method getLabel
     * @summary
     * @param
     * @returns {String}
     */

    return TP.name(anItem);
});

//  ------------------------------------------------------------------------

TP.sherpa.breadcrumb.Inst.defineHandler('DOMClick',
function(aSignal) {

    /**
     * @method handleDOMClick
     * @param {TP.sig.DOMClick} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.breadcrumb} The receiver.
     */

    var target,
        itemNumber,

        hierarchyData,
        item;

    target = aSignal.getTarget();

    if (TP.isElement(target)) {
        itemNumber = TP.elementGetAttribute(target, 'itemNum', true);
        itemNumber = itemNumber.asNumber();

        if (TP.isNumber(itemNumber)) {

            hierarchyData = TP.getDataForTool(this.get('data'), 'breadcrumb');
            item = hierarchyData.at(itemNumber).last();

            this.signal('BreadcrumbClick', TP.hc('item', item));
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.breadcrumb.Inst.defineHandler('DOMMouseOver',
function(aSignal) {

    /**
     * @method handleDOMMouseOver
     * @param {TP.sig.DOMMouseOver} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.breadcrumb} The receiver.
     */

    var target,
        itemNumber,

        hierarchyData,
        item;

    target = aSignal.getTarget();

    if (TP.isElement(target)) {
        itemNumber = TP.elementGetAttribute(target, 'itemNum', true);
        itemNumber = itemNumber.asNumber();

        if (TP.isNumber(itemNumber)) {

            hierarchyData = TP.getDataForTool(this.get('data'), 'breadcrumb');
            item = hierarchyData.at(itemNumber).last();

            this.signal('BreadcrumbOver', TP.hc('item', item));
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.breadcrumb.Inst.defineHandler('DOMMouseOut',
function(aSignal) {

    /**
     * @method handleDOMMouseOut
     * @param {TP.sig.DOMMouseOut} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.breadcrumb} The receiver.
     */

    var target,
        itemNumber,

        hierarchyData,
        item;

    target = aSignal.getTarget();

    if (TP.isElement(target)) {
        itemNumber = TP.elementGetAttribute(target, 'itemNum', true);
        itemNumber = itemNumber.asNumber();

        if (TP.isNumber(itemNumber)) {

            hierarchyData = TP.getDataForTool(this.get('data'), 'breadcrumb');
            item = hierarchyData.at(itemNumber).last();

            this.signal('BreadcrumbOut', TP.hc('item', item));
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.breadcrumb.Inst.defineMethod('setAttrHidden',
function(beHidden) {

    /**
     * @method setAttrHidden
     * @param {Boolean} beHidden
     * @returns {TP.sherpa.breadcrumb} The receiver.
     */

    if (TP.bc(this.getAttribute('hidden')) === beHidden) {
        return this;
    }

    if (TP.isTrue(beHidden)) {
        this.ignore(this, 'TP.sig.DOMClick');
        this.ignore(this, 'TP.sig.DOMMouseOver');
        this.ignore(this, 'TP.sig.DOMMouseOut');

    } else {
        this.observe(this, 'TP.sig.DOMClick');
        this.observe(this, 'TP.sig.DOMMouseOver');
        this.observe(this, 'TP.sig.DOMMouseOut');
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  TP.core.D3Tag Methods
//  ------------------------------------------------------------------------

TP.sherpa.breadcrumb.Inst.defineMethod('buildNewContent',
function(enterSelection) {

    /**
     * @method buildNewContent
     * @summary Builds new content onto the receiver by appending or inserting
     *     content into the supplied d3.js 'enter selection'.
     * @param {TP.extern.d3.selection} enterSelection The d3.js enter selection
     *     that new content should be appended to.
     * @returns {TP.core.D3Tag} The receiver.
     */

    var thisArg;

    thisArg = this;

    enterSelection.append('li').
        html(function(d, i) {
            return '<a href="#" itemNum="' + i + '">' +
                        thisArg.getLabel(d[1]) +
                    '</a>';
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.breadcrumb.Inst.defineMethod('computeSelectionData',
function() {

    /**
     * @method computeSelectionData
     * @summary Returns the data that will actually be used for binding into the
     *     d3.js selection.
     * @description The selection data may very well be different than the bound
     *     data that uses TIBET data binding to bind data to this control. This
     *     method allows the receiver to transform it's 'data binding data' into
     *     data appropriate for d3.js selections.
     * @returns {TP.core.D3Tag} The receiver.
     */

    return TP.getDataForTool(this.get('data'), 'breadcrumb');
});

//  ------------------------------------------------------------------------

TP.sherpa.breadcrumb.Inst.defineMethod('getKeyFunction',
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

    var keyFunc;

    keyFunc = function(d) {return TP.id(d[1]); };

    return keyFunc;
});

//  ------------------------------------------------------------------------

TP.sherpa.breadcrumb.Inst.defineMethod('getRootUpdateSelection',
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

TP.sherpa.breadcrumb.Inst.defineMethod('getSelectionContainer',
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

TP.sherpa.breadcrumb.Inst.defineMethod('updateExistingContent',
function(updateSelection) {

    /**
     * @method updateExistingContent
     * @summary Updates any existing content in the receiver by altering the
     *     content in the supplied d3.js 'update selection'.
     * @param {TP.extern.d3.selection} updateSelection The d3.js update
     *     selection that existing content should be altered in.
     * @returns {TP.core.D3Tag} The receiver.
     */

    var thisArg;

    thisArg = this;

    updateSelection.html(
        function(d, i) {
            return '<a href="#" itemNum="' + i + '">' +
                        thisArg.getLabel(d[1]) +
                    '</a>';
        });

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
