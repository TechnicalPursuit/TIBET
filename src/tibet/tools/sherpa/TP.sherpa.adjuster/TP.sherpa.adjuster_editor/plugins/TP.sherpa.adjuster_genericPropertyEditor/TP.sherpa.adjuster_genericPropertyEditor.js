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
    TP.cpc('> *[name="propertyValue"] > .slots span[slottype]:not([slotmultipart])', TP.hc('shouldCollapse', false)));

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
     * @returns {TP.core.Hash|null} The CSS data generated from the receiver's
     *     property name and value.
     */

    var name,
        val,

        isImportant,

        error,
        valTree,

        cssTreeLexer,
        propertySyntax,

        match,
        syntaxResults,
        result,

        propValueInfos,

        len,
        i;

    //  Grab the CSS property name and value.
    name = this.get('value').at('name');
    val = this.get('value').at('value');

    //  Track whether the rule was set to '!important' based on testing the
    //  value. If it is, we keep a Boolean to that effect and strip the
    //  '!important' from the value.
    isImportant = false;
    if (/!important/.test(val)) {
        isImportant = true;
        val = val.strip(/!important/);
    }

    //  Parse the CSS value into an AST. If there was an error, then log it and
    //  exit immediately.
    error = false;
    valTree = TP.extern.csstree.parse(
        val,
        {
            context: 'value',
            onParseError: function(err) {
                error = true;
                TP.ifError() ?
                    TP.error('Error parsing CSS value "' +
                                val + '": ' + err
                                ) : 0;
            }
        });

    if (error) {
        return null;
    }

    //  Grab a reference to the csstree lexer.
    cssTreeLexer = TP.extern.csstree.lexer;

    //  Get the syntax for the property that we're processing the value of.
    propertySyntax = cssTreeLexer.getProperty(name);

    //  Run a match using the defined syntax and the AST.
    match = cssTreeLexer.match(propertySyntax, valTree);
    syntaxResults = match.matched;

    //  If there were no results, try again with the 'common value syntax' -
    //  values that all CSS properties can have.
    if (TP.notValid(syntaxResults)) {
        match = cssTreeLexer.match(cssTreeLexer.valueCommonSyntax, valTree);
        syntaxResults = match.matched;
    }

    //  If there are still no results, then exit and warn.
    if (TP.notValid(syntaxResults)) {
        TP.ifWarn() ?
            TP.warn('Could not retrieve syntax for property name: ' + name +
                    ' and value: ' + val + '.') : 0;

        return null;
    }

    //  Start building the result hash with the property name and the whole
    //  property value.
    result = TP.hc();

    result.atPut('propName', syntaxResults.syntax.name);
    result.atPut('propValue', val);

    //  Now, put in an Array containing all of the *plain JS objects* that make
    //  up the parsed value information.
    propValueInfos = TP.ac();
    result.atPut('propValueInfos', propValueInfos);

    len = syntaxResults.match.length;
    for (i = 0; i < len; i++) {
        propValueInfos.push(syntaxResults.match[i]);
    }

    //  Lastly, add the Boolean that tracks whether this declaration is
    //  '!important' or not.
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
        propValue,
        propValueInfos,

        len,

        str,

        slotNames,

        i;

    propName = cssData.at('propName');
    propValue = cssData.at('propValue');
    propValueInfos = cssData.at('propValueInfos');

    //  Create an overall wrapper that will wrap all value slots.
    str = '<div class="slots"' +
            ' on:mouseenter="ShowPropertyValueInfo"' +
            ' on:mouseleave="HidePropertyValueInfo">';

    //  Grab the names for the individual slots if the property value is a piece
    //  of shorthand whose naming is not generated by csstree. If the property
    //  isn't a shorthand or it can't be computed, this will return an Array
    //  with a single item - the supplied property name.
    slotNames = this.getCSSSlotNamesForShorthand(propName, propValue);

    //  Iterate over each chunk of the property value and generate individual
    //  'slot' markup for each slot.
    len = propValueInfos.getSize();
    for (i = 0; i < len; i++) {
        str += this.generateSlotsMarkupFromMatches(
                            propValueInfos.at(i),
                            propName,
                            slotNames.at(i));
    }

    str += '</div>';

    return str;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineMethod(
'getCSSNameForCSSTreeType',
function(propertyName, typeName) {

    /**
     * @method getCSSNameForCSSTreeType
     * @summary Returns the real (i.e. as defined by the specification) CSS name
     *     to use for a type name generated by the 'csstree' CSS parser.
     * @param {String} propertyName The property name that is currently being
     *     processed.
     * @param {String} typeName The type name generated by the csstree parser.
     * @returns {String} The real CSS name for the supplied type name.
     */

    switch (typeName) {
        case 'attachment':
            switch (propertyName) {
                case 'background-attachment':
                    return 'background-attachment';
                default:
                    return typeName;
            }
        case 'box':
            switch (propertyName) {
                case 'background-clip':
                    return 'background-clip';
                case 'background-origin':
                    return 'background-origin';
                default:
                    return typeName;
            }
        case 'bg-image':
            return 'background-image';
        case 'bg-position':
            return 'background-position';
        case 'bg-size':
            switch (propertyName) {
                case 'background':
                case 'background-size':
                    return 'background-size';
                case 'mask':
                    return 'mask-size';
                default:
                    return typeName;
            }
        case 'br-style':
            switch (propertyName) {
                case 'border':
                case 'border-style':
                    return 'border-style';
                case 'outline':
                case 'outline-style':
                    return 'outline-style';
                default:
                    return typeName;
            }
        case 'br-width':
            switch (propertyName) {
                case 'border':
                case 'border-width':
                    return 'border-width';
                case 'outline':
                case 'outline-width':
                    return 'outline-width';
                default:
                    return typeName;
            }
        case 'color':
        case 'hex-color':
        case 'hsl()':
        case 'hsla()':
        case 'named-color':
        case 'rgb()':
        case 'rgba()':
            switch (propertyName) {
                case 'background':
                case 'background-color':
                    return 'background-color';
                case 'border':
                case 'border-color':
                    return 'border-color';
                case 'color':
                    return 'color';
                case 'outline':
                case 'outline-color':
                    return 'outline-color';
                default:
                    return typeName;
            }
        case 'custom-ident':
            switch (propertyName) {
                case 'font':
                case 'font-family':
                    return 'font-family';
                case 'voice':
                case 'voice-family':
                    return 'voice-family';
                default:
                    return typeName;
            }
        case 'family-name':
            switch (propertyName) {
                case 'font':
                case 'font-family':
                    return 'font-family';
                case 'voice':
                case 'voice-family':
                    return 'voice-family';
                default:
                    return typeName;
            }
        case 'filter-function':
            switch (propertyName) {
                case 'filter':
                    return 'filter';
                default:
                    return typeName;
            }
        case 'font-variant-css21':
            return 'font-variant';
        case 'integer':
            switch (propertyName) {
                case 'z-index':
                    return 'z-index';
                default:
                    return typeName;
            }
        case 'length':
            switch (propertyName) {
                case 'font':
                case 'font-size':
                    return 'font-size';
                case 'letter-spacing':
                    return 'letter-spacing';
                default:
                    return null;
            }
        case 'length-percentage':
            switch (propertyName) {
                case 'font':
                case 'font-size':
                    return 'font-size';
                case 'letter-spacing':
                    return 'letter-spacing';
                default:
                    return typeName;
            }
        case 'number':
            switch (propertyName) {
                case 'line-height':
                    return 'line-height';
                default:
                    return typeName;
            }
        case 'numeric':
            switch (propertyName) {
                case 'font':
                    return 'line-height';
                default:
                    return typeName;
            }
        case 'repeat-style':
            switch (propertyName) {
                case 'background':
                case 'background-repeat':
                    return 'background-repeat';
                case 'mask':
                case 'mask-repeat':
                    return 'mask-repeat';
                default:
                    return typeName;
            }
        case 'percentage':
            switch (propertyName) {
                case 'background':
                    return 'background-size';
                case 'font-size':
                    return propertyName;
                default:
                    return typeName;
            }
        case 'shape':
            switch (propertyName) {
                case 'clip':
                    return 'clip';
                default:
                    return typeName;
            }
        case 'url':
            switch (propertyName) {
                case 'background':
                    return 'background-image';
                case 'mask':
                    return 'mask-image';
                default:
                    return typeName;
            }
        default:
            break;
    }

    return typeName;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineMethod(
'getCSSSlotNamesForShorthand',
function(propertyName, propertyValue) {

    /**
     * @method getCSSSlotNamesForShorthand
     * @summary Returns an Array of slot names to use for the supplied property
     *     value, assuming it is a CSS shorthand property value.
     * @description For some properties, the 'csstree' parser does not assign
     *     names to parts of a shorthand property declaration. This method will
     *     attempt to do so, given the supplied property name and property
     *     value. If no slot names can be computed for the supplied property
     *     value, an Array will be returned that contains a single value - the
     *     property name.
     * @param {String} propertyName The name of the property that is being
     *     processed.
     * @param {String} propertyValue The value of the property that is being
     *     processed.
     * @returns {String[]} An Array of slot name or a single-valued Array with
     *     the supplied property name as its sole value.
     */

    var slotNames,

        parts,
        len;

    slotNames = TP.ac();

    switch (propertyName) {

        case 'margin':

            //  'margin' is a simple 2, 3 or 4 value property shorthand.

            parts = propertyValue.split(' ');
            len = parts.getSize();

            //  Note here how we separate some of these with ' / '. This is
            //  important to displaying information about these properties in
            //  other parts of the display machinery later, so don't alter this
            //  format.
            switch (len) {
                case 1:
                    slotNames = TP.ac('margin');
                    break;
                case 2:
                    slotNames = TP.ac('margin-top / margin-bottom',
                                        'margin-right / margin-left');
                    break;
                case 3:
                    slotNames = TP.ac('margin-top',
                                        'margin-right / margin-left',
                                        'margin-bottom');
                    break;
                case 4:
                    slotNames = TP.ac('margin-top',
                                        'margin-right',
                                        'margin-bottom',
                                        'margin-left');
                    break;
                default:
                    break;
            }
            break;

        case 'padding':

            //  'padding' is a simple 2, 3 or 4 value property shorthand.

            parts = propertyValue.split(' ');
            len = parts.getSize();

            //  Note here how we separate some of these with ' / '. This is
            //  important to displaying information about these properties in
            //  other parts of the display machinery later, so don't alter this
            //  format.
            switch (len) {
                case 1:
                    slotNames = TP.ac('padding');
                    break;
                case 2:
                    slotNames = TP.ac('padding-top / padding-bottom',
                                        'padding-right / padding-left');
                    break;
                case 3:
                    slotNames = TP.ac('padding-top',
                                        'padding-right / padding-left',
                                        'padding-bottom');
                    break;
                case 4:
                    slotNames = TP.ac('padding-top',
                                        'padding-right',
                                        'padding-bottom',
                                        'padding-left');
                    break;
                default:
                    break;
            }
            break;

        default:
            parts = propertyValue.split(' ');
            len = parts.getSize();

            slotNames = TP.ac().pad(len, propertyName);
            break;
    }

    return slotNames;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineMethod(
'generateSlotsMarkupFromMatches',
function(infoData, mainPropName, aSlotName) {

    /**
     * @method generateSlotsMarkupFromMatches
     * @summary Returns a String of markup that wraps each slot as described in
     *     the supplied slot information data.
     * @param {TP.core.Hash} infoData The hash containing the slot information
     *     data. Note that the values of this hash contain *plain* JS objects
     *     and could contain nested data.
     * @param {String} mainPropName The main property name that is being
     *     processed.
     * @param {String} [slotName] An optional slot name to use when describing
     *     the slot. If this is not defined, this method has mechanisms to try
     *     to determine the slot name from the slot information data.
     * @returns {String} A String containing markup that wraps each slot
     *     contained in the slot information data.
     */

    var str,

        computedSlotName,

        slotType,
        slotName,

        len,
        i,

        data,

        slotVal;

    //  If there's a 'match' slot in the infoData, then this data is a
    //  multi-part chunk.
    if (TP.isValid(infoData.match)) {

        //  Begin generating a multi-part chunk wrapper.
        str = '<span slotmultipart="true"';

        //  If we have a piece of syntax data associated with the supplied data,
        //  then query it for a name and use that as the sub-property name.
        if (TP.isValid(infoData.syntax)) {

            //  Compute a proper CSS name as translated from the name that
            //  csstree provides.
            computedSlotName = this.getCSSNameForCSSTreeType(
                                        mainPropName, infoData.syntax.name);

            if (infoData.syntax.type === 'Property') {
                //  If it's a Property, then there is no slot type.
                slotType = null;
            } else if (infoData.syntax.type === 'Type') {
                //  The slot type will be contained in the 'name' field, since
                //  this is a 'Type' structure.
                slotType = infoData.syntax.name;
            }
        }

        //  We'll use the slot name that is either the supplied one or the
        //  computed one, if the supplied one is invalid.
        slotName = TP.ifInvalid(computedSlotName, aSlotName);

        if (TP.notEmpty(slotName) && slotName !== slotType) {
            str += ' slotname="' + slotName + '"';
        }

        if (TP.notEmpty(slotType)) {
            str += ' slottype="' + slotType + '"';
        }

        str += '>';

        //  Iterate over all pieces of the chunk and recursively generate slot
        //  markup for them.
        len = infoData.match.length;
        for (i = 0; i < len; i++) {
            data = infoData.match[i];
            str += this.generateSlotsMarkupFromMatches(
                                        data, mainPropName, null);
        }
    } else {

        //  Otherwise, the infoData should have a 'node' property that describes
        //  the slot.

        if (infoData.node) {

            //  Usually the slot type and value can be found under a 'node'
            //  property.
            slotType = infoData.node.type;
            slotVal = TP.ifInvalid(infoData.node.value, infoData.node.name);

            if (TP.isValid(slotVal.value)) {
                slotVal = slotVal.value;
            }
        } else if (infoData.value) {

            //  Sometimes the slot type and value can be found under a 'value'
            //  property.
            slotType = infoData.value.type;
            slotVal = infoData.value.value;
        } else {
            return '';
        }

        //  We short circuit 'Url' type *end* processing here (hence the token
        //  check) since we short circuit 'Url' type *begin* processing below to
        //  avoid generating a bunch of extra markup around Url types.
        if (slotType === 'Url' && infoData.token === ')') {
            return '</span>';
        }

        //  Begin generating a non-multi-part chunk wrapper.
        str = '<span';

        if (TP.notEmpty(aSlotName)) {
            str += ' slotname="' + aSlotName + '"';
        }

        str += ' slottype="' + slotType + '"';

        switch (slotType) {

            case 'Dimension':
                str += ' tibet:tag="sherpa:CSSDimensionSlotEditor"';
                str += ' slotunit="' + infoData.node.unit + '"';

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
                //  We short circuit 'Url' type *begin* processing here to avoid
                //  generating a bunch of extra markup around Url types.
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

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineMethod(
'getDescriptionContent',
function(slotName) {

    /**
     * @method getDescriptionContent
     * @summary Returns a XHTML element containing markup with the description
     *     of the supplied slot name. This is computed using our adjuster's CSS
     *     schema information.
     * @param {String} slotName The slot name to generate the description
     *     content for.
     * @returns {Element} The XHTML element containing the markup describing the
     *     property name and description.
     */

    var adjusterTPElem,

        parts,

        cssInfoDoc,

        str,

        len,
        i,

        description;

    //  Grab the adjuster element and the CSS schema information it keeps.
    adjusterTPElem = TP.byId('SherpaAdjuster', this.getNativeDocument());
    cssInfoDoc = adjusterTPElem.get('cssSchema');

    //  Split the slot name along ' / '. This is the format that is generated by
    //  the getCSSSlotNamesForShorthand method for 'shared' property slots (i.e.
    //  when you have a 3-valued margin setting, for instance). If there is no
    //  ' / ', then this will simply have the slot name in it.
    parts = slotName.split(' / ');

    str = '<span>';

    //  Iterate over the parts.
    len = parts.getSize();
    for (i = 0; i < len; i++) {

        //  Query the XML document that contains the CSS schema information for
        //  description text that matches the current part.
        description =
            TP.nodeEvaluateXPath(
                    cssInfoDoc,
                    '/$def:css/$def:properties/' +
                    '$def:entry[@name="' + parts.at(i) + '"]/$def:desc/text()');

        //  Make sure to turn the Text node into a String.
        description = TP.str(description);

        //  Generate markup around the name and the description separately so
        //  that they can be styled independently.
        str += '<span class="propertyName">' + parts.at(i) + ': </span>' +
                '<span class="propertyDescription">' + description + ' </span>';

        //  If there was more than one part and we're not at the last one yet,
        //  insert a '<br/>'.
        if (len > 1 && i < len - 1) {
            str += '<br/>';
        }
    }

    str += '</span>';

    return TP.xhtmlnode(str);
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineHandler('HideGuides',
function(aSignal) {

    /**
     * @method handleHideGuides
     * @summary Handles notification of when the receiver wants to hide any
     *     adjuster guides that are showing.
     * @param {TP.sig.HideGuides} aSignal The TIBET signal which triggered this
     *     method.
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

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineHandler('ShowGuides',
function(aSignal) {

    /**
     * @method handleShowGuides
     * @summary Handles notification of when the receiver wants to show any
     *     adjuster guides.
     * @param {TP.sig.ShowGuides} aSignal The TIBET signal which triggered this
     *     method.
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

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineHandler(
'HidePropertyNameInfo',
function(aSignal) {

    /**
     * @method handleHidePropertyNameInfo
     * @summary Handles notification of when the receiver wants to hide the
     *     property name information.
     * @param {TP.sig.HidePropertyNameInfo} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.adjuster_genericPropertyEditor} The receiver.
     */

    var adjusterTPElem;

    //  Grab the adjuster element and set it's info text to the empty String.
    adjusterTPElem = TP.byId('SherpaAdjuster', this.getNativeDocument());
    adjusterTPElem.updateInfoText('');

    aSignal.stopPropagation();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineHandler(
'HidePropertyValueInfo',
function(aSignal) {

    /**
     * @method handleHidePropertyValueInfo
     * @summary Handles notification of when the receiver wants to hide the
     *     property value information.
     * @param {TP.sig.HidePropertyValueInfo} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.adjuster_genericPropertyEditor} The receiver.
     */

    //  Close the tooltip that is showing the property value information.
    this.signal('TP.sig.CloseTooltip');

    aSignal.stopPropagation();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineHandler(
'ShowPropertyNameInfo',
function(aSignal) {

    /**
     * @method handleShowPropertyNameInfo
     * @summary Handles notification of when the receiver wants to show the
     *     property name information.
     * @param {TP.sig.ShowPropertyNameInfo} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.adjuster_genericPropertyEditor} The receiver.
     */

    var namePart,
        name,

        adjusterTPElem;

    //  Make sure that the target has a class of 'field' or we're over the wrong
    //  thing.
    if (!TP.wrap(aSignal.getTarget()).hasClass('field')) {
        return this;
    }

    //  Grab the name of slot from the name.
    namePart = TP.wrap(aSignal.getDOMTarget()).get('span[part="name"]');
    if (!TP.isKindOf(namePart, TP.dom.UIElementNode)) {
        return this;
    }

    name = namePart.getTextContent();

    //  Grab the adjuster element and set it's info text to the property name.
    adjusterTPElem = TP.byId('SherpaAdjuster', this.getNativeDocument());
    adjusterTPElem.updateInfoText(name);

    aSignal.stopPropagation();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_genericPropertyEditor.Inst.defineHandler(
'ShowPropertyValueInfo',
function(aSignal) {

    /**
     * @method handleShowPropertyValueInfo
     * @summary Handles notification of when the receiver wants to show the
     *     property value information.
     * @param {TP.sig.ShowPropertyValueInfo} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.adjuster_genericPropertyEditor} The receiver.
     */

    var targetTPElem,

        slotName,

        adjusterTPElem,
        content;

    targetTPElem = TP.wrap(aSignal.getDOMTarget());

    //  If the DOM target doesn't have a 'slotname' attribute, then try to find
    //  an ancestor that has one.
    if (!targetTPElem.hasAttribute('slotname')) {
        targetTPElem = targetTPElem.getAncestorBySelector('*[slotname]');
        if (TP.notValid(targetTPElem)) {
            return this;
        }
    }

    //  Grab the slot name.
    slotName = targetTPElem.getAttribute('slotname');

    //  Grab the adjuster element and set it's info text to the property name.
    adjusterTPElem = TP.byId('SherpaAdjuster', this.getNativeDocument());
    adjusterTPElem.updateInfoText(slotName);

    //  Grab the description content for that slot name.
    content = this.getDescriptionContent(slotName);

    //  Open a tooltip with that content. Note here how we supply:
    //      The content we want to display
    //      The 'trigger' signal - which is our responder signal.
    //      A delay of '0' - we want this to show immediately.
    //      A different tooltip ID than the standard system-level one. The
    //      adjuster will have it's own tooltip with an ID of 'AdjusterToolip'.
    //      This way we can style it independently of the system-level one.
    //      Lastly, is in that corresponding style declaration that we specify
    //      that this tooltip never fades out.
    this.signal('TP.sig.OpenTooltip',
                TP.hc('content', content,
                        'trigger', aSignal,
                        'delay', 20,
                        'overlayID', 'AdjusterTooltip'
                        ));

    aSignal.stopPropagation();

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
    valueFieldDOM.setAttribute('slotname', cssData.at('propName'));

    //  Set our 'name field' markup to the DOM structure that we generated from
    //  the markup.
    //  NB: This will process any custom slot editor markup underneath
    this.get('propertyValue').set('value', valueFieldDOM);

    //  Set the 'selector field' markup to the selector of the rule.
    this.get('propertyRuleSelector').set('value', val.at('selector'));

    if (TP.isFalse(val.at('mutable'))) {
        this.setAttribute('nonmutable', true);
    }

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
            //  Sometimes we'll get just a 'span' that contains non-live tokens,
            //  like Operators. In that case, just use their text content.
            if (TP.canInvoke(anEditor, 'getValueForCSSRule')) {
                val += anEditor.getValueForCSSRule() + ' ';
            } else {
                val += anEditor.getTextContent() + ' ';
            }
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
    TP.byId('SherpaAdjuster', this.getNativeDocument()).set('$updateRulesOnly', true);

    //  Set the property to the supplied value. Note here how we pass along the
    //  flag as to whether to broadcast a CSSStyleRule change.
    TP.styleRuleSetProperty(propRule, propName, val, updateRuleSource);

    //  Grab the halo and adjust it's size & position in case the property
    //  we were manipulating affected that.
    haloTPElem = TP.byId('SherpaHalo', this.getNativeDocument());
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

TP.sherpa.ComputedTag.defineSubtype('CSSSlotEditor');

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

    return this.getAncestorBySelector('sherpa|adjuster_genericPropertyEditor');
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

TP.sherpa.CSSDraggableSlotEditor.Inst.defineAttribute('curtain',
    TP.xpc('//*[@id="systemCurtain"]',
        TP.hc('shouldCollapse', true)
    ).set('fallbackWith', function(tpTarget) {
        return TP.xctrls.curtain.getSystemCurtainFor(
            tpTarget.getDocument(),
            'systemCurtain');
    }));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.CSSDraggableSlotEditor.Inst.defineMethod('adjustValue',
function(oldX, newX, aDirection, aSignal) {

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
     * @param {TP.sig.DOMDragMove} aSignal The TIBET signal which was generated
     *     as the dragging process takes place.
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

        curtainTPElem,

        adjuster,
        ourAdjusterEditorTPElem;

    //  Grab the current X from the native Event's screenX and set that to be
    //  the 'last X'.
    nativeEvt = aSignal.at('trigger').getPayload();
    this.$set('$lastX', TP.eventGetScreenXY(nativeEvt).first());

    //  Grab the curtain as specified by our instance attribute, configure it to
    //  be a 'tracking drag layer' and have it's own cursor.
    curtainTPElem = this.get('curtain');
    curtainTPElem.setAttribute('tibet:isdraglayer', true);
    curtainTPElem.setStyleProperty('cursor', 'ew-resize');

    //  Observe the DOMDragMove and DOMDragUp signals coming from the curtain to
    //  make adjustments as our drag session progresses and then to end it.
    this.observe(
        curtainTPElem, TP.ac('TP.sig.DOMDragMove', 'TP.sig.DOMDragUp'));

    //  Show the curtain.
    curtainTPElem.setAttribute('hidden', false);

    //  Tell the adjuster to hide all of the property editors except the one
    //  representing us.
    ourAdjusterEditorTPElem = this.getAdjusterEditorElement();

    adjuster = TP.byId('SherpaAdjuster', this.getNativeDocument());
    adjuster.hideAllExceptEditor(ourAdjusterEditorTPElem);

    //  Set the adjuster as being in 'adjusting' mode.
    adjuster.set('isAdjusting', true);

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

    //  Adjust the value.
    this.adjustValue(lastX, currentX, direction, aSignal);

    //  Update the rule. Note that this method does not propagate the rule
    //  changes to the source document. That is done when the rule update is
    //  completed in the drag up handler.
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

        curtainTPElem,

        ourAdjusterEditorTPElem;

    //  Grab the curtain as specified by our instance attribute.
    curtainTPElem = this.get('curtain');

    //  Hide the curtain.
    curtainTPElem.setAttribute('hidden', true);

    //  Remove the attribute that configures the curtain as a 'tracking drag
    //  layer' and clear the 'cursor' property that we set when the drag session
    //  started.
    curtainTPElem.removeAttribute('tibet:isdraglayer');
    curtainTPElem.clearStyleProperty('cursor');

    //  Ignore the DOMDragMove and DOMDragUp signals coming from the curtain
    //  now that our drag session is done.
    this.ignore(
        curtainTPElem, TP.ac('TP.sig.DOMDragMove', 'TP.sig.DOMDragUp'));

    //  Null out the 'last X' so that it's ready for the next dragging session.
    this.$set('$lastX', null);

    //  Tell the adjuster to show all of the property editors.
    adjuster = TP.byId('SherpaAdjuster', this.getNativeDocument());
    adjuster.showAll();

    //  NB: Make sure to do this before trying to hide the visual guides as they
    //  may be relying on this value.
    adjuster.set('isAdjusting', false);

    //  Grab the adjuster editor and tell it to hide its visual guides. This is
    //  necessary because sometimes the event sequence to show/hide those guides
    //  gets out of order and the guides won't hide.
    ourAdjusterEditorTPElem = this.getAdjusterEditorElement();
    ourAdjusterEditorTPElem.hideVisualGuides();

    //  After 100ms, go ahead and complete updating the rule. This usually
    //  entails updating the source document that rule is defined in.
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
            TP.elementGetAttribute(elem, 'slotunit', true) +
            '</span>';

    newFrag = TP.xhtmlnode(str);

    TP.elementSetContent(elem, newFrag, null, false);

    return elem;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.CSSDimensionSlotEditor.Inst.defineMethod('adjustValue',
function(oldX, newX, aDirection, aSignal) {

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
     * @param {TP.sig.DOMDragMove} aSignal The TIBET signal which was generated
     *     as the dragging process takes place.
     * @returns {TP.sherpa.CSSDimensionSlotEditor} The receiver.
     */

    var val,
        diff,

        wrapperSpan,
        slotName,
        disallowsNegative;

    //  If there wasn't a direction, then exit here.
    if (aDirection === TP.NONE) {
        return this;
    }

    //  Grab the current value.
    val = parseFloat(this.getTextContent(), 10);

    //  The difference we're going to adjust the value by is the absolute value
    //  of the new X vs. the old X.
    diff = (newX - oldX).abs();

    //  If both the Shift key and Alt key are down, then adjust the value by an
    //  order of magnitude greater. If just the Shift key is down, then adjust
    //  the value by an order of magnitude lesser.
    if (aSignal.getShiftKey()) {
        if (aSignal.getAltKey()) {
            diff *= 10;
        } else {
            diff *= 0.1;
        }
    }

    //  Grab the closest element that has a 'slotname' attribute.
    wrapperSpan = this.getAncestorBySelector('*[slotname]');
    if (TP.notValid(wrapperSpan)) {
        return this;
    }
    slotName = wrapperSpan.getAttribute('slotname');

    disallowsNegative = TP.regex.CSS_NON_NEGATIVE_PROPERTIES.test(slotName);

    //  If the direction is TP.LEFT, then subtract the difference.
    if (aDirection === TP.LEFT) {
        val = val - diff;
        if (disallowsNegative) {
            val = val.max(0);
        }
    } else {
        //  Otherwise, add the difference.
        val = val + diff;
    }

    //  If the value isn't an integer, then trim it to one decimal place.
    if (!val.isInteger()) {
        val = val.toFixed(1);
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

        slotName,

        adjusterTPElem,
        cssInfoDoc,
        valueItems,

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

    //  Grab the closest element that has a 'slotname' attribute.
    wrapperSpan = TP.nodeAncestorMatchingCSS(aSignal.getDOMTarget(),
                                                '*[slotname]');
    if (!TP.isElement(wrapperSpan)) {
        return this;
    }

    //  Grab the slot name value.
    slotName = TP.elementGetAttribute(wrapperSpan, 'slotname', true);

    //  Grab the adjuster element and the CSS schema information it keeps.
    adjusterTPElem = TP.byId('SherpaAdjuster', this.getNativeDocument());
    cssInfoDoc = adjusterTPElem.get('cssSchema');

    //  Query the XML document that contains the CSS schema information for
    //  description text that matches the current part.
    valueItems =
        TP.nodeEvaluateXPath(
                cssInfoDoc,
                '/$def:css/$def:properties/' +
                '$def:entry[@name="' + slotName + '"]/' +
                '$def:values/$def:value/@name',
                TP.NODESET);

    //  If it couldn't find any 'value' items, then just return here.
    if (TP.isEmpty(valueItems)) {
        return this;
    }

    data = TP.ac();

    //  Iterate over all of the terms and create an Array for each term, with
    //  the term as both the value and label.
    len = valueItems.getSize();
    for (i = 0; i < len; i++) {
        data.push(
            TP.ac(valueItems.at(i).nodeValue, valueItems.at(i).nodeValue)
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
            'overlayID', 'AdjusterPopup',
            'sticky', true));

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

    var originID,

        adjuster;

    originID = TP.gid(aSignal.getOrigin());
    if (!originID.endsWith('AdjusterPopup')) {
        return this;
    }

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
function(oldX, newX, aDirection, aSignal) {

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
     * @param {TP.sig.DOMDragMove} aSignal The TIBET signal which was generated
     *     as the dragging process takes place.
     * @returns {TP.sherpa.CSSPercentageSlotEditor} The receiver.
     */

    var val,
        diff,

        wrapperSpan,
        slotName,
        disallowsNegative;

    //  If there wasn't a direction, then exit here.
    if (aDirection === TP.NONE) {
        return this;
    }

    //  Grab the current value.
    val = parseFloat(this.getTextContent(), 10);

    //  The difference we're going to adjust the value by is the absolute value
    //  of the new X vs. the old X.
    diff = (newX - oldX).abs();

    //  If both the Shift key and Alt key are down, then adjust the value by an
    //  order of magnitude greater. If just the Shift key is down, then adjust
    //  the value by an order of magnitude lesser.
    if (aSignal.getShiftKey()) {
        if (aSignal.getAltKey()) {
            diff *= 10;
        } else {
            diff *= 0.1;
        }
    }

    //  Grab the closest element that has a 'slotname' attribute.
    wrapperSpan = this.getAncestorBySelector('*[slotname]');
    if (TP.notValid(wrapperSpan)) {
        return this;
    }
    slotName = wrapperSpan.getAttribute('slotname');

    disallowsNegative = TP.regex.CSS_NON_NEGATIVE_PROPERTIES.test(slotName);

    //  If the direction is TP.LEFT, then subtract the difference.
    if (aDirection === TP.LEFT) {
        val = val - diff;
        if (disallowsNegative) {
            val = val.max(0);
        }
    } else {
        //  Otherwise, add the difference.
        val = val + diff;
    }

    //  If the value isn't an integer, then trim it to one decimal place.
    if (!val.isInteger()) {
        val = val.toFixed(1);
    }

    //  Set that to be the new value.
    this.get('valuePart').setTextContent(val);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
