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

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineAttribute(
        'listcontent',
        {value: TP.cpc('> .content', TP.hc('shouldCollapse', true))});

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.navlist.Type.defineMethod('tagAttachComplete',
function(aRequest) {

    /**
     * @method tagAttachComplete
     * @summary Processes the tag once it's been fully processed. Because
     *     tibet:data tag content drives binds and we need to notify even
     *     without a full page load we process through setContent once the
     *     attachment is complete (instead of during tagAttachData).
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem;

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    tpElem = TP.wrap(elem);

    tpElem.render();

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.navlist.Inst.defineMethod('render',
function() {

    /**
     * @method render
     */

    var targetList,

        dataSrcAttr,
        dataURI,
        data,

        items;

    dataSrcAttr = this.getAttribute('src');
    dataURI = TP.uc(dataSrcAttr);

    data = dataURI.getResource().get('result');

    targetList = this.get('listcontent');

    items = TP.extern.d3.
                select(TP.unwrap(targetList)).
                selectAll('xhtml:li').
                data(data);

    items.enter().append('xhtml:li');

    if (TP.isArray(data.first())) {
        items.text(function(d) {return d[0]; }).
                attr('itemName', function(d) {return d[1]; });
    } else {
        items.text(function(d) {return d; });
    }

    items.exit().remove();

    return this;
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
