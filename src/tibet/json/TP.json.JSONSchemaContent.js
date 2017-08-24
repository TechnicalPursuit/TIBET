//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

//  ========================================================================
//  TP.json.JSONSchemaContent
//  ========================================================================

/**
 * @type {TP.json.JSONSchemaContent}
 */

//  ------------------------------------------------------------------------

TP.core.JSONContent.defineSubtype('json.JSONSchemaContent');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.json.JSONSchemaContent.Type.defineMethod('canConstruct',
function(data) {

    /**
     * @method canConstruct
     * @summary Returns true if the receiver can construct a valid instance
     *     given the parameters provided.
     * @param {Object} data The content data in question.
     * @returns {Boolean} Whether or not an instance of this can be constructed
     *     from the parameters provided.
     */

    //  Must be JSON for starters...but we also want to restrict it to JSON with
    //  keys hopefully unique to the JSONSchema result dataset.
    return TP.isJSONString(data) &&
            /\$schema/.test(data);
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.json.JSONSchemaContent.Inst.defineAttribute(
    'schemas', TP.jpc('$.definitions'));

TP.json.JSONSchemaContent.Inst.defineAttribute(
    'topLevelProperties', TP.jpc('$.definitions["{{0}}"]..properties'));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.json.JSONSchemaContent.Inst.defineMethod('defineTypes',
function() {

    /**
     * @method defineTypes
     * @summary Defines any JSON Schema types defined by the data of the
     *     receiver.
     * @returns {TP.json.JSONContent} The receiver.
     */

    var data,
        definitions;

    if (TP.isEmpty(data = this.get('data'))) {
        return this.raise('TP.sig.InvalidValue',
                            'JSON content is empty.');
    }

    if (TP.notValid(definitions = data.at('definitions'))) {
        return this.raise('TP.sig.InvalidContext',
                            'JSON content is not JSON Schema.');
    }

    //  Iterate over each definition found in the 'definitions' hash
    definitions.perform(
        function(kvPair) {
            var defName,
                schema,

                typeName,
                type;

            defName = kvPair.first();
            schema = kvPair.last();

            //  If the schema entry doesn't have a separate 'name' entry, then
            //  use the definition name.
            if (TP.isEmpty(typeName = schema.at('name'))) {
                typeName = defName;
            }

            //  Make sure that the typeName has a namespace.
            if (!/\./.test(typeName)) {
                typeName = 'TP.json.' + typeName;
            }

            //  If the system doesn't have a type by that name, then define one
            //  as a subtype of TP.json.JSONSchemaType.
            if (!TP.isType(type = TP.sys.getTypeByName(typeName))) {
                type = TP.json.JSONSchemaType.defineSubtype(typeName);
            }

            type.set('schema', schema);
        });

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
