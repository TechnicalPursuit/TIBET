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
 * @type {TP.core.JSONSchemaType}
 * @summary The common supertype for all JSON Schema-defined data types.
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

TP.lang.Object.defineSubtype('json.JSONSchemaType');

//  ------------------------------------------------------------------------

TP.json.JSONSchemaType.Type.defineAttribute('schema');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.json.JSONSchemaType.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    this.defineDependencies('TP.extern.jjv');

    return;
});

//  ------------------------------------------------------------------------

TP.json.JSONSchemaType.Type.defineMethod('buildSchemaFrom',
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

    //  Now compile a schema from that metadata.
    schema = this.compileSchemaFromMeta(tree, definitionName);

    return schema;
});

//  ------------------------------------------------------------------------

TP.json.JSONSchemaType.Type.defineMethod('$buildArraySchemaMetaFrom',
function(tree, pojoObj) {

    /**
     * @method $buildArraySchemaMetaFrom
     * @summary Builds a metadata AST description of the supplied Array into the
     *     supplied metadata tree object.
     * @param {Object} tree The plain JavaScript object holding the metadata
     *     tree.
     * @param {Object[]} pojoObj The object to describe in the AST metadata.
     * @returns {TP.meta.json.JSONSchemaType} The receiver.
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

TP.json.JSONSchemaType.Type.defineMethod('$buildObjectSchemaMetaFrom',
function(tree, pojoObj) {

    /**
     * @method $buildObjectSchemaMetaFrom
     * @summary Builds a metadata AST description of the supplied Object into
     *     the supplied metadata tree object.
     * @param {Object} tree The plain JavaScript object holding the metadata
     *     tree.
     * @param {Object} pojoObj The object to describe in the AST metadata.
     * @returns {TP.meta.json.JSONSchemaType} The receiver.
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

TP.json.JSONSchemaType.Type.defineMethod('$buildPrimitiveSchemaMetaFrom',
function(tree, pojoObj) {

    /**
     * @method $buildPrimitiveSchemaMetaFrom
     * @summary Builds a metadata AST description of the supplied primitive
     *     value object (i.e. a non-reference object) into the supplied metadata
     *     tree object.
     * @param {Object} tree The plain JavaScript object holding the metadata
     *     tree.
     * @param {Object} pojoObj The object to describe in the AST metadata.
     * @returns {TP.meta.json.JSONSchemaType} The receiver.
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

TP.json.JSONSchemaType.Type.defineMethod('$checkForSamenessIn',
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

TP.json.JSONSchemaType.Type.defineMethod('compile',
function(tree, schema, parent) {

    /**
     * @method compile
     * @summary Builds a JSON Schema object using the supplied metadata tree.
     * @param {Object} tree The plain JavaScript object holding the metadata
     *     tree.
     * @param {Object} schema The JSON Schema object being built.
     * @param {Object} parent The parent of the current JSON Schema object being
     *     built.
     * @returns {TP.meta.json.JSONSchemaType} The receiver.
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

TP.json.JSONSchemaType.Type.defineMethod('compileSchemaFromMeta',
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

TP.json.JSONSchemaType.Type.defineMethod('fromString',
function(aString, sourceLocale) {

    /**
     * @method fromString
     * @summary Returns a new instance from the string provided by processing
     *     the String into another type.
     * @description For XML Schema data types, we have no 'parsers' - but the
     *     types themselves take a String and convert it into an instance by
     *     calling fromObject(). Therefore we override this method and just call
     *     fromObject().
     * @param {String} aString The content string to parse.
     * @param {String|TP.i18n.Locale} sourceLocale A source xml:lang or
     *     TP.i18n.Locale defining the language the string is now in. Defaults
     *     to getTargetLanguage() which is based on the current locale's
     *     language-country value.
     * @returns {Object} An instance of the receiver, if parsing of the string
     *     is successful.
     */

    return this.fromObject(aString, sourceLocale);
});

//  ------------------------------------------------------------------------

