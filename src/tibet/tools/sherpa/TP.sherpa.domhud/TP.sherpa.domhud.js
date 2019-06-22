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
 * @type {TP.sherpa.domhud}
 */

//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.defineSubtype('domhud');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.domhud.Type.defineMethod('tagAttachComplete',
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

        westDrawer,
        moveTileFunc;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    tpElem = TP.wrap(elem);

    //  Grab the west drawer and define a function that, when the drawer
    //  animates back and forth into and out of its collapsed position that, if
    //  a tile is showing, will move the tile to the edge of the drawer.
    westDrawer = TP.byId('west', tpElem.getNativeDocument());

    moveTileFunc = function(transitionSignal) {

        var tileTPElem,

            centerElem,
            centerElemPageRect;

        tileTPElem = TP.byId('DOMInfo_Tile',
                                westDrawer.getNativeDocument());
        if (TP.isValid(tileTPElem) && tileTPElem.isVisible()) {
            //  Grab the center element and it's page rectangle.
            centerElem = TP.byId('center', westDrawer.getNativeWindow());
            centerElemPageRect = centerElem.getPageRect();

            tileTPElem.setPageX(centerElemPageRect.getX());
        }
    };

    moveTileFunc.observe(westDrawer, 'TP.sig.DOMTransitionEnd');

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineAttribute('$currentDNDTarget');

TP.sherpa.domhud.Inst.defineAttribute('highlighted');

