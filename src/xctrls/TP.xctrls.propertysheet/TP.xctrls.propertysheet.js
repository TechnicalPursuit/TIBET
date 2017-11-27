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

TP.core.UIElementNode.defineSubtype('xctrls:propertysheet');

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
     * @summary
     * @param {TP.json.JSONSchemaContent} topLevelSchema
     */

    var paramHash,
        renderInfo,

        definitions,
        str;

    paramHash = TP.ifInvalid(params, TP.hc());

    renderInfo = paramHash.atIfInvalid('renderInfo', TP.hc());
    renderInfo.atPutIfAbsent('mainMarkupNS', TP.w3.Xmlns.XHTML);

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

            this.set('currentDefinitionName', definitionKey);

            //  ---

            str += '<xctrls:propertysheet';

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
                str += this.generateContentFromJSONSchemaArrayDescription(
                                                    definitionKey,
                                                    definitionDesc,
                                                    prefix,
                                                    renderInfo);
            } else {
                str += this.generateContentFromJSONSchemaObjectDescription(
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

TP.xctrls.propertysheet.Type.defineMethod(
    'generateContentFromJSONSchemaArrayDescription',
function(propertyKey, propertyDesc, prefix, renderInfo) {

    var subPrefix,

        items,
        str;

    subPrefix = prefix + '_';

    items = propertyDesc.at('items');

    str = '';

    if (TP.isArray(items)) {
        items.forEach(
            function(anItem, anIndex) {
                str += this.generateContentFromJSONSchema(
                                        anItem.at('type'),
                                        propertyKey,
                                        anItem,
                                        subPrefix + anIndex,
                                        renderInfo);
            }.bind(this));
    } else {
        str += this.generateContentFromJSONSchema(
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
    'generateContentFromJSONSchemaBooleanDescription',
function(propertyKey, propertyDesc, prefix, renderInfo) {

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
    'generateContentFromJSONSchemaNumberDescription',
function(propertyKey, propertyDesc, prefix, renderInfo) {

    renderInfo.atPutIfAbsent('inputType', 'number');

    return this.$generateContentFromJSONSchemaEnumeratedDescription(
                propertyKey, propertyDesc, prefix, renderInfo);
});

//  ------------------------------------------------------------------------

TP.xctrls.propertysheet.Type.defineMethod(
    'generateContentFromJSONSchemaStringDescription',
function(propertyKey, propertyDesc, prefix, renderInfo) {

    renderInfo.atPutIfAbsent('inputType', 'text');

    return this.$generateContentFromJSONSchemaEnumeratedDescription(
                propertyKey, propertyDesc, prefix, renderInfo);
});

//  ------------------------------------------------------------------------

TP.xctrls.propertysheet.Type.defineMethod(
    '$generateContentFromJSONSchemaEnumeratedDescription',
function(propertyKey, propertyDesc, prefix, renderInfo) {

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

    enumValues = propertyDesc.at('enum');

    if (renderInfo.at('mainMarkupNS') === TP.w3.Xmlns.XHTML) {

        if (TP.notEmpty(enumValues)) {

            len = enumValues.getSize();

            if (TP.isTrue(renderInfo.at('useRadios'))) {

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
                str += '<label' +
                        ' for="' + id + '"' +
                        '>' +
                        label + ': ' +
                        '</label>';

                size = renderInfo.atIfInvalid('listSize', 1);

                str += '<select id="' + id +
                        ' size="' + size + '"' +
                        '" bind:io="{value: ' + propertyKey + '}">';
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

        if (TP.notEmpty(enumValues)) {

            len = enumValues.getSize();

            if (TP.isTrue(renderInfo.at('useRadios'))) {

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
    'generateContentFromJSONSchemaObjectDescription',
function(propertyKey, propertyDesc, prefix, renderInfo) {

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

    subPrefix = prefix + '_' + propertyKey;

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

            str +=
                '<div>\n' +
                this.generateContentFromJSONSchema(
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
    'generateContentFromJSONSchema',
function(type, propertyKey, propertyDesc, prefix, renderInfo) {

    var str;

    str = '';

    switch (type) {

        case 'array':

            str += this.generateContentFromJSONSchemaArrayDescription(
                                    propertyKey,
                                    propertyDesc,
                                    prefix,
                                    renderInfo);
            break;

        case 'boolean':

            str += this.generateContentFromJSONSchemaBooleanDescription(
                                    propertyKey,
                                    propertyDesc,
                                    prefix,
                                    renderInfo);
            break;

        case 'integer':
        case 'number':

            str += this.generateContentFromJSONSchemaNumberDescription(
                                    propertyKey,
                                    propertyDesc,
                                    prefix,
                                    renderInfo);
            break;

        case 'object':

            str += this.generateContentFromJSONSchemaObjectDescription(
                                    propertyKey,
                                    propertyDesc,
                                    prefix,
                                    renderInfo);
            break;

        case 'string':

            str += this.generateContentFromJSONSchemaStringDescription(
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
//  end
//  ========================================================================
