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

        propFields,

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
     *      "propFields": [
     *          {
     *              "value_info": {
     *                  "type": "Identifier",
     *                  "loc": null,
     *                  "name": "solid"
     *              },
     *              "field_info": [
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
     *              "field_info": [
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
     *              "field_info": [
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
     *      "propFields": [
     *          {
     *              "value_info": {
     *                  "type": "Identifier",
     *                  "loc": null,
     *                  "name": "Helvetica"
     *              },
     *              "field_info": [
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

    propFields = TP.ac();
    result.atPut('propFields', propFields);

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
                        'field_info', syntaxes);

        propFields.push(propVal);
    }

    return result;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineMethod('generateValueMarkup',
function(cssData) {

    var propName,
        propFields,

        len,

        str,

        i,
        fieldData;

    propName = cssData.at('propName');
    propFields = cssData.at('propFields');

    len = propFields.getSize();

    if (len > 1) {
        str = '<div class="output" name="' +
                propName +
                '" output_type="multiple">';
    } else {
        str = '<div class="output" name="' +
                propName +
                '" output_type="single">';
    }

    for (i = 0; i < len; i++) {
        fieldData = propFields.at(i);
        str += this.generateFieldMarkup(fieldData);
    }

    str += '</div>';

    return str;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineMethod('generateFieldMarkup',
function(fieldData) {

    var valueInfo,
        fieldInfo,

        fieldTypes,
        len,
        i,
        info,
        fieldName,

        str,

        innerContent;

    valueInfo = fieldData.at('value_info');
    fieldInfo = fieldData.at('field_info');

    fieldTypes = TP.ac();

    len = fieldInfo.getSize();
    for (i = 0; i < len; i++) {
        info = fieldInfo.at(i);
        if (info.at('type') === 'Type') {
            fieldTypes.push(info.at('name'));
        } else if (info.at('type') === 'Property') {
            fieldName = info.at('name');
        }
    }

    str = '<span value_type="' + valueInfo.at('type') + '"';

    if (TP.notEmpty(fieldName)) {
        str += ' field_name="' + fieldName + '"';
    }

    if (TP.notEmpty(fieldTypes)) {
        str += ' field_types="' + fieldTypes.join(' ') + '"';
    }

    str += '>';

    switch (valueInfo.at('type')) {

        case 'Identifier':
            innerContent =
                '<span part="value">' + valueInfo.at('name') + '</span>' +
                '<span class="arrowMark" on:mousedown="ShowValueMenu"/>';
            break;

        case 'Percentage':
        case 'Number':
            innerContent =
                '<span part="value">' + valueInfo.at('value') + '</span>';
            break;

        case 'Dimension':
            innerContent =
                '<span part="value">' + valueInfo.at('value') + '</span>' +
                '<span part="unit">' + valueInfo.at('unit') + '</span>';
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
        valueMarkup,

        val;

    cssData = this.generateCSSData();
    valueMarkup = this.generateValueMarkup(cssData);

    val = this.get('value');

    this.get('propertyName').set('value', val.at('name'));
    this.get('propertyValue').set('value', TP.xhtmlnode(valueMarkup));
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

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineHandler('ShowValueMenu',
function(aSignal) {

    /**
     * @method ShowValueMenu
     * @summary
     * @param {TP.sig.Signal} aSignal
     * @returns {TP.sherpa.adjuster_genericPropertyEditor} The receiver.
     */

    var wrapperSpan,

        fieldTypes,
        mainFieldType,

        syntaxInfo,
        terms,

        data,
        len,
        i,

        originRect,
        triggerPoint,

        popup;

    aSignal.at('trigger').stopPropagation();

    wrapperSpan = aSignal.getDOMTarget().parentNode;
    fieldTypes = TP.elementGetAttribute(wrapperSpan, 'field_types', true);

    if (TP.isEmpty(fieldTypes)) {
        return this;
    }

    fieldTypes = fieldTypes.split(' ');

    mainFieldType = fieldTypes.last();

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

    this.signal(
        'TogglePopup',
        TP.hc(
            'contentURI', 'urn:tibet:TP.sherpa.adjusterValueMenuContent',
            'triggerTPDocument', this.getDocument(),
            'triggerPoint', triggerPoint,
            'hideOn', 'UISelect',
            'triggerID', 'valuemenu',
            'overlayID', 'AdjusterPopup'));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineHandler('StartAdjusting',
function(aSignal) {

    /**
     * @method StartAdjusting
     * @summary
     * @param {TP.sig.Signal} aSignal
     * @returns {TP.sherpa.adjuster_genericPropertyEditor} The receiver.
     */

    var adjuster,
        ourIndex;

    adjuster = TP.byId('SherpaAdjuster', this.getNativeDocument());
    ourIndex = this.getParentNode().getChildIndex(this.getNativeNode());

    adjuster.hideExceptEditorAt(ourIndex);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineHandler('StopAdjusting',
function(aSignal) {

    /**
     * @method StopAdjusting
     * @summary
     * @param {TP.sig.Signal} aSignal
     * @returns {TP.sherpa.adjuster_genericPropertyEditor} The receiver.
     */

    var adjuster;

    adjuster = TP.byId('SherpaAdjuster', this.getNativeDocument());
    adjuster.showAll();

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