TP.json.JSONSchemaType.Type.defineMethod('getSchemaType',
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

TP.json.JSONSchemaType.Type.defineMethod('setSchema',
function(aSchema) {

    /**
     * @method setSchema
     * @summary Sets the receiver's schema to the supplied hash.
     * @param {TP.core.Hash} aSchema The schema to use for the receiver.
     * @returns {TP.meta.json.JSONSchemaType} The receiver.
     */

    var schemaJSON;

    //  First, we need to get the schema as a chunk of JSON.
    schemaJSON = aSchema.asJSONSource();

    //  Because the validator we use expects a JS object that's a 'plain object'
    //  we use the low-level JSON.parse() here.

    //  NB: We use '$set' here because we don't want to recurse back into this
    //  method.
    this.$set('schema', JSON.parse(schemaJSON));

    return this;
});

//  ------------------------------------------------------------------------

TP.json.JSONSchemaType.Type.defineMethod('validate',
function(aValue) {

    /**
     * @method validate
     * @summary Returns true if the object provided it meets all of the
     *     criteria supplied in this type.
     * @param {Object} aValue The object to validate.
     * @returns {Boolean} True if the object validates against the receiver.
     */

    var jsonSchema,
        schemaValidator,

        valJSON,
        valJS,

        schemaStr,
        results,
        typeName,

        type,
        func,

        errors;

    if (TP.notValid(aValue)) {
        return this.raise('TP.sig.InvalidParameter',
                            'No object provided to validate');
    }

    if (TP.notValid(jsonSchema = this.get('schema'))) {
        this.raise('TP.sig.InvalidObject',
                            'No valid schema for the the object.');
        return false;
    }

    if (TP.notValid(schemaValidator = TP.extern.jjv)) {
        this.raise('TP.sig.InvalidObject',
                            'No valid JSONSchema validator found.');
        return false;
    }

    if (!TP.isString(valJSON = TP.json(aValue))) {
        this.raise('TP.sig.InvalidJSON',
                            'Can\'t generate valid JSON.');
        return false;
    }

    if (TP.notValid(valJS = JSON.parse(valJSON))) {
        this.raise('TP.sig.InvalidObject',
                            'Can\'t generate object reference from JSON.');
        return false;
    }

    //  If it has a data slot, then it's object created from JSON that was
    //  generated by TIBET, which puts the object's data under a 'data' slot.
    if (TP.isValid(valJS.data)) {
        valJS = valJS.data;
    }

    //  Stringify the schema JSON and use a global regexp to loop through it
    //  looking for 'type: <typename>' constructs. If the typename isn't one
    //  that JSON Schema considers to be a built in, register a custom type
    //  handler with the validator that knows how to validate occurrences of
    //  that type.
    schemaStr = TP.json(jsonSchema);

    //  Global regexp needs a reset
    TP.regex.JSON_SCHEMA_TYPENAME_EXTRACT.lastIndex = 0;
    while (TP.isValid(results = TP.regex.JSON_SCHEMA_TYPENAME_EXTRACT.exec(
                                                                schemaStr))) {
        typeName = results.at(1);

        //  If the extracted type name is a JSON Schema built in, move on.
        if (/array|boolean|integer|number|null|object|string/.test(typeName)) {
            continue;
        }

        //  Make sure that we got a valid type that the system knows about.
        if (!TP.isType(type = TP.sys.getTypeByName(typeName))) {
            this.raise('TP.sig.InvalidType', typeName);
            return false;
        }

        /* eslint-disable no-loop-func */
        func = function(val) {
            return func.type.validate(val);
        };
        /* eslint-enable no-loop-func */

        //  We need a reference to our type inside of the function (to avoid
        //  closure problems).
        func.type = type;

        schemaValidator.addType(typeName, func);
    }

    //  Invoke the schema validator. It will return a non-empty 'errors' object
    //  if there are errors.
    errors = schemaValidator.validate(jsonSchema, valJS);

    if (TP.notEmpty(errors)) {

        this.raise('TP.sig.InvalidObject', TP.sc('Errors: ', TP.json(errors)));

        return false;
    }

    return true;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