TP.sherpa.domhud.Inst.defineAttribute('assistantFocusedItem',
    TP.cpc('> .content li.assistantfocus', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineMethod('addChild',
function(aSignal) {

    /**
     * @method addChild
     * @summary Invoked when a user has decided to 'Add Child' from the
     *     context menu for hud sidebar panels.
     * @param {TP.sig.SelectMenuItem} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    TP.alert('Called addChild');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineMethod('addSibling',
function(aSignal) {

    /**
     * @method addSibling
     * @summary Invoked when a user has decided to 'Add Sibling' from the
     *     context menu for hud sidebar panels.
     * @param {TP.sig.SelectMenuItem} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    TP.alert('Called addSibling');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineMethod('assistItem',
function(aSignal) {

    /**
     * @method assistItem
     * @summary Invoked when a user has decided to 'Assist' an item from the
     *     context menu for hud sidebar items.
     * @param {TP.sig.SelectMenuItem} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var contextMenuSignal,

        targetElem,
        peerID,
        sourceTPElem;

    //  Although we get the 'item selected' signal as a parameter, what we
    //  really want was the signal that triggered the opening of the context
    //  menu. We want the target of that signal (either the hud item or the hud
    //  panel itself).
    contextMenuSignal = this.get('$lastContextMenuSignal');

    //  Grab the target and make sure it's an 'item' tile.
    targetElem = contextMenuSignal.getDOMTarget();
    if (!TP.elementHasClass(targetElem, 'domnode')) {
        return this;
    }

    peerID = TP.elementGetAttribute(targetElem, 'peerID', true);
    if (TP.isEmpty(peerID)) {
        return this;
    }

    //  NB: We want to query the current UI canvas here - no node context
    //  necessary.
    sourceTPElem = TP.byId(peerID);
    if (TP.notValid(sourceTPElem)) {
        return this;
    }

    //  Prevent default *on the trigger signal* (which is the GUI signal - the
    //  contextmenu signal) so that any sort of 'right click' menu doesn't show.
    aSignal.at('trigger').preventDefault();

    this.showAssistant(sourceTPElem);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineMethod('computePeerElement',
function(sidebarElement) {

    /**
     * @method computePeerElement
     * @summary Computes the peer element to the supplied sidebar element in the
     *     current UI canvas DOM.
     * @param {Element} sidebarElement The element to compute the peer element
     *     from.
     * @returns {Element|null} The element in the current UI canvas DOM that is
     *     being represented by the supplied sidebar Element.
     */

    var peerID,

        doc,
        peerElem;

    if (TP.elementHasClass(sidebarElement, 'spacer')) {

        //  If the spacer DND target element has a next sibling, then
        //  try to get it's peerID and set the insertion position to
        //  TP.BEFORE_BEGIN.
        if (TP.isElement(sidebarElement.nextSibling)) {
            //  We go to the item after us to determine the peerID
            peerID = TP.elementGetAttribute(
                        sidebarElement.nextSibling,
                        'peerID',
                        true);
        }

        //  Couldn't find one after the spacer - try the spacer DND
        //  target element before it.
        if (TP.isEmpty(peerID) &&
                TP.isElement(sidebarElement.previousSibling)) {
            //  We go to the item before us to determine the peerID
            peerID = TP.elementGetAttribute(
                            sidebarElement.previousSibling,
                            'peerID',
                            true);
        }
    } else {
        //  We go to ourself to determine the peerID
        peerID = TP.elementGetAttribute(
                            sidebarElement,
                            'peerID',
                            true);
    }

    //  If we succesfully got a peerID, then get the Element it matches in the
    //  UI canvas DOM.
    if (TP.notEmpty(peerID)) {

        doc = TP.sys.uidoc(true);

        peerElem = TP.byId(peerID, doc, false);
        if (TP.isElement(peerElem)) {
            return peerElem;
        }
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineMethod('customTagItem',
function(aSignal) {

    /**
     * @method customTagItem
     * @summary Invoked when the user has decided to make a custom tag from the
     *     currently halo'ed element.
     * @param {TP.sig.SelectMenuItem} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var halo,

        targetTPElem;

    //  Grab the halo's target element.
    halo = TP.byId('SherpaHalo', this.getNativeDocument());
    targetTPElem = halo.get('currentTargetTPElem');

    //  Tell the Sherpa IDE object to make a custom tag from it.
    TP.bySystemId('Sherpa').makeCustomTagFrom(targetTPElem);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineMethod('deleteItem',
function(aSignal) {

    /**
     * @method deleteItem
     * @summary Invoked when a user has decided to 'Delete' an item from the
     *     context menu for hud sidebar items.
     * @param {TP.sig.SelectMenuItem} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var halo;

    halo = TP.byId('SherpaHalo', this.getNativeDocument());
    halo.deleteTarget();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineMethod('emptyItem',
function(aSignal) {

    /**
     * @method emptyItem
     * @summary Invoked when a user has decided to 'Empty' an item from the
     *     context menu for hud sidebar items.
     * @param {TP.sig.SelectMenuItem} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var halo;

    halo = TP.byId('SherpaHalo', this.getNativeDocument());
    halo.emptyTarget();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineMethod('focusOnTarget',
function(aTPElement) {

    /**
     * @method focusOnTarget
     * @summary Focuses the receiver onto the supplied target.
     * @param {TP.dom.UIElementNode} aTPElement The element to focus the
     *     receiver on.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var info,
        nodes,

        children,
        offsetParentTPElem,

        tileTPElem,

        targetTPElem,

        centerElem,
        centerElemPageRect,

        itemID,
        currentItemTPElem,

        targetElemPageRect;

    info = TP.ac();

    //  Get the supplied element's ancestor chain and build a list from that.
    nodes = aTPElement.getAncestors();

    //  Unshift the supplied element onto the front.
    nodes.unshift(aTPElement);

    //  Reverse the list so that the top-most anscestor is first and the
    //  supplied element is last.
    nodes.reverse();

    children = aTPElement.getChildElements();

    //  Filter out children that are generated - TIBET generated them and we
    //  don't want them 'visible' to app authors.
    children = children.filter(
                function(aTPElem) {

                    if (TP.isTrue(TP.unwrap(aTPElem)[TP.GENERATED])) {
                        return false;
                    }

                    return true;
                });

    offsetParentTPElem = aTPElement.getOffsetParent();

    //  Concatenate the filtered child elements onto the list.
    nodes = nodes.concat(children);
    nodes.perform(
        function(aNode) {
            var node,
                arr;

            node = TP.canInvoke(aNode, 'getNativeNode') ?
                                    aNode.getNativeNode() :
                                    aNode;

            if (!TP.isElement(node)) {
                return;
            }

            arr = TP.ac(
                    TP.lid(node, true),
                    TP.getContentForTool(
                        aNode,
                        'DomHUDLabel'));

            if (aNode === aTPElement) {
                arr.push('target');
            } else if (aNode.getParentNode().getNativeNode() ===
                        aTPElement.getNativeNode()) {
                arr.push('child');
            } else if (aNode === offsetParentTPElem) {
                arr.push('offsetParent');
            } else {
                arr.push('normal');
            }

            info.push(arr);
        });

    //  List expects an array of arrays containing IDs and full names.
    this.setValue(info);

    //  Scroll our list content to its bottom.
    this.get('listcontent').scrollTo(TP.BOTTOM);

    tileTPElem = TP.byId('DOMInfo_Tile', this.getNativeDocument());
    if (TP.isValid(tileTPElem) && tileTPElem.isVisible()) {

        targetTPElem =
            TP.uc('urn:tibet:domhud_target_source').getResource().get('result');

        //  Update the tile's header text.
        tileTPElem.setHeaderText(
                    targetTPElem.getFullName() + ' Info');

        //  Grab the center element and it's page rectangle.
        centerElem = TP.byId('center', this.getNativeWindow());
        centerElemPageRect = centerElem.getPageRect();

        itemID = targetTPElem.getLocalID();

        //  Get the currently displayed lozenge given that the peerID should
        //  be the same as it was for the old lozenge.
        currentItemTPElem = TP.byCSSPath('> ul li[peerID="' + itemID + '"]',
                                            this.getNativeNode(),
                                            true);

        //  Grab it's page rect.
        targetElemPageRect = currentItemTPElem.getPageRect();

        //  Set the page position of the tile based on the two rectangles X
        //  and Y, respectively.
        tileTPElem.setPagePosition(
            TP.pc(centerElemPageRect.getX(), targetElemPageRect.getY()));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineMethod('focusOnUICanvasRoot',
function() {

    /**
     * @method focusOnUICanvasRoot
     * @summary Focuses the receiver on the UI canvas's 'root' (i.e. document)
     *     element.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var root,
        arr;

    root = TP.sys.getUICanvas().getDocument().getRoot();
    if (TP.notValid(root)) {
        return this;
    }

    root = root.getNativeNode();

    arr = TP.ac(
            TP.lid(root, true),
            TP.getContentForTool(
                TP.wrap(root),
                'DomHUDLabel'),
            'normal');

    //  List expects an array of arrays containing IDs and full names.
    this.setValue(TP.ac(arr));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineMethod('getContentTagNameForContextMenu',
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
        return 'sherpa:domhudContextMenuContent';
    }

    return 'sherpa:domhudItemContextMenuContent';
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineMethod('pathToItem',
function(aSignal) {

    /**
     * @method pathToItem
     * @summary Invoked when the user has decided to obtain the 'path' to an
     *     item and put it on the clipboard. In the case of this type, this will
     *     be the path to the 'generator' template or code.
     * @param {TP.sig.SelectMenuItem} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var contextMenuSignal,

        targetElem,
        peerID,
        sourceTPElem,

        halo,
        generatorTPElem,

        uri,

        srcPath,
        finalPath;

    //  Although we get the 'item selected' signal as a parameter, what we
    //  really want was the signal that triggered the opening of the context
    //  menu. We want the target of that signal (either the hud item or the hud
    //  panel itself).
    contextMenuSignal = this.get('$lastContextMenuSignal');

    //  Grab the target and make sure it's an 'item' tile.
    targetElem = contextMenuSignal.getDOMTarget();
    if (!TP.elementHasClass(targetElem, 'domnode')) {
        return this;
    }

    peerID = TP.elementGetAttribute(targetElem, 'peerID', true);
    if (TP.isEmpty(peerID)) {
        return this;
    }

    //  NB: We want to query the current UI canvas here - no node context
    //  necessary.
    sourceTPElem = TP.byId(peerID);
    if (TP.notValid(sourceTPElem)) {
        return this;
    }

    //  Get the source element's nearest 'generator' (i.e. the source element
    //  that generated it). If the current target isn't a generator itself, this
    //  will find the nearest one.
    halo = TP.byId('SherpaHalo', this.getNativeDocument());
    generatorTPElem = sourceTPElem.getNearestHaloGenerator(halo);

    //  Grab that element's type's template URI.
    uri = generatorTPElem.getType().getResourceURI('template',
                                                    TP.ietf.mime.XHTML);

    //  No valid URI? We must be on a tag that is outside of the application.
    if (TP.notValid(uri)) {
        return this;
    }

    //  Get the path to that URI and make sure to slice off the leading '/'.
    //  This will ensure that the TP.uriJoinPaths call will join the paths
    //  properly.
    srcPath = uri.getPath();
    srcPath = srcPath.slice(srcPath.indexOf('/') + 1);

    //  Join the leading path to the 'TIBET public directory' to the source
    //  path. This will give us the final *relative* path from the project down
    //  to the template file.
    finalPath = TP.uriJoinPaths(TP.sys.cfg('boot.tibet_pub', ''),
                                srcPath);

    TP.documentCopyTextToClipboard(this.getNativeDocument(), finalPath);

    TP.alert('Path copied to clipboard');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineMethod('showAssistant',
function(aTPElem) {

    /**
     * @method showAssistant
     * @summary Shows the DOM HUD assistant. If the element is supplied then the
     *     assistant will be shown for that element. Otherwise, the element
     *     represented by the last list item of the receiver will be used (which
     *     corresponds to the currently haloed element).
     * @param {TP.dom.ElementNode} [aTPElem] The optional element to show the
     *     assistant for.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var listItems,

        lastListItem,
        peerID,

        sourceTPElem,

        itemTPElem,

        i,
        len,
        sourceID,

        centerElem,
        centerElemPageRect,

        itemElemPageRect,

        modelURI,

        newBodyElem,
        newFooterElem,

        tileTPElem,
        newContentTPElem,

        currentBodyElem,
        currentFooterElem,

        assistantFocusedItem;

    //  Grab all of our (non-spacer) list items.
    listItems = this.get('listitems');

    //  If an element wasn't supplied, then compute the element that is
    //  represented by the last list item.
    if (TP.notValid(aTPElem)) {

        lastListItem = listItems.last();
        if (TP.isValid(lastListItem)) {

            //  The peerID will contain the ID of the element that the list item
            //  represents.
            peerID = lastListItem.getAttribute('peerID');
            if (TP.isEmpty(peerID)) {
                return this;
            }

            //  NB: We want to query the current UI canvas here - no node
            //  context necessary.
            sourceTPElem = TP.byId(peerID);
            if (TP.notValid(sourceTPElem)) {
                return this;
            }
        } else {
            return this;
        }

        //  Capture the list element itself - we'll use that below to position
        //  the assistant.
        itemTPElem = lastListItem;
    } else {

        //  We were supplied an element - get it's ID and find the list item
        //  that matches it.
        sourceTPElem = aTPElem;
        sourceID = sourceTPElem.getAttribute('id');

        //  Reverse the list so that we search from the bottom up - we're more
        //  likely to find it towards the bottom.
        listItems.reverse();

        len = listItems.getSize();
        for (i = 0; i < len; i++) {
            if (listItems.at(i).getAttribute('peerID') === sourceID) {
                itemTPElem = listItems.at(i);
                break;
            }
        }

        if (TP.notValid(itemTPElem)) {
            return this;
        }
    }

    //  Use the same 'X' coordinate where the 'center' div is located in the
    //  page.
    centerElem = TP.byId('center', this.getNativeWindow());
    centerElemPageRect = centerElem.getPageRect();

    //  Use the 'Y' coordinate where the target element is located in the page.
    itemElemPageRect = itemTPElem.getPageRect();

    //  ---

    //  Set up a model URI and observe it for change ourself. This will allow us
    //  to regenerate the tag representation as the model changes.
    modelURI = TP.uc('urn:tibet:domhud_target_source');

    newBodyElem = TP.getContentForTool(sourceTPElem, 'DomHUDTileBody');
    newFooterElem = TP.getContentForTool(sourceTPElem, 'DomHUDTileFooter');

    //  ---

    tileTPElem = TP.byId('DOMInfo_Tile', this.getNativeWindow());
    if (TP.notValid(tileTPElem)) {

        tileTPElem = TP.bySystemId('Sherpa').makeTile('DOMInfo_Tile');

        newContentTPElem = tileTPElem.setContent(newBodyElem);
        newContentTPElem.awaken();

        tileTPElem.get('footer').setContent(newFooterElem);

        //  Observe the tile for PclassHiddenChange so that we can tell when it
        //  hides.
        this.observe(tileTPElem, 'PclassHiddenChange');

    } else {
        currentBodyElem = TP.unwrap(
                            tileTPElem.get('body').getFirstChildElement());
        currentFooterElem = TP.unwrap(
                            tileTPElem.get('footer').getFirstChildElement());

        if (TP.name(currentBodyElem) !== TP.name(newBodyElem)) {
            newContentTPElem = tileTPElem.setContent(newBodyElem);
            newContentTPElem.awaken();
        }
        if (TP.name(currentFooterElem) !== TP.name(newFooterElem)) {
            tileTPElem.get('footer').setContent(newFooterElem);
        }
    }

    tileTPElem.setHeaderText('DOM Info - ' + sourceTPElem.getFullName());

    modelURI.setResource(
        sourceTPElem,
        TP.hc('observeResource', false, 'signalChange', true));

    //  Position the tile
    tileTPElem.setPagePosition(TP.pc(centerElemPageRect.getX(),
                                        itemElemPageRect.getY()));

    (function() {
        tileTPElem.get('body').
            focusAutofocusedOrFirstFocusableDescendant();
    }).queueForNextRepaint(tileTPElem.getNativeWindow());

    //  If the assistant is already focused on another item, then remove the
    //  'assistantfocus' class on that item.
    assistantFocusedItem = this.get('assistantFocusedItem');
    if (!TP.isEmptyArray(assistantFocusedItem)) {
        assistantFocusedItem.removeClass('assistantfocus');
    }

    //  Add the 'assistantfocus' class to the item that we're focusing.
    itemTPElem.addClass('assistantfocus');

    tileTPElem.setAttribute('hidden', false);

    return this;
});

//  ------------------------------------------------------------------------
//  TP.dom.D3Tag Methods
//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineMethod('buildNewContent',
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

    var domContent,
        doc;

    domContent = enterSelection.append('li');

    doc = TP.sys.uidoc(true);

    domContent.attr(
            'pclass:selected',
            function(d) {
                if (d[2] === 'target') {
                    return true;
                }
            }).attr(
            'child',
            function(d) {
                if (d[2] === 'child') {
                    return true;
                }
            }).attr(
            'offsetParent',
            function(d) {
                if (d[2] === 'offsetParent') {
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
                var peerTPElem;

                TP.elementSetAttribute(
                        this, 'dnd:accept', 'tofu dom_node', true);

                if (d[1] !== 'spacer') {
                    peerTPElem = TP.byId(d[0], doc);
                    if (!peerTPElem.haloCanFocus()) {
                        TP.wrap(this).setAttribute('disabled', true);
                    }
                }
            });

    return domContent;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineMethod('computeSelectionData',
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

TP.sherpa.domhud.Inst.defineMethod('updateExistingContent',
function(updateSelection) {

    /**
     * @method updateExistingContent
     * @summary Updates any existing content in the receiver by altering the
     *     content in the supplied d3.js 'update selection'.
     * @param {TP.extern.d3.selection} updateSelection The d3.js update
     *     selection that existing content should be altered in.
     * @returns {TP.extern.d3.selection} The supplied update selection.
     */

    var doc;

    doc = TP.sys.uidoc(true);

    updateSelection.attr(
            'pclass:selected',
            function(d) {
                if (d[2] === 'target') {
                    return true;
                }
            }).attr(
            'child',
            function(d) {
                if (d[2] === 'child') {
                    return true;
                }
            }).attr(
            'offsetParent',
            function(d) {
                if (d[2] === 'offsetParent') {
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
                var peerTPElem;

                TP.elementSetAttribute(
                    this, 'dnd:accept', 'tofu dom_node', true);

                if (d[1] !== 'spacer') {
                    peerTPElem = TP.byId(d[0], doc);
                    if (!peerTPElem.haloCanFocus()) {
                        TP.wrap(this).setAttribute('disabled', true);
                    }
                }
            });

    return updateSelection;
});

//  ------------------------------------------------------------------------
//  Handlers
//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineHandler('PclassClosedChange',
function(aSignal) {

    /**
     * @method handlePclassClosedChangeFromSherpaHUD
     * @summary Handles notifications of HUD closed change signals.
     * @param {TP.sig.PclassClosedChange} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var hudIsClosed,

        sourceTPElem;

    this.callNextMethod();

    //  Grab the HUD and see if it's currently open or closed.
    hudIsClosed = TP.bc(aSignal.getOrigin().getAttribute('closed'));

    if (!hudIsClosed) {
        sourceTPElem = TP.byId('SherpaHalo', this.getNativeDocument()).
                                            get('currentTargetTPElem');
        if (TP.notValid(sourceTPElem) || sourceTPElem.isDetached()) {
            this.focusOnUICanvasRoot();
        }
    }

    return this;
}, {
    origin: 'SherpaHUD'
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineHandler('DocumentLoaded',
function(aSignal) {

    /**
     * @method handleDocumentLoaded
     * @summary Handles when the document in the current UI canvas loads.
     * @param {TP.sig.DocumentLoaded} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    this.focusOnUICanvasRoot();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineHandler('DOMDNDTargetOver',
function(aSignal) {

    /**
     * @method handleDOMDNDTargetOver
     * @summary Handles when the drag and drop system enters a possible drop
     *     target.
     * @param {TP.sig.DOMDNDTargetOver} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var dndTargetElem,

        sourceTPElem,
        vendType,

        peerElem,
        peerTPElem,

        hudTPElem;

    dndTargetElem = aSignal.getDOMTarget();

    sourceTPElem = TP.dom.UIElementNode.get('currentDNDSource');
    vendType = sourceTPElem.getAttribute('dnd:vend');

    switch (vendType) {
        case 'breadcrumb':
        case 'tofu':
            break;

        case 'dom_node':
        case 'dom_node_copy':
            sourceTPElem = TP.byId('SherpaHalo', this.getNativeDocument()).
                                                get('currentTargetTPElem');
            break;

        default:
            break;
    }

    if (!TP.elementHasClass(dndTargetElem, 'spacer')) {
        peerElem = this.computePeerElement(dndTargetElem);
        peerTPElem = TP.wrap(peerElem);

        hudTPElem = TP.byId('SherpaHUD', this.getNativeDocument());
        if (!peerTPElem.hudCanDrop(hudTPElem, sourceTPElem)) {
            this.set('$currentDNDTarget', null);
            return this;
        }

        TP.elementAddClass(peerElem, 'sherpa-outliner-droptarget');
    }

    TP.elementAddClass(dndTargetElem, 'sherpa-domhud-droptarget');

    this.set('$currentDNDTarget', dndTargetElem);

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineHandler('DOMDNDTargetOut',
function(aSignal) {

    /**
     * @method handleDOMDNDTargetOut
     * @summary Handles when the drag and drop system exits a possible drop
     *     target.
     * @param {TP.sig.DOMDNDTargetOut} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var dndTargetElem,

        peerElem;

    dndTargetElem = aSignal.getDOMTarget();

    //  Remove the CSS class placed on the drop target and set the attribute we
    //  use to track the current DND target to null.
    TP.elementRemoveClass(dndTargetElem, 'sherpa-domhud-droptarget');

    if (!TP.elementHasClass(dndTargetElem, 'spacer')) {
        peerElem = this.computePeerElement(dndTargetElem);
        TP.elementRemoveClass(peerElem, 'sherpa-outliner-droptarget');
    }

    this.set('$currentDNDTarget', null);

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineHandler('DOMDNDCompleted',
function(aSignal) {

    /**
     * @method handleDOMDNDCompleted
     * @summary Handles when the drag and drop system completes a dragging
     *     session.
     * @param {TP.sig.DOMDNDCompleted} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var dndTargetElem,

        peerID,

        insertionPosition,
        sherpaOutliner,

        peerElem,

        doc,

        dndSourceTPElem,
        vendType;

    dndTargetElem = this.get('$currentDNDTarget');

    if (TP.isElement(dndTargetElem)) {

        //  Remove the class placed on the drop target and set the attribute we
        //  use to track the current DND target to null.
        TP.elementRemoveClass(dndTargetElem, 'sherpa-domhud-droptarget');
        this.set('$currentDNDTarget', null);

        //  If the sidebar contains the target element, then we want to do the
        //  insertion.
        if (this.contains(dndTargetElem, TP.IDENTITY)) {

            if (TP.elementHasClass(dndTargetElem, 'spacer')) {

                //  If the spacer DND target element has a next sibling, then
                //  try to get it's peerID and set the insertion position to
                //  TP.BEFORE_BEGIN.
                if (TP.isElement(dndTargetElem.nextSibling)) {
                    //  We go to the item after us to determine the peerID
                    peerID = TP.elementGetAttribute(
                                dndTargetElem.nextSibling,
                                'peerID',
                                true);
                    insertionPosition = TP.BEFORE_BEGIN;
                }

                //  Couldn't find one after the spacer - try the spacer DND
                //  target element before it.
                if (TP.isEmpty(peerID) &&
                        TP.isElement(dndTargetElem.previousSibling)) {
                    //  We go to the item before us to determine the peerID
                    peerID = TP.elementGetAttribute(
                                    dndTargetElem.previousSibling,
                                    'peerID',
                                    true);
                    insertionPosition = TP.AFTER_END;
                }
            } else {
                //  We go to ourself to determine the peerID
                peerID = TP.elementGetAttribute(
                                    dndTargetElem,
                                    'peerID',
                                    true);
                sherpaOutliner = TP.bySystemId('SherpaOutliner');
                insertionPosition = sherpaOutliner.get('insertionPosition');
            }

            //  If we succesfully got a peerID, then get the Element it matches
            //  in the UI canvas DOM.
            if (TP.notEmpty(peerID)) {

                doc = TP.sys.uidoc(true);

                peerElem = TP.byId(peerID, doc, false);
                if (TP.isElement(peerElem)) {

                    TP.elementRemoveClass(
                            peerElem, 'sherpa-outliner-droptarget');

                    //  We found a peer Element. Use it as the insertion point
                    //  and use it's parent node as the receiver of the message
                    //  that the Sherpa dropped tofu.

                    //  If we have a drag and drop source, then try to process
                    //  it.
                    dndSourceTPElem = aSignal.at('dndSource');
                    if (TP.isValid(dndSourceTPElem)) {

                        //  The value of the 'dnd:vend' attribute on the source
                        //  will detail what the kind of source just got dropped
                        //  into the outliner.
                        vendType = dndSourceTPElem.getAttribute('dnd:vend');

                        switch (vendType) {

                            case 'tofu':

                                //  Message the drop target that we dropped tofu
                                //  into it at the insertion position determined
                                //  by the user.
                                TP.wrap(dndTargetElem).sherpaDidInsertTofu(
                                                        peerElem,
                                                        insertionPosition);

                                break;

                            case 'dom_node':

                                //  Message the drop target that we dropped an
                                //  existing DOM node into it at the insertion
                                //  position determined by the user and that
                                //  node should be reparented.
                                TP.wrap(dndTargetElem).sherpaDidReparentNode(
                                                        peerElem,
                                                        insertionPosition);

                                break;

                            case 'dom_node_copy':

                                //  Message the drop target that we dropped a
                                //  copy of an existing DOM node into it at the
                                //  insertion position determined by the user
                                //  and that node should be copied into that
                                //  spot.
                                TP.wrap(dndTargetElem).sherpaDidCopyNodeInto(
                                                        peerElem,
                                                        insertionPosition);

                                break;

                            default:
                                break;
                        }
                    }
                }
            }
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineHandler('FocusHalo',
function(aSignal) {

    /**
     * @method handleFocusHalo
     * @summary Handles notifications of when the receiver wants to focus the
     *     halo.
     * @param {TP.sig.FocusHalo} aSignal The TIBET signal which triggered this
     *     method.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var targetElem,
        peerID,

        newTargetTPElem,

        halo,
        currentTargetTPElem,

        didBlur;

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
    newTargetTPElem = TP.byId(peerID);

    halo = TP.byId('SherpaHalo', this.getNativeDocument());

    currentTargetTPElem = halo.get('currentTargetTPElem');
    if (newTargetTPElem !== currentTargetTPElem) {

        didBlur = false;

        //  If the halo has a current target that can be blurred, then blur it.
        if (TP.isValid(currentTargetTPElem) &&
                currentTargetTPElem.haloCanBlur(halo)) {
            halo.blur();
            didBlur = true;
        }

        //  Remove any highlighting that we were doing *on the new target*
        //  because we're going to focus the halo.
        newTargetTPElem.removeClass('sherpa-hud-highlight');
        this.$set('highlighted', null, false);

        if (didBlur && newTargetTPElem.haloCanFocus(halo)) {
            //  Focus the halo on our new element, passing true to actually
            //  show the halo if it's hidden.
            halo.focusOn(newTargetTPElem, true);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineHandler('FocusHaloAndInspect',
function(aSignal) {

    /**
     * @method handleFocusHaloAndInspect
     * @summary Handles notifications of when the receiver wants to focus the
     *     halo and shift the Sherpa's inspector to focus it on the halo's
     *     target.
     * @param {TP.sig.FocusHaloAndInspect} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var targetElem,
        peerID,

        newTargetTPElem,

        halo,
        currentTargetTPElem,

        tileTPElem;

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
    newTargetTPElem = TP.byId(peerID);

    halo = TP.byId('SherpaHalo', this.getNativeDocument());

    currentTargetTPElem = halo.get('currentTargetTPElem');
    if (newTargetTPElem !== currentTargetTPElem) {
        //  Blur and refocus the halo on the newTargetTPElem.

        if (currentTargetTPElem.haloCanBlur(halo)) {

            halo.blur();

            if (newTargetTPElem.haloCanFocus(halo)) {
                halo.focusOn(newTargetTPElem);
            }
        }
    }

    halo.setAttribute('hidden', false);

    //  Hide the tile to get it out of the way.
    tileTPElem = TP.byId('DOMInfo_Tile', this.getNativeDocument());
    if (TP.isValid(tileTPElem) && tileTPElem.isVisible()) {
        tileTPElem.setAttribute('hidden', true);
    }

    //  Fire a 'ConsoleCommand' signal that will be picked up and processed by
    //  the Sherpa console. Send command text asking it to inspect the current
    //  target of the halo.
    TP.signal(null,
                'ConsoleCommand',
                TP.hc('cmdText', ':inspect $HALO'));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineHandler('HaloDidBlur',
function(aSignal) {

    /**
     * @method handleHaloDidBlur
     * @summary Handles notifications of when the halo blurs on an object.
     * @param {TP.sig.HaloDidBlur} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var sherpaInst;

    this.focusOnUICanvasRoot();

    sherpaInst = TP.bySystemId('Sherpa');
    this.ignore(sherpaInst, 'CanvasChanged');

    //  NB: We don't callNextMethod() here because our supertype will clear our
    //  data and we don't want that (otherwise, focusing on the canvas root
    //  above will have been for naught).

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineHandler('HaloDidFocus',
function(aSignal) {

    /**
     * @method handleHaloDidFocus
     * @summary Handles notifications of when the halo focuses on an object.
     * @param {TP.sig.HaloDidFocus} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var haloTarget;

    haloTarget = aSignal.at('haloTarget');

    //  Update the target source element before we refresh.
    TP.uc('urn:tibet:domhud_target_source').setResource(
            haloTarget,
            TP.hc('observeResource', false, 'signalChange', true));

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineHandler('PclassHiddenChange',
function(aSignal) {

    /**
     * @method handlePclassHiddenChangeFromDOMInfo_Tile
     * @summary Handles notifications of when the 'hidden' state of the
     *     assistant tile associated with this panel changes.
     * @param {TP.sig.PclassHiddenChange} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var isHidden,

        assistantFocusedItem;

    isHidden = TP.bc(aSignal.getOrigin().getAttribute('hidden'));

    //  If we're hiding, and there is an assistant focused item, then remove the
    //  'assistantfocus' class.
    if (isHidden) {
        assistantFocusedItem = this.get('assistantFocusedItem');
        if (TP.isValid(assistantFocusedItem) &&
            !TP.isEmptyArray(assistantFocusedItem)) {
            assistantFocusedItem.removeClass('assistantfocus');
        }
    }

    return this;
}, {
    origin: 'DOMInfo_Tile'
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineHandler('ToggleHighlight',
function(aSignal) {

    /**
     * @method ToggleHighlight
     * @summary Responds to mouse over/out notifications by toggling a
     *     class on individual peer elements. The result is that as the user
     *     hovers over elements in the sidebar the corresponding element in
     *     the canvas gets a 'sherpa-hud-highlight' class add/removed.
     * @param {TP.sig.ToggleHighlight} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.domhud} The receiver.
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
        'rgba(254, 214, 49, 0.3)',
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

TP.sherpa.domhud.Inst.defineMethod('toggleObservations',
function(shouldObserve) {

    /**
     * @method toggleObservations
     * @summary Either observe or ignore the signals that the receiver needs to
     *     function.
     * @param {Boolean} shouldObserve Whether or not we should be observing (or
     *     ignoring) signals.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    this.callNextMethod();

    if (shouldObserve) {
        this.observe(this.get('listcontent'),
                        TP.ac('TP.sig.DOMDNDTargetOver',
                                'TP.sig.DOMDNDTargetOut'));

        this.observe(TP.ANY, 'TP.sig.DOMDNDCompleted');
    } else {
        this.ignore(this.get('listcontent'),
                        TP.ac('TP.sig.DOMDNDTargetOver',
                                'TP.sig.DOMDNDTargetOut'));

        this.ignore(TP.ANY, 'TP.sig.DOMDNDCompleted');
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
