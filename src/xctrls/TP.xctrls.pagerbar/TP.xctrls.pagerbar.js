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

TP.xctrls.itemset.defineSubtype('xctrls:pagerbar');

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
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.pagerbar.Inst.defineHandler('UIDeactivate',
function(aSignal) {

    /**
     * @method handleUIDeactivate
     * @param {TP.sig.UIDeactivate} aSignal The signal that caused this handler
     *     to trip.
     * @returns {TP.xctrls.pagerbar} The receiver.
     */

    var domTarget,
        wrappedDOMTarget,

        valueTPElem,

        newValue;

    if (this.shouldPerformUIHandler(aSignal)) {

        //  Get the DOM target as the event system originally sees it. If the
        //  event happened inside of our element with a '.close_mark' class,
        //  then we just return here. The signal dispatched from that element
        //  will handle the rest.
        domTarget = aSignal.getDOMTarget();

        //  Get the resolved DOM target - this should be the list item that was
        //  activated (i.e. because of a mouse up or a Enter key up, etc)
        domTarget = aSignal.getResolvedDOMTarget();

        //  Wrap it and if it's actually us (the list - maybe because the user
        //  clicked in a tiny area that doesn't contain a list item), we're not
        //  interested.
        wrappedDOMTarget = TP.wrap(domTarget);
        if (wrappedDOMTarget === this) {
            return this;
        }

        //  Grab the value element of the list item.
        valueTPElem = wrappedDOMTarget.get('xctrls|value');
        if (TP.notValid(valueTPElem)) {
            return this;
        }

        //  And it's text content.
        newValue = valueTPElem.getTextContent();

        switch (newValue) {

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
                newValue = newValue.asNumber();
                if (TP.isNumber(newValue)) {
                    this.dispatch('TP.sig.UIPageSet',
                                    null,
                                    TP.hc('pageNum', newValue));
                }

                break;
        }

        //  Make sure that we stop propagation here so that we don't get any
        //  more responders further up in the chain processing this.
        aSignal.stopPropagation();
    }

    return this;
});

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

    //  Create an Array from a Range, starting at 1.
    pageData = (1).to(totalPages).asArray();

    //  Get the Array as pairs of Arrays (in the form of: [index, value])
    pageData = pageData.getKVPairs();

    //  Unshift the starting entries on the front, if the author wanted them.

    //  NB: This looks to be in a strange order, but only because of how unshift
    //  works.
    if (this.hasAttribute('nextprevious')) {
        pageData.unshift(TP.ac('previous', 'Previous'));
    }

    if (this.hasAttribute('startend')) {
        pageData.unshift(TP.ac('start', 'Start'));
    }

    //  Push the ending entries on the back, if the author wanted them.

    if (this.hasAttribute('nextprevious')) {
        pageData.push(TP.ac('next', 'Next'));
    }

    if (this.hasAttribute('startend')) {
        pageData.push(TP.ac('end', 'End'));
    }

    return this.callNextMethod(pageData, shouldSignal);
});

//  ------------------------------------------------------------------------

TP.xctrls.pagerbar.Inst.defineMethod('setValue',
function(aValue, shouldSignal) {

    /**
     * @method setValue
     * @summary Sets the value of the receiver's node. For a UI element this
     *     method will ensure any display formatters are invoked. NOTE that this
     *     method does not update the receiver's bound value if it's a bound
     *     control. In fact, this method is used in response to a change in the
     *     bound value to update the display value, so this method should avoid
     *     changes to the bound value to avoid recursions.
     * @param {Object} aValue The value to set the 'value' of the node to.
     * @param {Boolean} shouldSignal Should changes be notified. If false
     *     changes are not signaled. Defaults to this.shouldSignalChange().
     * @returns {TP.xctrls.pagerbar} The receiver.
     */

    var val;

    //  Because this is expecting a 1-based value, but we're driven by a 0-based
    //  data set, we need to subtract 1.
    val = aValue.asNumber();

    if (!TP.isNumber(val)) {
        return this;
    }

    val -= 1;

    return this.callNextMethod(val, shouldSignal);
});

//  ========================================================================
//  TP.xctrls.pageritem
//  ========================================================================

TP.xctrls.item.defineSubtype('xctrls:pageritem');

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
