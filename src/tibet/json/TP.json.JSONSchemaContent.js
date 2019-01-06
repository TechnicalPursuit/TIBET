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
    'definitions', TP.jpc('$.definitions'));

TP.json.JSONSchemaContent.Inst.defineAttribute(
    'allPropertiesForType', TP.jpc('$.definitions["{{0}}"]..properties'));

TP.json.JSONSchemaContent.Inst.defineAttribute(
    'allProperties', TP.jpc('$..properties'));

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

TP.json.JSONSchemaContent.Inst.defineMethod('getDefinitionName',
function(definitionIndex) {

    /**
     * @method getDefinitionName
     * @summary Returns the name of JSON schema type definition at the index
     *     provided (or the first definition if no index is provided).
     * @param {Number} [definitionIndex] The index of the definition to obtain
     *     the name of. If this is not supplied, the first definition (the one
     *     at index 0) is retrieved.
     * @returns {String} The name of the JSON schema type definition.
     */

    var index,

        queryPath,
        defName;

    index = TP.ifInvalid(definitionIndex, 0);

    queryPath = TP.jpc('$.definitions');
    defName = this.get(queryPath).getKeys().at(index);

    return defName;
});

//  ------------------------------------------------------------------------

TP.json.JSONSchemaContent.Inst.defineMethod('getSchemaTypeOfProperty',
function(aPropertyPath) {

    /**
     * @method getSchemaTypeOfProperty
     * @summary Returns the JSON schema type of the property at the 'end' of the
     *     supplied property path.
     * @description This method expects a dot-separated property path (i.e
     *     'foo.bar.baz') to return the type.
     * @param {String} aPropertyPath The path 'down to' the property to return
     *     the type of.
     * @returns {String} The JSON schema type name. Values include: 'boolean',
     *     'null', 'number', 'string', 'object', 'array'.
     */

    var defName,

        pathParts,
        query,

        queryPath,

        dataType;

    if (TP.isEmpty(aPropertyPath)) {
        return this.raise('TP.sig.InvalidValue',
                            'Property path is empty.');
    }

    //  First, get the schema definition name - this is a unique value that
    //  could be different for each schema.
    defName = this.getDefinitionName();

    //  Grab the supplied property path and split on '.' to obtain the path
    //  parts.
    pathParts = aPropertyPath.split('.');

    //  Put the definition name on the front and join all of the parts together
    //  with a '.properties.' separator. This will build the proper query path
    //  to the definition of the property.
    pathParts.unshift(defName);
    query = pathParts.join('.properties.');

    //  Build a query using the computed path prepended by the necessary
    //  prologue and appended with '.type' to get to the type definition.
    query = '$.definitions.' + query + '.type';
    queryPath = TP.jpc(query);

    dataType = this.get(queryPath);

    return dataType;
});

//  ------------------------------------------------------------------------

TP.json.JSONSchemaContent.Inst.defineMethod('populateSchemaPropertyNamesInto',
function(accumHash, schemaData, keyPrefix) {

    /**
     * @method populateSchemaPropertyNamesInto
     * @summary This method recursively descends the properties of a schema and
     *     accumulates its keys, *along with all of the subkeys* (recursively)
     *     for that property.
     * @description This method accumulates into the supplied hash a data
     *     structure that looks like this:
     *
     *     {
     *          'escodegen': ['escodegen.format', 'escodegen.format.compact'],
     *          'escodegen.format': ['escodegen.format.compact']
     *          'escodegen.format.compact: []
     *     }
     * @param {TP.core.Hash} accumHash The hash to accumulate results into.
     * @param {TP.core.Hash} [schemaData] The data of the 'current level' of the
     *     schema to process. If this is not supplied, then the top-level schema
     *     of the first 'definitions' block will be used. This parameter is
     *     meant to be used by this method when called recursively and should
     *     only be supplied by the caller if a particular sub-schema needs to be
     *     processed.
     * @param {String} [keyPrefix] The key prefix to prepend all keys generated
     *     'under' the 'current level' of the schema. This parameter is meant to
     *     be used by this method when called recursively and should only be
     *     supplied by the caller if a particular sub-schema needs to be
     *     processed.
     * @returns {String[]} An array of the keys of the properties at the
     *     'current level' of the schema plus all of the keys of the properties
     *     of the subschemas under it. This result is meant to be used by this
     *     method when called recursively. This method should be called with an
     *     empty TP.core.Hash as the first parameter, which is where the results
     *     will accumulate.
     */

    var data,

        prefix,

        currentSchema,

        allSubValues;

    //  If schema data wasn't supplied, then we go to the definitions in the
    //  first definition block and grab the schema from.
    data = TP.ifInvalid(
            schemaData,
            this.get('data').at('definitions').at(this.getDefinitionName()));

    prefix = TP.ifInvalid(keyPrefix, '');

    //  Grab the properties
    currentSchema = data.at('properties');
    if (TP.notValid(currentSchema)) {
        return TP.ac();
    }

    //  We're going to accumulate all of the 'sub values' that we encounter from
    //  this stack frame down.
    allSubValues = TP.ac();

    currentSchema.perform(
        function(kvPair) {

            var localKey,
                localSchema,

                fullKey,
                values,

                localValues,
                subValues;

            localKey = kvPair.first();
            localSchema = kvPair.last();

            //  Compute a 'full' key, based on the key prefix that was passed
            //  and the local key that we're currently processing.
            if (prefix === '') {
                fullKey = localKey;
            } else {
                fullKey = prefix + '.' + localKey;
            }

            //  Recursively descend, passing the hash that we're populating, the
            //  hash that contains the sub-schema and the full key (which will
            //  contain the fully qualified 'path' as the key prefix).
            values = this.populateSchemaPropertyNamesInto(
                                accumHash, localSchema, fullKey);

            //  Collect up the values that were returned and put the local key
            //  on the front. This will have the effect of qualifying them
            //  against the currently processing level.
            subValues = values.collect(
                            function(aKeyName) {
                                return localKey + '.' + aKeyName;
                            });

            //  Put those values into the accumulating sub values.
            allSubValues = allSubValues.concat(subValues);

            //  The values that we're going to place at this 'level' (as denoted
            //  by the 'full key') need to have the full key prepended to their
            //  key name.
            localValues = values.collect(
                            function(aKeyName) {
                                return fullKey + '.' + aKeyName;
                            });

            //  Place all of the locally-computed values into the hash at the
            //  computed key.
            accumHash.atPut(fullKey, localValues);
        }.bind(this));

    //  Return our keys with all of the sub values accumulated from levels
    //  further 'down' appended onto them.
    return currentSchema.getKeys().concat(allSubValues);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
