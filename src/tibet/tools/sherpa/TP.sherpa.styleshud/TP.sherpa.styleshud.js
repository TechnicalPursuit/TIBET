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
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineMethod('focusOnTarget',
function(aTPElement) {

    /**
     * @method focusOnTarget
     * @summary Focuses the receiver onto the supplied target.
     * @param {TP.core.UIElementNode} aTPElement The element to focus the
     *     receiver on.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    var info,
        node,
        rules;

    //  If the element is tofu, then we don't show any responders for it.
    if (aTPElement.getCanonicalName() === 'tibet:tofu') {
        this.setValue(info);
        return this;
    }

    node = TP.canInvoke(aTPElement, 'getNativeNode') ?
                            aTPElement.getNativeNode() :
                            aTPElement;

    info = TP.ac();

    if (TP.isElement(node)) {

        //  Note here how we pass true in the 2nd parameter so that the target
        //  node's ruleset caches get flushed and computed anew.
        rules = TP.elementGetAppliedNativeStyleRules(node, true);

        rules.perform(
            function(aRule) {
                info.push(
                    TP.ac(
                        TP.uriInTIBETFormat(
                            TP.styleSheetGetLocation(aRule.parentStyleSheet)),
                        aRule.cssText.slice(0, aRule.cssText.indexOf('{')),
                        aRule.cssText));
            });
    }

    info.reverse();

    this.setValue(info);

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

TP.sherpa.styleshud.Inst.defineHandler('InspectStyleSource',
function(aSignal) {

    /**
     * @method handleInspectStyleSource
     * @summary Handles notifications of when the receiver wants to inspect the
     *     current target's style source and shift the Sherpa's inspector to
     *     focus it on that target.
     * @param {TP.sig.InspectStyleSource} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    var data,

        targetElem,

        indexInData,
        itemData,

        target,

        ruleMatcher,

        tile;

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

    //  Resolve the stylesheet URI that will be at the first position in the
    //  Array. The resultant URI will be our target to inspect.
    target = TP.bySystemId(itemData.at(0));

    //  Generate a RegExp that will be used to try to find the rule within the
    //  stylesheet.
    ruleMatcher = TP.rc(
                        TP.regExpEscape(TP.wrap(targetElem).getTextContent()) +
                        '\\w*{');

    //  Hide the tile.
    tile = TP.byId('StyleSummary_Tile', this.getNativeWindow());
    if (TP.isValid(tile)) {
        tile.setAttribute('hidden', true);
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

TP.sherpa.styleshud.Inst.defineHandler('MutationDetach',
function(aSignal) {

    /**
     * @method handleMutationDetach
     * @summary Handles notifications of node detachment from the current UI
     *     canvas.
     * @param {TP.sig.MutationDetach} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    var tile;

    if (this.get('$isRecasting')) {
        return this;
    }

    this.callNextMethod();

    //  Hide the tile.
    tile = TP.byId('StyleSummary_Tile', this.getNativeWindow());
    if (TP.isValid(tile)) {
        tile.setAttribute('hidden', true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineHandler('ShowRuleText',
function(aSignal) {

    /**
     * @method handleShowRuleText
     * @summary Handles notifications of when the receiver wants to show the
     *     rule text in a side popup panel.
     * @param {TP.sig.ShowRuleText} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    var data,

        targetElem,

        indexInData,
        itemData,

        propertyDeclsStr,

        centerTPElem,
        centerTPElemPageRect,

        targetElemPageRect,

        showHandler;

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

    //  Prevent default *on the trigger signal* (which is the GUI signal - the
    //  contextmenu signal) so that any sort of 'right click' menu doesn't show.
    aSignal.at('trigger').preventDefault();

    //  Convert to a Number and retrieve the entry Array from our data
    indexInData = indexInData.asNumber();
    itemData = data.at(indexInData);

    //  The property declarations String will be at the 3rd position in our
    //  entry. Grab it and run the formatted CSS processing method on it.
    propertyDeclsStr = itemData.at(2);
    propertyDeclsStr = TP.sherpa.pp.runFormattedCSSModeOn(propertyDeclsStr);

    //  Use the same 'X' coordinate where the 'center' div is located in the
    //  page.
    centerTPElem = TP.byId('center', this.getNativeWindow());
    centerTPElemPageRect = centerTPElem.getPageRect();

    //  Use the 'Y' coordinate where the target element is located in the page.
    targetElemPageRect = TP.wrap(targetElem).getPageRect();

    showHandler =
        function(aTileTPElem) {

            //  Show the rule text in the tile. Note how we wrap the content
            //  with a span with a CodeMirror CSS class to make the styling
            //  work.
            aTileTPElem.setContent(
                TP.xhtmlnode('<span class="cm-s-elegant">' +
                                propertyDeclsStr +
                                '</span>'));

            aTileTPElem.setPagePosition(
                TP.pc(centerTPElemPageRect.getX(), targetElemPageRect.getY()));
        };

    TP.bySystemId('Sherpa').showTileAt(
        'StyleSummary_Tile', 'Rule Text', showHandler, showHandler);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
