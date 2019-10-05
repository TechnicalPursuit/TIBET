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
 * @type {TP.sherpa.styleshud}
 */

//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.defineSubtype('styleshud');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Type.defineMethod('tagAttachComplete',
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

        tileTPElem = TP.byId('StyleSummary_Tile',
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

TP.sherpa.styleshud.Inst.defineAttribute('$currentDNDTarget');
TP.sherpa.styleshud.Inst.defineAttribute('$currentRuleIndex');

TP.sherpa.styleshud.Inst.defineAttribute('highlighted');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineMethod('addRule',
function(aSignal) {

    /**
     * @method addRule
     * @summary Invoked when a user has decided to 'Add Rule' from the
     *     context menu for hud sidebar panels.
     * @param {TP.sig.SelectMenuItem} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    TP.alert('Called addRule');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineMethod('assistItem',
function(aSignal) {

    /**
     * @method assistItem
     * @summary Invoked when a user has decided to 'Assist' an item from the
     *     context menu for hud sidebar items.
     * @param {TP.sig.SelectMenuItem} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    var contextMenuSignal,

        targetElem,

        dataIndex,

        data,
        itemData,

        targetTPElem,
        targetElemPageRect,

        centerElem,
        centerElemPageRect,

        positioningPoint,

        halo,
        sourceTPElem,

        newBodyElem,
        newFooterElem,

        tileTPElem,
        newContentTPElem,

        setResourceParams,

        currentBodyElem,
        currentFooterElem,

        modelURI;

    //  Although we get the 'item selected' signal as a parameter, what we
    //  really want was the signal that triggered the opening of the context
    //  menu. We want the target of that signal (either the hud item or the hud
    //  panel itself).
    contextMenuSignal = this.get('$lastContextMenuSignal');

    //  Grab the target and make sure it's an 'item' tile.
    targetElem = contextMenuSignal.getDOMTarget();
    if (!TP.elementHasClass(targetElem, 'selector') &&
        !TP.elementHasClass(targetElem, 'cascaded')) {
        return this;
    }

    //  Get the value of the target's dataindex attribute.
    dataIndex = TP.elementGetAttribute(targetElem, 'dataindex', true);

    //  No dataIndex? Exit here.
    if (TP.isEmpty(dataIndex)) {
        return this;
    }

    //  Prevent default *on the trigger signal* (which is the GUI signal - the
    //  contextmenu signal) so that any sort of 'right click' menu doesn't show.
    aSignal.at('trigger').preventDefault();

    //  Convert to a Number.
    dataIndex = dataIndex.asNumber();

    //  Grab our data and retrieve the entry Array from our data.
    data = this.get('data');
    itemData = data.at(dataIndex);

    targetTPElem = TP.wrap(targetElem);

    //  Use the 'Y' coordinate where the target element is located in the page.
    targetElemPageRect = targetTPElem.getPageRect();

    //  Use the same 'X' coordinate where the 'center' div is located in the
    //  page.
    centerElem = TP.byId('center', this.getNativeWindow());
    centerElemPageRect = centerElem.getPageRect();

    positioningPoint =
        TP.pc(centerElemPageRect.getX(), targetElemPageRect.getY());

    if (itemData.at(0) === '[cascaded]') {
        TP.byId('SherpaAdjuster', this.getNativeDocument()).
                                showAdjusterTileAt(positioningPoint);
        return this;
    }

    halo = TP.byId('SherpaHalo', this.getNativeDocument());
    sourceTPElem = halo.get('currentTargetTPElem');

    newBodyElem = TP.getContentForTool(sourceTPElem, 'StylesHUDTileBody');
    newFooterElem = TP.getContentForTool(sourceTPElem, 'StylesHUDTileFooter');

    //  ---

    tileTPElem = TP.byId('StyleSummary_Tile', this.getNativeWindow());
    if (TP.notValid(tileTPElem)) {

        tileTPElem = TP.bySystemId('Sherpa').makeTile('StyleSummary_Tile');
        tileTPElem.setHeaderText('Rule Properties');

        newContentTPElem = tileTPElem.setContent(newBodyElem);
        newContentTPElem.awaken();

        tileTPElem.get('footer').setContent(newFooterElem);

        setResourceParams =
            TP.hc('observeResource', true, 'signalChange', true);
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

        setResourceParams = TP.hc('signalChange', true);
    }

    //  Grab the current rule source.
    modelURI = TP.uc('urn:tibet:styleshud_rule_source');

    //  Set the model's URI's resource and signal change. This will
    //  cause the properties to update.
    modelURI.setResource(itemData, setResourceParams);

    //  Position the tile
    tileTPElem.setPagePosition(positioningPoint);

    (function() {
        tileTPElem.get('body').
            focusAutofocusedOrFirstFocusableDescendant();
    }).queueForNextRepaint(tileTPElem.getNativeWindow());

    tileTPElem.setAttribute('hidden', false);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineMethod('editItem',
function(aSignal) {

    /**
     * @method editItem
     * @summary Invoked when a user has decided to 'Edit' an item from the
     *     context menu for hud sidebar items.
     * @param {TP.sig.SelectMenuItem} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    var contextMenuSignal,

        targetElem,
        dataIndex;

    //  Although we get the 'item selected' signal as a parameter, what we
    //  really want was the signal that triggered the opening of the context
    //  menu. We want the target of that signal (either the hud item or the hud
    //  panel itself).
    contextMenuSignal = this.get('$lastContextMenuSignal');

    //  Grab the target and make sure it's an 'selector' tile.
    targetElem = contextMenuSignal.getDOMTarget();
    if (!TP.elementHasClass(targetElem, 'selector')) {
        return this;
    }

    //  Get the value of the target's dataindex attribute.
    dataIndex = TP.elementGetAttribute(targetElem, 'dataindex', true);

    //  No dataIndex? Exit here.
    if (TP.isEmpty(dataIndex)) {
        return this;
    }

    //  Convert to a Number.
    dataIndex = dataIndex.asNumber();

    //  Inspect the entry at the index.
    this.inspectStyleEntryAt(dataIndex);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineMethod('focusOnTarget',
function(aTPElement) {

    /**
     * @method focusOnTarget
     * @summary Focuses the receiver onto the supplied target.
     * @param {TP.dom.UIElementNode} aTPElement The element to focus the
     *     receiver on.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    var info,
        node,

        ruleInfo,

        currentRuleIndex;

    //  If the element is tofu, then we don't show any style for it.
    if (aTPElement.getCanonicalName() === 'sherpa:tofu') {
        this.setValue(TP.ac());
        return this;
    }

    //  We put this into a setTimeout to improve perceived performance. In this
    //  way, the rest of the HUD can refresh and then the style sidebar can
    //  refresh after it does this performance-intensive work.
    setTimeout(
        function() {

            info = TP.ac();

            node = TP.canInvoke(aTPElement, 'getNativeNode') ?
                                    aTPElement.getNativeNode() :
                                    aTPElement;

            if (TP.isElement(node)) {

                //  Note here that we pass true to flush the element's cached
                //  ruleset. This ensures the most accurate results when
                //  focusing.
                ruleInfo = TP.elementGetAppliedStyleInfo(node, true);

                //  Finally, we populate the info that will go into the sidebar
                ruleInfo.perform(
                    function(aRuleInfo) {

                        var loc;

                        //  Grab the sheet location. If it's null, use the word
                        //  '[empty]' as the value of that slot of the info
                        loc = aRuleInfo.at('sheetLocation');
                        if (TP.isEmpty(loc)) {
                            loc = '[empty]';
                        } else {
                            loc = TP.uriInTIBETFormat(loc);
                        }

                        //  Push the following data into the rule information:

                        //  TIBET URI to stylesheet (if not null)
                        //  selectorText
                        //  the rule's CSS text
                        //  the original CSSRule object
                        info.push(
                            TP.ac(
                                loc,
                                aRuleInfo.at('originalSelector'),
                                aRuleInfo.at('rule').cssText,
                                aRuleInfo.at('rule')));
                    });
            }

            info.reverse();

            //  Unshift an entry for cascaded style.
            info.unshift(
                TP.ac('[cascaded]', '[cascaded]', '[cascaded]', '[cascaded]'));

            currentRuleIndex = this.get('$currentRuleIndex');
            if (TP.notValid(currentRuleIndex)) {
                currentRuleIndex = 0;
            }

            if (info.getSize() > 1) {
                this.set('$currentRuleIndex', 1);
            } else {
                this.set('$currentRuleIndex', TP.NOT_FOUND);
            }

            //  List expects an array of arrays containing IDs and full names.
            this.setValue(info);

            //  Scroll our list content to its bottom.
            this.get('listcontent').scrollTo(TP.BOTTOM);

        }.bind(this), 10);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineMethod('getContentTagForContextMenu',
function(aSignal) {

    /**
     * @method getContentTagForContextMenu
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
        return 'sherpa:styleshudContextMenuContent';
    }

    return 'sherpa:styleshudItemContextMenuContent';
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineMethod('getModifiableRule',
function(uniqueToTarget) {

    /**
     * @method getModifiableRule
     * @summary Returns a CSSRule object that can be modified that matches the
     *     halo's current target element. If one cannot be found, a new CSSRule
     *     is generated in the style sheet of the nearest 'generator' to the
     *     current halo'ed target and is returned.
     * @param {Boolean} [uniqueToTarget=false] Whether or not the rule should
     *     *only* match the halo's target.
     * @returns {CSSRule} The native rule object that was found or generated.
     */

    var currentRuleIndex,

        allInfo,
        ruleInfo,

        ruleLocation,

        initialRule,

        sherpaMain,

        ruleSelector,

        halo,
        targetTPElem,
        targetElem,
        targetDoc,

        matches,

        i;

    currentRuleIndex = this.get('$currentRuleIndex');
    if (TP.notValid(currentRuleIndex)) {
        return null;
    }

    allInfo = this.get('data');
    ruleInfo = allInfo.at(currentRuleIndex);

    ruleLocation = ruleInfo.at(0);

    initialRule = ruleInfo.at(3);

    sherpaMain = TP.bySystemId('Sherpa');

    //  If the initial rule (the currently selected one) doesn't have to be
    //  unique to the target and comes from a mutable location, then just return
    //  it.
    if (TP.notTrue(uniqueToTarget) &&
        sherpaMain.styleLocationIsMutable(ruleLocation)) {
        return initialRule;
    }

    ruleSelector = ruleInfo.at(1);

    halo = TP.byId('SherpaHalo', this.getNativeDocument());
    targetTPElem = halo.get('currentTargetTPElem');
    targetElem = targetTPElem.getNativeNode();
    targetDoc = targetTPElem.getNativeDocument();

    //  Check to see if the rule only matches the targetElem and comes from a
    //  mutable location. If that's the case, then we've found the rule that we
    //  can safely modify.
    matches = TP.byCSSPath(ruleSelector, targetDoc, false, false);
    if (matches.getSize() === 1 &&
        matches.first() === targetElem &&
        sherpaMain.styleLocationIsMutable(ruleLocation)) {
        return initialRule;
    }

    //  Since the rule matched more than one element, we need to find or create
    //  a new rule.

    //  Search backwards through the rule list from the *end of the list of all
    //  rules* to rule number one (the zeroth entry is the '[cascaded]' entry.
    //  We need to go from the end because the rule that failed above might
    //  still be *more specific* and we need find one that matches only our tag
    //  element, even if it's less specific.
    for (i = allInfo.getSize() - 1; i > 0; i--) {
        ruleInfo = allInfo.at(i);

        ruleLocation = ruleInfo.at(0);
        ruleSelector = ruleInfo.at(1);

        //  Check to see if the rule only matches the targetElem and comes from
        //  a mutable location. If that's the case, then we've found the rule
        //  that we can safely modify.
        matches = TP.byCSSPath(ruleSelector, targetDoc, false, false);
        if (matches.getSize() === 1 &&
            matches.first() === targetElem &&
            sherpaMain.styleLocationIsMutable(ruleLocation)) {
            return ruleInfo.at(3);
        }
    }

    //  We couldn't find a rule that matched uniquely and was modifiable, so we
    //  return null
    return null;
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineMethod('inspectStyleEntryAt',
function(anIndex) {

    /**
     * @method inspectStyleEntryAt
     * @summary Navigates the inspector to inspect the source of the style at
     *     the supplied index in our data.
     * @param {Number} anIndex The index to find the style entry at in our data.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    var data,
        itemData,

        target,
        ruleMatcher,

        tileTPElem;

    //  No index? Exit here.
    if (TP.isEmpty(anIndex)) {
        return this;
    }

    //  Grab our data.
    data = this.get('data');

    //  Retrieve the entry Array from our data
    itemData = data.at(anIndex);

    //  Resolve the stylesheet URI that will be at the first position in the
    //  Array. The resultant URI will be our target to inspect.
    target = TP.bySystemId(itemData.at(0));

    //  Generate a RegExp that will be used to try to find the rule within the
    //  stylesheet using the selector.
    //  ruleMatcher = TP.rc(TP.regExpEscape(itemData.at(1)) + '\\w*{');
    //  TODO: For now, until we sort out issues with the editor searching a
    //  RegExp, we have to use a simple String :-(
    ruleMatcher = itemData.at(1);

    //  Hide the tile to get it out of the way.
    tileTPElem = TP.byId('StyleSummary_Tile', this.getNativeDocument());
    if (TP.isValid(tileTPElem) && tileTPElem.isVisible()) {
        tileTPElem.setAttribute('hidden', true);
    }

    //  Fire the inspector signal on the next repaint (which will ensure the
    //  tile is closed before navigating).
    (function() {
        //  Signal to inspect the object with the rule matcher as 'extra
        //  targeting information' under the 'findContent' key.
        this.signal('InspectObject',
                    TP.hc('targetObject', target,
                            'targetAspect', TP.id(target),
                            'showBusy', true,
                            'extraTargetInfo',
                                TP.hc('findContent', ruleMatcher)));
    }.bind(this)).queueForNextRepaint(this.getNativeWindow());

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineMethod('pathToItem',
function(aSignal) {

    /**
     * @method pathToItem
     * @summary Invoked when the user has decided to obtain the 'path' to an
     *     item and put it on the clipboard. In the case of this type, this will
     *     be the path to the stylesheet of the (rule) item that was clicked on.
     * @param {TP.sig.SelectMenuItem} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    var contextMenuSignal,

        targetElem,

        dataIndex,

        data,
        itemData,

        loc,
        uri,

        srcPath,
        finalPath,

        nativeRule,
        info,
        position,
        lineNum;

    //  Although we get the 'item selected' signal as a parameter, what we
    //  really want was the signal that triggered the opening of the context
    //  menu. We want the target of that signal (either the hud item or the hud
    //  panel itself).
    contextMenuSignal = this.get('$lastContextMenuSignal');

    //  Grab the target and make sure it's an 'item' tile.
    targetElem = contextMenuSignal.getDOMTarget();
    if (!TP.elementHasClass(targetElem, 'selector') &&
        !TP.elementHasClass(targetElem, 'cascaded')) {
        return this;
    }

    //  Get the value of the target's dataindex attribute.
    dataIndex = TP.elementGetAttribute(targetElem, 'dataindex', true);

    //  No dataIndex? Exit here.
    if (TP.isEmpty(dataIndex)) {
        return this;
    }

    //  Prevent default *on the trigger signal* (which is the GUI signal - the
    //  contextmenu signal) so that any sort of 'right click' menu doesn't show.
    aSignal.at('trigger').preventDefault();

    //  Convert to a Number.
    dataIndex = dataIndex.asNumber();

    //  Grab our data and retrieve the entry Array from our data.
    data = this.get('data');
    itemData = data.at(dataIndex);

    loc = itemData.at(0);
    if (TP.isEmpty(loc) || loc === '[cascaded]') {
        return this;
    }

    //  The loc will be a virtual location - need to create a URI around that so
    //  that we can ask for its path.
    uri = TP.uc(loc);

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

    //  Grab the native CSS Rule object, which should be at the 4th position in
    //  the selected item's data record.
    nativeRule = itemData.at(3);
    if (TP.isStyleRule(nativeRule)) {

        //  Grab the 'info' about the style rule. This will parse the style
        //  sheet containing the original rule and return a hash of information
        //  about it.
        info = TP.styleRuleGetSourceInfo(nativeRule, TP.hc());
        if (TP.isValid(info)) {
            position = info.at('position');

            //  NB: The information under the top-level key in the info hash is
            //  a POJO.
            if (TP.isValid(position)) {
                lineNum = position.start.line;

                //  Using the standard syntax supported by many editors, append
                //  a ':' and the line number on the path.
                finalPath += ':' + lineNum;
            }
        }
    }

    TP.documentCopyTextToClipboard(this.getNativeDocument(), finalPath);

    TP.alert('Path copied to clipboard');

    return this;
});

//  ------------------------------------------------------------------------
//  TP.dom.D3Tag Methods
//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineMethod('buildNewContent',
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

        currentRuleIndex,

        sherpaMain;

    domContent = enterSelection.append('li');

    currentRuleIndex = this.get('$currentRuleIndex');

    sherpaMain = TP.bySystemId('Sherpa');

    domContent.attr(
            'pclass:selected',
            function(d, i) {
                if (d[1] === 'spacer' || d[1] === '[cascaded]') {
                    return;
                }

                if ((i / 2).floor() === currentRuleIndex) {
                    return true;
                }
            }).attr(
            'dataindex',
            function(d, i) {
                if (d[1] !== 'spacer') {
                    return (i / 2).floor();
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
                } else if (d[1] === '[cascaded]') {
                    val += ' cascaded';
                } else {
                    val += ' selector';
                }

                return val;
            }).each(
            function(d) {
                var lockContent,

                    hintContent,
                    hintElement;

                TP.elementSetAttribute(
                        this, 'dnd:accept', 'tofu', true);

                if (!sherpaMain.styleLocationIsMutable(d[0])) {
                    lockContent = TP.extern.d3.select(this).append(
                                                            'span');
                    lockContent.attr('class', 'lock');
                    lockContent.attr('on:click', 'UnlockRule');
                }

                if (d[1] !== 'spacer') {
                    hintContent = TP.extern.d3.select(this).append(
                                                            'xctrls:hint');
                    hintContent.html(
                        function() {
                            return '<span xmlns="' + TP.w3.Xmlns.XHTML + '">' +
                                    d[1] +
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

TP.sherpa.styleshud.Inst.defineMethod('computeSelectionData',
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
            TP.ac('spacer_' + i, 'spacer', 'spacer_'));
    }

    return newData;
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineMethod('updateExistingContent',
function(updateSelection) {

    /**
     * @method updateExistingContent
     * @summary Updates any existing content in the receiver by altering the
     *     content in the supplied d3.js 'update selection'.
     * @param {TP.extern.d3.selection} updateSelection The d3.js update
     *     selection that existing content should be altered in.
     * @returns {TP.extern.d3.selection} The supplied update selection.
     */

    var currentRuleIndex,

        sherpaMain;

    currentRuleIndex = this.get('$currentRuleIndex');

    sherpaMain = TP.bySystemId('Sherpa');

    updateSelection.attr(
            'pclass:selected',
            function(d, i) {
                if (d[1] === 'spacer' || d[1] === '[cascaded]') {
                    return;
                }

                if ((i / 2).floor() === currentRuleIndex) {
                    return true;
                }
            }).attr(
            'dataindex',
            function(d, i) {
                if (d[1] !== 'spacer') {
                    return (i / 2).floor();
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
                } else if (d[1] === '[cascaded]') {
                    val += ' cascaded';
                } else {
                    val += ' selector';
                }

                return val;
            }).each(
            function(d) {
                var lockContent;

                TP.elementSetAttribute(
                    this, 'dnd:accept', 'tofu', true);

                if (!sherpaMain.styleLocationIsMutable(d[0])) {
                    lockContent = TP.extern.d3.select(this).append(
                                                            'span');
                    lockContent.attr('class', 'lock');
                    lockContent.attr('on:click', 'UnlockRule');
                }

            });

    return updateSelection;
});

//  ------------------------------------------------------------------------
//  Handlers
//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineHandler('DocumentLoaded',
function(aSignal) {

    /**
     * @method handleDocumentLoaded
     * @summary Handles when the document in the current UI canvas loads.
     * @param {TP.sig.DocumentLoaded} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    this.observe(TP.sys.uidoc(), 'TP.sig.MutationStyleChange');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineHandler('DocumentUnloaded',
function(aSignal) {

    /**
     * @method handleDocumentUnloaded
     * @summary Handles when the document in the current UI canvas unloads.
     * @param {TP.sig.DocumentUnloaded} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    this.ignore(TP.sys.uidoc(), 'TP.sig.MutationStyleChange');

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineHandler('DOMDNDTargetOver',
function(aSignal) {

    /**
     * @method handleDOMDNDTargetOver
     * @summary Handles when the drag and drop system enters a possible drop
     *     target.
     * @param {TP.sig.DOMDNDTargetOver} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    var dndTargetElem;

    dndTargetElem = aSignal.getDOMTarget();

    TP.elementAddClass(dndTargetElem, 'sherpa-styleshud-droptarget');

    this.set('$currentDNDTarget', dndTargetElem);

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineHandler('DOMDNDTargetOut',
function(aSignal) {

    /**
     * @method handleDOMDNDTargetOut
     * @summary Handles when the drag and drop system exits a possible drop
     *     target.
     * @param {TP.sig.DOMDNDTargetOut} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    var dndTargetElem;

    dndTargetElem = aSignal.getDOMTarget();

    //  Remove the CSS class placed on the drop target and set the attribute we
    //  use to track the current DND target to null.
    TP.elementRemoveClass(dndTargetElem, 'sherpa-styleshud-droptarget');

    this.set('$currentDNDTarget', null);

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineHandler('DOMDNDCompleted',
function(aSignal) {

    /**
     * @method handleDOMDNDCompleted
     * @summary Handles when the drag and drop system completes a dragging
     *     session.
     * @param {TP.sig.DOMDNDCompleted} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    var dndTargetElem;

    dndTargetElem = this.get('$currentDNDTarget');

    if (TP.isElement(dndTargetElem)) {

        //  Remove the class placed on the drop target and set the attribute we
        //  use to track the current DND target to null.
        TP.elementRemoveClass(dndTargetElem, 'sherpa-styleshud-droptarget');
        this.set('$currentDNDTarget', null);

        if (TP.elementHasClass(dndTargetElem, 'spacer')) {
            TP.info('Create new rule');
        } else {
            TP.info('Create new property');
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineHandler('HaloDidBlur',
function(aSignal) {

    /**
     * @method handleHaloDidBlur
     * @summary Handles notifications of when the halo blurs on an object.
     * @param {TP.sig.HaloDidBlur} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    var tile;

    this.callNextMethod();

    //  Hide the tile.
    tile = TP.byId('StyleSummary_Tile', this.getNativeWindow());
    if (TP.isValid(tile)) {
        tile.setAttribute('hidden', true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineHandler('HaloDidFocus',
function(aSignal) {

    /**
     * @method handleHaloDidFocus
     * @summary Handles notifications of when the halo focuses on an object.
     * @param {TP.sig.HaloDidFocus} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    var haloTarget;

    haloTarget = aSignal.at('haloTarget');

    //  Update the target source element before we refresh.
    TP.uc('urn:tibet:styleshud_target_source').setResource(
            haloTarget,
            TP.hc('observeResource', false, 'signalChange', true));

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineHandler('InspectStyleSource',
function(aSignal) {

    /**
     * @method handleInspectStyleSource
     * @summary Handles when the user wants to inspect the source of a style
     *     rule.
     * @param {TP.sig.FocusHalo} aSignal The TIBET signal which triggered this
     *     method.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    var targetElem,
        dataIndex;

    //  Grab the target and make sure it's an 'selector' tile.
    targetElem = aSignal.getDOMTarget();
    if (!TP.elementHasClass(targetElem, 'selector')) {
        return this;
    }

    //  Get the value of the target's dataindex attribute.
    dataIndex = TP.elementGetAttribute(targetElem, 'dataindex', true);

    //  No dataIndex? Exit here.
    if (TP.isEmpty(dataIndex)) {
        return this;
    }

    //  Convert to a Number.
    dataIndex = dataIndex.asNumber();

    //  Inspect the entry at the index.
    this.inspectStyleEntryAt(dataIndex);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineHandler('MutationStyleChange',
function(aSignal) {

    /**
     * @method handleMutationStyleChange
     * @summary Handles notifications of node style changes from the overall
     *     canvas that the styleshud is working with.
     * @param {TP.sig.MutationStyleChange} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    var halo,
        currentTargetTPElem;

    halo = TP.byId('SherpaHalo', this.getNativeDocument());

    currentTargetTPElem = halo.get('currentTargetTPElem');

    if (TP.isValid(currentTargetTPElem)) {
        this.focusOnTarget(currentTargetTPElem);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineHandler('SelectRule',
function(aSignal) {

    /**
     * @method handleSelectRule
     * @summary Handles when the user selects a rule from the rule list.
     * @param {TP.sig.SelectRule} aSignal The TIBET signal which triggered this
     *     method.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    var targetElem,
        dataIndex;

    //  Grab the target and make sure it's an 'selector' tile.
    targetElem = aSignal.getDOMTarget();
    if (!TP.elementHasClass(targetElem, 'selector')) {
        return this;
    }

    //  Get the value of the target's dataindex attribute.
    dataIndex = TP.elementGetAttribute(targetElem, 'dataindex', true);

    //  No dataIndex? Exit here.
    if (TP.isEmpty(dataIndex)) {
        return this;
    }

    //  Convert to a Number.
    dataIndex = dataIndex.asNumber();

    this.set('$currentRuleIndex', dataIndex);

    this.render();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineHandler('ToggleHighlight',
function(aSignal) {

    /**
     * @method ToggleHighlight
     * @summary Responds to mouse over/out notifications by toggling a
     *     class on individual peer elements. The result is that as the user
     *     hovers over elements in the sidebar the corresponding element in
     *     the canvas gets a 'sherpa-hud-highlight' class add/removed.
     * @param {TP.sig.ToggleHighlight} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    var uiDoc,

        oldHighlightedElems,

        highlightedElems,
        targetDocElem,

        targetElem,
        index,

        selector,

        hudInjectedStyleElement;

    //  Grab the UI canvas's document
    uiDoc = TP.sys.uidoc(true);

    //  Grab the highlighted elements.
    oldHighlightedElems = this.get('highlighted');

    //  If there are highlighted elements, then we need to clear them
    if (TP.notEmpty(oldHighlightedElems)) {

        //  Clear the elements of the highlight class
        oldHighlightedElems.forEach(
            function(anElem) {
                TP.elementRemoveClass(anElem, 'sherpa-hud-highlight');
            });
        this.$set('highlighted', null, false);

        //  Grab the document element and remove the class that indicates that
        //  we're highlighting.
        targetDocElem = uiDoc.documentElement;
        TP.elementRemoveClass(targetDocElem, 'sherpa-hud-highlighting');
    }

    //  Grab the new 'DOM target' element, which will be the lozenge that the
    //  user is highlighting.
    targetElem = aSignal.getDOMTarget();

    //  If that element doesn't have the 'selector' class, then we exit. It may
    //  be a spacer, which we're not interested in.
    if (!TP.elementHasClass(targetElem, 'selector')) {
        return this;
    }

    //  Grab the index in the data from our lozenge.
    index = TP.elementGetAttribute(targetElem, 'dataindex', true);
    if (TP.isEmpty(index)) {
        return this;
    }

    //  The selector will be at the 2nd place in the record at that index in our
    //  data.
    selector = this.get('data').at(index).at(1);
    if (TP.isEmpty(selector)) {
        return this;
    }

    //  Grab the elements from the UI canvas document that match the selector.
    //  Note here that we don't autocollapse or autowrap, so we'll end up with
    //  an Array of native Elements.
    highlightedElems = TP.byCSSPath(selector, uiDoc, false, false);
    if (highlightedElems.equalTo(oldHighlightedElems)) {
        return this;
    }

    if (TP.notEmpty(highlightedElems)) {
        //  Grab the style sheet that the HUD injected into the UI canvas.
        hudInjectedStyleElement = TP.byId('hud_injected_generated',
                                            TP.sys.uidoc(true),
                                            false);

        //  Set the '--sherpa-hud-highlight-color' to a light opacity version of
        //  our full color.
        TP.cssElementSetCustomCSSPropertyValue(
            hudInjectedStyleElement,
            '.sherpa-hud',
            '--sherpa-hud-highlight-color',
            'rgba(145, 169, 192, 0.3)',
            null,
            false);

        //  Add the highlight class to the target elements.
        highlightedElems.forEach(
            function(anElem) {
                TP.elementAddClass(anElem, 'sherpa-hud-highlight');
            });
        this.$set('highlighted', highlightedElems, false);

        //  Grab the document element and add the class that indicates that
        //  we're highlighting.
        targetDocElem = TP.sys.uidoc(true).documentElement;
        TP.elementAddClass(targetDocElem, 'sherpa-hud-highlighting');
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineHandler('UnlockRule',
function(aSignal) {

    /**
     * @method handleUnlockRule
     * @summary Handles when a style rule's lozenge's lock is clicked.
     * @param {TP.sig.UnlockRule} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    var lockElem,
        parentListItem,

        dataIndex,
        data,
        dataRecord,

        selector,

        sherpaMain,

        len,
        i,
        checkSelector,
        checkLocation,

        halo,
        currentTargetTPElem,
        mutableSheet,
        declsSource;

    lockElem = aSignal.getDOMTarget();

    parentListItem = lockElem.parentNode;

    //  Grab the index in our data that is represented by the lozenge item whose
    //  lock was clicked on
    dataIndex = TP.elementGetAttribute(parentListItem, 'dataindex', true);
    dataIndex = dataIndex.asNumber();

    data = this.get('data');
    dataRecord = data.at(dataIndex);

    selector = dataRecord.at(1);

    sherpaMain = TP.bySystemId('Sherpa');

    //  Check to see if any of the existing rules that have *exactly* the same
    //  selector are mutable. If so, navigate to that rule and exit.

    //  NB: '0' is the spot for the 'cascaded' rule, so we start at 1
    len = data.getSize();
    for (i = 1; i < len; i++) {

        //  Don't check the rule that we are checking
        if (i === dataIndex) {
            continue;
        }

        checkSelector = data.at(i).at(1);

        //  If we have another rule that has exactly the same selector, then
        //  check the style location for mutability.
        if (checkSelector === selector) {
            checkLocation = data.at(i).at(0);

            if (sherpaMain.styleLocationIsMutable(checkLocation)) {
                this.set('$currentRuleIndex', i);
                this.render();

                return this;
            }
        }
    }

    //  Couldn't find a rule whose selector exactly matched. See if there are
    //  any that end with the selector that we're searching for. This allows for
    //  the fact that maybe one matches the selector, but is qualified by a
    //  portion that further qualifies it.
    len = data.getSize();
    for (i = 1; i < len; i++) {

        //  Don't check the rule that we are checking
        if (i === dataIndex) {
            continue;
        }

        checkSelector = data.at(i).at(1);

        //  If we have another rule that ends with our selector, then check the
        //  style location for mutability.
        if (checkSelector.endsWith(selector)) {
            checkLocation = data.at(i).at(0);

            if (sherpaMain.styleLocationIsMutable(checkLocation)) {
                this.set('$currentRuleIndex', i);
                this.render();

                return this;
            }
        }
    }

    //  The declarations of the existing sheet will be found at the 3rd position
    //  in the current data record.
    declsSource = dataRecord.at(2);
    declsSource = TP.trim(declsSource.slice(
                            declsSource.indexOf('{') + 1,
                            declsSource.lastIndexOf('}')));

    //  Grab the halo and its current target element.
    halo = TP.byId('SherpaHalo', this.getNativeDocument());
    currentTargetTPElem = halo.get('currentTargetTPElem');

    //  Obtain a mutable stylesheet by asking the Sherpa IDE object to compute
    //  one based on the currently halo'ed element.
    mutableSheet = sherpaMain.computeMutableStyleSheet(currentTargetTPElem);

    //  Create a new rule and add it to the end of the stylesheet.
    TP.styleSheetInsertRule(mutableSheet,
                            selector,
                            declsSource,
                            null,
                            true);

    //  Refocus on the target element, which will cause our list to refresh,
    //  thereby showing the new rule.
    this.focusOnTarget(currentTargetTPElem);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineMethod('toggleObservations',
function(shouldObserve) {

    /**
     * @method toggleObservations
     * @summary Either observe or ignore the signals that the receiver needs to
     *     function.
     * @param {Boolean} shouldObserve Whether or not we should be observing (or
     *     ignoring) signals.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    this.callNextMethod();

    if (shouldObserve) {
        this.observe(TP.sys.uidoc(), 'TP.sig.MutationStyleChange');

        this.observe(this.get('listcontent'),
                        TP.ac('TP.sig.DOMDNDTargetOver',
                                'TP.sig.DOMDNDTargetOut'));

        this.observe(TP.ANY, 'TP.sig.DOMDNDCompleted');
    } else {
        this.ignore(TP.sys.uidoc(), 'TP.sig.MutationStyleChange');

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
