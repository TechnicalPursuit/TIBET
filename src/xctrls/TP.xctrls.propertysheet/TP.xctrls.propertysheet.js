//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/**
 * @type {TP.xctrls.propertysheet}
 * @summary Manages propertysheet XControls.
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('xctrls:propertysheet');

TP.xctrls.propertysheet.addTraits(TP.xctrls.Element);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  This type captures no signals - it lets all signals pass through.
TP.xctrls.propertysheet.Type.defineAttribute(
                                    'opaqueCapturingSignalNames', null);

TP.xctrls.propertysheet.defineAttribute('currentDefinitionName');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xctrls.propertysheet.Type.defineMethod('fromTP_json_JSONSchemaContent',
function(topLevelSchema, params) {

    /**
     * @method fromTP_json_JSONSchemaContent
     * @summary Returns the source's content that will be hosted in an inspector
     *     bay.
     * @param {TP.json.JSONSchemaContent} topLevelSchema
     * @param {TP.core.Hash} params A hash of data available to this source to
     *     generate the content. This may have the following keys, amongst
     *     others:
     *          'renderInfo':   The rendering information used by the methods
     *                          on this object to determine what kind of GUI
     *                          constructs to generate. This may have the
     *                          following keys:
     *                              'mainMarkupNS':         The namespace of the
     *                                                      'main' markup
     *                                                      language to use to
     *                                                      generate GUI.
     *                              'useRadiosForEnums':    Whether or not to
     *                                                      use radio buttons
     *                                                      for enumerated
     *                                                      values. True or
     *                                                      false.
     *                              'inputType':            The 'input' type
     *                                                      to generate for
     *                                                      enumerated values -
     *                                                      currently either
     *                                                      'text' or 'number'.
     * @returns {TP.dom.ElementNode} The top-level element that was created
     *     from the generated content.
     */

    var paramHash,
        renderInfo,

        definitions,
        str;

    paramHash = TP.ifInvalid(params, TP.hc());

    renderInfo = paramHash.atIfInvalid('renderInfo', TP.hc());
    renderInfo.atPutIfAbsent('mainMarkupNS', TP.w3.Xmlns.XHTML);

    //  Grab the top-level definitions from the JSON Schema. Note that we only
    //  process JSON Schemas that have a 'definitions' block - we use that
    //  information to define TIBET types when appropriate.
    definitions = topLevelSchema.get('definitions');

    str = '';

    definitions.perform(
        function(kvPair) {

            var definitionKey,
                definitionDesc,

                prefix,

                definitionName,

                sheetAttrs,

                type;

            definitionKey = kvPair.first();
            definitionDesc = kvPair.last();

            prefix = paramHash.at('prefix');

            if (TP.isEmpty(prefix)) {
                definitionName = definitionDesc.at('name');
                if (TP.notEmpty(definitionName)) {
                    if (TP.isTypeName(definitionName)) {
                        prefix = definitionName.slice(
                                    0, definitionName.lastIndexOf('.'));
                        prefix = TP.escapeTypeName(prefix);
                    }
                }
            }

            //  Force it to be the empty String just in case.
            if (TP.isEmpty(prefix)) {
                prefix = '';
            }

            this.set('currentDefinitionName', definitionKey, false);

            //  ---

            str += '<xctrls:propertysheet';

            //  Iterate over the supplied sheet attributes and generate markup
            //  for them directly on the sheet.
            sheetAttrs = paramHash.at('sheetAttrs');
            if (TP.notEmpty(sheetAttrs)) {
                sheetAttrs.perform(
                    function(sheetAttrPair) {
                        str += ' ' +
                                sheetAttrPair.first() +
                                '=' +
                                '"' + sheetAttrPair.last() + '"';
                    });
            }

            str += '>\n';

            //  ---

            type = definitionDesc.at('type');

            if (type === 'array') {
                str += this.fromJSONSchemaArrayDescription(
                                                    definitionKey,
                                                    definitionDesc,
                                                    prefix,
                                                    renderInfo);
            } else {
                str += this.fromJSONSchemaObjectDescription(
                                                    definitionKey,
                                                    definitionDesc,
                                                    prefix,
                                                    renderInfo);
            }

            //  ---

            str += '</xctrls:propertysheet>\n';
        }.bind(this));

    return TP.tpelem(str);
});

