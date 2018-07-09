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
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.bindshud.Type.defineMethod('tagAttachComplete',
function(aRequest) {

    /**
     * @method tagAttachComplete
     * @summary Executes once the tag has been fully processed and its
     *     attachment phases are fully complete.
     * @description Because tibet:data tag content drives binds and we need to
     *     notify even without a full page load, we notify from here once the
     *     attachment is complete (instead of during tagAttachData).
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem,

        eastDrawer,
        moveTileFunc;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    tpElem = TP.wrap(elem);

    //  Grab the east drawer and define a function that, when the drawer
    //  animates back and forth into and out of its collapsed position that, if
    //  a tile is showing, will move the tile to the edge of the drawer.
    eastDrawer = TP.byId('east', tpElem.getNativeDocument());

    moveTileFunc = function(transitionSignal) {

        var tileTPElem,

            centerElem,
            centerElemPageRect,

            tileWidth,
            xCoord;

        tileTPElem = TP.byId('BindSummary_Tile',
                                eastDrawer.getNativeDocument());
        if (TP.isValid(tileTPElem) && tileTPElem.isVisible()) {
            //  Grab the center element and it's page rectangle.
            centerElem = TP.byId('center', eastDrawer.getNativeWindow());
            centerElemPageRect = centerElem.getPageRect();

            tileWidth = tileTPElem.getWidth();

            xCoord = centerElemPageRect.getX() +
                        centerElemPageRect.getWidth() -
                        tileWidth;

            tileTPElem.setPageX(xCoord);
        }
    };

    moveTileFunc.observe(eastDrawer, 'TP.sig.DOMTransitionEnd');

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.bindshud.Inst.defineAttribute('highlighted');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.bindshud.Inst.defineMethod('addIO',
function(aSignal) {

    /**
     * @method addIO
     * @summary Invoked when a user has decided to 'Add I/O' from the
     *     context menu for hud sidebar panels.
     * @param {TP.sig.SelectMenuItem} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.bindshud} The receiver.
     */

    TP.alert('Called addIO');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.bindshud.Inst.defineMethod('addScope',
function(aSignal) {

    /**
     * @method addScope
     * @summary Invoked when a user has decided to 'Add Scope' from the
     *     context menu for hud sidebar panels.
     * @param {TP.sig.SelectMenuItem} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.bindshud} The receiver.
     */

    TP.alert('Called addScope');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.bindshud.Inst.defineMethod('assistItem',
function(aSignal) {

    /**
     * @method assistItem
     * @summary Invoked when a user has decided to 'Assist' an item from the
     *     context menu for hud sidebar items.
     * @param {TP.sig.SelectMenuItem} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.bindshud} The receiver.
     */

    var contextMenuSignal,

        targetElem,

        indexInData,

        data,
        itemData,

        peerID,
        sourceTPElem,

        bindingExprs,
        expandedBindingExpr,

        sourceURI,
        sourceResource,

        centerTPElem,
        centerTPElemPageRect,
        targetElemPageRect,

        tileTPElem,
        newContentTPElem,

        sheet,
        mainRule,

        tileWidth,
        xCoord;

    //  Although we get the 'item selected' signal as a parameter, what we
    //  really want was the signal that triggered the opening of the context
    //  menu. We want the target of that signal (either the hud item or the hud
    //  panel itself).
    contextMenuSignal = this.get('$lastContextMenuSignal');

    //  Grab the target and make sure it's an 'item' tile.
    targetElem = contextMenuSignal.getDOMTarget();
    if (!TP.elementHasClass(targetElem, 'item')) {
        return this;
    }

    //  Get the value of the target's indexInData attribute.
    indexInData = TP.elementGetAttribute(targetElem, 'indexInData', true);

    //  No indexInData? Exit here.
    if (TP.isEmpty(indexInData)) {
        return this;
    }

    //  Prevent default *on the trigger signal* (which is the GUI signal - the
    //  contextmenu signal) so that any sort of 'right click' menu doesn't show.
    aSignal.at('trigger').preventDefault();

    //  Convert to a Number.
    indexInData = indexInData.asNumber();

    //  Grab our data and retrieve the entry Array from our data.
    data = this.get('data');
    itemData = data.at(indexInData);

    peerID = itemData.at(0);
    sourceTPElem = TP.byId(peerID);

    bindingExprs = sourceTPElem.getFullyExpandedBindingExpressions();
    expandedBindingExpr = bindingExprs.at(bindingExprs.getKeys()).first();

    if (!TP.isURIString(expandedBindingExpr)) {
        return this;
    }

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
                } else if (TP.isKindOf(sourceResult, TP.dom.Node)) {
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

    //  ---

    tileTPElem = TP.byId('BindSummary_Tile', this.getNativeWindow());
    if (TP.notValid(tileTPElem)) {

        tileTPElem = TP.bySystemId('Sherpa').makeTile('BindSummary_Tile');
        tileTPElem.setHeaderText('Bind Source Text');

        newContentTPElem = tileTPElem.setContent(
                                TP.getContentForTool(
                                    sourceTPElem,
                                    'BindsHUDTileBody'));

        newContentTPElem.awaken();

        sheet = this.getStylesheetForStyleResource();
        mainRule = TP.styleSheetGetStyleRulesMatching(
                            sheet,
                            '#BindSummary_Tile').first();
        tileWidth = mainRule.style.minWidth.asNumber() + 2;

        //  NB: We need to set this because if the tile exists, we set it before
        //  obtaining the width.
        tileTPElem.setAttribute('hidden', false);

    } else {

        //  NB: We need to set this before getting the tile's current width
        tileTPElem.setAttribute('hidden', false);

        tileWidth = tileTPElem.getWidth();

        tileTPElem.setContent(TP.getContentForTool(
                                sourceTPElem,
                                'BindsHUDTileBody'));
    }

    xCoord = centerTPElemPageRect.getX() +
                centerTPElemPageRect.getWidth() -
                tileWidth;
    tileTPElem.setPagePosition(
                TP.pc(xCoord, targetElemPageRect.getY()));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.bindshud.Inst.defineMethod('deleteItem',
function(aSignal) {

    /**
     * @method deleteItem
     * @summary Invoked when a user has decided to 'Delete' an item from the
     *     context menu for hud sidebar items.
     * @param {TP.sig.SelectMenuItem} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.bindshud} The receiver.
     */

    TP.alert('Called deleteItem');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.bindshud.Inst.defineMethod('focusOnTarget',
function(aTPElement) {

    /**
     * @method focusOnTarget
     * @summary Focuses the receiver onto the supplied target.
     * @param {TP.dom.UIElementNode} aTPElement The element to focus the
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

    if (select === true) {

        //  Filter out any spacers...we don't select them.
        last = this.get('listitems').filter(function(item) {
            return !TP.elementHasClass(item.getNativeNode(), 'spacer');
        }).last();

        if (TP.isValid(last)) {
            last.setAttribute('pclass:selected', 'true');
        }
    }

    //  Scroll our list content to its bottom.
    this.get('listcontent').scrollTo(TP.BOTTOM);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.bindshud.Inst.defineMethod('getContentTagNameForContextMenu',
function(aSignal) {

    /**
     * @method getContentTagNameForContextMenu
     * @summary Returns the tag name of the content to use in a context menu.
     *     Note that this should return the plain (possibly namespaced) name
     *     with no markup bracketing, etc.
     * @param {TP.sig.ShowContextMenu} aSignal The TIBET signal which triggered
     *     the context menu to show and menu content to be required.
     * @returns {String} The name of the tag to use as content for the context
     *     menu.
     */

    var targetElem;

    targetElem = aSignal.getDOMTarget();
    if (!TP.elementHasClass(targetElem, 'item')) {
        return 'sherpa:bindshudContextMenuContent';
    }

    return 'sherpa:bindshudItemContextMenuContent';
});

//  ------------------------------------------------------------------------

TP.sherpa.bindshud.Inst.defineMethod('pathToItem',
function(aSignal) {

    /**
     * @method pathToItem
     * @summary Invoked when the user has decided to obtain the 'path' to an
     *     item and put it on the clipboard. In the case of this type, this will
     *     be the path to the URI that the item is bound to.
     * @param {TP.sig.SelectMenuItem} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.bindshud} The receiver.
     */

    var contextMenuSignal,

        targetElem,

        indexInData,

        data,
        itemData,

        peerID,
        targetTPElem,

        bindingExprs,
        expandedBindingExprs,
        expandedBindingExpr,

        sourceURI,

        finalPath;

    //  Although we get the 'item selected' signal as a parameter, what we
    //  really want was the signal that triggered the opening of the context
    //  menu. We want the target of that signal (either the hud item or the hud
    //  panel itself).
    contextMenuSignal = this.get('$lastContextMenuSignal');

    //  Grab the target and make sure it's an 'item' tile.
    targetElem = contextMenuSignal.getDOMTarget();
    if (!TP.elementHasClass(targetElem, 'item')) {
        return this;
    }

    //  Get the value of the target's indexInData attribute.
    indexInData = TP.elementGetAttribute(targetElem, 'indexInData', true);

    //  No indexInData? Exit here.
    if (TP.isEmpty(indexInData)) {
        return this;
    }

    //  Convert to a Number.
    indexInData = indexInData.asNumber();

    //  Grab our data and retrieve the entry Array from our data.
    data = this.get('data');
    itemData = data.at(indexInData);

    peerID = itemData.at(0);
    targetTPElem = TP.byId(peerID);

    bindingExprs = targetTPElem.getFullyExpandedBindingExpressions();
    expandedBindingExprs = bindingExprs.at(bindingExprs.getKeys().first());

    //  We're only going to use the first expression.
    expandedBindingExpr = expandedBindingExprs.first();

    if (TP.isURIString(expandedBindingExpr)) {
        sourceURI = TP.uc(expandedBindingExpr);
        finalPath = sourceURI.getLocation();
    } else {
        return this;
    }

    TP.documentCopyTextToClipboard(this.getNativeDocument(), finalPath);

    TP.alert('Path copied to clipboard');

    return this;
});

//  ------------------------------------------------------------------------
//  TP.dom.D3Tag Methods
//  ------------------------------------------------------------------------

TP.sherpa.bindshud.Inst.defineMethod('buildNewContent',
function(enterSelection) {

    /**
     * @method buildNewContent
     * @summary Builds new content onto the receiver by appending or inserting
     *     content into the supplied d3.js 'enter selection'.
     * @param {TP.extern.d3.selection} enterSelection The d3.js enter selection
     *     that new content should be appended to.
     * @returns {TP.extern.d3.selection} The supplied enter selection or a new
     *     selection containing any new content that was added.
     */

    var domContent;

    domContent = enterSelection.append('li');

    domContent.attr(
            'pclass:selected',
            function(d) {
                if (TP.isTrue(d[2])) {
                    return true;
                }
            }).attr(
            'indexInData',
            function(d, i) {
                if (d[1] !== 'spacer') {
                    return (i / 2).floor();
                }
            }).attr(
            'peerID',
            function(d) {
                if (d[1] !== 'spacer') {
                    return d[0];
                }
            }).text(
            function(d) {
                if (d[1] !== 'spacer') {
                    return d[1];
                }
            }).attr(
            'class',
            function(d) {
                var val;

                val = 'item';

                if (d[1] === 'spacer') {
                    val += ' spacer';
                } else {
                    val += ' domnode';
                }

                return val;
            }).each(
            function(d) {
                var targetTPElem,

                    bindingExprs,
                    expandedBindingExprs,

                    hintContent,
                    hintElement;

                if (d[1] !== 'spacer') {
                    targetTPElem = TP.byId(d[0]);
                    bindingExprs = targetTPElem.
                                    getFullyExpandedBindingExpressions();
                    expandedBindingExprs = bindingExprs.at(
                                            bindingExprs.getKeys().first());

                    hintContent = TP.extern.d3.select(this).append(
                                                            'xctrls:hint');
                    hintContent.html(
                        function() {
                            return '<span xmlns="' + TP.w3.Xmlns.XHTML + '">' +
                                    expandedBindingExprs.join(', ') +
                                    '</span>';
                        }
                    );

                    hintElement = hintContent.node();

                    TP.xctrls.hint.setupHintOn(
                        this, hintElement, TP.hc('triggerPoint', TP.MOUSE));
                }
            });

    return domContent;
});

//  ------------------------------------------------------------------------

TP.sherpa.bindshud.Inst.defineMethod('computeSelectionData',
function() {

    /**
     * @method computeSelectionData
     * @summary Returns the data that will actually be used for binding into the
     *     d3.js selection.
     * @description The selection data may very well be different than the bound
     *     data that uses TIBET data binding to bind data to this control. This
     *     method allows the receiver to transform it's 'data binding data' into
     *     data appropriate for d3.js selections.
     * @returns {Object} The selection data.
     */

    var data,
        newData,

        len,
        i;

    data = this.get('data');

    newData = TP.ac();

    len = data.getSize();
    for (i = 0; i < len; i++) {

        //  Push in a data row and then a spacer row.
        //  NOTE: We construct the spacer row to take into account the fact, in
        //  the 3rd slot, what the 'condition' (i.e. 'normal', 'target',
        //  'child') is of the data row that it's a spacer for. This is because,
        //  if the data row is being removed for some reason, we want the spacer
        //  row to be removed as well. Otherwise, spurious spacer rows are left
        //  around and, with the 'append' in the buildNewContent method, things
        //  will get out of order in a hurry.
        newData.push(
            data.at(i),
            TP.ac('spacer_' + i, 'spacer', 'spacer_' + data.at(i).at(2)));
    }

    return newData;
});

//  ------------------------------------------------------------------------

TP.sherpa.bindshud.Inst.defineMethod('updateExistingContent',
function(updateSelection) {

    /**
     * @method updateExistingContent
     * @summary Updates any existing content in the receiver by altering the
     *     content in the supplied d3.js 'update selection'.
     * @param {TP.extern.d3.selection} updateSelection The d3.js update
     *     selection that existing content should be altered in.
     * @returns {TP.extern.d3.selection} The supplied update selection.
     */

    updateSelection.attr(
            'pclass:selected',
            function(d) {
                if (TP.isTrue(d[2])) {
                    return true;
                }
            }).attr(
            'indexInData',
            function(d, i) {
                if (d[1] !== 'spacer') {
                    return (i / 2).floor();
                }
            }).attr(
            'peerID',
            function(d) {
                if (d[1] !== 'spacer') {
                    return d[0];
                }
            }).text(
            function(d) {
                if (d[1] !== 'spacer') {
                    return d[1];
                }
            }).attr(
            'class',
            function(d) {
                var val;

                val = 'item';

                if (d[1] === 'spacer') {
                    val += ' spacer';
                } else {
                    val += ' domnode';
                }

                return val;
            }).each(
            function(d) {
                var targetTPElem,

                    bindingExprs,
                    expandedBindingExprs,

                    hintContent,
                    hintElement;

                if (d[1] !== 'spacer') {
                    targetTPElem = TP.byId(d[0]);
                    bindingExprs = targetTPElem.
                                    getFullyExpandedBindingExpressions();
                    expandedBindingExprs = bindingExprs.at(
                                            bindingExprs.getKeys().first());

                    hintContent = TP.extern.d3.select(this).append(
                                                            'xctrls:hint');
                    hintContent.html(
                        function() {
                            return '<span xmlns="' + TP.w3.Xmlns.XHTML + '">' +
                                    expandedBindingExprs.join(', ') +
                                    '</span>';
                        }
                    );

                    hintElement = hintContent.node();

                    TP.xctrls.hint.setupHintOn(
                        this, hintElement, TP.hc('triggerPoint', TP.MOUSE));
                }
            });

    return updateSelection;
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

        indexInData,

        data,
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

    //  Get the value of the target's indexInData attribute.
    indexInData = TP.elementGetAttribute(targetElem, 'indexInData', true);

    //  No indexInData? Exit here.
    if (TP.isEmpty(indexInData)) {
        return this;
    }

    //  Convert to a Number.
    indexInData = indexInData.asNumber();

    //  Grab our data and retrieve the entry Array from our data.
    data = this.get('data');
    itemData = data.at(indexInData);

    peerID = itemData.at(0);

    newTargetTPElem = TP.bySystemId(peerID);

    //  If its a Node, then it was valid and it was found. Focus the halo.
    if (TP.isKindOf(newTargetTPElem, TP.dom.Node) &&
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

TP.sherpa.bindshud.Inst.defineHandler('FocusHaloAndInspect',
function(aSignal) {

    /**
     * @method handleFocusHaloAndInspect
     * @summary Handles notifications of when the receiver wants to focus the
     *     halo and shift the Sherpa's inspector to focus it on the halo's
     *     target.
     * @param {TP.sig.FocusHaloAndInspect} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.bindshud} The receiver.
     */

    var targetElem,
        peerID,

        targetTPElem,

        bindingExprs,
        expandedBindingExprs,
        expandedBindingExpr,

        bindSrcURI,
        primaryLoc,

        tileTPElem,

        cmdText;

    //  Grab the target lozenge tile and get the value of its peerID attribute.
    //  This will be the ID of the element that we're trying to focus.
    targetElem = aSignal.getDOMTarget();
    peerID = TP.elementGetAttribute(targetElem, 'peerID', true);

    //  No peerID? Exit here.
    if (TP.isEmpty(peerID)) {
        return this;
    }

    //  NB: We want to query the current UI canvas here - no node context
    //  necessary.
    targetTPElem = TP.byId(peerID);

    //  Grab the fully expanded binding expression. This will contain the
    //  expression's URI.
    bindingExprs = targetTPElem.getFullyExpandedBindingExpressions();
    expandedBindingExprs = bindingExprs.at(bindingExprs.getKeys().first());

    //  We're only going to browse to the source of the first expression.
    expandedBindingExpr = expandedBindingExprs.first();

    //  Make a URI from that and then get it's primary location. This will
    //  ensure that we're going to get the 'root'ed data.
    bindSrcURI = TP.uc(expandedBindingExpr);
    primaryLoc = bindSrcURI.getPrimaryLocation();

    //  Make sure to escape any slashes - this is important as the Sherpa
    //  inspector can use '/' as a 'path separator' and we want the URI to be
    //  treated as a 'whole'.
    primaryLoc = TP.stringEscapeSlashes(primaryLoc);

    //  Hide the tile to get it out of the way.
    tileTPElem = TP.byId('BindSummary_Tile', this.getNativeDocument());
    if (TP.isValid(tileTPElem) && tileTPElem.isVisible()) {
        tileTPElem.setAttribute('hidden', true);
    }

    //  Fire a 'ConsoleCommand' signal that will be picked up and processed by
    //  the Sherpa console. Send command text asking it to inspect the current
    //  target of the halo.
    cmdText = ':inspect --path=\'_URIS_/' + primaryLoc + '\'';
    TP.signal(null,
                'ConsoleCommand',
                TP.hc('cmdText', cmdText));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.bindshud.Inst.defineHandler('ToggleHighlight',
function(aSignal) {

    /**
     * @method ToggleHighlight
     * @summary Responds to mouse over/out notifications by toggling a
     *     class on individual peer elements. The result is that as the user
     *     hovers over elements in the sidebar the corresponding element in
     *     the canvas gets a 'sherpa-hud-highlight' class add/removed.
     * @param {TP.sig.ToggleHighlight} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.bindshud} The receiver.
     */

    var uiDoc,

        oldTarget,
        target,

        targetDocElem,
        targetElem,
        peerID,

        hudInjectedStyleElement;

    //  Grab the UI canvas's document
    uiDoc = TP.sys.uidoc(true);

    //  Grab the highlighted element.
    oldTarget = this.get('highlighted');

    //  If oldTarget is valid, then we need to clear the highlighted element
    if (TP.isValid(oldTarget)) {

        //  Clear the oldTarget of the highlight class
        TP.elementRemoveClass(oldTarget, 'sherpa-hud-highlight');
        this.$set('highlighted', null, false);

        //  Grab the document element and remove the class that indicates that
        //  we're highlighting.
        targetDocElem = uiDoc.documentElement;
        TP.elementRemoveClass(targetDocElem, 'sherpa-hud-highlighting');
    }

    //  Grab the new 'DOM target' element, which will be the lozenge that the
    //  user is highlighting.
    targetElem = aSignal.getDOMTarget();

    //  If that element doesn't have the 'domnode' class, then we exit. It may
    //  be a spacer, which we're not interested in.
    if (!TP.elementHasClass(targetElem, 'domnode')) {
        return this;
    }

    //  The peerID on the lozenge will indicate which element in the UI canvas
    //  it is representing. If we don't have one, we exit.
    peerID = TP.elementGetAttribute(targetElem, 'peerID', true);
    if (TP.isEmpty(peerID)) {
        return this;
    }

    //  Query the DOM of the UI canvas for the target element.
    target = TP.byId(peerID, uiDoc, false);
    if (!TP.isElement(target)) {
        return this;
    }

    //  If the target and the old target are the same, then just exit here.
    if (target === oldTarget) {
        return this;
    }

    //  Grab the style sheet that the HUD injected into the UI canvas.
    hudInjectedStyleElement = TP.byId('hud_injected_generated',
                                        uiDoc,
                                        false);

    //  Set the '--sherpa-hud-highlight-color' to a light opacity version of our
    //  full color.
    TP.cssElementSetCustomCSSPropertyValue(
        hudInjectedStyleElement,
        '.sherpa-hud',
        '--sherpa-hud-highlight-color',
        'rgba(200, 139, 107, 0.3)',
        null,
        false);

    //  Add the highlight class to the target.
    TP.elementAddClass(target, 'sherpa-hud-highlight');
    this.$set('highlighted', target, false);

    //  Grab the document element and add the class that indicates that we're
    //  highlighting.
    targetDocElem = uiDoc.documentElement;
    TP.elementAddClass(targetDocElem, 'sherpa-hud-highlighting');

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
