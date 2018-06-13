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
 * @type {TP.sherpa.adjuster_genericPropertyEditor}
 */

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_editor.defineSubtype('adjuster_genericPropertyEditor');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineAttribute(
    'propertyName',
    TP.cpc('> *[name="propertyName"] span[part="name"]', TP.hc('shouldCollapse', true)));

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineAttribute(
    'propertyValue',
    TP.cpc('> *[name="propertyValue"]', TP.hc('shouldCollapse', true)));

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineAttribute(
    'propertyValueSlotEditors',
    TP.cpc('> *[name="propertyValue"] > .slots span[slot_type]:not([slot_type="slot_group"])', TP.hc('shouldCollapse', false)));

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineAttribute(
    'propertyRuleSelector',
    TP.cpc('> *[name="propertyRuleSelector"] > .input', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineMethod('generateCSSData',
function() {

    /**
     * @method generateCSSData
     * @summary Generates CSS data from the receiver's property name and value.
     *     See the comments in this method as to the format of the data.
     * @returns {TP.core.Hash} The CSS data generated from the receiver's
     *     property name and value.
     */

    var name,
        val,

        isImportant,

        valTree,

        defaultSyntax,
        propertySyntax,

        match,
        syntaxResults,
        result,

        propValueInfos,

        i,
        theMatch;

    name = this.get('value').at('name');
    val = this.get('value').at('value');

    //name = 'background';
    //val = 'center / contain no-repeat url("../../media/examples/firefox-logo.svg"), #eee 35% url("../../media/examples/lizard.png")';

    isImportant = false;
    if (/!important/.test(val)) {
        isImportant = true;
        val = val.strip(/!important/);
    }

    valTree = TP.extern.csstree.parse(
        val,
        {
            context: 'value',
            onParseError: function(err) {
                // console.log('there was an error: ' + err);
            }
        });

    defaultSyntax = TP.extern.csstree.lexer;

    propertySyntax = TP.extern.csstree.lexer.getProperty(name);

    match = defaultSyntax.match(propertySyntax, valTree);
    syntaxResults = match.matched;

    if (TP.notValid(syntaxResults)) {
        match = defaultSyntax.match(defaultSyntax.valueCommonSyntax, valTree);
        syntaxResults = match.matched;
    }

    if (TP.notValid(syntaxResults)) {
        TP.ifWarn() ?
            TP.warn('Could not retrieve syntax for property name: ' + name +
                    ' and value: ' + val + '.') : 0;
        return null;
    }

    result = TP.hc();
    result.atPut('propName', syntaxResults.syntax.name);

    propValueInfos = TP.ac();
    result.atPut('propValueInfos', propValueInfos);

    for (i = 0; i < syntaxResults.match.length; i++) {

        theMatch = syntaxResults.match[i];

        propValueInfos.push(theMatch);
    }

    result.atPut('important', isImportant);

    return result;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineMethod(
'generateValueFieldMarkup',
function(cssData) {

    /**
     * @method generateValueFieldMarkup
     * @summary Generates markup to be used in the receiver's 'value' field
     *     element.
     * @param {TP.core.Hash} cssData The CSS data to use to generate the value
     *     field markup
     * @returns {String} A string of markup to use for the 'value field' in the
     *     receiver.
     */

    var propName,
        propInfos,

        str,

        len,
        i;

    propName = cssData.at('propName');
    propInfos = cssData.at('propValueInfos');

    str = '<div class="slots" name="' + propName + '">';

    len = propInfos.getSize();

    for (i = 0; i < len; i++) {
        str += this.generateSlotsMarkupFromMatches(propInfos.at(i));
    }

    str += '</div>';

    return str;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineMethod(
'generateSlotsMarkupFromMatches',
function(infoData) {

    var str,

        len,
        i,

        slotType,
        slotVal;

    //  If there's a 'match' slot in the infoData, then this data is
    //  representing more than one chunk.
    if (infoData.match) {
        str = '<span';
        str += ' slot_type="slot_group"' +
                ' slot_name="' + infoData.syntax.name + '">';
        len = infoData.match.length;
        for (i = 0; i < len; i++) {
            str += this.generateSlotsMarkupFromMatches(infoData.match[i]);
        }
    } else {

        //  Otherwise, the infoData should have a 'node' property that describes
        //  the slot.

        if (infoData.node) {
            slotType = infoData.node.type;
            slotVal = TP.ifInvalid(infoData.node.value, infoData.node.name);
        } else if (infoData.value) {
            slotType = infoData.value.type;
            slotVal = infoData.value.value;
        } else {
            return '';
        }

        if (slotType === 'Url' && infoData.token === ')') {
            return '</span>';
        }

        str = '<span slot_type="' + slotType + '"';

        switch (slotType) {

            case 'Dimension':
                str += ' tibet:tag="sherpa:CSSDimensionSlotEditor"';
                str += ' slot_unit="' + infoData.node.unit + '"';

                break;

            case 'Identifier':
                str += ' tibet:tag="sherpa:CSSIdentifierSlotEditor"';
                break;

            case 'Percentage':
                str += ' tibet:tag="sherpa:CSSPercentageSlotEditor"';
                break;

            //  Editable slots
            case 'Function':
            case 'HexColor':
            case 'Number':
            case 'String':
                str += ' tibet:tag="sherpa:CSSSlotEditor"';
                break;

            //  Non-editable slots
            case 'Operator':
            case 'Url':
            default:
                break;
        }

        str += '>';

        switch (slotType) {

            case 'Url':
                return str;

            default:
                if (TP.isString(slotVal)) {
                    str += slotVal;
                }

                break;
        }
    }

    str += '</span>';

    return str;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineHandler('HideHighlight',
function(aSignal) {

    /**
     * @method handleHideHighlight
     * @summary Handles notification of when the receiver wants to hide a
     *     previously shown highlight of the affected elements for the editor
     * @param {TP.sig.HideHighlight} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.adjuster_genericPropertyEditor} The receiver.
     */

    //  Because this signal is being thrown from a 'mouseleave' event (because
    //  we want it to take affect across the entire receiver, as distinct from
    //  'mouseout', which will not have this behavior), it will be thrown to
    //  every descendant and then bubble up to us. We have to make sure to only
    //  execute it once when the receiver is the target.
    if (aSignal.getDOMTarget() !== this.getNativeNode()) {
        return this;
    }

    this.hideVisualGuides();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineHandler('ShowHighlight',
function(aSignal) {

    /**
     * @method handleShowHighlight
     * @summary Handles notification of when the receiver wants to show a
     *     highlight of the affected elements for the editor
     * @param {TP.sig.ShowHighlight} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.adjuster_genericPropertyEditor} The receiver.
     */

    //  Because this signal is being thrown from a 'mouseenter' event (because
    //  we want it to take affect across the entire receiver, as distinct from
    //  'mouseover', which will not have this behavior), it will be thrown to
    //  every descendant and then bubble up to us. We have to make sure to only
    //  execute it once when the receiver is the target.
    if (aSignal.getDOMTarget() !== this.getNativeNode()) {
        return this;
    }

    this.showVisualGuides();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineHandler('ShowNameMenu',
function(aSignal) {

    /**
     * @method handleShowNameMenu
     * @summary Handles notification of when the receiver wants to show the menu
     *     of choices around property names.
     * @param {TP.sig.ShowNameMenu} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.adjuster_genericPropertyEditor} The receiver.
     */

    var propName,

        data,

        originRect,
        triggerPoint,

        popup;

    //  Make sure to tell the trigger (the UI signal) to stop propagation here,
    //  so that controls 'further up' the responder chain don't react to the
    //  mouse down.
    aSignal.at('trigger').stopPropagation();

    propName = this.get('value').at('name');

    //  Create data for the menu that includes entries for devdocs.io and
    //  caniuse.com and the property name.
    data = TP.ac(
            TP.ac('http://devdocs.io/css/' + propName, 'devdocs.io'),
            TP.ac('https://caniuse.com/#search=' + propName, 'caniuse.com')
            );

    //  Set the overall data Array as the resource for the property name menu.
    TP.uc('urn:tibet:sherpa_adjuster_name_menu_data').setResource(data);

    //  Compute the adjuster menu's trigger point from the origin's global
    //  rectangle.
    originRect = TP.wrap(aSignal.getOrigin()).getGlobalRect();
    triggerPoint = TP.pc(
                    originRect.getX(),
                    originRect.getY() + originRect.getHeight() - 10);

    //  Grab the adjuster popup and set it's width.
    popup = TP.byId('AdjusterPopup', this.getNativeDocument());
    popup.setWidth(originRect.getWidth());

    //  Throw a signal to toggle the popup on, with the adjuster name menu
    //  content as the content.
    this.signal(
        'TogglePopup',
        TP.hc(
            'contentURI', 'urn:tibet:TP.sherpa.adjusterNameMenuContent',
            'triggerTPDocument', this.getDocument(),
            'triggerPoint', triggerPoint,
            'hideOn', 'UISelect',
            'triggerID', 'namemenu',
            'overlayID', 'AdjusterPopup'));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineMethod('getPropertyInfo',
function(propertyName) {

    var info;

    info = TP.hc(
            'position',
                TP.hc('description', 'Specifies how an element is positioned in a document.')
    );

    return info.at(propertyName);
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineHandler('HidePropertyInfo',
function(aSignal) {

    /**
     * @method handleHidePropertyInfo
     * @summary Handles notification of when the receiver wants to show the
     *     property information.
     * @param {TP.sig.HidePropertyInfo} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.adjuster_genericPropertyEditor} The receiver.
     */

    /*
    var infoTPElem;

    if (!TP.wrap(aSignal.getTarget()).hasClass('field')) {
        return this;
    }

    infoTPElem = TP.wrap(aSignal.getOrigin()).get('.info');

    if (TP.isValid(infoTPElem)) {
        infoTPElem.hide(true);
    }
    */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineHandler('ShowPropertyInfo',
function(aSignal) {

    /**
     * @method handleShowPropertyInfo
     * @summary Handles notification of when the receiver wants to show the
     *     property information.
     * @param {TP.sig.ShowPropertyInfo} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.adjuster_genericPropertyEditor} The receiver.
     */

    /*
    var namePart,
        name,

        infoTPElem,
        info;

    if (!TP.wrap(aSignal.getTarget()).hasClass('field')) {
        return this;
    }

    namePart = TP.wrap(aSignal.getDOMTarget()).get('span[part="name"]');
    if (!TP.isKindOf(namePart, TP.dom.UIElementNode)) {
        return this;
    }

    name = namePart.getTextContent();

    if (TP.notEmpty(name)) {
        infoTPElem = TP.wrap(aSignal.getOrigin()).get('.info');

        if (TP.isValid(infoTPElem)) {

            info = this.getPropertyInfo(name);

            if (TP.isValid(info)) {
                infoTPElem.setTextContent(info.at('description'));
                infoTPElem.show();
            }
        }
    }
    */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineMethod('hideVisualGuides',
function() {

    /**
     * @method hideVisualGuides
     * @summary Hides any visual guides that the receiver draws to help the user
     *     when adjusting the receiver's value.
     * @returns {TP.sherpa.adjuster_genericPropertyEditor} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver.
     * @returns {TP.sherpa.adjuster_genericPropertyEditor} The receiver.
     */

    var cssData,

        valueFieldMarkup,
        valueFieldDOM,

        val;

    val = this.get('value');
    if (TP.isEmpty(val.at('value'))) {
        return this;
    }

    //  Set our 'name field' markup to the name of the property that we're
    //  managing.
    this.get('propertyName').set('value', val.at('name'));

    //  Generate the data that will be used to generate the 'value field' markup
    //  and then generate the markup from that.
    cssData = this.generateCSSData();
    if (TP.notValid(cssData)) {
        return this;
    }

    valueFieldMarkup = this.generateValueFieldMarkup(cssData);

    //  Create a DOM structure for it, assuming that non-prefixed elements are
    //  XHTML.
    valueFieldDOM = TP.xhtmlnode(valueFieldMarkup);

    //  Set our 'name field' markup to the DOM structure that we generated from
    //  the markup.
    //  NB: This will process (i.e. 'compile') any custom slot editor markup
    //  underneath
    this.get('propertyValue').set('value', valueFieldDOM);

    //  Set the 'selector field' markup to the selector of the rule.
    this.get('propertyRuleSelector').set('value', val.at('selector'));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineMethod('showVisualGuides',
function() {

    /**
     * @method showVisualGuides
     * @summary Shows any visual guides that the receiver draws to help the user
     *     when adjusting the receiver's value.
     * @returns {TP.sherpa.adjuster_genericPropertyEditor} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineMethod('updateVisualGuides',
function() {

    /**
     * @method updateVisualGuides
     * @summary Updates any visual guides that the receiver draws to help the
     *     user when adjusting the receiver's value.
     * @returns {TP.sherpa.adjuster_genericPropertyEditor} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineMethod('updateRuleValue',
function(updateRuleSource) {

    /**
     * @method updateRuleValue
     * @summary Allows the receiver to update using the supplied value. This
     *     value should be specific to the property that the receiver is
     *     managing.
     * @param {Boolean} updateRuleSource
     * @returns {TP.sherpa.adjuster_genericPropertyEditor} The receiver.
     */

    var val,

        slotEditors,

        ourInfo,
        propName,
        propRule,

        haloTPElem,
        haloTargetTPElem;

    //  Update any visual guides that we're using to display the adjustments
    //  that we're making to the user.
    this.updateVisualGuides();

    val = '';

    //  Iterate over all of the slot editors and build up a space-separated
    //  value.
    slotEditors = this.get('propertyValueSlotEditors');
    slotEditors.forEach(
        function(anEditor) {
            val += anEditor.getValueForCSSRule() + ' ';
        });

    //  Trim the last space off
    val = val.slice(0, -1);

    //  Our 'value' contains the information that we will manipulate.
    ourInfo = this.get('value');

    //  The property name and corresponding CSS rule that contains the
    //  property are in the info.
    propName = ourInfo.at('name');
    propRule = ourInfo.at('rule');

    //  Tell the adjuster that we're only interested in updating rules, not in
    //  redrawing all of the editors as if the sheet got completely changed.
    TP.byId('SherpaAdjuster', TP.win('UIROOT')).set('$updateRulesOnly', true);

    //  Set the property to the supplied value. Note here how we pass true
    //  to broadcast a CSSStyleRule change.
    TP.styleRuleSetProperty(propRule, propName, val, updateRuleSource);

    //  Grab the halo and adjust it's size & position in case the property
    //  we were manipulating affected that.
    haloTPElem = TP.byId('SherpaHalo', TP.win('UIROOT'));
    haloTargetTPElem = haloTPElem.get('currentTargetTPElem');
    haloTPElem.moveAndSizeToTarget(haloTargetTPElem);

    return this;
});

//  ========================================================================
//  TP.sherpa.CSSSlotEditor
//  ========================================================================

/**
 * @type {TP.sherpa.CSSSlotEditor}
 */

//  ------------------------------------------------------------------------

TP.sherpa.CompiledTag.defineSubtype('CSSSlotEditor');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  This tag has no associated CSS. Note how these properties are *not*
//  TYPE_LOCAL, by design.
TP.sherpa.CSSSlotEditor.Type.defineAttribute('styleURI', TP.NO_RESULT);
TP.sherpa.CSSSlotEditor.Type.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.CSSSlotEditor.Inst.defineAttribute(
    'valuePart',
    TP.cpc('> *[part="value"]', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.sherpa.CSSSlotEditor.Type.defineMethod('tagCompile',
function(aRequest) {

    /**
     * @method tagCompile
     * @summary Convert the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Element} The element.
     */

    var elem,

        str,
        newFrag;

    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    str = '<span part="value">' +
            TP.nodeGetTextContent(elem) +
            '</span>';

    newFrag = TP.xhtmlnode(str);

    TP.elementSetContent(elem, newFrag, null, false);

    return elem;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.CSSSlotEditor.Inst.defineMethod('completeUpdatingRule',
function() {

    /**
     * @method completeUpdatingRule
     * @summary Updates the rule that is associated with the property that the
     *     editor is (possibly partly) managing with a final version of the
     *     receiver's value. Note that this method *will* signal a change when
     *     the rule is updated.
     * @returns {TP.sherpa.CSSSlotEditor} The receiver.
     */

    var ourAdjusterEditorTPElem;

    //  Grab our adjuster editor element.
    ourAdjusterEditorTPElem = this.getAdjusterEditorElement();

    //  Allow the adjuster editor to update any constructs that it is managing
    //  with the new value.
    ourAdjusterEditorTPElem.updateRuleValue(true);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.CSSSlotEditor.Inst.defineMethod('getAdjusterEditorElement',
function() {

    /**
     * @method getAdjusterEditorElement
     * @summary Returns the adjuster editor that contains this slot editor.
     * @returns {TP.sherpa.CSSSlotEditor} The adjuster editor that contains
     *     the receiver.
     */

    return this.ancestorMatchingCSS('sherpa|adjuster_genericPropertyEditor');
});

//  ------------------------------------------------------------------------

TP.sherpa.CSSSlotEditor.Inst.defineMethod('getValueForCSSRule',
function() {

    /**
     * @method getValueForCSSRule
     * @summary Returns the value that can be used to update the property that
     *     the receiver is managing in its host CSSRule.
     * @returns {String} The value that can be used to update the associated
     *     CSSRule.
     */

    return this.getTextContent();
});

//  ------------------------------------------------------------------------

TP.sherpa.CSSSlotEditor.Inst.defineMethod('updateRule',
function() {

    /**
     * @method updateRule
     * @summary Updates the rule that is associated with the property that the
     *     editor is (possibly partly) managing with the receiver's value. Note
     *     that this method will *not* signal a change when the rule is updated.
     * @returns {TP.sherpa.CSSSlotEditor} The receiver.
     */

    var ourAdjusterEditorTPElem;

    //  Grab our adjuster editor element.
    ourAdjusterEditorTPElem = this.getAdjusterEditorElement();

    //  Allow the adjuster editor to update any constructs that it is managing
    //  with the new value.
    ourAdjusterEditorTPElem.updateRuleValue(false);

    return this;
});

//  ========================================================================
//  TP.sherpa.CSSDraggableSlotEditor
//  ========================================================================

/**
 * @type {TP.sherpa.CSSDraggableSlotEditor}
 */

//  ------------------------------------------------------------------------

TP.sherpa.CSSSlotEditor.defineSubtype('CSSDraggableSlotEditor');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.CSSDraggableSlotEditor.Inst.defineAttribute('$lastX');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.CSSDraggableSlotEditor.Inst.defineMethod('adjustValue',
function(oldX, newX, aDirection) {

    /**
     * @method adjustValue
     * @summary Adjusts the value of the receiver based on the 'X' values
     *     and the computed direction supplied. This method is used by subtypes
     *     of TP.sherpa.CSSDraggableSlotEditor to adjust the value it is
     *     representing.
     * @param {Number} oldX The old value of the 'X' coordinate of the drag.
     * @param {Number} newX The new value of the 'X' coordinate of the drag.
     * @param {String} aDirection The direction that the drag is occurring in.
     *     TP.LEFT, TP.RIGHT or TP.NONE.
     * @returns {TP.sherpa.CSSDraggableSlotEditor} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.CSSDraggableSlotEditor.Inst.defineHandler('StartAdjusting',
function(aSignal) {

    /**
     * @method handleStartAdjusting
     * @summary Handles notification of when the receiver wants to start
     *     adjusting it's value. For this type, this means that the 'drag to
     *     adjust' session should start.
     * @param {TP.sig.StartAdjusting} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.CSSDraggableSlotEditor} The receiver.
     */

    var nativeEvt,

        adjuster,
        ourAdjusterEditorTPElem;

    //  Grab the current X from the native Event's screenX and set that to be
    //  the 'last X'.
    nativeEvt = aSignal.at('trigger').getPayload();
    this.$set('$lastX', TP.eventGetScreenXY(nativeEvt).first());

    //  Observe the DOMDragMove and DOMDragUp signals coming directly from the
    //  mouse to make adjustments as our drag session progresses and then to end
    //  it.
    this.observe(
        TP.core.Mouse, TP.ac('TP.sig.DOMDragMove', 'TP.sig.DOMDragUp'));

    //  Tell the adjuster to hide all of the property editors except the one
    //  representing us.
    ourAdjusterEditorTPElem = this.getAdjusterEditorElement();

    adjuster = TP.byId('SherpaAdjuster', this.getNativeDocument());
    adjuster.hideAllExceptEditor(ourAdjusterEditorTPElem);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.CSSDraggableSlotEditor.Inst.defineHandler('DOMDragMove',
function(aSignal) {

    /**
     * @method handleDOMDragMove
     * @summary Handles notification of when the 'drag to adjust' session is
     *     in process and the value should be adjusted.
     * @param {TP.sig.DOMDragMove} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.CSSDraggableSlotEditor} The receiver.
     */

    var nativeEvt,

        lastX,
        currentX,

        direction;

    //  Grab where the X coordinate was last.
    lastX = this.$get('$lastX');

    //  Grab the current X from the native Event's screenX.
    nativeEvt = aSignal.getPayload();
    currentX = TP.eventGetScreenXY(nativeEvt).first();

    //  Compute the direction based on the lastX & currentX values.
    if (currentX < lastX) {
        direction = TP.LEFT;
    } else if (currentX > lastX) {
        direction = TP.RIGHT;
    } else {
        direction = TP.NONE;
    }

    this.adjustValue(lastX, currentX, direction);

    this.updateRule();

    //  Reset the last X to whatever we've computed the current X to be.
    this.$set('$lastX', currentX);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.CSSDraggableSlotEditor.Inst.defineHandler('DOMDragUp',
function(aSignal) {

    /**
     * @method handleDOMDragUp
     * @summary Handles notification of when the 'drag to adjust' session is
     *     ending.
     * @param {TP.sig.DOMDragUp} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.CSSDraggableSlotEditor} The receiver.
     */

    var adjuster,

        ourAdjusterEditorTPElem;

    //  Ignore the DOMDragMove and DOMDragUp signals coming directly from the
    //  mouse now that our drag session is done.
    this.ignore(
        TP.core.Mouse, TP.ac('TP.sig.DOMDragMove', 'TP.sig.DOMDragUp'));

    //  Null out the 'last X' so that it's ready for the next dragging session.
    this.$set('$lastX', null);

    //  Tell the adjuster to show all of the property editors.
    adjuster = TP.byId('SherpaAdjuster', this.getNativeDocument());
    adjuster.showAll();

    //  Grab the adjuster editor and tell it to hide its visual guides. This is
    //  necessary because sometimes the event sequence to show/hide those guides
    //  gets out of order and the guides won't hide.
    ourAdjusterEditorTPElem = this.getAdjusterEditorElement();
    ourAdjusterEditorTPElem.hideVisualGuides();

    setTimeout(
        function() {
            this.completeUpdatingRule();
        }.bind(this), 100);

    return this;
});

//  ========================================================================
//  TP.sherpa.CSSDimensionSlotEditor
//  ========================================================================

/**
 * @type {TP.sherpa.CSSDimensionSlotEditor}
 */

//  ------------------------------------------------------------------------

TP.sherpa.CSSDraggableSlotEditor.defineSubtype('CSSDimensionSlotEditor');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.CSSDimensionSlotEditor.Inst.defineAttribute(
    'unitPart',
    TP.cpc('> *[part="unit"]', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.sherpa.CSSDimensionSlotEditor.Type.defineMethod('tagCompile',
function(aRequest) {

    /**
     * @method tagCompile
     * @summary Convert the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Element} The element.
     */

    var elem,

        str,
        newFrag;

    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    str = '<span part="value" on:dragdown="StartAdjusting">' +
            TP.nodeGetTextContent(elem) +
            '</span>' +
            '<span part="unit">' +
            TP.elementGetAttribute(elem, 'slot_unit', true) +
            '</span>';

    newFrag = TP.xhtmlnode(str);

    TP.elementSetContent(elem, newFrag, null, false);

    return elem;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.CSSDimensionSlotEditor.Inst.defineMethod('adjustValue',
function(oldX, newX, aDirection) {

    /**
     * @method adjustValue
     * @summary Adjusts the value of the receiver based on the 'X' values
     *     and the computed direction supplied. This method is used by subtypes
     *     of TP.sherpa.CSSDraggableSlotEditor to adjust the value it is
     *     representing.
     * @param {Number} oldX The old value of the 'X' coordinate of the drag.
     * @param {Number} newX The new value of the 'X' coordinate of the drag.
     * @param {String} aDirection The direction that the drag is occurring in.
     *     TP.LEFT, TP.RIGHT or TP.NONE.
     * @returns {TP.sherpa.CSSDimensionSlotEditor} The receiver.
     */

    var val;

    //  If there wasn't a direction, then exit here.
    if (aDirection === TP.NONE) {
        return this;
    }

    //  Grab the current value.
    val = parseInt(this.getTextContent(), 10);

    //  If the direction is TP.LEFT, then subtract 1 (but stop at 0).
    if (aDirection === TP.LEFT) {
        val = (val - 1).max(0);
    } else {
        val = val + 1;
    }

    //  Set that to be the new value.
    this.get('valuePart').setTextContent(val);

    return this;
});

//  ========================================================================
//  TP.sherpa.CSSIdentifierSlotEditor
//  ========================================================================

/**
 * @type {TP.sherpa.CSSIdentifierSlotEditor}
 */

//  ------------------------------------------------------------------------

TP.sherpa.CSSSlotEditor.defineSubtype('CSSIdentifierSlotEditor');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.sherpa.CSSIdentifierSlotEditor.Type.defineMethod('tagCompile',
function(aRequest) {

    /**
     * @method tagCompile
     * @summary Convert the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Element} The element.
     */

    var elem,

        str,
        newFrag;

    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    /*
    str = '<span part="value"/>' +
            '<span class="arrowMark" on:mousedown="ShowValueMenu"/>';
    */

    str = '<span part="value" on:click="ShowValueMenu">' +
            TP.nodeGetTextContent(elem) +
            '</span>';

    newFrag = TP.xhtmlnode(str);

    TP.elementSetContent(elem, newFrag, null, false);

    return elem;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.CSSIdentifierSlotEditor.Inst.defineHandler('ShowValueMenu',
function(aSignal) {

    /**
     * @method handleShowValueMenu
     * @summary Handles notifications of when the user has issues a mouse down
     *     to show the popup menu that was activated to list all of the values
     *     of the receiver.
     * @param {TP.sig.UIShowValueMenu} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.CSSIdentifierSlotEditor} The receiver.
     */

    var wrapperSpan,

        slotTypes,
        mainFieldType,

        syntaxInfo,
        terms,

        data,
        len,
        i,

        originRect,
        triggerPoint,

        popup,

        adjuster,
        ourAdjusterEditorTPElem;

    //  Make sure to tell the trigger (the UI signal) to stop propagation here,
    //  so that controls 'further up' the responder chain don't react to the
    //  mouse down.
    aSignal.at('trigger').stopPropagation();

    //  Grab the span that is wrapping the value.
    wrapperSpan = aSignal.getDOMTarget().parentNode;

    //  Grab the slot types from that element and exit if there are none - we
    //  can't list anything useful here.
    slotTypes = TP.elementGetAttribute(wrapperSpan, 'slot_types', true);
    if (TP.isEmpty(slotTypes)) {
        return this;
    }

    //  There might be more than one slot type, but the last one will be the
    //  'most significant'.
    slotTypes = slotTypes.split(' ');
    mainFieldType = slotTypes.last();

    //  Grab the main field type's syntax information from the TP.extern.csstree
    //  object.
    syntaxInfo = TP.extern.csstree.lexer.getType(mainFieldType).syntax;
    terms = syntaxInfo.terms;

    data = TP.ac();

    //  Iterate over all of the terms and create an Array for each term, with
    //  the term as both the value and label.
    len = terms.length;
    for (i = 0; i < len; i++) {
        data.push(
            TP.ac(terms[i].name, terms[i].name)
        );
    }

    //  Set the overall data Array as the resource for the property value menu.
    TP.uc('urn:tibet:sherpa_adjuster_value_menu_data').setResource(data);

    //  Compute the adjuster menu's trigger point from the origin's global
    //  rectangle.
    originRect = TP.wrap(aSignal.getOrigin()).getGlobalRect();
    triggerPoint = TP.pc(
                    originRect.getX(),
                    originRect.getY() + originRect.getHeight() - 10);

    //  Grab the adjuster popup and set it's width.
    popup = TP.byId('AdjusterPopup', this.getNativeDocument());
    popup.setWidth(originRect.getWidth());

    //  Push ourself as a Controller for any responder signals (UISelect,
    //  UIValueChange, UIDidHide), which will come from the popup during this
    //  session.
    TP.sys.getApplication().pushController(this);

    //  Throw a signal to toggle the popup on, with the adjuster value menu
    //  content as the content.
    this.signal(
        'TogglePopup',
        TP.hc(
            'contentURI', 'urn:tibet:TP.sherpa.adjusterValueMenuContent',
            'triggerTPDocument', this.getDocument(),
            'triggerPoint', triggerPoint,
            'hideOn', 'UISelect',
            'triggerID', 'valuemenu',
            'overlayID', 'AdjusterPopup'));

    adjuster = TP.byId('SherpaAdjuster', this.getNativeDocument());
    ourAdjusterEditorTPElem = this.getAdjusterEditorElement();

    //  Hide all of the property editors except for our property editor.
    adjuster.hideAllExceptEditor(ourAdjusterEditorTPElem);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.CSSIdentifierSlotEditor.Inst.defineHandler('UIDidHide',
function(aSignal) {

    /**
     * @method handleUIDidHide
     * @summary Handles notifications of when the user has hidden the value
     *     popup menu that was activated to list all of the values of the
     *     receiver.
     * @param {TP.sig.UIDidHide} aSignal The TIBET signal which triggered this
     *     method.
     * @returns {TP.sherpa.CSSIdentifierSlotEditor} The receiver.
     */

    var adjuster;

    adjuster = TP.byId('SherpaAdjuster', this.getNativeDocument());
    adjuster.showAll();

    TP.sys.getApplication().popController(this);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.CSSIdentifierSlotEditor.Inst.defineHandler('UISelect',
function(aSignal) {

    /**
     * @method handleUISelect
     * @summary Handles notifications of when the user has selected an item
     *     from the value popup menu that was activated to list all of the
     *     values of the receiver.
     * @param {TP.sig.UISelect} aSignal The TIBET signal which triggered this
     *     method.
     * @returns {TP.sherpa.CSSIdentifierSlotEditor} The receiver.
     */

    var val;

    val = aSignal.at('value');

    if (TP.notEmpty(val)) {
        this.get('valuePart').setTextContent(val);
        setTimeout(
            function() {
                this.completeUpdatingRule();
            }.bind(this), 100);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.CSSIdentifierSlotEditor.Inst.defineHandler('UIValueChange',
function(aSignal) {

    /**
     * @method handleUIValue
     * @summary Handles notifications of when the user has hovered over an item
     *     in the value popup menu that was activated to list all of the
     *     values of the receiver.
     * @param {TP.sig.UIValueChange} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.CSSIdentifierSlotEditor} The receiver.
     */

    var val;

    val = aSignal.at('value');

    if (TP.notEmpty(val)) {
        this.get('valuePart').setTextContent(val);
        this.updateRule();
    }

    return this;
});

//  ========================================================================
//  TP.sherpa.CSSPercentageSlotEditor
//  ========================================================================

/**
 * @type {TP.sherpa.CSSPercentageSlotEditor}
 */

//  ------------------------------------------------------------------------

TP.sherpa.CSSDraggableSlotEditor.defineSubtype('CSSPercentageSlotEditor');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.sherpa.CSSPercentageSlotEditor.Type.defineMethod('tagCompile',
function(aRequest) {

    /**
     * @method tagCompile
     * @summary Convert the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Element} The element.
     */

    var elem,

        str,
        newFrag;

    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    str = '<span part="value" on:dragdown="StartAdjusting">' +
            TP.nodeGetTextContent(elem) +
            '</span>' +
            '<span part="unit">%</span>';

    newFrag = TP.xhtmlnode(str);

    TP.elementSetContent(elem, newFrag, null, false);

    return elem;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.CSSPercentageSlotEditor.Inst.defineMethod('adjustValue',
function(oldX, newX, aDirection) {

    /**
     * @method adjustValue
     * @summary Adjusts the value of the receiver based on the 'X' values
     *     and the computed direction supplied. This method is used by subtypes
     *     of TP.sherpa.CSSDraggableSlotEditor to adjust the value it is
     *     representing.
     * @param {Number} oldX The old value of the 'X' coordinate of the drag.
     * @param {Number} newX The new value of the 'X' coordinate of the drag.
     * @param {String} aDirection The direction that the drag is occurring in.
     *     TP.LEFT, TP.RIGHT or TP.NONE.
     * @returns {TP.sherpa.CSSPercentageSlotEditor} The receiver.
     */

    var val;

    //  If there wasn't a direction, then exit here.
    if (aDirection === TP.NONE) {
        return this;
    }

    //  Grab the current value.
    val = parseInt(this.getTextContent(), 10);

    //  If the direction is TP.LEFT, then subtract 1 (but stop at 0).
    if (aDirection === TP.LEFT) {
        val = (val - 1).max(0);
    } else {
        //  Otherwise, if the direction is TP.RIGHT, then subtract 1 (but stop
        //  at 100).
        val = (val + 1).min(100);
    }

    //  Set that to be the new value.
    this.get('valuePart').setTextContent(val);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
