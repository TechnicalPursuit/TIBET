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
 * @type {TP.core.JSONSchema}
 * @summary A type that reads and defines JSON Schema-defined data types and can
 *     also build JSON schema from an example POJO object.
 * @description This type can produce a simple JSON Schema from a chunk of
 *     parsed JSON data structure. Note that the following assumptions are made:
 *
 *     1. For primitive values (i.e. not Objects or Arrays), if the value is
 *     valid (i.e. has value - even an empty string), then the schema generator
 *     will emit 'required: true' for this property.
 *
 *     2. For primitive String values, if the value's length is greater than 0,
 *     then the schema generator will emit 'minLength: 1' for this property.
 *
 *     3. For Array values, if the items in the Array are all Object structures
 *     with the same keys, then an Object structure will be built from that set
 *     of keys and types of values and the schema generator will emit
 *     'uniqueItems: true' and 'minItems: 1' for this property.
 *
 *     4. For Array values, if the items in the Array are not all Object
 *     structures with the same keys, then the schema generator will emit
 *     'uniqueItems: true' and, if the Array is not empty, it will also emit a
 *     'required' property with the items in the Array.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('json.JSONSchema');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.json.JSONSchema.Type.defineMethod('buildSchemaFrom',
function(sourceObject, definitionName) {

    /**
     * @method buildSchemaFrom
     * @summary Builds a JSON schema from the data in the supplied plain
     *     JavaScript object.
     * @param {TP.core.Hash|Object} sourceObject The JavaScript object to build
     *     the schema from.
     * @param {String} [definitionName] The name to use for the 'definition' in
     *     the JSON Schema. If not supplied, a hash of the schema text will be
     *     used as the definition name.
     * @returns {Object} The top-level JSON schema expressed in a plain
     *     JavaScript object.
     */

    var pojoObj,

        tree,
        schema;

    if (!TP.isPlainObject(sourceObject)) {
        pojoObj = sourceObject.asObject();
    } else {
        pojoObj = sourceObject;
    }

    //  NB: This method is one of the few places in TIBET where we use POJO
    //  syntax, because it matches the process of building a JSON schema so
    //  well.

    //  Initialize a tree to hold AST metadata.
    tree = {};

    //  Build up an AST metadata into the supplied tree.
    if (TP.isArray(pojoObj)) {
        this.$buildArraySchemaMetaFrom(tree, pojoObj);
    } else {
        this.$buildObjectSchemaMetaFrom(tree, pojoObj);
    }

    //  Now compute a schema from that metadata.
    schema = this.compileSchemaFromMeta(tree, definitionName);

    return schema;
});

//  ------------------------------------------------------------------------