//  ------------------------------------------------------------------------

TP.xctrls.propertysheet.Type.defineMethod('fromJSONSchema',
function(type, propertyKey, propertyDesc, prefix, renderInfo) {

    /**
     * @method fromJSONSchema
     * @summary Returns a chunk of generated markup that represents the given
     *     type as a GUI that will fit into a TP.xctrls.propertysheet.
     * @param {String} type The JSONSchema 'type' (i.e. 'array', 'number', etc)
     *     that the GUI is being generated for.
     * @param {String} propertyKey The key for the currently processing property
     *     in its overall data structure.
     * @param {Object} propertyDesc The POJO representing the description for the
     *     currently processing property.
     * @param {String} prefix A prefix used for indexing sub-items of the
     *     currently processing property.
     * @param {TP.core.Hash} renderInfo A hash of rendering information used by
     *     the methods on this object to determine what kind of GUI constructs
     *     to generate. This may have the following keys:
     *          'mainMarkupNS':         The namespace of the 'main' markup
     *                                  language to use to generate GUI.
     *          'useRadiosForEnums':    Whether or not to use radio buttons for
     *                                  enumerated values. True or false.
     *          'inputType':            The 'input' type to generate for
     *                                  enumerated values - currently either
     *                                  'text' or 'number'.
     * @returns {String} X(HT)ML markup representing the generated GUI.
     */

    var str;

    str = '';

    switch (type) {

        case 'array':

            str += this.fromJSONSchemaArrayDescription(
                                    propertyKey,
                                    propertyDesc,
                                    prefix,
                                    renderInfo);
            break;

        case 'boolean':

            str += this.fromJSONSchemaBooleanDescription(
                                    propertyKey,
                                    propertyDesc,
                                    prefix,
                                    renderInfo);
            break;

        case 'integer':
        case 'number':

            str += this.fromJSONSchemaNumberDescription(
                                    propertyKey,
                                    propertyDesc,
                                    prefix,
                                    renderInfo);
            break;

        case 'object':

            str += this.fromJSONSchemaObjectDescription(
                                    propertyKey,
                                    propertyDesc,
                                    prefix,
                                    renderInfo);
            break;

        case 'string':

            str += this.fromJSONSchemaStringDescription(
                                    propertyKey,
                                    propertyDesc,
                                    prefix,
                                    renderInfo);
            break;

        default:
            break;
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.xctrls.propertysheet.Type.defineMethod(
    'fromJSONSchemaArrayDescription',
function(propertyKey, propertyDesc, prefix, renderInfo) {

    /**
     * @method fromJSONSchemaArrayDescription
     * @summary Returns a chunk of generated markup that represents an Array
     *     as a GUI that will fit into a TP.xctrls.propertysheet.
     * @param {String} propertyKey The key for the currently processing property
     *     in its overall data structure.
     * @param {Object} propertyDesc The POJO representing the description for the
     *     currently processing property.
     * @param {String} prefix A prefix used for indexing sub-items of the
     *     currently processing property.
     * @param {TP.core.Hash} renderInfo A hash of rendering information used by
     *     the methods on this object to determine what kind of GUI constructs
     *     to generate. This may have the following keys:
     *          'mainMarkupNS':         The namespace of the 'main' markup
     *                                  language to use to generate GUI.
     *          'useRadiosForEnums':    Whether or not to use radio buttons for
     *                                  enumerated values. True or false.
     *          'inputType':            The 'input' type to generate for
     *                                  enumerated values - currently either
     *                                  'text' or 'number'.
     * @returns {String} X(HT)ML markup representing the generated GUI.
     */

    var subPrefix,

        items,
        str;

    subPrefix = prefix + '_';

    items = propertyDesc.at('items');

    str = '';

    if (TP.isArray(items)) {
        items.forEach(
            function(anItem, anIndex) {
                str += this.fromJSONSchema(
                                        anItem.at('type'),
                                        propertyKey,
                                        anItem,
                                        subPrefix + anIndex,
                                        renderInfo);
            }.bind(this));
    } else {
        str += this.fromJSONSchema(
                                items.at('type'),
                                propertyKey,
                                propertyDesc.at('items'),
                                subPrefix + '0',
                                renderInfo);
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.xctrls.propertysheet.Type.defineMethod(
    'fromJSONSchemaBooleanDescription',
function(propertyKey, propertyDesc, prefix, renderInfo) {

    /**
     * @method fromJSONSchemaBooleanDescription
     * @summary Returns a chunk of generated markup that represents a Boolean
     *     as a GUI that will fit into a TP.xctrls.propertysheet.
     * @param {String} propertyKey The key for the currently processing property
     *     in its overall data structure.
     * @param {Object} propertyDesc The POJO representing the description for the
     *     currently processing property.
     * @param {String} prefix A prefix used for indexing sub-items of the
     *     currently processing property.
     * @param {TP.core.Hash} renderInfo A hash of rendering information used by
     *     the methods on this object to determine what kind of GUI constructs
     *     to generate. This may have the following keys:
     *          'mainMarkupNS':         The namespace of the 'main' markup
     *                                  language to use to generate GUI.
     *          'useRadiosForEnums':    Whether or not to use radio buttons for
     *                                  enumerated values. True or false.
     *          'inputType':            The 'input' type to generate for
     *                                  enumerated values - currently either
     *                                  'text' or 'number'.
     * @returns {String} X(HT)ML markup representing the generated GUI.
     */

    var id,

        label,
        hint,

        str;

    id = prefix + '_' + propertyKey;

    label = propertyDesc.atIfInvalid('title', propertyKey.asStartUpper());

    hint = propertyDesc.at('description');

    str = '';

    if (renderInfo.at('mainMarkupNS') === TP.w3.Xmlns.XHTML) {

        str += '<label' +
                ' for="' + id + '"' +
                '>' +
                label + ': ' +
                '</label>';

        str +=
            '<input' +
            ' id="' + id + '"' +
            ' type="checkbox"' +
            ' bind:io="{' + 'checked' + ': ' + propertyKey + '}"' +
            '/>\n';

        if (TP.notEmpty(hint)) {
            str += '<xctrls:hint for="' + id + '">' +
                    hint +
                    '</xctrls:hint>\n';
        }
    } else if (renderInfo.at('mainMarkupNS') === TP.w3.Xmlns.XCONTROLS) {

        str +=
            '<xctrls:itemgroup' +
            ' id="' + id + '"' +
            ' bind:io="{' + 'value' + ': ' + propertyKey + '}"' +
            '>';

        str += '<xctrls:checkitem>\n';

        if (TP.notEmpty(hint)) {
            str += '<xctrls:hint>' +
                    hint +
                    '</xctrls:hint>\n';
        }

        str += '<xctrls:label>' + label + ':</xctrls:label>';

        str += '</xctrls:checkitem>';

        str += '</xctrls:itemgroup>';
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.xctrls.propertysheet.Type.defineMethod(
    '$fromJSONSchemaStringOrNumberDescription',
function(propertyKey, propertyDesc, prefix, renderInfo) {

    /**
     * @method $fromJSONSchemaStringOrNumberDescription
     * @summary Returns a chunk of generated markup that represents a JSON
     *     Schema String or Number with a potentially 'enumerated value' as a
     *     GUI that will fit into a TP.xctrls.propertysheet.
     * @param {String} propertyKey The key for the currently processing property
     *     in its overall data structure.
     * @param {Object} propertyDesc The POJO representing the description for the
     *     currently processing property.
     * @param {String} prefix A prefix used for indexing sub-items of the
     *     currently processing property.
     * @param {TP.core.Hash} renderInfo A hash of rendering information used by
     *     the methods on this object to determine what kind of GUI constructs
     *     to generate. This may have the following keys:
     *          'mainMarkupNS':         The namespace of the 'main' markup
     *                                  language to use to generate GUI.
     *          'useRadiosForEnums':    Whether or not to use radio buttons for
     *                                  enumerated values. True or false.
     *          'inputType':            The 'input' type to generate for
     *                                  enumerated values - currently either
     *                                  'text' or 'number'.
     * @returns {String} X(HT)ML markup representing the generated GUI.
     */

    var id,

        label,
        hint,

        str,

        enumValues,

        size,

        len,
        i;

    id = prefix + '_' + propertyKey;

    label = propertyDesc.atIfInvalid('title', propertyKey.asStartUpper());

    hint = propertyDesc.at('description');

    str = '';

    //  Grab the enumerated values that we'll use to populate various controls
    //  below.
    enumValues = propertyDesc.at('enum');

    //  We're generating XHTML markup
    if (renderInfo.at('mainMarkupNS') === TP.w3.Xmlns.XHTML) {

        if (TP.notEmpty(enumValues)) {

            len = enumValues.getSize();

            //  If the caller wanted radio buttons used for enumerations, then
            //  generate a fieldset wrapping a set of XHTML 'input type="radio"'
            //  controls.
            if (TP.isTrue(renderInfo.at('useRadiosForEnums'))) {

                str += '<label' +
                        ' for="' + id + '"' +
                        '>' +
                        label + ': ' +
                        '</label>';

                str += '<fieldset id="' + id + '">';
                for (i = 0; i < len; i++) {
                    str += '<label' +
                            ' for="' + id + '_' + i + '"' +
                            '>' +
                            enumValues.at(i) + ': ' +
                            '</label>';
                    str +=
                        '<input' +
                        ' id="' + id + '_' + i + '"' +
                        ' type="radio"' +
                        ' bind:io="{' + 'checked' + ': ' + propertyKey + '}"' +
                        '/>\n';
                }
                str += '</fieldset>';

            } else {

                //  Otherwise, generate an XHTML 'select' element.

                str += '<label' +
                        ' for="' + id + '"' +
                        '>' +
                        label + ': ' +
                        '</label>';

                size = renderInfo.atIfInvalid('listSize', 1);

                str += '<select id="' + id + '"' +
                        ' size="' + size + '"' +
                        ' bind:io="{value: ' + propertyKey + '}">';
                for (i = 0; i < len; i++) {
                    str +=
                        '<option' +
                        ' id="' + id + '_' + i + '"' +
                        ' value="' + enumValues.at(i) + '"' +
                        '>' +
                        enumValues.at(i) +
                        '</option>';
                }
                str += '</select>';
            }
        } else {

            //  This isn't an enumerated value - just generate an XHTML 'input'
            //  control with the designated 'input' type.

            str += '<label' +
                    ' for="' + id + '"' +
                    '>' +
                    label + ': ' +
                    '</label>';

            str +=
                '<input' +
                ' id="' + id + '"' +
                ' type="' + renderInfo.at('inputType') + '"' +
                ' bind:io="{' + 'value' + ': ' + propertyKey + '}"' +
                '/>\n';
        }

        if (TP.notEmpty(hint)) {
            str += '<xctrls:hint for="' + id + '">' +
                    hint +
                    '</xctrls:hint>\n';
        }
    } else if (renderInfo.at('mainMarkupNS') === TP.w3.Xmlns.XCONTROLS) {

        //  We're generating XControls markup

        if (TP.notEmpty(enumValues)) {

            len = enumValues.getSize();

            //  If the caller wanted radio buttons used for enumerations, then
            //  generate an xctrls:itemgroup wrapping a set of
            //  xctrls:radioitems.
            if (TP.isTrue(renderInfo.at('useRadiosForEnums'))) {

                str += '<label' +
                        ' for="' + id + '"' +
                        '>' +
                        label + ': ' +
                        '</label>';

                str += '<xctrls:itemgroup' +
                        ' id="' + id + '"' +
                        ' bind:io="{' + 'value' + ': ' + propertyKey + '}"' +
                        '>';

                for (i = 0; i < len; i++) {
                    str += '<xctrls:radioitem>';
                    str += '<xctrls:label>' +
                            enumValues.at(i) +
                            '</xctrls:label>';
                    str += '<xctrls:value>' +
                            enumValues.at(i) +
                            '</xctrls:value>';
                    str += '</xctrls:radioitem>';
                }

                str += '</xctrls:itemgroup>';

            } else {

                //  Otherwise, generate an xctrls:list along with an
                //  accompanying static 'tibet:data' block to populate it.

                //  Take the existing array of enumerated values and turn them
                //  into pairs representing the value at both the first and
                //  second positions. This allows us to drive the xctrls:list
                //  with labels and values being the same.
                //  So:
                //      ['foo', 'bar', 'baz']
                //  becomes:
                //      [['foo', 'foo'], ['bar', 'bar'], ['baz', 'baz']]

                enumValues = enumValues.collect(
                                function(anItem) {
                                    return TP.ac(anItem, anItem);
                                });

                str += '<tibet:data' +
                        ' name="urn:tibet:' + id + '_data"' +
                        '>' +
                        '<![CDATA[{"info": [' +
                        enumValues.asJSONSource() +
                        ']}]]>' +
                        '</tibet:data>';

                str += '<label' +
                        ' for="' + id + '"' +
                        '>' +
                        label + ': ' +
                        '</label>';

                str += '<xctrls:list id="' + id +
                        '" bind:io="{value: ' + propertyKey + ',' +
                        ' data: urn:tibet:' + id + '_data#jpath($.info)}">';
                str += '</xctrls:list>';
            }
        } else {

            //  This isn't an enumerated value - just generate an XHTML 'input'
            //  control with the designated 'input' type.

            str += '<label' +
                    ' for="' + id + '"' +
                    '>' +
                    label + ': ' +
                    '</label>';

            str +=
                '<input' +
                ' id="' + id + '"' +
                ' type="' + renderInfo.at('inputType') + '"' +
                ' bind:io="{' + 'value' + ': ' + propertyKey + '}"' +
                '/>\n';
        }

        if (TP.notEmpty(hint)) {
            str += '<xctrls:hint for="' + id + '">' +
                    hint +
                    '</xctrls:hint>\n';
        }
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.xctrls.propertysheet.Type.defineMethod(
    'fromJSONSchemaNumberDescription',
function(propertyKey, propertyDesc, prefix, renderInfo) {

    /**
     * @method fromJSONSchemaNumberDescription
     * @summary Returns a chunk of generated markup that represents a Number
     *     as a GUI that will fit into a TP.xctrls.propertysheet.
     * @param {String} propertyKey The key for the currently processing property
     *     in its overall data structure.
     * @param {Object} propertyDesc The POJO representing the description for the
     *     currently processing property.
     * @param {String} prefix A prefix used for indexing sub-items of the
     *     currently processing property.
     * @param {TP.core.Hash} renderInfo A hash of rendering information used by
     *     the methods on this object to determine what kind of GUI constructs
     *     to generate. This may have the following keys:
     *          'mainMarkupNS':         The namespace of the 'main' markup
     *                                  language to use to generate GUI.
     *          'useRadiosForEnums':    Whether or not to use radio buttons for
     *                                  enumerated values. True or false.
     *          'inputType':            The 'input' type to generate for
     *                                  enumerated values - currently either
     *                                  'text' or 'number'.
     * @returns {String} X(HT)ML markup representing the generated GUI.
     */

    renderInfo.atPutIfAbsent('inputType', 'number');

    return this.$fromJSONSchemaStringOrNumberDescription(
                propertyKey, propertyDesc, prefix, renderInfo);
});

//  ------------------------------------------------------------------------

TP.xctrls.propertysheet.Type.defineMethod(
    'fromJSONSchemaObjectDescription',
function(propertyKey, propertyDesc, prefix, renderInfo) {

    /**
     * @method fromJSONSchemaObjectDescription
     * @summary Returns a chunk of generated markup that represents an Object
     *     as a GUI that will fit into a TP.xctrls.propertysheet.
     * @param {String} propertyKey The key for the currently processing property
     *     in its overall data structure.
     * @param {Object} propertyDesc The POJO representing the description for the
     *     currently processing property.
     * @param {String} prefix A prefix used for indexing sub-items of the
     *     currently processing property.
     * @param {TP.core.Hash} renderInfo A hash of rendering information used by
     *     the methods on this object to determine what kind of GUI constructs
     *     to generate. This may have the following keys:
     *          'mainMarkupNS':         The namespace of the 'main' markup
     *                                  language to use to generate GUI.
     *          'useRadiosForEnums':    Whether or not to use radio buttons for
     *                                  enumerated values. True or false.
     *          'inputType':            The 'input' type to generate for
     *                                  enumerated values - currently either
     *                                  'text' or 'number'.
     * @returns {String} X(HT)ML markup representing the generated GUI.
     */

    var str,
        properties,

        subPrefix;

    str = '<fieldset xmlns="' + TP.w3.Xmlns.XHTML + '"';

    if (this.get('currentDefinitionName') !== propertyKey) {
        str += ' bind:scope="' + propertyKey + '">\n';

    } else {
        str += '>\n';
    }

    //  ---

    properties = propertyDesc.at('properties');

    //  Compute a 'sub prefix' that consists of the current prefix, an
    //  underscore ('_') and the property key.
    subPrefix = prefix + '_' + propertyKey;

    //  Iterate over all of the properties and generate JSON schema for each of
    //  them.
    properties.perform(
        function(propertyKVPair) {

            var objKey,
                objDesc,

                type;

            objKey = propertyKVPair.first();
            objDesc = propertyKVPair.last();

            type = objDesc.at('type');

            if (TP.isEmpty(type)) {
                return;
            }

            //  Note here how we wrap each chunk of markup generated for a
            //  property with an XHTML '<div>'. This is to providing a 'wrapping
            //  context' for further per-property styling.
            str +=
                '<div>\n' +
                this.fromJSONSchema(
                                type, objKey, objDesc, subPrefix, renderInfo) +
                '</div>\n';

        }.bind(this));

    //  ---

    str += '</fieldset>\n';

    //  ---

    return str;
});

//  ------------------------------------------------------------------------

TP.xctrls.propertysheet.Type.defineMethod(
    'fromJSONSchemaStringDescription',
function(propertyKey, propertyDesc, prefix, renderInfo) {

    /**
     * @method fromJSONSchemaStringDescription
     * @summary Returns a chunk of generated markup that represents a String
     *     as a GUI that will fit into a TP.xctrls.propertysheet.
     * @param {String} propertyKey The key for the currently processing property
     *     in its overall data structure.
     * @param {Object} propertyDesc The POJO representing the description for the
     *     currently processing property.
     * @param {String} prefix A prefix used for indexing sub-items of the
     *     currently processing property.
     * @param {TP.core.Hash} renderInfo A hash of rendering information used by
     *     the methods on this object to determine what kind of GUI constructs
     *     to generate. This may have the following keys:
     *          'mainMarkupNS':         The namespace of the 'main' markup
     *                                  language to use to generate GUI.
     *          'useRadiosForEnums':    Whether or not to use radio buttons for
     *                                  enumerated values. True or false.
     *          'inputType':            The 'input' type to generate for
     *                                  enumerated values - currently either
     *                                  'text' or 'number'.
     * @returns {String} X(HT)ML markup representing the generated GUI.
     */

    renderInfo.atPutIfAbsent('inputType', 'text');

    return this.$fromJSONSchemaStringOrNumberDescription(
                propertyKey, propertyDesc, prefix, renderInfo);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
