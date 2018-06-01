//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

//  ------------------------------------------------------------------------
//  TP.lang.Proxy
//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('Proxy');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lang.Proxy.Inst.defineMethod('$$fault',
function() {

    /**
     * @method $$fault
     * @summary Faults in the real type for the receiver. This method has to
     *     take care not to create recursions while ensuring that once the fault
     *     operation has completed the new type is in place and registered as a
     *     global and a custom type.
     * @returns {TP.lang.RootObject} The newly loaded type object.
     */

    var name,
        type;

    //  Need to make sure to 'toString()' this to work around issues
    //  introduced in Firefox 2.0.0.2+
    name = '' + this;

    TP.ifTrace() && TP.$DEBUG && TP.$VERBOSE ?
        TP.trace('Faulting in \'' + name + '\'.') : 0;

    //  require the type, telling TIBET that we're doing this for a proxy
    type = TP.sys.require(name);

    if (!TP.isType(type)) {
        TP.ifError() ?
            TP.error('Faulting in \'' + name +
                            '\' failed. Removing proxy.') : 0;

        TP.sys.defineGlobal(name, null, true);
    }

    return type;
});

//  ------------------------------------------------------------------------

TP.lang.Proxy.Inst.defineMethod('$$isMemberOf',
function(aType) {

    /**
     * @method $$isMemberOf
     * @summary Returns true if the receiver is a direct member (instance) of
     *     the named type. This internal method is implemented on specific
     *     objects to allow them to respond more quickly to an isMemberOf query.
     *     It can also be used to "spoof" type membership (as is the case with
     *     type proxies).
     * @param {TP.lang.RootObject|String} aType A Type object, or type name.
     * @returns {Boolean} Whether or not the receiver is a direct member of the
     *     named type.
     */

    /* eslint-disable no-extra-parens */
    return (aType === 'TP.lang.Proxy' ||
            aType === TP.lang.Proxy ||
            aType === 'String' ||
            aType === String);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.lang.Proxy.Inst.defineMethod('defineSubtype',
function(name) {

    /**
     * @method defineSubtype
     * @summary Adds a new subtype to the type represented by the receiving
     *     string.
     * @param {String} name The name of the new subtype to add.
     * @returns {TP.lang.RootObject} A new type object.
     */

    var type;

    type = this.$$fault();

    if (TP.isType(type)) {
        return type.defineSubtype(name);
    }

    return this.getType().construct(name);
});

//  ------------------------------------------------------------------------

TP.lang.Proxy.Inst.defineMethod('asSource',
function() {

    /**
     * @method asSource
     * @summary Returns the receiver in proper source code form.
     * @returns {String}
     */

    return this.quoted('"') + '.asType();';
});

//  ------------------------------------------------------------------------

TP.lang.Proxy.Inst.defineMethod('canConstruct',
function() {

    /**
     * @method canConstruct
     * @summary Returns true if the receiver can construct a valid instance
     *     given the parameters provided.
     * @returns {Boolean} Whether or not an instance of this can be constructed
     *     from the parameters provided.
     */

    var type;

    type = this.$$fault();

    if (TP.isType(type)) {
        return type.canConstruct.apply(type, arguments);
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.lang.Proxy.Inst.defineMethod('canResolveDNU',
function(anOrigin, aMethodName, anArgArray, callingContext) {

    /**
     * @method canResolveDNU
     * @summary Provides an instance that has triggered the DNU machinery with
     *     an opportunity to handle the problem itself. This is a useful option
     *     for objects that are acting as proxies or adaptors.
     * @param {Object} anOrigin The object asking for help.
     * @param {String} aMethodName The method name that failed.
     * @param {Object[]} anArgArray Optional arguments to function.
     * @param {Function|arguments} callingContext The calling context.
     * @returns {Boolean} TRUE means resolveDNU() will be called. FALSE means
     *     the standard DNU machinery will continue processing. The default is
     *     FALSE.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.lang.Proxy.Inst.defineMethod('construct',
function() {

    /**
     * @method construct
     * @summary Constructs a new instance. Note however that this is defined as
     *     an _instance_ method, meaning the object being messaged is actually
     *     an instance of TP.lang.Proxy that is ready to fault in the type it is
     *     proxying for and then to construct the instance via that type.
     * @returns {TP.lang.Object} Returns a new instance of the type the receiver
     *     is proxying for.
     */

    var type;

    try {
        type = this.$$fault();
    } catch (e) {
        TP.ifError() ?
            TP.error(
                TP.ec(e, TP.join('Error constructing type proxy'))) : 0;
    }

    if (TP.isType(type)) {
        return type.construct.apply(type, arguments);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.lang.Proxy.Inst.defineMethod('from',
function() {

    /**
     * @method from
     * @summary Returns a new instance of the receiver's true type, initialized
     *     from the parameter data.
     * @returns {TP.lang.Object} A new instance.
     */

    var type;

    try {
        type = this.$$fault();
    } catch (e) {
        TP.ifError() ?
            TP.error(
                TP.ec(e, TP.join('Error converting type proxy'))) : 0;
    }

    if (TP.isType(type)) {
        return type.from.apply(type, arguments);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.lang.Proxy.Inst.defineMethod('init',
function(aTypename) {

    /**
     * @method init
     * @summary Returns a new instance of the receiver, ready to replace itself
     *     as the type in question when invoked via construct(). Note that if
     *     the type already exists this method will return that type. If the
     *     type doesn't exist this method will register the receiver under that
     *     name.
     * @param {String} aTypename The typename this instance is proxying for.
     * @returns {TP.lang.Proxy} A new instance of type proxy.
     */

    var type,
        proto;

    this.callNextMethod();

    //  note the special call here where we tell getTypeByName() not to
    //  return a value if the value is a proxy
    if (TP.isType(type = TP.sys.getTypeByName(aTypename, false))) {
        return type;
    }

    //  this will construct the true instance for us as normal
    // type = this.callNextMethod();
    /* eslint-disable no-new-wrappers */
    type = new String(aTypename);
    /* eslint-enable no-new-wrappers */

    proto = TP.lang.Proxy.getInstPrototype();

    type.$$fault = proto.$$fault;
    type.$$isMemberOf = proto.$$isMemberOf;
    type.defineSubtype = proto.defineSubtype;
    type.canConstruct = proto.canConstruct;
    type.canResolveDNU = proto.canResolveDNU;
    type.construct = proto.construct;
    type.from = proto.from;
    type.isInitialized = proto.isInitialized;
    type.resolveDNU = proto.resolveDNU;
    type.asSource = proto.asSource;

    //  puts the instance where getTypeByName() will find it for other
    //  callers so that it will cause a type fault to occur on request
    TP.sys.addCustomType(aTypename, type);

    //  define the type proxy as a global so invocations of construct, from,
    //  etc will cause a type fault to occur
    TP.sys.defineGlobal(aTypename, type, true);

    return type;
});

//  ------------------------------------------------------------------------

TP.lang.Proxy.Inst.defineMethod('isInitialized',
function() {

    /**
     * @method isInitialized
     * @summary Returns true if the receiver has been initialized properly.
     * @returns {Boolean} Returns true for a proxy.
     */

    //  returning true here means the kernel will skip trying to
    //  initialize() the proxy itself
    return true;
});

//  ------------------------------------------------------------------------

TP.lang.Proxy.Inst.defineMethod('resolveDNU',
function(anOrigin, aMethodName, anArgArray, callingContext) {

    /**
     * @method resolveDNU
     * @summary Invoked by the main DNU machinery when the instance has
     *     responded TRUE to canResolveDNU() for the parameters given.
     * @param {Object} anOrigin The object asking for help.
     * @param {String} aMethodName The method name that failed.
     * @param {Object[]} anArgArray Optional arguments to function.
     * @param {Function|arguments} callingContext The calling context.
     * @returns {Object} The result of function execution.
     */

    var type;

    type = this.$$fault();

    if (TP.isType(type)) {
        return type.resolveDNU(anOrigin, aMethodName, anArgArray,
            callingContext);
    }

    return;
});

//  ------------------------------------------------------------------------
//  Proxy Initialization
//  ------------------------------------------------------------------------

TP.sys.defineMethod('initializeTypeProxies',
function() {

    /**
     * @method initializeTypeProxies
     * @summary Initializes a new instance of TP.lang.Proxy for each unloaded
     *     type found in the XML metadata for the app. These proxy instances
     *     will fault in their associated types on demand when construct() is
     *     invoked on them.
     */

    var proto,
        type_ids,

        len,
        i,

        id,
        type;

    if (!TP.sys.cfg('oo.$$use_proxies')) {
        return;
    }

    proto = TP.lang.Proxy.getInstPrototype();
    type_ids = TP.sys.getCustomTypeNames();

    len = type_ids.getSize();
    for (i = 0; i < len; i++) {
        try {
            id = type_ids.at(i);
            if (TP.notValid(type = TP.sys.getTypeByName(id, false))) {
                //  important to get a true String object, not a primitive
                //  string, so we can instrument it

                /* eslint-disable no-new-wrappers */
                type = new String(id);
                /* eslint-enable no-new-wrappers */

                type.$$fault = proto.$$fault;
                type.$$isMemberOf = proto.$$isMemberOf;
                type.defineSubtype = proto.defineSubtype;
                type.canConstruct = proto.canConstruct;
                type.canResolveDNU = proto.canResolveDNU;
                type.construct = proto.construct;
                type.from = proto.from;
                type.isInitialized = proto.isInitialized;
                type.resolveDNU = proto.resolveDNU;

                TP.sys.addCustomType(id, type);

                TP.sys.defineGlobal(id, type, true);
                TP.sys.defineGlobal(id.asJSIdentifier(), type, true);
            }
        } catch (e) {
            TP.ifError() ?
                TP.error(TP.ec(e,
                    TP.join('Error initializing ', id, ' type proxy'))) : 0;
        }
    }

    TP.ifTrace() ?
        TP.trace('Initialized ' + len + ' type proxies.') : 0;

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
