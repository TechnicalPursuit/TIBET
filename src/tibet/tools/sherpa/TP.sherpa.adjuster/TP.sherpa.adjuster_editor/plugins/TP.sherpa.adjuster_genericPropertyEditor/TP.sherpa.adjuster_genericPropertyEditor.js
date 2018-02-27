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
    TP.cpc('> .grid > *[name="propertyName"] span[part="name"]', TP.hc('shouldCollapse', true)));

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineAttribute(
    'propertyValue',
    TP.cpc('> .grid > *[name="propertyValue"]', TP.hc('shouldCollapse', true)));

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineAttribute(
    'propertyRuleSelector',
    TP.cpc('> .grid > *[name="propertyRuleSelector"] > .input', TP.hc('shouldCollapse', true)));

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

        valTree,

        defaultSyntax,
        propertySyntax,

        match,

        syntaxResults,
        result,

        propValueSlots,

        i,
        theMatch,

        syntaxes,

        nestedMatch,

        valueInfo,

        propVal;

    /*
     * border: solid 1px red;
     *
     *  {
     *      "propName": "border",
     *      "propValueSlots": [
     *          {
     *              "value_info": {
     *                  "type": "Identifier",
     *                  "loc": null,
     *                  "name": "solid"
     *              },
     *              "slot_info": [
     *                  {
     *                      "type": "Type",
     *                      "name": "br-style"
     *                  },
     *                  {
     *                      "type": "Keyword",
     *                      "name": "solid"
     *                  }
     *              ]
     *          },
     *          {
     *              "value_info": {
     *                  "type": "Dimension",
     *                  "loc": null,
     *                  "value": "1",
     *                  "unit": "px"
     *              },
     *              "slot_info": [
     *                  {
     *                      "type": "Type",
     *                      "name": "br-width"
     *                  },
     *                  {
     *                      "type": "Type",
     *                      "name": "length"
     *                  }
     *              ]
     *          },
     *          {
     *              "value_info": {
     *                  "type": "Identifier",
     *                  "loc": null,
     *                  "name": "red"
     *              },
     *              "slot_info": [
     *                  {
     *                      "type": "Type",
     *                      "name": "color"
     *                  },
     *                  {
     *                      "type": "Type",
     *                      "name": "named-color"
     *                  },
     *                  {
     *                      "type": "Keyword",
     *                      "name": "red"
     *                  }
     *              ]
     *          }
     *      ]
     *  }
     *
     * font-family: Helvetica;
     *
     *  {
     *      "propName": "font-family",
     *      "propValueSlots": [
     *          {
     *              "value_info": {
     *                  "type": "Identifier",
     *                  "loc": null,
     *                  "name": "Helvetica"
     *              },
     *              "slot_info": [
     *                  {
     *                      "type": "Type",
     *                      "name": "family-name"
     *                  },
     *                  {
     *                      "type": "Type",
     *                      "name": "custom-ident"
     *                  }
     *              ]
     *          }
     *      ]
     *  }
    */

    name = this.get('value').at('name');
    val = this.get('value').at('value');

    val = val.strip(/!important/);

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

    result = TP.hc();
    result.atPut('propName', syntaxResults.syntax.name);

    propValueSlots = TP.ac();
    result.atPut('propValueSlots', propValueSlots);

    for (i = 0; i < syntaxResults.match.length; i++) {

        theMatch = syntaxResults.match[i];

        syntaxes = TP.ac();
        syntaxes.push(TP.hc(theMatch.syntax));

        nestedMatch = theMatch.match[0];

        while (TP.isValid(nestedMatch)) {
            if (TP.isValid(nestedMatch.syntax)) {
                syntaxes.push(TP.hc(nestedMatch.syntax));
                nestedMatch = nestedMatch.match[0];
            } else if (TP.isValid(nestedMatch.node)) {
                valueInfo = TP.hc(nestedMatch.node);
                nestedMatch = null;
            } else {
                nestedMatch = null;
            }
        }

        propVal = TP.hc('value_info', valueInfo,
                        'slot_info', syntaxes);

        propValueSlots.push(propVal);
    }

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
        propValueSlots,

        len,

        str,

        i,
        slotData;

    propName = cssData.at('propName');
    propValueSlots = cssData.at('propValueSlots');

    len = propValueSlots.getSize();

    if (len > 1) {
        str = '<div class="slots" name="' +
                propName +
                '" output_type="multiple">';
    } else {
        str = '<div class="slots" name="' +
                propName +
                '" output_type="single">';
    }

    for (i = 0; i < len; i++) {
        slotData = propValueSlots.at(i);
        str += this.generateValueSlotsMarkup(slotData);
    }

    str += '</div>';

    return str;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineMethod(
'generateValueSlotsMarkup',
function(slotData) {

    var valueInfo,
        slotInfo,

        slotTypes,
        len,
        i,
        info,
        slotName,

        str,

        innerContent;

    valueInfo = slotData.at('value_info');
    slotInfo = slotData.at('slot_info');

    slotTypes = TP.ac();

    len = slotInfo.getSize();
    for (i = 0; i < len; i++) {
        info = slotInfo.at(i);
        if (info.at('type') === 'Type') {
            slotTypes.push(info.at('name'));
        } else if (info.at('type') === 'Property') {
            slotName = info.at('name');
        }
    }

    str = '<span value_type="' + valueInfo.at('type') + '"';

    if (valueInfo.at('type') === 'Percentage') {
        str += ' tibet:tag="sherpa:CSSPercentageSlotEditor"';
    } else if (valueInfo.at('type') === 'Identifier') {
        str += ' tibet:tag="sherpa:CSSIdentifierSlotEditor"';
    } else {
        str += ' tibet:tag="sherpa:CSSSlotEditor"';
    }

    if (TP.notEmpty(slotName)) {
        str += ' slot_name="' + slotName + '"';
    }

    if (TP.notEmpty(slotTypes)) {
        str += ' slot_types="' + slotTypes.join(' ') + '"';
    }

    str += '>';

    switch (valueInfo.at('type')) {

        case 'Dimension':
            innerContent =
                '<span part="value">' + valueInfo.at('value') + '</span>' +
                '<span part="unit">' + valueInfo.at('unit') + '</span>';
            break;

        case 'Function':
            break;

        case 'HexColor':
            break;

        case 'Identifier':
            innerContent = '';

            /*
            innerContent =
                '<span part="value">' + valueInfo.at('name') + '</span>' +
                '<span class="arrowMark" on:mousedown="ShowValueMenu"/>';
            */
            break;

        case 'Number':
            innerContent =
                '<span part="value">' + valueInfo.at('value') + '</span>';
            break;

        case 'Percentage':
            innerContent = '';

            /*
            innerContent =
                '<span part="value" on:dragdown="StartAdjusting">' + valueInfo.at('value') + '</span>' +
                '<span part="unit">%</span>';
            */
            break;

        case 'String':
            innerContent =
                '<span part="value">' + valueInfo.at('value') + '</span>';
            break;

        case 'Url':
            innerContent =
                '<span part="value">' + valueInfo.at('value') + '</span>';
            break;

        default:
            innerContent = '';
            break;
    }

    str += innerContent;

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

        val,

        slotElems,
        propValueSlots,
        len,
        i,
        slotData;

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
    valueFieldMarkup = this.generateValueFieldMarkup(cssData);

    //  Create a DOM structure for it, assuming that non-prefixed elements are
    //  XHTML.
    valueFieldDOM = TP.xhtmlnode(valueFieldMarkup);

    //  Set our 'name field' markup to the DOM structure that we generated from
    //  the markup.
    //  NB: This will process (i.e. 'compile') any custom slot editor markup
    //  underneath
    this.get('propertyValue').set('value', valueFieldDOM);

    //  Grab the actual live DOM element back that was inserted.
    valueFieldDOM = this.get('propertyValue');

    //  Grab all of the slot elements.
    slotElems = valueFieldDOM.get(TP.cpc('*[value_type]'));

    //  Iterate over all of the slot elements and set their 'info' to what the
    //  'property value slots' from the CSS data contained.
    propValueSlots = cssData.at('propValueSlots');
    len = propValueSlots.getSize();
    for (i = 0; i < len; i++) {
        slotData = propValueSlots.at(i);
        slotElems.at(i).set('info', slotData.at('value_info'));
    }

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

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineMethod('updateWithValue',
function(aValue) {

    /**
     * @method updateWithValue
     * @summary Allows the receiver to update using the supplied value. This
     *     value should be specific to the property that the receiver is
     *     managing.
     * @param {String|Number} aValue The value to update the receiver with.
     * @returns {TP.sherpa.adjuster_genericPropertyEditor} The receiver.
     */

    this.updateVisualGuides();

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

    return aRequest.at('node');
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.CSSSlotEditor.Inst.defineAttribute('info');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.CSSSlotEditor.Inst.defineMethod('getAdjusterEditorElement',
function() {

    /**
     * @method getAdjusterEditorElement
     * @summary Returns the adjuster editor that contains this slot editor.
     * @returns {TP.sherpa.adjuster_editor} The adjuster editor that contains
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

TP.sherpa.CSSSlotEditor.Inst.defineMethod('setInfo',
function(anInfo) {

    /**
     * @method setInfo
     * @summary Sets the receiver's information to display, such as it's value
     *     or units, etc.
     * @param {TP.core.Hash} anInfo A hash containing information for the
     *     receiver to display and manipulate, such as it's value or units.
     * @returns {TP.sherpa.CSSSlotEditor} The receiver.
     */

    this.$set('info', anInfo);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.CSSSlotEditor.Inst.defineMethod('updateRuleWithValue',
function(aValue) {

    /**
     * @method updateRuleWithValue
     * @summary Updates the rule that is associated with the property that the
     *     editor is (possibly partly) managing with the supplied value.
     * @param {String|Number} aValue The value to update the rule with.
     * @returns {TP.sherpa.CSSSlotEditor} The receiver.
     */

    var ourAdjusterEditorTPElem,

        ourInfo,
        propName,
        propRule,

        haloTPElem,
        haloTargetTPElem;

    //  If the supplied value is real, then update the rule.
    if (TP.notEmpty(aValue)) {

        //  Grab our adjuster editor element.
        ourAdjusterEditorTPElem = this.getAdjusterEditorElement();

        //  The 'value' of our adjuster editor contains the information that we
        //  will manipulate.
        ourInfo = ourAdjusterEditorTPElem.get('value');

        //  The property name and corresponding CSS rule that contains the
        //  property are in the info.
        propName = ourInfo.at('name');
        propRule = ourInfo.at('rule');

        //  Set the property to the supplied value. Note here how we pass false
        //  to *not* broadcast a CSSStyleRule change (for now).
        TP.styleRuleSetProperty(propRule, propName, aValue, false);

        //  Grab the halo and adjust it's size & position in case the property
        //  we were manipulating affected that.
        haloTPElem = TP.byId('SherpaHalo', TP.win('UIROOT'));
        haloTargetTPElem = haloTPElem.get('currentTargetTPElem');
        haloTPElem.moveAndSizeToTarget(haloTargetTPElem);

        //  Allow the adjuster editor to update any constructs that it is
        //  managing with the new value.
        ourAdjusterEditorTPElem.updateWithValue(aValue);
    }

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

        direction,

        val;

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

    //  Grab whatever value the receiver computes that is compatible for a CSS
    //  rule and update the rule that we're manipulating with that value.
    val = this.getValueForCSSRule();
    this.updateRuleWithValue(val);

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

    var adjuster;

    //  Ignore the DOMDragMove and DOMDragUp signals coming directly from the
    //  mouse now that our drag session is done.
    this.ignore(
        TP.core.Mouse, TP.ac('TP.sig.DOMDragMove', 'TP.sig.DOMDragUp'));

    //  Null out the 'last X' so that it's ready for the next dragging session.
    this.$set('$lastX', null);

    //  Tell the adjuster to show all of the property editors.
    adjuster = TP.byId('SherpaAdjuster', this.getNativeDocument());
    adjuster.showAll();

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

    str = '<span part="value"/>' +
            '<span class="arrowMark" on:mousedown="ShowValueMenu"/>';

    newFrag = TP.xhtmlnode(str);

    TP.nodeAppendChild(elem, newFrag, false);

    return elem;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.CSSIdentifierSlotEditor.Inst.defineMethod('setInfo',
function(anInfo) {

    /**
     * @method setInfo
     * @summary Sets the receiver's information to display, such as it's value
     *     or units, etc.
     * @param {TP.core.Hash} anInfo A hash containing information for the
     *     receiver to display and manipulate, such as it's value or units.
     * @returns {TP.sherpa.CSSIdentifierSlotEditor} The receiver.
     */

    var val;

    this.$set('info', anInfo);

    //  The value that we want to display here comes from our information's
    //  'name' slot.
    val = anInfo.at('name');
    this.get('valuePart').setTextContent(val);

    return this;
});

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

    //  Register ourself as the target for any responder signals (UISelect,
    //  UIValueChange, UIDidDeactivate).
    TP.sys.registerObject(this, 'AdjusterMenuTarget');

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

TP.sherpa.CSSIdentifierSlotEditor.Inst.defineHandler('UIDidDeactivate',
function(aSignal) {

    /**
     * @method handleUIDidDeactivate
     * @summary Handles notifications of when the user has deactivated the value
     *     popup menu that was activated to list all of the values of the
     *     receiver.
     * @param {TP.sig.UIDidDeactivate} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.CSSIdentifierSlotEditor} The receiver.
     */

    var adjuster;

    adjuster = TP.byId('SherpaAdjuster', this.getNativeDocument());
    adjuster.showAll();

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
        this.updateRuleWithValue(val);
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
        this.updateRuleWithValue(val);
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

    str = '<span part="value" on:dragdown="StartAdjusting"/>' +
            '<span part="unit">%</span>';

    newFrag = TP.xhtmlnode(str);

    TP.nodeAppendChild(elem, newFrag, false);

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

TP.sherpa.CSSPercentageSlotEditor.Inst.defineMethod('setInfo',
function(anInfo) {

    /**
     * @method setInfo
     * @summary Sets the receiver's information to display, such as it's value
     *     or units, etc.
     * @param {TP.core.Hash} anInfo A hash containing information for the
     *     receiver to display and manipulate, such as it's value or units.
     * @returns {TP.sherpa.CSSPercentageSlotEditor} The receiver.
     */

    var val;

    this.$set('info', anInfo);

    //  The value that we want to display here comes from our information's
    //  'value' slot.
    val = anInfo.at('value');
    this.get('valuePart').setTextContent(val);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
