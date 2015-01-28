//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/*
Our inheritance model makes use of a meta-object approach that allows both
types and instances to have multi-level inheritance. The design is focused
on providing appropriate meta-behavior while leveraging the built-in lookup
system for prototypes. This design and implementation are patent-pending,
as are a number of other features of TIBET.

We try to avoid the use of the word class to stay consistent with
the ECMA terminology of Type and to help avoid confusion since TIBET's
Type objects are more powerful than classes as most people know them.
TIBET's types are true instances, inheriting state and behavior from their
supertype type definitions, while also supporting local specialization.
*/

/* JSHint checking */

/* jshint evil:true,
          newcap:false
*/

//  ------------------------------------------------------------------------
//  TP.lang.RootObject - SUBTYPE CREATION SUPPORT
//  ------------------------------------------------------------------------

String.Inst.defineMethod('isJSIdentifier',
function() {

    /**
     * @name isJSIdentifier
     * @synopsis Returns true if the string follows the rules for a valid JS
     *     identifier.
     * @returns {Boolean}
     */

    return TP.regex.JS_IDENTIFIER.test(this);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asJSIdentifier',
function(ensureUniqueness) {

    /**
     * @name asJSIdentifier
     * @synopsis Returns a version of the string suitable for use as a valid JS
     *     identifier.
     * @description This method is used by the defineSubtype call to allow strings
     *     of the form "html:form" to actually act as types within the system.
     *     The return value is a mangled form of the original and the two are
     *     mapped into the metadata so that a call to the string
     *     "html:form".asType() will return the type with the properly mangled
     *     name. This allows both namespace types and operations for formatting
     *     template strings etc. to work with strings that are nice "picture
     *     clauses" but lousy JS identifiers.
     * @param {Boolean} ensureUniqueness should we unique it?
     * @returns {String}
     */

    var str,
        ensure,
        id;

    if (this.isJSIdentifier()) {
        return this;
    }

    str = this;

    //  if first char is illegal push a $ on the front
    if (!TP.regex.JS_FIRST_CHAR.test(this)) {
        str = '$' + this;
    }

    ensure = TP.ifInvalid(ensureUniqueness, true);

    TP.regex.JS_IDENT_REPLACE.lastIndex = 0;
    id = str.replace(TP.regex.JS_IDENT_REPLACE, '_');

    if (ensure && TP.isValid(TP.ifInvalid(TP[id], TP.global[id]))) {
        //  replace anything illegal elsewhere and tack on OID for
        //  uniqueness
        id = TP.genID(id);
    }

    return id;
});

//  ------------------------------------------------------------------------

//  and don't forget to add the root type to the metadata
TP.sys.addCustomType('TP.lang.RootObject', TP.lang.RootObject);

//  ------------------------------------------------------------------------
//  TP.lang.RootObject - TYPE DEFINITION
//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('asSource',
function() {

    /**
     * @name asSource
     * @synopsis Returns the receiver as a TIBET source code string, capable of
     *     recreating the type. Since TIBET doesn't use a nested structure for
     *     type construction we don't include any property construction in this
     *     output.
     * @returns {String} The receiver in valid source code form.
     */

    return this.getSupertype().getName() +
                '.defineSubtype(\'' + this.getNamespacePrefix() +
                ':' + this.getLocalName() + '\')';
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('asString',
function() {

    /**
     * @name asString
     * @synopsis Returns the receiver as a simple string.
     * @returns {String} The simple string form of the receiver.
     */

    return this.getName();
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('defineSubtype',
function(name) {

    /**
     * @name defineSubtype
     * @synopsis Defines a new subtype of the receiver and returns it. This is
     *     the core method for inheritance responsible for all the setup of a
     *     TIBET Type. Note that typenames can contain 'invalid' characters so
     *     you can create types named '(999)-999-9999' or 'MyNamespace:Mytype'
     *     etc.
     * @description Types are central to TIBET, and one of the areas where TIBET
     *     differs largely from other JavaScript libraries. TIBET's type system
     *     uses metatypes so each type object is actually an instance of a
     *     metatype. This is important because it means that unlike many other
     *     JavaScript libraries (and Java as well) type objects in TIBET inherit
     *     behavior from their parent types and can override or 'call super'
     *     along the type chain without explicit hardcoded type references. This
     *     makes TIBET a lot more like Ruby or Smalltalk than native JavaScript.
     *     TIBET then builds on this foundation in a number of ways. First,
     *     TIBET's constructor functions, method definitions, and virtually all
     *     other "ODL" or object definition methods can be overridden or
     *     extended as you require. An example is overriding construct() to
     *     construct singletons with ease. TIBET also uses types to perform data
     *     formatting, validation, and other operations by leveraging
     *     flexibility in type names. An example is
     *     '1234567890'.as('(999)-999-9999'), which sends the as() message to
     *     the string '1234567890'. That method will look for a type named
     *     '(999)-999-9999' and ask it to execute from('1234567890') resulting
     *     in (123)-456-7890 via a syntax that is easy to read, understand, and
     *     extend. NOTE that a typename suffix of either $$Type or $$Inst is
     *     illegal since these are used by TIBET to represent Metatype instances
     *     used for the type and instance 'tracks' of TIBET.
     * @param {String} name The name of the subtype, including an optional
     *     namespace prefix and colon separator.
     * @returns {TP.lang.RootObject} A new type object.
     * @todo
     */

    var parts,
        subtypeName,
        nsName,
        nsObj,
        type,
        wholeName,
        typeName,
        instName,
        realType,
        typeConstructor,
        instConstructor,
        root;

    if (TP.isEmpty(name)) {
        return this.raise('TP.sig.InvalidTypeName');
    }

    parts = name.split(/:|\./);
    switch (parts.length) {
        case 1:
            root = this.getNamespaceRoot();
            nsName = this.getNamespacePrefix();
            subtypeName = parts[0];

            break;
        case 2:
            if (parts[0] === 'APP' || parts[0] === 'TP') {
                TP.ifError() ?
                    TP.error('Invalid namespace: ' + parts[0],
                                TP.LOG) : 0;
                return;
            }

            root = this.getNamespaceRoot();
            nsName = parts[0];
            subtypeName = parts[1];

            break;
        default:
            if (parts[0] === 'TP' || parts[0] === 'APP') {
                root = parts[0];
                nsName = parts.slice(1, -1).join('.');
            } else {
                root = this.getNamespaceRoot();
                nsName = parts.slice(0, -1).join('.');
            }
            subtypeName = parts[parts.length - 1];
    }

    if (TP.regex.INTERNAL_TYPENAME.test(subtypeName)) {
        return this.raise('TP.sig.InvalidTypeName');
    }

    //  define an object that matches the namespace if necessary
    nsObj = TP.defineNamespace(nsName, root);

    wholeName = root + '.' + nsName + '.' + subtypeName;

    //  check with TIBET so we don't try to build type twice
    if (TP.sys.cfg('tibet.unique_types')) {
        //  note the false here to avoid issues with proxies
        if (TP.isType(type = TP.sys.getTypeByName(wholeName, false))) {
            return type;
        }
    }

    //  build up names for our two constructors
    typeName = wholeName + '.Type'; // TP.TYPEC;
    instName = wholeName + '.Inst'; // TP.INSTC;

    //  build a string appropriate to constructing a new subtype...we've
    //  tried a lot of ways to manage this process but this one seems to
    //  work consistently without a lot of strange issues. One interesting
    //  thing is that you must use TypeName = new Function();' rather than
    //  'function TypeName(){};' due to differences in scope handling for
    //  these two syntax variants (the Function constructor does not create
    //  closures -- it always builds the new function at the global scope).

    //  build the instance side
    /* eslint-disable no-new-func */
    TP.sys[instName] = new Function();
    /* eslint-enable no-new-func */

    instConstructor = TP.sys[instName];
    instConstructor[TP.NAME] = instName;
    instConstructor.prototype = this[TP.INSTC].$constructPrototype();
    instConstructor.prototype[TP.TYPE] = this[TP.INSTC];
    instConstructor.prototype[TP.NAME] = instName;
    instConstructor.prototype[TP.ID] = instName;

    //  build the type side
    /* eslint-disable no-new-func */
    TP.sys[typeName] = new Function();
    /* eslint-enable no-new-func */

    typeConstructor = TP.sys[typeName];
    typeConstructor[TP.NAME] = typeName;
    typeConstructor.prototype = this[TP.TYPEC].$constructPrototype();
    typeConstructor.prototype[TP.NAME] = typeName;
    typeConstructor.prototype[TP.ID] = typeName;

    //  put a custom 'getName' function on the typeConstructor that will return
    //  'TP.meta.<nsName>.<subtypeName>' as the 'public name' of this object
    //  (i.e. the type's 'meta type')
    typeConstructor.getName = function () {
        return 'TP.meta.' + nsName + '.' + subtypeName;
    };

    //  why?
    //typeConstructor.prototype.$$meta = this.$$meta;

    //  create the 'type' as an instance of the type constructor side. This
    //  is the magic juju part. The object you get back isn't a function so
    //  it gets to inherit like normal. Just don't say 'new' to it ;).
    /* eslint-disable new-cap */
    realType = new typeConstructor();
    /* eslint-enable new-cap */
    nsObj[subtypeName] = realType;

    //  assign owners for the constructors
    typeConstructor[TP.OWNER] = realType;
    instConstructor[TP.OWNER] = realType;

    //  the internal metadata contains reflection data for the type,
    //  instances of the type, locally programmed instances, supertypes
    //  etc.
    realType[TP.TYPE] = realType;
    realType[TP.TYPEC] = typeConstructor;
    realType[TP.INSTC] = instConstructor;
    realType[TP.TNAME] = wholeName;
    realType[TP.RNAME] = wholeName;
    realType[TP.SUPER] = this;
    realType[TP.SNAME] = this.getName();
    realType[TP.NAME] = wholeName;
    realType[TP.ID] = wholeName;

    //  make sure TIBET knows about the new type so it can manage the
    //  type-initialization process as needed
    TP.sys.addCustomType(wholeName, realType);
    realType.setID(wholeName);

    //  by default all types are concrete, and this forces them to have the
    //  slot so we avoid ownership checks in the isAbstract call
    realType.$abstract = false;

    //  tell the subtype about its ancestors, but note that we do it in such
    //  a way that the list is from closest ancestor to oldest
    realType[TP.ANCESTOR_NAMES] = this.getSupertypeNames().slice(0);
    realType[TP.ANCESTOR_NAMES].unshift(this.getName());
    realType[TP.ANCESTORS] = this.getSupertypes().slice(0);
    realType[TP.ANCESTORS].unshift(this);

    //  hold references for quick lookup of namespace prefix and 'local name'
    //  without the prefix.
    realType.nsRoot = root;
    realType.nsPrefix = nsName;
    realType.localName = subtypeName;

    realType.Type = realType[TP.TYPEC].prototype;
    realType.Type[TP.OWNER] = realType;
    realType.Inst = realType[TP.INSTC].prototype;
    realType.Inst[TP.OWNER] = realType;

    //  make sure we've got arrays to hold subtypes and add our new child
    this[TP.SUBTYPE_NAMES] = this[TP.SUBTYPE_NAMES] || TP.ac();
    this[TP.SUBTYPE_NAMES].push(wholeName);
    this[TP.SUBTYPES] = this[TP.SUBTYPES] || TP.ac();
    this[TP.SUBTYPES].push(realType);

    //  update global metadata records
    TP.sys.addMetadata(this, realType, TP.SUBTYPE);

    //  clear/update any deep subtype caches up the supertype chain
    if (TP.sys.$$shouldCacheDeepSubtypes()) {
        this.getSupertypes().forEach(
            function(sType) {

                var cache;

                cache = sType[TP.SUBTYPES_DEEP];
                if (TP.isArray(cache)) {
                    cache.add(realType);
                }

                cache = sType[TP.SUBTYPE_NAMES_DEEP];
                if (TP.isArray(cache)) {
                    cache.add(wholeName);
                }
            });
    }

    //  Put the type *constructor* under the 'meta' namespace as well.
    TP.defineNamespace('meta.' + nsName, root);

    if (TP.regex.HAS_PERIOD.test(nsName)) {
        // Have to iterate our way down.
        parts = nsName.split('.');
        root = self[root].meta;

        parts.forEach(function(part) {
                root = root[part];
            });

        root[subtypeName] = typeConstructor;
    } else {
        self[root].meta[nsName][subtypeName] = typeConstructor;
    }

    //  hand back the new subtype so it can be captured by caller if needed
    return realType;
});

//  ------------------------------------------------------------------------
//  REFLECTION - PART IV
//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('computeCommonSupertype',
function(otherType) {

    /**
     * @name computeCommonSupertype
     * @synopsis Finds the common supertype of both the receiver and the
     *     supplied type object.
     * @param {TP.lang.RootObject} otherType The other type to use to compare.
     * @returns {TP.lang.RootObject|null} The common supertype or null if there
     *     is no common supertype (a *very* rare occurrence).
     */

    var thisSupers,
        otherSupers,

        i,
        j;

    thisSupers = this.getSupertypes();
    otherSupers = otherType.getSupertypes();

    for (i = 0; i < thisSupers.getSize(); i++) {
        for (j = 0; j < otherSupers.getSize(); j++) {
            if (thisSupers.at(i) === otherSupers.at(j)) {
                return thisSupers.at(i);
            }
        }
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getLocalName',
function() {

    /**
     * @name getLocalName
     * @synopsis Returns the local (aka short) name of the receiver without any
     *     namespace prefix.
     * @returns {String} The receiver's local name.
     */

    return this.$get('localName');
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getNamespaceObject',
function() {

    /**
     * @name getNamespaceObject
     * @synopsis Returns the namespace object of the receiver. For example, the
     * namespace object for TP.lang.RootObject is TP.lang etc.
     * @returns {String} The receiver's namespace object.
     */

    var name;

    name = this.getName();
    name = name.slice(0, name.lastIndexOf('.'));

    return TP.sys.getObjectById(name);
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getNamespacePrefix',
function() {

    /**
     * @name getNamespacePrefix
     * @synopsis Returns the namespace (in TIBET terms) of the receiver. For
     *     example, the namespace of the TP.sig.Signal type is 'sig'.
     * @returns {String} The receiver's namespace.
     */

    return this.$get('nsPrefix');
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getNamespaceRoot',
function() {

    /**
     * @name getNamespaceRoot
     * @synopsis Returns the namespace root (in TIBET terms) of the receiver.
     *     For example, the namespace root of the TP.sig.Signal type is 'TP'.
     * @returns {String} The receiver's namespace root.
     */

    return this.$get('nsRoot');
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getSupertypes',
function() {

    /**
     * @name getSupertypes
     * @synopsis Returns an array containing the supertypes of the receiver. You
     *     should consider the return value private and make a copy if you're
     *     going to manipulate the array.
     * @returns {Array} Array of supertypes.
     * @todo
     */

    var arr,
        type;

    arr = this[TP.ANCESTORS];
    if (TP.isValid(arr)) {
        return arr;
    }

    arr = TP.ac();
    type = this;
    /* jshint boss:true */
    /* eslint-disable */
    while (type = type[TP.SUPER]) {
        arr.push(type);
    }
    /* eslint-enable */
    /* jshint boss:false */

    this[TP.ANCESTORS] = arr;
    return arr;
});

//  ------------------------------------------------------------------------

//  pre-declare a helper type-acquisition function
TP.sys.defineMethod('$$typeNameFunc',
function(it) {

    return it.getTypeName();
});

//  ------------------------------------------------------------------------
//  INSTANCE CREATION
//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('$init',
function() {

    /**
     * @name $init
     * @synopsis Provides low-level initialization of a new instance.
     * @description The main task here is to construct specific instances of
     *     reference type attributes on each new instance based on information
     *     from the add*Attribute calls made when defining the type. Since
     *     reference type attributes do NOT support copy-on-write semantics this
     *     hook can catch subtle bugs that arise when you expect that the array
     *     you modifed is being copied down but instead it is being shared
     *     across all instances. By placing reference type attributes directly
     *     on the instance via the $init call we avoid the bugs while also
     *     avoiding the trouble for programmers of having to deal with the
     *     difference.
     * @returns {Object}
     */

    //  TODO: link this with an array of reference type attributes defined
    //  for the type via add*Attribute and iterate over the array to install
    //  the listed attributes on the specific instance. This would solve
    //  the copy-on-write issues here.

    return this;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('init',
function() {

    /**
     * @name init
     * @synopsis Initializes a new object instance. The default implementation
     *     simply returns.
     * @description Subclasses can override this method to do proper instance
     *     initialization. This method is called by the construct() methods to
     *     allow each class to 'do the right thing' for each instance without
     *     placing initialization code in the constructor...which would break
     *     dynamic attribute inheritance.
     * @returns {Object}
     * @todo
     */

    return this;
});

//  ------------------------------------------------------------------------
//  Abstract instance creation
//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('isAbstract',
function(aFlag) {

    /**
     * @name isAbstract
     * @synopsis Returns true if the receiver is abstract.
     * @description In TIBET this means instances can be constructed as long as
     *     a valid subtype can be found to provide them. Instances of a subtype
     *     are, by definition, an instance of their supertype so this is a valid
     *     OO concept and offers a lot of support for both localization and
     *     parameter-specific type specialization. If aFlag is passed this
     *     method doubles as a set() call.
     * @param {Boolean} aFlag Value to set for abstract.
     * @returns {Boolean}
     */

    if (TP.isBoolean(aFlag)) {
        this.$abstract = aFlag;
    }

    return this.$abstract;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('canConstruct',
function() {

    /**
     * @name canConstruct
     * @synopsis Returns true if the receiver can construct a valid instance
     *     given the parameters provided. This method is invoked by supertype
     *     processing of the constructViaSubtype method when searching for a
     *     potential subtype to manage the instance.
     * @returns {Boolean}
     */

    //  note that the default is false, subtypes must actively validate
    //  that they can handle the instance creation request
    return false;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('constructForSignal',
function(aSignal) {

    /**
     * @name constructForSignal
     * @synopsis Constructs a new instance intended to handle the signal
     *     provided. This method defaults to calling construct() to acquire the
     *     instance and should be overridden for types which require parameters
     *     for successful instance creation.
     * @param {TP.core.Signal} aSignal The signal instance to build for.
     * @returns {Object} A new instance, if possible.
     * @todo
     */

    return this.construct();
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('constructViaSubtype',
function() {

    /**
     * @name constructViaSubtype
     * @synopsis Returns a new instance of the receiving type in the form of an
     *     instance of a viable subtype.
     * @description This method supports a variety of "localization" mechanisms
     *     which rely on a common TIBET design pattern referred to as "type
     *     clustering". This allows a common abstract supertype such as
     *     TP.core.Browser to be messaged for a new instance and for different
     *     browsers to return appropriately "localized" subtype instances such
     *     as TP.core.IEBrowser. This strategy is used extensively by
     *     TP.core.Node and TP.core.URI to return the proper subtypes for your
     *     content.
     * @returns {Object}
     */

    var type,
        inst;

    type = this.getConcreteType.apply(this, arguments);

    //  don't continue if we didnt' find a type or we'd recurse due to
    //  finding the receiver and trying to restart at construct
    if (TP.notValid(type) || (type === this)) {
        this.raise('TP.sig.NoConcreteType');
        return;
    }

    inst = type.construct.apply(type, arguments);

    return inst;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getConcreteType',
function() {

    /**
     * @name getConcreteType
     * @synopsis Returns the concrete type for the receiver. When the receiving
     *     type is abstract this will not be the receiver, but when the receiver
     *     is abstract the type returned is the one that would be used to
     *     construct an instance based on the incoming parameters.
     * @returns {Object}
     */

    var subtypes,
        subtype,
        args;

    //  TODO:   if we've got a cached answer to the question of which
    //          subtype to use then use it. (complexity here is that we
    //          might need different types based on the parameter values -
    //          zero params might be valid for caching though)

    //  grab our list of subtypes, note that we descend the tree here which
    //  makes this a particularly slow routine for large trees
    subtypes = this.getSubtypes(true);
    if (TP.isEmpty(subtypes)) {
        return;
    }

    //  sort by depth so we work from most specific to least specific
    subtypes.sort(TP.SUBTYPE_SORT).reverse();

    //  capture arguments in this scope for passage to inner scope. if we
    //  don't do this the "arguments" reference in the inner function will
    //  refer to the 'item' rather than the args passed to this function
    args = arguments;

    //  iterate across all subtypes and return first one claiming it can
    //  resolve our instance request
    subtype = subtypes.detect(
        function(item) {

            if (TP.isValid(item)) {
                return item.canConstruct.apply(item, args);
            }

            return false;
    });

    return subtype;
});

//  ------------------------------------------------------------------------
//  TYPE CONVERSION - INBOUND
//  ------------------------------------------------------------------------

/*
TIBET uses types extensively and often converts between them to support the work
of the inferencer. The standard pattern methods for type conversion in TIBET are
as() and from(), which make use of the "best method" pattern to find the best
possible match. as() and from() also leverage double-dispatch semantics to help
get the best possible conversion.

The from() side of things is considered "inbound" conversion while the as() side
of things is considered "outbound" conversion.

For inbound conversion the processing involves looking for a best fit from*
method. When the inbound object is a String the logic of fromString takes over
and delegates to the parse() function. Parse functionality also uses a best
match approach, but with a few extras. See parse() for more info.
*/

TP.FunctionProto.defineAttribute('parsers');
TP.lang.RootObject.Type.defineAttribute('parsers');

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('from',
function(anObj) {

    /**
     * @name from
     * @synopsis Constructs a new instance from the incoming object.
     * @description This method attempts to find a method like from[Type]() for
     *     the object's type to do a custom conversion. Note that this method
     *     doesn't attempt to use as() since that method calls from() as its
     *     last resort. You should avoid overriding this method and work with
     *     specific from*() methods instead.
     * @param {Object} anObj The source object.
     * @returns {Object} A new instance of the receiver.
     */

    //  strings are the most common so let's speed up that dispatch
    if (TP.isString(anObj)) {
        return this.fromString.apply(this, arguments);
    }

    return this.callBestMethod(arguments, anObj,
                                'from', null,
                                'fromObject');
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('from',
function(anObj) {

    /**
     * @name from
     * @synopsis Constructs a new instance from the incoming object.
     * @description This method attempts to find a method like from[Type]() for
     *     the object's type to do a custom conversion. Note that this method
     *     doesn't attempt to use as() since that method calls from() as its
     *     last resort. You should avoid overriding this method and work with
     *     specific from*() methods instead.
     * @param {Object} anObj The source object.
     * @returns {Object} A new instance of the receiver.
     */

    //  strings are the most common so let's speed up that dispatch
    if (TP.isString(anObj)) {
        return this.fromString.apply(this, arguments);
    }

    return this.callBestMethod(arguments, anObj,
                                'from', null,
                                'fromObject');
});

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('fromObject',
function(anObj) {

    /**
     * @name fromObject
     * @synopsis Constructs a new instance from the incoming object. The default
     *     implementation forwards to construct.
     * @returns {Object} A new instance of the receiver.
     * @todo
     */

    return this.construct(anObj);
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('fromObject',
function(anObj) {

    /**
     * @name fromObject
     * @synopsis Constructs a new instance from the incoming object. The default
     *     implementation forwards to construct.
     * @param {Object} anObj The source object.
     * @returns {Object} A new instance of the receiver.
     * @todo
     */

    return this.construct.apply(this, arguments);
});

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('fromString',
function(aString, sourceLocale) {

    /**
     * @name fromString
     * @synopsis Returns a new instance from the string provided by invoking the
     *     receiver's parse() functionality.
     * @param {String} aString The content string to parse.
     * @param {String|TP.core.Locale} sourceLocale A source xml:lang or
     *     TP.core.Locale defining the language the string is now in. Defaults
     *     to 'getTargetLanguage()' which is based on the current locale's
     *     language-country value.
     * @returns {Object} An instance of the receiver, if parsing of the string
     *     is successful.
     * @todo
     */

    return this.parse(aString, sourceLocale);
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('fromString',
function(aString, sourceLocale) {

    /**
     * @name fromString
     * @synopsis Returns a new instance from the string provided by invoking the
     *     receiver's parse() functionality.
     * @param {String} aString The content string to parse.
     * @param {String|TP.core.Locale} sourceLocale A source xml:lang or
     *     TP.core.Locale defining the language the string is now in. Defaults
     *     to getTargetLanguage() which is based on the current locale's
     *     language-country value.
     * @returns {Object} An instance of the receiver, if parsing of the string
     *     is successful.
     * @todo
     */

    return this.parse(aString, sourceLocale);
});

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('addParser',
function(aParser) {

    /**
     * @name addParser
     * @synopsis Adds a registered parser to the receiving type. Note that this
     *     only applies to those instances of function which are actual Types.
     * @description Note that parsers are executed in the order in which they're
     *     registered unless you manually adjust the parser list.
     * @param {Object} aParser An object implementing the 'parse' method. By
     *     default this means types and functions.
     * @returns {TP.FunctionProto} The receiver.
     * @todo
     */

    var parsers;

    //  this method is only appropriate for types
    if (!TP.isType(this)) {
        return TP.raise(this, 'TP.sig.InvalidOperation');
    }

    if (!TP.canInvoke(aParser, 'parse')) {
        return this.raise('TP.sig.InvalidParser',
                'Registered parsers must implement \'parse\'');
    }

    //  build the parser list as needed
    if (TP.notValid(parsers = this.$get('parsers'))) {
        parsers = TP.ac();
        this.$set('parsers', parsers, false);
    }

    parsers.push(aParser);

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('addParser',
function(aParser) {

    /**
     * @name addParser
     * @synopsis Adds a registered parser to the receiving type. Note that this
     *     only applies to those instances of function which are actual Types.
     * @description Note that parsers are executed in the order in which they're
     *     registered unless you manually adjust the parser list.
     * @param {Object} aParser An object implementing the 'parse' method. By
     *     default this means types and functions.
     * @returns {TP.lang.RootObject} The receiver.
     * @todo
     */

    var parsers;

    if (!TP.canInvoke(aParser, 'parse')) {
        return this.raise('TP.sig.InvalidParser',
                'Registered parsers must implement \'parse\'');
    }

    //  build the parser list as needed
    if (TP.notValid(parsers = this.$get('parsers'))) {
        parsers = TP.ac();
        this.$set('parsers', parsers, false);
    }

    parsers.push(aParser);

    return this;
});

//  ------------------------------------------------------------------------

TP.FunctionProto.defineMethod('parse',
function(aString, sourceLocale) {

    /**
     * @name parse
     * @synopsis Parses aString using the best method possible given the
     *     receiver's type.
     * @param {String} aString The content string to parse.
     * @param {String|TP.core.Locale} sourceLocale A source xml:lang or
     *     TP.core.Locale defining the language the string is now in. Defaults
     *     to 'getTargetLanguage()' which is based on the current locale's
     *     language-country value.
     * @returns {Object} The result of the parse. This is null when the parse
     *     fails.
     * @todo
     */

    var parsers,
        dat;

    //  standalone functions implement parse by invoking themselves. note
    //  that when parsing in this fashion the return value isn't clearly an
    //  instance of the receiver (i.e. not going to produce a Function).
    if (!TP.isType(this)) {
        return this(aString, sourceLocale);
    }

    //  if explicit list is provided use that, otherwise use default
    parsers = this.$get('parsers');
    if (TP.notEmpty(parsers)) {
        //  might be a single function rather than an array of them
        if (TP.isCallable(parsers)) {
            dat = parsers(aString, this);
        } else {
            //  run until the first successful parse, then stop
            dat = parsers.detectInvoke('parse', aString, this);
        }

        //  NOTE that strictly speaking the result should be an instance of
        //  the receiver's type, but we don't test that explicity here
        if (TP.isValid(dat)) {
            return dat;
        }
    }

    //  context, specializer, prefix, suffix, fallback, arglist
    return this.callBestMethod(arguments, aString,
                                'parse', null,
                                null,
                                TP.ac(aString, sourceLocale));
});

//  ------------------------------------------------------------------------

//  save original on Date to try it first. As of ECMAScript E5, it parses
//  the old JS format and ISO8601 dates, which is substantially better than
//  it used to do in old versions of JS (where it was basically useless).
Date.$$parse = Date.parse;

//  ------------------------------------------------------------------------

Date.Type.defineMethod('parse',
function(aString) {

    /**
     * @name parse
     * @synopsis Parses the supplied String and returns the number of
     *     milliseconds January 1, 1970, 00:00:00 UTC. represented by a Date
     *     within the String.
     * @description This method returns a new Date by parsing the supplied
     *     content String. It first tries the built in Date.parse() method and,
     *     if that doesn't produce Date output, it will try any other parsers it
     *     has been supplied with.
     * @param {String} aString The content string to parse.
     * @returns {Number} A new Number created from parsing the Date supplied in
     *     the content String.
     */

    var newDate,
        dateInMS;

    if (TP.isDate(newDate = this.callNextMethod())) {
        //  Need to be API-compatible with the native Date.parse() (which is
        //  now Date.$$parse())
        return newDate.getTime();
    }

    //  See if the native version of 'Date.parse' will work - its gotten
    //  better in ECMAScript edition 5.
    if (TP.isNumber(dateInMS = Date.$$parse(aString))) {
        return dateInMS;
    }

    //  Couldn't get a Date from either mechanism - return NaN as per ECMA
    //  spec.
    return NaN;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('parse',
function(aString, sourceLocale) {

    /**
     * @name parse
     * @synopsis Parses aString using the best method possible given the
     *     receiver and the target object/type.
     * @description The parser search attempts to locate methods of the form
     *     'parse[Type]String' where Type is replaced with the target's type or
     *     one of its supertypes. For example, a Date would try to find
     *     'parseDateString'.
     * @param {String} aString The content string to parse.
     * @param {String|TP.core.Locale} sourceLocale A source xml:lang or
     *     TP.core.Locale defining the language the string is now in. Defaults
     *     to getTargetLanguage() which is based on the current locale's
     *     language-country value.
     * @returns {Object} The result of the parse. This is null when the parse
     *     fails.
     * @todo
     */

    var parsers,
        dat;

    //  if explicit list is provided use that, otherwise use default
    parsers = this.$get('parsers');
    if (TP.notEmpty(parsers)) {
        //  might be a single function rather than an array of them
        if (TP.isCallable(parsers)) {
            dat = parsers(aString, this);
        } else {
            //  run until the first successful parse, then stop
            dat = parsers.detectInvoke('parse', aString, this);
        }

        //  NOTE that strictly speaking the result should be an instance of
        //  the receiver's type, but we don't test that explicity here
        if (TP.isValid(dat)) {
            return dat;
        }
    }

    //  context, specializer, prefix, suffix, fallback, arglist
    return this.callBestMethod(arguments, aString,
                                'parse', null,
                                null,
                                TP.ac(aString, sourceLocale));
});

//  ------------------------------------------------------------------------
//  TYPE CONVERSION - OUTBOUND
//  ------------------------------------------------------------------------

/*
The outbound side of type conversion is implemented by the as/format chain of
methods, which mirror the from/parse chain used for inbound conversions up to a
point. The as() method is focused primarily on type conversions but provides a
common entry point for formatting. This is somewhat consistent with the idea
that custom formats are a form of custom String subtype, but we don't go quite
that far unless the format is particularly complex.
Still, by leveraging as() we leave formatting open to type specialization.

Typical processing for as() will look for a type as the first parameter. When
this parameter isn't a Type or the name of a known Type it will be treated as a
formatting string and the 'transform' call will be invoked. The 'transform' call
leverages reflection to see if it can find a method specific to the format, then
tries to leverage the format as a template string.
*/

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('as',
function(typeOrFormat, formatParams) {

    /**
     * @name as
     * @synopsis Returns a new object representing the receiver as an instance
     *     of the type provided, or formatted as the format specification
     *     defines.
     * @description This method attempts to convert an object to either another
     *     type or to a string of a specific form. The former process is
     *     performed by using reflection to locate possible methods for
     *     converting the receiver. When the parameter doesn't appear to
     *     represent a type name this method defers to the transform() method
     *     which will treat the inbound string as a format template, not a type.
     *     See the 'transform' method for more information.
     * @param {TP.lang.RootObject|String} typeOrFormat The type or format object
     *     or String desired.
     * @param {Object} formatParams Optional conversion parameters.
     * @example Supplied type/format is a 'substitution' String and the receiver
     *     is a String:
     *     <code>
     *          '4582022'.as('@{@@@-@@@@}');
     *          <samp>458-2022</samp>
     *     </code> Supplied type/format is a 'substitution' String and the
     *     receiver is not a String:
     *     <code>
     *          (22).as('#{##.00}');
     *          <samp>22.00</samp>
     *     </code>
     *     <code>
     *          TP.dc().as('%{d}');
     *          <samp>27</samp>
     *     </code> Supplied type/format is a String which names a 'format token'
     *     and the receiver is a String. Because the receiver is a String here,
     *     the 'format token' should correspond to a method name on the String
     *     type without the 'as' portion (i.e. 'startUpper'):
     *     <code>
     *          'bill'.as('startUpper');
     *          <samp>Bill</samp>
     *     </code> Supplied type/format is a String which names a 'format token'
     *     and the receiver is not a String. This 'format token' acts as an
     *     argument to the receiver type's 'format' method (i.e. 'YYYY' is
     *     defined on the TP.iso.ISO8601 type and String's transformDate method
     *     is coded to find that token on that type).
     *     <code>
     *          TP.dc().as('YYYY');
     *          <samp>2008</samp>
     *     </code> Supplied type/format is a String which contains a 'formatting
     *     template' and the receiver is an object with named properties.
     *     <code>
     *          TP.hc('fname', 'bill').as('My first name is: {{fname}}');
     *          <samp>My first name is: Bill</samp>
     *     </code>
     *     <code>
     *          TP.ac(1, 2, 3).as('The second item is: {{1}}', TP.hc('repeat',
     *         false));
     *          <samp>The second item is: 2</samp>
     *     </code>
     *     <code>
     *          (22).as('It\'s value is: {{value}}');
     *          <samp>It's value is: 22</samp>
     *     </code> Supplied type/format is not a String - its a TIBET Type
     *     object. The receiver may implement an 'as<type/format' method or the
     *     type/format may implement a 'from<type>' method, where <type> is the
     *     receiver's type.
     *     <code>
     *          foo = TP.ac(1, 2 ,TP.hc('foo', 'bar')).as('TP.core.XMLRPCNode');
     *          <samp>[object Element]</samp>
     *          TP.str(foo);
     *          <samp>... string representation of foo ...</samp>
     *     </code> Supplied type/format is not a String, but its not a Type
     *     either. It could be a Function or another Object that implements the
     *     'format' (or 'format<Type>') method.
     *     <code>
     *          (22).as(function (anObj) {return 'His age is: ' + anObj});
     *          <samp>His age is: 22</samp>
     *     </code>
     *     <code>
     *          transformObj = TP.lang.Object.construct();
     *          transformObj.addLocalMethod('transform', function (anObj)
     *         {return 'The value is: ' + anObj});
     *          (22).as(transformObj);
     *          <samp>The value is: 22</samp>
     *     </code>
     *     <code>
     *          transformObj = TP.lang.Object.construct();
     *          transformObj.addLocalMethod('transformNumber', function (anObj)
     *         {return 'This is a Number: ' + anObj});
     *          transformObj.addLocalMethod('transformDate', function (anObj)
     *         {return 'This is a Date: ' + anObj});
     *          (22).as(transformObj);
     *          <samp>This is a Number: 22</samp>
     *          TP.dc().as(transformObj);
     *          <samp>This is a Date: Sat Dec 27 2008 17:31:27 GMT-0600
     *         (CST)</samp>
     *     </code>
     * @returns {Object} An instance of the desired type/format.
     * @todo
     */

    var funcName,
        type,
        typeName,
        args;

    if (TP.notValid(typeOrFormat)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  try to jump quickly to asString() when it's clearly not a type name
    if (TP.isString(typeOrFormat)) {
        //  certain names map to 'as' methods that are native here
        funcName = 'as' + typeOrFormat.asStartUpper();
        if (TP.canInvoke(this, funcName)) {
            return this[funcName](formatParams);
        }

        //  not explicitly a bad type name, so see if we can locate the
        //  type. If not then its likely a registered format name, but
        //  either way we'll defer to format
        if (TP.notValid(type = TP.sys.require(typeOrFormat))) {
            return typeOrFormat.transform(this, formatParams);
        }

        typeName = typeOrFormat;
    } else if (!TP.isType(typeOrFormat)) {
        //  It's not a String and not a Type either... might be a Function
        //  or some other kind of object... call 'transform' on that object
        //  and let it try...

        if (TP.canInvoke(typeOrFormat, 'transform')) {
            switch (arguments.length) {
                case 1:
                    return typeOrFormat.transform(this);
                case 2:
                    return typeOrFormat.transform(this, formatParams);
                default:
                    args = TP.args(arguments);
                    args.atPut(0, this);
                    return typeOrFormat.transform.apply(typeOrFormat, args);
            }
        } else {
            //  Not a String, not a Type, not an object that can perform a
            //  'transform'
            return;
        }
    } else {
        type = typeOrFormat;
        if (TP.canInvoke(type, 'getName')) {
            typeName = type.getName();
        }
    }

    //  don't convert things that are already the target type
    if (TP.isKindOf(this, type)) {
        return this;
    }

    //  if we can get the name of the type we're trying to convert to then
    //  we can look for an instance or type method that can convert for us
    if (TP.notEmpty(typeName)) {
        funcName = 'as' + TP.escapeTypeName(typeName);
        if (!TP.canInvoke(this, funcName)) {
            funcName = 'as' +
                        TP.escapeTypeName(typeName.asJSIdentifier(false));
        }

        //  If we can invoke the 'as' method directly, do it.
        if (TP.canInvoke(this, funcName)) {
            switch (arguments.length) {
                case 1:
                    return this[funcName]();
                case 2:
                    return this[funcName](formatParams);
                default:
                    args = TP.args(arguments, 1);
                    return this[funcName].apply(this, args);
            }
        }
    }

    //  if we got here we're either talking to a type that can't tell us
    //  what its name is (not good) or the receiver doesn't implement a
    //  decent as() variant for that type. In either case however all we can
    //  do is hope the type implements from() and we'll try that route.
    if (TP.canInvoke(type, 'from')) {
        switch (arguments.length) {
            case 1:
                return type.from(this);
            case 2:
                return type.from(this, formatParams);
            default:
                //  have to build up an argument array that includes the
                //  receiver as the first argument rather than the type
                args = TP.args(arguments);
                args.atPut(0, this);
                return type.from.apply(type, args);
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('format',
function(aFormat, formatParams) {

    /**
     * @name format
     * @synopsis Formats the receiver using the format provided, formatting the
     *     object and possibly using any optional formatting specification
     *     provided.
     * @description In this method, the receiver is the object that is formatted
     *     using the format specification defined by the aFormat parameter.
     *
     *     For example, a string with {{varname}} entries, or which names a
     *     specific Type, will cause the receiver to be formatted using the
     *     string as a template, or the Type as a formatter by redispatching to
     *     that object's 'transform' call.
     *
     *     This method will also pass the optional formatParams parameter on to
     *     the 'transform' call.
     * @param {String} aFormat The format specification to format the receiver.
     * @param {TP.lang.Hash|TP.core.Request} formatParams Optional format
     *     parameters. These are parameters to a template transform.
     * @returns {String} The formatted output.
     * @todo
     */

    if (TP.isValid(aFormat)) {
        return aFormat.transform(this, formatParams);
    }

    return;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('transformDate',
function(aDate, transformParams) {

    /**
     * @name transformDate
     * @synopsis Transforms the supplied Date using the formats provided by the
     *     'substitute' call.
     * @param {Date} aDate The Date object to format.
     * @param {TP.lang.Hash|TP.core.Request} transformParams Optional format
     *     parameters. These should have keys that are used during a keyed
     *     substitution (i.e. Date.FORMATS).
     * @returns {String} The formatted output.
     * @todo
     */

    var format,
        str;

    str = this.toString();

    if (TP.canInvoke(transformParams, 'at')) {
        format = transformParams.at(str);
    }

    if (TP.notValid(format)) {
        //  ISO8601 already defines a number of nice options...but they're
        //  uppercased in storage. See if this format is stored there. If
        //  not, the Date type also can/should define options...
        if (TP.notValid(format = TP.iso.ISO8601.FORMATS.at(str))) {
            if (TP.notValid(format = Date.FORMATS.at(str))) {
                format = null;
            }
        }
    }

    //  Date also can/should define options...
    if (TP.isString(format)) {
        //  found a format, question now is what token set?
        if (/Z$/.test(format)) {
            return format.substitute(aDate, Date.UTC_TOKENS);
        } else if (/\+$/.test(format)) {
            //  ends in +? asking for UTC plus offset
            str = format.strip(/\+$/).substitute(aDate, Date.UTC_TOKENS);

            //  not getUTCISOTimezone or we'll end up with a 'Z'
            return str + aDate.getISOTimezone();
        } else {
            return format.substitute(aDate, Date.LOCALTIME_TOKENS);
        }
    }

    //  individual token variants can also be found, but we need to know
    //  which token set to look in
    if (/Z$/.test(str) && /%{/.test(str)) {
        format = str.strip(/\Z$/);

        return format.substitute(aDate, Date.UTC_TOKENS);
    } else if (/\+$/.test(str) && /%{/.test(str)) {
        //  ends in + ? asking for UTC plus offset

        format = str.strip(/\+$/);

        return format.substitute(aDate, Date.UTC_TOKENS);
    } else if (/%{/.test(str)) {
        return str.substitute(aDate, Date.LOCALTIME_TOKENS);
    }

    //  return bad format string, not data, for debugging
    return str;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('transformNumber',
function(aNumber, transformParams) {

    /**
     * @name transformNumber
     * @synopsis Transforms the supplied Number using the formats provided by
     *     the 'substitute()' call. Note: This method does not use the
     *     'transformParams' parameter.
     * @param {Number} aNumber The Number object to format.
     * @param {TP.lang.Hash|TP.core.Request} transformParams Optional format
     *     parameters. These should have keys that are used during a keyed
     *     substitution (i.e. Date.FORMATS).
     * @returns {String} The formatted output.
     * @todo
     */

    var str;

    str = this.toString();
    if (/#{/.test(str)) {
        return str.substitute(aNumber);
    }

    //  return bad format string, not data, for debugging
    return str;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('transformObject',
function(anObject, transformParams) {

    /**
     * @name transformObject
     * @synopsis Transforms an object using the 'substitute()' call.
     * @description Depending on the character given in the format of the
     *     receiver, this call will perform the following substitutions (and
     *     expect the following types for anObject):
     * @param {Object} anObject The object to format.
     * @param {TP.lang.Hash|TP.core.Request} transformParams Optional format
     *     parameters. These should have keys that are used during a keyed
     *     substitution (i.e. Date.FORMATS).
     * @returns {String} A formatted string representation of the object.
     *      @ - character substitution - String
     *      # - numeric substitution - Number
     *      % - *     keyed substitution - Object (keys found on object type)
     * @todo
     */

    var obj,
        str;

    str = this.toString();
    if (/#{/.test(str)) {
        //  have to try to get the object in numerical form
        obj = TP.ifInvalid(TP.nc(anObject), anObject);

        return str.substitute(obj);
    } else if (/%{/.test(str)) {
        //  NOTE that we default to using the object's type as the key
        //  source for performing any lookups that might be appropriate
        return str.substitute(anObject,
                                TP.ifInvalid(transformParams,
                                                TP.type(anObject)));
    } else if (TP.regex.SUBSTITUTION_STRING.test(str)) {
        return str.substitute(anObject);
    }

    //  return bad format string, not data, for debugging
    return str;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('transformString',
function(aString, transformParams) {

    /**
     * @name transformString
     * @synopsis Transforms the supplied String using the 'character
     *     substitution' format provided by the internal 'substitute()' call.
     *     Note: This method does not use the 'transformParams' parameter.
     * @param {String} aString The String object to format.
     * @param {TP.lang.Hash|TP.core.Request} transformParams Optional format
     *     parameters. These should have keys that are used during a keyed
     *     substitution (i.e. Date.FORMATS).
     * @returns {String} The formatted output.
     * @todo
     */

    var str;

    str = this.toString();
    if (/@{/.test(str)) {
        return str.substitute(aString);
    }

    //  It may be another kind of substitution, so we pass it over to the
    //  more generic 'transformObject'.
    return this.transformObject(aString, transformParams);
});

//  ------------------------------------------------------------------------
//  TP.ObjectProto - SIGNAL HANDLING
//  ------------------------------------------------------------------------

/*
Default handler implementations. All objects in the TIBET system can
function as both sources and sinks for events. This differs dramatically
from other libraries where events are often limited to UI types with rare
exceptions made for specific objects. TIBET 'event-enables' every object in
the system and provides an easily extensible pattern for developing your own
event handlers.
*/

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getHandler',
function(aSignal, dontTraverseSpoofs, startSignalName) {

    /**
     * @name getHandler
     * @synopsis Returns the specific function or method which the receiver
     *     would (or did) leverage to respond to the signal provided.
     * @description Note that the startSignalName parameter contains an optional
     *     signal name to 'start consideration' from. The computation machinery
     *     in this method will always derive it's signal names by querying
     *     aSignal, but sometimes the caller already knows that it wants to
     *     'skip ahead' to consider signals further down in the chain (the
     *     INHERITANCE_FIRING policy in the notification system does this).
     * @param {TP.core.Signal} aSignal The signal instance to respond to.
     * @param {Boolean} dontTraverseSpoofs True will mean that traversing up the
     *     supertype chain will be disabled for 'spoofed' signals (i.e. signals
     *     where the signal name doesn't match the type name). The default is
     *     false.
     * @param {String} startSignalName The signal name to start considering
     *     handlers if the supplied signal has more than one signal name. This
     *     parameter is optional and, if not supplied, all of the signal names
     *     as computed from the supplied signal will be used.
     * @returns {Function} The specific function or method that would be (or
     *     was) invoked.
     * @todo
     */

    var orig,
        hasOrigin,

        fName,
        sigTypeNames,
        startNameIndex,

        i,
        sigType;

    if (TP.notValid(aSignal)) {
        return;
    }

    orig = TP.ifInvalid(aSignal.getOrigin(), '');
    orig = TP.gid(orig).split('#').last();

    hasOrigin = TP.isEmpty(orig) ? false : true;

    //  If the startSignalName wasn't supplied or it's the same as the signal's
    //  'direct' signal name, then go ahead and consider that the receiver may
    //  have the handler directly on it without traversing the type chain.
    if (TP.isEmpty(startSignalName) ||
        startSignalName === aSignal.getSignalName()) {

        //  check first for explicit one to avoid overhead when the handler
        //  is specific to the signal

        if (hasOrigin) {
            fName = aSignal.getType().getHandlerName(orig, false, aSignal);

            if (TP.canInvoke(this, fName)) {
                return this[fName];
            }

            fName = aSignal.getType().getHandlerName(orig, true, aSignal);

            if (TP.canInvoke(this, fName)) {
                return this[fName];
            }
        }

        fName = aSignal.getType().getHandlerName(null, false, aSignal);
        if (TP.canInvoke(this, fName)) {
            return this[fName];
        }

        fName = aSignal.getType().getHandlerName(null, true, aSignal);
        if (TP.canInvoke(this, fName)) {
            return this[fName];
        }
    }

    //  If the signal is spoofed, then we want all of the signal names based on
    //  type, including the one for the actual type of the signal. This is
    //  because the *signal* name of the signal will be the spoofed name,
    //  whereas the *type* name of the signal will be it's real concrete type
    //  and we want that to be considered as well.
    if (aSignal.isSpoofed()) {
        if (dontTraverseSpoofs) {
            return;
        }

        //  Since the type name isn't the same as the signal name, we must
        //  start checking at the actual type name of the signal.
        sigTypeNames = aSignal.getTypeSignalNames();
    } else {
        //  Since the type name is the same as the signal name, we can start
        //  checking at the supertype name of the signal.
        sigTypeNames = aSignal.getSupertypeSignalNames();
    }

    //  If a startSignalName was supplied and it can be found in the list of
    //  computed signal names, then slice off all signal names in the list
    //  *before* that.
    if (TP.notEmpty(startSignalName) &&
            (startNameIndex = sigTypeNames.indexOf(startSignalName)) !==
                                                            TP.NOT_FOUND) {
        sigTypeNames = sigTypeNames.slice(startNameIndex);
    }

    for (i = 0; i < sigTypeNames.getSize(); i++) {

        if (TP.isType(sigType = TP.sys.getTypeByName(sigTypeNames.at(i)))) {

            //  Note here how we do *not* supply aSignal as the third
            //  parameter to these methods... we want to use just the signal
            //  type's signal name, not any override supplied by the aSignal
            //  instance.

            if (hasOrigin) {
                fName = sigType.getHandlerName(orig, false);
                if (TP.canInvoke(this, fName)) {
                    return this[fName];
                }

                fName = sigType.getHandlerName(orig, true);
                if (TP.canInvoke(this, fName)) {
                    return this[fName];
                }
            }

            fName = sigType.getHandlerName(null, false);
            if (TP.canInvoke(this, fName)) {
                return this[fName];
            }

            fName = sigType.getHandlerName(null, true);
            if (TP.canInvoke(this, fName)) {
                return this[fName];
            }
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('handle',
function(aSignal, dontTraverseSpoofs, startSignalName) {

    /**
     * @name handle
     * @synopsis Handles notification of an incoming signal.
     * @description The implementation of this function on Object instances
     *     looks for a signal-specific handler before defaulting to simply
     *     logging the signal. You shouldn't override this method. Instead,
     *     create custom handle* methods for the various TP.core.Signal subtypes
     *     you're interested in to get custom behavior. Implement handleSignal()
     *     to serve as a generic signal catcher or handleChange() as a generic
     *     Change handler for example.
     * @param {TP.core.Signal} aSignal The specific signal to handle.
     * @param {Boolean} dontTraverseSpoofs True will mean that traversing up the
     *     supertype chain will be disabled for 'spoofed' signals (i.e. signals
     *     where the signal name doesn't match the type name). The default is
     *     false.
     * @param {String} startSignalName The signal name to start considering
     *     handlers if the supplied signal has more than one signal name. This
     *     parameter is optional and, if not supplied, all of the signal names
     *     as computed from the supplied signal will be used.
     * @returns {Object} The handler function's results.
     * @todo
     */

    var handlerFunc;

    if (TP.isCallable(handlerFunc = this.getHandler(
                            aSignal, dontTraverseSpoofs, startSignalName))) {
        return handlerFunc.apply(this, TP.ac(aSignal));
    }

    return;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('process',
function(aRequest) {

    /**
     * @name process
     * @synopsis Core request processing method. This method follows the
     *     standard TIBET "best method" pattern of searching the receiver for
     *     the best fitting method for the parameter type and invoking that
     *     method. If no other method can be found the default
     *     processTP_sig_Request method is invoked.
     * @param {TP.sig.Request} aRequest The request to process.
     * @returns {Object} The processing results.
     * @todo
     */

    var request;

    //  Ensure we have a true TP.sig.Request even when provided with a hash.
    request = TP.request(aRequest);

    //  context, specializer, prefix, suffix, fallback, arglist

    //  NOTE: we have to provide the argument array here since we may have
    //  gotten an empty request and the arguments object may be empty.
    return this.callBestMethod(arguments, request,
                                'process', null,
                                'processTP_sig_Request',
                                TP.ac(request));
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('processAndExecuteWith',
function(aRequest, stdinContent) {

    /**
     * @name processAndExecuteWith
     * @synopsis Similar to the 'process' method, this method takes in 'stdin'
     *     content and will 'execute' as well as 'process' the request.
     * @param {TP.sig.Request} aRequest The request to process and execute.
     * @param {Object} stdinContent The content to use as 'stdin' when executing
     *     the supplied request.
     * @returns {Object} The processing and executing results.
     * @todo
     */

    var request;

    //  Ensure we have a true TP.sig.Request even when provided with a hash.
    request = TP.request(aRequest);

    request.atPut('cmdExecute', true);
    request.atPut(TP.STDIN, TP.ac(stdinContent));

    return this.process(request);
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('processTP_sig_Request',
function(aRequest) {

    /**
     * @name processTP_sig_Request
     * @synopsis Default request processing method. By default this method
     *     simply returns. Subtypes with processing responsibilities are
     *     expected to override this method.
     * @param {TP.sig.Request} aRequest The request to process.
     * @returns {Object} The processing results.
     * @todo
     */

    var retVal;

    if (TP.notValid(retVal = aRequest.get('result'))) {
        retVal = this;
    }

    return retVal;
});

//  ------------------------------------------------------------------------
//  INFERENCING - DNU RESOLUTION
//  ------------------------------------------------------------------------

/*
Prior to invoking the infer() call every object is given an opportunity to
resolve a DNU trigger itself. This is analogous to the forward() call in
Objective-C under NeXTstep where you could construct objects that were true
proxies, providing a reference and a target for messaging, but forwarding
all actual calls to another object for resolution. That's one potential way
to leverage the functions here.
*/

//  ------------------------------------------------------------------------

Window.Inst.defineMethod('canResolveDNU',
function(anOrigin, aMethodName, anArgArray, callingContext) {

    /**
     * @name canResolveDNU
     * @synopsis Provides an instance that has triggered the DNU machinery with
     *     an opportunity to handle the problem itself. This is a useful option
     *     for objects that are acting as proxies or adaptors.
     * @param {Object} anOrigin The object asking for help.
     * @param {String} aMethodName The method name that failed.
     * @param {Array} anArgArray Optional arguments to function.
     * @param {Function|Arguments} callingContext The calling context.
     * @returns {Boolean} TRUE means resolveDNU() will be called. FALSE means
     *     the standard DNU machinery will continue processing. The default is
     *     FALSE.
     * @todo
     */

    //  default is to let main routines handle it
    return false;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('canResolveDNU',
function(anOrigin, aMethodName, anArgArray, callingContext) {

    /**
     * @name canResolveDNU
     * @synopsis Provides an instance that has triggered the DNU machinery with
     *     an opportunity to handle the problem itself. This is a useful option
     *     for objects that are acting as proxies or adaptors.
     * @param {Object} anOrigin The object asking for help.
     * @param {String} aMethodName The method name that failed.
     * @param {Array} anArgArray Optional arguments to function.
     * @param {Function|Arguments} callingContext The calling context.
     * @returns {Boolean} TRUE means resolveDNU() will be called. FALSE means
     *     the standard DNU machinery will continue processing. The default is
     *     FALSE.
     * @todo
     */

    //  found a node showing we have a method with that name? then we can
    //  resolve it by loading that node
    return TP.canInvoke(anOrigin, aMethodName);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('resolveDNU',
function(anOrigin, aMethodName, anArgArray, callingContext) {

    /**
     * @name resolveDNU
     * @synopsis Invoked by the main DNU machinery when the instance has
     *     responded TRUE to canResolveDNU() for the parameters given.
     * @param {Object} anOrigin The object asking for help.
     * @param {String} aMethodName The method name that failed.
     * @param {Array} anArgArray Optional arguments to function.
     * @param {Function|Arguments} callingContext The calling context.
     * @returns {Object} The results of function resolution.
     * @todo
     */

    //  not implemented? can't do anything
    if (!TP.canInvoke(this, aMethodName)) {
        return;
    }

    switch (anArgArray.length) {
        case 0:
            return this[aMethodName]();
        case 1:
            return this[aMethodName](anArgArray[0]);
        case 2:
            return this[aMethodName](anArgArray[0], anArgArray[1]);
        default:
            return this[aMethodName].apply(this, anArgArray);
    }
});

//  ------------------------------------------------------------------------
//  INFERENCING - CORE FUNCTIONS
//  ------------------------------------------------------------------------

/*
Inferencing allows TIBET to truly "write code for you". Not only does TIBET
write code for you, it does it in such a way that the code written can then be
saved so that the next time you run the program TIBET already knows about what
it inferred during previous executions.

Inferencing depends on a few important elements being in place. First, TIBET
uses functions to add methods to all objects. By using functions for this
purpose rather than the standard JavaScript practice of direct property
assignment TIBET is able to control the method-addition process. This is an
example of encapsulation at work and it proves critical to success here.

One of the flags TIBET uses is a $$shouldConstructDNUs flag. This flag tells
TIBET to install method functions with a little extra processing. For each
method that is added a "DoesNotUnderstand" method matching that function's name
is placed on TP.ObjectProto. This method is a "backstop" which ensures that
no matter what object is in action it actually has an implementation for every
method ever defined in TIBET. The result is that when a message isn't understood
by a target rather than triggering an error it actually triggers the function
TP.sys.dnu(). This is what we refer to as "the backstop". The backstop catches
potential errors and is similar in form to the DoesNotUnderstand from Smalltalk.
TIBET's patent-pending implementation of that function is where things diverge.

TIBET makes use of a very regular syntax designed around a few core functions
including as(), from(), isa(), validate(), get(), and set(). In particular,
TIBET uses pairs of these functions to perform certain operations. Type
conversion is handled by the as()/from() pair. Type checking is handled by the
isa()/validate() pair. Data management is handled by the get()/set() pair and
so on. With a regular syntax and mechanism for type conversion comes an
interesting opportunity. By catching function calls which are not understood
but having information in regular form about which types implement that function
and which types the messaged object canbe converted to it is possible to infer
a path to the result through a chain of type conversions.

In Smalltalk when an object doesn't understand something the debugger pops up.
That's obviously far better than Java where poor type casts can cause similar
situations to crash the program. ClassCastException? Down you go.

TIBET handles the DoesNotUnderstand problem a little differently. When an object
doesn't understand how to do something in TIBET the system follows a multi-step
process. First, ask the object itself if it can figure out an alternative via
the canResolveDNU() operations (ala forward()). Next, TIBET checks for type
inference opportunities, ways in which it can literally infer a pathway from the
current type to a type that does implement the requested functionality.

One simple example of type/message inferencing is 'rounding a string'. The
built-in String class does not understand the message 'round'. But Numbers do.
String implements asNumber. TIBET uses this information to infer that the
operation, thereby eliminating the need for developers to create potentially
hundreds of wrappers methods. TIBET can deduce that:

myString.round()

can be resolved via:

myString.asNumber().round().asString();

The inference process creates this operation and invokes it to return the
result. If no inferencing paths are found TIBET invokes a debugger hook.

One thing that is interesting to note about the inference process is that it
not only can generate code but it can install that code on the object so that
future calls don't invoke the inferencing engine. In other words, when TIBET
processes our previous example and determines the solution would be:

myString.asNumber().round().asString();

it constructs a Function instance which performs this task. This function is
then installed on the proper object thereby avoiding the overhead on future
calls. The resulting code can also be saved out via the TIBET change log to
literally have TIBET 'write code for you'. You get the system and some
fundamental type conversions in place and start running. As the inferencing
engine makes decisions you save the ones that are correct and improve on the
ones that aren't. (In other words the inference log is a kind of todo list).
*/

//  ------------------------------------------------------------------------

TP.sys.defineMethod('infer',
function(anOrigin, aMethodName, anArgArray, callingContext) {

    /**
     * @name infer
     * @synopsis The inferencing driver.
     * @description The inference engine. The current version uses as()
     *     information which is captured during method registration to keep
     *     track of which objects can respond to the method and which type
     *     conversions the origin can be put through. Future versions will add a
     *     number of extensions including:
     *
     *     The current engine utilizes 'forward lookup' semantics. By adding a
     *     check for from() operations on the other types in the system we can
     *     quickly add 'reverse lookup' working from the target method back to
     *     the origin via from() rather than forward via as(). Combining these
     *     two strategies into a 'pong lookup' where we go forward and backward
     *     as needed to look for as() chains that lead to from() chains that
     *     lead to new as() chains is the obvious next step. What might not be
     *     obvious is that get() is a rough synonym for as(). That means that if
     *     an as{Type} isn't found the system will look for get{Type} methods as
     *     an alternative. In TIBET the design centers on having each individual
     *     lookup 'policy' work separately and to allow the engine to be
     *     configured by adding one or more policies to it. The engine will at
     *     that point iterate over the policies looking for a solution via each
     *     policy. The result will be a highly configurable engine which will
     *     provide significant flexibility to developers. These policies can
     *     themselves be grouped into sets which can be used as higher level
     *     'Strategies'. An additional class of policy which may not be obvious
     *     derives from the fact that JavaScript functions aren't bound until
     *     runtime. Using that knowledge it is conceivable to simply follow an
     *     approach in which try/catch is leveraged to try each implementation
     *     of the named method by binding it to anOrigin. If the invocation
     *     throws an exception the system rolls back and tries again until an
     *     operation returns a defined value. This is a Prolog-style inference
     *     policy (try until success) which is straightforward to implement via
     *     try/catch. This is a variation on the Array.choose method, which uses
     *     this basic approach to find the first function which works. My
     *     personal favorite is the 'WAG' policy in which the system simply
     *     finds a version of the method and, if no 'this' references are found,
     *     bind()s it and goes. This could be controlled via a flag defining
     *     some level of 'strictness' for the engine which would order policies
     *     based on how strict they are in checking for certain match criteria.
     *
     *     To control the number of lookup levels the inferencing process
     *     should use the engine will be instrumented with control flags to
     *     allow the programmer to tune the inferencing paths taken. This
     *     concept can be generalized to a parameter known as the 'depth' which
     *     would limit the inference path length.
     *
     *     The features and extensions described here are clearly not in the
     *     current version but they are planned for future releases. Look for
     *     more and more intelligence in the inferencer over time.
     * @param {Object} anOrigin The object asking for help.
     * @param {String} aMethodName The method name to invoke if found.
     * @param {Array} anArgArray Optional arguments to function.
     * @param {Function|Arguments} callingContext The calling context.
     * @returns {Object} The results of execution if possible.
     * @todo
     */

    var str,
        i,
        f,
        s,
        typ,
        asMethodName,
        owners,
        len,
        parents;

    TP.stop('break.infer');

    //  no inferencing possible on types, we don't convert type objects to
    //  instances of other types...
    if (TP.isType(anOrigin)) {
        TP.sys.logInference('Method inferencing disabled for types.',
                            TP.DEBUG);
        return;
    }

    TP.sys.logInference('Checking for implementers of ' + aMethodName,
                        TP.DEBUG);

    if (TP.notValid(owners = TP.sys.getMethodOwners(aMethodName))) {
        TP.sys.logInference('No implementers of ' + aMethodName + ' found.',
                            TP.DEBUG);
        return;
    }

    //  need a parent list or we're not dealing with a decent object
    if (!TP.canInvoke(anOrigin, 'getSupertypeNames') ||
        TP.notValid(parents = anOrigin.getSupertypeNames())) {
        return;
    }

    len = owners.getSize();
    if (len === 0) {
        TP.sys.logInference('No implementers of ' + aMethodName + ' found.',
                            TP.DEBUG);
        return;
    } else {
        TP.sys.logInference('Found ' + len + ' implementer(s) of ' +
                            aMethodName + '.',
                            TP.DEBUG);
    }

    for (i = 0; i < len; i++) {
        typ = owners.at(i).getName();

        //  skip parents, they'll just cause recursion
        if (parents.containsString(typ)) {
            continue;
        }

        //asMethodName = 'as' + typ;
        asMethodName = 'as(\'' + typ + '\')';

        //  don't try to convert to ourselves...:)
        if (typ === anOrigin.getTypeName()) {
            TP.sys.logInference('Inferring this.' +
                            asMethodName +
                            //'()' +
                            '.... would recurse. Skipping.',
                            TP.DEBUG);
            continue;
        }

        TP.sys.logInference('Inferring this.' +
                            asMethodName +
                            //'()' +
                            '.' +
                            aMethodName +
                            '()',
                            TP.INFO);

        if (TP.sys.$$shouldInvokeInferences()) {
            //if (TP.isCallable(anOrigin[asMethodName]))
            //{
                TP.sys.logInference(
                            'Invoking ' +
                            TP.id(anOrigin) +
                            '.' +
                            asMethodName +
                            //'()' +
                            '.' +
                            aMethodName +
                            '();!',
                            TP.INFO);

                //      The ability to make the engine actually generate
                //      functions and then install them on the receiver is
                //      analogous to the sort of 'hotspot' activity a JVM
                //      undergoes with the difference that the code didn't exist
                //      in the case of TIBET's inferencing. In a JVM the hotspot
                //      engine is simply compiling code the programmer had to
                //      write. In TIBET the engine is writing code for the
                //      programmer, then installing it to avoid future calls to
                //      the inferencing engine. The results are finally added to
                //      a change log which can be written via CGI etc to a
                //      server responsible for acting as a source code
                //      repository for the application. The result is a system
                //      which truly figures out what you wanted to do, writes
                //      code to help you do it, installs the code on the proper
                //      objects, and saves the change to the server so the next
                //      time you run the application you never invoke the
                //      inferencer for that function again.

                //  HERE is a simple, non-hotspot version that works

                //  do this in two parts for now to ensure proper
                //  binding as we move along the path...if you don't
                //  split this out the binding doesn't work properly
                //inst = anOrigin[asMethodName]();
                //return inst[aMethodName].apply(inst, anArgArray);

                //  here's the hotspot version
                s = 'var inst;\n' +
                    'var res;\n' +
                    'inst=this.' + asMethodName + ';\n' + //'();\n' +
                    'if (TP.notValid(inst)) return;\n' +
                    'res=inst.' + aMethodName +
                        '.apply(inst, arguments);\n' +
                    'if (TP.notValid(res)) return;\n' +
                    'return res;\n';
                //  "return res.as('" + anOrigin.getTypeName() + "');\n";

                //  Original version...no return type reconvert.
                //s = 'var inst;\n' +
                //  'inst=this.' + asMethodName + '();\n' +
                //  'return inst.' + aMethodName +
                //    '.apply(inst, arguments);';

                TP.sys.logInference('Generating inferred ' + aMethodName +
                                    ' method:\n' + s,
                                    TP.DEBUG);

                f = TP.fc(s);

                //f = new Function(s);

                //  install our new function on the receiver...next
                //  time there won't be any inferencing it will just
                //  fire.

                //  TODO: for now we don't go further to do
                //  this at the type or instance method level but
                //  leave it at the local level. some performance
                //  might be gained by altering that so a function
                //  that's constantly targeting new instances of the
                //  same time would only infer() on the first
                //  instance.
                if (TP.isMutable(anOrigin)) {
                    anOrigin.addLocalMethod(aMethodName, f);
                } else if (TP.isType(anOrigin)) {
                    anOrigin.Type.defineMethod(aMethodName, f);
                } else {
                    anOrigin.getType().Inst.defineMethod(aMethodName, f);
                }

                //  here's the fun part...save the change to the
                //  change log if active so next time we don't even
                //  do the infer() to begin with!
                if (TP.sys.shouldLogCodeChanges()) {
                    str = '//\tInference generated method\n';
                    str += anOrigin.getTypeName() + '.add';
                    if (TP.isType(anOrigin)) {
                        str += 'TypeMethod(\'';
                    } else {
                        str += 'InstMethod(\'';
                    }
                    str += aMethodName + '\',' +
                        f.toString().strip(' anonymous') + ');\n';

                    TP.sys.logCodeChange(str, TP.DEBUG);
                }

                //  go ahead and run it to resolve this invocation
                switch (anArgArray.length) {
                    case 0:
                        return anOrigin[aMethodName]();
                    case 1:
                        return anOrigin[aMethodName](anArgArray[0]);
                    case 2:
                        return anOrigin[aMethodName](anArgArray[0],
                                                        anArgArray[1]);
                    default:
                        return anOrigin[aMethodName].apply(anOrigin,
                                                        anArgArray);
                }
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('dnu',
function(anOrigin, aMethodName, anArgArray, callingContext) {

    /**
     * @name dnu
     * @synopsis A standard function for catching methods targeted at the wrong
     *     receiver.
     * @description This method is typically invoked via an instance's
     *     doesNotUnderstand call. The doesNotUnderstand functionality is
     *     installed when TIBET's $$shouldConstructDNUs flag is true. When
     *     triggered, this method first checks with the origin to see if it
     *     "canResolve" the problem itself. Then the TIBET inferencer is used.
     *     If all else fails the debugging hook is invoked.
     * @param {Object} anOrigin The object asking for help.
     * @param {String} aMethodName The method name to invoke if found.
     * @param {Array} anArgArray Optional arguments to function.
     * @param {Function|Arguments} callingContext The calling context.
     * @returns {Object} The results of execution if possible.
     * @todo
     */

    var i,
        arr,
        anObj,
        orgid,
        orgtype,
        stackInfo,
        targetType,
        typeName,
        supers,
        scope,
        len,
        superName;

    TP.stop('break.dnu');

    if (TP.notValid(anOrigin)) {
        return;
    }

    //  grab the origin's ID for reporting
    orgid = TP.id(anOrigin);
    orgtype = TP.tname(anOrigin);

    //  windows are notoriously poor at dealing with DNUs since
    //  they're "special objects" in the browser world, so don't try
    if (TP.isWindow(anOrigin)) {
        TP.stop('break.unbound');

        TP.sys.logInference((orgid || 'Unresolvable window ') +
                ' triggered backstop for method ' + aMethodName,
                TP.DEBUG);
        return;
    }

    //  next check is to avoid doing something nasty like triggering a DNU
    if (TP.$$isDNU(anOrigin.getTypeName) ||
        TP.$$isDNU(anOrigin.getID) ||
        TP.$$isDNU(anOrigin.canResolveDNU) ||
        TP.$$isDNU(anOrigin.resolveDNU) ||
        TP.$$isDNU(anOrigin.as) ||
        TP.$$isDNU(anOrigin.getSupertypeNames) ||
        TP.$$isDNU(anOrigin.addLocalMethod)) {
        TP.sys.logInference((orgid || 'Unresponsive object ') +
                ' triggered backstop for method ' + aMethodName,
                TP.DEBUG);
        return;
    }

    //  avoid stack overhead if we're not logging
    if (TP.sys.shouldLogInferences()) {
        try {
            throw new Error();
        } catch (e) {
            stackInfo = TP.getStackInfo(e);
        }

        TP.sys.logInference(anOrigin.getTypeName() + ' ' +
                orgid + ' triggered DNU ' + aMethodName + ' at ' +
                stackInfo.join(' \u00BB '),
                TP.DEBUG);
    }

    //  option for origin to reattempt method...this gives individual
    //  types and instances a chance to do local "forward()" processing
    //  etc. which is a nice hook for proxies etc.
    if (anOrigin.canResolveDNU(anOrigin,
                                        aMethodName,
                                        anArgArray,
                                        callingContext)) {
        TP.sys.logInference(anOrigin.getTypeName() + ' ' +
                            orgid + ' canResolve DNU ' +
                            aMethodName + '(...) !',
                            TP.DEBUG);

        return anOrigin.resolveDNU(anOrigin, aMethodName, anArgArray,
                                    callingContext);
    }

    if (TP.sys.$$shouldUseInferencing()) {
        if (TP.isString(aMethodName)) {
            if (aMethodName.indexOf('get') === 0) {
                //  it's a getter
                TP.sys.logInference('Inferring as("' +
                                    aMethodName.slice(3) + '") from ' +
                                    anOrigin.getTypeName() +
                                    '.' + aMethodName + '(...)',
                                    TP.DEBUG);

                //  try as(). If that doesn't return a defined value it
                //  failed to find a resolution so fall thru to TP.sys.infer
                //  get() calls are a form of asking for the object as()
                //  some other representation so we perform that flip
                //  here.
                if (TP.sys.$$shouldInvokeInferences()) {
                    anObj = anOrigin.as(aMethodName.slice(3));
                    if (TP.isDefined(anObj)) {
                        return anObj;
                    }
                }

                TP.sys.logInference('Inferring as("' + aMethodName.slice(3) +
                                    '") from ' + anOrigin.getTypeName() +
                                    '.' + aMethodName +
                                    '(...) was unsuccessful.',
                                    TP.DEBUG);
            }

            //  'as' method
            //  We'll look for a direct fromThisType or other converter
            //  on the target type before we do any advanced inferencing
            //  Since the as() conversion didn't work we try to keep things
            //  between the origin and the target type for as long as
            //  possible since the implication is that these two types will
            //  know the most about how to get the task performed in the
            //  most lossless fashion
            if (aMethodName.indexOf('as') === 0) {
                typeName = aMethodName.slice(2);

                TP.sys.logInference('Inferring ' + typeName + '.from(\'' +
                                        anOrigin.getTypeName() + '\')',
                                        TP.DEBUG);

                //  see if we can grab the other type
                targetType = TP.sys.getTypeByName(typeName);
                if (TP.isType(targetType)) {
                    //  get supertype list of 'this' and see if the type
                    //  we're headed for has a local method of the form
                    //  fromThisType or one of the supertypes we invoke
                    //  that
                    supers = anOrigin.getSupertypeNames().copy();
                    supers.splice(0, 0, anOrigin.getTypeName());

                    TP.sys.logInference('Checking against types ' +
                                        supers,
                                        TP.DEBUG);

                    len = supers.getSize();
                    for (i = 0; i < len; i++) {
                        superName = TP.escapeTypeName(supers.at(i));

                        //  does the target have a proper conversion?
                        scope = targetType.getPropertyScope(
                                                    'from' + superName);

                        if ((scope === TP.OVERRIDDEN) ||
                            (scope === TP.INTRODUCED) ||
                            (scope === TP.LOCAL)) {
                            TP.sys.logInference('Invoking ' +
                                                typeName + '.from(\'' +
                                                superName + '\')',
                                                TP.DEBUG);

                            //  HERE is a string-based version. The
                            //  as()/from() transformation is fairly
                            //  straightforward and subject to dynamic
                            //  changes so we don't encache it (yet)
                            //  put origin into the argument list for
                            //  our from* call. Watch out for this array
                            //  since it's an arguments array.

                            /* jshint -W009 */
                            /* eslint-disable no-array-constructor */
                            arr = new Array();
                            /* eslint-enable no-array-constructor */
                            /* jshint +W009 */
                            arr.push(anOrigin);

                            return targetType['from' + superName].apply(
                                    targetType,
                                    arr.addAll(anArgArray).asArray());
                        }
                    }
                }

                TP.sys.logInference('Inferring ' + typeName + '.from(\'' +
                                    anOrigin.getTypeName() +
                                    '\') was unsuccessful.',
                                    TP.DEBUG);
            }

            //  'regular' method
            //  using the TP.sys.infer call to look for as(), get(), from()
            //  combinations that will produce a path to the target
            anObj = TP.sys.infer(anOrigin, aMethodName,
                                    anArgArray, callingContext);

            if (TP.isDefined(anObj)) {
                return anObj;
            }
        }
    }

    //  no luck
    TP.sys.logInference(anOrigin.getTypeName() + ' ' + orgid +
                        ' could not solve for ' + aMethodName,
                        TP.DEBUG);

    //  last chance...invoke the debugger :)
    if (TP.sys.shouldUseDebugger()) {
        return TP.sys.$launchDebugger(arguments);
    }

    return;
});

//  ------------------------------------------------------------------------
//  PERFORMANCE TESTING / TUNING
//  ------------------------------------------------------------------------

/*
Performance is always a consideration at some level. We support methods that
will allow TIBET development to focus performance tuning where it's really
needed by using at least a little statistical data to drive decisions.
*/

//  ------------------------------------------------------------------------

TP.sys.$methodStats = TP.hc();

//  ------------------------------------------------------------------------

TP.definePrimitive('profile',
function(aFunction, anArgArray, aCount) {

    /**
     * @name profile
     * @synopsis Times the invocation of the function provided. This method
     *     allows direct invocation of functions to occur for performance tuning
     *     purposes.
     * @param {Function} aFunction The function being profiled.
     * @param {Array} anArgArray The arguments if any.
     * @param {Number} aCount How many iterations do we want?
     * @returns {Array} [total time, average time];.
     * @todo
     */

    var i,
        startTime,
        stopTime,
        count;

    count = TP.ifInvalid(aCount, 1);

    //  don't use apply unless we have to since it will add additional
    //  overhead
    if (TP.isArray(anArgArray)) {
        startTime = TP.dc();
        for (i = 0; i < count; i++) {
            aFunction.apply(null, anArgArray);
        }
        stopTime = TP.dc();
    } else {
        startTime = TP.dc();
        for (i = 0; i < count; i++) {
            aFunction();
        }
        stopTime = TP.dc();
    }

    return TP.ac(stopTime.getTime() - startTime.getTime(),
                (stopTime.getTime() - startTime.getTime()) / count);
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('addStatistic',
function(aFunction, millisecondCount, stackNames) {

    /**
     * @name addStatistic
     * @synopsis Adds a statistic for an invocation of a function.
     * @param {Function} aFunction The function being tracked.
     * @param {Number} millisecondCount A particular "run time" figure.
     * @param {Array} stackNames An optional call stack array.
     * @todo
     */

    var d1,
        d2,
        fn,
        fo,
        max,
        min,
        avg,
        cnt,
        sum,
        stacks,
        stackID;

    fn = aFunction.getName();
    fo = TP.name(aFunction[TP.OWNER]);

    if (TP.notValid(fn) || TP.notValid(fo) || (fo === TP.NONE)) {
        return;
    }

    if (TP.notValid(d1 = TP.sys.$methodStats.at(fn))) {
        d1 = TP.hc();
        TP.sys.$methodStats.atPut(fn, d1);
    }

    if (TP.notValid(d2 = d1.at(fo))) {
        d2 = TP.hc();
        d1.atPut(fo, d2);
    }

    //  track basic stats on call count, max, min, avg, sum, etc.
    cnt = TP.ifInvalid(d2.at('cnt'), 0);
    d2.atPut('cnt', cnt + 1);

    sum = TP.ifInvalid(d2.at('sum'), 0);
    d2.atPut('sum', sum + millisecondCount);

    max = TP.ifInvalid(d2.at('max'), 0);
    d2.atPut('max', Math.max(millisecondCount, max));

    min = TP.ifInvalid(d2.at('min'), Number.POSITIVE_INFINITY);
    d2.atPut('min', Math.min(millisecondCount, min));

    avg = TP.ifInvalid(d2.at('avg'), 0);
    d2.atPut('avg', d2.at('sum') / d2.at('cnt'));

    //  manage call stack data if provided
    if (TP.isArray(stackNames)) {
        if (TP.notValid(stacks = d2.at('stacks'))) {
            stacks = TP.hc();
            d2.atPut('stacks', stacks);
        }

        //  anonymous function IDs will throw this off so we need to replace
        //  them with something generic that will help the stacks coalesce
        stackID = stackNames.join(' << ');
        TP.regex.CALL_STACK_ID.lastIndex = 0;
        stackID = stackID.replace(TP.regex.CALL_STACK_ID,
                                    'anonymous$1',
                                    'g');

        if (TP.notValid(cnt = stacks.at(stackID))) {
            stacks.atPut(stackID, 1);
        } else {
            stacks.atPut(stackID, cnt++);
        }
    }

    return d1;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getStatistics',
function(aFunction) {

    /**
     * @name getStatistics
     * @synopsis Returns any statistics TIBET may have on the particular
     *     function's performance.
     * @param {Function} aFunction The function being tracked.
     * @returns {Array} An array of millisecond counts.
     * @todo
     */

    var fn,
        fo,
        d1;

    if (TP.notValid(aFunction)) {
        return TP.sys.$methodStats;
    }

    fn = aFunction.getName();
    if (TP.notValid(fn)) {
        return;
    }

    d1 = TP.sys.$methodStats.at(fn);

    fo = TP.name(aFunction[TP.OWNER]);
    if (TP.notValid(fo)) {
        return d1;
    }

    if (TP.isValid(d1)) {
        return d1.at(fo);
    }

    return;
});

//  ========================================================================
//  META - REFLECTION
//  ========================================================================

//  ========================================================================
//  TP.FunctionProto - PART II
//  ========================================================================

/*
Methods for accessing the method and attribute hashes for TIBET types.
*/

//  ------------------------------------------------------------------------

TP.FunctionProto.defineMethod('getImplementers',
function(aName) {

    /**
     * @name getImplementers
     * @synopsis Returns an array containing objects which have declared that
     *     they implement the receiver or a function with that name.
     * @returns {Array} An Array of objects that implement the receiver.
     */

    //  we support this on the Function object itself as a lookup mechanism
    //  when aName is provided.
    if (this === Function) {
        return TP.sys.getMethodOwners(aName);
    }

    if (TP.isType(this)) {
        return TP.ac();
    }

    return TP.sys.getMethodOwners(this);
});

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('finalizeTraits',
function() {

    /**
     * @name finalizeTraits
     * @synopsis Executes traits resolution machinery if the traits for the
           receiver have not yet been resolved. For these objects, this method
           is a no-op.
     * @returns {Object} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('getSupertype',
function() {

    /**
     * @name getSupertype
     * @synopsis Return the supertype of the receiver. For most native types
     *     this returns Object.
     * @returns {Object} The supertype of the receiver.
     */

    //  Object doesn't have a supertype thanks ;)
    if (this === Object) {
        return;
    }

    //  Strictly speaking when we're a function instance we can be either a
    //  standard function (in which case the answer is Object), or we can be a
    //  Type. In that case it's trickier since we want the type of our prototype
    //  to work consistently with JS-style inheritance semantics.
    if (!TP.isType(this)) {
        return Object;
    }

    return this[TP.SUPER];
});

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('getSupertypeName',
function() {

    /**
     * @name getSupertypeName
     * @synopsis Return the supertype name of the receiver. For most native
     *     types this returns Object.
     * @returns {String} The supertype name of the receiver.
     */

    //  Object doesn't have a supertype thanks ;)
    if (this === Object) {
        return;
    }

    //  Strictly speaking when we're a function instance we can be either a
    //  standard function (in which case the answer is "Object"), or we can
    //  be a Type. In that case it's trickier since we want the type of our
    //  prototype to work consistently with JS-style inheritance semantics.
    if (!TP.isType(this)) {
        return 'Object';
    }

    return this[TP.SUPER].getName();
});

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('defineSubtype',
function(name) {

    /**
     * @name defineSubtype
     * @synopsis Adds a new subtype to the receiver. The default implementation
     *     throws an exception due to restrictions in certain browsers. This
     *     call is therefore only valid for subtypes of TP.FunctionProto.
     * @param {String} name The name of the subtype, including an optional
     *     namespace prefix and colon separator.
     * @todo
     */

    return this.raise('TP.sig.InheritanceException',
                                        'Attempt to subtype Native type.');
});

//  ------------------------------------------------------------------------
//  TP.FunctionProto - INSTANCE CREATION
//  ------------------------------------------------------------------------

/*
Implementations of the baseline instance creation API for native types (via
their reliance on TP.FunctionProto as a root)
*/

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('$alloc',
function() {

    /**
     * @name $alloc
     * @synopsis Allocates and returns a new instance but doesn't initialize it.
     *     This is the primitive form of object allocation used to construct new
     *     instances.
     * @returns {Object}
     */

    /* eslint-disable new-cap */
    if (TP.notValid(TP.ifInvalid(TP[this.$getName()],
                                    TP.global[this.$getName()]))) {
        //  TODO: Why do we do this?
        return new TP.sys[this.$getName()]();
    } else {
        return new TP.ifInvalid(TP[this.$getName()],
                                    TP.global[this.$getName()])();
    }
    /* eslint-enable new-cap */
});

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('isAbstract',
function(aFlag) {

    /**
     * @name isAbstract
     * @synopsis Returns true if the receiver is abstract.
     * @description In TIBET this means instances can be constructed as long as
     *     a valid subtype can be found to provide them. Instances of a subtype
     *     are, by definition, an instance of their supertype so this is a valid
     *     OO construct and offers a lot of support for both localization and
     *     parameter-specific type specialization. If aFlag is passed this
     *     method doubles as a set() call.
     * @param {Boolean} aFlag Value to set for abstract.
     * @returns {Boolean}
     */

    //  no foundational types are abstract
    return false;
});

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('canConstruct',
function() {

    /**
     * @name canConstruct
     * @synopsis Returns true if the receiver can construct a valid instance
     *     given the parameters provided. This method is invoked by supertype
     *     processing of the constructViaSubtype() method when searching for a
     *     potential subtype to manage the instance.
     * @returns {Boolean}
     */

    //  note that the default is false, subtypes must actively validate
    //  that they can handle the instance creation request
    return false;
});

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('constructViaSubtype',
function() {

    /**
     * @name constructViaSubtype
     * @synopsis Returns a new instance of the receiving type in the form of an
     *     instance of a viable subtype.
     * @returns {Object}
     */

    //  no default implementation, just return null
    return;
});

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('getConcreteType',
function() {

    /**
     * @name getConcreteType
     * @synopsis Returns the concrete type for the receiver. When the receiving
     *     type is abstract this will not be the receiver, but when the receiver
     *     is abstract the type returned is the one that would be used to
     *     construct an instance based on the incoming parameters.
     * @returns {Object}
     */

    if (TP.isType(this)) {
        return this;
    }

    return this.getType();
});

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('construct',
function() {

    /**
     * @name construct
     * @synopsis Returns a new instance of the receiving constructor. This
     *     variant is here to support a common api that includes the native
     *     classes. One aspect of this call is that, when the receiving type is
     *     abstract the instance returned, if any, will be of a valid subtype of
     *     the receiving type. This is an acceptable use of polymorphism and
     *     inheritance given that instances of subtypes should be functional
     *     instances of their supertypes (restrictive subclassing isn't
     *     considered an appropriate modeling approach in TIBET. There are so
     *     many other ways to reuse behavior via composition, traits, etc.).
     * @returns {Object}
     */

    var newinst,
        optinst;

    //  alternative view of 'abstract' in which we do a 'clustering'
    //  approach and look for subtypes etc. if the receiver is an abstract
    //  type we'll defer creation to the viaSubtype variant. this allows the
    //  remainder of this method to be inherited and reused by the subtypes
    //  themselves.
    if (this.isAbstract()) {
        return this.constructViaSubtype.apply(this, arguments);
    }

    //  use metadata link (to instance constructor) for primitive call
    newinst = this.$alloc();

    //  TODO:   figure out why the constructor isn't adequate here
    //  set the type...for some reason we can't get this back from the
    //  constructor consistently so we just set it explicitly
    newinst[TP.TYPE] = this[TP.TYPE];

    //  initialize the new instance. Notice that the object passed back
    //  does NOT have to be the object passed in. This is critical because
    //  in TIBET's collection classes we often local program an Array or
    //  Object to stand in for what you think is a collection type. Also note
    //  that the $init is a shared internal initializer useful for hidden
    //  initialization that can be leveraged by all instances.
    newinst = newinst.$init.apply(newinst, arguments);
    optinst = newinst.init.apply(newinst, arguments);

    //  if init() returns a non-null object that's our return value.
    //  this lets init() cheat and return an object of its choice
    if (TP.isValid(optinst)) {
        return optinst;
    } else {
        return newinst;
    }
});

//  ------------------------------------------------------------------------
//  TP.FunctionProto - ENCAPSULATION
//  ------------------------------------------------------------------------

TP.FunctionProto.defineMethod('getValue',
function() {

    /**
     * @name getValue
     * @synopsis Returns the value of the receiver. In the case of functions
     *     this is analogous to invocation.
     * @returns {Object} The function's return value upon invocation.
     */

    return this.apply(null, arguments);
});

//  ------------------------------------------------------------------------
//  TP.FunctionProto - SIGNAL HANDLING
//  ------------------------------------------------------------------------

TP.FunctionProto.defineMethod('getHandler',
function(aSignal) {

    /**
     * @name getHandler
     * @synopsis Returns the specific function or method which the receiver
     *     would (or did) leverage to respond to the signal provided.
     * @param {TP.core.Signal} aSignal The signal instance to respond to.
     * @returns {Function} The specific function or method that would be (or
     *     was) invoked.
     */

    //  non-type function objects simply return themselves since they're what
    //  will be invoked to produce the response
    if (!TP.isType(this)) {
        return this;
    }

    //  find the best handle* method, and fallback with handleSignal
    return this.getBestMethod(arguments, aSignal,
                                'handle', '', 'handleSignal');
});

//  ------------------------------------------------------------------------

TP.FunctionProto.defineMethod('handle',
function(aSignal) {

    /**
     * @name handle
     * @synopsis Handles notification of an incoming signal. The version of this
     *     method on non-type Function instances simply calls the receiver with
     *     the signal as the only parameter. This model allows both observers
     *     and handlers to be registered for notification and to handle the
     *     notification in a consistent fashion.
     * @param {TP.core.Signal} aSignal The signal instance to respond to.
     * @returns {Object} The function's return value.
     */

    var inst;

    //  if we're a type then we do things differently, otherwise we just
    //  fire the function with the signal as the parameter, treating the
    //  receiver as the handler function.
    if (!TP.isType(this)) {
        return this(aSignal);
    }

    //  if we're a type then we try to construct an instance and get it to
    //  handle things
    if (TP.notValid(inst = this.construct())) {
        return this.raise('TP.sig.InvalidHandler',
                            'Unable to construct handler instance.');
    }

    return inst.handle(aSignal);
});

//  ========================================================================
//  TYPE HANDLERS
//  ========================================================================

/*
When signal map entries contain references to Type names the result is that
the Type is returned as the handler. For TIBET purposes Types used as
handlers typically construct an instance to handle the specific event.
*/

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('fromTP_sig_Signal',
function(aSignal) {

    /**
     * @name fromTP.core.Signal
     * @synopsis Common backstop for constructing instances from a
     *     TP.core.Signal which should normally only occur for types that are
     *     being used as handlers for signal data.
     * @param {TP.core.Signal} aSignal The signal instance to respond to.
     * @returns {Object} The function's return value.
     */

    //  default is to just return a new instance
    return this.construct();
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('handleSignal',
function(aSignal) {

    /**
     * @name handleSignal
     * @synopsis Handles notification of an incoming signal. For types the
     *     standard handle call will try to locate a signal-specific handler
     *     function just like with instances, but the default method for
     *     handling them defers to an instance rather than the type itself.
     * @param {TP.core.Signal} aSignal The signal instance to respond to.
     * @returns {Object} The function's return value.
     * @todo
     */

    var inst;

    //  try to construct an instance and get it to handle things
    if (TP.notValid(inst = this.from(aSignal))) {
        return this.raise('TP.sig.InvalidHandler',
                            'Unable to construct handler instance');
    }

    return inst.handle(aSignal);
});

//  ========================================================================
//  TP.ObjectProto - PART II
//  ========================================================================

/*
TP.ObjectProto is the root of the 'instance' inheritance tree for native objects
and all other objects in the system. Properties placed here are shared by
literally every object in the system (with the possible exception of Window
which is due to the, um, 'design decision' to merge the Window instance
name space with the global script execution context).
*/

//  ------------------------------------------------------------------------
//  META PROGRAMMING - DELEGATES AND DNUs
//  ------------------------------------------------------------------------

TP.definePrimitive('backstop',
function(anInterface, anObject, shouldForce) {

    /**
     * @name backstop
     * @synopsis Iterate over anInterface and install backstop methods for any
     *     methods for which no current backstop exists. Creating these dnu
     *     methods helps ensure proper dnu/infer processing will be triggered as
     *     needed when any of these methods is called for a receiver than can't
     *     process them.
     * @param {Array|String} anInterface The method name(s) to install.
     * @param {Object} anObject An optional target object which should receive
     *     the specified methods. When not provided this defaults to
     *     TP.ObjectProto so that the backstops are global.
     * @param {Boolean} shouldForce True to force construction of the DNU even
     *     when the receiver canInvoke a specific method in the interface.
     * @returns {Number} The actual number of methods backstopped.
     * @todo
     */

    var target,
        force,
        count,
        list,
        len,
        i,
        fname,
        theDNU;

    target = TP.ifInvalid(anObject, TP.ObjectProto);
    force = shouldForce ? true : false;
    count = 0;

    list = TP.isArray(anInterface) ? anInterface : TP.ac().add(anInterface);

    if (TP.isEmpty(list)) {
        return count;
    }

    //  on Moz there's no reason to build dnu methods at the top level
    //  unless we're being asked to force overlaying a method we find. the
    //  built-in backstop will do what we need otherwise
    if (TP.sys.isUA('GECKO') && (target === TP.ObjectProto)) {
        return 0;
    }

    len = list.getSize();
    for (i = 0; i < len; i++) {
        //  avoid nulls in arrays
        if (TP.isEmpty(fname = list.at(i))) {
            continue;
        }

        //  avoid existing methods unless forced
        if (!force && TP.canInvoke(target, fname)) {
            continue;
        }

        //  don't build DNUs for things in the DNU exclusion list
        if (TP.sys.$noDNUs.containsString(fname)) {
            continue;
        }

        theDNU = Function.constructDNU(fname);
        try {
            Object.defineProperty(
                    target,
                    fname,
                    TP.PROPERTY_DEFAULTS);
            target[fname] = theDNU;

            count++;
        } catch (e) {
            TP.ifWarn() ?
                TP.warn(TP.ec(e, 'Unable to assign backstop method: ' +
                                    fname),
                        TP.INFERENCE_LOG) : 0;
        }
    }

    return count;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('unstop',
function(anInterface, anObject) {

    /**
     * @name unstop
     * @synopsis Iterate over anInterface and remove backstop methods for any
     *     current backstops found on the object. The default object is
     *     TP.ObjectProto so you normally want to provide a specific target
     *     rather than defaulting this value. NOTE that on browsers with global
     *     hooks this method works somewhat like TP.backstop() on other
     *     browsers...it installs a function which "deadens" a method so it
     *     emulates "no such method".
     * @param {Array|String} anInterface The method name(s) to remove.
     * @param {Object} anObject A target object which should have local
     *     backstops removed.
     * @returns {Number} The actual number of backstops removed.
     * @todo
     */

    var target,
        count,
        list,
        deaden,
        len,
        i,
        fname,
        func;

    //  we default to TP.ObjectProto but note that on Moz this won't mean there
    //  won't be backstop processing for the desired method
    target = TP.ifInvalid(anObject, TP.ObjectProto);
    count = 0;
    deaden = false;

    list = TP.isArray(anInterface) ? anInterface : TP.ac().add(anInterface);

    if (TP.isEmpty(list)) {
        return count;
    }

    //  on Moz there's no real backstop method installation, so the only
    //  thing we could do would be to install a method whose goal is to
    //  "deaden" the backstop in this location
    if (TP.sys.isUA('GECKO') && (target === TP.ObjectProto)) {
        deaden = true;
    }

    len = list.getSize();
    for (i = 0; i < len; i++) {
        //  avoid nulls in arrays
        if (TP.isEmpty(fname = list.at(i))) {
            continue;
        }

        //  avoid non-existing methods unless deaden is true meaning we're
        //  being specifically asked to turn off a spot on a global hook
        if (!TP.canInvoke(target, fname) && !deaden) {
            continue;
        }

        if (deaden) {
            func = Function.constructNSM(fname);
            try {
                target[fname] = func;
                count++;
            } catch (e) {
                TP.ifWarn() ?
                    TP.warn(TP.ec(e, 'Unable to assign NSM method: ' +
                                        fname),
                            TP.INFERENCE_LOG) : 0;
            }
        } else {
            if (TP.owns(target, fname) && TP.$$isDNU(target[fname])) {
                try {
                    delete target[fname];
                    count++;
                } catch (e) {
                    TP.ifWarn() ?
                        TP.warn(TP.ec(e, 'Unable to remove DNU method: ' +
                                            fname),
                                TP.INFERENCE_LOG) : 0;
                }
            }
        }
    }

    return count;
});

//  ------------------------------------------------------------------------
//  META PROGRAMMING - TRAITS
//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineAttribute('$traitsResolved');

TP.lang.RootObject.Type.defineAttribute('$traitsTypeResolutions');
TP.lang.RootObject.Type.defineAttribute('$traitsInstResolutions');

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('addTraits',
function(varargs) {

    /**
     * @name addTraits
     * @synopsis Adds trait types in the arguments list to the receiver.
     * @param {Array} varargs A variable list of 0 to N TIBET types that
     *     represent 'traits' to add to the receiving type.
     * @returns {TP.lang.RootObject} The receiving type.
     */

    var traits,

        len,
        i;

    //  Make sure that we have an Array for traits.
    if (TP.notValid(traits = this[TP.TRAITS])) {
        traits = TP.ac();
        this[TP.TRAITS] = traits;
    }

    //  Iterate over all of the supplied arguments and add them to the traits
    //  list, but only if they're not already represented.
    len = arguments.length;
    for (i = 0; i < len; i++) {
        if (TP.isType(arguments[i]) &&
                !traits.contains(arguments[i], TP.IDENTITY)) {
            traits.push(arguments[i]);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('computeC3Linearization',
function() {

    /**
     * @name computeC3Linearization
     * @synopsis Computes a 'C3 linearization' off of the receiving type.
     * @description In TIBET, multiple inheritance is implemented using traits.
     *     In other multiple inheritance systems, the 'C3 linearization'
     *     algorithm is used to compute the 'method resolution order' when
     *     looking up methods. Although traits doesn't use C3, sometimes it's
     *     useful to be able to compute a 'C3 linearization' of the type, its
     *     supertypes and all of it's traits supertypes.
     *     This is used, for instance, by the system when 'auto resolution' of
     *     traits is turned on.
     * @returns {Array} A list of type names that forms the list of the
     *     receiver's supertype names and all of the trait type names, sorted
     *     using the C3 linearization algorithm.
     */

    //  NOTE: This code is adapted from:
    //          https://github.com/silas/node-c3

    //  It has been reformatted and slightly altered to conform to TIBET coding
    //  guidelines.

    var c3,

        tnames,

        traits,
        result,
        i,

        j,
        traitType;

    function C3(name) {
        this.name = name;
        this.map = {};
        this.map[name] = [];
    }

    c3 = function(name) {
        return new C3(name);
    };

    C3.prototype.add = function(name, parentName) {

        var ref;

        if (!TP.isString(name)) {
            TP.raise(this, 'TP.sig.InvalidName');
        }

        if (!TP.isString(parentName)) {
            TP.raise(this, 'TP.sig.InvalidName');
        }

        if (!this.map.hasOwnProperty(parentName)) {
            this.map[parentName] = [];
        }

        if (!this.map.hasOwnProperty(name)) {
            this.map[name] = [];
        }

        ref = this.map[name];

        //  wje: Unlike the original code, TIBET will sometimes produce a
        //  duplicate parent and we don't really care. We simply return and
        //  don't add it to the list. It is, after all, found under the same
        //  child's name - so the system has uniqued it.
        if (ref.indexOf(parentName) >= 0) {
            //throw new Error('Duplicate parent');
            return this;
        }

        this.map[name].push(parentName);

        return this;
    };

    C3.prototype.run = function() {

        var thisArg,
            map,

            notHead,
            empty,
            merge,
            run;

        thisArg = this;
        map = {};

        Object.keys(thisArg.map).forEach(
                function(n) {
                    map[n] = thisArg.map[n].slice();
                });

        notHead = function(l, c) {
            return l.some(function(s) {
                return s.indexOf(c) > 0;
            });
        };

        empty = function (s) {
            return s.length;
        };

        merge = function (seqs) {
            var results,
                candidate,
                nonEmptySeqs,
                i;

            results = [];

            /* eslint-disable no-constant-condition */
            while (true) {
            /* eslint-enable no-constant-condition */
                nonEmptySeqs = seqs.filter(empty);

                if (!nonEmptySeqs.length) {
                    return results;
                }

                for (i = 0; i < nonEmptySeqs.length; i++) {
                    candidate = nonEmptySeqs[i][0];

                    if (notHead(nonEmptySeqs, candidate)) {
                        candidate = null;
                    } else {
                        break;
                    }
                }

                if (!candidate) {
                    TP.raise(this,
                            'TP.sig.InheritanceException',
                            'Inconsistent hierarchy');
                }

                results.push(candidate);

                for (i = 0; i < nonEmptySeqs.length; i++) {
                    if (nonEmptySeqs[i][0] === candidate) {
                        nonEmptySeqs[i].shift();
                    }
                }
            }
        };

        run = function (name) {
            return merge([[name]].concat(
                                    map[name].map(run)).concat(
                                    [map[name]]));
        };

        return run(this.name);
    };

    //  Start with ourself
    result = c3(this.getName());

    //  Recursively populate the resolver
    this.$populateC3Resolver(result);

    //  Return the result of running the algorithm
    return result.run();
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('finalizeTraits',
function() {

    /**
     * @name finalizeTraits
     * @synopsis Executes traits resolution machinery if the traits for the
           receiver have not yet been resolved.
     * @returns {TP.lang.RootObject} The receiver.
     */

    if (!this.get('$traitsResolved')) {

        //  Make sure that the supertype has resolved it's traits
        this.getSupertype().finalizeTraits();

        //  Now that the supertype (and all of its supertypes - up the chain)
        //  have resolved their traits, if we have traits we can resolve them.
        if (this.hasTraits()) {
            //  If we have traits, try to resolve them.
            this.$performTraitComposition();
            this.$performTraitResolution();
        } else {
            //  Otherwise, it didn't have traits so we just set the flag.
            this.set('$traitsResolved', true);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getAllTraits',
function() {

    /**
     * @name getAllTraits
     * @synopsis Returns a list of all of the receiver's trait types, and any
     *     trait types they might have, etc. recursively.
     * @returns {Array} A complete list of trait types that affect the
     *     receiver.
     */

    var traits,
        len,
        i,
        traitTraits;

    if (TP.notEmpty(traits = this[TP.TRAITS])) {
        len = traits.getSize();
        for (i = 0; i < len; i++) {
            if (TP.notEmpty(traitTraits = traits.at(i).getAllTraits())) {
                traits = traits.concat(traitTraits);
            }
        }
    }

    return traits;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('hasTraits',
function() {

    /**
     * @name hasTraits
     * @synopsis Returns whether or not this type has traits.
     * @returns {Boolean} Whether or not the receiver has traits
     */

    return TP.notEmpty(this[TP.TRAITS]);
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('$performTraitComposition',
function() {

    /**
     * @name $performTraitComposition
     * @synopsis 'Composes' the traits of the receiver into a set of 'property
     *     sources' for each property that exists on both the receiver and each
     *     of the receiver's traits types *that have the same property name but
     *     different values* between the two.
     * @returns {TP.lang.RootObject} The receiving type.
     */

    var traits,
        resolutions,

        mainType,
        mainTypeTarget;

    //  If we've already resolved traits for this type, then we don't allow any
    //  more composition / resolution to occur.
    if (TP.isTrue(this.get('$traitsResolved'))) {
        //  TODO: Raise an exception
        return this;
    }

    //  Make sure that we actually have traits (all of the traits from ourself
    //  and any other traits that have been added - recursively).
    if (TP.isEmpty(traits = this.getAllTraits())) {
        return this;
    }

    mainType = this;

    //  Type-side compose

    if (TP.notValid(resolutions = this.get('$traitsTypeResolutions'))) {
        resolutions = TP.hc();
        this.set('$traitsTypeResolutions', resolutions);
    }

    mainTypeTarget = this.getPrototype();

    //  Then, loop over each trait, getting all of the known properties of that
    //  *type* object and try to populate entries for them into the 'traits type
    //  resolutions' hash.
    traits.forEach(
        function(traitType) {
            var traitTypeTarget,
                traitProps;

            traitTypeTarget = traitType.getPrototype();

            traitProps = traitTypeTarget.getInterface('known');

            //  Loop over each property and make an entry in the 'resolutions'
            //  hash
            traitProps.forEach(
                function(propName) {
                    var checkProp1,
                        checkProp2,

                        entry,
                        sources,
                        i,
                        pastSourceTarget,

                        propVal;

                    //  If the mainTypeTarget has this property, then we need to
                    //  check whether the trait type has it too - in that case,
                    //  we just proceed on.
                    if (TP.isProperty(mainTypeTarget, propName)) {

                        checkProp1 = mainTypeTarget[propName];
                        checkProp2 = traitTypeTarget[propName];

                        if (checkProp1 === checkProp2) {
                            return;
                        }

                        //  If they both really exist, then we need to drill in
                        //  and see if they have '$resolutionMethod' slots that
                        //  would match the other's slot (or '$resolutionMethod'
                        //  slot). This is critical to avoid problems with
                        //  traits cascading down the inheritance hierarchy.
                        if (checkProp1 && checkProp2) {
                            checkProp1 = checkProp1.$resolutionMethod ?
                                            checkProp1.$resolutionMethod :
                                            checkProp1;
                            checkProp2 = checkProp2.$resolutionMethod ?
                                            checkProp2.$resolutionMethod :
                                            checkProp2;

                            if (checkProp1 === checkProp2) {
                                return;
                            }
                        }
                    }

                    //  If the property already has an entry, then check to see
                    //  if this trait is represented in its list of sources. If
                    //  it is, then this trait/property combination is already
                    //  represented.
                    if (TP.isValid(entry = resolutions.at(propName))) {
                        sources = entry.at('sources');
                        if (sources.indexOf(traitType) !== TP.NOT_FOUND) {
                            return;
                        }

                        //  Loop over all of the sources that have been
                        //  resolutions for this slot so far and make the same
                        //  checks that we made above. Again, critical to avoid
                        //  problems with traits and the inheritance hierachy.
                        for (i = 0; i < sources.getSize(); i++) {
                            pastSourceTarget = sources.at(i).getPrototype();

                            checkProp1 = pastSourceTarget[propName];
                            checkProp2 = traitTypeTarget[propName];

                            if (checkProp1 === checkProp2) {
                                return;
                            }

                            if (checkProp1 && checkProp2) {
                                checkProp1 = checkProp1.$resolutionMethod ?
                                                checkProp1.$resolutionMethod :
                                                checkProp1;
                                checkProp2 = checkProp2.$resolutionMethod ?
                                                checkProp2.$resolutionMethod :
                                                checkProp2;

                                if (checkProp1 === checkProp2) {
                                    return;
                                }
                            }
                        }

                        //  Otherwise, there was an entry for this property, but
                        //  this trait is not represented in it - therefore we
                        //  have a *conflict*. Add this trait type to the list
                        //  of sources and mark the property as conflicted.
                        sources.push(traitType);
                    } else {
                        //  If the property is defined on the main type
                        if (TP.isDefined(propVal = mainTypeTarget[propName])) {
                            entry = TP.hc('sources',
                                            TP.ac(mainType, traitType));
                        } else {
                            entry = TP.hc('sources', TP.ac(traitType));
                        }
                        resolutions.atPut(propName, entry);
                    }
                });
        });

    //  Instance-side compose

    if (TP.notValid(resolutions = this.get('$traitsInstResolutions'))) {
        resolutions = TP.hc();
        this.set('$traitsInstResolutions', resolutions);
    }

    mainTypeTarget = this.getInstPrototype();

    //  Then, loop over each trait, getting all of the known properties of that
    //  type object's *instance prototype* and try to populate entries for them
    //  into the 'traits instance resolutions' hash.
    traits.forEach(
        function(traitType) {
            var traitTypeTarget,
                traitProps;

            traitTypeTarget = traitType.getInstPrototype();

            traitProps = traitTypeTarget.getInterface('known');

            //  Loop over each property and make an entry in the 'resolutions'
            //  hash
            traitProps.forEach(
                function(propName) {
                    var checkProp1,
                        checkProp2,

                        entry,
                        sources,
                        i,
                        pastSourceTarget,

                        propVal;

                    //  If the mainTypeTarget has this property, then we need to
                    //  check whether the trait type has it too - in that case,
                    //  we just proceed on.
                    if (TP.isProperty(mainTypeTarget, propName)) {
                        checkProp1 = mainTypeTarget[propName];
                        checkProp2 = traitTypeTarget[propName];

                        if (checkProp1 === checkProp2) {
                            return;
                        }

                        //  If they both really exist, then we need to drill in
                        //  and see if they have '$resolutionMethod' slots that
                        //  would match the other's slot (or '$resolutionMethod'
                        //  slot). This is critical to avoid problems with
                        //  traits cascading down the inheritance hierarchy.
                        if (checkProp1 && checkProp2) {
                            checkProp1 = checkProp1.$resolutionMethod ?
                                            checkProp1.$resolutionMethod :
                                            checkProp1;
                            checkProp2 = checkProp2.$resolutionMethod ?
                                            checkProp2.$resolutionMethod :
                                            checkProp2;

                            if (checkProp1 === checkProp2) {
                                return;
                            }
                        }
                    }

                    //  If the property already has an entry, then check to see
                    //  if this trait is represented in its list of sources. If
                    //  it is, then this trait/property combination is already
                    //  represented.
                    if (TP.isValid(entry = resolutions.at(propName))) {
                        sources = entry.at('sources');

                        //  Loop over all of the sources that have been
                        //  resolutions for this slot so far and make the same
                        //  checks that we made above. Again, critical to avoid
                        //  problems with traits and the inheritance hierachy.
                        for (i = 0; i < sources.getSize(); i++) {
                            pastSourceTarget = sources.at(i).getInstPrototype();

                            checkProp1 = pastSourceTarget[propName];
                            checkProp2 = traitTypeTarget[propName];

                            if (checkProp1 && checkProp2) {
                                checkProp1 = checkProp1.$resolutionMethod ?
                                                checkProp1.$resolutionMethod :
                                                checkProp1;
                                checkProp2 = checkProp2.$resolutionMethod ?
                                                checkProp2.$resolutionMethod :
                                                checkProp2;

                                if (checkProp1 === checkProp2) {
                                    return;
                                }
                            }
                        }

                        if (sources.indexOf(traitType) !== TP.NOT_FOUND) {
                            return;
                        }

                        //  Otherwise, there was an entry for this property, but
                        //  this trait is not represented in it - therefore we
                        //  have a *conflict*. Add this trait type to the list
                        //  of sources and mark the property as conflicted.
                        sources.push(traitType);
                    } else {
                        //  If the property is defined on the main type
                        if (TP.isDefined(propVal = mainTypeTarget[propName])) {
                            entry = TP.hc('sources',
                                            TP.ac(mainType, traitType));
                        } else {
                            entry = TP.hc('sources', TP.ac(traitType));
                        }
                        resolutions.atPut(propName, entry);
                    }
                });
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('$performTraitResolution',
function() {

    /**
     * @name $performTraitResolution
     * @synopsis Performs the final resolution of trait resolution for the type.
     *     This is normally called the first time an instance is constructed and
     *     can be considered a 'one way' operation (i.e. once it's done and the
     *     type starts returning proper instances, it cannot be done again).
     * @returns {TP.lang.RootObject} The receiving type.
     */

    var mainType,
        mainTypeTarget,

        keys,

        typeResolutions,
        instResolutions,

        unresolvedTraits,

        errStr;

    //  Make sure that we actually have traits
    if (!this.hasTraits()) {
        return this;
    }

    mainType = this;

    //  The resolutions that apply to 'type side' properties.
    typeResolutions = this.get('$traitsTypeResolutions');

    //  First, make a pass to make sure that any conflicting trait properties
    //  have been resolved.

    //  Type-side

    if (TP.notEmpty(typeResolutions)) {
        unresolvedTraits = TP.hc();

        keys = typeResolutions.getKeys();
        keys.forEach(
            function(propName) {
                var entry,
                    resolution,
                    len,
                    i,
                    source,
                    val,
                    traitSources;

                entry = typeResolutions.at(propName);

                //  If the trait wasn't manually resolved via 'resolveTrait()',
                //  then we can resolve it if all but one of the values of
                //  'propName' on each of the sources is TP.REQUIRED. If more
                //  than one is "real", then we have a conflict.
                if (TP.notValid(resolution = entry.at('resolvesTo'))) {

                    len = entry.at('sources').getSize();
                    for (i = 0; i < len; i++) {

                        source = entry.at('sources').at(i);

                        val = source.getPrototype()[propName];

                        if (val !== TP.REQUIRED) {
                            //  If we already had one that wasn't a TP.REQUIRED,
                            //  then we have a conflict.
                            if (TP.isValid(entry.at('resolvesTo'))) {

                                if (TP.notValid(
                                        traitSources =
                                            unresolvedTraits.at(propName))) {

                                    traitSources = TP.ac();

                                    //  Push the entry we already found and put
                                    //  the Array into the 'unresolved traits'
                                    //  hash.
                                    traitSources.push(entry.at('resolvesTo'));
                                    unresolvedTraits.atPut(propName,
                                                            traitSources);

                                    //  Remove the 'resolvesTo' key - we no
                                    //  longer can resolve this - we're
                                    //  conflicted.
                                    entry.removeKey('resolvesTo');
                                }

                                traitSources.push(source);
                            } else {
                                entry.atPut('resolvesTo', source);
                            }
                        }
                    }
                }

                if (TP.notValid(entry.at('resolvesTo'))) {
                    if (TP.notValid(unresolvedTraits.at(propName))) {
                        unresolvedTraits.atPut(propName, TP.ac());
                        unresolvedTraits.at(propName).push(TP.REQUIRED);
                    }
                }
            });

        //  If we have unresolved traits, bail out here.
        if (TP.notEmpty(unresolvedTraits)) {
            errStr = 'TARGET: ' + TP.name(mainType) + ' TYPE-LEVEL:\n';

            unresolvedTraits.sort().perform(
                    function(kvPair) {
                        var propName,
                            sources;

                        propName = kvPair.first();

                        errStr += 'CONFLICTED PROPERTY: ' +
                                    propName +
                                    ' :: PROBLEM: ';

                        if (TP.isArray(sources = kvPair.last())) {
                            errStr += 'conflicted between: ' +
                                sources.collect(
                                    function(aType) {
                                        var val;

                                        val = aType.getPrototype()[propName];

                                        if (TP.isMethod(val)) {
                                            //  Important for reporting purposes
                                            //  to actually find the owner.
                                            return TP.name(val[TP.OWNER]);
                                        }

                                        return TP.name(aType);
                                    });
                        } else {
                            errStr += sources;
                        }

                        errStr += ' \n';
                    });

            errStr += '\nUse resolveTrait[s] to repair.';

            return this.raise('TP.sig.InvalidInstantiation',
                                TP.sc('Unresolved instance traits: ', errStr));
        }
    }

    //  Instance-side

    //  The resolutions that apply to 'instance side' properties.
    instResolutions = this.get('$traitsInstResolutions');

    if (TP.notEmpty(instResolutions)) {
        unresolvedTraits = TP.hc();

        mainTypeTarget = mainType.getInstPrototype();

        keys = instResolutions.getKeys();
        keys.forEach(
            function(propName) {
                var entry,
                    resolution,
                    len,
                    i,
                    source,
                    val,
                    traitSources;

                entry = instResolutions.at(propName);

                //  If the trait wasn't manually resolved via 'resolveTrait()',
                //  then we can resolve it if all but one of the values of
                //  'propName' on each of the sources is TP.REQUIRED. If more
                //  than one is "real", then we have a conflict.
                if (TP.notValid(resolution = entry.at('resolvesTo'))) {

                    len = entry.at('sources').getSize();
                    for (i = 0; i < len; i++) {

                        source = entry.at('sources').at(i);

                        val = source.getInstPrototype()[propName];

                        if (val !== TP.REQUIRED) {

                            //  If we already had one that wasn't a TP.REQUIRED,
                            //  then we may have a conflict.
                            if (TP.isValid(entry.at('resolvesTo'))) {

                                if (TP.notValid(
                                        traitSources =
                                            unresolvedTraits.at(propName))) {

                                    traitSources = TP.ac();

                                    //  Push the entry we already found and put
                                    //  the Array into the 'unresolved traits'
                                    //  hash.
                                    traitSources.push(entry.at('resolvesTo'));
                                    unresolvedTraits.atPut(propName,
                                                            traitSources);

                                    //  Remove the 'resolvesTo' key - we no
                                    //  longer can resolve this - we're
                                    //  conflicted.
                                    entry.removeKey('resolvesTo');
                                }

                                //  Push the new entry onto the traits sources.
                                traitSources.push(source);
                            } else {
                                entry.atPut('resolvesTo', source);
                            }
                        }
                    }
                }

                if (TP.notValid(entry.at('resolvesTo'))) {
                    if (TP.notValid(unresolvedTraits.at(propName))) {
                        unresolvedTraits.atPut(propName, TP.ac());
                        unresolvedTraits.at(propName).push(TP.REQUIRED);
                    }
                }
            });

        //  If we have unresolved traits, bail out here.
        if (TP.notEmpty(unresolvedTraits)) {
            errStr = 'TARGET: ' + TP.name(mainType) + ' INSTANCE-LEVEL\n';

            unresolvedTraits.sort().perform(
                    function(kvPair) {
                        var propName,
                            sources;

                        propName = kvPair.first();

                        errStr += 'CONFLICTED PROPERTY: ' +
                                    propName +
                                    ' :: PROBLEM: ';

                        if (TP.isArray(sources = kvPair.last())) {
                            errStr += 'conflicted between: ' +
                                sources.collect(
                                    function(aType) {
                                        var val;

                                        val = aType.getInstPrototype()[propName];

                                        if (TP.isMethod(val)) {
                                            //  Important for reporting purposes
                                            //  to actually find the owner.
                                            return TP.name(val[TP.OWNER]);
                                        }

                                        return TP.name(aType);
                                    });
                        } else {
                            errStr += sources;
                        }

                        errStr += ' \n';
                    });

            errStr += '\nUse resolveTrait[s] to repair.';

            return this.raise('TP.sig.InvalidInstantiation',
                                TP.sc('Unresolved instance traits: ', errStr));
        }
    }

    //  Then, go ahead and populate the type's TYPE and INST with the proper
    //  slots

    //  Type-side

    keys = typeResolutions.getKeys();
    keys.forEach(
        function(propName) {
            var resolution;

            resolution = typeResolutions.at(propName).at('resolvesTo');

            //  Note here how we do *not* install a slot if it already
            //  represented on the receiving object (this.Type) unless the
            //  value for that slot is TP.REQUIRED.
            if (TP.isType(resolution) &&
                 this.Type[propName] !== TP.REQUIRED &&
                 resolution.Type[propName] === this.Type[propName]) {
                return;
            }

            this.$populateTraitedSlot(resolution, propName, this.Type, false);
        }.bind(this));

    //  Instance-side

    keys = instResolutions.getKeys();
    keys.forEach(
        function(propName) {
            var resolution;

            resolution = instResolutions.at(propName).at('resolvesTo');

            //  Note here how we do *not* install a slot if it already
            //  represented on the receiving object (this.Inst) unless the
            //  value for that slot is TP.REQUIRED.
            if (TP.isType(resolution) &&
                 this.Inst[propName] !== TP.REQUIRED &&
                 resolution.Inst[propName] === this.Inst[propName]) {
                return;
            }

            this.$populateTraitedSlot(resolution, propName, this.Inst, true);
        }.bind(this));

    //  The traits are resolved - we're done. No going back ;-).
    this.set('$traitsResolved', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('$populateC3Resolver',
function(c3Resolver) {

    /**
     * @name $populateC3Resolver
     * @synopsis Populates
     * @param {Object} c3Resolver The object used to compute a C3 linearization
     *     of types.
     * @returns {TP.lang.RootObject} The receiver.
     */

    var traits,
        i,

        traitSupers,
        j;

    //  Add an entry for ourself and our supertype.
    c3Resolver.add(this.getName(), this.getSupertypeName());

    //  If we have traits, add them.
    if (TP.notEmpty(traits = this[TP.TRAITS])) {

        for (i = 0; i < traits.getSize(); i++) {
            c3Resolver.add(this.getName(), traits.at(i).getName());
        }

        //  Not strictly necessary, but makes for easier debugging since trait
        //  types will be added in 'more specific to less specific' order.
        traits = traits.reverse();

        for (i = 0; i < traits.getSize(); i++) {
            traits.at(i).$populateC3Resolver(c3Resolver);
        }
    }

    //  Process our supertype

    //  If we're at the top of the tree, 'Object' has already been accounted for
    //  by its subtypes - no need to proceed. It won't respond to this method
    //  anyway.
    if (this.getSupertype() !== Object) {
        this.getSupertype().$populateC3Resolver(c3Resolver);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('$populateTraitedSlot',
function(resolution, propName, targetObject, forInstances) {

    /**
     * @name $populateTraitedSlot
     * @synopsis Populates the slot on the receiver given the trait resolution.
     * @param {Function|String|TP.lang.RootObject} resolution The object that
     *     will be used to bring the particular trait slot to resolution.
     * @param {String} propName The property name to use to fetch the property
     *     from the resolution (if it's a type or references one) and possibly
     *     to store it on the receiver.
     * @param {Object} targetObject The target object (either a prototype or
     *     instance prototype) that the resolved property will be put on.
     * @param {Boolean} forInstances Whether or not this method is being run for
     *     'instance prototype' properties or not.
     * @returns {TP.lang.RootObject} The receiving type.
     */

    var mainType,
        resolutionType,
        resolutionOption,

        mainTypeVal,
        resolutionTypeVal,

        installName,
        dispatchFunc;

    mainType = this;

    //  If the resolution value is a Function, just install it as the method
    if (TP.isFunction(resolution)) {
        targetObject.defineMethod(propName, resolution);
    } else {
        //  If it's an Array that means it was encoded to be a type and either a
        //  different method name or TP.BEFORE / TP.AFTER.
        if (TP.isArray(resolution)) {

            resolutionType = TP.isString(resolution.first()) ?
                                TP.sys.getTypeByName(resolution.first()) :
                                resolution.first();
            resolutionOption = resolution.last();

            if (TP.isType(resolutionType)) {
                if (forInstances) {
                    mainTypeVal = mainType.Inst[propName];
                    resolutionTypeVal = resolutionType.Inst[propName];
                } else {
                    mainTypeVal = mainType.Type[propName];
                    resolutionTypeVal = resolutionType.Type[propName];
                }

                //  The resolutionOption was a Function, so we execute it with
                //  both the main type's and resolution type's versions of the
                //  method and use it's return value as the resolutionTypeVal we
                //  want.
                if (TP.isFunction(resolutionOption)) {
                    resolutionTypeVal = resolutionOption(
                                            mainTypeVal, resolutionTypeVal);
                } else if (TP.isString(resolutionOption)) {
                    switch (resolutionOption) {
                        case TP.BEFORE:
                            dispatchFunc = function () {
                                    dispatchFunc.$resolutionMethod.apply(
                                            this, arguments);
                                    return dispatchFunc.$mainMethod.apply(
                                            this, arguments);
                                };
                            dispatchFunc.$resolutionMethod = resolutionTypeVal;
                            dispatchFunc.$mainMethod = mainTypeVal;
                            dispatchFunc.$propName = propName;
                            installName = propName;
                            break;
                        case TP.AFTER:
                            dispatchFunc = function () {
                                    dispatchFunc.$mainMethod.apply(
                                            this, arguments);
                                    return dispatchFunc.$resolutionMethod.apply(
                                            this, arguments);
                                };
                            dispatchFunc.$resolutionMethod = resolutionTypeVal;
                            dispatchFunc.$mainMethod = mainTypeVal;
                            dispatchFunc.$propName = propName;
                            installName = propName;
                            break;
                        default:
                            //  An alternate name was supplied
                            installName = resolutionOption;
                    }
                }
            } else {
                //  TODO: Raise an exception - type name doesn't point to a
                //  valid type.
                void 0;
            }
        } else if (TP.isString(resolution)) {
            //  The resolution is a String, which means it should've just been a
            //  type name.
            if (TP.isType(resolutionType = TP.sys.getTypeByName(resolution)) &&
                resolutionType !== mainType) {
                if (forInstances) {
                    resolutionTypeVal = resolutionType.Inst[propName];
                } else {
                    resolutionTypeVal = resolutionType.Type[propName];
                }

                installName = propName;
            } else {
                //  TODO: Raise an exception - type name doesn't point to a
                //  valid type.
                void 0;
            }
        } else if (TP.isType(resolutionType = resolution) &&
                    resolutionType !== mainType) {
            //  If the resolution is simply a Type, then we just look up the
            //  property on that type using the propName and install either an
            //  attribute or method, depending on what's on that slot.
            if (forInstances) {
                resolutionTypeVal = resolutionType.Inst[propName];
            } else {
                resolutionTypeVal = resolutionType.Type[propName];
            }

            installName = propName;
        } else {
            //  TODO: Raise an exception - type name doesn't point to a valid
            //  type.
            void 0;
        }

        //  If the resolution type value is not a method, then it's an
        //  attribute.
        if (!TP.isMethod(resolutionTypeVal)) {
            //  If it's not defined on the main type, then define it.

            //  If it is defined on the main type target, then we don't redefine
            //  it - it may have a value.
            //  TODO: Do we raise an exception if it is defined?
            if (forInstances) {
                if (TP.notDefined(mainType.Inst[propName])) {
                    mainType.Inst.defineAttribute(propName, resolutionTypeVal);
                }
            } else {
                if (TP.notDefined(mainType.Type[propName])) {
                    mainType.Type.defineAttribute(propName, resolutionTypeVal);
                }
            }

            return this;
        }

        //  If we didn't assign a dispatch Function earlier, that means that we
        //  are doing a 'simple resolution'.
        if (TP.notValid(dispatchFunc)) {
            dispatchFunc = function () {
                    return dispatchFunc.$resolutionMethod.apply(
                            this, arguments);
                };
            dispatchFunc.$resolutionMethod = resolutionTypeVal;
        }

        targetObject.defineMethod(installName, dispatchFunc);

        //  Note here how we manually wire the owner of the Function we just put
        //  on the targetObject to be the resolutionType. This is due to the
        //  fact that we want 'callNextMethod()' to traverse the 'correct tree',
        //  as it were, and it looks at the Function's TP.OWNER for this
        //  information (as it should).
        dispatchFunc[TP.OWNER] = resolutionType;

        //  We also add to the TP.DISPLAY name to indicate that this is a trait
        //  wired in from another type.
        dispatchFunc[TP.DISPLAY] = dispatchFunc[TP.DISPLAY] + '.trait.' +
                                    resolutionType.getID() + '.' + propName;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineMethod('resolveTrait',
function(propertyName, resolverObject, resolvingOption) {

    /**
     * @name resolveTrait
     * @synopsis Adds an entry to resolve the named trait according to the
     *     supplied resolverObject, which can either be a TIBET Type object or
     *     a JavaScript Function.
     * @description This resolves a trait in a number of ways:
     *
     *     1. If the resolverObject is a JavaScript Function, then the property
     *     on the receiver will be resolved by installing the Function as a
     *     method named with the property name on the receiver.
     *
     *     2. If the resolverObject is a TIBET type and a resolvingOption is not
     *     supplied, then the property on the receiver will be resolved to be
     *     the value of that property on the resolverObject.
     *
     *     3. If the resolverObject is a TIBET type and a resolvingOption is
     *     supplied and is a String, then the property on the receiver will be
     *     resolved to be the value of that property on the resolverObject but
     *     using the name supplied as the resolvingOption.
     *
     *     4. If the resolverObject is a TIBET type and a resolvingOption is
     *     supplied and is a Function, then the resolvingOption will be executed
     *     with the value of the property on the main type as the first argument
     *     and the value of the property on the resolverObject as the second
     *     argument. The property on the receiver will be resolved to be the
     *     returned value.
     *
     *     5. If the resolverObject is a TIBET type and a resolvingOption is
     *     supplied and is the value 'TP.BEFORE', then the property on the
     *     receiver will be resolved to be a method consisting of a call to the
     *     same named method on the resolverObject first, followed by a call to
     *     the receiver's version of that method.
     *
     *     6. If the resolverObject is a TIBET type and a resolvingOption is
     *     supplied and is the value 'TP.AFTER', then the property on the
     *     receiver will be resolved to be a method consisting of a call to the
     *     same named method on the receiver first, followed by a call to the
     *     resolverObject's version of that method.
     *
     * @param {String} propertyName The property name of the receiver to resolve
     *     using the supplied resolverObject.
     * @param {TP.lang.RootObject|Function} resolverObject The object to use to
     *     resolve the trait.
     * @param {String|Constant|Function} An optional property name or values of
     *     TP.BEFORE/TP.AFTER or Function.
     * @returns {TP.lang.RootObject} The receiving type.
     */

    var resolutions,
        entry;

    //  Because we're executing this in the context of the 'instance prototype',
    //  'this' will be bound to that object. If it's not (i.e. the user is
    //  trying to execute on a real instance of this type), throw an exception
    if (!TP.isPrototype(this)) {
        //  TODO Raise an exception
        return this;
    }

    //  If we've already resolved traits for this type, we don't proceed any
    //  further
    if (TP.isTrue(this.get('$traitsResolved'))) {
        //  TODO Raise an exception
        return this;
    }

    //  Note here how we go after the TP.OWNER - that's because, in this
    //  context, 'this' is the instance prototype object, not the type and not
    //  an instance of the type (as per our check above).
    if (TP.notValid(resolutions = this[TP.OWNER].get('$traitsInstResolutions'))) {
        resolutions = TP.hc();
        this[TP.OWNER].set('$traitsInstResolutions', resolutions);
    }

    //  Make sure that there is an entry in this type's 'instance resolutions'
    //  for this property
    if (TP.notValid(entry = resolutions.at(propertyName))) {
        entry = TP.hc('sources', TP.ac(resolverObject));
        resolutions.atPut(propertyName, entry);
    } else {
        //  We want each resolver object specified only once.
        if (!entry.at('sources').contains(resolverObject, TP.IDENTITY)) {
            entry.at('sources').push(resolverObject);
        }
    }

    //  If there's a resolvingOption, capture it in an Array along with
    //  resolverObject (which should be a TIBET type in this case).
    if (TP.isType(resolverObject) && TP.isValid(resolvingOption)) {
        entry.atPut('resolvesTo',
                    TP.ac(resolverObject, resolvingOption));
    } else {
        entry.atPut('resolvesTo', resolverObject);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineMethod('resolveTraits',
function(propertyNames, resolverObject) {

    /**
     * @name resolveTraits
     * @synopsis Adds an entry to resolve the named trait according to the
     *     supplied resolverObject, which must be a TIBET Type object. This is a
     *     convenience wrapper for the singular 'resolveTrait' method with the
     *     ability to supply an Array of propertyNames, but limited to providing
     *     only a TIBET type as the resolverObject (which is the only option
     *     that makes sense for a list of property names).
     * @param {Array} propertyNames An Array of property names of the receiver
     *     to resolve using the supplied resolverObject.
     * @param {TP.lang.RootObject} resolverObject The object to use to resolve
     *     the trait.
     * @returns {TP.lang.RootObject} The receiving type.
     */

    var thisref;

    //  Because we're executing this in the context of the 'instance prototype',
    //  'this' will be bound to that object. If it's not (i.e. the user is
    //  trying to execute on a real instance of this type), throw an exception
    if (!TP.isPrototype(this)) {
        //  TODO Raise an exception
        return this;
    }

    //  If we've already resolved traits for this type, we don't proceed any
    //  further
    if (TP.isTrue(this.get('$traitsResolved'))) {
        //  TODO Raise an exception
        return this;
    }

    if (!TP.isArray(propertyNames)) {
        return this.raise('TP.sig.InvalidParameter',
                'Not a valid Array of property names for trait resolution.');
    }

    thisref = this;
    propertyNames.forEach(
            function(propName) {
                thisref.resolveTrait(propName, resolverObject);
            });

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('resolveTrait',
function(propertyName, resolverObject, resolvingOption) {

    /**
     * @name resolveTrait
     * @synopsis Adds an entry to resolve the named trait according to the
     *     supplied resolverObject, which can either be a TIBET Type object or
     *     a JavaScript Function.
     * @description This resolves a trait in a number of ways:
     *
     *     1. If the resolverObject is a JavaScript Function, then the property
     *     on the receiver will be resolved by installing the Function as a
     *     method named with the property name on the receiver.
     *
     *     2. If the resolverObject is a TIBET type and a resolvingOption is not
     *     supplied, then the property on the receiver will be resolved to be
     *     the value of that property on the resolverObject.
     *
     *     3. If the resolverObject is a TIBET type and a resolvingOption is
     *     supplied and is a String, then the property on the receiver will be
     *     resolved to be the value of that property on the resolverObject but
     *     using the name supplied as the resolvingOption.
     *
     *     4. If the resolverObject is a TIBET type and a resolvingOption is
     *     supplied and is a Function, then the resolvingOption will be executed
     *     with the value of the property on the main type as the first argument
     *     and the value of the property on the resolverObject as the second
     *     argument. This Function should return one of these two values and the
     *     property on the receiver will be resolved to be that value.
     *
     *     5. If the resolverObject is a TIBET type and a resolvingOption is
     *     supplied and is the value 'TP.BEFORE', then the property on the
     *     receiver will be resolved to be a method consisting of a call to the
     *     same named method on the resolverObject first, followed by a call to
     *     the receiver's version of that method.
     *
     *     6. If the resolverObject is a TIBET type and a resolvingOption is
     *     supplied and is the value 'TP.AFTER', then the property on the
     *     receiver will be resolved to be a method consisting of a call to the
     *     same named method on the receiver first, followed by a call to the
     *     resolverObject's version of that method.
     *
     * @param {String} propertyName The property name of the receiver to resolve
     *     using the supplied resolverObject.
     * @param {TP.lang.RootObject|Function} resolverObject The object to use to
     *     resolve the trait.
     * @param {String|Constant|Function} An optional property name or values of
     *     TP.BEFORE/TP.AFTER or Function.
     * @returns {TP.lang.RootObject} The receiving type.
     */

    var resolutions,
        entry;

    //  Because we're executing this in the context of the 'type prototype',
    //  'this' will be bound to that object. If it's not (i.e. the user is
    //  trying to execute on the actual type object), throw an exception
    if (!TP.isPrototype(this)) {
        //  TODO Raise an exception
        return this;
    }

    //  If we've already resolved traits for this type, we don't proceed any
    //  further
    if (TP.isTrue(this.get('$traitsResolved'))) {
        //  TODO Raise an exception
        return this;
    }

    //  Note here how we go after the TP.OWNER - that's because, in this
    //  context, 'this' is the type prototype object, not the type (as per our
    //  check above).
    if (TP.notValid(resolutions = this[TP.OWNER].get('$traitsTypeResolutions'))) {
        resolutions = TP.hc();
        this[TP.OWNER].set('$traitsTypeResolutions', resolutions);
    }

    //  Make sure that there is an entry in this type's 'type resolutions' for
    //  this property
    if (TP.notValid(entry = resolutions.at(propertyName))) {
        entry = TP.hc('sources', TP.ac(resolverObject));
        resolutions.atPut(propertyName, entry);
    } else {
        //  We want each resolver object specified only once.
        if (!entry.at('sources').contains(resolverObject, TP.IDENTITY)) {
            entry.at('sources').push(resolverObject);
        }
    }

    //  If there's a resolvingOption, encode it alongside the name of the
    //  resolverObject (which should be a TIBET type in this case).
    if (TP.isValid(resolvingOption)) {
        entry.atPut('resolvesTo',
                    TP.name(resolverObject) + '::' + resolvingOption);
    } else {
        entry.atPut('resolvesTo', resolverObject);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('resolveTraits',
function(propertyNames, resolverObject) {

    /**
     * @name resolveTraits
     * @synopsis Adds an entry to resolve the named trait according to the
     *     supplied resolverObject, which must be a TIBET Type object. This is a
     *     convenience wrapper for the singular 'resolveTrait' method with the
     *     ability to supply an Array of propertyNames, but limited to providing
     *     only a TIBET type as the resolverObject (which is the only option
     *     that makes sense for a list of property names).
     * @param {Array} propertyNames An Array of property names of the receiver
     *     to resolve using the supplied resolverObject.
     * @param {TP.lang.RootObject} resolverObject The object to use to resolve
     *     the trait.
     * @returns {TP.lang.RootObject} The receiving type.
     */

    var thisref;

    //  Because we're executing this in the context of the 'instance prototype',
    //  'this' will be bound to that object. If it's not (i.e. the user is
    //  trying to execute on a real instance of this type), throw an exception
    if (!TP.isPrototype(this)) {
        //  TODO Raise an exception
        return this;
    }

    //  If we've already resolved traits for this type, we don't proceed any
    //  further
    if (TP.isTrue(this.get('$traitsResolved'))) {
        //  TODO Raise an exception
        return this;
    }

    if (!TP.isArray(propertyNames)) {
        return this.raise('TP.sig.InvalidParameter',
                'Not a valid Array of property names for trait resolution.');
    }

    thisref = this;
    propertyNames.forEach(
            function(propName) {
                thisref.resolveTrait(propName, resolverObject);
            });

    return this;
});

//  ------------------------------------------------------------------------
//  PROPERTY MANAGEMENT
//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('removeInstProperties',
function(aList) {

    /**
     * @name removeInstProperties
     * @synopsis Iterate over aList and remove properties found on receiver
     *     whose keys are in the list.
     * @param {Array} aList The list of method names to remove.
     * @raises TP.sig.InvalidType
     * @returns {Object} The receiver.
     * @todo
     */

    return this.raise('TP.sig.InvalidType', this);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('removeLocalProperties',
function(aList) {

    /**
     * @name removeLocalProperties
     * @synopsis Iterate over aList and remove properties found on receiver
     *     whose keys are in the list. Note that the removal will only occur if
     *     the receiver owns the properties in question.
     * @param {Array} aList The list of method names to remove.
     * @returns {Object} The receiver.
     * @todo
     */

    var i,
        len,
        it;

    len = aList.getSize();

    for (i = 0; i < len; i++) {
        it = aList.at(i);

        if (TP.owns(this, it)) {
            delete this[it];
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('removeTypeProperties',
function(aList) {

    /**
     * @name removeTypeProperties
     * @synopsis Iterate over aList and remove properties found on receiver
     *     whose keys are in the list.
     * @param {Array} aList The list of method names to remove.
     * @raises TP.sig.InvalidType
     * @returns {Object} The receiver.
     * @todo
     */

    return this.raise('TP.sig.InvalidType', this);
});

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('removeInstProperties',
function(aList) {

    /**
     * @name removeInstProperties
     * @synopsis Iterate over aList and remove properties found on receiver
     *     whose keys are in the list.
     * @param {Array} aList The list of method names to remove.
     * @returns {Object} The receiver.
     * @todo
     */

    var i,
        len,
        proto,
        it;

    len = aList.getSize();
    proto = this.getInstPrototype();

    for (i = 0; i < len; i++) {
        it = aList.at(i);

        if (TP.owns(proto, it)) {
            delete proto[it];
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('removeInstProperties',
function(aList) {

    /**
     * @name removeInstProperties
     * @synopsis Iterate over aList and remove properties found on receiver
     *     whose keys are in the list.
     * @param {Array} aList The list of method names to remove.
     * @returns {Object} The receiver.
     * @todo
     */

    var i,
        len,
        proto,
        it;

    len = aList.getSize();
    proto = this.getInstPrototype();

    for (i = 0; i < len; i++) {
        it = aList.at(i);

        if (TP.owns(proto, it)) {
            delete proto[it];
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('removeTypeProperties',
function(aList) {

    /**
     * @name removeTypeProperties
     * @synopsis Iterate over aList and remove properties found on receiver
     *     whose keys are in the list.
     * @param {Array} aList The list of method names to remove.
     * @returns {Object} The receiver.
     * @todo
     */

    var i,
        len,
        it;

    len = aList.getSize();
    for (i = 0; i < len; i++) {
        it = aList.at(i);

        if (TP.owns(this, it)) {
            delete this[it];
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('removeTypeProperties',
function(aList) {

    /**
     * @name removeTypeProperties
     * @synopsis Iterate over aList and remove properties found on receiver
     *     whose keys are in the list.
     * @param {Array} aList The list of method names to remove.
     * @returns {Object} The receiver.
     * @todo
     */

    var i,
        len,
        it;

    len = aList.getSize();
    for (i = 0; i < len; i++) {
        it = aList.at(i);

        if (TP.owns(this, it)) {
            delete this[it];
        }
    }

    return this;
});

//  ------------------------------------------------------------------------
//  TYPE CHECKING
//  ------------------------------------------------------------------------

/*
Essentially type-checking...validate() provides a common method for types
to check the internal consistency and type membership of objects. This
method works in tandem with 'isa' to provide an opportunity for methods of
the form:

    x.isa('Foo');

to hand off to:

    Foo.validate(x);

This pattern is evident in as/from for type conversion as well.
*/

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('isa',
function(aType) {

    /**
     * @name isa
     * @synopsis Core type-checking method. This method follows the standard
     *     TIBET "best method" pattern of searching the receiver for the best
     *     matching routine to invoke and then calling it. The receiver is
     *     tested first, then the type, and in this case, any is* primitives
     *     which might apply.
     * @param {TP.lang.RootObject|String} aType The type or type name to verify
     *     against.
     * @returns {Boolean}
     */

    //  is it a valid type
    if (TP.notValid(aType)) {
        this.raise('TP.sig.InvalidType');

        return false;
    }

    //  if the receiver is a clear subtype then we'll say yes, but note that
    //  we don't fail if this isn't true, we move on to allow spoofing etc.
    if (TP.isKindOf(this, aType)) {
        return true;
    }

    //  context, specializer, prefix, suffix, fallback, arglist
    return this.callBestMethod(arguments, this, 'isa');
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('isaObject',
function(aType) {

    /**
     * @name isaObject
     * @synopsis Returns true if the receiver is an instance of the type
     *     provided. Before answering this question a search via isa() is
     *     typically performed, followed by a check to see if the type can use
     *     validate() to test the object.
     * @param {Type|String} aType The type to verify against.
     * @param {TP.lang.RootObject|String} aType The type or type name to verify
     *     against.
     * @returns {Boolean} True if the receiver can be verified as a valid
     *     instance of the type.
     */

    var type;

    //  since we're in isaObject the answer's yes, but we may simply be the
    //  backstop from an isa() call so we do the validate() check here
    if (TP.isType(type = TP.sys.require(aType))) {
        if (TP.canInvoke(type, 'validate')) {
            return type.validate(this);
        }
    }

    return true;
});

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Tests the incoming value to see if it represents a valid
     *     instance of the type and failing that checks for each supertype as an
     *     option.
     * @param {Object} anObject The object to test.
     * @returns {Boolean} True if the object can be validated.
     */

    //  function instances can be used to validate via invocation
    if (!TP.isType(this)) {
        return this(anObject);
    }

    //  context, specializer, prefix, suffix, fallback, arglist
    return this.callBestMethod(arguments, this, 'validate');
});

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('validateObject',
function(anObject) {

    /**
     * @name validateObject
     * @synopsis Tests the incoming value to see if it represents a valid
     *     instance of the receiver's type.
     * @param {Object} anObject The object to test.
     * @returns {Boolean}
     */

    if (!TP.isType(this)) {
        return this(anObject);
    }

    if (TP.notValid(anObject)) {
        return false;
    }

    return TP.isKindOf(anObject, this.getName());
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Tests the incoming value to see if it represents a valid
     *     instance of the receiving type.
     * @description In performing this test the receiver will begin with
     *     validating any aspects on the supplied that match any validity facets
     *     on the receiver. If none can be found, then it will use the
     *     callBestMethod() approach to find a validation suitable for any
     *     supertype of the inbound data if there is no specific function for
     *     the object's direct type.
     * @param {Object} anObject The object to test.
     * @returns {Boolean} True if the object can be validated.
     */

    var validityInfo,
        setAtLeastOne,
        keys,
        isValid;

    //  First, attempt to validate any aspects on the supplied object. This will
    //  return a Hash of validity information.
    validityInfo = this.validateAspects(anObject);
    setAtLeastOne = false;
    isValid = true;

    //  Loop over the validity information hash. There has to be at least one
    //  that returned a non 'TP.NO_RESULT' value in order for us to not just use
    //  the callBestMethod() approach at the bottom.
    keys = validityInfo.getKeys();
    keys.forEach(
        function(key) {

            var truthVal;

            truthVal = validityInfo.at(key);

            //  If there was at least one validity test that returned either
            //  true or false (but not TP.NO_RESULT), then we use that value to
            //  set the facet on the object and to avoid the callBestMethod()
            //  approach below.
            if (truthVal !== TP.NO_RESULT) {

                anObject.setFacet(key, TP.VALID, truthVal);
                setAtLeastOne = true;

                //  If isValid is true, we go ahead and set it to the truth
                //  value. If it's already false, we do *not* want to possibly
                //  set it to true, since this operation can be considered a
                //  'union' of all truth values.
                if (isValid) {
                    isValid = truthVal;
                }
            }
        });

    //  We didn't find at least one validity test - use callBestMethod()
    //  approach.
    if (!setAtLeastOne) {
        //  context, specializer, prefix, suffix, fallback, arglist
        isValid = this.callBestMethod(arguments, this, 'validate');
    }

    return isValid;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('validateAspects',
function(anObject, aspectNames) {

    /**
     * @name validateAspects
     * @synopsis Validates the aspects of the supplied object against any
     *     validity facets that are defined by the receiver.
     * @param {Object} anObject The object to test.
     * @param {Array} aspectNames An array of aspect names to test. If not
     *     supplied, then all of the aspects of the supplied object are tested.
     * @returns {Boolean} The result of executing all of the validity facets for
     *     the aspect names.
     */

    var hadFacetCheck,
        constraintsResult,

        aspectsToCheck,

        results,

        len,
        i,

        aspectName,
        constraints;

    hadFacetCheck = false;

    //  No aspect names supplied - use all of the aspects of the supplied
    //  object.
    if (TP.isEmpty(aspectNames)) {

        aspectsToCheck = anObject.getKeys();

        //  We want to filter out slots holding facet values
        aspectsToCheck = aspectsToCheck.reject(
                            function(aspectName) {
                                return TP.regex.FACET_SLOT_NAME_MATCH.test(
                                                                    aspectName);
                            });
    } else {
        aspectsToCheck = aspectNames;
    }

    //  The result of this method is hash containing the aspect name and the
    //  result of running that aspect's validity facet.
    results = TP.hc();

    len = aspectsToCheck.getSize();
    for (i = 0; i < len; i++) {

        aspectName = aspectsToCheck.at(i);

        //  Get the facet setting (not the value - we'll compute that) for the
        //  validity facet of the aspect. If there is no validity constraint for
        //  this aspect, then put a value of TP.NO_RESULT into that result entry
        //  and move on.
        if (TP.notValid(constraints = this.getInstFacetSettingFor(
                                        aspectName,
                                        TP.VALID))) {

            results.atPut(aspectName, TP.NO_RESULT);

            continue;
        }

        hadFacetCheck = true;

        //  Otherwise, there was a set of validity constraints (a literal Object
        //  containing 1...n of them). Execute those constraints and put the
        //  result into the result entry for that aspect.

        constraintsResult = this.validateConstraintsOn(
                                anObject.get(aspectName), constraints);

        results.atPut(aspectName, constraintsResult);
    }

    return results;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('validateConstraintsOn',
function(anObject, constraints) {

    /**
     * @name validateConstraints
     * @synopsis Validates a supplied object against a set of validity
     *     constraints supplied in a second, literal POJO object.
     * @param {Object} anObject The object to test.
     * @param {Object} constraints The POJO object containing 1...n validity
     *     constraints. These include:
               dataType (JS/TIBET type object, String resolved to JS/TIBET type
                            object)
               enumeration (Array, comma-separated String, AccessPath)
               equal (Object that can be compared, AccessPath)
               fractionDigits (Number or object that can be 'asNumber'ed,
                                AccessPath)
               length (Number or object that can be 'asNumber'ed,
                                AccessPath)
               maxExclusive (Number or object that can be 'asNumber'ed,
                                AccessPath)
               maxInclusive (Number or object that can be 'asNumber'ed,
                                AccessPath)
               maxLength (Number or object that can be 'asNumber'ed,
                                AccessPath)
               maxValue (Number or object that can be 'asNumber'ed,
                                AccessPath)
               minExclusive (Number or object that can be 'asNumber'ed,
                                AccessPath)
               minInclusive (Number or object that can be 'asNumber'ed,
                                AccessPath)
               minLength (Number or object that can be 'asNumber'ed,
                                AccessPath)
               minValue (Number or object that can be 'asNumber'ed, AccessPath)
               notEqual (Object that can be compared, AccessPath)
               pattern (RegExp, AccessPath)
               totalDigits (Number or object that can be 'asNumber'ed,
                                AccessPath)
     * @returns {Boolean} Whether or not the object passed the supplied validity
     *     constraints.
     */

    var result,

        constraintNames,

        errors,

        len,
        i,

        constraintName,
        constraint,

        num,
        str;

    //  Get all of the keys from the literal POJO object. This will be the names
    //  of all of our constraints.
    constraintNames = TP.keys(constraints);

    errors = TP.ac();

    len = constraintNames.getSize();
    for (i = 0; i < len; i++) {

        //  Grab the constraint.
        constraintName = constraintNames.at(i);
        constraint = constraints[constraintName];

        if (constraint.isAccessPath()) {
            constraint = constraint.executeGet(anObject);
        }

        //  Set the initial result to false.
        result = false;

        switch (constraintName) {

            case 'dataType':

                //  If the constraint is 'dataType', then try to obtain a JS or
                //  TIBET type object
                if (!TP.isType(constraint)) {
                    if (TP.isString(constraint)) {
                        constraint = TP.sys.getTypeByName(constraint);
                    }
                }

                //  If we successfully got a type, then validate the supplied
                //  object with it.
                if (!TP.isType(constraint)) {
                    this.raise('TP.sig.InvalidConstraint',
                                'Unable to find type: ' + constraint);
                } else {
                    result = constraint.validate(anObject);
                }

                if (!result) {
                    errors.push(
                        TP.sc('Object: "', anObject, '"',
                                ' is not of type: ', TP.name(constraint)));
                }

                break;

            case 'enumeration':

                if (!TP.isArray(constraint)) {
                    this.raise('TP.sig.InvalidConstraint',
                                'Invalid enumeration: ' + constraint);
                } else {
                    result = constraint.contains(anObject);
                }

                if (!result) {
                    errors.push(
                        TP.sc('Object: "', anObject, '"',
                                ' does not have one of the following values: ',
                                TP.join(constraint)));
                }

                break;

            case 'equal':

                if (!TP.isValid(constraint)) {
                    this.raise('TP.sig.InvalidConstraint',
                                'Invalid object: ' + constraint);
                } else {
                    result = (TP.val(anObject) === constraint);
                }

                if (!result) {
                    errors.push(
                        TP.sc('Object: "', anObject, '"',
                                ' is not equal to: ',
                                TP.str(constraint)));
                }

                break;

            case 'fractionDigits':

                if (!TP.isNumber(constraint = constraint.asNumber())) {
                    this.raise('TP.sig.InvalidConstraint',
                                'Invalid number: ' + constraint);
                } else {

                    //  this is supposed to work on the "value space" meaning
                    //  that trailing zeros aren't significant so we want to
                    //  work from a number first...
                    if (!TP.isNaN(num = parseFloat(anObject))) {
                        str = num.fraction().asString().split('.').last();
                        result = (str.getSize() <= constraint);
                    }
                }

                if (!result) {
                    errors.push(
                        TP.sc('Object: "', anObject, '"',
                                ' does not have a fractional number of digits',
                                ' equal to: ', constraint));
                }

                break;

            case 'length':

                if (!TP.isNumber(constraint = constraint.asNumber())) {
                    this.raise('TP.sig.InvalidConstraint',
                                'Invalid number: ' + constraint);
                } else {
                    result = (TP.size(anObject) === constraint);
                }

                if (!result) {
                    errors.push(
                        TP.sc('Object: "', anObject, '"',
                                ' does not have a size matching: ',
                                constraint));
                }

                break;

            case 'maxExclusive':

                if (!TP.isNumber(constraint = constraint.asNumber())) {
                    this.raise('TP.sig.InvalidConstraint',
                                'Invalid number: ' + constraint);
                } else {
                    num = TP.nc(anObject);
                    result = (num < constraint);
                }

                if (!result) {
                    errors.push(
                        TP.sc('Object: "', anObject, '"',
                                ' has a value (exclusive) greater than: ',
                                constraint));
                }

                break;

            case 'maxInclusive':

                if (!TP.isNumber(constraint = constraint.asNumber())) {
                    this.raise('TP.sig.InvalidConstraint',
                                'Invalid number: ' + constraint);
                } else {
                    num = TP.nc(anObject);
                    result = (num <= constraint);
                }

                if (!result) {
                    errors.push(
                        TP.sc('Object: "', anObject, '"',
                                ' has a value (inclusive) greater than: ',
                                constraint));
                }

                break;

            case 'maxLength':

                if (!TP.isNumber(constraint = constraint.asNumber())) {
                    this.raise('TP.sig.InvalidConstraint',
                                'Invalid number: ' + constraint);
                } else {
                    result = (TP.size(TP.str(anObject)) <= constraint);
                }

                if (!result) {
                    errors.push(
                        TP.sc('Object: "', anObject, '"',
                                ' has a length greater than: ',
                                constraint));
                }

                break;

            case 'maxValue':

                if (!TP.isNumber(constraint = constraint.asNumber())) {
                    this.raise('TP.sig.InvalidConstraint',
                                'Invalid number: ' + constraint);
                } else {
                    result = (TP.nc(anObject) <= constraint);
                }

                if (!result) {
                    errors.push(
                        TP.sc('Object: "', anObject, '"',
                                ' has a value greater than: ',
                                constraint));
                }

                break;

            case 'minExclusive':

                if (!TP.isNumber(constraint = constraint.asNumber())) {
                    this.raise('TP.sig.InvalidConstraint',
                                'Invalid number: ' + constraint);
                } else {
                    num = TP.nc(anObject);
                    result = (num > constraint);
                }

                if (!result) {
                    errors.push(
                        TP.sc('Object: "', anObject, '"',
                                ' has a value (exclusive) less than: ',
                                constraint));
                }

                break;

            case 'minInclusive':

                if (!TP.isNumber(constraint = constraint.asNumber())) {
                    this.raise('TP.sig.InvalidConstraint',
                                'Invalid number: ' + constraint);
                } else {
                    num = TP.nc(anObject);
                    result = (num >= constraint);
                }

                if (!result) {
                    errors.push(
                        TP.sc('Object: "', anObject, '"',
                                ' has a value (inclusive) less than: ',
                                constraint));
                }

                break;

            case 'minLength':

                if (!TP.isNumber(constraint = constraint.asNumber())) {
                    this.raise('TP.sig.InvalidConstraint',
                                'Invalid number: ' + constraint);
                } else {
                    result = (TP.size(TP.str(anObject)) >= constraint);
                }

                if (!result) {
                    errors.push(
                        TP.sc('Object: "', anObject, '"',
                                ' has a length less than: ',
                                constraint));
                }

                break;

            case 'minValue':

                if (!TP.isNumber(constraint = constraint.asNumber())) {
                    this.raise('TP.sig.InvalidConstraint',
                                'Invalid number: ' + constraint);
                } else {
                    result = (TP.nc(anObject) >= constraint);
                }

                if (!result) {
                    errors.push(
                        TP.sc('Object: "', anObject, '"',
                                ' has a value less than: ',
                                constraint));
                }

                break;

            case 'notEqual':

                if (!TP.isValid(constraint)) {
                    this.raise('TP.sig.InvalidConstraint',
                                'Invalid object: ' + constraint);
                } else {
                    result = (TP.val(anObject) !== constraint);
                }

                if (!result) {
                    errors.push(
                        TP.sc('Object: "', anObject, '"',
                                ' is equal to: ',
                                TP.str(constraint)));
                }

                break;

            case 'pattern':

                if (!TP.isRegExp(constraint)) {
                    this.raise('TP.sig.InvalidConstraint',
                                'Invalid RegExp: ' + constraint);
                } else {
                    result = constraint.test(TP.str(anObject));
                }

                if (!result) {
                    errors.push(
                        TP.sc('Object: "', anObject, '"',
                                ' should match pattern: ',
                                TP.str(constraint)));
                }

                break;

            case 'totalDigits':

                if (!TP.isNumber(constraint)) {
                    this.raise('TP.sig.InvalidConstraint',
                                'Invalid number: ' + constraint);
                } else {

                    //  this is supposed to work on the "value space" meaning
                    //  that trailing zeros aren't significant so we want to
                    //  work from a number first...
                    if (!TP.isNaN(num = parseFloat(anObject))) {
                        str = num.asString();
                        result = (str.getSize() <= constraint);
                    }
                }

                if (!result) {
                    errors.push(
                        TP.sc('Object: "', anObject, '"',
                                ' does not have a total number of digits',
                                ' equal to: ', constraint));
                }

                break;

            default:

                //  Right now, we don't check any other constraints.
                return true;
        }
    }

    //  If there were errors, report them and return false
    if (TP.notEmpty(errors)) {

        this.raise('TP.sig.InvalidObject', TP.sc('Errors: ', TP.json(errors)));

        return false;
    }

    return result;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('validateObject',
function(anObject) {

    /**
     * @name validateObject
     * @synopsis Tests the incoming value to see if it represents a valid
     *     instance of the receiver's type.
     * @param {Object} anObject The object to test.
     * @returns {Boolean}
     */

    if (TP.notValid(anObject)) {
        return false;
    }

    return TP.isKindOf(anObject, this.getName());
});

//  ------------------------------------------------------------------------
//  MARKER METHODS
//  ------------------------------------------------------------------------

/*
A set of methods that can be used to help mark locations in the code that might
need attention, or which are using inappropriate or deprecated code.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('$$marker',
function(aNote, aPrefix, anException) {

    var prefix,
        note,

        stackInfo;

    prefix = TP.isString(aPrefix) ? aPrefix + ': ' : '';
    note = aNote || '';

    if (TP.sys.shouldLogStack()) {
        try {
            throw new Error();
        } catch (e) {
            stackInfo = TP.getStackInfo(e);
        }

        TP.ifWarn() ?
            TP.warn(prefix + note + '\n\n' + stackInfo.join('\n'),
                    TP.LOG) : 0;
    } else {
        TP.ifWarn() ?
            TP.warn(prefix + note, TP.LOG) : 0;
    }

    if (TP.notEmpty(anException)) {
        TP.raise(this, anException);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('deprecated',
function(aNote) {

    /**
     * @name deprecated
     * @synopsis Reports a warning that a deprecated method/type is in use.
     * @param {String} aNote An optional note to output.
     * @todo
     */

    return TP.$$marker(aNote, 'Deprecated');
});

//  ------------------------------------------------------------------------

TP.definePrimitive('override',
function(aNote) {

    /**
     * @name override
     * @synopsis Standard "abstract" method stub indicating the method needs to
     *     be overridden in concrete subtypes.
     * @param {String} aNote A description of what to do :).
     */

    return TP.$$marker(aNote, 'MissingOverride', 'MissingOverride');
});

//  ------------------------------------------------------------------------

TP.definePrimitive('todo',
function(aNote) {

    /**
     * @name todo
     * @synopsis Standard "under construction" method stub.
     * @param {String} aNote A description of what to do :).
     */

    return TP.$$marker(aNote, 'TODO');
});

//  ========================================================================
//  NATIVE TYPES - PART II
//  ========================================================================

/*
Support for TIBET API on native types from Array to String.
*/

//  ------------------------------------------------------------------------
//  NATIVE - BOOTSTRAP
//  ------------------------------------------------------------------------

//  Set names and owners on the builtin constructors themselves. this
//  allows these objects to operate as valid function owners/types etc.

Array[TP.NAME] = 'Array';
Array[TP.OWNER] = Array;
Array[TP.TRACK] = TP.GLOBAL_TRACK;

Boolean[TP.NAME] = 'Boolean';
Boolean[TP.OWNER] = Boolean;
Boolean[TP.TRACK] = TP.GLOBAL_TRACK;

Date[TP.NAME] = 'Date';
Date[TP.OWNER] = Date;
Date[TP.TRACK] = TP.GLOBAL_TRACK;

Function[TP.NAME] = 'Function';
Function[TP.OWNER] = Function;
Function[TP.TRACK] = TP.GLOBAL_TRACK;

Number[TP.NAME] = 'Number';
Number[TP.OWNER] = Number;
Number[TP.TRACK] = TP.GLOBAL_TRACK;

Object[TP.NAME] = 'Object';
Object[TP.OWNER] = Object;
Object[TP.TRACK] = TP.GLOBAL_TRACK;

RegExp[TP.NAME] = 'RegExp';
RegExp[TP.OWNER] = RegExp;
RegExp[TP.TRACK] = TP.GLOBAL_TRACK;

String[TP.NAME] = 'String';
String[TP.OWNER] = String;
String[TP.TRACK] = TP.GLOBAL_TRACK;

//  ------------------------------------------------------------------------
//  NATIVE - TYPE DEFINITION
//  ------------------------------------------------------------------------

/*
The methods here allow native type instances to localize their behavior. In
particular, this helps to keep the interface to modifying TP.ObjectProto
behavior consistent with how we modify TP.FunctionProto. These have to be
defined later than the definition of addInstMethod for local functions which
occurs in the TP.FunctionProto declarations.
*/

//  ------------------------------------------------------------------------
//  NATIVE TYPES - TYPE CONVERSION
//  ------------------------------------------------------------------------

/*
Standard type conversion methods. JavaScript does a lot of automatic type
conversion but these methods provide a demand-driven conversion process
which also allows more intelligence in the conversion process. The Boolean
fromString method is an example.
*/

//  ------------------------------------------------------------------------

//  what delim should be used when joining array elements into a string
Array.Inst.defineAttribute('delimiter', ', ');

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('asArray',
function() {

    /**
     * @name asArray
     * @synopsis Returns the receiver as an Array instance.
     * @returns {Array}
     */

    return this;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('asBoolean',
function() {

    /**
     * @name asBoolean
     * @synopsis Returns the receiver as a Boolean instance. This method differs
     *     slightly from JS behavior in that an empty array returns 'false'
     *     while an array with content returns 'true'. The various browsers
     *     don't follow a common mechanism for implicit conversion so you should
     *     always do an explicit conversion prior to testing.
     * @returns {Boolean}
     */

    return this.getSize() > 0;
});

//  ------------------------------------------------------------------------
//  asHash          Collections
//  ------------------------------------------------------------------------

Array.Inst.defineMethod('asNumber',
function() {

    /**
     * @name asNumber
     * @synopsis Returns the result implied by the ECMA standard and implemented
     *     by IE4. If the array contains a single element the result is to
     *     convert the single element to a number; else this method returns NaN.
     * @returns {Number}
     */

    if ((this.getSize() === 1) && (TP.isValid(this.at(0)))) {
        return this.at(0).asNumber();
    }

    return NaN;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('asString',
function(verbose) {

    /**
     * @name asString
     * @synopsis Returns the array as a string.
     * @description Constructs a new string from the array.
     *     The join is done using the receiver's current 'delimiter' value,
     *     normally ', '. Set the 'delimiter' value on the receiver to use a
     *     different delimiter.
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the Array's String representation. The default is true.
     * @returns {String} A new String containing the elements of the receiver.
     */

    var wantsVerbose,

        joinCh,

        joinArr,
        joinStr;

    wantsVerbose = TP.ifInvalid(verbose, true);
    if (!wantsVerbose) {
        return TP.objectToString(this);
    }

    this.$sortIfNeeded();

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asString = true;

    joinCh = this.$get('delimiter');

    if (!TP.isString(joinCh)) {
        //  If 'joinCh' is not a String, maybe it's a hash or other Object with
        //  a 'join' property.
        if (!TP.isString(joinCh = joinCh.get('join'))) {
            joinCh = '';
        }
    }

    try {
        joinArr = this.collect(
            function(item, index) {

                return TP.str(item, false);
        });

        joinStr = joinArr.join(joinCh);
    } catch (e) {
        joinStr = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asString;

    return joinStr;
});

//  ------------------------------------------------------------------------

Array.Type.defineMethod('fromNodeList',
function(aNodeList) {

    /**
     * @name fromNodeList
     * @synopsis Returns a new instance constructed from a DOM NodeList
     * @param {NodeList} aNodeList The NodeList object.
     * @returns {Array}
     */

    var i,
        arr;

    arr = this.construct();

    if (TP.isNodeList(aNodeList)) {
        for (i = 0; i < aNodeList.length; i++) {
            arr.push(aNodeList[i]);
        }
    }

    return arr;
});

//  ------------------------------------------------------------------------

Array.Type.defineMethod('fromString',
function(aString) {

    /**
     * @name fromString
     * @synopsis Returns a new instance constructed from the string provided.
     *     The return value is symmetrical with the behavior of asArray() on
     *     String.
     * @param {String} aString Source string.
     * @returns {Array}
     */

    return aString.split('');
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('setDelimiter',
function(aString) {

    /**
     * @name setDelimiter
     * @synopsis Sets the join delimiter to use when converting the array to and
     *     from a string.
     * @param {String} aString The string used to join() the array.
     * @returns {Array} The receiver.
     * @todo
     */

    var str;

    str = TP.ifInvalid(aString, ', ');

    if (this.$get('delimiter') !== str) {
        this.$set('delimiter', str);
    }

    return this;
});

//  ------------------------------------------------------------------------

Boolean.Inst.defineMethod('asArray',
function() {

    /**
     * @name asArray
     * @synopsis Returns the receiver as a single item array [this];
     * @returns {Array}
     */

    var arr;

    //  Opera won't like it if we pass back a single object in a
    //  literal...at least not if it's a number :)
    arr = TP.ac().add(this);

    return arr;
});

//  ------------------------------------------------------------------------

Boolean.Inst.defineMethod('asBoolean',
function() {

    /**
     * @name asBoolean
     * @synopsis Returns the receiver as a Boolean instance.
     * @returns {Boolean}
     */

    return this;
});

//  ------------------------------------------------------------------------

Boolean.Inst.defineMethod('asHash',
function() {

    /**
     * @name asHash
     * @synopsis Returns the receiver as a TP.lang.Hash.
     * @returns {TP.lang.Hash} The receiver converted into a TP.lang.Hash.
     */

    return TP.hc('value', this);
});

//  ------------------------------------------------------------------------

Boolean.Inst.defineMethod('asNumber',
function() {

    /**
     * @name asNumber
     * @synopsis Returns the receiver as a Number instance.
     * @returns {Number}
     */

    //  mirror JS typical behavior
    return this ? 1 : 0;
});

//  ------------------------------------------------------------------------

Boolean.Inst.defineMethod('format',
function(aFormat) {

    /**
     * @name format
     * @synopsis Returns the receiver as a string in source form: 'true' or
     *     'false' by default. If a format string is provided it should contain
     *     a one or two 'y' or 'n' characters in the "case" style desired. For
     *     example, "Yy" will format the receiver as 'Yes', 'Y' as Y, 'y', as
     *     'y', and yy as 'yes' when the value is true, and the corresponding
     *     "No" values when false. Use 't' and 'f' to format the value as "true"
     *     or "false" variants. Note that this method won't localize the
     *     resulting string, however you can localize the return string
     *     directly.
     * @returns {String}
     * @todo
     */

    switch (aFormat) {
        case 'y':
        case 'n':
            return this ? 'y' : 'n';
        case 'Y':
        case 'N':
            return this ? 'Y' : 'N';
        case 'yy':
        case 'nn':
            return this ? 'yes' : 'no';
        case 'YY':
        case 'NN':
            return this ? 'YES' : 'NO';
        case 'Yy':
        case 'Nn':
            return this ? 'Yes' : 'No';

        case 't':
        case 'f':
            return this ? 't' : 'f';
        case 'T':
        case 'F':
            return this ? 'T' : 'F';
        case 'tt':
        case 'ff':
            return this ? 'true' : 'false';
        case 'TT':
        case 'FF':
            return this ? 'TRUE' : 'FALSE';
        case 'Ty':
        case 'Ff':
            return this ? 'True' : 'False';

        case '0':
        case '1':
            return this ? '1' : '0';

        default:
            return this ? 'true' : 'false';
    }
});

//  ------------------------------------------------------------------------

Boolean.Type.defineMethod('fromString',
function(aString, sourceLocale) {

    /**
     * @name fromString
     * @synopsis Returns a Boolean value from the string provided. Unlike the
     *     default constructor this method uses an array of "false strings" such
     *     as 'n', 'N', 'no', '', '0', etc. to make a determination about
     *     boolean value. The strings used are acquired from the current TIBET
     *     TP.core.Locale type to ensure they are localized properly.
     * @param {String} aString Source String value.
     * @param {String|TP.core.Locale} sourceLocale A source xml:lang or
     *     TP.core.Locale defining the language the string is now in. Defaults
     *     to getTargetLanguage() which is based on the current locale's
     *     language-country value.
     * @returns {Boolean}
     * @todo
     */

    //  kernel isn't loaded completely? use native call
    if (!TP.sys.hasKernel()) {
        /* jshint -W053 */
        /* eslint-disable no-new-wrappers */
        return new Boolean(aString);
        /* eslint-enable no-new-wrappers */
        /* jshint +W053 */
    }

    return this.parse(aString, sourceLocale);
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('asArray',
function() {

    /**
     * @name asArray
     * @synopsis Returns the receiver as a single element array [this];
     * @returns {Array}
     */

    var arr;

    //  Opera won't like it if we pass back a single object in a literal
    arr = TP.ac().add(this);

    return arr;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('asBoolean',
function() {

    /**
     * @name asBoolean
     * @synopsis Returns the receiver as a Boolean instance. Invalid dates are
     *     considered false.
     * @returns {Boolean}
     */

    //  if we're 'Invalid Date' we're false
    return (this.toString() !== TP.DateProto.toString());
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('asDate',
function() {

    /**
     * @name asDate
     * @synopsis Returns the receiver as a Date instance.
     * @returns {Date}
     */

    return this;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('asHash',
function() {

    /**
     * @name asHash
     * @synopsis Returns the receiver as a TP.lang.Hash.
     * @returns {TP.lang.Hash} The receiver converted into a TP.lang.Hash.
     */

    return TP.hc('value', this);
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('asNumber',
function() {

    /**
     * @name asNumber
     * @synopsis Returns the receiver as an instance of Number. In particular,
     *     the return value is the internal milliseconds format for the date.
     * @returns {Number}
     */

    return this.getTime();
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('asString',
function(verbose) {

    /**
     * @name asString
     * @synopsis Returns the receiver in string form, localized as needed.
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the Date's String representation. The default is true.
     * @returns {String} The date in default string format.
     * @todo
     */

    var wantsVerbose;

    wantsVerbose = TP.ifInvalid(verbose, true);
    if (!wantsVerbose) {
        return TP.objectToString(this);
    }

    //  TODO:   add "default date format" lookup here and for other types
    if (TP.sys.hasKernel()) {
        return TP.sys.getLocale().localizeDate(this);
    }

    return this.toUTCString();
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('asFunction',
function() {

    /**
     * @name asFunction
     * @synopsis Returns the receiver as a Function instance.
     * @returns {Function}
     */

    return this;
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('asHash',
function() {

    /**
     * @name asHash
     * @synopsis Returns the receiver as a TP.lang.Hash.
     * @returns {TP.lang.Hash} The receiver converted into a TP.lang.Hash.
     */

    return TP.hc('value', this);
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('asNumber',
function() {

    /**
     * @name asNumber
     * @synopsis Returns the receiver as a number instance. Functions always
     *     return 0 for this call.
     * @returns {Function}
     */

    return 0;
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('asString',
function(verbose) {

    /**
     * @name asString
     * @synopsis Returns the receiver in string form.
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the Function's String representation. The default is true.
     * @returns {String} The receiver as a String.
     */

    var wantsVerbose;

    wantsVerbose = TP.ifInvalid(verbose, true);
    if (!wantsVerbose) {
        return TP.gid(this);
    }

    //  The 'verbose' version of a Function is it's 'toString()' rep.
    return TP.objectToString(this);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('asArray',
function() {

    /**
     * @name asArray
     * @synopsis Returns the receiver as a single element array [this];
     * @returns {Array}
     */

    var arr;

    //  Opera won't like it if we pass back a single object in a literal
    arr = TP.ac().add(this);

    return arr;
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('asDate',
function() {

    /**
     * @name asDate
     * @synopsis Returns the receiver as an instance of Date. The receiver
     *     should represent a milliseconds format acceptable to the Date
     *     constructor.
     * @returns {Date}
     */

    return TP.dc(this);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('asHash',
function() {

    /**
     * @name asHash
     * @synopsis Returns the receiver as a TP.lang.Hash.
     * @returns {TP.lang.Hash} The receiver converted into a TP.lang.Hash.
     */

    return TP.hc('value', this);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('asNumber',
function() {

    /**
     * @name asNumber
     * @returns {Number}
     * @abtract Returns the receiver as a Number instance.
     * @todo
     */

    return this;
});

//  ------------------------------------------------------------------------

Number.Type.defineMethod('fromString',
function(aString, sourceLocale) {

    /**
     * @name fromString
     * @param {String} aString The string to parse.
     * @param {String|TP.core.Locale} sourceLocale A source xml:lang or
     *     TP.core.Locale defining the language the string is now in. Defaults
     *     to getTargetLanguage() which is based on the current locale's
     *     language-country value.
     * @returns {Number} A new instance.
     * @abtract Parses the inbound string to produce a new Number using a
     *     combination of the current TP.core.Locale and native JavaScript
     *     numeric parse routines.
     * @todo
     */

    //  kernel isn't loaded completely? use native call
    if (!TP.sys.hasKernel()) {
        //  number only takes one argument (at most)
        /* jshint -W053 */
        /* eslint-disable no-new-wrappers */
        return new Number(aString);
        /* eslint-enable no-new-wrappers */
        /* jshint +W053 */
    }

    return this.parse(aString, sourceLocale);
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('asArray',
function() {

    /**
     * @name asArray
     * @synopsis Returns the receiver as an Array instance.
     * @returns {Array}
     */

    var arr;

    //  watch out for arguments array here. in some browsers it's an
    //  Object rather than an Array or arguments instance.
    if (TP.isArgArray(this)) {
        return TP.ac(this);
    }

    //  Opera won't like it if we pass back a single object in a literal
    arr = TP.ac().add(this);

    return arr;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('asBoolean',
function() {

    /**
     * @name asBoolean
     * @synopsis Returns the receiver as a Boolean instance.
     * @returns {Boolean}
     */

    return Boolean.fromString(this.asString());
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('asDate',
function() {

    /**
     * @name asDate
     * @synopsis Returns the receiver as a Date instance.
     * @returns {Date}
     */

    var theDate;

    theDate = TP.dc(this.asString());

    return TP.dc(this.asString());
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('asFunction',
function() {

    /**
     * @name asFunction
     * @synopsis Returns the receiver as a Function instance.
     * @returns {Function}
     */

    return TP.fc(this.asString());
});

//  ------------------------------------------------------------------------
//  asHash          Collections
//  ------------------------------------------------------------------------

TP.defineCommonMethod('asNumber',
function() {

    /**
     * @name asNumber
     * @synopsis Returns the receiver as a Number instance.
     * @returns {Number}
     */

    return TP.nc(this.asString());
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('asRegExp',
function() {

    /**
     * @name asRegExp
     * @synopsis Returns the receiver as a RegExp instance.
     * @returns {RegExp}
     */

    return TP.rc(this.asString());
});

//  ------------------------------------------------------------------------

RegExp.Inst.defineMethod('asArray',
function() {

    /**
     * @name asArray
     * @synopsis Returns the receiver as an Array instance.
     * @returns {Array}
     */

    var arr;

    //  Opera won't like it if we pass back a single object in a literal
    arr = TP.ac().add(this);

    return arr;
});

//  ------------------------------------------------------------------------

RegExp.Inst.defineMethod('asHash',
function() {

    /**
     * @name asHash
     * @synopsis Returns the receiver as a TP.lang.Hash.
     * @returns {TP.lang.Hash} The receiver converted into a TP.lang.Hash.
     */

    return TP.hc('value', this);
});

//  ------------------------------------------------------------------------

RegExp.Inst.defineMethod('asRegExp',
function() {

    /**
     * @name asRegExp
     * @synopsis Returns the receiver as a RegExp instance.
     * @returns {RegExp}
     */

    return this;
});

//  ------------------------------------------------------------------------

RegExp.Inst.defineMethod('asString',
function(verbose) {

    /**
     * @name asString
     * @synopsis Returns the receiver as a String.
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the RegExp's String representation. This flag is ignore in this
     *     version of this method.
     * @returns {String} The receiver as a String.
     */

    //   We use 'toString()' rather than the 'source' property, since it
    //   includes the flags, etc.
    return this.toString();
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asArray',
function(splitChar) {

    /**
     * @name asArray
     * @synopsis Returns the receiver as an Array instance. The string is split
     *     using the delimiter provided or the empty string which results in an
     *     array of characters (the default).
     * @param {String} splitChar The delimiter to split on.
     * @returns {Array}
     * @todo
     */

    var delim;

    delim = TP.ifInvalid(splitChar,
                        TP.isString(this.$get('delimiter')) ?
                            this.$get('delimiter') :
                            '');

    return this.split(delim);
});

//  ------------------------------------------------------------------------
//  asHash          Collections
//  ------------------------------------------------------------------------

String.Inst.defineMethod('asNumber',
function() {

    /**
     * @name asNumber
     * @synopsis Returns the receiver as a Number instance.
     * @returns {Number}
     */

    //  We use parseFloat() so that we don't have to worry about parsing
    //  octals, etc. We'll never do that anyway and that behavior (parsing a
    //  leading '0' as octal) has been removed for ECMAScript E5 strict mode
    //  anyway.

    var result;

    if (TP.regex.PERCENTAGE.test(this)) {
        if (TP.isNumber(result = parseFloat(this))) {
            return result / 100;
        }
    }

    return parseFloat(this);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('defineSubtype',
function(name) {

    /**
     * @name defineSubtype
     * @synopsis Adds a new subtype to the type represented by the receiving
     *     string.
     * @param {String} name The name of the subtype, including an optional
     *     namespace prefix and colon separator.
     * @returns {TP.lang.RootObject} The new type object representing the
     *     subtype added.
     * @todo
     */

    var typ;

    typ = this.asType();
    if (TP.isType(typ)) {
        return typ.defineSubtype(name);
    }

    return this.raise('TP.sig.InvalidType', this);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('canResolveDNU',
function(anOrigin, aMethodName, anArgArray, callingContext) {

    /**
     * @name canResolveDNU
     * @synopsis Provides an instance that has triggered the DNU machinery with
     *     an opportunity to handle the problem itself. For string instances
     *     this results in a test to see if conversion to a type with the name
     *     contained in the string would succeed.
     * @param {Object} anOrigin The object asking for help. The receiver in this
     *     case.
     * @param {String} aMethodName The method name that failed.
     * @param {Array} anArgArray Optional arguments to function.
     * @param {Function|Arguments} callingContext The calling context.
     * @returns {Boolean} TRUE means resolveDNU() will be called. FALSE means
     *     the standard DNU machinery will continue processing. The default is
     *     FALSE.
     * @todo
     */

    var typ;

    typ = this.asType();
    if (TP.isType(typ)) {
        //  test for non-dnu implementation
        if (TP.canInvoke(typ, aMethodName)) {
            return true;
        }

        //  defer to type for more advanced resolution options
        return typ.canResolveDNU(
                    anOrigin, aMethodName, anArgArray, callingContext);
    }

    return false;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('construct',
function() {

    /**
     * @name construct
     * @synopsis Returns a new instance of the type represented by the receiving
     *     string.
     * @returns {Object} The new instance.
     */

    var typ;

    typ = this.asType();
    if (TP.isType(typ)) {
        return typ.construct.apply(typ, arguments);
    } else {
        return this.raise('TP.sig.InvalidType', this);
    }
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('initialize',
function() {

    /**
     * @name initialize
     * @synopsis When the receiver is being treated like a Type this will cause
     *     that type to be loaded and initialized.
     * @returns {Object} The new instance.
     */

    var typ;

    if (this === TP.StringProto) {
        return;
    }

    typ = this.asType();
    if (TP.isType(typ)) {
        return typ;
    } else {
        return this.raise('TP.sig.InvalidType', this);
    }

    return;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('resolveDNU',
function(anOrigin, aMethodName, anArgArray, callingContext) {

    /**
     * @name resolveDNU
     * @synopsis Invoked by the main DNU machinery when the instance has
     *     responded TRUE to canResolveDNU() for the parameters given. For a
     *     string instance that means conversion via asType() would succeed.
     * @param {Object} anOrigin The object asking for help.
     * @param {String} aMethodName The method name that failed.
     * @param {Array} anArgArray Optional arguments to function.
     * @param {Function|Arguments} callingContext The calling context.
     * @returns {Object} The results of function resolution.
     * @todo
     */

    var typ;

    typ = this.asType();
    if (TP.isType(typ)) {
        switch (anArgArray.length) {
            case 0:
                return typ[aMethodName]();
            case 1:
                return typ[aMethodName](anArgArray[0]);
            case 2:
                return typ[aMethodName](anArgArray[0], anArgArray[1]);
            default:
                return typ[aMethodName].apply(typ, anArgArray);
        }
    }

    return this.raise('TP.sig.InvalidType', this);
});

//  ========================================================================
//  TP.lang.RootObject - PART II
//  ========================================================================

/*
Continuing development of the meta-object protocol.
*/

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('defineInstGetter',
function(propertyName, methodBody) {

    /**
     * @name defineInstGetter
     * @synopsis Adds an ECMA edition 5 'getter' with name and body provided as
     *     an instance 'getter'.
     * @param {String} propertyName The name of the property that the getter
     *     should be installed for.
     * @param {Function} methodBody The actual getter implementation.
     * @returns {Object} The receiver.
     */

    var proto = this[TP.INSTC].prototype;

    Object.defineProperty(proto, propertyName, {get: methodBody});

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('defineInstSetter',
function(propertyName, methodBody) {

    /**
     * @name defineInstSetter
     * @synopsis Adds an ECMA edition 5 'setter' with name and body provided as
     *     an instance 'setter'.
     * @param {String} propertyName The name of the property that the setter
     *     should be installed for.
     * @param {Function} methodBody The actual setter implementation.
     * @returns {Object} The receiver.
     */

    var proto = this[TP.INSTC].prototype;

    Object.defineProperty(proto, propertyName, {set: methodBody});

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('defineTypeGetter',
function(propertyName, methodBody) {

    /**
     * @name defineTypeGetter
     * @synopsis Adds an ECMA edition 5 'getter' with name and body provided as
     *     a type 'getter'.
     * @param {String} propertyName The name of the property that the getter
     *     should be installed for.
     * @param {Function} methodBody The actual getter implementation.
     * @returns {Object} The receiver.
     */

    var proto = this[TP.TYPEC].prototype;

    Object.defineProperty(proto, propertyName, {get: methodBody});

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('defineTypeSetter',
function(propertyName, methodBody) {

    /**
     * @name defineTypeSetter
     * @synopsis Adds an ECMA edition 5 'setter' with name and body provided as
     *     an type 'setter'.
     * @param {String} propertyName The name of the property that the setter
     *     should be installed for.
     * @param {Function} methodBody The actual setter implementation.
     * @returns {Object} The receiver.
     */

    var proto = this[TP.TYPEC].prototype;

    Object.defineProperty(proto, propertyName, {set: methodBody});

    return this;
});

//  ------------------------------------------------------------------------
//  Access Path Aliases
//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getAccessPathAliases',
function(aPath, includeSupertypes) {

    /**
     * @name getAccessPathAliases
     * @synopsis Returns an Array of 'access path aliases' - that is, the
     *     aliased names that the receiver uses for a particular path (i.e.
     *     '/person/lastName' might map to 'lastName').
     * @param {String} aPath The path to check for aliases.
     * @param {Boolean} includeSupertypes Whether or not to include the
     *     receiver's supertypes when looking for path aliases. The default is
     *     true.
     * @returns {Array|null} An Array of access path aliases for the receiver or
     *     null.
     */

    var entry;

    entry = TP.sys.$$meta_pathinfo.at(this.getName() + '_Type');

    //  If we didn't find an entry in for the type itself, and the flag doesn't
    //  prevent us with checking with the supertypes, then do so.
    //  Note the explicit 'notFalse' check here - by default, this parameter is
    //  true.
    if (TP.notFalse(includeSupertypes) && TP.notValid(entry)) {

        //  Since supertype names are always reported from most-to-least
        //  specific, this will properly find any overrides on path aliases from
        //  higher-level supertypes.
        this.getSupertypeNames().perform(
                function(aTypeName) {
                    if (TP.isValid(entry = TP.sys.$$meta_pathinfo.at(
                                    aTypeName + '_Type'))) {
                        return TP.BREAK;
                    }
                });
    }

    if (TP.isValid(entry)) {
        //  NB: We use primitive property access here since 'entry' is a
        //  primitive object
        return entry[aPath];
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineMethod('getAccessPathAliases',
function(aPath, includeSupertypes) {

    /**
     * @name getAccessPathAliases
     * @synopsis Returns an Array of 'access path aliases' - that is, the
     *     aliased names that the receiver uses for a particular path (i.e.
     *     '/person/lastName' might map to 'lastName').
     * @param {String} aPath The path to check for aliases.
     * @param {Boolean} includeSupertypes Whether or not to include the
     *     receiver's supertypes when looking for property path aliases. The
     *     default is true.
     * @returns {Array|null} An Array of access path aliases for the receiver or
     *     null.
     */

    var entry;

    entry = TP.sys.$$meta_pathinfo.at(this.getTypeName() + '_Inst');

    //  If we didn't find an entry in for the type itself, and the flag doesn't
    //  prevent us with checking with the supertypes, then do so.
    //  Note the explicit 'notFalse' check here - by default, this parameter is
    //  true.
    if (TP.notFalse(includeSupertypes) && TP.notValid(entry)) {

        //  Since supertype names are always reported from most-to-least
        //  specific, this will properly find any overrides on path aliases from
        //  higher-level supertypes.
        this.getSupertypeNames().perform(
                function(aTypeName) {
                    if (TP.isValid(entry = TP.sys.$$meta_pathinfo.at(
                                    aTypeName + '_Inst'))) {
                        return TP.BREAK;
                    }
                });
    }

    if (TP.isValid(entry)) {
        //  NB: We use primitive property access here since 'entry' is a
        //  primitive object
        return entry[aPath];
    }

    return null;
});

//  ------------------------------------------------------------------------
//  Attribute Property Descriptors
//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getDescriptorFor',
function(attributeName, includeSupertypes) {

    /**
     * @name getDescriptorFor
     * @synopsis Returns the property descriptor, if any, for the type attribute
     *     provided. See the 'TP.sys.addMetadata()' call for more information
     *     about property descriptors.
     * @param {String} attributeName The name of the attribute to get the
     *     property descriptor for.
     * @param {Boolean} includeSupertypes Whether or not to include the
     *     receiver's supertypes when looking for property descriptors. The
     *     default is true.
     * @returns {Object} The property descriptor of the attribute on the
     *     receiver.
     */

    var entry;

    entry = TP.sys.$$meta_attributes.at(
                        this.getName() + '_Type_' + attributeName);

    //  If we didn't find an entry in for the type itself, and the flag doesn't
    //  prevent us with checking with the supertypes, then do so.
    //  Note the explicit 'notFalse' check here - by default, this parameter is
    //  true.
    if (TP.notFalse(includeSupertypes) && TP.notValid(entry)) {

        //  Since supertype names are always reported from most-to-least
        //  specific, this will properly find any overrides on descriptors from
        //  higher-level supertypes.
        this.getSupertypeNames().perform(
                function(aTypeName) {
                    if (TP.isValid(entry = TP.sys.$$meta_attributes.at(
                                    aTypeName + '_Type_' + attributeName))) {
                        return TP.BREAK;
                    }
                });
    }

    return entry;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getInstDescriptorFor',
function(attributeName, includeSupertypes) {

    /**
     * @name getInstDescriptorFor
     * @synopsis Returns the property descriptor, if any, for the instance
     *     attribute provided. See the 'TP.sys.addMetadata()' call for more
     *     information about property descriptors.
     * @param {String} attributeName The name of the attribute to get the
     *     property descriptor for.
     * @param {Boolean} includeSupertypes Whether or not to include the
     *     receiver's supertypes when looking for property descriptors. The
     *     default is true.
     * @returns {Object} The property descriptor of the attribute on the
     *     receiver.
     */

    var entry;

    entry = TP.sys.$$meta_attributes.at(
                        this.getName() + '_Inst_' + attributeName);

    //  If we didn't find an entry in for the type itself, and the flag doesn't
    //  prevent us with checking with the supertypes, then do so.
    //  Note the explicit 'notFalse' check here - by default, this parameter is
    //  true.
    if (TP.notFalse(includeSupertypes) && TP.notValid(entry)) {

        //  Since supertype names are always reported from most-to-least
        //  specific, this will properly find any overrides on descriptors from
        //  higher-level supertypes.
        this.getSupertypeNames().perform(
                function(aTypeName) {
                    if (TP.isValid(entry = TP.sys.$$meta_attributes.at(
                                    aTypeName + '_Inst_' + attributeName))) {
                        return TP.BREAK;
                    }
                });
    }

    return entry;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineMethod('getDescriptorFor',
function(attributeName, includeSupertypes) {

    /**
     * @name getDescriptorFor
     * @synopsis Returns the property descriptor, if any, for the instance
     *     attribute provided. See the 'TP.sys.addMetadata()' call for more
     *     information about property descriptors.
     * @param {String} attributeName The name of the attribute to get the
     *     property descriptor for.
     * @param {Boolean} includeSupertypes Whether or not to include the
     *     receiver's supertypes when looking for property descriptors. The
     *     default is true.
     * @returns {Object} The property descriptor of the attribute on the
     *     receiver.
     */

    return this.getType().getInstDescriptorFor(attributeName,
                                                includeSupertypes);
});

//  ------------------------------------------------------------------------
//  Attribute Facets
//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineMethod('checkFacets',
function(aspectName, facetList) {

    /**
     * @name checkFacets
     * @synopsis Checks the facets of the supplied aspect on the receiver
     *     according to the list of facets supplied (or TP.FACET_NAMES if one
     *     isn't supplied). If a valid facet value can be computed for a
     *     particular aspect, that facet value is set for that aspect.
     * @param {String} aspectName The name of the aspect to check the facets
     *     for.
     * @param {Array} facetList The list of facets to check. This is an optional
     *     parameter.
     * @returns {TP.lang.RootObject} The receiver.
     */

    var facets,

        len,
        i,

        facetName,
        result;

    //  Default the set of facets to check to TP.FACET_NAMES, which are the list
    //  of standard facets for all TIBET attributes.
    facets = TP.ifInvalid(facetList, TP.FACET_NAMES);

    len = facets.getSize();
    for (i = 0; i < len; i++) {

        facetName = facets.at(i);

        //  Grab the facet value (which is different than the facet setting -
        //  the facet value could be a computed value).
        if (TP.isValid(result = this.getFacetValueFor(aspectName, facetName))) {

            //  We got a valid value - set it.
            this.setFacet(aspectName, facetName, result);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineMethod('facetChanged',
function(anAspect, aFacet, aDescription) {

    /**
     * @name facetChanged
     * @synopsis Notifies observers that the named facet of the receiver has
     *     changed.
     * @param {String} anAspect The aspect of the receiver that changed. This is
     *     usually an attribute name.
     * @param {String} aFacet The facet of the receiver that changed. This is
     * usually one of the standard TIBET facets listed in TP.FACET_NAMES.
     * @param {TP.lang.Hash} aDescription A hash describing details of the
     *     change.
     * @returns {Object} The receiver.
     * @signals Change
     */

    var asp,
        baseSig,
        sig,
        desc;

    if (!this.shouldSignalChange()) {
        return;
    }

    //  Build up the signal name we'll be firing.
    asp = TP.ifKeyInvalid(aDescription, 'aspect', anAspect) || 'value';

    //  The 'base signal' name is the actual real Signal type that gets fired
    //  (as opposed to the aspectName + facetName + 'Change' spoofed signal that
    //  is computed and observed). This will be that signal's supertype.

    //  In this case, the base signal name will be something like
    //  'TP.sig.RelevantChange'.
    baseSig = 'TP.sig.' + aFacet.asStartUpper() + 'Change';

    //  The signal name will be the spoofed ('unreal') signal name. In this
    //  case, it might be something like 'SSNRelevantChange'
    sig = asp.toString().asStartUpper() + aFacet.asStartUpper() + 'Change';

    //  Build up a standard form for the description hash.
    desc = TP.isValid(aDescription) ? aDescription : TP.hc();
    if (!TP.canInvoke(desc, 'atPutIfAbsent')) {
        this.raise('TP.sig.InvalidParameter',
                    'Description not a collection.');

        return;
    }
    desc.atPutIfAbsent('aspect', asp);
    desc.atPutIfAbsent('action', TP.UPDATE);
    desc.atPutIfAbsent('facet', aFacet);
    desc.atPutIfAbsent('target', this);

    //  Fire the signal. Note that we force the firing policy here. This allows
    //  observers of a generic 'facet change' signal of some sort to see 'aspect'
    //  facet Change notifications, even if those 'aspect' facet Change signals
    //  haven't been defined as being subtypes of FacetChange (although we also
    //  supply the base signal name as the default signal type here so that
    //  undefined aspect signals will use that type).
    TP.signal(this, sig, desc, TP.INHERITANCE_FIRING, baseSig);

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineMethod('getFacetValueFor',
function(aspectName, facetName) {

    /**
     * @name getFacetValueFor
     * @synopsis Returns the facet value for the named facet of the named aspect
     *     on the receiver.
     * @description Note that the facet value is *not* the same as the facet
     *     setting. The facet setting is the mechanism, supplied by the code
     *     author, of computing the facet value. It may be a simple literal
     *     value, an access path or the name of a method to execute on the
     *     receiver. These are all different ways that a facet value may be
     *     obtained on the receiver.
     * @param {String} aspectName The name of the aspect to return the facet
     *      value for.
     * @param {String} facetName The name of the facet to return the facet
     *      value for.
     * @returns {Object} The value of the named facet of the named aspect on the
     *      receiver.
     */

    var facetSetting,
        facetValue,

        val;

    //  First, make sure that the aspect has a facet named by the facetName. If
    //  not, just return null
    if (TP.notValid(facetSetting = this.getType().getInstFacetSettingFor(
                                                    aspectName,
                                                    facetName))) {
        return null;
    }

    //  We compute the facet value differently depending on whether we're
    //  computing the validity facet or not.
    switch (facetName) {

        case TP.VALID:

            //  If facetSetting is a POJO with a 'value' slot, then that's the
            //  value to use, otherwise we do a 'get' of the aspectName
            if (TP.isValid(facetValue = facetSetting.value)) {
                if (TP.isBoolean(facetSetting)) {
                    val = facetValue;
                } else if (TP.isArray(facetSetting)) {
                    val = facetValue;
                } else if (facetValue.isAccessPath()) {
                    val = facetValue.executeGet(this);
                } else if (TP.isString(facetValue) &&
                            TP.isMethod(this[facetValue])) {
                    val = this[facetValue]();
                } else if (TP.isString(facetValue)) {
                    val = facetValue;
                }
            } else  {
                val = this.get(aspectName);
            }

            //  The validity facet is computed by a method, since it is a more
            //  complex calculation than any of the other facets.
            facetValue = this.getType().validateConstraintsOn(val, facetSetting);

        break;

        default:

            //  Otherwise, use a series of object tests to try to obtain the
            //  best value for the facet.
            if (TP.isBoolean(facetSetting)) {
                facetValue = facetSetting;
            } else if (TP.isArray(facetSetting)) {
                facetValue = facetSetting;
            } else if (facetSetting.isAccessPath()) {
                facetValue = facetSetting.executeGet(this);
            } else if (TP.isString(facetSetting) &&
                        TP.isMethod(this[facetSetting])) {
                facetValue = this[facetSetting]();
            } else if (TP.isString(facetSetting)) {
                facetValue = facetSetting;
            }

        break;
    }

    return facetValue;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineMethod('$setFacet',
function(aspectName, facetName, facetValue, shouldSignal) {

    /**
     * @name $setFacet
     * @synopsis Sets the value of the named facet of the named aspect to the
     *     value provided. This method should be called from any 'custom facet
     *     setter' in order to a) set the property and b) signal a change, if
     *     configured.
     * @param {String} aspectName The name of the aspect to set.
     * @param {String} facetName The name of the facet to set.
     * @param {Boolean} facetValue The value to set the facet to.
     * @param {Boolean} shouldSignal If false no signaling occurs. Defaults to
     *     this.shouldSignalChange().
     * @returns {Object} The receiver.
     */

    var facetSlotName,
        currentFacetVal,

        sigFlag;

    //  If the facet is 'value', then use the standard 'set' mechanism.
    if (facetName === 'value') {
        return this.set(aspectName, facetValue);
    }

    //  The internal facet slot name will always be something like
    //  '$SSN_required'.
    facetSlotName = '$' + aspectName + '_' + facetName;

    //  Grab the current value of the internal slot and compare it to the
    //  supplied value. Only go through the act of setting it and signaling a
    //  change if they're different.
    currentFacetVal = this.get(facetSlotName);
    if (currentFacetVal !== facetValue) {

        //  If the internal slot is not defined on the receiver, define it.
        //  Otherwise, TIBET's '$set' method will whine ;-).
        if (TP.notDefined(this[facetSlotName])) {
            this.defineAttribute(facetSlotName);
        }

        //  Use '$set' here along with false to make sure the core '$set' method
        //  does *not* signal change with this internal slot - we do a custom
        //  change signal below.
        this.$set(facetSlotName, facetValue, false);

        if (TP.notValid(sigFlag = shouldSignal)) {
            sigFlag = this.shouldSignalChange();
        }

        if (sigFlag) {

            //  Call facetChanged with all of the appropriate information.
            this.facetChanged(aspectName,
                                facetName,
                                TP.hc(TP.OLDVAL, currentFacetVal,
                                        TP.NEWVAL, facetValue));
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineMethod('setFacet',
function(aspectName, facetName, facetValue, shouldSignal) {

    /**
     * @name setFacet
     * @synopsis Sets the value of the named facet of the named aspect to the
     *     value provided.
     * @param {String} aspectName The name of the aspect to set.
     * @param {String} facetName The name of the facet to set.
     * @param {Boolean} facetValue The value to set the facet to.
     * @param {Boolean} shouldSignal If false no signaling occurs. Defaults to
     *     this.shouldSignalChange().
     * @returns {Object} The receiver.
     */

    var funcName;

    //  First, check to see if the receiver provides a 'custom setter' method
    //  for this facet/aspect combination. Something like 'setSSNRequired'.
    funcName = 'set' + aspectName.asStartUpper() + facetName.asStartUpper();

    if (TP.canInvoke(this, funcName)) {
        this[funcName](facetValue);
    } else {
        //  No custom setter implemented - use the standard $setFacet() method.
        this.$setFacet(aspectName, facetName, facetValue, shouldSignal);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  TP.lang.RootObject - INSTANCE CONSTRUCTION
//  ------------------------------------------------------------------------

/*
Primitive support for object/instance creation.
*/

//  whether this type uses a singleton instance, and that instance reference
TP.lang.RootObject.Type.defineAttribute('$$useSingleton', false);
TP.lang.RootObject.Type.defineAttribute('$$singleton', null);

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('$alloc',
function() {

    /**
     * @name $alloc
     * @synopsis Allocates and returns a new instance but doesn't initialize it.
     *     When the type is defined to allocate a singleton this method
     *     allocates and reuses that object.
     * @returns {Object} A new instance.
     */

    var inst;

    if (this.shouldUseSingleton() &&
        TP.isValid(inst = this.$get('$$singleton'))) {
        //  clear the instance of any lingering data first
        if (inst.isRecyclable()) {
            inst.recycle();
        }

        return inst;
    }

    return new this[TP.INSTC]();
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('shouldUseSingleton',
function(aFlag) {

    /**
     * @name shouldUseSingleton
     * @synopsis Combined setter/getter for the instance singleton flag.
     * @param {Boolean} aFlag An optional new flag value to set.
     * @returns {Boolean} The current state of the singleton flag.
     * @todo
     */

    if (TP.isBoolean(aFlag)) {
        this.$set('$$useSingleton', aFlag);
    }

    return this.$get('$$useSingleton');
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('construct',
function() {

    /**
     * @name construct
     * @synopsis Makes a new instance of the receiver by calling the most
     *     primitive constructor and then executing init() on the new instance.
     *     The init() call is then allowed to pass back an optional instance
     *     which, if valid, will be returned to the caller. If not, then the
     *     new instance constructed here will be returned. Note that the
     *     instance returned may actually be an instance of a valid subtype
     *     if the receiver is abstract.
     * @returns {Object} A new instance.
     * @todo
     */

    var newinst,
        optinst;

    //  see if we're abstract. interesting concept that if we were to know
    //  our needs and we didn't have them all met we are by definition
    //  abstract since we would be "incomplete"
            //  if (TP.isArray(this.$needs) && (this.$needs.length > 0))
            //  {
            //    return this.raise('TP.sig.InvalidInstantiation');
            //  };

    //  alternative view of "abstract" in which we do a "clustering"
    //  approach and look for subtypes etc. if the receiver is an abstract
    //  type we'll defer creation to the viaSubtype variant. this allows the
    //  remainder of this method to be inherited and reused by the subtypes
    //  themselves.
    if (this.isAbstract()) {
        return this.constructViaSubtype.apply(this, arguments);
    }

    //  If our traits haven't yet been resolved, try to do that. Note that this
    //  type very well might *not* have traits, but one of it's supertypes may.
    //  This flag will only be set to true if all trait resolution 'up the
    //  chain' has been performed. This way, we can ensure that all supertypes
    //  have properly resolved any traits they might have.
    if (!this.get('$traitsResolved')) {

        this.finalizeTraits();

        //  If they remain unresolved then that's an error - throw one. We can't
        //  create instances of types that have unresolved traits.
        if (!this.get('$traitsResolved')) {
            return undefined;
        }
    }

    //  If we can respond to 'initializeLazily', do it.
    if (TP.canInvoke(this, 'initializeLazily')) {
        this.initializeLazily();
    }

    //  use metadata link (to instance constructor) for primitive call
    newinst = this.$alloc();

    //  TODO:   figure out why the constructor isn't adequate here
    //  set the type...for some reason we can't get this back from the
    //  constructor so we just set it explicitly...
    newinst[TP.TYPE] = this[TP.TYPE];

    //  initialize the new instance. Notice that the object passed back
    //  does NOT have to be the object passed in. This is critical because
    //  in TIBET's collection classes we often local program an Array or
    //  Object to stand in for what you think is a collection type. Also note
    //  that the $init is a shared internal initializer useful for hidden
    //  initialization that can be leveraged by all instances.
    newinst = newinst.$init.apply(newinst, arguments);
    optinst = newinst.init.apply(newinst, arguments);

    if (TP.isValid(optinst)) {
        return optinst;
    }
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineMethod('init',
function() {

    /**
     * @name init
     * @synopsis Provides instances with an opportunity to initialize. The
     *     default implementation does nothing.
     * @returns {Object} A new instance.
     * @todo
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineMethod('getRepresentedType',
function() {

    /**
     * @name getRepresentedType
     * @synopsis Returns a type that this object might be 'representing'. This
     *     is used in places like TIBET's XMLSchema support to return the type
     *     that the element containing the schema is describing to the system.
     *     The default implementation here returns null.
     */

    return null;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineMethod('isRecyclable',
function(aFlag) {

    /**
     * @name isRecyclable
     * @synopsis Returns true if the instance can be recycled.
     * @param {Boolean} aFlag A new setting. Optional.
     * @returns {Boolean} True if the instance can be recycled.
     * @todo
     */

    if (TP.isBoolean(aFlag)) {
        this.$set('recyclable', aFlag);
    }

    return TP.isTrue(this.$get('recyclable'));
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineMethod('recycle',
function() {

    /**
     * @name recycle
     * @synopsis Prepares the receiver for a new usage cycle. This is typically
     *     used in conjunction with types who manage a singlegon instance which
     *     may potentially need to be reused or recycled between usages. By
     *     default this method does nothing, leaving the instance in its
     *     original state.
     * @returns {TP.lang.RootObject} The receiver.
     * @todo
     */

    //  default is a no-op
    return this;
});

//  ------------------------------------------------------------------------
//  TP.lang.RootObject - METHOD DISPATCH
//  ------------------------------------------------------------------------

/*
Inheritance isn't of much value if you have to use copy/paste to reuse
features of a supertype implementation. That's one of the major gaps in the
prototype system as it stands in JS and most other libraries that just paper
over the JS prototype system. In TIBET we provide a number of methods which
support fast lookup and invocation of the "next method". Note that this is
subtlely different from "super method". Due to JS's ability to have "local"
methods which may cover the method on the instance's constructor.prototype
the "next method" may not always be the supertype method. TIBET recognizes
this and finds the proper method regardless of whether you're in a Type
method, instance method, or local method.

*/

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('callNextMethod',
function() {

    /**
     * @name callNextMethod
     * @synopsis Invokes the next method in the lookup chain. This is somewhat
     *     analogous to a super() call but with the added aspect that an
     *     instance which has been programmed differently from its standard
     *     instance behavior can use this method to skip the specific local
     *     method and invoke the instance method of its type.
     * @returns {Object} The function's results.
     * @todo
     */

    var theFunction,
        theArgs,

        functionName,
        functionOwner,
        functionTrack,
        functionParent,

        superFunc;

    //  there is no "next method" after you reach the top (TP.ObjectProto)
    if (this === TP.ObjectProto) {
        return;
    }

    theFunction = TP.$$currentCallee$$;

    if (arguments.length > 0) {
        theArgs = arguments;
    } else {
        theArgs = TP.$$currentArgs$$;
    }

    //  We could use this[functionName] but that won't provide a way to avoid
    //  recursions.
    if (TP.notValid(theFunction)) {
        return this.raise('TP.sig.InvalidContext');
    }

    if (theFunction.hasOwnProperty('$$superfunc')) {
        superFunc = theFunction.$$superfunc;
        if (superFunc === TP.NONE) {
            return;
        }
    }

    if (TP.notValid(superFunc)) {

        functionName = theFunction.getName();

        //  Check to make sure that theFunction really has an owner slot. All
        //  objects should, but sometimes we get objects from other contexts
        //  (i.e. frames) that don't know what 'owner' is. in those cases we
        //  can't really proceed
        functionOwner = theFunction[TP.OWNER];
        if (TP.notValid(functionOwner) || functionOwner === self) {
            return;
        }

        //  Figure out which track (type or instance) to follow in locating the
        //  parent implementation. Where we look depends on the nature of the
        //  function and its track.
        functionTrack = theFunction[TP.TRACK];
        switch (functionTrack) {
            case TP.INST_TRACK:
                //  make sure that theFunction's owner really has a parent
                functionParent = functionOwner[TP.SUPER];
                if (TP.notValid(functionParent)) {
                    theFunction.$$superfunc = TP.NONE;
                    return;
                }

                if (!TP.isCallable(superFunc =
                    functionParent[TP.INSTC].prototype[functionName])) {
                    theFunction.$$superfunc = TP.NONE;
                    return;
                }
                break;

            case TP.TYPE_TRACK:
                //  make sure that theFunction's owner really has a parent
                functionParent = functionOwner.$$supertype;
                if (TP.notValid(functionParent)) {
                    theFunction.$$superfunc = TP.NONE;
                    return;
                }

                if (!TP.isCallable(superFunc =
                    functionParent[TP.TYPEC].prototype[functionName])) {
                    theFunction.$$superfunc = TP.NONE;
                    return;
                }
                break;

            case TP.TYPE_LOCAL_TRACK:
                //  local method on the type itself...
                if (!TP.isCallable(superFunc =
                    functionOwner[TP.TYPEC].prototype[functionName])) {
                    theFunction.$$superfunc = TP.NONE;
                    return;
                }
                break;

            case TP.LOCAL_TRACK:
                //  local method on an instance
                if (!TP.isCallable(superFunc =
                    functionOwner.getType()[TP.INSTC].prototype[functionName])) {
                    theFunction.$$superfunc = TP.NONE;
                    return;
                }
                break;

            case TP.GLOBAL_TRACK:
            case TP.PRIMITIVE_TRACK:
                theFunction.$$superfunc = TP.NONE;
                return;

            default:
                return;
        }

        //  DO NOT RECURSE...NO 'NEXT' FUNCTION
        if (theFunction === superFunc) {
            theFunction.$$superfunc = TP.NONE;
            return;
        }

        //  cache result for future lookups
        theFunction.$$superfunc = superFunc;
    }

    return superFunc.apply(this, theArgs);
});

//  ------------------------------------------------------------------------

//  make it available at the instance level as well
TP.lang.RootObject.Inst.defineMethod('callNextMethod',
                        TP.lang.RootObject[TP.TYPEC].prototype.callNextMethod);

//  to avoid problems with native types getting this invoked on them we
//TP.ObjectProto.addLocalMethod('callNextMethod', TP.RETURN_NULL);

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('callNextMethod',
function() {

    /**
     * @name callNextMethod
     * @synopsis Invokes the next method in the lookup chain. This is somewhat
     *     analogous to a super() call but with the added aspect that an
     *     instance which has been programmed differently from its standard
     *     instance behavior can use this method to skip the specific local
     *     method and invoke the instance method of its type.
     * @returns {Object} The function's results.
     * @todo
     */

    var theFunction,
        theArgs,

        functionName,

        superFunc;

    //  there is no "next method" after you reach the top (TP.ObjectProto)
    if (this === TP.ObjectProto) {
        return;
    }

    theFunction = TP.$$currentCallee$$;

    if (arguments.length > 0) {
        theArgs = arguments;
    } else {
        theArgs = TP.$$currentArgs$$;
    }

    // We could use this[functionName] but that won't provide a way to avoid
    // recursions.
    if (TP.notValid(theFunction)) {
        return this.raise('TP.sig.InvalidContext');
    }

    if (theFunction.hasOwnProperty('$$superfunc')) {
        superFunc = theFunction.$$superfunc;
        if (superFunc === TP.NONE) {
            return;
        }
    }

    if (TP.notValid(superFunc)) {

        functionName = theFunction.getName();

        if (TP.isType(this)) {
            if (!TP.isCallable(superFunc = Object[functionName])) {
                theFunction.$$superfunc = TP.NONE;
                return;
            }
        } else {
            if (!TP.isCallable(superFunc = TP.ObjectProto[functionName])) {
                theFunction.$$superfunc = TP.NONE;
                return;
            }
        }

        //  DO NOT RECURSE...NO 'NEXT' FUNCTION
        if (theFunction === superFunc) {
            theFunction.$$superfunc = TP.NONE;
            return;
        }

        //  cache result for future lookups
        theFunction.$$superfunc = superFunc;
    }

    return superFunc.apply(this, theArgs);
});

//  ------------------------------------------------------------------------
//  TP.lang.RootObject - METHOD SPECIALIZATION
//  ------------------------------------------------------------------------

/*
TIBET makes heavy use of a pattern in which a root method is invoked and the
actual functionality is provided by a variant of that method specialized on
the type of the first argument. This pattern can be seen in the methods: as,
from, is, validate, handle, etc.
*/

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('callBestMethod',
function(callingContext, anObject, aPrefix, aSuffix, aFallback, anArgArray) {

    /**
     * @name callBestMethod
     * @synopsis Finds and invokes the best method possible which begins with
     *     the common prefix provided. The match is based on the type of
     *     anObject, with the most specific type first. For example, a call of:
     *         this.callBestMethod(
     *              arguments, myString, 'from', '', 'fromObject');
     *     will try to invoke this.fromString, then this.fromObject.
     * @param {Arguments} callingContext The arguments object of the calling
     *     context.
     * @param {Object} anObject The object to specialize on.
     * @param {String} aPrefix The method prefix to use. No default, must exist.
     * @param {String} aSuffix The method suffix to use. Defaults to ''.
     * @param {String} aFallback A method name to call in its exact form should
     *     no other method be found. No default, just returns without fallback.
     * @param {Array|arguments} anArgArray An optional argument list. Not
     *     required in most cases since that data is available from
     *         callingContext. Only used when the original arguments should be
     *         altered for the call.
     * @returns {Object} The result of invoking the method found.
     * @todo
     */

    var name,
        args;

    name = this.getBestMethodName(callingContext, anObject, aPrefix, aSuffix,
                                    aFallback, anArgArray);

    if (TP.isEmpty(name)) {
        return;
    }

    args = TP.args(anArgArray || callingContext);

    return this[name].apply(this, args);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getBestMethod',
function(callingContext, anObject, aPrefix, aSuffix, aFallback, anArgArray) {

    /**
     * @name getBestMethod
     * @synopsis Finds the best method possible which begins with the common
     *     prefix provided. The match is based on the type of anObject, with the
     *     most specific type first. See 'callBestMethod' for an example.
     * @param {Arguments} callingContext The arguments object of the calling
     *     context.
     * @param {Object} anObject The object to specialize on.
     * @param {String} aPrefix The method prefix to use. No default, must exist.
     * @param {String} aSuffix The method suffix to use. Defaults to ''.
     * @param {String} aFallback A method name to call in its exact form should
     *     no other method be found. No default, just returns without fallback.
     * @param {Array|arguments} anArgArray An optional argument list. Not
     *     required in most cases since that data is available from
     *     callingContext. Only used when the original arguments should be
     *     altered for the call.
     * @returns {Function} The method found, or null.
     * @todo
     */

    var name;

    name = this.getBestMethodName(callingContext, anObject, aPrefix, aSuffix,
                                    aFallback, anArgArray);

    if (TP.notEmpty(name)) {
        return this[name];
    }

    return;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getBestMethodName',
function(callingContext, anObject, aPrefix, aSuffix, aFallback, anArgArray) {

    /**
     * @name getBestMethodName
     * @synopsis Finds the best method name possible which begins with the
     *     common prefix provided. The match is based on the type of anObject,
     *     with the most specific type first. For example, a call of
     *     this.getBestMethodName(arguments, myString, 'from'); will try to find
     *     this.fromString, then this.fromObject.
     * @param {Arguments} callingContext The arguments object of the calling
     *     context.
     * @param {Object} anObject The object to specialize on.
     * @param {String} aPrefix The method prefix to use. No default, must exist.
     * @param {String} aSuffix The method suffix to use. Defaults to ''.
     * @param {String} aFallback A method name to call in its exact form should
     *     no other method be found. No default, just returns without fallback.
     * @param {Array|arguments} anArgArray An optional argument list. Not
     *     required in most cases since that data is available from
     *     callingContext. Only used when the original arguments should be
     *     altered for the call.
     * @returns {String} The method name found, or null.
     * @todo
     */

    var prefix,
        name,
        suffix,
        supers,
        args,
        len,
        i,
        sname;

    //  there is no "best method" after you reach the top (TP.ObjectProto)
    if (this === TP.ObjectProto) {
        return;
    }

    prefix = aPrefix;
    suffix = aSuffix || '';
    args = TP.args(anArgArray || callingContext);

    if (TP.isNull(anObject)) {
        name = prefix + 'Null' + suffix;

        if (TP.canInvoke(this, name)) {
            return name;
        } else if (TP.canInvoke(this, aFallback)) {
            return aFallback;
        } else {
            return;
        }
    } else if (TP.notDefined(anObject)) {
        name = prefix + 'Undefined' + suffix;

        if (TP.canInvoke(this, name)) {
            return name;
        } else if (TP.canInvoke(this, aFallback)) {
            return aFallback;
        } else {
            return;
        }
    } else {
        if (TP.isType(anObject)) {
            name = prefix +
                    TP.escapeTypeName(TP.tname(anObject)) +
                    TP.TYPE_TRACK + suffix;
        } else {
            name = prefix +
                    TP.escapeTypeName(TP.tname(anObject)) +
                    suffix;
        }

        if (TP.canInvoke(this, name)) {
            return name;
        }

        //  going to have to dig a little deeper, but we have to watch out
        //  for certain native object types or we'll run into problems
        if (TP.notValid(anObject)) {
            name = TP.str(anObject).toUpperCase();
        } else if (TP.isEvent(anObject)) {
            name = prefix + 'Event' + suffix;
        } else if (TP.isError(anObject)) {
            name = prefix + 'Error' + suffix;
        } else if (TP.isNode(anObject)) {
            switch (anObject.nodeType) {
                case Node.DOCUMENT_NODE:

                    name = prefix + 'Document' + suffix;
                    break;

                case Node.ELEMENT_NODE:

                    name = prefix + 'Element' + suffix;
                    break;

                case Node.ATTRIBUTE_NODE:

                    name = prefix + 'Attribute' + suffix;
                    break;

                default:

                    name = prefix + 'Node' + suffix;
                    break;
            }

            //  for nodes we'll do two checks, one for the specific node
            //  type, then one for generic 'Node'
            if (TP.canInvoke(this, name)) {
                return name;
            }

            name = prefix + 'Node' + suffix;
        } else if (TP.isNodeList(anObject)) {
            name = prefix + 'NodeList' + suffix;
        } else if (TP.isNamedNodeMap(anObject)) {
            name = prefix + 'NamedNodeMap' + suffix;
        } else if (TP.isWindow(anObject)) {
            name = prefix + 'Window' + suffix;
        } else if (TP.isNativeType(TP.type(anObject))) {
            //  already checked type name earlier, all that's left is Object
            name = prefix + 'Object' + suffix;
        } else if (TP.isType(anObject)) {
            name = prefix + 'NativeType' + suffix;
        } else if (TP.isStyleDeclaration(anObject)) {
            name = prefix + 'CSSStyleDeclaration' + suffix;
        } else if (TP.isStyleRule(anObject)) {
            name = prefix + 'CSSStyleRule' + suffix;
        } else if (TP.isStyleSheet(anObject)) {
            name = prefix + 'CSSStyleSheet' + suffix;
        } else if (TP.isXHR(anObject)) {
            name = prefix + 'XHR' + suffix;
        } else if (TP.canInvoke(anObject, 'getSupertypeNames')) {
            //  here's where the real specialization power comes in by
            //  checking up the TIBET inheritance chain for a best-fit
            //  method based on the supertypes of the object
            supers = anObject.getSupertypeNames();

            len = supers.getSize();
            for (i = 0; i < len; i++) {
                sname = TP.escapeTypeName(supers.at(i));
                name = prefix + sname + suffix;
                if (TP.canInvoke(this, name)) {
                    return name;
                }
            }
        }
    }

    if (!TP.canInvoke(this, name)) {
        if (TP.isString(aFallback) &&
            aFallback !== name &&
            TP.canInvoke(this, aFallback)) {
            return aFallback;
        }
    } else {
        return name;
    }

    return;
});

//  ------------------------------------------------------------------------
//  TP.lang.RootObject - REFLECTION
//  ------------------------------------------------------------------------

/*
Continued expansion of our support for reflection.
*/

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getConstructor',
function() {

    /**
     * @name getConstructor
     * @synopsis Returns the true constructor for an instance.
     * @returns {Object}
     */

    if (this === TP.lang.RootObject$$Type.prototype) {
        return Function;
    }

    return TP.lang.RootObject$$Type;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getName',
function() {

    /**
     * @name getName
     * @synopsis Returns the type name of the receiver.
     * @returns {String}
     */

    var name;

    if (TP.owns(this, 'name')) {
        return this.name;
    }

    if (TP.notValid(name = this[TP.NAME])) {
        return this.getID();
    }

    return name;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getSupertype',
function() {

    /**
     * @name getSupertype
     * @synopsis Returns the supertype of the receiver. Returns undefined if the
           receiver is a root type.
     * @returns {Object} The supertype of the receiver.
     */

    return this[TP.SUPER];
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getSupertypeName',
function() {

    /**
     * @name getSupertypeName
     * @synopsis Returns the supertype name of the receiver.
     * @returns {String} The supertype name of the receiver.
     * @todo
     */

    return this[TP.SUPER].getName();
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getSupertypeNames',
function() {

    /**
     * @name getSupertypeNames
     * @synopsis Returns an array containing the supertype names of the
     *     receiver. You should consider this array private and avoid
     *     manipulating it. The first element in this array is the name of the
     *     immediate supertype of the receiver.
     * @returns {Array}
     */

    var arr,
        type;

    arr = this[TP.ANCESTOR_NAMES];
    if (TP.isValid(arr)) {
        return arr;
    }

    arr = TP.ac();
    type = this;
    /* jshint boss:true */
    /* eslint-disable */
    while (type = type[TP.SUPER]) {
        arr.push(type.getName());
    }
    /* eslint-enable */
    /* jshint boss:false */

    this[TP.ANCESTOR_NAMES] = arr;
    return arr;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getType',
function() {

    /**
     * @name getType
     * @synopsis Returns the type object for the receiver. In this case we're
     *     talking about a TIBET type so we can leverage the meta-data. Normally
     *     if you ask an instance for its type the answer is clear. In TIBET
     *     since all Type objects are actually instances the response to this
     *     question is an internal constructor function you probably didn't want
     *     to see :).
     * @returns {Object}
     */

    return this[TP.TYPEC];
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getTypeName',
function() {

    /**
     * @name getTypeName
     * @synopsis Returns the type name of the receiver. This method is a synonym
     *     for getName() for types.
     * @returns {String}
     */

    return this.getNamespaceRoot() + '.meta.' +
            this.getNamespacePrefix() + '.' + this.getLocalName();
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getTypes',
function() {

    /**
     * @name getTypes
     * @synopsis Returns an array containing the type and supertype objects of
     *     the receiver. The first element in this array is the type of the
     *     receiver.
     * @returns {Array}
     */

    var types;

    //  Make sure to copy the supertype name array.
    types = this.getSupertypes().copy();

    //  Since the receiver is a type object and is the most specific type,
    //  it gets unshifted onto the front of the result.
    types.unshift(this);

    return types;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('$$isReferenceType',
function() {

    /**
     * @name $$isReferenceType
     * @synopsis Returns true if the receiver is a reference type meaning it
     *     doesn't support copy-on-write semantics. TP*Objects are all reference
     *     types.
     * @returns {Boolean}
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('isInitialized',
function(aFlag) {

    /**
     * @name isInitialized
     * @synopsis Returns true if the receiver has been initialized. Most types
     *     don't require initialization but those that do need to protect
     *     against having it done more than once :).
     * @param {Boolean} aFlag The new state of the initialized flag.
     * @returns {Boolean}
     */

    if (TP.isBoolean(aFlag)) {
        this.$set('$$initialized', aFlag);
    }

    return TP.ifInvalid(this.$get('$$initialized'), false);
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('ownsMethod',
function(aName) {

    /**
     * @name ownsMethod
     * @synopsis Returns true if the name represents a unique method on the
     *     receiver, one that is either introduced or overridden so that the
     *     method is "owned" by the receiver.
     * @param {String} aName The method name to check.
     * @returns {Boolean}
     */

    try {
        if (TP.sys.hasInitialized() && TP.isMethod(this[aName])) {
            return this[aName][TP.OWNER] === this;
        }
    } catch (e) {
        //  MOZ has a few that like to barf on this call.
    }

    return false;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineMethod('getConstructor',
function() {

    /**
     * @name getConstructor
     * @synopsis Returns the true constructor for an instance.
     * @returns {Object}
     */

    if (this === TP.lang.RootObject$$Inst) {
        return Function;
    }

    return TP.lang.RootObject$$Inst;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineMethod('getLocalName',
function() {

    /**
     * @name getLocalName
     * @synopsis Returns the local (aka short) name of the receiver without any
     *     namespace prefix.
     * @returns {String}
     */

    return this.getType().getLocalName();
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineMethod('getNamespacePrefix',
function() {

    /**
     * @name getNamespacePrefix
     * @synopsis Returns the namespace (in TIBET terms) of the receiver. For
     *     example, the namespace of the TP.sig.Signal type is 'sig'.
     * @returns {String} The receiver's namespace.
     */

    return this.getType().getNamespacePrefix();
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineMethod('getType',
function() {

    /**
     * @name getType
     * @synopsis Returns the type object for the receiver. In this case we're
     *     talking about a TIBET type so we can leverage the meta-data. Normally
     *     if you ask an instance for its type the answer is clear. In TIBET
     *     since all Type objects are actually instances the response to this
     *     question is an internal constructor function you probably didn't want
     *     to see :).
     * @returns {Object}
     */

    return this[TP.TYPE];
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineMethod('getTypeName',
function() {

    /**
     * @name getTypeName
     * @synopsis Returns the type name of the receiver. This method is a synonym
     *     for getType().getName() for instances.
     * @returns {String}
     */

    var type;

    //  hook the top-level prototype so we don't say it's a
    //  TP.lang.RootObject
    if (this === TP.lang.RootObject$$Inst.prototype) {
        return this.getID();
    }

    type = this.getType();
    if (TP.canInvoke(type, 'getName')) {
        return type.getName();
    }

    return type;
});

//  ------------------------------------------------------------------------
//  TIBET Methods
//  ------------------------------------------------------------------------

TP.sys.defineMethod('getTypeInitializers',
function() {

    /**
     * @name getTypeInitializers
     * @synopsis Returns an array of functions which will properly initialize
     *     the various types in the system.
     * @returns {Array.<Function>}
     */

    var own;

    //  Grab all of the objects that 'own' an implementation of
    //  initialize.

    //  NOTE the names-only flag here to keep things from loading
    own = TP.sys.getMethodOwners('initialize', true);

    if (TP.isValid(own)) {
        //  Loop over each one of those owners (each of which should be a
        //  type), and if it hasn't already been initialized, send it an
        //  initialize message and set its initialized flag to true.
        return own.collect(

            function (item, index) {

                return function () {

                    var obj;

                    obj = TP.sys.getTypeByName(item, false);

                    //  proxies for types aren't installed yet...
                    if (TP.notValid(obj) ||
                        !TP.canInvoke(obj, 'isInitialized')) {
                        //  don't want to force type into the codebase unless we
                        //  have to...certainly not just because it has an
                        //  initializer... so just return
                        return;
                    }

                    // Trap type initialization errors and report them.
                    try {
                        if (obj.isInitialized()) {
                            TP.boot.$stdout(
                            'Skipping initialized type: ' + item,
                            TP.DEBUG);

                            return;
                        }

                        //  for debugging it's helpful to see what's
                        //  being initialized in particular
                        TP.boot.$stdout('Initializing type: ' + item, TP.DEBUG);

                        obj.initialize();
                        obj.isInitialized(true);
                    } catch (e) {
                        TP.boot.$stderr(
                            'Initialization error for type: ' + item, e);
                    }
                };
        });
    }

    return TP.ac();
});

//  ------------------------------------------------------------------------

TP.sys.addMetadata(Object, TP.lang.RootObject, TP.SUBTYPE);

//  ------------------------------------------------------------------------
//  TP.lang.RootObject - REFLECTION (INTERNAL)
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getInstPrototype',
function() {

    /**
     * @name getInstPrototype
     * @synopsis Returns the object which instances of the receiver use as their
     *     prototype.
     * @returns {Object}
     */

    //  TODO: Scott: Fix this when defineSubtype() fix is in.
    if (TP.isValid(this[TP.INSTC])) {
        return this[TP.INSTC].prototype;
    }

    return Object.getPrototypeOf(this);
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineMethod('getPrototype',
function() {

    /**
     * @name getPrototype
     * @synopsis Returns the object the receiver uses as its prototype.
     * @returns {Object}
     */

    return this.getType().getInstPrototype();
});

//  ------------------------------------------------------------------------
//  TP.ObjectProto Methods
//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getPrototypes',
function() {

    /**
     * @name getPrototypes
     * @synopsis Returns an array containing the various objects which affect
     *     inheritance for the receiver via the prototype chain.
     * @returns {Array}
     */

    var lastProto,
        proto,
        protos;

    protos = TP.ac();

    //  top of the tree, no prototypes to add
    if (this === TP.ObjectProto) {
        return protos;
    }

    proto = this;
    lastProto = null;

    //  watch for circularities on the native types
    while ((proto !== TP.ObjectProto) &&
            (proto !== proto.constructor.prototype)) {
        lastProto = proto;
        proto = proto.getPrototype();
        protos.add(proto);
    }

    return protos;
});

//  ------------------------------------------------------------------------
//  METHOD ACQUISITION
//  ------------------------------------------------------------------------

TP.definePrimitive('method',
function(target, name, track) {

    /**
     * @name method
     * @synopsis Returns the named method on the target, if it exists.
     * @param {Object} target The object to try to locate the method on.
     * @param {String} name The method name to locate.
     * @param {String} track The track to locate the method on.
     * @returns {Function} The Function object representing the method.
     */

    var method;

    method = target[name];
    if (TP.isMethod(method)) {
        if (TP.notEmpty(track) && (method[TP.TRACK] === track)) {
            return method;
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('methods',
function(target, track) {

    /**
     * @name methods
     * @synopsis Returns the Array of methods on the target.
     * @param {Object} target The object to try to locate the methods on.
     * @param {String} track The track to locate the method on.
     * @returns {Array} An Array of Function objects representing the methods.
     */

    var names,
        methods;

    names = target.getInterface('methods');

    methods = names.collect(
        function(name) {

            var method;

            method = target[name];
            if (TP.isMethod(method)) {
                if (TP.notEmpty(track) && (method[TP.TRACK] === track)) {
                    return method;
                }
            }

            return;
        });

    return methods.compact();
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getMethod',
function(aName, aTrack) {

    /**
     * @name getMethod
     * @synopsis Returns the named method, if it exists.
     * @param {String} aName The method name to locate.
     * @param {String} aTrack The track to locate the method on. This is an
     *     optional parameter.
     * @returns {Function} The Function object representing the method.
     */

    var track;

    if (TP.isEmpty(track = aTrack)) {
        if (TP.isPrototype(this)) {
            track = TP.INST_TRACK;
        } else {
            track = TP.LOCAL_TRACK;
        }
    }

    return TP.method(this, aName, track);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getMethods',
function(aTrack) {

    /**
     * @name getMethods
     * @synopsis Returns an Array of methods for the receiver.
     * @param {String} aTrack The track to locate the methods on. This is an
     *     optional parameter.
     * @returns {Array} An Array of Function objects representing the methods.
     */

    var track;

    if (TP.isEmpty(track = aTrack)) {
        if (TP.isPrototype(this)) {
            track = TP.INST_TRACK;
        } else {
            track = TP.LOCAL_TRACK;
        }
    }

    return TP.methods(this, track);
});

//  ------------------------------------------------------------------------

TP.FunctionProto.defineMethod('getMethod',
function(aName, aTrack) {

    /**
     * @name getMethod
     * @synopsis Returns the named method, if it exists.
     * @param {String} aName The method name to locate.
     * @param {String} aTrack The track to locate the method on. This is an
     *     optional parameter.
     * @returns {Function} The Function object representing the method.
     */

    var owner,
        track;

    //  If it's the TP.FunctionProto *directly* then we consider an instance
    //  method of all Function objects.
    if (this === TP.FunctionProto) {
        owner = Function;
        track = TP.ifEmpty(aTrack, TP.INST_TRACK);
    } else if (TP.isType(this)) {
        //  If it is one of the 'Big 8' constructor Functions, then it's a
        //  'type local' method.
        owner = this;
        track = TP.ifEmpty(aTrack, TP.TYPE_LOCAL_TRACK);
    } else {
        //  Otherwise, it can be considered to be a 'local' method of the
        //  receiving Function object (which is usually a plain, anonymous
        //  Function).
        owner = this;
        track = TP.ifEmpty(aTrack, TP.LOCAL_TRACK);
    }

    return TP.method(owner, aName, track);
});

//  ------------------------------------------------------------------------

TP.FunctionProto.defineMethod('getMethods',
function(aTrack) {

    /**
     * @name getMethods
     * @synopsis Returns an Array of methods for the receiver.
     * @param {String} aTrack The track to locate the methods on. This is an
     *     optional parameter.
     * @returns {Array} An Array of Function objects representing the methods.
     */

    var owner,
        track;

    //  If it's the TP.FunctionProto *directly* then we consider an instance
    //  method of all Function objects.
    if (this === TP.FunctionProto) {
        owner = Function;
        track = TP.ifEmpty(aTrack, TP.INST_TRACK);
    } else if (TP.isType(this)) {
        //  If it is one of the 'Big 8' constructor Functions, then it's a
        //  'type local' method.
        owner = this;
        track = TP.ifEmpty(aTrack, TP.TYPE_LOCAL_TRACK);
    } else {
        //  Otherwise, it can be considered to be a 'local' method of the
        //  receiving Function object (which is usually a plain, anonymous
        //  Function).
        owner = this;
        track = TP.ifEmpty(aTrack, TP.LOCAL_TRACK);
    }

    return TP.methods(owner, track);
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getMethod',
function(aName, aTrack) {

    /**
     * @name getMethod
     * @synopsis Returns the named method, if it exists.
     * @param {String} aName The method name to locate.
     * @param {String} aTrack The track to locate the method on. This is an
     *     optional parameter.
     * @returns {Function} The Function object representing the method.
     */

    var owner,
        track;

    if (TP.isPrototype(this)) {
        owner = this[TP.OWNER];
        track = TP.ifEmpty(aTrack, TP.TYPE_TRACK);
    } else {
        owner = this;
        track = TP.ifEmpty(aTrack, TP.TYPE_LOCAL_TRACK);
    }

    return TP.method(owner, aName, track);
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getMethods',
function(aTrack) {

    /**
     * @name getMethods
     * @synopsis Returns an Array of methods for the receiver.
     * @param {String} aTrack The track to locate the methods on. This is an
     *     optional parameter.
     * @returns {Array} An Array of Function objects representing the methods.
     */

    var owner,
        track;

    if (TP.isPrototype(this)) {
        owner = this[TP.OWNER];
        track = TP.ifEmpty(aTrack, TP.TYPE_TRACK);
    } else {
        owner = this;
        track = TP.ifEmpty(aTrack, TP.TYPE_LOCAL_TRACK);
    }

    return TP.methods(owner, track);
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineMethod('getMethod',
function(aName, aTrack) {

    /**
     * @name getMethod
     * @synopsis Returns the named method, if it exists.
     * @param {String} aName The method name to locate.
     * @param {String} aTrack The track to locate the method on. This is an
     *     optional parameter.
     * @returns {Function} The Function object representing the method.
     */

    var owner,
        track;

    if (TP.isPrototype(this)) {
        owner = this[TP.OWNER];
        track = TP.ifEmpty(aTrack, TP.INST_TRACK);
    } else {
        owner = this;
        track = TP.ifEmpty(aTrack, TP.LOCAL_TRACK);
    }

    return TP.method(owner, aName, track);
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineMethod('getMethods',
function(aTrack) {

    /**
     * @name getMethods
     * @synopsis Returns an Array of methods for the receiver.
     * @param {String} aTrack The track to locate the methods on. This is an
     *     optional parameter.
     * @returns {Array} An Array of Function objects representing the methods.
     */

    var owner,
        track;

    if (TP.isPrototype(this)) {
        owner = this[TP.OWNER];
        track = TP.ifEmpty(aTrack, TP.INST_TRACK);
    } else {
        owner = this;
        track = TP.ifEmpty(aTrack, TP.LOCAL_TRACK);
    }

    return TP.methods(owner, track);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getMethodInfoFor',
function(methodName) {

    /**
     * @name getMethodInfoFor
     * @synopsis Returns information for the method with the supplied name on
     *     the receiver.
     * @description This method returns a TP.lang.Hash containing the method
     *     owner, name, track and display, under the keys 'owner', 'name',
     *     'track' and 'display', respectively
     * @param {String} aName The method name to return method information for.
     * @returns {TP.lang.Hash} The hash containing the method information as
     *     described in the method comment.
     */

    var owner,
        track,

        existingMethod,

        name,
        display;

    owner = this;
    track = TP.LOCAL_TRACK;

    if (!TP.isMethod(existingMethod = owner.getMethod(methodName, track))) {
        return null;
    }

    name = existingMethod[TP.NAME];
    display = existingMethod[TP.DISPLAY];

    return TP.hc('owner', owner,
                    'name', name,
                    'track', track,
                    'display', display);
});

//  ------------------------------------------------------------------------

TP.FunctionProto.defineMethod('getMethodInfoFor',
function(methodName) {

    /**
     * @name getMethodInfoFor
     * @synopsis Returns information for the method with the supplied name on
     *     the receiver.
     * @description This method returns a TP.lang.Hash containing the method
     *     owner, name, track and display, under the keys 'owner', 'name',
     *     'track' and 'display', respectively
     * @param {String} aName The method name to return method information for.
     * @returns {TP.lang.Hash} The hash containing the method information as
     *     described in the method comment.
     */

    var owner,
        track,

        existingMethod,
        name,
        display;

    //  If it's the TP.FunctionProto *directly* then we consider an instance
    //  method of all Function objects.
    if (this === TP.FunctionProto) {
        owner = Function;
        track = TP.INST_TRACK;
    } else if (TP.isType(this)) {
        //  If it is one of the 'Big 8' constructor Functions, then it's a
        //  'type local' method.
        owner = this;
        track = TP.TYPE_LOCAL_TRACK;
    } else {
        //  Otherwise, it can be considered to be a 'local' method of the
        //  receiving Function object (which is usually a plain, anonymous
        //  Function).
        owner = this;
        track = TP.LOCAL_TRACK;
    }

    if (!TP.isMethod(existingMethod = owner.getMethod(methodName, track))) {
        return null;
    }

    name = existingMethod[TP.NAME];

    display = existingMethod[TP.DISPLAY];

    return TP.hc('owner', owner,
                    'name', name,
                    'track', track,
                    'display', display);
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('getMethodInfoFor',
function(methodName) {

    /**
     * @name getMethodInfoFor
     * @synopsis Returns information for the method with the supplied name on
     *     the receiver.
     * @description This method returns a TP.lang.Hash containing the method
     *     owner, name, track and display, under the keys 'owner', 'name',
     *     'track' and 'display', respectively
     * @param {String} aName The method name to return method information for.
     * @returns {TP.lang.Hash} The hash containing the method information as
     *     described in the method comment.
     */

    var owner,
        track,

        existingMethod,
        name,
        display;

    //  Note that we need to install the spy method on to 'owner', which might
    //  not necessarily be 'this'...
    if (TP.isPrototype(this)) {
        owner = this[TP.OWNER];
        track = TP.TYPE_TRACK;
    } else {
        owner = this;
        track = TP.TYPE_LOCAL_TRACK;
    }

    if (!TP.isMethod(existingMethod = owner.getMethod(methodName, track))) {
        return null;
    }

    name = existingMethod[TP.NAME];

    display = existingMethod[TP.DISPLAY];

    return TP.hc('owner', owner,
                    'name', name,
                    'track', track,
                    'display', display);
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineMethod('getMethodInfoFor',
function(methodName) {

    /**
     * @name getMethodInfoFor
     * @synopsis Returns information for the method with the supplied name on
     *     the receiver.
     * @description This method returns a TP.lang.Hash containing the method
     *     owner, name, track and display, under the keys 'owner', 'name',
     *     'track' and 'display', respectively
     * @param {String} aName The method name to return method information for.
     * @returns {TP.lang.Hash} The hash containing the method information as
     *     described in the method comment.
     */

    var owner,
        track,

        existingMethod,
        name,
        display;

    //  Note that we need to install the spy method on to 'owner', which might
    //  not necessarily be 'this'...
    if (TP.isPrototype(this)) {
        owner = this[TP.OWNER];
        track = TP.INST_TRACK;
    } else {
        owner = this;
        track = TP.LOCAL_TRACK;
    }

    if (!TP.isMethod(existingMethod = owner.getMethod(methodName, track))) {
        return null;
    }

    name = existingMethod[TP.NAME];

    display = existingMethod[TP.DISPLAY];

    return TP.hc('owner', owner,
                    'name', name,
                    'track', track,
                    'display', display);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isGlobalMethod',
function(anObj) {

    /**
     * @name isGlobalMethod
     * @synopsis Returns true if the object provided is a global method.
     * @param {Object} anObj The Object to test.
     * @returns {Boolean}
     */

    return (TP.isValid(anObj[TP.OWNER]) && anObj[TP.TRACK] === TP.GLOBAL_TRACK);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isInstMethod',
function(anObj) {

    /**
     * @name isInstMethod
     * @synopsis Returns true if the object provided is an instance method
     *     relative to a particular type.
     * @param {Object} anObj The Object to test.
     * @returns {Boolean}
     */

    return (TP.isValid(anObj[TP.OWNER]) && anObj[TP.TRACK] === TP.INST_TRACK);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isLocalMethod',
function(anObj) {

    /**
     * @name isLocalMethod
     * @synopsis Returns true if the object provided is a local method relative
     *     to a particular object.
     * @param {Object} anObj The Object to test.
     * @returns {Boolean}
     */

    var owner,
        track;

    owner = anObj[TP.OWNER];
    track = anObj[TP.TRACK];

    return (TP.isValid(owner) &&
             (track === TP.TYPE_LOCAL_TRACK) || track === TP.LOCAL_TRACK);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isTypeMethod',
function(anObj) {

    /**
     * @name isTypeMethod
     * @synopsis Returns true if the object provided is a type method relative
     *     to a particular type.
     * @param {Object} anObj The Object to test.
     * @returns {Boolean}
     */

    return (TP.isValid(anObj[TP.OWNER]) && anObj[TP.TRACK] === TP.TYPE_TRACK);
});

//  ------------------------------------------------------------------------
//  TP.lang.Object
//  ------------------------------------------------------------------------

/*
All standard objects should inherit from TP.lang.Object rather than
TP.lang.RootObject.
*/

//  ------------------------------------------------------------------------

TP.lang.RootObject.defineSubtype('Object');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.lang.Object.Type.defineMethod('fromObject',
function(anObj) {

    /**
     * @name fromObject
     * @synopsis Constructs a new instance from the incoming object. The default
     *     implementation forwards to construct.
     * @param {Object} anObj The source object.
     * @returns {Object} A new instance of the receiver.
     */

    var newObj,

        keys,

        len,
        i,

        name;

    newObj = this.construct.apply(this, arguments);

    //  If the object we're converting from is a POJO, then copy over all of its
    //  values as attributes on the new object.
    if (TP.isMemberOf(anObj, Object)) {
        keys = TP.keys(anObj);

        len = keys.getSize();
        for (i = 0; i < len; i++) {
            name = keys.at(i);
            newObj.defineAttribute(name);
            newObj.set(name, anObj[name]);
        }
    }

    return newObj;
});

//  ------------------------------------------------------------------------

TP.lang.Object.Type.defineMethod('getConstructor',
function() {

    /**
     * @name getConstructor
     * @synopsis Returns the receivers constructor.
     * @returns {Object}
     */

    return this.getSupertype()[TP.TYPEC];
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lang.Object.Inst.defineMethod('asSource',
function() {

    /**
     * @name asSource
     * @synopsis Returns the receiver as a TIBET source code string.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    var str;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asSource) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asSource = true;

    str = TP.tname(this) + '.construct()' +
            this.$generateSourceSets(this.getUniqueValueKeys());

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asSource;

    return str;
});

//  ------------------------------------------------------------------------

TP.lang.Object.Inst.defineMethod('$generateSourceSets',
function(keyArray, forceInvalid) {

    /**
     * @name $generateSourceSets
     * @synopsis Generates a '.set()' for each key in the key Array, along with
     *     the receiver's value for that key, obtained by executing a 'get()'
     *     on the receiver.
     * @param {Array} keyArray An optional parameter listing the keys that the
     *     '.set()' calls should be generated for. If this parameter is not
     *     supplied, it defaults to all the receiver's keys.
     * @param {Boolean} forceInvalid Whether or not to generate a '.set()' call
     *     for a particular key even if the value obtained by calling 'get()' on
     *     the receiver is invalid. The default is false.
     * @returns {String} A String of generated '.set()'s.
     */

    var shouldUseInvalid,

        keys,
        len,
        i,
        val,

        joinArr;

    shouldUseInvalid = TP.ifInvalid(forceInvalid, false);

    //  Keys are either supplied or we call 'TP.keys()'
    keys = TP.ifInvalid(keyArray, TP.keys(this));
    len = keys.getSize();

    joinArr = TP.ac();

    for (i = 0; i < len; i++) {
        val = this.get(keys.at(i));

        if (!TP.isValid(val) && !shouldUseInvalid) {
            continue;
        }

        joinArr.push(
                TP.join('.set(\'', keys.at(i), '\', ', TP.src(val), ')'));
    }

    return joinArr.join('');
});

//  ------------------------------------------------------------------------

TP.lang.Object.Inst.defineMethod('getConstructor',
function() {

    /**
     * @name getConstructor
     * @synopsis Returns the true constructor for an instance.
     * @returns {Object}
     */

    return this.getType()[TP.INSTC];
});

//  ------------------------------------------------------------------------

TP.lang.Object.Inst.defineMethod('getKeys',
function() {

    /**
     * @name getKeys
     * @abstract Returns an Array of all of the receiver's keys. In this case,
     *     the receivers keys will be all of its attributes, hidden or shown,
     *     instance-level or local-level.
     * @returns {Array} An Array of all attributes of the receiver, hidden or
     *     shown, instance-level or local-level.
     */

    var keys;

    //  The 'inst interface' call will retrieve all of the 'instance
    //  attributes', hidden or not, and the 'local interface' call will retrieve
    //  all of the 'local attributes', hidden or not.
    keys = this.getInstInterface('known_attributes').concat(
                this.getLocalInterface('known_local_attributes'));

    //  Make sure that we unique this list. Otherwise, attributes that have
    //  local values will show up twice.
    keys.unique();

    return keys;
});

//  ------------------------------------------------------------------------

TP.lang.Object.Inst.defineMethod('getUniqueValueKeys',
function() {

    /**
     * @name getUniqueValueKeys
     * @abstract Returns an Array of all of the receiver's keys that reference a
     *     *uniquely-valued* slot on the receiver. That is, any attributes,
     *     hidden or shown, instance-level or local-level, that have a value
     *     different from the receiver's prototype object.
     * @returns {Array} An Array of all *uniquely-valued* attributes of the
     *     receiver, hidden or shown, instance-level or local-level.
     * @todo
     */

    var keys;

    //  Here we ask the object *at a local level* for any attributes that are
    //  'overridden' (that is, have a unique value distinct from their
    //  prototype) whether they are hidden or not.
    keys = this.getLocalInterface('known_overridden_attributes').concat(
                this.getLocalInterface('known_local_attributes'));

    return keys;
});

//  ------------------------------------------------------------------------
//  Function Replacement
//  ------------------------------------------------------------------------

TP.FunctionProto.defineMethod('replaceWith',
function(aFunction) {

    /**
     * @name replaceWith
     * @synopsis Replaces the receiver with an alternate function.
     * @description This method provides an easy way to reinstall a function
     *     in the proper context, particularly when you don't know the original
     *     context. In other words, you can ask a function to
     *     'replaceWith(aReplacement)' and the proper 'defineMethod' call will
     *     be constructed for you and executed.
     * @param {Function} aFunction The replacement Function.
     * @returns {Function} The new Function.
     */

    var owner,
        track;

    if (TP.notValid(aFunction)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    if (TP.isType(this)) {
        return this.raise('TP.sig.InvalidOperation',
                                                'Cannot replace types');
    }

    owner = this[TP.OWNER];
    track = this[TP.TRACK];

    if (TP.isValid(owner) && TP.isValid(track)) {

        try {
            owner.defineMethod(this.getName(), aFunction);
        } catch (e) {
            return this.raise(
                'TP.sig.InvalidFunction',
                TP.ec(e, TP.id(owner) + '.defineMethod(func); failed.'));
        }
    }

    return this;
});

//  ------------------------------------------------------------------------
//  WINDOW OBJECT
//  ------------------------------------------------------------------------

Window.Inst.defineMethod('getType',
function() {

    /**
     * @name getType
     * @synopsis Returns the type object for the receiver.
     * @returns {Object}
     */

    return Window;
});

//  ------------------------------------------------------------------------

Window.Inst.defineMethod('getTypeName',
function() {

    /**
     * @name getTypeName
     * @synopsis Returns the type name of the receiver. This method is a synonym
     *     for getType().getName() for instances.
     * @returns {String}
     */

    return 'DOMWindow';
});

//  -----------------------------------------------------------------------
//  API OBJECT SUPPORT
//  -----------------------------------------------------------------------

TP.defineNamespace('api', 'TP');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
