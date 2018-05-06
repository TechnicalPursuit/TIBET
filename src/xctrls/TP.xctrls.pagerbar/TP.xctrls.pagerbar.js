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
 * @type {TP.xctrls.pagerbar}
 */

//  ------------------------------------------------------------------------

TP.xctrls.itemset.defineSubtype('pagerbar');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

/**
 * The tag name of the tag to use for each item if there is no template.
 * @type {String}
 */
TP.xctrls.pagerbar.Type.defineAttribute('defaultItemTagName',
                                        'xctrls:pageritem');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.pagerbar.Inst.defineAttribute('totalPages');
TP.xctrls.pagerbar.Inst.defineAttribute('currentPage');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.pagerbar.Inst.defineMethod('setData',
function(aDataObject, shouldSignal) {

    /**
     * @method setData
     * @summary Sets the receiver's data object to the supplied object.
     * @param {Object} aDataObject The object to set the receiver's internal
     *     data to.
     * @param {Boolean} [shouldSignal=true] Whether or not to signal change.
     * @returns {TP.xctrls.pagerbar} The receiver.
     */

    var dataObj,

        pagingSize,
        totalPages,

        pageData;

    //  Make sure to unwrap this from any TP.core.Content objects, etc.
    dataObj = TP.val(aDataObject);

    pagingSize = this.getAttribute('pagingsize').asNumber();
    if (TP.isNaN(pagingSize)) {
        pagingSize = 1;
    }

    totalPages = (dataObj.getSize() / pagingSize).ceil();
    this.set('totalPages', totalPages);

    //  Create an Array from a Range, starting at 1.
    pageData = (1).to(totalPages).asArray();

    //  Get the Array as pairs of Arrays (in the form of: [index, value])
    pageData = pageData.getKVPairs();

    //  Unshift the starting entries on the front
    pageData.unshift(
            TP.ac('start', 'Start'),
            TP.ac('previous', 'Previous'));

    //  Push the ending entries on the back
    pageData.push(
            TP.ac('next', 'Next'),
            TP.ac('end', 'End'));

    return this.callNextMethod(pageData, shouldSignal);
});

//  ------------------------------------------------------------------------

TP.xctrls.pagerbar.Inst.defineMethod('select',
function(aValue, anIndex, shouldSignal) {

    /**
     * @method select
     * @summary Selects the element which has the provided value (if found) or
     *     is at the provided index.
     *     Note that this method is roughly identical to setDisplayValue() with
     *     the exception that, if the receiver allows multiple selection, this
     *     method does not clear existing selections when processing the
     *     value(s) provided.
     * @param {Object} [aValue] The value to select. Note that this can be an
     *     Array.
     * @param {Number} [anIndex] The index of the value in the receiver's data
     *     set.
     * @param {Boolean} [shouldSignal=true] Should selection changes be signaled.
     *     If false changes to the selection are not signaled. Defaults to true.
     * @returns {Boolean} Whether or not a selection was selected.
     */

    var didChange,
        value;

    didChange = this.callNextMethod();

    if (didChange) {

        value = this.get('value');

        switch (value) {

            case 'start':
                this.dispatch('TP.sig.UIPageStart');
                break;

            case 'previous':
                this.dispatch('TP.sig.UIPagePrevious');
                break;

            case 'next':
                this.dispatch('TP.sig.UIPageNext');
                break;

            case 'end':
                this.dispatch('TP.sig.UIPageEnd');
                break;

            default:
                //  Make sure this is a Number before dispatching the signal.
                value = value.asNumber();
                if (TP.isNumber(value)) {
                    this.dispatch('TP.sig.UIPageSet',
                                    null,
                                    TP.hc('pageNum', value));
                }
                break;
        }
    }

    return this;
}, {
    patchCallee: true
});

//  ========================================================================
//  TP.xctrls.pageritem
//  ========================================================================

TP.xctrls.item.defineSubtype('pageritem');

//  Note how this property is TYPE_LOCAL, by design.
TP.xctrls.pageritem.defineAttribute('styleURI', TP.NO_RESULT);
TP.xctrls.pageritem.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.xctrls.pageritem.Type.defineAttribute('opaqueCapturingSignalNames',
        TP.ac('TP.sig.DOMMouseDown',
                'TP.sig.DOMMouseUp',
                'TP.sig.DOMMouseOver',
                'TP.sig.DOMMouseOut',
                'TP.sig.DOMFocus',
                'TP.sig.DOMBlur'));

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.pageritem.Inst.defineAttribute('label',
    TP.xpc('string(./xctrls:label)', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.pageritem.Inst.defineMethod('getDescendantsForSerialization',
function() {

    /**
     * @method getDescendantsForSerialization
     * @summary Returns an Array of descendants of the receiver to include in
     *     the receiver's serialization. Typically, these will be nodes that
     *     will be 'slotted' into the receiver by the author and not nodes that
     *     the template generated 'around' the slotted nodes.
     * @returns {TP.core.node[]} An Array of descendant nodes to serialize.
     */

    var selectedDescendants;

    selectedDescendants = this.get('./*[local-name() = \'template\']');

    selectedDescendants = TP.expand(selectedDescendants);

    return selectedDescendants;
});

//  ------------------------------------------------------------------------

TP.xctrls.pageritem.Inst.defineMethod('getValue',
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
//  end
//  ========================================================================
