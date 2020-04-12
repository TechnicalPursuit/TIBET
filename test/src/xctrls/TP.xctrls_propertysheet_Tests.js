//  ========================================================================
//  xctrls:propertysheet
//  ========================================================================

TP.xctrls.propertysheet.Type.describe('TP.xctrls.propertysheet: generation from JSON Schema',
function() {

    var schema;

    //  ---

    this.before(
        function(suite, options) {

            var jsonURI,

                schemaResource;

            jsonURI = TP.uc(
                    '~lib_test/src/xctrls/xctrls_property_sheet_test_types.json');
            schemaResource = TP.uc(jsonURI).getResource(
                            TP.hc('async', false,
                                    'refresh', true,
                                    'contentType', TP.json.JSONSchemaContent));
            schema = schemaResource.get('result');
        });

    //  ---

    this.it('Simple schema', function(test, options) {

        var propertySheetTPElem,
            fieldSets,

            shallowFieldSet,
            deepFieldSet;

        propertySheetTPElem =
            TP.xctrls.propertysheet.from(
                            schema,
                            TP.hc(
                                'sheetAttrs',
                                TP.hc('bind:scope', 'urn:tibet:fluffydata'),
                                'prefix',
                                'Tester'));

        test.assert.hasAttribute(propertySheetTPElem, 'bind:scope');

        fieldSets = propertySheetTPElem.get(TP.cpc('span.fieldset'));

        shallowFieldSet = fieldSets.at(0);
        deepFieldSet = fieldSets.at(1);

        test.assert.isElement(
            TP.collapse(TP.unwrap(shallowFieldSet.get(TP.cpc('#Tester_0_TestType_id')))));
        test.assert.isElement(
            TP.collapse(TP.unwrap(shallowFieldSet.get(TP.cpc('#Tester_0_TestType_name')))));
        test.assert.isElement(
            TP.collapse(TP.unwrap(shallowFieldSet.get(TP.cpc('#Tester_0_TestType_price')))));
        test.assert.isElement(
            TP.collapse(TP.unwrap(shallowFieldSet.get(TP.cpc('#Tester_0_TestType_0_tags')))));

        test.assert.hasAttribute(deepFieldSet, 'bind:scope');

        test.assert.isElement(
            TP.collapse(TP.unwrap(deepFieldSet.get(TP.cpc('#Tester_0_TestType_dimensions_length')))));
        test.assert.isElement(
            TP.collapse(TP.unwrap(deepFieldSet.get(TP.cpc('#Tester_0_TestType_dimensions_width')))));
        test.assert.isElement(
            TP.collapse(TP.unwrap(deepFieldSet.get(TP.cpc('#Tester_0_TestType_dimensions_height')))));
    });

});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
