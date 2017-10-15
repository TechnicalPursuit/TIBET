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
 * @type {TP.sherpa.bindshud}
 */

//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.defineSubtype('bindshud');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.bindshud.Inst.defineMethod('focusOnTarget',
function(aTPElement) {

    /**
     * @method focusOnTarget
     * @summary Focuses the receiver onto the supplied target.
     * @param {TP.core.UIElementNode} aTPElement The element to focus the
     *     receiver on.
     * @returns {TP.sherpa.bindshud} The receiver.
     */

    var node,
        bindAncestors,

        bindingAttrNodes,

        select,

        info,

        last;

    node = aTPElement.getNativeNode();

    //  This will find ancestors whose elements are in the BIND namespace or
    //  which have attributes in the BIND namespace
    bindAncestors = TP.nodeGetAncestorsWithNS(node, TP.w3.Xmlns.BIND);

    bindingAttrNodes = TP.elementGetAttributeNodesInNS(
                                    node, null, TP.w3.Xmlns.BIND);

    select = false;
    if (node.namespaceURI === TP.w3.Xmlns.BIND ||
        TP.notEmpty(bindingAttrNodes)) {
        select = true;
        bindAncestors.unshift(node);
    }
    bindAncestors.reverse();

    info = TP.ac();

    bindAncestors.forEach(
        function(ansElem) {
            info.push(
                TP.ac(
                    TP.lid(ansElem, true),
                    TP.elementGetFullName(ansElem)));
        });

    this.setValue(info);

    //  Halo target is always last in the list, and always considered selected.
    last = this.get('listitems').last();
    if (select === true && TP.isValid(last)) {
        last.setAttribute('pclass:selected', 'true');
    }

    //  Scroll our list content to its bottom.
    this.get('listcontent').scrollTo(TP.BOTTOM);

    return this;
});

//  ------------------------------------------------------------------------
//  Handlers
//  ------------------------------------------------------------------------

