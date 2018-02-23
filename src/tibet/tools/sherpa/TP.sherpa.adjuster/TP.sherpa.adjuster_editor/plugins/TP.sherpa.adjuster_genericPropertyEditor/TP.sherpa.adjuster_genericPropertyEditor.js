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

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary
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

    this.get('propertyName').set('value', val.at('name'));

    cssData = this.generateCSSData();
    valueFieldMarkup = this.generateValueFieldMarkup(cssData);

    valueFieldDOM = TP.xhtmlnode(valueFieldMarkup);

    //  NB: This will process (i.e. 'compile') any custom slot editor markup
    //  underneath
    this.get('propertyValue').set('value', valueFieldDOM);

    valueFieldDOM = this.get('propertyValue');

    slotElems = valueFieldDOM.get(TP.cpc('*[value_type]'));

    propValueSlots = cssData.at('propValueSlots');
    len = propValueSlots.getSize();
    for (i = 0; i < len; i++) {
        slotData = propValueSlots.at(i);
        slotElems.at(i).set('info', slotData.at('value_info'));
    }

    this.get('propertyRuleSelector').set('value', val.at('selector'));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineHandler('ShowNameMenu',
function(aSignal) {

    /**
     * @method ShowNameMenu
     * @summary
     * @param {TP.sig.Signal} aSignal
     * @returns {TP.sherpa.adjuster_genericPropertyEditor} The receiver.
     */

    var propName,

        data,

        originRect,
        triggerPoint,

        popup;

    aSignal.at('trigger').stopPropagation();

    propName = this.get('value').at('name');

    data = TP.ac(
            TP.ac('http://devdocs.io/css/' + propName, 'devdocs.io'),
            TP.ac('https://caniuse.com/#search=' + propName, 'caniuse.com')
            );

    TP.uc('urn:tibet:sherpa_adjuster_name_menu_data').setResource(data);

    originRect = TP.wrap(aSignal.getOrigin()).getGlobalRect();

    triggerPoint = TP.pc(
                    originRect.getX(),
                    originRect.getY() + originRect.getHeight() - 10);

    popup = TP.byId('AdjusterPopup', this.getNativeDocument());
    popup.setWidth(originRect.getWidth());

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

    return this.ancestorMatchingCSS('sherpa|adjuster_genericPropertyEditor');
});

//  ------------------------------------------------------------------------

TP.sherpa.CSSSlotEditor.Inst.defineMethod('getValueForCSSRule',
function() {

    return this.getTextContent();
});

//  ------------------------------------------------------------------------

