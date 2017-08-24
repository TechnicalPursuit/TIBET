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

//  This tag has no associated theme CSS. Note how this properties is
//  TYPE_LOCAL, by design.
TP.xctrls.propertysheet.defineAttribute('themeURI', TP.NO_RESULT);

//  This type captures no signals - it lets all signals pass through.
TP.xctrls.propertysheet.Type.defineAttribute('opaqueCapturingSignalNames', null);

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

        schemas,
        str;

    paramHash = TP.ifInvalid(params, TP.hc());

    schemas = topLevelSchema.get('schemas');

    str = '';

    schemas.perform(
        function(kvPair) {

            var schemaName,
                schema,

                schemaTypeName,
                schemaTypeNamePrefix,

                sheetAttrs,

                topLevelProperties;

            schemaName = kvPair.first();
            schema = kvPair.last();

            schemaTypeName = schema.at('name');

            schemaTypeNamePrefix = TP.escapeTypeName(schemaTypeName);

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

            str += '>';

            //  ---

            str += '<fieldset xmlns="' + TP.w3.Xmlns.XHTML + '">';

            //  ---

            topLevelProperties =
                topLevelSchema.get('topLevelProperties', schemaName);

            topLevelProperties.perform(
                function(propertyKVPair) {

                    var name,
                        id,

                        propertyDesc;

                    name = propertyKVPair.first();
                    id = schemaTypeNamePrefix + '_' + propertyKVPair.first();

                    propertyDesc = propertyKVPair.last();

                    str += this.generateContentFromPropertyDescription(
                                propertyDesc, id, name);
                }.bind(this));

            //  ---

            str += '</fieldset>';

            //  ---

            str += '</xctrls:propertysheet>';
        }.bind(this));

    return TP.tpelem(str);
});

//  ------------------------------------------------------------------------

TP.xctrls.propertysheet.Type.defineMethod(
    'generateContentFromPropertyDescription',
function(propertyDesc, id, name) {

    var str,

        label,

        enumVals,

        propertyType,
        fieldType,

        bindAspect;

    str = '<div>';

    label = propertyDesc.atIfInvalid('title', name.asStartUpper());

    enumVals = propertyDesc.at('enum');

    if (TP.notEmpty(enumVals)) {

        str += '<select' +
                ' id="' + id + '"' +
                ' bind:io="{value: ' + name + '}"' +
                '>';

        enumVals.forEach(
            function(val) {
                str += '<option value="' + val + '">' +
                        val.asStartUpper() +
                        '</option>';
            });

        str += '</select>';
    } else {
        propertyType = propertyDesc.at('type');

        if (TP.isArray(propertyType)) {
            fieldType = 'text';
        } else {
            switch (propertyType) {

                case 'boolean':

                    fieldType = 'checkbox';
                    bindAspect = 'checked';
                    break;

                default:

                    fieldType = 'text';
                    bindAspect = 'value';
                    break;
            }
        }

        str +=
            '<input' +
            ' id="' + id + '"' +
            ' type="' + fieldType + '"' +
            ' bind:io="{' + bindAspect + ': ' + name + '}"' +
            '/>';
    }

    str += '<label' +
            ' for="' + id + '"' +
            '>' +
            label + ': ' +
            '</label>';

    str += '</div>';

    return str;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