TP.json.JSONSchema.Type.defineMethod('loadSchemaFrom',
function(aSchemaURI) {

    /**
     * @method loadSchemaFrom
     * @summary Loads a JSON schema from the supplied URI.
     * @param {TP.uri.URI} aSchemaURI The URI that the JSON schema resource is
     *     located at.
     * @returns {TP.meta.json.JSONSchema} The receiver.
     */

    var fetchParams,

        resp,
        schemaObj;

    fetchParams = TP.hc('async', false, 'resultType', TP.WRAP);

    if (aSchemaURI.getExtension() === 'json') {
        fetchParams.atPut('resultType', TP.CONTENT);
        fetchParams.atPut('contentType', TP.json.JSONSchemaContent);
    }

    resp = aSchemaURI.getResource(fetchParams);

    schemaObj = resp.get('result');

    //  This should have loaded a content object of type
    //  TP.json.JSONSchemaContent, which will have a method of 'defineTypes' on
    //  it.
    if (TP.canInvoke(schemaObj, 'defineTypes')) {
        schemaObj.defineTypes();
    } else {
        this.raise('InvalidOperation',
                    'Unable to define types from schema content.');
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.json.JSONSchema.Type.defineMethod('$buildArraySchemaMetaFrom',
function(tree, pojoObj) {

    /**
     * @method $buildArraySchemaMetaFrom
     * @summary Builds a metadata AST description of the supplied Array into the
     *     supplied metadata tree object.
     * @param {Object} tree The plain JavaScript object holding the metadata
     *     tree.
     * @param {Object[]} pojoObj The object to describe in the AST metadata.
     * @returns {TP.meta.json.JSONSchema} The receiver.
     */

    var results,

        len,
        i,

        val,

        keys;

    //  NB: This method is one of the few places in TIBET where we use POJO
    //  syntax, because it matches the process of building a JSON schema so
    //  well.

    tree.type = 'array';
    tree.children = {};

    //  If there is a JSON Object (i.e. {}) at the first spot in the Array, then
    //  check to see if there is a set of repeating objects in the Array and if
    //  they are the same composition (i.e. have the same keys) and length.
    if (TP.isPlainObject(pojoObj.first())) {

        //  Test to see if the items in the Array are all the same, structure
        //  wise, and then build an Object schema using the longest Object
        //  structure found.
        results = this.$checkForSamenessIn(pojoObj);
        if (results.at('isSame')) {

            tree.uniqueItems = true;
            tree.minItems = 1;

            return this.$buildObjectSchemaMetaFrom(tree, results.at('longest'));
        }
    }

    len = pojoObj.getSize();
    for (i = 0; i < len; i++) {

        val = pojoObj.at(i);

        if (TP.isPlainObject(val)) {

            tree.children[i] = {};
            tree.children[i].type = 'object';
            keys = TP.keys(val);

            if (TP.notEmpty(keys)) {
                tree.children[i].required = true;
            }

            this.$buildObjectSchemaMetaFrom(tree.children[i], val);

        } else if (TP.isArray(val)) {

            tree.children[i] = {};
            tree.children[i].type = 'array';
            tree.children[i].uniqueItems = true;

            if (TP.notEmpty(val)) {
                tree.children[i].required = true;
            }

            this.$buildArraySchemaMetaFrom(tree.children[i], val);

        } else {

            if (tree.type === 'object') {
                tree.children[i] = {};
                this.$buildPrimitiveSchemaMetaFrom(tree.children[i], val);
            }
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.json.JSONSchema.Type.defineMethod('$buildObjectSchemaMetaFrom',
function(tree, pojoObj) {

    /**
     * @method $buildObjectSchemaMetaFrom
     * @summary Builds a metadata AST description of the supplied Object into
     *     the supplied metadata tree object.
     * @param {Object} tree The plain JavaScript object holding the metadata
     *     tree.
     * @param {Object} pojoObj The object to describe in the AST metadata.
     * @returns {TP.meta.json.JSONSchema} The receiver.
     */

    var keys,

        len,
        i,

        key,
        val,

        schemaTypeName;

    //  NB: This method is one of the few places in TIBET where we use POJO
    //  syntax, because it matches the process of building a JSON schema so
    //  well.

    tree.type = tree.type || 'object';
    tree.children = tree.children || {};

    keys = TP.keys(pojoObj);

    len = keys.getSize();
    for (i = 0; i < len; i++) {

        key = keys.at(i);
        val = pojoObj[key];

        tree.children[key] = {};

        schemaTypeName = this.getSchemaType(val);

        switch (schemaTypeName) {

            case 'object':
                this.$buildObjectSchemaMetaFrom(tree.children[key], val);
                break;

            case 'array':
                this.$buildArraySchemaMetaFrom(tree.children[key], val);
                break;

            default:
                this.$buildPrimitiveSchemaMetaFrom(tree.children[key], val);
                break;
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.json.JSONSchema.Type.defineMethod('$buildPrimitiveSchemaMetaFrom',
function(tree, pojoObj) {

    /**
     * @method $buildPrimitiveSchemaMetaFrom
     * @summary Builds a metadata AST description of the supplied primitive
     *     value object (i.e. a non-reference object) into the supplied metadata
     *     tree object.
     * @param {Object} tree The plain JavaScript object holding the metadata
     *     tree.
     * @param {Object} pojoObj The object to describe in the AST metadata.
     * @returns {TP.meta.json.JSONSchema} The receiver.
     */

    var schemaTypeName;

    //  NB: This method is one of the few places in TIBET where we use POJO
    //  syntax, because it matches the process of building a JSON schema so
    //  well.

    schemaTypeName = this.getSchemaType(pojoObj);

    tree.type = schemaTypeName;

    if (schemaTypeName === 'string') {
        tree.minLength = pojoObj.length > 0 ? 1 : 0;
    }

    if (TP.isValid(pojoObj)) {
        tree.required = true;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.json.JSONSchema.Type.defineMethod('$checkForSamenessIn',
function(anArray) {

    /**
     * @method $checkForSamenessIn
     * @summary Check for sameness of object entries within the supplied Array.
     *     An object is the same if its keys and values are equivalent.
     * @param {Object} anArray The Array to test for sameness.
     * @returns {TP.core.Hash} A two-entry hash, 'isSame' a Boolean indicating
     *     whether or not the entries are all the same and 'longest' which is
     *     the Object entry in the Array that has the most number of keys.
     */

    var md5Vals,
        max,
        longest,

        keys,

        len,
        i,

        key,
        val,

        md5Val,

        moreKeys,

        hasSameStructure;

    md5Vals = TP.hc();
    max = 0;
    longest = null;

    keys = TP.keys(anArray);

    len = keys.getSize();
    for (i = 0; i < len; i++) {
        key = keys.at(i);

        val = anArray[key];

        if (TP.isPlainObject(val)) {
            md5Val = TP.keys(val).sort().asJSONSource().asMD5();
        } else if (TP.isArray(val)) {
            md5Val = val.sort().asJSONSource().asMD5();
        } else {
            md5Val = val.asJSONSource().asMD5();
        }

        md5Vals.atPut(md5Val, true);

        moreKeys = TP.keys(val);

        if (max === 0 || moreKeys.getSize() > max) {
            max = moreKeys.getSize();
            longest = val;
        }
    }

    hasSameStructure = md5Vals.getSize() === 1;

    return TP.hc('isSame', hasSameStructure, 'longest', longest);
});

//  ------------------------------------------------------------------------

TP.json.JSONSchema.Type.defineMethod('compile',
function(tree, schema, parent) {

    /**
     * @method compile
     * @summary Builds a JSON Schema object using the supplied metadata tree.
     * @param {Object} tree The plain JavaScript object holding the metadata
     *     tree.
     * @param {Object} schema The JSON Schema object being built.
     * @param {Object} parent The parent of the current JSON Schema object being
     *     built.
     * @returns {TP.meta.json.JSONSchema} The receiver.
     */

    var keys,

        len,
        i,

        child,

        key;

    //  NB: This method is one of the few places in TIBET where we use POJO
    //  syntax, because it matches the process of building a JSON schema so
    //  well.

    keys = TP.keys(tree.children);

    len = keys.getSize();
    for (i = 0; i < len; i++) {

        key = keys.at(i);

        child = tree.children[key];

        if (child.type === 'object') {

            if (TP.isArray(parent.required)) {
                parent.required.push(key);
            }

            schema[key] = {
                type: 'object',
                properties: {},
                required: []
            };

            this.compile(child, schema[key].properties, schema[key]);

        } else if (child.type === 'array') {

            if (TP.isArray(parent.required)) {
                parent.required.push(key);
            }

            schema[key] = {
                type: 'array',
                uniqueItems: child.uniqueItems,
                minItems: child.minItems,
                items: {
                    required: [],
                    properties: {}
                }
            };

            this.compile(child, schema[key].items.properties, schema[key]);

        } else {

            schema[key] = {};
            if (child.type) {
                schema[key].type = child.type;
            }

            if (child.minLength) {
                schema[key].minLength = child.minLength;
            }

            if (child.required) {
                if (parent.items && TP.isArray(parent.items.required)) {
                    parent.items.required.push(key);
                } else {
                    parent.required.push(key);
                }
            }
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.json.JSONSchema.Type.defineMethod('compileSchemaFromMeta',
function(tree, definitionName) {

    /**
     * @method compileSchemaFromMeta
     * @summary Builds a JSON Schema object using the supplied metadata tree and
     *     definition name.
     * @param {Object} tree The plain JavaScript object holding the metadata
     *     tree.
     * @param {String} [definitionName] The name of the JSON Schema 'definition'
     *     to generate into the schema. If not supplied, a hash of the schema
     *     text will be used as the definition name.
     * @returns {Object} The top-level JSON schema expressed in a plain
     *     JavaScript object.
     */

    var topSchema,
        schema,

        defName;

    //  NB: This method is one of the few places in TIBET where we use POJO
    //  syntax, because it matches the process of building a JSON schema so
    //  well.

    //  Define the top-level of the JSON Schema object.
    topSchema = {
        $schema: 'http://json-schema.org/draft-04/schema#',
        definitions: {
        }
    };

    if (tree.type === 'object') {

        schema = {
            description: '',
            type: 'object',
            properties: {},
            required: []
        };

        this.compile(tree, schema.properties, schema);

    } else {

        schema = {
            description: '',
            type: 'array',
            minItems: 1,
            uniqueItems: true,
            items: {
                properties: {},
                required: []
            }
        };

        this.compile(tree, schema.properties, schema.items);
    }

    //  If no definition name was supplied, then turn the schema into a JSON
    //  string, get its hashed value as an absolute number and use that.
    if (TP.isEmpty(definitionName)) {
        defName = 'Schema_' + TP.json(schema).asHashedNumber().abs();
    } else {
        defName = definitionName;
    }

    //  Register the schema under the top-level schema's 'definition' slot under
    //  the supplied definition name.
    topSchema.definitions[defName] = schema;

    return topSchema;
});

//  ------------------------------------------------------------------------

TP.json.JSONSchema.Type.defineMethod('getSchemaType',
function(aValue) {

    /**
     * @method getSchemaType
     * @summary Returns the JSON Schema type of the supplied object.
     * @param {Object} aValue The object to determine the JSON Schema type of.
     * @returns {String} The JSON Schema type of the supplied object.
     */

    if (TP.isNull(aValue)) {
        return 'null';
    }

    if (TP.isArray(aValue)) {
        return 'array';
    }

    if (TP.isPlainObject(aValue)) {
        return 'object';
    }

    if (TP.isString(aValue)) {
        return 'string';
    }

    if (TP.isNumber(aValue)) {
        if (aValue.isInteger()) {
            return 'integer';
        } else {
            return 'number';
        }
    }

    if (TP.isBoolean(aValue)) {
        return 'boolean';
    }

    if (TP.isDate(aValue)) {
        return 'string';
    }

    if (TP.isRegExp(aValue)) {
        return 'string';
    }

    if (TP.isFunction(aValue)) {
        return 'string';
    }

    return null;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