TP.sherpa.CSSSlotEditor.Inst.defineMethod('setInfo',
function(anInfo) {

    this.$set('info', anInfo);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.CSSSlotEditor.Inst.defineMethod('updateRuleWithValue',
function(aValue) {

    var ourAdjusterEditorTPElem,

        ourInfo,
        propName,
        propRule,

        haloTPElem,
        haloTargetTPElem;

    if (TP.notEmpty(aValue)) {

        ourAdjusterEditorTPElem = this.getAdjusterEditorElement();

        ourInfo = ourAdjusterEditorTPElem.get('value');

        propName = ourInfo.at('name');
        propRule = ourInfo.at('rule');

        TP.styleRuleSetProperty(propRule, propName, aValue, false);

        haloTPElem = TP.byId('SherpaHalo', TP.win('UIROOT'));
        haloTargetTPElem = haloTPElem.get('currentTargetTPElem');
        haloTPElem.moveAndSizeToTarget(haloTargetTPElem);
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

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.CSSDraggableSlotEditor.Inst.defineHandler('StartAdjusting',
function(aSignal) {

    /**
     * @method StartAdjusting
     * @summary
     * @param {TP.sig.Signal} aSignal
     * @returns {TP.sherpa.CSSDraggableSlotEditor} The receiver.
     */

    var nativeEvt,

        adjuster,
        ourAdjusterEditorTPElem;

    nativeEvt = aSignal.at('trigger').getPayload();
    this.$set('$lastX', TP.eventGetScreenXY(nativeEvt).first());

    this.observe(
        TP.core.Mouse, TP.ac('TP.sig.DOMDragMove', 'TP.sig.DOMDragUp'));

    adjuster = TP.byId('SherpaAdjuster', this.getNativeDocument());
    ourAdjusterEditorTPElem = this.getAdjusterEditorElement();

    adjuster.hideAllExceptEditor(ourAdjusterEditorTPElem);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.CSSDraggableSlotEditor.Inst.defineHandler('TP.sig.DOMDragMove',
function(aSignal) {

    /**
     * @method TP.sig.DOMDragMove
     * @summary
     * @param {TP.sig.Signal} aSignal
     * @returns {TP.sherpa.CSSDraggableSlotEditor} The receiver.
     */

    var nativeEvt,

        lastX,
        currentX,

        direction,

        val;

    nativeEvt = aSignal.getPayload();
    lastX = this.$get('$lastX');

    currentX = TP.eventGetScreenXY(nativeEvt).first();

    if (currentX < lastX) {
        direction = TP.LEFT;
    } else if (currentX > lastX) {
        direction = TP.RIGHT;
    } else {
        direction = TP.NONE;
    }

    /*
    console.log('lastX: ' + lastX +
                ' currentX: ' + currentX +
                ' direction: ' + direction);
    */

    this.adjustValue(lastX, currentX, direction);

    val = this.getValueForCSSRule();
    this.updateRuleWithValue(val);

    this.$set('$lastX', currentX);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.CSSDraggableSlotEditor.Inst.defineHandler('TP.sig.DOMDragUp',
function(aSignal) {

    /**
     * @method StopAdjusting
     * @summary
     * @param {TP.sig.Signal} aSignal
     * @returns {TP.sherpa.CSSDraggableSlotEditor} The receiver.
     */

    var adjuster;

    this.ignore(
        TP.core.Mouse, TP.ac('TP.sig.DOMDragMove', 'TP.sig.DOMDragUp'));

    this.$set('$lastX', null);

    adjuster = TP.byId('SherpaAdjuster', this.getNativeDocument());
    adjuster.showAll();

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

    var val;

    if (aDirection === TP.NONE) {
        return this;
    }

    val = parseInt(this.getTextContent(), 10);

    if (aDirection === TP.LEFT) {
        val = (val - 1).max(0);
    } else {
        val = (val + 1).min(100);
    }

    this.get('valuePart').setTextContent(val);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.CSSPercentageSlotEditor.Inst.defineMethod('setInfo',
function(anInfo) {

    var val;

    this.$set('info', anInfo);

    val = anInfo.at('value');

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

TP.sherpa.CSSDraggableSlotEditor.defineSubtype('CSSIdentifierSlotEditor');

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
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.CSSIdentifierSlotEditor.Inst.defineAttribute(
    'valuePart',
    TP.cpc('> *[part="value"]', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.CSSIdentifierSlotEditor.Inst.defineMethod('setInfo',
function(anInfo) {

    var val;

    this.$set('info', anInfo);

    val = anInfo.at('name');

    this.get('valuePart').setTextContent(val);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.CSSIdentifierSlotEditor.Inst.defineHandler('ShowValueMenu',
function(aSignal) {

    /**
     * @method ShowValueMenu
     * @summary
     * @param {TP.sig.Signal} aSignal
     * @returns {TP.sherpa.CSSIdentifierEditor} The receiver.
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

    aSignal.at('trigger').stopPropagation();

    wrapperSpan = aSignal.getDOMTarget().parentNode;
    slotTypes = TP.elementGetAttribute(wrapperSpan, 'slot_types', true);

    if (TP.isEmpty(slotTypes)) {
        return this;
    }

    slotTypes = slotTypes.split(' ');

    mainFieldType = slotTypes.last();

    syntaxInfo = TP.extern.csstree.lexer.getType(mainFieldType).syntax;

    terms = syntaxInfo.terms;

    data = TP.ac();

    len = terms.length;
    for (i = 0; i < len; i++) {
        data.push(
            TP.ac(terms[i].name, terms[i].name)
        );
    }

    TP.uc('urn:tibet:sherpa_adjuster_value_menu_data').setResource(data);

    originRect = TP.wrap(aSignal.getOrigin()).getGlobalRect();

    triggerPoint = TP.pc(
                    originRect.getX(),
                    originRect.getY() + originRect.getHeight() - 10);

    popup = TP.byId('AdjusterPopup', this.getNativeDocument());
    popup.setWidth(originRect.getWidth());

    TP.sys.registerObject(this, 'AdjusterMenuTarget');

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

    adjuster.hideAllExceptEditor(ourAdjusterEditorTPElem);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.CSSIdentifierSlotEditor.Inst.defineHandler('UIDidDeactivate',
function(aSignal) {

    var adjuster;

    adjuster = TP.byId('SherpaAdjuster', this.getNativeDocument());
    adjuster.showAll();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.CSSIdentifierSlotEditor.Inst.defineHandler('UISelect',
function(aSignal) {

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

    var val;

    val = aSignal.at('value');

    if (TP.notEmpty(val)) {
        this.get('valuePart').setTextContent(val);
        this.updateRuleWithValue(val);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