TP.sherpa.bindshud.Inst.defineHandler('FocusHalo',
function(aSignal) {

    /**
     * @method handleFocusHalo
     * @summary Handles notifications of when the receiver wants to focus the
     *     halo.
     * @param {TP.sig.FocusHalo} aSignal The TIBET signal which triggered this
     *     method.
     * @returns {TP.sherpa.bindshud} The receiver.
     */

    var targetElem,

        data,
        indexInData,

        itemData,

        peerID,

        newTargetTPElem,

        halo,
        currentTargetTPElem;

    //  Grab the target and make sure it's an 'item' tile.
    targetElem = aSignal.getDOMTarget();
    if (!TP.elementHasClass(targetElem, 'item')) {
        return this;
    }

    //  Grab our data.
    data = this.get('data');

    //  Get the value of the target's indexInData attribute.
    indexInData = TP.elementGetAttribute(targetElem, 'indexInData', true);

    //  No indexInData? Exit here.
    if (TP.isEmpty(indexInData)) {
        return this;
    }

    //  Convert to a Number and retrieve the entry Array from our data
    indexInData = indexInData.asNumber();
    itemData = data.at(indexInData);

    peerID = itemData.at(0);

    newTargetTPElem = TP.bySystemId(peerID);

    //  If its a Node, then it was valid and it was found. Focus the halo.
    if (TP.isKindOf(newTargetTPElem, TP.core.Node) &&
        !TP.isType(newTargetTPElem)) {
        halo = TP.byId('SherpaHalo', this.getNativeDocument());

        currentTargetTPElem = halo.get('currentTargetTPElem');
        if (newTargetTPElem !== currentTargetTPElem) {

            if (TP.isValid(currentTargetTPElem) &&
                    currentTargetTPElem.haloCanBlur(halo)) {
                halo.blur();
            }

            //  Remove any highlighting that we were doing *on the new target*
            //  because we're going to focus the halo.
            newTargetTPElem.removeClass('sherpa-hud-highlight');

            if (newTargetTPElem.haloCanFocus(halo)) {
                //  Focus the halo on our new element, passing true to actually
                //  show the halo if it's hidden.
                halo.focusOn(newTargetTPElem, true);
            }
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.bindshud.Inst.defineHandler('InspectTarget',
function(aSignal) {

    /**
     * @method handleInspectTarget
     * @summary Handles notifications of when the receiver wants to inspect the
     *     current target and shift the Sherpa's inspector to focus it on that
     *     target.
     * @param {TP.sig.InspectTarget} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.bindshud} The receiver.
     */

    var targetElem,

        data,

        indexInData,
        itemData,

        peerID,
        targetTPElem,

        bindingExprs,
        expandedBindingExpr,

        sourceURI;

    //  Grab the target and make sure it's an 'item' tile.
    targetElem = aSignal.getDOMTarget();
    if (!TP.elementHasClass(targetElem, 'item')) {
        return this;
    }

    //  Grab our data.
    data = this.get('data');

    //  Get the value of the target's indexInData attribute.
    indexInData = TP.elementGetAttribute(targetElem, 'indexInData', true);

    //  No indexInData? Exit here.
    if (TP.isEmpty(indexInData)) {
        return this;
    }

    //  Convert to a Number and retrieve the entry Array from our data
    indexInData = indexInData.asNumber();
    itemData = data.at(indexInData);

    peerID = itemData.at(0);
    targetTPElem = TP.byId(peerID);

    bindingExprs = targetTPElem.getFullyExpandedBindingExpressions();
    expandedBindingExpr = bindingExprs.at(bindingExprs.getKeys().first());

    if (TP.isURIString(expandedBindingExpr)) {
        sourceURI = TP.uc(expandedBindingExpr);
        sourceURI = sourceURI.getPrimaryURI();

        this.signal('InspectObject',
                    TP.hc('targetObject', sourceURI,
                            'targetAspect', TP.id(sourceURI),
                            'showBusy', true));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.bindshud.Inst.defineHandler('ShowBindSource',
function(aSignal) {

    /**
     * @method handleShowBindSource
     * @summary Handles notifications of when the receiver wants to
     * @param {TP.sig.ShowBindSource} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.bindshud} The receiver.
     */

    var targetElem,

        data,

        indexInData,
        itemData,

        peerID,
        targetTPElem,

        bindingExprs,
        expandedBindingExpr,

        sourceURI,
        sourceResource,

        centerTPElem,
        centerTPElemPageRect,
        targetElemPageRect,

        showHandler,

        tileTPElem;

    //  Grab the target and make sure it's an 'item' tile.
    targetElem = aSignal.getDOMTarget();
    if (!TP.elementHasClass(targetElem, 'item')) {
        return this;
    }

    //  Grab our data.
    data = this.get('data');

    //  Get the value of the target's indexInData attribute.
    indexInData = TP.elementGetAttribute(targetElem, 'indexInData', true);

    //  No indexInData? Exit here.
    if (TP.isEmpty(indexInData)) {
        return this;
    }

    //  Convert to a Number and retrieve the entry Array from our data
    indexInData = indexInData.asNumber();
    itemData = data.at(indexInData);

    peerID = itemData.at(0);
    targetTPElem = TP.byId(peerID);

    bindingExprs = targetTPElem.getFullyExpandedBindingExpressions();
    expandedBindingExpr = bindingExprs.at(bindingExprs.getKeys().first());

    if (TP.isURIString(expandedBindingExpr)) {
        sourceURI = TP.uc(expandedBindingExpr);

        //  Prevent default *on the trigger signal* (which is the GUI signal -
        //  the contextmenu signal) so that any sort of 'right click' menu
        //  doesn't show.
        aSignal.at('trigger').preventDefault();

        sourceResource = sourceURI.getResource(
                                    TP.hc('resultType', TP.WRAP));
        sourceResource.then(
            function(sourceResult) {

                var mimeType,
                    formattedResult;

                if (TP.notEmpty(sourceResult)) {
                    if (TP.isKindOf(sourceResult, TP.core.Content)) {
                        mimeType = sourceResult.getContentMIMEType();
                    } else if (TP.isKindOf(sourceResult, TP.core.Node)) {
                        mimeType = TP.XML_ENCODED;
                    } else {
                        mimeType = TP.JSON_ENCODED;
                    }

                    if (mimeType === TP.XML_ENCODED) {
                        formattedResult = TP.sherpa.pp.runXMLModeOn(
                                            sourceResult.asString());
                    } else if (mimeType === TP.JSON_ENCODED) {
                        formattedResult = TP.sherpa.pp.runFormattedJSONModeOn(
                                            sourceResult.asJSONSource());
                    } else {
                        formattedResult = TP.str(sourceResult);
                    }
                } else {
                    formattedResult = 'No result for:<br/>' +
                                        sourceURI.getLocation();
                }

                tileTPElem.setContent(
                    TP.xhtmlnode('<span class="cm-s-elegant">' +
                                    formattedResult +
                                    '</span>'));
            });

        //  Use the same 'X' coordinate where the 'center' div is located in the
        //  page.
        centerTPElem = TP.byId('center', this.getNativeWindow());
        centerTPElemPageRect = centerTPElem.getPageRect();

        //  Use the 'Y' coordinate where the target element is located in the
        //  page.
        targetElemPageRect = TP.wrap(targetElem).getPageRect();

        showHandler =
            function(aTileTPElem) {
                var tileWidth,
                    xCoord,
                    offset;

                //  TODO: This is cheesy
                tileWidth = 300;
                offset = -2;

                xCoord = centerTPElemPageRect.getX() +
                            centerTPElemPageRect.getWidth() -
                            tileWidth +
                            offset;
                aTileTPElem.setContent(
                    TP.xhtmlnode('<span class="cm-s-elegant">' +
                                    'Fetching data...' +
                                    '</span>'));

                aTileTPElem.setPagePosition(
                    TP.pc(xCoord, targetElemPageRect.getY()));

                tileTPElem = aTileTPElem;
            };

        TP.bySystemId('Sherpa').showTileAt(
            'BindSummary_Tile', 'Bind Source Text', showHandler, showHandler);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
