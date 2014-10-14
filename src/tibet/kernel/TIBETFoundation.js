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
Before inheritance, inferencing, and signaling can be fully implemented there
are a number of elements which are needed to provide a solid foundation. Those
include additional reflection, iteration, type checking, encapsulation, logging,
and more. This file provides the foundational elements leading up to the
construction of the TIBET metaobject/inheritance system and the rest of the
TIBET platform.
*/

/* JSHint checking */

/* global $STATUS:true
*/

/* jshint evil:true
*/

//  ------------------------------------------------------------------------
//  GLOBAL DISCOVERY
//  ------------------------------------------------------------------------

TP.sys.defineMethod('$getContextGlobals',
function(params, windowContext) {

    /**
     * @name $getContextGlobals
     * @synopsis Returns an Array of global property names.
     * @description Computing this list is done by iterating over the context
     *     object provided and filtering the resulting keys against known window
     *     slots and "exclusions" that don't represent global functionality. In
     *     other words, a property on a window that's truly a property of a
     *     Window isn't returned by this search, but a function on Window
     *     intended as a Global function would be.
     * @param {TP.lang.Hash} params A hash of various parameters that will
     *     affect the return value in the following way: 'internal' Return
     *     global slots that are internal - that is, they start with '$$'
     *     'hidden' Return global slots that are internal - that is, they start
     *     with '$$' or '$'. 'public' Return global slots that are not internal
     *     - that is, they do not start with '$$' or '$'. 'types' Return global
     *     slots that are TIBET types. 'functions' Return global slots that are
     *     functions. 'variables' Return global slots that are not functions.
     * @param {Window} windowContext The window/frame whose globals should be
     *     returned. Default is the current window.
     * @returns {Array} The list of Strings representing keys on the JavaScript
     *     global object.
     * @todo
     */

    var arr,
        context,
        internalSlot,
        hiddenSlot,
        publicSlot,
        types,
        functions,
        variables,
        key;

    arr = TP.ac();
    context = windowContext || TP.global;

    if (TP.isValid(params)) {
        //  The default is to return public functions and attributes
        internalSlot = params.atIfInvalid('internal', false);
        hiddenSlot = params.atIfInvalid('hidden', false);
        publicSlot = params.atIfInvalid('public', true);
        types = params.atIfInvalid('types', false);
        functions = params.atIfInvalid('functions', true);
        variables = params.atIfInvalid('variables', true);
    } else {
        //  The default is to return public functions and attributes
        internalSlot = false;
        hiddenSlot = false;
        publicSlot = true;
        types = false;
        functions = true;
        variables = true;
    }

    /* jshint forin:true */
    for (key in context) {
        try {
            //  true globals (window slots, etc. aren't included)
            if (TP.sys.$globalexcludes.contains(key) ||
                TP.sys.$windowglobals.contains(key)) {
                continue;
            }

            //  we never return DNUs
            if (TP.$$isDNU(context[key])) {
                continue;
            }

            //  we never return 'windows' (i.e. frames on the window)
            if (TP.isWindow(context[key])) {
                continue;
            }

            //  If internalSlot is false and the key starts with '$$', skip it.
            if (!internalSlot && TP.regex.INTERNAL_SLOT.test(key)) {
                continue;
            }

            //  If hiddenSlot is false and the key starts with a '$' followed by
            //  any character except a '$', skip it.
            if (!hiddenSlot && TP.regex.PRIVATE_SLOT.test(key)) {
                continue;
            }

            //  If publicSlot is false and the key starts with a '$' (whether it
            //  is then followed by another '$' is irrelevant), skip it.
            if (!publicSlot && /^\$/.test(key)) {
                continue;
            }

            //  If types is false and the slot with the key is either a type or
            //  type proxy, skip it.
            if (!types &&
                (TP.isType(context[key]) || TP.$$isTypeProxy(context[key]))) {
                continue;
            }

            //  If functions is false and the slot with the key is a Function,
            //  skip it.
            if (!functions && TP.isFunction(context[key])) {
                continue;
            }

            //  If variables is false and the slot with the key is not a
            //  function, not a type and not a type proxy, then its a variable,
            //  so skip it.
            if (!variables &&
                    (!TP.isFunction(context[key]) &&
                    !TP.isType(context[key]) &&
                    !TP.$$isTypeProxy(context[key]))) {
                continue;
            }

            //  Passed all of our tests, so add it.
            arr.push(key);
        } catch (e) {
        }
    }
    /* jshint forin:false */

    return arr;
});

//  ------------------------------------------------------------------------
//  TIBET - TYPE DICTIONARIES
//  ------------------------------------------------------------------------

//  the missing type hash. we hold the types missing from TIBET's type
//  system here
TP.sys.$missingTypes = TP.ifInvalid(TP.sys.$missingTypes, TP.hc());

//  Right now its a primitive hash
TP.sys.$missingTypes.$isHash = TP.ifInvalid(TP.sys.$missingTypes.$isHash,
                                            false);

//  ------------------------------------------------------------------------

TP.sys.defineMethod('addCustomType',
function(typeName, customType) {

    /**
     * @name addCustomType
     * @synopsis Adds the named custom type to the global type hash.
     * @param {String} typeName The key under which to store the type.
     * @param {Object} customType The type to store.
     * @returns {Object} The receiver.
     * @todo
     */

    //  Note that we use a primitive hash here since that way all of the
    //  metadata is stored using the same kind of data structure (and also to
    //  avoid booting problems when TP.lang.Hash is only 'half loaded')

    TP.sys.getMetadata('types').atPut(
            typeName,
            {'typeObj': customType,
                    'sname': customType.getSupertypeName(),
                    'lpath': TP.objectGetLoadPath(customType),
                    'spath': TP.objectGetSourcePath(customType)
            });
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getCustomTypes',
function() {

    /**
     * @name getCustomTypes
     * @synopsis Returns an object containing the names and type objects for all
     *     custom types in the system.
     *
     *     NOTE: this object is considered private. You should not manipulate
     *     this object directly.
     * @returns {Object} An object containing the name and type objects for all
     *     custom types.
     */

    var types,
        typeKeys,

        result,
        len,
        i;

    types = TP.sys.getMetadata('types');
    typeKeys = types.getKeys();

    result = TP.hc();

    len = typeKeys.getSize();
    for (i = 0; i < len; i++) {
        //  NB: We use primitive property access here since 'typeObj' is
        //  property of a property descriptor
        result.atPut(typeKeys.at(i), types.at(typeKeys.at(i)).typeObj);
    }

    return result;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getMissingTypes',
function() {

    /**
     * @name getMissingTypes
     * @synopsis Returns a hash whose keys represent type names that TIBET was
     *     asked for (typically via require) which do not exist. Common cases
     *     are node wrappers for unknown XML tags and signal names for
     *     fabricated signals.
     * @returns {Object} An object containing the name and type objects for all
     *     custom types.
     */

    //  convert to a full hash as soon as possible
    if (TP.isFalse(this.$missingTypes.$isHash) &&
        TP.isType(TP.sys.getTypeByName('TP.lang.Hash'))) {
        this.$missingTypes = this.$missingTypes.asTP_lang_Hash();
        this.$missingTypes.$isHash = true;
    }

    return this.$missingTypes;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getTypeByName',
function(aName, shouldFault) {

    /**
     * @name getTypeByName
     * @synopsis Returns a handle to the type with the name provided. If the
     *     type isn't found this method returns undefined. This method is used
     *     extensively to assist with dynamic loading of types.
     * @param {String} aName The name of the type to locate.
     * @param {Boolean} shouldFault False to turn off testing and conversion of
     *     TP.lang.Proxy instances. This is considered a private parameter used
     *     by the kernel only.
     * @returns {TP.lang.RootObject} The type object registered under the name
     *     given.
     * @todo
     */

    var fault,

        type,
        tName,
        entry,

        typeMetadata;

    //  make sure it's a real type name...we often get called with instance
    //  IDs because of signaling etc.
    if (!TP.isTypeName(aName)) {
        return;
    }

    //  default faulting behavior to true so most callers will get the type
    //  even if the current value is actually a type proxy
    fault = TP.ifInvalid(shouldFault, true);

    if (!TP.isType(aName)) {
        tName = aName;

        //  Namespaces end with a colon (:) as in ev: or xmpp:.
        if (tName.charAt(tName.length - 1) === ':') {
            tName += 'XMLNS';
        }

        //  If there are ':' (colon) chars we need to replace with '.' (period).
        if (TP.regex.HAS_COLON.test(tName)) {
            tName = tName.replace(/:/g, '.');
        }

        typeMetadata = TP.sys.getMetadata('types');

        //  NB: We use primitive property access here since 'typeObj' is
        //  property of a property descriptor

        if (TP.regex.META_TYPENAME.test(tName)) {
            tName = tName.replace(/\.meta\./, '.');
            if (TP.isValid(entry = typeMetadata.at(tName))) {
                type = entry.typeObj;
            }

            if (TP.isType(type)) {
                return type.getType();
            } else {
              return;
            }
        }

        if (!TP.regex.TP_TYPENAME.test(tName) &&
            !TP.regex.APP_TYPENAME.test(tName)) {
            //  Type name has no prefix. We'll have to check both.
            if (TP.isValid(entry = typeMetadata.at('TP.' + tName))) {
                type = entry.typeObj;
            }

            if (!type) {
                if (TP.isValid(entry = typeMetadata.at('APP.' + tName))) {
                    type = entry.typeObj;
                }
            }
        } else {
            if (TP.isValid(entry = typeMetadata.at(tName))) {
                type = entry.typeObj;
            }
        }

        if (TP.notValid(type)) {
            type = TP.sys.getNativeTypes().at(tName);
            if (TP.isValid(type)) {
                return type;
            }
        }
    } else {
        type = aName;
    }

    //  if fault flag is off and this is a proxy then return as if we've
    //  never seen it. this is typically only called by the proxy type
    //  itself during proxy construction to avoid recursive behavior
    if (TP.$$isTypeProxy(type) && (type !== TP.lang.Proxy)) {
        if (!fault) {
            return;
        }

        type = type.$$fault();
    }

    return type;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getTypes',
function() {

    /**
     * @name getTypes
     * @synopsis Returns a hash containing the names and type objects which have
     *     actual implementations in the current environment. This is a
     *     combination of custom types and those native types which have true
     *     type object implementations.
     * @returns {TP.lang.Hash} A hash of types, keyed by name, that have actual
     *     implementations.
     */

    var dict;

    dict = TP.hc();
    dict.addAll(this.getNativeTypes());

    dict.perform(
        function(item) {

            if (TP.notValid(item.last())) {
                dict.removeKey(item.first());
            }
        });

    dict.addAll(TP.sys.getCustomTypes());

    return dict;
});

//  ------------------------------------------------------------------------
//  FUNCTION BINDING
//  ------------------------------------------------------------------------

/**
 * TIBET's use of functions as parameters is extensive and we want to ensure
 * that methods, i.e. functions with a 'this' reference in their body, remain
 * bound to the proper instance regardless of where or how they may be invoked.
 * JavaScript binds function 'this' references to a context dynamically when the
 * function is invoked 'through' an object pointer as in:
 *
 *      myObj.func();
 *
 * Unfortunately, if functions are passed as parameters without their original
 * context then any internal 'this' references will be resolved incorrectly if
 * the function is then simply executed as in:
 *
 *      function aFunction() { return this.getName(); };
 *
 *      function runner(aFunction) { return aFunction(); };
 *
 * In the example here, aFunction's 'this' reference will be undefined (or the
 * global object) in runner(). Binding the function in a more permanent fashion
 * is required in these cases.

 * Note that ECMAScript E5 now provides a built-in 'bind()' function, but we
 * 'hook' it (if available) and overlay it with our own version that supplies
 * more meta-data to the runtime engine (i.e. a backreference to the bound
 * Function, etc.)
 */

//  ------------------------------------------------------------------------
//  BINDING
//  ------------------------------------------------------------------------

//  If the built-in ECMAScript E5 'bind' method isn't supplied, then define
//  a '$$bind()' call that emulates it. Otherwise, alias the ECMA E5 'bind'
//  into '$$bind' so that, either way, we can redefine 'bind' below.

if (!TP.isFunction(TP.FunctionProto.bind)) {
    TP.FunctionProto.$$bind = function(aThis) {

        var thisFunc,
            boundArgs,

            retFunc;

        //  we'll need a reference to the receiving function that can be
        //  scoped properly by the closure we build, so capture it in a
        //  local variable
        thisFunc = this;

        //  grab any 'initially bound' arguments by using the arguments
        //  object and slicing off 'aThis'.
        boundArgs = TP.args(arguments, 1);

        //  if boundArgs isn't empty, then build a return Function that
        //  grabs its own arguments when invoked, unshifts the bound
        //  arguments onto the front of it and applies the bound Function
        //  with that set of arguments.
        if (boundArgs.length > 0) {
            retFunc = function () {

                var newArgs;

                newArgs = TP.args(arguments);
                newArgs.unshift(boundArgs);

                return thisFunc.apply(aThis, newArgs);
            };
        } else {
            //  otherwise, build a return Function that applies the bound
            //  Function with its own arguments when invoked.
            retFunc = function () {

                return thisFunc.apply(aThis, arguments);
            };
        }

        return retFunc;
    };
} else {
    //  The platform provides a native bind() - alias it to '$$bind()' so that
    //  we can override it below
    TP.FunctionProto.$$bind = TP.FunctionProto.bind;
}

//  ---

Function.Inst.defineMethod('bind',
function(aThis) {

    /**
     * @name bind
     * @synopsis Binds a function to a particular context...for good :).
     * @description Returns a function which ensures the receiver will be
     *     executed in the context of aThis. This is relevant any time the
     *     function contains a 'this' reference and might be invoked via a
     *     non-binding syntax. This is common when attempting to pass a method
     *     as a 'block', particularly to an iteration function or as an event
     *     handler.
     *
     *     The bind() operation is a critical element of the TIBET
     *     infrastructure. In JavaScript functions are only bound to an object
     *     (thereby making them 'methods') when accessed via an object
     *     reference. The problem arises when functions are passed as arguments
     *     or otherwise manipulated such that they would no longer be accessed
     *     through an object reference. In those cases, when the function is
     *     invoked its 'this' reference will not reflect the proper object (it
     *     will usually end up referencing the window -- which is a decent
     *     debugging hint that you may have an unbound function).
     *
     *     bind() solves this problem by taking advantage of JavaScript's
     *     ability to create what are known as closures. A closure is
     *     essentially the combination of a function and the scope in which it
     *     was defined, all wrapped up together. When the function is executed
     *     at a later time the values in scope at definition time remain in
     *     effect for the function. This is also known as "lexical scoping"
     *     which is how most (but not all) JavaScript functions are scoped.
     *
     *     NOTE that since only functions with internal 'this' references are
     *     affected by a binding context we don't wrap functions without
     *     internal 'this' references.
     * @param {Object} aThis The object to use for 'this'.
     * @param {arguments} varargs Zero or more 'bound' arguments to provide to
     *     the bound function.
     * @returns {Function} The new 'bound' Function, which captures the supplied
     *     'this' reference and uses it when invoking.
     * @todo
     */

    var retFunc;

    //  if more than 1 argument was supplied, then call $$bind() with an
    //  Array built from the arguments object, slicing off aThis.
    if (arguments.length > 1) {
        retFunc = this.$$bind(aThis, TP.args(arguments, 1));
    } else {
        //  On rare occasions, 'this' points to a Function that isn't
        //  participating in the Function.prototype chain (sigh...). If so, the
        //  '$$bind' won't be set and we should just use that objects 'bind'.
        if (TP.notValid(this.$$bind)) {
            retFunc = this.bind(aThis);
        } else {
            //  otherwise, just call $$bind() with aThis.
            retFunc = this.$$bind(aThis);
        }
    }

    //  TIBET uses the various name, owner, and track elements during
    //  both logging and inheritance operations so they need to be set so
    //  our newly bound function can still play along
    retFunc[TP.NAME] = this[TP.NAME] || 'BoundMethod';
    retFunc[TP.OWNER] = this[TP.OWNER] || TP.NONE;
    retFunc[TP.TRACK] = this[TP.TRACK] || TP.NONE;
    retFunc[TP.DISPLAY] = TP.id(retFunc[TP.OWNER]) + '.' + retFunc[TP.NAME];

    //  We also want to make sure we can get back to the original function
    //  that was being bound as well as the binding itself in any IDE/tools
    retFunc.$realFunc = this;
    retFunc.$realThis = aThis;

    //  NB: We only put a '$binding' slot on the receiver if it does *not* have
    //  a TP.OWNER. We don't want to instrument shared Function objects.
    if (TP.notValid(this[TP.OWNER])) {
        this.$binding = retFunc;
    }

    //  return our newly created and instrumented "method"
    return retFunc;
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('atEnd',
function(aFlag) {

    /**
     * @name atEnd
     * @synopsis Combined setter/getter that allows functions used during
     *     iterations to be configured with the current loop index state, or
     *     checked for it inside your processing logic.
     * @description The TIBET iteration process sets loop index state on the
     *     function being invoked so you can write more intelligent loops that
     *     can deal with edge cases. To do this the functions (which may be
     *     bound) drill down to set their values as low as possible in the
     *     binding chain, and look outward through the binding chain to see if
     *     they have state information. This method helps to ensure that no
     *     matter which function you get a handle to you'll get the proper data
     *     back when querying for loop indexes.
     * @param {Boolean} aFlag True if the iteration is at the end (last index
     *     location).
     * @returns {Boolean} The current end state.
     */

    var func,
        end;

    func = TP.unbound(this);

    if (TP.isBoolean(aFlag)) {
        func.$end = aFlag;

        return aFlag;
    }

    end = func.$end;

    if (TP.notValid(end)) {
        try {
            end = func.caller.$end;
        } catch (e) {
        }
    }

    return end;
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('atStart',
function(aFlag) {

    /**
     * @name atStart
     * @synopsis Combined setter/getter that allows functions used during
     *     iterations to be configured with the current loop index state, or
     *     checked for it inside your processing logic.
     * @description The TIBET iteration process sets loop index state on the
     *     function being invoked so you can write more intelligent loops that
     *     can deal with edge cases. To do this the functions (which may be
     *     bound) drill down to set their values as low as possible in the
     *     binding chain, and look outward through the binding chain to see if
     *     they have state information. This method helps to ensure that no
     *     matter which function you get a handle to you'll get the proper data
     *     back when querying for loop indexes.
     * @param {Boolean} aFlag True if the iteration is at the start (first index
     *     location).
     * @returns {Boolean} The current start state.
     */

    var func,
        start;

    func = TP.unbound(this);

    if (TP.isBoolean(aFlag)) {
        func.$start = aFlag;

        return aFlag;
    }

    start = func.$start;

    if (TP.notValid(start)) {
        try {
            start = func.caller.$start;
        } catch (e) {
        }
    }

    return start;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('unbound',
function(aFunction) {

    /**
     * @name unbound
     * @synopsis Returns the true function that would be invoked by a
     *     potentially bound function (or series of them). This method "drills
     *     down" through a set of bound functions until it reaches the
     *     originally bound function reference.
     * @returns {Function} The originally bound source function.
     */

    var func;

    if (!TP.isFunction(aFunction)) {
        TP.raise(this, 'TP.sig.InvalidParameter');
        return aFunction;
    }

    func = aFunction;
    while (func.$realFunc) {
        func = func.$realFunc;
    }

    return func;
});

//  ------------------------------------------------------------------------
//  FUNCTION "THREADING"
//  ------------------------------------------------------------------------

Function.Inst.defineMethod('afterUnwind',
function() {

    /**
     * @name afterUnwind
     * @synopsis Causes the receiver to be executed when the stack has been
     *     completely 'unwound' (i.e. when we're back at the main event loop).
     * @description The provides a convenient way for the receiver to execute at
     *     the 'top' of the event loop to allow for things like intermediate
     *     display to occur. If you want to pass arguments to the function
     *     itself, simply pass them as parameters to this method:
     *         f.afterUnwind(farg1, farg2, ...).
     *     Note that this method provides a slightly better mechanism for
     *     executing Functions at the top the stack than a '0' based timeout or
     *     fork as it leverage some underlying platform capabilities.
     * @returns {Function} The receiver.
     * @todo
     */

    var thisref,
        arglist,

        func,

        flushQueue;

    //  we'll want to invoke the receiver (this) but need a way to get it
    //  to close properly into the function we'll use for argument passing
    thisref = this;
    arglist = TP.args(arguments);

    //  have to build a second function to ensure the arguments are used
    func = function() {

        return thisref.apply(thisref, arglist);
    };

    //  Leverage MutationObservers if they're available
    if (window.MutationObserver) {

        //  If there is no 'TP.$$unwindElem' global, then we need to set it up
        //  along with the MutationObserver that will trigger *at the top of the
        //  event loop* (as MutationObservers do) and run all of the functions
        //  in the TP.$$unwindQueue
        if (!TP.isElement(TP.$$unwindElem)) {

            //  Set up our globals. Note that we don't even have to append the
            //  TP.$$unwindElem to a document or anything to get
            //  MutationObserver goodness.
            TP.defineAttribute(TP,
                                '$$unwindElem',
                                document.createElement('div'));
            TP.defineAttribute(TP, '$$unwindQueue', TP.ac());

            //  Define a function that runs all functions in the
            //  TP.$$unwindQueue and then empties the queue.
            flushQueue = function () {
                var i;

                for (i = 0; i < TP.$$unwindQueue.getSize(); i++) {
                    TP.$$unwindQueue.at(i)();
                }

                //  Make sure to empty the queue after we execute all of the
                //  pending Functions.
                TP.$$unwindQueue.empty();
            };

            //  Now set up the MutationObserver to flush the queue whenever the
            //  TP.$$unwindElem changes.
            new MutationObserver(flushQueue).observe(
                            TP.$$unwindElem, {attributes: true});
        }

        //  Push the Function we built above onto the TP.$$unwindQueue and tweak
        //  the TP.$$unwindElem to cause the MutationObserver to run the queue
        //  flushing Function the next time the stack is completely unwound.
        TP.$$unwindQueue.push(func);
        TP.$$unwindElem.setAttribute('x', '100');

    } else {

        //  Otherwise, we don't have MutationObservers available to us, so we
        //  just use setTimeout() with an interval of 0, which works to achieve
        //  a similar effect in most environments.
        if (arguments.length < 1) {
            return setTimeout(this, 0);
        }

        return setTimeout(func, 0);
    }
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('fork',
function(aDelay) {

    /**
     * @name fork
     * @synopsis Causes the receiver to be forked via a timeout or interval.
     * @description Keep in mind that JS engines are NOT threaded, so the real
     *     value in this model is being able to chain routines so that gaps
     *     occur between processing cycles such that display can occur. The
     *     TIBET test harness, and boot system are examples of chaining that
     *     allow intermediate display to occur. If you want to pass arguments to
     *     the function itself simply pass them after the delay parameter:
     *         f.fork(delay, farg1, farg2, ...).
     * @param {Number} aDelay Millisecond delay before the function is actually
     *     run.
     * @returns {Object} The object to use to stop the fork() prematurely (via
     *     clearTimeout()).
     * @todo
     */

    var thisref,
        arglist,

        func;

    //  no arguments? easy to call then
    if (arguments.length < 2) {
        return setTimeout(
                    this, TP.ifInvalid(aDelay, TP.sys.cfg('fork.delay')));
    }

    //  we'll want to invoke the receiver (this) but need a way to get it
    //  to close properly into the function we'll use for argument passing
    thisref = this;

    //  Note here how we gather the arguments starting at position 1, skipping
    //  our delay.
    arglist = TP.args(arguments, 1);

    //  have to build a second function to ensure the arguments are used
    func = function() {

        return thisref.apply(thisref, arglist);
    };

    return setTimeout(func,
                        TP.ifInvalid(aDelay, TP.sys.cfg('fork.delay')));
});

//  ------------------------------------------------------------------------
//  FUNCTION PARAMETERS
//  ------------------------------------------------------------------------

Function.Inst.defineMethod('getArity',
function() {

    /**
     * @name getArity
     * @synopsis Returns the arity (that is, the number of formally declared
     *     parameters) to this function.
     * @returns {Number} The number of formally declared parameters to this
     *     function.
     */

    return this.length;
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('generateMethodSourceHead',
function() {

    /**
     * @name generateMethodSourceHead
     * @synopsis Returns a String that is a representation of the 'source head'
     *     of the canonical TIBET way of adding a method to the system.
     * @description NOTE: this method produces a representation which *must* be
     *     followed with a Function statement (i.e. 'function() {...}') and a
     *     closing ')'.
     * @returns {String} A representation of the 'source method head' of the
     *     receiver in TIBET.
     */

    var owner,
        track,

        str,

        ownerName;

    owner = this[TP.OWNER];
    track = this[TP.TRACK];

    str = TP.ac();

    //  We need to have both a valid owner and track to generate the header.
    if (TP.isValid(owner) && TP.isValid(track)) {
        ownerName = owner.getName();

        if (track === TP.GLOBAL_TRACK) {
            str.push('TP.defineGlobalMethod(');
        } else if (track === TP.PRIMITIVE_TRACK) {
            str.push('TP.definePrimitive(');
        } else if (track === TP.META_TYPE_TRACK) {
            str.push('TP.defineMetaTypeMethod(');
        } else if (track === TP.META_INST_TRACK) {
            str.push('TP.defineMetaInstMethod(');
        } else if (track === TP.TYPE_LOCAL_TRACK ||
                    track === TP.LOCAL_TRACK) {
            str.push(ownerName, '.defineMethod(');
        } else {
            str.push(ownerName, '.', track, '.defineMethod(');
        }

        str.push('\'', this.getName() + '\',\n');
    }

    return str.join('');
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('getMethodPatch',
function(methodText) {

    /**
     * @name getMethodPatch
     * @synopsis Returns patch file content suitable for applying to the
     *     receiver's source file. The JsDiff package must be loaded for this
     *     operation to work. The JsDiff package is typically loaded by the
     *     Sherpa config.
     * @param {String} methodText The new method text.
     * @return {String} A string representing patch file content.
     */

    var path,
        url,
        str,
        matcher,
        content,
        match,
        newtext,
        patch;

    if (TP.notValid(self.JsDiff)) {
        TP.ifWarn() ?
            TP.warn('Unable to generate method patch. JsDiff not loaded.',
                    TP.LOG) : 0;
        return;
    }

    //  Get the original source url...
    path = TP.objectGetSourcePath(this);
    if (TP.isEmpty(path)) {
        TP.ifWarn() ?
            TP.warn('Unable to generate method patch. Source path not found.',
                    TP.LOG) : 0;
        return;
    }

    url = TP.uc(path);
    content = url.getContent(); // .then(function(resolve, reject) {
        // Yay promises!!!....almost...TODO
    // });

    if (TP.isEmpty(content)) {
        TP.ifWarn() ?
            TP.warn('Unable to generate method patch. Source text not found.',
                    TP.LOG) : 0;
        return;
    }

    //  Get the current method's body text...
    str = this.toString().trim();

    //  Convert the body text into a RegExp we can use as a way of indexing
    //  into the original source file text.
    matcher = TP.rc(RegExp.escapeMetachars(
                str.replace(/[\u0009\u000A\u0020\u000D]+/g,
                    'SECRET_SAUCE')).replace(/SECRET_SAUCE/g, '\\s*'));

    match = content.match(matcher);
    if (TP.notValid(match)) {
        TP.ifWarn() ?
            TP.warn('Unable to generate method patch. Method index not found.',
                    TP.LOG) : 0;
        return null;
    }

    newtext = content.slice(0, match.index) +
                methodText +
                content.slice(match.index + match.at(0).length);

    //  NOTE we use the original srcPath string here to retain relative address.
    patch = TP.extern.JsDiff.createPatch(path, content, newtext);

    return patch;
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('postMethodPatch',
function(methodText, onsuccess, onfailure) {
    var patch,
        url,
        target,
        req;

    patch = this.getMethodPatch(methodText);
    if (TP.isEmpty(patch)) {
        return;
    }

    url = TP.uc(TP.sys.cfg('tds.patch_uri'));
    if (TP.notValid(url)) {
        TP.error('Unable to create URL for patch server.');
        return;
    }

    target = this.$srcPath;
    if (TP.isEmpty(target)) {
        TP.error('Unable to locate source path for function.');
        return;
    }

    req = TP.sig.HTTPRequest.construct(
        TP.hc('uri', url,
                'verb', TP.HTTP_POST,
                'async', false,
                'body',
                    TP.hc('type', 'patch', 'target', target, 'content', patch),
                'mimetype', TP.JSON_ENCODED));

    req.defineMethod('handleRequestSucceeded', function() {
        if (onsuccess) {
            onsuccess(req);
        }
    });

    req.defineMethod('handleRequestFailed', function() {
        if (onfailure) {
            onfailure(req);
        }
    });

    return req.fire();
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('getParameterNames',
function() {

    /**
     * @name getParameterNames
     * @synopsis Returns an Array of the formal parameter names of this
     *     function.
     * @returns {Array} The formal parameter names to this function.
     * @todo
     */

    var str,
        arr,

        list,
        argStr;

    str = this.asString();

    //  first look for anonymouse ;) functions (slicing off the 'whole match')
    arr = str.match(/function[ ]*\((.*?)\)/).slice(1);
    if (TP.notEmpty(arr)) {
        list = arr;
    }

    //  next look for named functions (slicing off the 'whole match')
    if (TP.isEmpty(list)) {
        arr = str.match(/function [$]*\w+[ ]*\((.*?)\)/).slice(1);
        list = arr;
    }

    if (TP.notEmpty(list) && TP.notEmpty(argStr = list.at(0))) {
        return argStr.split(/,\s*/);
    }

    return TP.ac();
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('getSignature',
function() {

    /**
     * @name getSignature
     * @synopsis Returns the "method signature" or function calling signature
     *     for the receiver.
     * @returns {String} The signature string.
     */

    var src,
        sig;

    src = this.asString();

    sig = src.slice(0, src.indexOf(')') + 1);

    //  at this point we've got something that probably looks like:
    //  function (paramA, paramB, ...) so we want to "pretty it up" a bit
    //  with some additional content
    if (/function(\W*)\(/.test(sig)) {

        sig = sig.replace('function', 'function ' + this.getName());
    }

    return sig;
});

//  ------------------------------------------------------------------------
//  TYPE MEMBERSHIP
//  ------------------------------------------------------------------------

/**
 * The functions here provide simple information regarding the type, type
 * name, etc. of the receiving object. These are used extensively in logging
 * and other areas of the system.
 */

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('asType',
function() {

    /**
     * @name asType
     * @synopsis Returns the receiver as a Type. If the receiver *is* a type
     *     this returns the receiver. If the receiver is a String the string
     *     content is used as a typename and an attempt is made to return that
     *     type. If the receiver is an instance of anything other than String
     *     the receiver's type is returned.
     * @returns {Object} The type object for the receiver.
     */

    var type;

    if (TP.isType(this)) {
        return this;
    }

    if (TP.isString(this)) {
        if (TP.isType(type = TP.sys.getTypeByName(this))) {
            return type;
        }

        //  IE sometimes will have _ in the type name due to metadata issues
        //  BUT NOTE NOTE NOTE that we DO NOT WANT A GLOBAL REPLACE HERE so
        //  that names can be xctrls:something_service etc.
        return TP.sys.getTypeByName(this.replace('_', ':'));
    }

    return this.getType();
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getSubtypes',
function(shouldDescend) {

    /**
     * @name getSubtypes
     * @synopsis Returns an array containing the subtypes of the receiver. When
     *     working with immediate children (no descent), you should consider
     *     this array private and avoid manipulating it directly.
     * @param {Boolean} shouldDescend A flag controlling whether the list
     *     includes all subtypes or only immediate children.
     * @returns {Array} An array of subtypes.
     * @todo
     */

    var types,
        emptyArr,
        i,
        len,
        type;

    if (!TP.isType(this)) {
        return this.getType().getSubtypes();
    }

    //  shallow? easy, list is built by defineSubtype (or not ;))
    if (TP.notTrue(shouldDescend)) {
        return this[TP.SUBTYPES] || TP.ac();
    }

    //  deep...see if we've got a cached value that we own
    if (TP.owns(this, TP.SUBTYPES_DEEP)) {
        if (TP.isArray(types = this[TP.SUBTYPES_DEEP])) {
            return types;
        }
    }

    //  next see if we have any subtypes at all. if not we can bail, there's
    //  nothing to iterate on
    if (TP.isEmpty(types = this[TP.SUBTYPES])) {
        return TP.ac();
    }

    //  placeholder array we can use to avoid "TP.sig.InvalidCollection" errors
    emptyArr = TP.ac();

    //  make sure to copy this list! we don't want to be modifying it below
    types = types.copy();

    len = types.length;
    for (i = 0; i < len; i++) {
        type = types[i];

        //  NOTE that by passing false here we don't ask others to go deep,
        //  we're doing all the work here and working down one level at a
        //  time via the iteration across all newly found subtypes
        types.addAll(type.getSubtypes(false) || emptyArr);

        // update length in case we found some more to work through
        len = types.length;
    }

    //  if we can, cache the deep subtype list, defineSubtype will maintain it
    if (TP.sys.$$shouldCacheDeepSubtypes()) {
        this[TP.SUBTYPES_DEEP] = types;
    }

    return types;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getSubtypeNames',
function(shouldDescend) {

    /**
     * @name getSubtypeNames
     * @synopsis Returns an array containing the subtype names of the receiver.
     *     The default list contains names of immediate subtypes.
     * @param {Boolean} shouldDescend A flag controlling whether the list
     *     includes all subtypes or only immediate children.
     * @returns {Array} An array of subtype names.
     * @todo
     */

    var names,
        arr,
        len,
        i;

    if (!TP.isType(this)) {
        return this.getType().getSubtypeNames();
    }

    //  shallow? easy, list is built by defineSubtype (or not ;))
    if (TP.notTrue(shouldDescend)) {
        return this[TP.SUBTYPE_NAMES] || TP.ac();
    }

    //  deep...see if we've got a cached value we own
    if (TP.owns(this, TP.SUBTYPES_NAMES_DEEP)) {
        if (TP.isArray(names = this[TP.SUBTYPE_NAMES_DEEP])) {
            return names;
        }
    }

    //  next see if we have any subtypes at all. if not we can bail
    if (TP.isEmpty(names = this[TP.SUBTYPE_NAMES])) {
        return TP.ac();
    }

    //  build from the subtype list (easier and forces cache on both)
    if (TP.isEmpty(names = this.getSubtypes(shouldDescend))) {
        return TP.ac();
    }

    //  collect the names
    arr = TP.ac();
    len = names.getSize();
    for (i = 0; i < len; i++) {
        arr.push(names.at(i).getName());
    }
    names = arr;

    //  if we can, cache the deep subtype list, defineSubtype will maintain it
    if (TP.sys.$$shouldCacheDeepSubtypes()) {
        this[TP.SUBTYPE_NAMES_DEEP] = names;
    }

    return names;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getSupertype',
function() {

    /**
     * @name getSupertype
     * @synopsis Returns the supertype of the receiver.
     * @returns {Object} The supertype of the receiver.
     */

    //  Object doesn't have a supertype thanks ;)
    if (this === TP.ObjectProto || this === Object) {
        return;
    }

    if (TP.isType(this)) {
        return this[TP.SUPER];
    }

    return this.getType().getSupertype();
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getSupertypeName',
function() {

    /**
     * @name getSupertypeName
     * @synopsis Returns the supertype name of the receiver.
     * @returns {String} The supertype name of the receiver.
     * @todo
     */

    //  Object doesn't have a supertype thanks ;)
    if (this === TP.ObjectProto || this === Object) {
        return;
    }

    //  types keep this list, which is built from defineSubtype calls
    if (TP.isType(this)) {
        return this[TP.SUPER].getName();
    }

    return this.getType().getSupertypeName();
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getSupertypes',
function() {

    /**
     * @name getSupertypes
     * @synopsis Returns an array containing the supertypes of the receiver. If
     *     the receiver is an 'instance' then the supertypes of the receiver's
     *     types are returned. You should consider this array private and avoid
     *     manipulating it. The first element in this array is the immediate
     *     supertype of the receiver or, in the case of an instance, it's the
     *     receiver's type.
     * @returns {Array} An array of root to immediate supertypes.
     * @todo
     */

    var type;

    if (TP.isType(this)) {
        return this[TP.ANCESTORS] || TP.ac();
    }

    //  instances work from their type if they can acquire it
    if (TP.canInvoke(this, 'getType')) {
        type = this.getType();
        if (type === this) {
            return TP.ac();
        }

        if (TP.canInvoke(type, 'getSupertypes')) {
            return type.getSupertypes();
        }
    }

    return TP.ac();
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getSupertypeNames',
function() {

    /**
     * @name getSupertypeNames
     * @synopsis Returns an array containing the supertype names of the
     *     receiver.
     * @returns {Array} An array containing the supertype names of the receiver.
     * @todo
     */

    var type;

    //  types keep this list, which is built from defineSubtype calls
    if (TP.isType(this)) {
        return this[TP.ANCESTOR_NAMES] || TP.ac();
    }

    //  instances work from their type if they can acquire it
    if (TP.canInvoke(this, 'getType')) {
        type = this.getType();
        if (type === this) {
            return TP.ac();
        }

        if (TP.canInvoke(type, 'getSupertypeNames')) {
            return type.getSupertypeNames() || TP.ac();
        }
    }

    return TP.ac();
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getSignalName',
function() {

    /**
     * @name getSignalName
     * @synopsis Returns the 'signal name' of the receiver. If the receiver is
     *     an Object this is equivalent to the escaped type name. If the
     *     receiver is a String the content of the string is returned.
     * @description This method allows Objects to function as Signals within the
     *     framework so that the individual signal types don't have to exist
     *     when the signal is thrown.
     * @returns {String} The signal name of the receiver.
     */

    if (TP.isType(this)) {
        return this.getName();
    }

    return this.getTypeName();
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('getSignalName',
function() {

    /**
     * @name getSignalName
     * @synopsis Returns the 'signal name' of the receiver. If the receiver is
     *     an Object this is equivalent to getTypeName(). If the receiver is a
     *     String the content of the string is returned.
     * @description This method allows Numbers to function as Signals within the
     *     framework so that the individual signal types don't have to exist
     *     when the signal is thrown.
     * @returns {String} The signal name of the receiver.
     */

    //  here we allow numbers to be provided as signal names in string form
    //  which results in invocations of "handle404" etc. so you can create
    //  handlers for error codes and signal error codes as needed
    return this.toString();
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('getSignalName',
function() {

    /**
     * @name getSignalName
     * @synopsis Returns the 'signal name' of the receiver. If the receiver is
     *     an Object this is equivalent to getTypeName(). If the receiver is a
     *     String the content of the string is returned.
     * @description This method allows Strings to function as Signals within the
     *     framework so that the individual signal types don't have to exist
     *     when the signal is thrown.
     * @returns {String} The signal name of the receiver.
     */

    //  here we allow numbers to be provided as signal names in string form
    //  which results in invocations of "handle404" etc. so you can create
    //  handlers for error codes and signal error codes as needed
    return this.toString();
});

//  ------------------------------------------------------------------------
//  TYPE CHECKING - PART II (PostPatch)
//  ------------------------------------------------------------------------

/**
 * While polymorphism is the preferred mechanism for object-oriented programs
 * to alter behavior based on type it's unfortunately necessary to rely on
 * direct type-checking in browsers since not everything you get will actually
 * inherit from Object and use TP.ObjectProto consistently as a root :(.
 */

//  ------------------------------------------------------------------------

TP.definePrimitive('isMemberOf',
function(anObject, aType) {

    /**
     * @name isMemberOf
     * @synopsis Returns true if anObject is a direct member of aType. The test
     *     performed is both on identity and name so that certain forms of 'type
     *     spoofing' can be done to get around not being able to create direct
     *     subtypes of native types in certain browsers.
     * @param {Object} anObject The object to test.
     * @param {TP.lang.RootObject|String} aType A Type object, or type name.
     * @returns {Boolean} Whether or not the supplied object is a member of the
     *     supplied type.
     * @todo
     */

    var result,

        objTypeName,
        typeName,

        testType;

    if (TP.notDefined(anObject) && TP.notDefined(aType)) {
        return true;
    }

    if (TP.isNull(anObject) && TP.isNull(aType)) {
        return true;
    }

    if (TP.notValid(anObject) ||
        TP.notValid(aType) ||
        TP.notValid(anObject.constructor)) {
        return false;
    }

    if (TP.isNonFunctionConstructor(anObject)) {
        //  The object is created by non Function constructors and has a
        //  constructor name for us to use.
        if ((result = anObject.$$nonFunctionConstructorConstructorName)) {
            return result;
        }

        return (aType === 'Object' || aType === Object);
    }

    typeName = TP.isType(aType) ? TP.name(aType) : aType;

    //  anObject is a TIBET 'type' itself? Then check to see if the object's
    //  type or typename matches the supplied type or typename. Otherwise, the
    //  last test in this method will get confused and return 'true' for things
    //  like TP.isMemberOf(String, 'String'), which is seriously incorrect.
    if (TP.isType(anObject) && !TP.isNativeType(anObject)) {
        return (anObject.getType() === aType ||
                anObject.getTypeName() === typeName);
    }

    //  direct instance of a native type? fast exit, but not all constructors
    //  respond to getName
    try {
        if ((aType !== Object) &&
            ((anObject.constructor === aType) ||
                (TP.isCallable(anObject.constructor.getName) &&
                (anObject.constructor.getName() === aType)))) {
            return true;
        }
    } catch (e) {
    }

    //  check for spoofing hook and use it if found
    if (TP.canInvoke(anObject, '$$isMemberOf') && TP.isNativeType(aType)) {
        if (TP.isBoolean(result = anObject.$$isMemberOf(aType))) {
            return result;
        }
    }

    //  now for the object...
    if (TP.notEmpty(objTypeName = TP.tname(anObject))) {
        return objTypeName === typeName;
    }

    //  As a test of last resort, we see if we're testing a native object
    //  against a native type. Sometimes, especially in the case of JSON
    //  data, we get objects from another frame and those native objects
    //  don't have any of the methods / slots that we put on them in the
    //  code frame. This will at least try something.
    //  Note that all three browser types we currently support (Gecko,
    //  Webkit and IE/Trident) all report '[native code]' as part of their
    //  String representation of native object constructors, so we can use
    //  this test on those browsers.
    if (/native code/.test(anObject.constructor.toString())) {
        if (TP.isString(testType = aType)) {
            testType = TP.global[aType];
        }

        if (/native code/.test(testType.toString())) {
            return anObject.constructor.toString() === testType.toString();
        }
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isKindOf',
function(anObject, aType) {

    /**
     * @name isKindOf
     * @synopsis Returns true if TP.isMemberOf(anObject, aType) is true or if
     *     TP.isMemberOf() returns true for any subtypes of aType.
     * @param {Object} anObject The object to test.
     * @param {TP.lang.RootObject|String} aType A Type object, or type name.
     * @returns {Boolean} Whether or not the supplied object is a kind of the
     *     supplied type.
     * @todo
     */

    var typeName,
        superTNames;

    //  if we're a direct member of that type then yes, we're a kind of that
    //  type...and this is a fairly fast test
    if (TP.isMemberOf(anObject, aType)) {
        return true;
    }

    //  If anObject *is a type itself* (in this case, a native type), then it's
    //  type can either only be 'Object' or 'Function'.
    if (TP.isNativeType(anObject)) {
        if (TP.isNonFunctionConstructor(anObject)) {
            return TP.name(aType) === 'Object';
        }

        return TP.name(aType) === 'Object' || TP.name(aType) === 'Function';
    }

    typeName = TP.isType(aType) ? TP.name(aType) : aType;

    if (TP.notEmpty(superTNames = TP.stnames(anObject))) {
        return superTNames.containsString(typeName);
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isSubtypeOf',
function(anObject, aType) {

    /**
     * @name isSubtypeOf
     * @synopsis Returns true if the receiver is a subtype of the type provided.
     *     This is always false for 'instances', which an essential difference
     *     between this function and TP.isKindOf().
     * @param {Object} anObject The object to test.
     * @param {TP.lang.RootObject|String} aType A Type object, or type name.
     * @returns {Boolean} Whether or not the supplied object is a subtype of the
     *     supplied type.
     * @todo
     */

    var typeName;

    if (!TP.isType(anObject) || TP.notValid(aType)) {
        return false;
    }

    if (TP.canInvoke(anObject, 'getSupertypeNames')) {
        typeName = TP.isType(aType) ? aType.getName() : aType;

        return anObject.getSupertypeNames().containsString(typeName);
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isURI',
function(anObject) {

    /**
     * @name isURI
     * @synopsis Returns true if the object provided is either a valid instance
     *     of TP.core.URI (or a subtype) or a String whose content appears
     *     likely to represent a URI. The test is performed using the
     *     TP.regex.URI_LIKELY regular expression, which is *not* a strict
     *     attempt to parse the URI.
     * @description Scheme-specific differences inherent in URI definitions make
     *     it impossible to do a reasonable job without using subtypes specific
     *     to each scheme (which TIBET supports but which it does not leverage
     *     for this method).
     * @param {Object} anObject The object to test.
     * @returns {Boolean} True if the object appears to be a URI.
     */

    if (TP.notValid(anObject)) {
        return false;
    }

    if (TP.isString(anObject)) {
        //  simple check for proper URI form - but make sure it's not a RegExp
        //  literal.
        return TP.regex.URI_LIKELY.test(anObject) &&
                !TP.regex.REGEX_LITERAL_STRING.test(anObject);
    }

    return TP.isKindOf(anObject, 'TP.core.URI');
});

//  ------------------------------------------------------------------------
//  CONTROL FLOW - BRANCHING
//  ------------------------------------------------------------------------

/**
 * Certain syntaxes can create complexity when nested branch logic is required.
 * These methods provide simple alternative syntax that can occasionally be used
 * to write more readable code. And we couldn't resist leveraging a Boolean type
 * that's actually a real type. Now, if only null was an object ;).
 */

//  ------------------------------------------------------------------------
//  ERROR HANDLING
//  ------------------------------------------------------------------------

/*
Utility routines to help manage native JS errors, in particular recursion
errors where possible.
*/

//  ------------------------------------------------------------------------

TP.sys.defineMethod('trapRecursion',
function(shouldNotify, shouldThrow, stackDepth) {

    /**
     * @name trapRecursion
     * @synopsis Terminates TIBET execution and optionally alerts the current
     *     TIBET call stack when recursion is detected.
     * @description Nav4 in particular is 'unhappy' with recursion. In fact,
     *     it'll crash every time. Using a binary chop on your source can often
     *     locate the offending line but can't help you understand how the
     *     recursion is occuring. In an OO system like TIBET the recursion loop
     *     can often be several methods in size. Placing this call in the
     *     suspected method and then moving it successively deeper into the
     *     method stack will eventually terminate the recursion and provide you
     *     with the necessary info. Of course, if you have IE and the free
     *     Script Debugger it'll do the same thing or if you're using Mozilla
     *     with Venkman -- but that can be _painfully_ slow.
     * @param {Boolean} shouldNotify If true notify()'s call stack. Defaults to
     * @param {Boolean} shouldThrow
     * @param {Number} stackDepth
     * @todo
     */

    var doNotify,
        doThrow,

        depth,
        stackInfo;

    if (!TP.sys.shouldTrapRecursion()) {
        return;
    }

    doNotify = TP.ifInvalid(shouldNotify, true);
    doThrow = TP.ifInvalid(shouldThrow, false);

    depth = TP.isNumber(stackDepth) ?
                            stackDepth :
                            TP.sys.cfg('stack.recursion_max');

    try {
        throw new Error();
    } catch (e) {
        stackInfo = TP.getStackInfo(e);
    }

    //  don't need to use activations here, only care about length
    if (TP.isArray(stackInfo) && (stackInfo.length > depth)) {
        if (doNotify) {
            TP.boot.$stderr('RecursionException', stackInfo, TP.ERROR);
        }
        if (TP.notFalse(doThrow)) {
            throw new Error('RecursionError');
        }
    }

    return;
});

//  ------------------------------------------------------------------------

// NOTE: DO NOT REGISTER THIS...
TP.sys.onerror = function(msg, url, line, column, errorObj) {

    /**
     * @name onerror
     * @synopsis Captures global errors and outputs them appropriately. This
     *     hook allows TIBET to capture native JavaScript errors and avoid
     *     reporting them via the normal browser mechanism. This keeps users
     *     from being bombarded by messages about JS errors while allowing
     *     developers to see what's what.
     * @param {String} message The error message.
     * @param {String} url The url of the JavaScript file.
     * @param {Number} line The line number in that file.
     * @param {Number} column The column number in that script.
     * @param {Error} errorObj The error object of the error that caused this
     *     hook to trigger.
     * @returns {Boolean} TP.sys.shouldCaptureErrors() value.
     * @todo
     */

    var file,
        path,
        str;

    try {
        // The boot system will set a file reference in certain cases to help
        // ensure we report the proper origin.
        file = TP.boot.$$onerrorFile;
        path = TP.notValid(file) ? url : file;

        str = msg || 'Error';
        str += ' in file: ' + path + ' line: ' + line + ' column: ' + column;

        if (TP.sys.shouldLogStack() && TP.isError(errorObj)) {
            str += '\nSTACK:\n' + TP.getStackInfo(errorObj).join('\n');
        }

        // If we're still booting errors that are uncaught are considered FATAL.
        if (!TP.sys.hasStarted()) {
            TP.fatal(str, TP.BOOT_LOG);
        } else {
            // Uncaught errors are severe relative to those we raise/catch.
            TP.ifSevere() ? TP.severe(str, TP.LOG) : 0;
        }
    } catch (e) {
        // don't let log errors trigger recursion, but don't bury them either.
        top.console.error('Error logging onerror: ' + e.message);
        top.console.error(str || msg);
    }

    //  last chance...invoke the debugger :)
    if (TP.sys.shouldUseDebugger()) {
        TP.sys.$launchDebugger(arguments);
    }

    $STATUS = TP.FAILURE;

    return TP.sys.shouldCaptureErrors();
};

//  install our version...
window.onerror = TP.sys.onerror;

//  ------------------------------------------------------------------------
//  SIGNALING
//  ------------------------------------------------------------------------

/**
 * Standard event notification with a twist. The TIBET notification module
 * unifies the event models of the two major browsers via DOM Level2 support
 * while integrating non-UI events. The signaling code is broken into two main
 * components. The first component is the actual notification center itself
 * which holds registrations of interest in various signals and origins. The
 * second is the 'arming' code which determines how to arm native components for
 * the events which are being observed. The two halves combine to support a
 * common signaling infrastructure that can adapt easily to cross-browser
 * differences without making the notification center aware of DOM internals.

 * The types TP.sig.Signal and TP.sig.SignalMap along with several global
 * functions including TP.observe(), TP.ignore(), TP.signal(), TP.resume(),
 * TP.suspend() all contribute to TIBET's signaling system.
 */

//  TIBET's pending signal queue. This is used by the TP.queue() calls etc.
TP.sys.$signalQueue = TP.ifInvalid(TP.sys.$signalQueue, TP.ac());

//  ------------------------------------------------------------------------

TP.definePrimitive('queue',
function(anOrigin, aSignal, aPayload, aPolicy, aType) {

    /**
     * @name queue
     * @synopsis Provides a way to queue a signal for processing. This method is
     *     a convenience for signal handlers which don't want to cause signals
     *     they need to throw to be processed until they return. The various
     *     signal() calls check the queue prior to returning and handle any
     *     signals found there.
     * @param {Object} anOrigin The originator of the signal.
     * @param {String|TP.sig.Signal} aSignal The signal to fire.
     * @param {Object} aPayload Optional argument object.
     * @param {Function} aPolicy A "firing" policy that will define how the
     *     signal is fired.
     * @param {String|TP.sig.Signal} aType The default supertype to use when
     *     aSignal type doesn't exist.
     * @todo
     */

    TP.sys.$signalQueue.add(
        TP.ac(TP.ifInvalid(anOrigin, null),
                TP.ifInvalid(aSignal, null),
                TP.ifInvalid(aPayload, null),
                TP.ifInvalid(aPolicy, null),
                TP.ifInvalid(aType, null)));

    return;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('queue',
function(aSignal, aPayload, aPolicy, aType) {

    /**
     * @name queue
     * @synopsis Queues a set of signal parameters for processing at the end of
     *     the current signal handling cycle.
     * @param {TP.sig.Signal} aSignal The signal to fire.
     * @param {Object} aPayload Optional argument object.
     * @param {Function} aPolicy A "firing" policy that will define how the
     *     signal is fired.
     * @param {String|TP.sig.Signal} aType The default supertype to use when
     *     aSignal type doesn't exist.
     * @todo
     */

    return TP.queue(this, aSignal, aPayload, aPolicy, aType);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('signal',
function(anOrigin, aSignal, aPayload, aPolicy, aType) {

    /**
     * @name signal
     * @synopsis Signals activity to registered observers. Any additional
     *     arguments are passed to the registered handlers along with the origin
     *     and event.
     * @description This bootstrap version of this method packages the signals
     *     into objects and queues them for processing by later implementations
     *     and logs the activity to the TIBET activity log. Once TIBET has
     *     loaded further a more robust version that performs the actual
     *     signaling activity is installed in place of this version.
     * @param {Object} anOrigin The originator of the signal.
     * @param {TP.sig.Signal} aSignal The signal to fire.
     * @param {Object} aPayload Optional argument object.
     * @param {Function} aPolicy A "firing" policy that will define how the
     *     signal is fired.
     * @param {String|TP.sig.Signal} aType The default supertype to use when
     *     aSignal type doesn't exist.
     * @returns {TP.sig.Signal} The fired signal.
     * @todo
     */

    var args;

    //  see if ignore is on at the 'origin' level
    if (TP.isValid(anOrigin) && anOrigin.$suspended) {
        return;
    }

    //  see if ignore is on at the global level
    if (TP.signal.$suspended) {
        return;
    }

    if (TP.sys.shouldQueueLoadSignals()) {
        //  capture arguments in an array which could later be used by
        //  apply
        args = TP.ac(anOrigin, aSignal, aPayload, aPolicy, aType);

        //  manually add the signal information to the signal queue for
        //  later processing when the signaling system is running
        TP.sys.$signalQueue.add(args);
    }

    TP.ifTrace(TP.sys.shouldLogLoadSignals()) ?
        TP.trace(
            'origin: ' + anOrigin +
            '\nsignal: ' + aSignal +
            '\nsigarg: ' + aPayload +
            '\npolicy: ' + aPolicy +
            '\ntype: ' + aType,
            TP.SIGNAL_LOG) : 0;

    return aSignal;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('signal',
function(aSignal, aPayload, aPolicy, aType) {

    /**
     * @name signal
     * @synopsis Signals activity to registered observers using the receiver as
     *     the origin of the signal.
     * @param {TP.sig.Signal} aSignal The signal to fire.
     * @param {Object} aPayload Optional argument object.
     * @param {Function} aPolicy A "firing" policy that will define how the
     *     signal is fired.
     * @param {String|TP.sig.Signal} aType The default supertype to use when
     *     aSignal type doesn't exist.
     * @returns {TP.sig.Signal} The fired signal.
     * @todo
     */

    return TP.signal(this, aSignal, aPayload, aPolicy, aType);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('ignore',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @name ignore
     * @synopsis Causes notifications to a particular handler to stop. If the
     *     handler is null all notifications from that origin/signal pair are
     *     removed regardless of the handler in question.
     * @param {Object|Array} anOrigin The originator(s) to be ignored.
     * @param {TP.sig.Signal|Array} aSignal The signal(s) to ignore.
     * @param {Object} aHandler The handler to disable.
     * @param {Function} aPolicy A "removal" policy that will define how the
     *     handler is removed.
     * @returns {Object} The registration object.
     * @todo
     */

    var type;

    type = TP.sys.getTypeByName('TP.sig.SignalMap');
    if (TP.isType(type)) {
        return TP.sig.SignalMap.$ignore(
                        anOrigin, aSignal, aHandler, aPolicy);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('ignore',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @name ignore
     * @synopsis Causes notifications to a particular handler to stop. If the
     *     handler is null all notifications from that origin/signal pair are
     *     removed regardless of the handler in question. If no handler is
     *     provided the receiver is assumed to be the handler.
     * @param {Object|Array} anOrigin The originator(s) to be ignored.
     * @param {TP.sig.Signal|Array} aSignal The signal(s) to ignore.
     * @param {Object} aHandler The handler to disable.
     * @param {Function} aPolicy A "removal" policy that will define how the
     *     handler is removed.
     * @returns {Object} The registration object.
     * @todo
     */

    var handler;

    handler = TP.ifInvalid(aHandler, this);

    return TP.ignore(anOrigin, aSignal, handler, aPolicy);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('observe',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @name observe
     * @synopsis Causes notifications to a particular handler to start. The
     *     origin and signal combination define how this occurs. Using null for
     *     either value means "any" and sets up a generic observation. The
     *     policy is a "registration" policy that defines how the observation
     *     will be configured.
     * @param {Object|Array} anOrigin The originator(s) to be observed.
     * @param {TP.sig.Signal|Array} aSignal The signal(s) to observe.
     * @param {Object} aHandler The handler to notify.
     * @param {Function} aPolicy A "registration" policy that will define how
     *     the handler is registered.
     * @returns {Object} The registration object.
     * @todo
     */

    var type;

    type = TP.sys.getTypeByName('TP.sig.SignalMap');
    if (TP.isType(type)) {
        return TP.sig.SignalMap.$observe(
                            anOrigin, aSignal, aHandler, aPolicy);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('observe',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @name observe
     * @synopsis Causes notifications to a particular handler to start. The
     *     origin and signal combination define how this occurs. Using null for
     *     either value means "any" and sets up a generic observation. The
     *     policy is a "registration" policy that defines how the observation
     *     will be configured. If no handler is provided the receiver is assumed
     *     and registered.
     * @param {Object|Array} anOrigin The originator(s) to be observed.
     * @param {TP.sig.Signal|Array} aSignal The signal(s) to observe.
     * @param {Object} aHandler The handler to notify.
     * @param {Function} aPolicy A "registration" policy that will define how
     *     the handler is registered.
     * @returns {Object} The registration object.
     * @todo
     */

    var handler;

    handler = TP.ifInvalid(aHandler, this);

    return TP.observe(anOrigin, aSignal, handler, aPolicy);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('resume',
function(anOrigin, aSignal) {

    /**
     * @name resume
     * @synopsis Causes notifications matching the criteria to resume. Undoes
     *     the effect of having called TP.suspend().
     * @param {Object|Array} anOrigin The origin(s) for signals to resume.
     * @param {TP.sig.Signal|Array} aSignal The signal(s) to resume.
     * @returns {Object} The registration.
     * @todo
     */

    var type;

    type = TP.sys.getTypeByName('TP.sig.SignalMap');
    if (TP.isType(type)) {
        return TP.sig.SignalMap.$resume(anOrigin, aSignal);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('resume',
function(aSignal) {

    /**
     * @name resume
     * @synopsis Causes notifications of the signal provided to resume. Undoes
     *     the effect of having called suspend(). The origin being resumed is
     *     the receiver.
     * @param {TP.sig.Signal|Array} aSignal The signal(s) to resume.
     * @returns {Object} The registration.
     */

    //  re-enabling all notification
    if (TP.notValid(aSignal)) {
        this.$suspended = false;
    }

    return TP.resume(this, aSignal);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('suspend',
function(anOrigin, aSignal) {

    /**
     * @name suspend
     * @synopsis Causes notifications matching the criteria to pause. No
     *     registrations are removed but no signaling is performed until a
     *     TP.resume() is called.
     * @param {Object|Array} anOrigin The origin(s) to suspend.
     * @param {TP.sig.Signal|Array} aSignal The signal(s) to suspend.
     * @returns {Object} The registration.
     * @todo
     */

    var type;

    type = TP.sys.getTypeByName('TP.sig.SignalMap');
    if (TP.isType(type)) {
        return TP.sig.SignalMap.$suspend(anOrigin, aSignal);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('suspend',
function(aSignal) {

    /**
     * @name suspend
     * @synopsis Causes notifications of aSignal to pause from the receiver.
     *     Calling resume() with the same signal type will turn them back on.
     * @param {TP.sig.Signal|Array} aSignal The signal(s) to suspend.
     * @returns {Object} The registration.
     */

    //  turning off all notifications
    if (TP.notValid(aSignal)) {
        this.$suspended = true;
    }

    return TP.suspend(this, aSignal);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('defineHandler',
function(aHandlerName, aHandler, aPolicy) {
    var match,
        handler,
        policy,
        signal,
        origin,
        state,
        handlers,
        existing;

    // Most of this is about the name. It has to match our handler name pattern.
    match = TP.regex.ON_HANDLER_NAME.exec(aHandlerName);

    if (TP.notValid(match)) {
        return this.raise('InvalidHandlerName', aHandlerName);
    }

    policy = aPolicy;
    signal = match[1];
    origin = TP.ifEmpty(match[3], TP.ANY);
    state = TP.ifEmpty(match[5], TP.ANY);

    // Standard notification doesn't include state checks, so wrap the intended
    // handler here if state is being constrained and use that as the handler.
    if (state !== TP.ANY) {
        handler = function() {

            // TODO: replace false here with a state check. current app state
            // must match for the handler to be invoked.
            if (false) {
                return;
            }
            aHandler.apply(this, arguments);
        }.bind(this);
    } else {
        handler = aHandler;
    }

    // We track handlers locally on each object.
    if (TP.owns(this, '$$handlers')) {
        handlers = this.get('$$handlers');
    }

    if (TP.notValid(handlers)) {
        handlers = TP.hc();
        this.$set('$$handlers', handlers, false);
    } else {
        // Remove any prior observation. We only want one.
        existing = handlers.at(aHandlerName);
        if (TP.isValid(existing)) {
            TP.ignore(origin, signal, existing);
        }
    }

    // Each object only gets one handler per unique name.
    handlers.atPut(aHandlerName, handler);

    TP.observe(origin, signal, handler, policy);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getHandlers',
function() {

    /**
     * Returns a hash containing any handlers defined on the receiver. Note that
     * handler definitions are local to the receiver and are not inherited.
     * @return {TP.lang.Hash} The receiver's local handler dictionary.
     */

    // TODO: work on reflection aspect to let us find inherited handlers.
    return this.get('$$handlers');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('fireNextSignal',
function() {

    /**
     * @name fireNextSignal
     * @synopsis Activates (fires) the next signal in the signal queue.
     * @description This method is called on kernel finalization and by the
     *     signal call as it completes each signal, forming a kind of event loop
     *     which terminates when no pending signals exist.
     */

    var it;

    it = TP.sys.$signalQueue.shift();

    if (TP.notValid(it)) {
        return;
    }

    return TP.signal(it.at(0), it.at(1), it.at(2),
                        it.at(3), it.at(4));
});

//  ------------------------------------------------------------------------
//  SIGNALING ORIGINS
//  ------------------------------------------------------------------------

/**
 * Since the signaling system can take lists of origins and signals it's
 * necessary to provide a way to distinguish arrays passed as the actual origin
 * from arrays passed as a set of origins. The default is that any array passed
 * is assumed to be the actual origin. You must use the isOriginSet() method to
 * flag any array containing a list of origins prior to signaling with it.
 */

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('isOriginSet',
function(aFlag) {

    /**
     * @name isOriginSet
     * @synopsis Returns true if the receiver has been flagged as a signal
     *     origin set. If aFlag is provided it will set this value.
     * @returns {Boolean} Whether or not the receiving Array has been set to be
     *     an origin set.
     */

    if (TP.isDefined(aFlag)) {
        this.$isOriginSet = aFlag;
    }

    return this.$isOriginSet;
});

//  ------------------------------------------------------------------------
//  REFLECTION - PART II (PostPatch)
//  ------------------------------------------------------------------------

/**
 * TIBET, and in particular the TIBET IDE, relies on reflection of both type and
 * instance properties. The methods here support 'prototype-based'reflection by
 * tracking data and testing differences between a target object and an
 * appropriate prototype.
 */

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('$getInstPropertyScope',
function(aName) {

    /**
     * @name $getInstPropertyScope
     * @synopsis Returns the 'scope' of the named property.
     * @description Note that this version of this method is invoked for
     *     instances which are not types or prototypes, so this won't be used
     *     by TP.ObjectProto, TP.FunctionProto, or any of the prototypes created
     *     by TIBET.
     * @param {String} aName The property to check.
     * @returns {String} TP.INTRODUCED, TP.INHERITED, TP.OVERRIDDEN, TP.LOCAL
     */

    var proto,
        scope;

    proto = this.getPrototype();

    //  If the receiver and its prototype are the same object then we're looping
    //  back on ourselves near the top of the tree. In this case we have to
    //  "jump" past the prototype and check against TP.ObjectProto since we
    //  can't tell anything more from the inheritance chain from here.
    if (this === proto) {
        proto = TP.ObjectProto;
    }

    //  First check is does our prototype have this property or not? If not then
    //  it must be local to the current instance since we know we have it and
    //  it's not a DNU if we're in this routine.
    if (TP.notDefined(proto[aName]) || TP.$$isDNU(proto[aName])) {
        return TP.LOCAL;
    }

    //  at this stage we know:
    //      a) we have the slot,
    //      b) it's not a DNU,
    //      c) we're not looping between our prototype and ourselves.

    //  If we have our own value, we override since our prototype has a value
    //  which apparently isn't ours.
    if (TP.owns(this, aName)) {
        return TP.LOCAL;
    }

    //  So now we a) have a slot, b) that's not a DNU, c) that we inherit
    //  from our prototype...but does our prototype introduce it or inherit
    //  it from further up the chain?
    scope = proto.$getPrototypePropertyScope(aName);

    return scope;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('$getPrototypePropertyScope',
function(aName) {

    /**
     * @name $getPrototypePropertyScope
     * @synopsis Returns the 'scope' of the named property.
     * @description Note that this version of this method is invoked for
     *     objects which are used as prototypes.
     * @param {String} aName The property to check.
     * @returns {String} TP.INTRODUCED, TP.INHERITED, TP.OVERRIDDEN
     */

    //  The only options here are introduced, inherited or overridden since we
    //  act as a prototype and can't have a local definition per se.

    var proto,
        slot;

    //  The ultimate prototype, if this object has the value then it's
    //  "introduced" here.
    if (this === TP.ObjectProto) {
        return TP.INTRODUCED;
    }

    //  The other "special" prototype, particularly for native types. But
    //  here we have to be a bit smarter to maintain our illusion since we
    //  want to recognize that this object has two roles, one as an instance
    //  prototype and one as the location for Object type functionality.
    if (this === TP.FunctionProto) {
        if (TP.owns(this, aName)) {
            //  introduced or overridden based on TP.ObjectProto value
            if (TP.owns(TP.ObjectProto, aName)) {
                return TP.OVERRIDDEN;
            } else {
                //  Here's the tricky part, where we "introduce" this but
                //  want to deny that for "Type" functionality

                //  If it's a method we can check the track, if it's on the
                //  Type track it's really being "inherited" as if it were
                //  introduced on Object.
                if (TP.isMethod(slot = this[aName])) {
                    if (slot[TP.TRACK] === TP.TYPE_TRACK) {

                        //  as far as all native types (including Function)
                        //  are concerned we inherit this from Object...
                        return TP.INHERITED;
                    }
                }

                return TP.INTRODUCED;
            }
        }

        return TP.INHERITED;
    }

    //  some other prototype instance, either on a native type or a TIBET
    //  type...so we need to look at our own prototype to know if we
    //  inherit, introduce, or override this value
    proto = this.getPrototype();

    //  don't forget that some prototype chains loop and when that happens
    //  we have to switch to checking against TP.ObjectProto
    if (this === proto) {
        proto = TP.ObjectProto;
    }

    //  we're not the same as our prototype, so if it doesn't have the value
    //  then we're introducing it at this level
    if (TP.notDefined(proto[aName]) || TP.$$isDNU(proto[aName])) {
        return TP.INTRODUCED;
    }

    //  if we have our own value we override since our prototype has a value
    //  which apparently isn't ours
    if (TP.owns(this, aName)) {
        return TP.OVERRIDDEN;
    }

    return TP.INHERITED;
});

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('$getTypePropertyScope',
function(aName) {

    /**
     * @name $getTypePropertyScope
     * @synopsis Returns the 'scope' of the named property.
     * @description Note that this version of this method is invoked for
     *     function instances which are native types, meaning they are types
     *     created via native JavaScript semantics. These are special in that
     *     they have a unique inheritance chain they all inherit from the same
     *     instance, TP.FunctionProto.
     * @param {String} aName The property to check.
     * @returns {String} TP.INHERITED, TP.OVERRIDDEN, TP.LOCAL.
     */

    var proto;

    //  All type objects invoking this method live in JavaScript's flat
    //  'hierarchy' for types, meaning they all share TP.FunctionProto.
    proto = TP.FunctionProto;

    //  Next question is simply does the receiving Type has its own slot?
    if (TP.owns(this, aName)) {

        //  If the value is the same between TP.FunctionProto and ourself - we
        //  inherited this value.
        if (this[aName] === proto[aName]) {
            return TP.INHERITED;
        }

        //  The values were different... if TP.FunctionProto had a value,
        //  then we overrode this slot.
        if (TP.isDefined(proto[aName])) {
            return TP.OVERRIDDEN;
        }

        //  The value was different and the proto didn't have a slot named that,
        //  therefore, it's always 'introduced' (i.e. types don't inherit *on
        //  the type side* in regular JavaScript - they're always 'locally
        //  programmed' with their behavior). Note that they *do* inherit (from
        //  TP.FunctionProto) on the instance side.
        return TP.LOCAL;
    }

    return TP.INHERITED;
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('$getTypePropertyScope',
function(aName) {

    /**
     * @name $getTypePropertyScope
     * @synopsis Returns the 'scope' of the named property.
     * @description Note that this version of this method is invoked for TIBET
     *     type objects only; the native types will invoke the version on
     *     TP.FunctionProto. These objects are TIBET type objects, meaning they
     *     have the strange duality of being both a type and an instance in
     *     TIBET terms.
     * @param {String} aName The property to check.
     * @returns {String} TP.INTRODUCED, TP.INHERITED, TP.OVERRIDDEN, TP.LOCAL.
     */

    var proto,
        ancestor;

    //  start with proto for the "instance" to check for locals
    proto = this.getPrototype();

    //  First check is does our prototype have this property or not? If not
    //  then it must be local to the current type object since we know we have
    //  it and it's not a DNU if we're in this routine.
    if (TP.notDefined(proto[aName]) || TP.$$isDNU(proto[aName])) {
        return TP.LOCAL;
    }

    //  at this stage we know:
    //      a) we have the slot,
    //      b) it's not a DNU,
    //      c) we're not looping between our prototype and ourselves.

    //  If we have our own value we override since our prototype has a value
    //  which apparently isn't ours.
    if (TP.owns(this, aName)) {
        return TP.LOCAL;
    }

    ancestor = this.getSupertype();

    //  Any remaining checks have to compare between our prototype's value
    //  and our supertype's value for this property since TIBET types have
    //  a slightly modified lookup model.
    if (proto[aName] === ancestor[aName]) {
        return TP.INHERITED;
    } else {
        if (TP.isDefined(ancestor[aName])) {
            return TP.OVERRIDDEN;
        } else {
            return TP.INTRODUCED;
        }
    }
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getPropertyScope',
function(aName, skipChecks) {

    /**
     * @name getPropertyScope
     * @synopsis Returns the 'scope' of the named property. The scope returned
     *     will be one of the get*Interface() constants such as TP.DNU,
     *     TP.INTRODUCED, TP.INHERITED, TP.OVERRIDDEN, TP.LOCAL, TP.GLOBAL, or
     *     TP.NONE. Note that this method leverages a number of more primitive
     *     methods to help it discriminate relative to the various special
     *     objects in the system such as TP.ObjectProto etc.
     * @param {String} aName The property to check.
     * @param {Boolean} skipChecks Turns off checks for DNUs or globals, often
     *     used by get*Interface() when it knows the properties it's asking
     *     about have already been checked.
     * @returns {String} TP.DNU, TP.INTRODUCED, TP.INHERITED, TP.OVERRIDDEN,
     *     TP.LOCAL, TP.GLOBAL, or TP.NONE.
     * @todo
     */

    var flag;

    flag = TP.sys.shouldLogStack();
    TP.sys.shouldLogStack(false);

    try {
        if (TP.notTrue(skipChecks)) {
            //  ...do we even have this property?
            if (TP.notDefined(this[aName])) {
                return TP.NONE;
            }

            //  ...is it a DNU?
            if (TP.$$isDNU(this[aName])) {
                return TP.DNU;
            }
        }

        //  at this point we know:
        //      a) we have the property,
        //      b) it's not a DNU,
        //      c) it's not a global.

        //  the best thing to do now is to work polymorphically based on
        //  whether the receiver is a type, a prototype, or an instance...
        if (TP.isType(this)) {
            return this.$getTypePropertyScope(aName);
        } else if (TP.isPrototype(this)) {
            return this.$getPrototypePropertyScope(aName);
        } else {
            return this.$getInstPropertyScope(aName);
        }
    } catch (e) {
    } finally {
        TP.sys.shouldLogStack(flag);
    }
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('$getInterface',
function(aFilter) {

    /**
     * @name $getInterface
     * @synopsis Returns an array containing the keys of the receiver, filtered
     *     according to a filtering specification. The valid filtering specs are
     *     listed with TP.SLOT_FILTERS, filtered to match the desired subset of
     *     keys.
     * @param {Object|String} aFilter An object containing filter properties or
     *     a name of one of the keys registered under TP.SLOT_FILTERS. The
     *     default is 'unique_attributes'.
     * @returns {Array} An array containing matching slots.
     * @todo
     */

    var filter,
        params,
        attrs,
        methods,
        hidden,
        scope,
        public,
        unique,

        keys,
        key,
        it,

        propScope,

        proto;

    TP.stop('break.interface');

    //  next question is can we find the requested subset on the list?
    filter = TP.ifInvalid(aFilter, 'unique_attributes');

    if (TP.isString(filter)) {
        filter = filter.toLowerCase();

        if (TP.notValid(params = TP.SLOT_FILTERS[filter])) {
            TP.ifWarn() ?
                TP.warn('Invalid reflection filter: ' + filter,
                        TP.LOG) : 0;

            return TP.ac();
        }
    } else {
        params = filter;
    }

    //  grab the control flags we'll be using down below to drive our testing...
    attrs = TP.ifInvalid(params.attributes, true);
    methods = TP.ifInvalid(params.methods, false);
    hidden = TP.ifInvalid(params.hidden, false);
    scope = TP.ifInvalid(params.scope, TP.UNIQUE);

    //  Only necessary if 'hidden' is 'true' - then, if you want both, you have
    //  to specify this one too.
    public = TP.ifInvalid(params.public, false);

    //  if the filter is bogus we can just bail out
    if (!attrs && !methods) {
        TP.ifWarn() ?
            TP.warn('Invalid reflection filter: ' + filter,
                    TP.LOG) : 0;

        return TP.ac();
    }

    unique = (scope === TP.UNIQUE);
    if (!unique) {
        //  warn for any non-unique scans. when it's a unique scan we can
        //  leverage hasOwnProperty to avoid too much overhead, otherwise we
        //  consider this a performance warning issue.
        TP.ifWarn(TP.sys.cfg('log.scans')) ?
            TP.warn('Scanning ' + filter + ' on ' + this,
                    TP.LOG) : 0;
    }

    //  set up a proto object for filtering methods
    if (TP.isType(this) || TP.isPrototype(this)) {
        proto = this.getPrototype();
    } else {
        proto = this.getInstPrototype();
    }

    keys = TP.ac();

    /* jshint forin:true */
    for (key in this) {
        //  private/hidden can be masked off quickly
        if (TP.regex.PRIVATE_SLOT.test(key)) {
            if (!hidden) {
                continue;
            }
        } else {
            //  forcing to show hidden but it isn't and we're not being asked to
            //  include both hidden and public, then move on.
            if (hidden && !public) {
                continue;
            }
        }

        //  ignore internals
        if (TP.regex.INTERNAL_SLOT.test(key)) {
            continue;
        }

        try {
            if (unique && !this.hasOwnProperty(key)) {
                continue;
            }
            it = this[key];
        } catch (e) {
            if (TP.isNativeType(this)) {
                //  some objects just don't like to be touched :)
                break;
            }
            continue;
        }

        //  is it real?
        if (TP.notDefined(it)) {
            continue;
        }

        //  most common failure modes for slot listings
        if (TP.$$isDNU(it)) {
            continue;
        }

        //  is it a global/window slot?
        try {
            if ((window[key] === it) && (TP.ObjectProto[key] !== it)) {
                continue;
            }
        } catch (e) {
            continue;
        }

        //  if methods are disallowed we can test for that next
        if (!methods && TP.isMethod(it)) {
            continue;
        }

        //  when attributes aren't allowed we can ensure it's a method
        if (!attrs && !TP.isMethod(it)) {
            continue;
        }

        //  so it's the right "kind" of thing, an attribute or method that
        //  is/isn't hidden as desired...now we need to know if it fits the
        //  desired scope requirements
        if (scope !== TP.ALL) {
            //  check scope, but skip over the checks
            propScope = this.getPropertyScope(key, true);
            if (scope === TP.UNIQUE) {
                //  looking for unique (introduced, local, overridden)
                if ((propScope !== TP.INTRODUCED) &&
                    (propScope !== TP.LOCAL) &&
                    (propScope !== TP.OVERRIDDEN)) {
                    //  must be a dnu, none, global, or inherited
                    continue;
                }
            } else if (scope !== propScope) {
                continue;
            }
        }

        //  still valid? add it to the list
        keys.push(key);
    }
    /* jshint forin:false */

    return keys;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getInterface',
function(aFilter) {

    /**
     * @name getInterface
     * @synopsis Returns a list of the 'slots' on the receiver. This is what you
     *     get if you use for/in on an array rather than for() -- the properties
     *     rather than the indexes of content. See $getInterface for more
     *     information.
     * @param {Object|String} aFilter An object containing filter properties or
     *     a name of one of the keys registered under TP.SLOT_FILTERS.
     * @returns {Array} Array of slot names matching the filter.
     * @todo
     */

    var inheriteds,
        locals,

        result,

        params,
        newParams,

        overriddens;

    //  If this is a type or a non-prototype instance, we get the values that we
    //  'inherit' up the tree (but dependent on the filter that's handed in).
    if (TP.isType(this)) {
        inheriteds = this.getTypeInterface(aFilter);
    } else if (TP.isPrototype(this)) {
        //  This is a prototype object - just return the values from it's local
        //  interface.
        return this.getLocalInterface(aFilter);
    } else {
        inheriteds = this.getInstInterface(aFilter);
    }

    //  Then we grab any 'local' values on this object (again dependent on the
    //  filter).
    locals = this.getLocalInterface(aFilter);

    //  Add those to the inherited values and unique them.
    result = inheriteds.addAll(locals).unique();

    //  Check to see if we're also supposed to get TP.INHERITED slots - we'll
    //  need to get any overridden slots and make sure they get removed. This is
    //  only needed if the receiver is a native type or TP.lang.RootObject,
    //  because of the way that meta-methods get added directly to these objects
    //  prototypes.
    if (TP.isNativeType(this) || this === TP.lang.RootObject) {
        if (TP.isString(aFilter)) {
            params = TP.SLOT_FILTERS[aFilter];
        } else {
            params = aFilter;
        }

        if (TP.isValid(params) && params.scope === TP.INHERITED) {

                newParams = {};

                //  We need to query locally for the overridden slots (but with
                //  all other parameters intact) so that we can remove them from
                //  the list of 'inherited'.
                newParams.hidden = params.hidden;
                newParams.methods = params.methods;
                newParams.public = params.public;
                newParams.scope = TP.OVERRIDDEN;

                overriddens = this.getLocalInterface(newParams);
                result.removeAll(overriddens);
        }
    }

    return result;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getInstInterface',
function(aFilter) {

    /**
     * @name getInstInterface
     * @synopsis Returns the slot names found on instances of the receiver which
     *     match the filter provided.
     * @param {Object|String} aFilter An object containing filter properties or
     *     a name of one of the keys registered under TP.SLOT_FILTERS.
     * @returns {Array} Array of slot names matching the filter.
     * @todo
     */

    var type;

    if (TP.isType(this)) {
        return this.getInstPrototype().$getInterface(aFilter);
    } else if (TP.isPrototype(this)) {
        if (/\$\$Type/.test(TP.name(this))) {
            return TP.ac();
        } else {
            return this.$getInterface(aFilter);
        }
    }

    type = this.getType();
    if (this !== type) {
        return type.getInstInterface(aFilter);
    }

    return TP.ac();
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getLocalInterface',
function(aFilter) {

    /**
     * @name getLocalInterface
     * @synopsis Returns the slot names found directly on the receiver which
     *     match the filter provided.
     * @param {Object|String} aFilter An object containing filter properties or
     *     a name of one of the keys registered under TP.SLOT_FILTERS.
     * @returns {Array} Array of slot names matching the filter.
     * @todo
     */

    return this.$getInterface(aFilter);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getTypeInterface',
function(aFilter) {

    /**
     * @name getTypeInterface
     * @synopsis Returns the slot names found on the receiver's Type which match
     *     the filter provided.
     * @param {Object|String} aFilter An object containing filter properties or
     *     a name of one of the keys registered under TP.SLOT_FILTERS.
     * @returns {Array} Array of slot names matching the filter.
     * @todo
     */

    var type;

    if (TP.isType(this)) {
        return this.getPrototype().$getInterface(aFilter);
    } else if (TP.isPrototype(this)) {
        if (/\$\$Type/.test(TP.name(this))) {
            return this.$getInterface(aFilter);
        } else {
            return TP.ac();
        }
    }

    type = this.getType();
    if (this !== type) {
        return type.getTypeInterface(aFilter);
    }

    return TP.ac();
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getKeys',
function(aFilterName) {

    /**
     * @name getKeys
     * @synopsis Returns the set of keys requested for the receiver. The filter
     *     provided should be one of the String keys for get*Interface()
     *     filtering.
     * @param {String} aFilterName A get*Interface() filter spec.
     * @returns {Array} An array containing the keys of the receiver.
     * @todo
     */

    //  non-mutable things like strings etc. can't have had new keys placed
    //  on them so only process mutables.
    if (TP.isMutable(this)) {
        //  If no specific filter was supplied, then we just return the
        //  value of executing TP.$getOwnKeys() on the receiver.
        if (TP.isEmpty(aFilterName)) {
            return TP.$getOwnKeys(this);
        } else {
            return this.getInterface(aFilterName);
        }
    }

    return TP.ac();
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('getKeys',
function(aFilterName, includeUndefined) {

    /**
     * @name getKeys
     * @synopsis Top-level key-getter for Array instances. Returns the 'indexes'
     *     or 'keys' of the array. This version returns all keys. An interesting
     *     alternative is only returning keys whose values are non-null (see
     *     TP.core.Mask.getMasks() for an example).
     * @param {String} aFilterName Ignored.
     * @param {Boolean} includeUndefined Should 'sparse' slots be included?
     * @returns {Array} An array containing the keys of the receiver.
     * @todo
     */

    var includeUndef,

        tmparr,
        i;

    includeUndef = TP.ifInvalid(includeUndefined, false);

    tmparr = TP.ac();
    for (i = 0; i < this.length; i++) {
        if (!includeUndef && TP.notDefined(this[i])) {
            continue;
        }

        tmparr.push(i);
    }

    return tmparr.concat(TP.sys.$arraykeys);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('getKeys',
function() {

    /**
     * @name getKeys
     * @synopsis Returns the set of keys which represent attribute values for
     *     the receiver. This is supported on String to allow it to behave as a
     *     collection of characters.
     * @returns {Array} An array containing the keys of the receiver.
     * @todo
     */

    var i,
        tmparr;

    tmparr = TP.ac();
    for (i = 0; i < this.length; i++) {
        tmparr.push(i);
    }

    return tmparr.concat(TP.sys.$stringkeys);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getSize',
function(aFilterName) {

    /**
     * @name getSize
     * @synopsis Returns the size of the receiver. This is thought of as the
     *     number of attributes the receiver contains unless a different filter
     *     is provided.
     * @param {String} aFilterName A get*Interface() filter.
     * @returns {Number} The receiver's size.
     */

    var k,
        res;

    k = this.getKeys(aFilterName);
    res = k.getSize();

    return res;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('getSize',
function() {

    /**
     * @name getSize
     * @synopsis Returns the size of the receiver. For simple strings this is
     *     the length.
     * @returns {Number} The receiver's size.
     */

    return this.length;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getValues',
function(aFilterName) {

    /**
     * @name getValues
     * @synopsis Returns an array containing the values for the objects'
     *     attributes. The filter provided determines which set of keys is used
     *     to acquire the values.
     * @param {String} aFilterName A get*Interface() filter.
     * @returns {Array} An array of the values for the receiver's keys.
     * @todo
     */

    var arr,
        i,
        k;

    arr = TP.ac();
    k = this.getKeys(aFilterName);

    for (i = 0; i < k.getSize(); i++) {
        arr.push(this.at(k.at(i)));
    }

    return arr;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('getValues',
function() {

    /**
     * @name getValues
     * @synopsis Top-level value-getter. For Arrays the values are contained in
     *     the array itself.
     * @returns {Array} An array containing the receiver's values.
     * @todo
     */

    return this;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('getValues',
function() {

    /**
     * @name getValues
     * @synopsis Returns an array containing the characters in the receiver.
     * @returns {Array} An array of characters.
     * @todo
     */

    return this.split('');
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('hasKey',
function(aKey) {

    /**
     * @name hasKey
     * @synopsis Returns true if aKey has been defined for the receiver. This is
     *     analagous to hasOwnProperty for most non-collection types but is
     *     overridden by collections.
     * @param {String} aKey The string key to test for.
     * @returns {Boolean} True if the key is defined.
     */

    return this.hasOwnProperty(aKey);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('hasKey',
function(aKey, includeUndefined) {

    /**
     * @name hasKey
     * @synopsis Returns true if aKey has been defined for the receiver. For an
     *     array there are a couple of ways to look at this. First is whether
     *     the Array's length is greater than the key (which should be a
     *     number). Second is whether the value at that key (if < length) is
     *     undefined or not.
     * @param {Number} aKey The numerical index (key) to test.
     * @param {Boolean} includeUndefined Should 'sparse' slots be included?
     * @returns {Boolean} True if the key is defined.
     * @todo
     */

    var includeUndef;

    if (!TP.isNumber(aKey)) {
        this.raise('TP.sig.InvalidKey');

        return false;
    }

    if (this.length < aKey) {
        return false;
    }

    includeUndef = TP.ifInvalid(includeUndefined, false);
    if (includeUndef) {
        return true;
    }

    return TP.isDefined(this[aKey]);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('inherits',
function(aName) {

    /**
     * @name inherits
     * @synopsis Returns true if the name represents an inherited property of
     *     the receiver.
     * @param {String} aName The property name to check.
     * @returns {Boolean} Whether or not the property is an inherited property.
     */

    return this.getPropertyScope(aName) === TP.INHERITED;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('inheritsFromIntroducer',
function(aName) {

    /**
     * @name inheritsFromIntroducer
     * @synopsis Returns true if the name represents an inherited property of
     *     the receiver that isn't altered between the original introducer and
     *     the receiver.
     * @param {String} aName The property name to check.
     * @returns {Boolean} Whether or not the property is an inherited property
     *     that has the same value as the object that introduced it.
     */

    var res,
        scope,
        protos;

    scope = this.getPropertyScope(aName);
    if (scope !== TP.INHERITED) {
        return false;
    }

    protos = this.getPrototypes();
    res = protos.detect(
        function(item) {

            return item.getPropertyScope(aName) === TP.OVERRIDDEN;
        });

    //  if no overrides were found the answer is 'true'
    return TP.notValid(res);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('introduces',
function(aName) {

    /**
     * @name introduces
     * @synopsis Returns true if the name represents an introduced property of
     *     the receiver.
     * @param {String} aName The property name to check.
     * @returns {Boolean} Whether or not the property was introduced by the
     *     receiver.
     */

    return this.getPropertyScope(aName) === TP.INTRODUCED;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('overrides',
function(aName) {

    /**
     * @name overrides
     * @synopsis Returns true if the name represents an overridden property of
     *     the receiver.
     * @param {String} aName The property name to check.
     * @returns {Boolean} Whether or not the property was overridden by the
     *     receiver.
     */

    return this.getPropertyScope(aName) === TP.OVERRIDDEN;
});

//  ------------------------------------------------------------------------
//  ORDERED PAIRS
//  ------------------------------------------------------------------------

/**
 * TIBET's hash operation and many other operations which convert between
 * objects and arrays make use of what we refer to as ordered pairs. These are
 * analogous to Smalltalk's Association type. The first() item in an ordered
 * pair is the key while the last() item is the value at that key. When
 * operations are performed on objects used as hashes the individual items
 * being iterated over are actually ordered pairs.
 * @todo
 */

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('$$isPair',
function() {

    /**
     * @name $$isPair
     * @synopsis Returns true if the object is considered an ordered pair.
     *     Objects (and TP.lang.Hashes) are never considered ordered pairs.
     * @returns {Boolean} Whether or not the receiver is considered to be an
     *     ordered pair.
     */

    return false;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('$$isPair',
function() {

    /**
     * @name $$isPair
     * @synopsis Returns true if the receiver can be thought of as an ordered
     *     pair.
     * @description For arrays an ordered pair is a two-element array, however
     *     an array whose 'key' i.e. the first() element is null will not be
     *     considered a valid pair.
     * @returns {Boolean} Whether or not the receiver is considered to be an
     *     ordered pair.
     */

    return (this.getSize() === 2) && TP.isValid(this.at(0));
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('first',
function(aNumber) {

    /**
     * @name first
     * @synopsis Returns the first N items from the receiver, where N defaults
     *     to 1.
     * @description This method only returns consistent results on ordered
     *     collections, but it should always successfully return N items if
     *     they're available.
     * @param {Number} aNumber The number of items to return. When N is greater
     *     than 1 the return value is a new array.
     * @returns {Object} When N is 1 the result is an array of length 2 with key
     *     and value in positions 0 and 1. When N is greater than 1 the return
     *     value is an array containing N ordered pairs of this form.
     * @todo
     */

    //  work from item set when more than one item is being requested
    if (TP.isNumber(aNumber) && aNumber > 1) {
        return this.getItems().first(aNumber);
    }

    //  terminate search after finding one item of any kind
    return this.detect(TP.RETURN_TRUE);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('first',
function(aNumber) {

    /**
     * @name first
     * @synopsis Returns the first N items of the receiver, where N defaults to
     *     1.
     * @param {Number} aNumber The number of items to return. When N is greater
     *     than 1 the return value is a new array.
     * @raises TP.sig.InvalidIndex
     * @returns {Object} The first N items in this array.
     * @todo
     */

    this.$sortIfNeeded();

    if (TP.isNumber(aNumber) && aNumber > 1) {
        return this.slice(0, aNumber);
    }

    return (this.length > 0) ? this.at(0) : null;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('first',
function(aNumber) {

    /**
     * @name first
     * @synopsis Returns the first N characters of the receiver, where N
     *     defaults to 1.
     * @param {Number} aNumber The number of characters to return. When N is
     *     greater than 1 the return value is a string with that length (if
     *     enough characters are available).
     * @returns {Object} The first N characters in the string.
     * @todo
     */

    if (TP.isNumber(aNumber) && aNumber > 1) {
        return this.slice(0, aNumber);
    }

    return (this.length > 0) ? this.charAt(0) : null;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('last',
function(aNumber) {

    /**
     * @name last
     * @synopsis Returns the last N items from the receiver, where N defaults to
     *     1.
     * @description This method only returns consistent results on ordered
     *     collections, but it should always successfully return N items if
     *     they're available.
     * @param {Number} aNumber The number of items to return. When N is greater
     *     than 1 the return value is a new array.
     * @returns {Object} When N is 1 the result is an array of length 2 with key
     *     and value in positions 0 and 1. When N is greater than 1 the return
     *     value is an array containing N ordered pairs of this form.
     * @todo
     */

    //  work from item set when more than one item is being requested
    if (TP.isNumber(aNumber) && aNumber > 1) {
        return this.getItems().last(aNumber);
    }

    //  terminate search after finding one item of any kind
    return this.detect(TP.RETURN_TRUE, null, true);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('last',
function(aNumber) {

    /**
     * @name last
     * @synopsis Returns the last N items of the receiver, where N defaults to
     *     1.
     * @param {Number} aNumber The number of items to return. When N is greater
     *     than 1 the return value is a new array.
     * @raises TP.sig.InvalidIndex
     * @returns {Object} The last N items in this array.
     * @todo
     */

    this.$sortIfNeeded();

    if (TP.isNumber(aNumber) && aNumber > 1) {
        return this.slice(this.length - aNumber);
    }

    return (this.length > 0) ? this.at(this.length - 1) : null;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('last',
function(aNumber) {

    /**
     * @name last
     * @synopsis Returns the last N characters of the receiver, where N defaults
     *     to 1.
     * @param {Number} aNumber The number of characters to return. When N is
     *     greater than 1 the return value is a string with that length (if
     *     enough characters are available).
     * @returns {Object} The last N characters in the string.
     * @todo
     */

    if (TP.isNumber(aNumber) && aNumber > 1) {
        return this.slice(this.length - aNumber);
    }

    return (this.length > 0) ? this.at(this.length - 1) : null;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getPairs',
function(aSelectFunction) {

    /**
     * @name getPairs
     * @param {Function} aSelectFunction A function used to select items that
     *     will be returned. Each item is passed to this function and if the
     *     function returns true the item is included in the result.
     * @raises TP.sig.InvalidPairRequest
     * @returns {Array} The array of ordered pairs.
     * @asbstract Returns an array of ordered pairs generated from the receiver.
     *     The individual pairs are [key,value] arrays where the keys are
     *     filtered using the optional function provided.
     * @todo
     */

    //  if we can provide keys and do an 'at' then we can get pairs
    if (!TP.canInvoke(this, ['at', 'getKeys'])) {
        return this.raise('TP.sig.InvalidPairRequest');
    }

    //  the work is easy for key/value objects
    return this.select(aSelectFunction || TP.RETURN_TRUE);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('getPairs',
function(aSelectFunction) {

    /**
     * @name getPairs
     * @synopsis Returns the ordered pairs contained in the receiver, or implied
     *     by the receiver's key/value content. For example, an array of the
     *     form [['a',1], ['b',2]] will simply return its content wrapped in a
     *     new container, while an array of the form ['a','b','c'] will return
     *     [['a','b'],['c',null]]. This is the inverse operation a flatten would
     *     have had on the results of a getPairs on a TP.lang.Hash.
     * @description To allow Arrays to serve as a form of interchange format
     *     between collections of various types they have special behavior when
     *     it comes to managing "items" and "pairs". In particular, although the
     *     array's "keys" could be thought of as its numeric indexes the
     *     getPairs operation doesn't think in those terms, instead focusing on
     *     content rather than ordering information.
     * @param {Function} aSelectFunction A function used to select items that
     *     will be returned. Each item is passed to this function and if the
     *     function returns true the item is included in the result.
     * @returns {Array} A new array containing the pairs.
     * @todo
     */

    var tmparr,

        func,

        len,
        i,

        item;

    tmparr = TP.ac();

    if (TP.isCallable(aSelectFunction)) {
        func = aSelectFunction;
    }

    len = this.getSize();

    //  deal with case where array appears to contain a list of ordered
    //  pairs. in those cases we collect all objects that are pairs
    if ((len > 0) && TP.isPair(this.first())) {
        for (i = 0; i < len; i++) {
            if (TP.isValid(this.at(i)) && TP.isPair(this.at(i))) {
                //  if we've got a filtering function and it doesn't return
                //  true then we'll skip this entry
                if (func && !func(this.at(i))) {
                    continue;
                }

                tmparr.push(this.at(i));
            }
        }

        return tmparr;
    }

    //  deal with assembly of ordered pairs from key/value pairs so we
    //  construct a hash form of the receiver's content
    for (i = 0; i + 1 < len; i += 2) {
        item = TP.ac(this.at(i), this.at(i + 1));

        //  if we've got a filtering function and it doesn't return
        //  true then we'll skip this entry
        if (func && !func(item)) {
            continue;
        }

        tmparr.push(item);
    }

    //  deal with any straggler...
    if (len.isOdd()) {
        tmparr.push(TP.ac(this.last(), null));
    }

    return tmparr;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('getPairs',
function(aSelectFunction) {

    /**
     * @name getPairs
     * @description For a String this is an invalid operation and an
     *     TP.sig.InvalidPairRequest exception will be raised.
     * @param {Function} aSelectFunction A function used to select items that
     *     will be returned. Each item is passed to this function and if the
     *     function returns true the item is included in the result.
     * @raises TP.sig.InvalidPairRequest
     * @asbstract Returns an array of ordered pairs generated from the receiver.
     * @todo
     */

    return this.raise('TP.sig.InvalidPairRequest');
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getKVPairs',
function(aSelectFunction) {

    /**
     * @name getKVPairs
     * @param {Function} aSelectFunction A function used to select items that
     *     will be returned. Each item is passed to this function and if the
     *     function returns true the item is included in the result.
     * @raises TP.sig.InvalidPairRequest
     * @returns {Array} The array of ordered pairs.
     * @asbstract Returns an array of ordered pairs generated from the receiver.
     *     The individual pairs are [key,value] arrays where the keys are
     *     filtered using the optional function provided.
     * @todo
     */

    //  if we can provide keys and do an 'at' then we can get pairs
    if (!TP.canInvoke(this, ['at', 'getKeys'])) {
        return this.raise('TP.sig.InvalidPairRequest');
    }

    //  the work is easy for key/value objects
    return this.select(aSelectFunction || TP.RETURN_TRUE);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('getKVPairs',
function(aSelectFunction) {

    /**
     * @name getKVPairs
     * @synopsis Returns the key/value pairs contained in the receiver.
     * @description For Arrays this returns an array of ordered pairs where each
     *     ordered pair consists of a numerical index and the value at that
     *     index. This is a more "inspection string" format used specifically
     *     for dumping key/value data.
     * @param {Function} aSelectFunction A function used to select items that
     *     will be returned. Each item is passed to this function and if the
     *     function returns true the item is included in the result.
     * @returns {Array} A new array containing the pairs.
     * @todo
     */

    var tmparr,
        func,
        len,
        i,
        item;

    tmparr = TP.ac();

    if (TP.isCallable(aSelectFunction)) {
        func = aSelectFunction;
    }

    len = this.getSize();
    for (i = 0; i < len; i++) {
        item = TP.ac(i, this.at(i));

        //  if we've got a filtering function and it doesn't return
        //  true then we'll skip this entry
        if (func && !func(item)) {
            continue;
        }

        tmparr.push(item);
    }

    return tmparr;
});

//  ------------------------------------------------------------------------

TP.StringProto.getKVPairs = TP.StringProto.getPairs;

//  ------------------------------------------------------------------------
//  Inspection
//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('asDumpString',
function() {

    /**
     * @name asDumpString
     * @synopsis Returns the receiver as a string suitable for use in log
     *     output.
     * @returns {String} The receiver's dump String representation.
     */

    var arr,

        keys,
        len,
        i,

        str;

    if (TP.isWindow(this)) {
         return TP.tname(this) + ' :: ' + TP.windowAsString(this);
    }

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asDumpString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    //  NB: For 'Object', we put this in a try...catch since some native Objects
    //  (i.e. XHR objects) don't like to have slots placed on them.
    try {
        this.$$format_asDumpString = true;
    }
    catch (e) {
    }

    /* jshint -W009 */
    arr = new Array();
    /* jshint +W009 */

    try {
        keys = TP.$getOwnKeys(this);
        len = keys.length;

        for (i = 0; i < len; i++) {
            arr.push(keys[i] + ': ' + TP.dump(this[keys[i]]));
        }

        str = '{' + arr.join(', ') + '}';
    } catch (e) {
        str = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    try {
        delete this.$$format_asDumpString;
    }
    catch (e) {
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('asInspectString',
function() {

    /**
     * @name asInspectString
     * @synopsis Returns a string representation of the receiver which is
     *     suitable for use in inspecting the keys, values, and other relevant
     *     information of the receiver.
     * @returns {String}
     */

    var keys,
        len,
        i,
        result;

    //  non-mutables like boolean, number, etc. can just report type/value
    if (!TP.isMutable(this)) {
        return this.getTypeName() + '::' + TP.str(this);
    }

    result = TP.ac();
    keys = TP.keys(this);

    if (TP.isEmpty(keys)) {
        return this.getTypeName() + '::' + TP.str(this);
    }

    if (TP.isNumber(keys[0])) {
        keys.sort(TP.NUMERIC_SORT);
    } else {
        keys.sort();
    }

    len = keys.getSize();
    for (i = 0; i < len; i++) {
        //  collection keys are content, not "properties" so when they
        //  contain methods we probably want to see them (for reflection
        //  methods etc) but when not a collection the keys are property
        //  names so we want to filter methods from that output.
        if (!TP.isCollection(this) && TP.isMethod(this.at(keys.at(i)))) {
            continue;
        }

        result.push(TP.str(keys.at(i)) + ' => ' + TP.val(this, keys.at(i)));
    }

    if (TP.isNode(this) && !TP.isDocument(this)) {
        result.push('tag', ' =>', TP.nodeAsString(this, false, true));
    }

    return this.getTypeName() + '::' + '\n' + result.join('\n');
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('asPrettyString',
function() {

    /**
     * @name asPrettyString
     * @synopsis Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} The receiver's 'pretty print' String representation.
     */

    var arr,

        keys,
        len,
        i,

        str;

    if (TP.isWindow(this)) {
         return TP.tname(this) + ' :: ' + TP.windowAsString(this);
    }

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asPrettyString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    //  NB: For 'Object', we put this in a try...catch since some native Objects
    //  (i.e. XHR objects) don't like to have slots placed on them.
    try {
        this.$$format_asPrettyString = true;
    }
    catch (e) {
    }

    /* jshint -W009 */
    arr = new Array();
    /* jshint +W009 */

    try {
        keys = TP.$getOwnKeys(this);
        len = keys.length;

        for (i = 0; i < len; i++) {
              arr.push(
                TP.join('<dt class="pretty key">', keys[i], '<\/dt>',
                        '<dd class="pretty value">',
                            TP.pretty(this[keys[i]]),
                        '<\/dd>'));
        }

        str = '<dl class="pretty">' + arr.join(', ') + '<\/dl>';
    } catch (e) {
        str = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    try {
        delete this.$$format_asPrettyString;
    }
    catch (e) {
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('asRecursionString',
function() {

    /**
     * @name asRecursionString
     * @synopsis Returns a string representation of the receiver which is used
     *     when the receiver is encountered in a circularly referenced manner
     *     during the production of some sort of formatted String
     *     representation.
     * @returns {String}
     */

    return 'Recursion of: ' + this.getTypeName() + ' :: ' + this.getID();
});

//  ------------------------------------------------------------------------

//  Grab the old inspect string function that was installed as a meta method
var oldInspectString = TP.FunctionProto.asInspectString;
TP.FunctionProto.defineMethod('asInspectString',
function() {

    /**
     * @name asInspectString
     * @synopsis Returns a string representation of the receiver which is
     *     suitable for use in inspecting the keys, values, and other relevant
     *     information of the receiver.
     * @returns {String}
     */

    if (TP.isType(this)) {
        this.asInspectString = oldInspectString;

        return this.asInspectString();
    }

    return this.getTypeName() + '::' + '\n' + this.asString();
});

//  ------------------------------------------------------------------------
//  NOTIFICATION - PART II
//  ------------------------------------------------------------------------

/**
 * More signaling support. In particular, the working versions of the change
 * notification methods.
 * @todo
 */

//  ------------------------------------------------------------------------

var func;

TP.defineMetaInstMethod('$changed',
func = function(anAspect, anAction, aDescription) {

    /**
     * @name $changed
     * @synopsis Notifies observers that some aspect of the receiver has
     *     changed. The fundamental data-driven dependency method.
     * @description If 'anAspect' is provided then the signal fired will be
     *     'aspectChange' where 'aspect' is replaced with the title-case aspect
     *     value. For example, if the aspect is 'lastname' the signal will be:
     *
     *     LastnameChange
     *
     *     This allows observers to be very discriminating in their
     *     observations...down to a specific slot on an object rather than the
     *     entire object. When the aspect is a number the signal name is
     *     prefixed with 'Index' so an aspect of 1 would result in an
     *     Index1Change signal. This signal is handled as a special instance of
     *     IndexChange.
     *
     *     NOTE: if the receiver's shouldSignalChange() method returns false
     *     this method won't fire a signal. This helps to avoid signaling when
     *     no listeners are present. See the shouldSignalChange() method for
     *     more information. Observation of an object for any signal name
     *     containing 'Change' will activate this flag.
     * @param {String} anAspect The aspect of the receiver that changed. This is
     *     usually an attribute name.
     * @param {String} anAction The action which caused the change. This usually
     *     'add', 'remove', etc.
     * @param {TP.lang.Hash} aDescription A hash describing details of the
     *     change.
     * @returns {Object} The receiver.
     * @signals Change
     * @todo
     */

    var sig,
        asp,
        desc;

    //  If this method is invoked before signaling is ready then exit.
    if (!TP.sys.hasInitialized()) {
        return;
    }

    //  NB: For new objects, this relies on 'undefined' being a 'falsey' value.
    //  We don't normally do this in TIBET, but this method is used heavily and
    //  is a hotspot.
    if (!this.shouldSignalChange()) {
        return;
    }

    //  Keep this after the test above to keep overhead down.
    TP.stop('break.change');

    //  Build up the signal name we'll be firing.
    sig = 'Change';
    asp = TP.ifKeyInvalid(aDescription, 'aspect', anAspect) || 'value';

    if (asp === 'value') {
        sig = 'TP.sig.ValueChange';
    } else {
        sig = asp.toString().asStartUpper() + sig;
    }

    //  Convert nChanged to IndexNChanged signals.
    if (/^[0-9]+/.test(sig)) {
        sig = 'Index' + sig;
    }

    //  Build up a standard form for the description hash.
    desc = TP.isValid(aDescription) ? aDescription : TP.hc();
    if (!TP.canInvoke(desc, 'atPutIfAbsent')) {
        this.raise('TP.sig.InvalidParameter',
                    'Description not a collection.');

        return;
    }
    desc.atPutIfAbsent('aspect', asp);
    desc.atPutIfAbsent('action', anAction || TP.UPDATE);
    desc.atPutIfAbsent('target', this);

    //  Note that we force the firing policy here. This allows observers of a
    //  generic Change to see 'aspect'Change notifications, even if those
    //  'aspect'Change signals haven't been defined as being subtypes of Change
    //  (although we also supply 'TP.sig.Change' as the default signal type here
    //  so that undefined aspect signals will use that type.
    TP.signal(this, sig, desc, TP.INHERITANCE_FIRING, 'TP.sig.Change');

    return this;
});

TP.$changed = func;
TP.sys.$changed = func;

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('changed',
func = function(anAspect, anAction, aDescription) {

    /**
     * @name changed
     * @synopsis Notifies observers that some aspect of the receiver has
     *     changed. The fundamental data-driven dependency method.
     * @description If 'anAspect' is provided then the signal fired will be
     *     'aspectChange' where 'aspect' is replaced with the title-case aspect
     *     value. For example, if the aspect is 'lastname' the signal will be:
     *
     *     LastnameChange
     *
     *     This allows observers to be very discriminating in their
     *     observations...down to a specific slot on an object rather than the
     *     entire object. When the aspect is a number the signal name is
     *     prefixed with 'Index' so an aspect of 1 would result in an
     *     Index1Change signal.
     *
     *     NOTE: if the receiver's shouldSignalChange() method returns false
     *     this method won't fire a signal. This helps to avoid signaling when
     *     no listeners are present. See the shouldSignalChange() method for
     *     more information. Observation of an object for any signal name
     *     containing 'Change' will activate this flag.
     * @param {String} anAspect The aspect of the receiver that changed. This is
     *     usually an attribute name.
     * @param {String} anAction The action which caused the change. This usually
     *     'add', 'remove', etc.
     * @param {TP.lang.Hash} aDescription A hash describing details of the
     *     change.
     * @returns {Object} The receiver.
     * @signals Change
     * @todo
     */

    return this.$changed(anAspect, anAction, aDescription);
});

TP.changed = func;
TP.sys.changed = func;

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('changed',
function(anAspect, anAction, aDescription) {

    /**
     * @name changed
     * @synopsis Notifies observers that some aspect of the receiver has
     *     changed. The fundamental data-driven dependency method.
     * @description If 'anAspect' is provided then the signal fired will be
     *     'aspectChange' where 'aspect' is replaced with the title-case aspect
     *     value. For example, if the aspect is 'lastname' the signal will be:
     *
     *     LastnameChange
     *
     *     This allows observers to be very discriminating in their
     *     observations...down to a specific slot on an object rather than the
     *     entire object. When the aspect is a number the signal name is
     *     prefixed with "Index" so an aspect of 1 would result in an
     *     Index1Change signal.
     * @param {String} anAspect The aspect of the receiver that changed. This is
     *     usually an attribute name.
     * @param {String} anAction The action which caused the change. This usually
     *     'add', 'remove', etc.
     * @param {TP.lang.Hash} aDescription A hash describing details of the
     *     change.
     * @returns {Array} The receiver.
     * @signals Change
     * @todo
     */

    //  might need to sort on next get()
    this.$needsSort = true;

    return this.$changed(anAspect, anAction, aDescription);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('changed',
function(anAspect, anAction, aDescription) {

    /**
     * @name changed
     * @synopsis Uses the receiving string as a ID and constructs an appropriate
     *     Change notification signal for that ID. See the discussion on
     *     TP.ObjectProto.changed for more info.
     * @param {String} anAspect The aspect of the receiver that changed. This is
     *     usually an attribute name.
     * @param {String} anAction The action which caused the change. This usually
     *     'add', 'remove', etc.
     * @param {TP.lang.Hash} aDescription A hash describing details of the
     *     change.
     * @returns {String} The receiver.
     * @signals Change
     * @todo
     */

    var target,
        asp,
        sig,
        desc;

    //  If this method is invoked before signaling is ready then exit.
    if (!TP.sys.hasInitialized()) {
        return;
    }

    //  If we can find the actual object work from there so we allow it more
    //  control over the process.
    target = TP.sys.getObjectById(this.toString());
    if (TP.canInvoke(target, 'changed')) {
        return target.changed(anAspect, anAction, aDescription);
    }

    //  Build up the signal name we'll be firing.
    sig = 'Change';
    asp = TP.ifKeyInvalid(aDescription, 'aspect', anAspect) || 'value';

    if (asp === 'value') {
        sig = 'TP.sig.ValueChange';
    } else {
        sig = asp.toString().asStartUpper() + sig;
    }

    //  Build up a standard form for the description hash.
    desc = TP.isValid(aDescription) ? aDescription : TP.hc();
    if (!TP.canInvoke(desc, 'atPutIfAbsent')) {
        this.raise('TP.sig.InvalidParameter',
                    'Description not a collection.');

        return;
    }
    desc.atPutIfAbsent('aspect', asp);
    desc.atPutIfAbsent('action', anAction || TP.UPDATE);
    desc.atPutIfAbsent('target', target || this);

    //  note that we force the firing policy here. this allows observers of a
    //  generic Change to see 'aspect'Change notifications, even if those
    //  'aspect'Change signals haven't been defined as being subtypes of Change
    TP.signal(this, sig, desc, TP.INHERITANCE_FIRING);

    return TP.isValid(target) ? target : this;
});

//  ------------------------------------------------------------------------
//  REFLECTION - PART III
//  ------------------------------------------------------------------------

/**
 * @RE: the discussion on TIBET's ordered pairs, an object's 'items' in TIBET
 *     terminology are ordered pairs of keys/values for Objects and the
 *     index/valuefor Arrays.
 * @todo
 */

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('item',
function(anIndex) {

    /**
     * @name item
     * @synopsis Returns the item at the index provided. This allows Array
     *     instances to function as valid NodeList instances.
     * @returns {Object} The object at the index in the receiver.
     */

    return this.at(anIndex);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getItems',
function(aSelectFunction) {

    /**
     * @name getItems
     * @synopsis Returns a list of items from the collection, filtering them via
     *     aSelectFunction if provided. Note that you can use the same semantics
     *     as select for this call.
     * @description The term "items", as opposed to "keys", "values", or "pairs"
     *     is variant in TP.sys. For most collections "items" are "values",
     *     however for TP.lang.Hash in particular the "items" are more like
     *     Smalltalk "associations", the key/value pairs. Using getItems is a
     *     way to deal with the "natural item form" of each collection without
     *     concern for the specific nature of those items so this method is
     *     typically called only by the collection itself or by generic
     *     iteration functions.
     * @param {Function} aSelectFunction A function used to select items that
     *     will be returned. Each item is passed to this function and if the
     *     function returns true the item is included in the result.
     * @returns {Array} The receiver's items in array key/value form.
     * @todo
     */

    //  Most objects are associative arrays, so we can work from the
    //  getPairs() perspective
    return this.getPairs(aSelectFunction);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('getItems',
function(aSelectFunction) {

    /**
     * @name getItems
     * @synopsis Returns a list of items from the collection, filtering them via
     *     aSelectFunction if provided. Note that you can use the same semantics
     *     as select for this call.
     * @description The term "items", as opposed to "keys", "values", or "pairs"
     *     is variant in TP.sys. For most collections "items" are "values",
     *     however for TP.lang.Hash in particular the "items" are more like
     *     Smalltalk "associations", the key/value pairs. Using getItems is a
     *     way to deal with the "natural item form" of each collection without
     *     concern for the specific nature of those items so this method is
     *     typically called only by the collection itself or by generic
     *     iteration functions.
     * @param {Function} aSelectFunction A function used to select items that
     *     will be returned. Each item is passed to this function and if the
     *     function returns true the item is included in the result.
     * @returns {Array} The receiver or a new Array containing the filtered
     *     results.
     * @todo
     */

    if (TP.isCallable(aSelectFunction)) {
        return this.select(aSelectFunction);
    }

    return this;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('getItems',
function(aSelectFunction) {

    /**
     * @name getItems
     * @synopsis Returns a list of items from the collection, filtering them via
     *     aSelectFunction if provided. Note that you can use the same semantics
     *     as select for this call.
     * @description The term "items", as opposed to "keys", "values", or "pairs"
     *     is variant in TP.sys. For most collections "items" are "values",
     *     however for TP.lang.Hash in particular the "items" are more like
     *     Smalltalk "associations", the key/value pairs. Using getItems is a
     *     way to deal with the "natural item form" of each collection without
     *     concern for the specific nature of those items so this method is
     *     typically called only by the collection itself or by generic
     *     iteration functions.
     * @param {Function} aSelectFunction A function used to select chars that
     *     will be returned. Each char is passed to this function and if the
     *     function returns true the char is included in the result.
     * @returns {Array} An array of characters in the receiver.
     * @todo
     */

    if (TP.isCallable(aSelectFunction)) {
        return this.getValues().select(aSelectFunction);
    }

    return this.getValues();
});

//  ------------------------------------------------------------------------
//  STRING REPRESENTATION
//  ------------------------------------------------------------------------

/*
There are a number of scenarios where getting a displayable output string
for an object is important.

The asDisplayString() function is the foundation for many of TIBET's
formatters since it's capable of producing HTML, XML, or other
representations of an object and its children/properties.
*/

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('asDisplayString',
function(aHash, aLevel) {

    /**
     * @name asDisplayString
     * @synopsis Returns the receiver as a formatted string. This method is
     *     extremely powerful as it takes a number of parameters which allow it
     *     to format an object in a number of ways. The parameters should be
     *     provided in an anonymous object as in:
     *
     *     this.asDisplayString({param: value, param: value, ...});
     *
     *     If no params are provided a simple toString() is done. If params are
     *     provided they control formatting as their names imply. The params
     *     are:
     *
     *     header what do we start with? itemPrefix what does each item
     *     (key/value) start with keyPrefix what do keys start with keyTransform
     *     how should keys be tranformed (a function) keySuffix how do keys end
     *     kvSeparator what separates keys from values valuePrefix what prefixes
     *     values valueTransform how should values be converted (a function)
     *     valueSuffix how should values end itemSuffix what terminates an item
     *     (key/value) pair itemSeparator what separates items footer what
     *     footer ends it all nullValue what should nulls look like
     *     emptyFunction a function that produces output to use when the object
     *     has no items filter a filter specification useKeys boolean for using
     *     getKeys() or get*Interface() useSort function to use for sorting, if
     *     any
     *
     *     The combination of these parameters allows this method to create
     *     object formats from CSV to JS Source to HTML tables using appropriate
     *     parameter settings.
     * @param {TP.lang.Hash} aHash A TP.lang.Hash containing one or more of the
     *     previously mentioned keys.
     * @param {Number} aLevel Number of levels to descend in nested objs.
     * @returns {String} A formatted string.
     * @todo
     */

    var params,
        lvl,
        i,
        k,
        result,
        sorter,
        propertyValue,
        header,
        itemPrefix,
        keyPrefix,
        keyTransform,
        keySuffix,
        kvSeparator,
        valuePrefix,
        valueSuffix,
        itemSuffix,
        itemSeparator,
        emptyFunction,
        footer,
        nullValue,
        filter,
        useKeys,
        sourceTransform,
        valueTransform,
        nullTransform;

    params = TP.ifInvalid(aHash, TP.hc('filter', 'unique_attributes'));

    lvl = TP.notDefined(aLevel) ? TP.sys.cfg('stack.descent_max') :
                                Math.max(0, aLevel);

    //  level 0 means no keys, nada, just the receiver
    if (lvl === 0) {
        return this.toString();
    }

    nullTransform = function(it, aLevel) {

                                return it;
                            };

    header = TP.ifInvalid(params.at('header'), '');
    itemPrefix = TP.ifInvalid(params.at('itemPrefix'), '');
    keyPrefix = TP.ifInvalid(params.at('keyPrefix'), '');
    keyTransform = TP.ifInvalid(params.at('keyTransform'), nullTransform);
    keySuffix = TP.ifInvalid(params.at('keySuffix'), '');
    kvSeparator = TP.ifInvalid(params.at('kvSeparator'), '=');
    valuePrefix = TP.ifInvalid(params.at('valuePrefix'), '');
    valueSuffix = TP.ifInvalid(params.at('valueSuffix'), '');
    itemSuffix = TP.ifInvalid(params.at('itemSuffix'), '');
    itemSeparator = TP.ifInvalid(params.at('itemSeparator'), '; ');
    emptyFunction = TP.ifInvalid(params.at('emptyFunction'),
                                            function() {

                                                return '';
                                            });
    footer = TP.ifInvalid(params.at('footer'), ';');
    nullValue = TP.ifInvalid(params.at('nullValue'), 'null');
    filter = TP.ifInvalid(params.at('filter'), 'unique_attributes');

    if (TP.isArray(this)) {
        useKeys = TP.ifInvalid(params.at('useKeys'), true);
    } else {
        useKeys = TP.ifInvalid(params.at('useKeys'), false);
    }

    //  note this is here to allow it to close around nullValue
    sourceTransform = function(it, aLevel) {

                                if (TP.notDefined(it)) {
                                    return 'null';
                                }

                                if (TP.isNull(it)) {
                                    return 'null';
                                }

                                if (it === this) {
                                    return 'this';
                                }

                                if (it === TP.global) {
                                    return 'self';
                                }

                                if (it === window) {
                                    return 'window';
                                }

                                if (it === document) {
                                    return 'document';
                                }

                                if (TP.isNode(it)) {
                                    return TP.src(it);
                                }

                                if (TP.canInvoke(it, 'asString')) {
                                    return it.asString().asSource();
                                }

                                return TP.str(it).asSource();
                            };

    //  and this references the sourceTransform :)
    valueTransform = TP.ifInvalid(params.at('valueTransform'),
                                            sourceTransform);

    result = TP.ac();
    result.push(header);

    if (useKeys) {
        //  get keys using same filter...and pass along 'include
        //  defined' as a true in case we're processing an array.
        k = this.getKeys(filter, true);
    } else {
        //  keys for anything here that's got a unique value
        k = this.getLocalInterface(filter);
    }

    if (TP.isDefined(sorter = params.at('useSort'))) {
        if (TP.isCallable(sorter)) {
            k.sort(sorter);
        } else {
            if (TP.isValid(k.at(0))) {
                if (k.at(0) === 0) {
                    k.sort(TP.NUMERIC_SORT);
                } else {
                    k.sort();
                }
            }
        }
    } else {
        if (TP.isValid(k.at(0))) {
            if (k.at(0) === 0) {
                k.sort(TP.NUMERIC_SORT);
            } else {
                k.sort();
            }
        }
    }

    for (i = 0; i < k.getSize(); i++) {
        propertyValue = this.at(k.at(i));

        //  wrap the item
        result.push(itemPrefix);

        //  build up key
        result.push(keyPrefix,
                    keyTransform(k.at(i), propertyValue),
                    keySuffix);

        //  separate key from value
        result.push(kvSeparator);

        //  build up value
        if (TP.isNull(propertyValue)) {
            result.push(valuePrefix,
                        nullValue,
                        valueSuffix);
        } else {
            //  note we drop levels on each call
            result.push(valuePrefix,
                        valueTransform(propertyValue, lvl - 1, k.at(i)),
                        valueSuffix);
        }

        //  wrap the item
        result.push(itemSuffix);

        //  separate pairs as needed
        if (i < (k.getSize() - 1)) {
            result.push(itemSeparator);
        }
    }

    //  don't appear to be any items...
    if (k.getSize() === 0) {
        result.push(emptyFunction());
    }

    //  add footer
    result.push(footer);

    return result.join('');
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('asJSONSource',
function() {

    /**
     * @name asJSONSource
     * @synopsis Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    var str;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asJSONSource) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    //  NB: For 'Object', we put this in a try...catch since some native Objects
    //  (i.e. XHR objects) don't like to have slots placed on them.
    try {
        this.$$format_asJSONSource = true;
    }
    catch (e) {
    }

    str = TP.js2json(this);

    //  We're done - we can remove the recursion flag.
    try {
        delete this.$$format_asJSONSource;
    }
    catch (e) {
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('asSource',
function(aFilterName) {

    /**
     * @name asSource
     * @synopsis Returns the receiver as a TIBET source code string.
     * @param {String} aFilterName Used to determine the keys that will be used
     *     to produce the recreatable form.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    var keys,
        len,

        arr,

        i,

        val;

    if (TP.isType(this)) {
        return this.getTypeName();
    }

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
    //  NB: For 'Object', we put this in a try...catch since some native Objects
    //  (i.e. XHR objects) don't like to have slots placed on them.
    try {
        this.$$format_asSource = true;
    }
    catch (e) {
    }

    keys = this.getKeys(aFilterName);
    len = keys.length;

    arr = TP.ac();

    for (i = 0; i < len; i++) {
        if (TP.isDefined(val = this.at(keys[i]))) {
            arr.push(
                TP.join(
                    '\'', TP.str(keys[i]), '\'',
                    ':',
                    TP.src(val)));
        }
    }

    //  We're done - we can remove the recursion flag.
    try {
        delete this.$$format_asSource;
    }
    catch (e) {
    }

    return TP.join('{', arr.join(', '), '}');
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('asSource',
function() {

    /**
     * @name asSource
     * @synopsis Returns the receiver as a TIBET source code string.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    var len,

        arr,

        i;

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

    len = this.length;

    arr = TP.ac();

    for (i = 0; i < len; i++) {
        arr.push(TP.src(this[i]));
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asSource;

    return TP.join('TP.ac(', arr.join(', '), ')');
});

//  ------------------------------------------------------------------------

Boolean.Inst.defineMethod('asSource',
function() {

    /**
     * @name asSource
     * @synopsis Returns the receiver as a string in source form: true or false.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    return this ? 'TP.bc(true)' : 'TP.bc(false)';
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('asSource',
function() {

    /**
     * @name asSource
     * @synopsis Returns "TP.dc(this.getTime())" which if eval'd will construct
     *     a Date instance with the same value.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    return 'TP.dc(' + this.getTime() + ')';
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('asSource',
function(aFilterName, aLevel) {

    /**
     * @name asSource
     * @synopsis Returns a string capable of recreating the receiver. For a
     *     function this is a variation of the toString() results which include
     *     any owner/track information required to recreate the method. For a
     *     type it's the defineSubtype call in string form.
     * @param {String} aFilterName Ignored.
     * @param {Number} aLevel If 0, returns function() {...}
     * @returns {String} An appropriate form for recreating the receiver.
     * @todo
     */

    var lvl,

        src,

        head,
        str;

    //  The only way to discern between Function objects that are one of the
    //  native constructors (types) and a regular Function object.
    if (TP.isNativeType(this)) {
        return TP.NO_SOURCE_REP;
    }

    //  A custom TIBET type
    if (TP.isType(this)) {
        return TP.join(this.getSupertype().getName(),
                        '.defineSubtype(\'', this.getNamespacePrefix(), ':',
                        this.getLocalName(), '\');');
    }

    lvl = TP.notDefined(aLevel) ?
            TP.sys.cfg('stack.descent_max') :
            Math.max(0, aLevel);

    if (lvl === 0) {
        return 'function () {}';
    }

    src = this.asString();

    str = TP.ac();

    if (TP.isMethod(this)) {

        //  Generate the 'method header' - this gives us a String that is a
        //  representation of the canonical TIBET way to add methods to the
        //  system. Note that this produces a representation which *must* be
        //  followed with a Function statement (i.e. 'function() {...}') and a
        //  closing ')'.
        head = this.generateMethodSourceHead();

        //  Add that head, our source and a trailing ')' to the representation.
        str.push(head, src, ')');
    } else {
        str.push(src);
    }

     str.push(';');

    return str.join('');
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('asSource',
function() {

    /**
     * @name asSource
     * @synopsis Returns the receiver in source code form i.e. as a number with
     *     no quotes etc.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

RegExp.Inst.defineMethod('asSource',
function() {

    /**
     * @name asSource
     * @synopsis Returns the receiver in TIBET source code form. The flags for
     *     global and case-sensitivity are included.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    var args;

    args = '';
    if (this.ignoreCase) {
        args += 'i';
    }

    if (this.global) {
        args += 'g';
    }

    if (this.multiline) {
        args += 'm';
    }

    return TP.join('TP.rc(',
                    this.source.quoted(), ', ', args.quoted(),
                    ')');
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asSource',
function() {

    /**
     * @name asSource
     * @synopsis Returns the receiver in source code form. Embedded quotes are
     *     escaped as needed and single quotes are used for the external quoting
     *     so the string would function properly inside an XML attribute.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    //  Make sure to toString() ourself so that we don't get an Array of
    //  characters ('new' for Firefox 2.0).
    return this.toString().quoted();
});

//  ------------------------------------------------------------------------
//  EQUALITY/IDENTITY
//  ------------------------------------------------------------------------

/**
JavaScript has different notions of equality and identity than those required
by TIBET's semantics. In particular, TIBET's sense of equality requires that
two arrays containing equal elements return true when tested for equality.
JavaScript won't do this for reference types. Identity is included for both
consistency and to allow us to 'proxy' by essentially lying about our identity
:).
*/

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('$getEqualityValue',
function() {

    /**
     * @name $getEqualityValue
     * @synopsis Returns the value which should be used for testing equality
     *     for the receiver. The default is the receiver in "source code"
     *     format.
     * @returns {String} A value appropriate for use in equality comparisons.
     * @todo
     */

    //  TODO:   optimize this!!!
    return TP.src(this);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('$getIdentityValue',
function() {

    /**
     * @name $getIdentityValue
     * @synopsis Returns the value which should be used for testing identity
     *     for the receiver. The default is the receiver's OID.
     * @returns {String} A value appropriate for use in identity comparisons.
     * @todo
     */

    //  TODO:   optimize this!!!
    return TP.gid(this);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('$getEqualityValue',
function() {

    /**
     * @name $getEqualityValue
     * @synopsis Returns the value which should be used for testing equality for
     *     the receiver. For Arrays, we return the String representation of the
     *     Array.
     * @returns {String} A value appropriate for use in equality comparisons.
     */

    return this.asString();
});

//  ------------------------------------------------------------------------

Boolean.Inst.defineMethod('$getEqualityValue',
function() {

    /**
     * @name $getEqualityValue
     * @synopsis Returns the value which should be used for testing equality for
     *     the receiver. For Booleans, we return the object itself.
     * @returns {Boolean} A value appropriate for use in equality comparisons.
     */

    return this;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('$getEqualityValue',
function() {

    /**
     * @name $getEqualityValue
     * @synopsis Returns the value which should be used for testing equality for
     *     the receiver. For Dates, we return the numeric getTime() value.
     * @returns {Number} A value appropriate for use in equality comparisons.
     */

    return this.getTime();
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('$getEqualityValue',
function() {

    /**
     * @name $getEqualityValue
     * @synopsis Returns the value which should be used for testing equality for
     *     the receiver. For Functions, we return the String representation of
     *     the Function.
     * @returns {String} A value appropriate for use in equality comparisons.
     */

    return this.asString();
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('$getEqualityValue',
function() {

    /**
     * @name $getEqualityValue
     * @synopsis Returns the value which should be used for testing equality for
     *     the receiver. For Numbers, we return the object itself.
     * @returns {Number} A value appropriate for use in equality comparisons.
     */

    return this;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('$getEqualityValue',
function() {

    /**
     * @name $getEqualityValue
     * @synopsis Returns the value which should be used for testing equality for
     *     the receiver. For Strings, we return the object itself.
     * @returns {String} A value appropriate for use in equality comparisons.
     */

    return this;
});

//  ------------------------------------------------------------------------

RegExp.Inst.defineMethod('$getEqualityValue',
function() {

    /**
     * @name $getEqualityValue
     * @synopsis Returns the value which should be used for testing equality for
     *     the receiver. For RegExps, we return the String representation of the
     *     RegExp.
     * @returns {String} A value appropriate for use in equality comparisons.
     */

    return this.asString();
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('equalTo',
function(that) {

    /**
     * @name equalTo
     * @synopsis Compare for equality.
     * @description TIBET's notion of equality is based on "equality of value"
     *     such that two objects with matching key/value data are equal. This
     *     isn't true for JS. TIBET therefore uses string value as the
     *     comparison of choice and of course allows individual subtypes to
     *     define their own notion of equality (as with Date).
     * @param {Object} that The object to test against.
     * @returns {Boolean} Whether or not the receiver is equal to the supplied
     *     object.
     */

    var a,
        b;

    if (TP.notValid(that)) {
        return false;
    }

    a = TP.canInvoke(this, '$getEqualityValue') ?
                        this.$getEqualityValue() :
                        TP.src(this);
    b = TP.canInvoke(that, '$getEqualityValue') ?
                        that.$getEqualityValue() :
                        TP.src(that);

    /* jshint eqeqeq:false */
    return a == b;
    /* jshint eqeqeq:true */
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('equalTo',
function(that) {

    /**
     * @name equalTo
     * @synopsis Returns true if the two objects compare equally. TIBET's notion
     *     of equality is based on "equality of value" such that for TIBET the
     *     array [1,2,3] is equalTo() a second array [1,2,3]. Arrays of
     *     different length are likewise not equal.
     * @param {Object} that The object to test against.
     * @returns {Boolean} Whether or not the receiver is equal to the supplied
     *     object.
     */

    var i;

    if (!TP.isArray(that)) {
        return false;
    }

    if (this.getSize() !== that.length) {
        return false;
    }

    for (i = 0; i < this.getSize(); i++) {
        if (TP.isNull(this.at(i))) {
            if (TP.notNull(that.at(i))) {
                return false;
            }
        } else if (TP.notDefined(this.at(i))) {
            if (TP.isDefined(that.at(i))) {
                return false;
            }
        } else if (!TP.equal(this.at(i), that.at(i))) {
            return false;
        }
    }

    return true;
});

//  ------------------------------------------------------------------------

Boolean.Inst.defineMethod('equalTo',
function(that) {

    /**
     * @name equalTo
     * @synopsis Compare for equality. In TIBET equality means the values i.e.
     *     the content is equal.
     * @param {Object} that The object to test against.
     * @returns {Boolean} Whether or not the receiver is equal to the supplied
     *     object.
     */

    if (!TP.isBoolean(that)) {
        return false;
    }

    //  force primitive comparison
    return this.valueOf() === that.valueOf();
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('equalTo',
function(that) {

    /**
     * @name equalTo
     * @synopsis Compare for equality. In TIBET equality means the values i.e.
     *     the content is equal. Equality for dates is based on MS clock times.
     * @param {Object} that The object to test against.
     * @returns {Boolean} Whether or not the receiver is equal to the supplied
     *     object.
     */

    if (!TP.isDate(that)) {
        return false;
    }

    //  if it's a date return based on comparison of milliseconds since the
    //  regular Date comparison doesn't seem to be smart enough to do this
    return this.getTime() === that.getTime();
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('equalTo',
function(that) {

    /**
     * @name equalTo
     * @synopsis Compare for equality. In TIBET equality means the values i.e.
     *     the content is equal. Functions are equal if they have the same
     *     string value.
     * @param {Object} that The object to test against.
     * @returns {Boolean} Whether or not the receiver is equal to the supplied
     *     object.
     */

    if (!TP.isCallable(that)) {
        return false;
    }

    return this.toString() === that.toString();
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('equalTo',
function(that) {

    /**
     * @name equalTo
     * @synopsis Compare for equality. In TIBET equality means the values i.e.
     *     the content is equal.
     * @param {Object} that The object to test against.
     * @returns {Boolean} Whether or not the receiver is equal to the supplied
     *     object.
     */

    if (!TP.isNumber(that)) {
        return false;
    }

    //  force primitive comparison
    return (this - 0) === (that - 0);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('equalTo',
function(that) {

    /**
     * @name equalTo
     * @synopsis Compare for equality. In TIBET equality means the values i.e.
     *     the content is equal.
     * @param {Object} that The object to test against.
     * @returns {Boolean} Whether or not the receiver is equal to the supplied
     *     object.
     */

    if (!TP.isString(that)) {
        return false;
    }

    //  force primitive comparison
    return ('' + this) === ('' + that);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('identicalTo',
function(that) {

    /**
     * @name identicalTo
     * @synopsis Compare for identity.
     * @description The === symbol in JS isn't really defined as "identity"
     *     it's defined as "strict equality" which apparently isn't the same in
     *     certain cases. For TIBET we follow the general form but rely on our
     *     own OIDs to test for identity.
     * @param {Object} that The object to test against.
     * @returns {Boolean} Whether or not the receiver is identical to the
     *     supplied object.
     */

    var a,
        b;

    if (TP.notValid(that)) {
        return false;
    }

    a = TP.canInvoke(this, '$getIdentityValue') ?
                        this.$getIdentityValue() :
                        this;
    b = TP.canInvoke(that, '$getIdentityValue') ?
                        that.$getIdentityValue() :
                        that;

    //  NOTE that we're testing identity values for equality, not identity
    /* jshint eqeqeq:false */
    return a == b;
    /* jshint eqeqeq:true */
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('identicalTo',
function(that) {

    /**
     * @name identicalTo
     * @synopsis Compare for identity.
     * @param {Object} that The object to test against.
     * @returns {Boolean} Whether or not the receiver is identical to the
     *     supplied object.
     */

    if (!TP.isString(that)) {
        return false;
    }

    //  force primitive comparison
    return ('' + this) === ('' + that);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('equal',
function(objectA, objectB, aType) {

    /**
     * @name equal
     * @synopsis Returns true if the values of the two objects are 'equal'.
     *     Since null is a value that has to be set we consider two nulls to
     *     compare as equal. Undefined values do not.
     * @param {Object} objectA The first object to compare.
     * @param {Object} objectB The second object to compare.
     * @param {TP.lang.RootObject|String} aType A Type object, or type name.
     *     Supplying this will force both objects to be compared by this
     *     supplied type.
     * @returns {Boolean} Whether or not the two objects are equal to one
     *     another.
     * @todo
     */

    //  nulls compare equally
    if (TP.isNull(objectA)) {
        return TP.isNull(objectB);
    }

    //  undef's compare equally
    if (TP.notDefined(objectA)) {
        return TP.notDefined(objectB);
    }

    //  if they're both nodes, we can just use TP.nodeEqualsNode() to
    //  compare them here.
    if (TP.isNode(objectA) && TP.isNode(objectB)) {
        return TP.nodeEqualsNode(objectA, objectB);
    }

    //  if we're comparing based on the value in a specific form we'll
    //  redirect to the array method that performs those comparisons
    if (TP.isType(aType)) {
        return TP.ac(objectA, objectB).equalAs(aType);
    }

    //  remaining options rely on at least one object being able to perform
    //  the comparison with more intelligence than ==.
    if (TP.canInvoke(objectA, 'equalTo')) {
        return objectA.equalTo(objectB);
    } else if (TP.canInvoke(objectB, 'equalTo')) {
        return objectB.equalTo(objectA);
    }

    //  TODO: Need a better algorithm here
    return TP.js2json(objectA) === TP.js2json(objectB);

    /* jshint eqeqeq:false */
    //return objectA == objectB;
    /* jshint eqeqeq:true */
});

//  ------------------------------------------------------------------------

TP.definePrimitive('identical',
function(objectA, objectB) {

    /**
     * @name identical
     * @synopsis Returns true if the values of the two objects are 'identical'.
     *     Neither nulls nor undefined values will compare identical with
     *     anything.
     * @param {Object} objectA The first object to compare.
     * @param {Object} objectB The second object to compare.
     * @returns {Boolean} Whether or not the two objects are identical to one
     *     another.
     * @todo
     */

    if (TP.isNull(objectA)) {
        return TP.isNull(objectB);
    }

    if (TP.notDefined(objectA)) {
        return TP.notDefined(objectB);
    }

    //  if they're both nodes, we can just === compare them here and exit.
    if (TP.isNode(objectA) && TP.isNode(objectB)) {
        return objectA === objectB;
    }

    //  identity can be spoofed in certain cases, so we don't assume that
    //  === is going to be the right answer in all cases...we'll see if
    //  either object would like to manage the comparison first
    if (TP.canInvoke(objectA, 'identicalTo')) {
        return objectA.identicalTo(objectB);
    } else if (TP.canInvoke(objectB, 'identicalTo')) {
        return objectB.identicalTo(objectA);
    }

    return objectA === objectB;
});

//  ------------------------------------------------------------------------
//  COMPARISON/MAGNITUDE
//  ------------------------------------------------------------------------

/**
 * @Not all objects work in a way consistent with standard sort functions,
 *     meaning that they can't easily be sorted based on simple criteria. To
 *     helpwith that we define a set of comparison support features here that
 *     you canimplement in your types to help sort at the object level.
 * @todo
 */

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('$getComparisonValue',
function() {

    /**
     * @name $getComparisonValue
     * @synopsis Returns the value which should be used for comparing
     *     "magnitudes" for purposes of sorting a set of objects. The default
     *     returns the result of calling getSize().
     * @returns {Number} The size of the object.
     * @todo
     */

    return this.getSize();
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('compareTo',
function(that) {

    /**
     * @name compareTo
     * @synopsis Compare for "magnitude" to support sort operations.
     * @param {Object} that The object to compare the receiver against.
     * @returns {Number} -1 if receiver is "smaller" than the argument, 0 if
     *     they are "equal", and 1 if the receiver is "larger" than the
     *     argument.
     */

    var thissize,
        thatsize;

    if (TP.canInvoke(that, '$getComparisonValue')) {
        thatsize = that.$getComparisonValue();
    } else if (TP.canInvoke(that, 'getSize')) {
        thatsize = that.getSize();
    } else if (TP.isValid(that.length)) {
        thatsize = that.length;
    } else {
        //  consider ourselves to be "larger"
        return 1;
    }

    thissize = this.$getComparisonValue();

    if (thissize > thatsize) {
        return 1;
    } else if (thissize < thatsize) {
        return -1;
    } else {
        return 0;
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('compare',
function(objectA, objectB) {

    /**
     * @name compare
     * @synopsis Returns -1, 0, or 1 based on whether objectA is "larger" than
     *     objectB as determined by their comparison values.
     * @param {Object} objectA The first object to compare.
     * @param {Object} objectB The second object to compare.
     * @returns {Number} -1 if objectA is "smaller" than objectB, 0 if they are
     *     "equal", and 1 if objectA is "larger" than objectB.
     * @todo
     */

    if (TP.canInvoke(objectA, 'compareTo')) {
        return objectA.compareTo(objectB);
    } else if (TP.canInvoke(objectB, 'compareTo')) {
        return objectB.compareTo(objectA);
    } else {
        //  indeterminate
        return 0;
    }
});

//  ------------------------------------------------------------------------
//  MATCHING
//  ------------------------------------------------------------------------

Function.Inst.defineMethod('test',
function(anObject) {

    /**
     * @name test
     * @synopsis Mirrors the test call on RegExp instances so we can use a
     *     function instance as a "selector".
     * @param {Object} anObject The object to test.
     * @returns {Boolean} True if the function finds the object acceptable.
     */

    var result;

    try {
        result = this(anObject);

        return TP.bc(result);
    } catch (e) {
        return false;
    }
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('test',
function(aString) {

    /**
     * @name test
     * @synopsis Mirrors the test call on RegExp instances so we can use either
     *     a string or regular expression interchangeably.
     * @param {String} aString The string to test against. The value of the
     *     receiver is used as the regular expression.
     * @returns {Boolean} True if the regular expression represented by the
     *     receiver matches the incoming string.
     */

    var testRegex,
        str;

    str = TP.str(aString);

    //  simplest case is non-wildcarded content, so we can invert and test
    if (str.indexOf(this.toString()) !== TP.NOT_FOUND) {
        return true;
    }

    //  we can fallback to trying to construct a regex from our value
    try {
        testRegex = TP.rc(this.toString());
        if (TP.isRegExp(testRegex)) {
            return testRegex.test(aString);
        }
    } catch (e) {
        //  unable to construct as a regular expression and string wasn't
        //  found in the original as a substring...other syntaxes?
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('match',
function(aSelector, anObject) {

    /**
     * @name match
     * @synopsis Tests anObject using aSelector, to see if there's a match. This
     *     method is a convenience wrapper intended to help make string, regular
     *     expression, and css selector testing more polymorphic.
     * @param {String|RegExp|Object} aSelector A string, regular expression, or
     *     other object implementing 'test'.
     * @param {Object} anObject The object (usually string or node) to test.
     * @returns {Boolean} True if there's a match.
     * @todo
     */

    if (TP.canInvoke(aSelector, 'test')) {
        return aSelector.test(anObject);
    } else if (TP.canInvoke(anObject, 'equalTo')) {
        //  NOTE that we invert things here to avoid overly-simplistic
        //  checks for equality...we let the object decide
        return anObject.equalTo(aSelector);
    } else {
        /* jshint eqeqeq:false */
        return aSelector == anObject;
        /* jshint eqeqeq:true */
    }
});

//  ------------------------------------------------------------------------
//  INFERENCING - PART I (stubs)
//  ------------------------------------------------------------------------

/*
TIBET augments the programmer with built-in support for inferring object
functionality in certain cases. This capability helps keep code size
smaller while supporting a faster development cycle and significantly
increased level of functionality. The trigger for inferencing is the
TP.sys.dnu function or DNU, also referred to as the 'backstop'.
*/

//  ------------------------------------------------------------------------

TP.sys.defineMethod('dnu',
function() {

    /**
     * @name dnu
     * @synopsis The 'backstop' for TIBET inferencing. When inferencing is
     *     enabled this method is the entry point.
     */

    return;
});

//  ------------------------------------------------------------------------
//  ENCAPSULATION - PART II (PostPatch)
//  ------------------------------------------------------------------------

String.Inst.defineMethod('asCSSName',
function() {

    /**
     * @name asCSSName
     * @synopsis Returns a new string converted into its equivalent CSS property
     *     name. For example, backgroundColor becomes 'background-color',
     *     'cssFloat' becomes 'float', etc. NOTE that strings which are not
     *     valid CSS keys return null.
     * @returns {String} A valid CSS property name, or null if the receiver
     *     can't produce a valid key.
     */

    var domName;

    if (TP.boot.isUA('IE')) {
        domName = 'styleFloat';
    } else {
        domName = 'cssFloat';
    }

    if (this.toString() === domName) {
        return 'float';
    }

    return this.toString().asHyphenated();
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asDOMName',
function() {

    /**
     * @name asDOMName
     * @synopsis Returns a new string converted into its equivalent DOM property
     *     name. For example, background-color becomes backgroundColor, float
     *     becomes 'cssFloat', etc. NOTE that strings which are not valid CSS
     *     keys return null.
     * @returns {String} A valid DOM property name, or null if the receiver
     *     can't produce a valid key.
     */

    if (this.toString() === 'float') {
        if (TP.boot.isUA('IE')) {
            return 'styleFloat';
        } else {
            return 'cssFloat';
        }
    }

    return this.toString().asCamelCase();
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('asStartUpper',
function() {

    /**
     * @name asStartUpper
     * @synopsis Returns a new string with the initial character in upper case.
     *     No other transformation is performed.
     * @description Since all objects can actually be used as object indexes and
     *     we attempt to convert things into proper message formatting for
     *     get()/set() calls we try to avoid overhead here from the inferencing
     *     engine on things like numerical indexing for arrays etc.
     * @returns {Object} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getProperty',
function(attributeName) {

    /**
     * @name getProperty
     * @synopsis Returns the value, if any, for the attribute provided. This
     *     method takes over when get() fails to find a specific getter or an
     *     aspect adapted getter.
     * @param {String} attributeName The name of the attribute to get.
     * @returns {Object} The value of the property on the receiver.
     */

    var val;

    //  no method and no adaptation so check slot directly
    val = this.$get(attributeName);
    if (TP.isDefined(val)) {
        return val;
    }

    //  we could use the inferencer, although that only works on rare
    //  occasions -- most people don't equate a get() call with a request
    //  for type conversion -- so this is usually off
    if (TP.sys.$$shouldUseBackstop()) {
        //  don't pass attributeName in modified form so the backstop can
        //  work from original data
        return TP.sys.dnu(this, 'get' + attributeName,
                            arguments,
                            arguments);
    }

    //  if backstop is off and data isn't found, no other choices
    return;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getAccessPathAliases',
function(aPath) {

    /**
     * @name getAccessPathAliases
     * @synopsis Returns an Array of 'access path aliases' - that is, the
     *     aliased names that the receiver uses for a particular path (i.e.
     *     '/person/lastName' might map to 'lastName').
     * @param {String} aPath The path to check for aliases.
     * @returns {Array|null} An Array of access path aliases for the receiver or
     *     null.
     */

    //  At this level, we just return null. See the implementation on
    //  TP.lang.RootObject for a real implementation of this method.
    return null;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getAccessPathFor',
function(attributeName, facetName) {

    /**
     * @name getAccessPathFor
     * @synopsis Returns any access path facet value, if any, for the attribute
     *     and facet provided. See the 'TP.sys.addMetadata()' call for more
     *     information about facets.
     * @param {String} attributeName The name of the attribute to get the access
     *     path facet value for.
     * @param {String} facetName The name of the facet to get the access path
     *     facet value for.
     * @returns {Object} Any access path value of the supplied facet of the
     *     supplied attribute. If there is no access path, this method returns
     *     null.
     */

    var pathVal;

    if (TP.isValid(pathVal = this.getFacetValueFor(attributeName, facetName)) &&
        pathVal.isAccessPath()) {
            return pathVal;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getDescriptorFor',
function(attributeName) {

    /**
     * @name getDescriptorFor
     * @synopsis Returns the property descriptor, if any, for the attribute
     *     provided. See the 'TP.sys.addMetadata()' call for more information
     *     about property descriptors.
     * @param {String} attributeName The name of the attribute to get the
     *     property descriptor for.
     * @returns {Object} The property descriptor of the attribute on the
     *     receiver.
     */

    //  At this level, we just return null. See the implementation on
    //  TP.lang.RootObject for a real implementation of this method.
    return null;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getFacetValueFor',
function(attributeName, facetName) {

    /**
     * @name getFacetValueFor
     * @synopsis Returns any facet value, if any, for the attribute and facet
     *     provided. See the 'TP.sys.addMetadata()' call for more information
     *     about facets.
     * @param {String} attributeName The name of the attribute to get the facet
     *     value for.
     * @param {String} facetName The name of the facet to get the facet value
     *     for.
     * @returns {Object} The value of the supplied facet of the supplied
     *     attribute.
     */

    var descriptor;

    descriptor = this.getDescriptorFor(attributeName);
    //  NB: We use primitive property access here since descriptors are
    //  primitive object.
    if (TP.isValid(descriptor)) {
        return descriptor[facetName];
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('isAccessPath',
function() {

    /**
     * @name isAccessPath
     * @synopsis Returns whether or not the receiver is an access path object.
     * @returns {Boolean} False - most receivers are not a path.
     */

    return false;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('setFacetValueFor',
function(attributeName, facetName, facetValue) {

    /**
     * @name setFacetValueFor
     * @synopsis Sets the facet value for the attribute and facet provided.
     *     See the 'TP.sys.addMetadata()' call for more information about
     *     facets.
     * @param {String} attributeName The name of the attribute to get the facet
     *     value for.
     * @param {String} facetName The name of the facet to get the facet value
     *     for.
     * @param {String} facetValue The value to set the facet to.
     * @returns {Object} The value of the supplied facet of the supplied
     *     attribute.
     */

    var descriptor;

    descriptor = this.getDescriptorFor(attributeName);
    //  NB: We use primitive property access here since descriptors are
    //  primitive object.
    if (TP.isValid(descriptor)) {
        descriptor[facetName] = facetValue;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('get',
function(attributeName) {

    /**
     * @name get
     * @synopsis Returns the value, if any, for the attribute provided.
     * @description This method is a convenient wrapper that will automatically
     *     look for getAttributeName(), getattributeName(), .attribute, etc. to
     *     return the value. Using this method provides a way to fully
     *     encapsulate an attribute access whether the receiver has implemented
     *     a getter or not. Once a getter is implemented it is automatically
     *     used. Getters should follow the normal coding convention of
     *     this.attributeName for access while all others should use
     *     get('attributeName').
     * @param {String|TP.core.AccessPath} attributeName The name of the
     *     attribute to get.
     * @returns {Object} The value of the attribute on the receiver.
     */

    var path,

        funcName,

        args;

    //  If we got handed an 'access path', then we need to let it handle this.
    if (!TP.isString(attributeName) && attributeName.isAccessPath()) {
        path = attributeName;
    } else if (TP.regex.NON_SIMPLE_PATH.test(attributeName)) {
        path = TP.apc(attributeName);
    }

    if (TP.notValid(path)) {
        //  try common naming convention first
        funcName = 'get' + attributeName.asStartUpper();
        if (TP.canInvoke(this, funcName)) {
            switch (arguments.length) {
                case 1:
                    return this[funcName]();
                default:
                    args = TP.args(arguments, 1);
                    return this[funcName].apply(this, args);
            }
        }

        //  booleans can often be found via is* methods
        funcName = 'is' + attributeName.asStartUpper();
        if (TP.isMethod(this[funcName])) {
            return this[funcName]();
        }
    }

    //  If we got a valid path above or if we have a 'value' facet that has an
    //  access path, then invoke the path.
    if (TP.isValid(path) ||
        TP.isValid(path = this.getAccessPathFor(attributeName, 'value'))) {

        //  Note here how we grab all of the arguments passed into this method,
        //  shove ourself onto the front and invoke with an apply(). This is
        //  because executeGet() takes varargs (in case the path is
        //  parameterized).
        args = TP.args(arguments);
        args.atPut(0, this);
        return path.executeGet.apply(path, args);
    }

    //  let the standard mechanism handle it
    return this.getProperty(attributeName);
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('get',
function() {

    /**
     * @name get
     * @synopsis Returns the value, if any, for the attribute provided.
     * @description For the TIBET object in particular we do a little extra
     *     processing here when the property in question is undefined. In that
     *     case we also check for a registered object using the property name as
     *     the key. This allows TP.sys.get() to act as a synonym for
     *     TP.sys.getObjectById() which is particularly useful when using TIBET
     *     as a bound source for shared data.
     * @param {String} attributeName The name of the attribute to get.
     * @returns {Object} The value of the attribute on the receiver.
     */

    var value;

    //  start by looking for a real property
    value = this.$get(arguments[0]);

    //  not real? not null? see if it's an object URL
    if (TP.notDefined(value)) {
        value = TP.sys.getObjectById(arguments[0]);
    }

    return value;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('get',
function(attributeName) {

    /**
     * @name get
     * @synopsis Returns the value, if any, for the attribute provided.
     * @description This method is a convenient wrapper that will automatically
     *     look for getAttributeName(), getattributeName(), .attribute, etc. to
     *     return the value. Using this method provides a way to fully
     *     encapsulate an attribute access whether the receiver has implemented
     *     a getter or not. Once a getter is implemented it is automatically
     *     used. Getters should follow the normal coding convention of
     *     this.attributeName for access while all others should use
     *     get('attributeName').
     * @param {String|TP.core.AccessPath} attributeName The name of the
     *     attribute to get.
     * @returns {Object} The value of the attribute on the receiver.
     */

    var path,

        funcName,

        val,

        args;

    //  If we got handed an 'access path', then we need to let it handle this.
    if (!TP.isString(attributeName) && attributeName.isAccessPath()) {
        path = attributeName;
    } else if (TP.regex.NON_SIMPLE_PATH.test(attributeName)) {
        path = TP.apc(attributeName);
    }

    if (TP.notValid(path)) {
        //  try common naming convention first
        funcName = 'get' + attributeName.asStartUpper();
        if (TP.canInvoke(this, funcName)) {
            switch (arguments.length) {
                case 1:
                    return this[funcName]();
                default:
                    args = TP.args(arguments, 1);
                    return this[funcName].apply(this, args);
            }
        }

        //  booleans can often be found via is* methods
        funcName = 'is' + attributeName.asStartUpper();
        if (TP.isMethod(this[funcName])) {
            return this[funcName]();
        }

        //  This part is specific to Array - shortstop for numerical indices

        //  We do want to account for a String that only has a 'whole number'
        //  in it.
        if (TP.isNumber(val = attributeName.asNumber())) {
            return this.$get(val);
        }
    }

    //  If we got a valid path above or if we have a 'value' facet that has an
    //  access path, then invoke the path.
    if (TP.isValid(path) ||
        TP.isValid(path = this.getAccessPathFor(attributeName, 'value'))) {

        //  Note here how we grab all of the arguments passed into this method,
        //  shove ourself onto the front and invoke with an apply(). This is
        //  because executeGet() takes varargs (in case the path is
        //  parameterized).
        args = TP.args(arguments);
        args.atPut(0, this);
        return path.executeGet.apply(path, args);
    }

    //  let the standard mechanism handle it
    return this.getProperty(attributeName);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('get',
function(attributeName) {

    /**
     * @name get
     * @synopsis Returns the value, if any, for the attribute provided.
     * @param {String|TP.core.AccessPath} attributeName The name of the
     *     attribute to get.
     * @returns {Object} The value of the attribute on the receiver.
     */

    var path,

        funcName,

        args;

    //  If we got handed an 'access path', then we need to let it handle this.
    if (!TP.isString(attributeName) && attributeName.isAccessPath()) {
        path = attributeName;
    } else if (TP.regex.NON_SIMPLE_PATH.test(attributeName)) {
        path = TP.apc(attributeName);
    }

    if (TP.notValid(path)) {
        //  try common naming convention first
        funcName = 'get' + attributeName.asStartUpper();
        if (TP.canInvoke(this, funcName)) {
            switch (arguments.length) {
                case 1:
                    return this[funcName]();
                default:
                    args = TP.args(arguments, 1);
                    return this[funcName].apply(this, args);
            }
        }

        //  booleans can often be found via is* methods
        funcName = 'is' + attributeName.asStartUpper();
        if (TP.isMethod(this[funcName])) {
            return this[funcName]();
        }

        //  This part is specific to String - shortstop for numerical indices

        if (TP.isNumber(attributeName)) {
            return this.charAt(attributeName);
        }
    }

    //  If we got a valid path above or if we have a 'value' facet that has an
    //  access path, then invoke the path.
    if (TP.isValid(path) ||
        TP.isValid(path = this.getAccessPathFor(attributeName, 'value'))) {

        //  Note here how we grab all of the arguments passed into this method,
        //  shove ourself onto the front and invoke with an apply(). This is
        //  because executeGet() takes varargs (in case the path is
        //  parameterized).
        args = TP.args(arguments);
        args.atPut(0, this);
        return path.executeGet.apply(path, args);
    }

    //  let the standard mechanism handle it
    return this.getProperty(attributeName);
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('getContent',
function() {

    /**
     * @name getContent
     * @synopsis Returns the 'content' of the receiver. The default version is a
     *     synonym for getValue.
     * @returns {Object} The value of the receiver.
     * @todo
     */

    return this.getValue();
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('getValue',
function() {

    /**
     * @name getValue
     * @synopsis Returns the 'value' of the receiver. This method follows a
     *     search path looking for a slot named value, _value, $value, and
     *     finally this.
     * @returns {Object} The value of the receiver.
     */

    var val;

    //  nodes are a bit strange since we can't rely on inheritance to
    //  instrument them in the tree, and we need polymorphic methods to "do
    //  the right thing"
    if (TP.isNode(this)) {
        return TP.tpnode(this).getValue();
    }

    val = this.$get('value');
    if (TP.isDefined(val)) {
        return val;
    }

    //  default to the object itself...this is what makes this version
    //  different from a standard get('value') call.
    return this;
});

//  ------------------------------------------------------------------------

Boolean.Inst.defineMethod('getValue',
function() {

    /**
     * @name getValue
     * @synopsis Returns the primitive value of the receiver.
     * @returns {Boolean} The value of the receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('getValue',
function() {

    /**
     * @name getValue
     * @synopsis Returns the primitive value of the receiver.
     * @returns {Number} The value of the receiver.
     */

    return this + 0;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('getValue',
function() {

    /**
     * @name getValue
     * @synopsis Returns the primitive value of the receiver.
     * @returns {String} The value of the receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('setProperty',
function(attributeName, attributeValue, shouldSignal) {

    /**
     * @name setProperty
     * @synopsis Sets the value of the named property. The base version is a
     *     simple wrapper around $set however other types override this method
     *     to provide custom behavior.
     * @param {String} attributeName The attribute name to set.
     * @param {Object} attributeValue The value to set.
     * @param {Boolean} shouldSignal If false no signaling occurs. Defaults to
     *     this.shouldSignalChange().
     * @returns {Object} The receiver.
     * @todo
     */

    return this.$set(attributeName, attributeValue, shouldSignal);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('set',
function(attributeName, attributeValue, shouldSignal) {

    /**
     * @name set
     * @synopsis Sets the value of the named attribute to the value provided. If
     *     no value is provided the value null is used.
     * @description As with get('attr') this method is a convenient
     *     encapsulation wrapper that will look for setAttribute, setattribute,
     *     and this.attribute to determine how to proceed. No notification is
     *     provided by this method if either function is found, however if the
     *     value is set directly at the attribute level this method will signal
     *     Change as appropriate. This allows the developer of a setter function
     *     complete control over behavior without fear of side-effects.
     * @param {String|TP.core.AccessPath} attributeName The name of the
     *     attribute to set.
     * @param {Object} attributeValue The value to set.
     * @param {Boolean} shouldSignal If false no signaling occurs. Defaults to
     *     this.shouldSignalChange().
     * @returns {Object} The receiver.
     * @todo
     */

    var path,

        funcName,

        args;

    if (!TP.isMutable(this)) {
        return this.raise('TP.sig.NonMutableInstance',
                            attributeName);
    }

    if (TP.isEmpty(attributeName)) {
        return this.raise('TP.sig.InvalidKey');
    }

    //  If we got handed an 'access path', then we need to let it handle this.
    if (!TP.isString(attributeName) && attributeName.isAccessPath()) {
        path = attributeName;
    } else if (TP.regex.NON_SIMPLE_PATH.test(attributeName)) {
        path = TP.apc(attributeName);
    }

    if (TP.notValid(path)) {
        //  try common naming convention first
        funcName = 'set' + attributeName.asStartUpper();
        if (TP.canInvoke(this, funcName)) {
            switch (arguments.length) {
                case 1:
                    return this[funcName]();
                default:
                    args = TP.args(arguments, 1);
                    return this[funcName].apply(this, args);
            }
        }

        //  booleans can often be set via is* methods, which take a parameter
        //  in TIBET syntax
        if (TP.isBoolean(attributeValue)) {
            funcName = 'is' + attributeName.asStartUpper();
            if (TP.isMethod(this[funcName])) {
                return this[funcName](attributeValue);
            }
        }
    }

    //  If we got a valid path above or if we have a 'value' facet that has an
    //  access path, then invoke the path.
    if (TP.isValid(path) ||
        TP.isValid(path = this.getAccessPathFor(attributeName, 'value'))) {

        //  Note here how we grab all of the arguments passed into this method,
        //  shove ourself onto the front and invoke with an apply(). This is
        //  because executeSet() takes varargs (in case the path is
        //  parameterized).
        args = TP.args(arguments);
        args.atPut(0, this);
        return path.executeSet.apply(path, args);
    }

    //  let the standard method handle it
    return this.setProperty(attributeName, attributeValue, shouldSignal);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('set',
function(attributeName, attributeValue, shouldSignal) {

    /**
     * @name set
     * @synopsis Sets the value of the named attribute to the value provided. If
     *     no value is provided the value null is used.
     * @description As with get('attr') this method is a convenient
     *     encapsulation wrapper that will look for setAttribute, setattribute,
     *     and this.attribute to determine how to proceed. No notification is
     *     provided by this method if either function is found, however if the
     *     value is set directly at the attribute level this method will signal
     *     Change as appropriate. This allows the developer of a setter function
     *     complete control over behavior without fear of side-effects.
     * @param {String|TP.core.AccessPath} attributeName The name of the
     *     attribute to set.
     * @param {Object} attributeValue The value to set.
     * @param {Boolean} shouldSignal If false no signaling occurs. Defaults to
     *     this.shouldSignalChange().
     * @returns {Object} The receiver.
     * @todo
     */

    var path,

        funcName,

        val,

        args;

    if (TP.isEmpty(attributeName)) {
        return this.raise('TP.sig.InvalidKey');
    }

    //  If we got handed an 'access path', then we need to let it handle this.
    if (!TP.isString(attributeName) && attributeName.isAccessPath()) {
        path = attributeName;
    } else if (TP.regex.NON_SIMPLE_PATH.test(attributeName)) {
        path = TP.apc(attributeName);
    }

    if (TP.notValid(path)) {
        //  try common naming convention first
        funcName = 'set' + attributeName.asStartUpper();
        if (TP.canInvoke(this, funcName)) {
            switch (arguments.length) {
                case 1:
                    return this[funcName]();
                default:
                    args = TP.args(arguments, 1);
                    return this[funcName].apply(this, args);
            }
        }

        //  booleans can often be set via is* methods, which take a parameter
        //  in TIBET syntax
        if (TP.isBoolean(attributeValue)) {
            funcName = 'is' + attributeName.asStartUpper();
            if (TP.isMethod(this[funcName])) {
                return this[funcName](attributeValue);
            }
        }

        //  This part is specific to Array - shortstop for numerical indices

        //  We do want to account for a String that only has a 'whole number'
        //  in it.
        if (TP.isNumber(val = attributeName.asNumber())) {
            return this.$set(val, attributeValue, shouldSignal);
        }
    }

    //  If we got a valid path above or if we have a 'value' facet that has an
    //  access path, then invoke the path.
    if (TP.isValid(path) ||
        TP.isValid(path = this.getAccessPathFor(attributeName, 'value'))) {

        //  Note here how we grab all of the arguments passed into this method,
        //  shove ourself onto the front and invoke with an apply(). This is
        //  because executeSet() takes varargs (in case the path is
        //  parameterized).
        args = TP.args(arguments);
        args.atPut(0, this);
        return path.executeSet.apply(path, args);
    }

    //  let the standard method handle it
    return this.setProperty(attributeName, attributeValue, shouldSignal);
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('setValue',
function(aValue) {

    /**
     * @name setValue
     * @synopsis Sets the 'value' of the receiver. This method provides
     *     polymorphic behavior by allowing objects to serve as ValueHolders.
     *     The search for variable slots follows value, _value, and $value. This
     *     method calls changed if the value changes.
     * @param {Object} aValue The value to set the value of the receiver to.
     * @returns {Object} The receiver.
     */

    return this.$set('value', aValue);
});

//  ------------------------------------------------------------------------
//  DEBUGGING
//  ------------------------------------------------------------------------

TP.sys.defineMethod('hasDebugger',
function() {

    /**
     * @name hasDebugger
     * @synopsis Returns true if there's a TIBET implementation of a 'debugger'
     *     available. This might be the case when running in Mozilla and
     *     leveraging the Venkman API for example.
     * @returns {Boolean} Whether or not the environment has a debugger
     *     available.
     */

    //  default is no
    return false;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('runDebugger',
function(callingContext) {

    /**
     * @name runDebugger
     * @synopsis If there's a TIBET implementation of a debugging tool this
     *     function will run it if possible.
     * @param {Function|Arguments} callingContext The context to debug.
     */

    return;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('$launchDebugger',
function(callingContext) {

    /**
     * @name $launchDebugger
     * @synopsis Launches the TIBET debugger if one is installed.
     * @description This method is invoked by TP.sys.dnu as a last resort. When
     *     TP.sys.hasDebugger() is true whatever implementation of
     *     TP.sys.runDebugger() is in effect will be called. When TIBET doesn't
     *     have a debugger installed the native debugger trigger will be invoked
     *     via the 'debugger' statement. Note that this will only occur if
     *     TP.sys.shouldUseDebugger() is true. Also note that the native
     *     debuggers will only become visible if a) installed and b) are already
     *     open.
     * @param {Function|Arguments} callingContext The calling context.
     */

    if (this.hasDebugger()) {
        this.runDebugger(callingContext);
    } else {
        //  on IE or Mozilla this will foreground the native debugger, if
        //  installed and open. but it's a bit flakey.
        try {
            /* jshint -W087 */
            debugger;
            /* jshint +W087 */
        } catch (e) {
        }
    }

    return;
});

//  ------------------------------------------------------------------------
//  DUPLICATION
//  ------------------------------------------------------------------------

/*
In a pure prototype-based system this is how we'd do everything...copy
something that's already there and then tweak it. But there's no built-in
copy command for objects in JavaScript and deep-copy semantics are
difficult in any case. We do the best we can by implementing a simple copy
operation that handles most situations.
*/

//  ------------------------------------------------------------------------

TP.defineCommonMethod('copy',
function(aFilterNameOrKeys) {

    /**
     * @name copy
     * @synopsis Returns a shallow copy of the receiver. Adequate for dealing
     *     with reference type attribute problems. The filter defines which keys
     *     are used to select from the receiver.
     * @param {String|Array} aFilterNameOrKeys get*Interface() filter or key
     *     array.
     * @returns {Object} A shallow copy of the receiver.
     */

    var i,
        keys,
        newinst,
        filter,

        len,
        ndx;

    newinst = this.getType().construct();

    if (!TP.isArray(keys = aFilterNameOrKeys)) {
        filter = TP.ifInvalid(aFilterNameOrKeys, TP.UNIQUE);
        keys = this.getLocalInterface(filter);
    }

    len = keys.getSize();
    for (i = 0; i < len; i++) {
        ndx = keys.at(i);
        newinst.$set(ndx, this.at(ndx), false);
    }

    return newinst;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('copy',
function(aFilterNameOrKeys, contentOnly) {

    /**
     * @name copy
     * @synopsis Returns a shallow copy of the receiver. Adequate for dealing
     *     with reference type attribute problems. If contentOnly is true then
     *     an Array is returned contains only the content values [0, 1, ...N],
     *     and no 'special values' on the receiver are copied.
     * @param {String|Array} aFilterNameOrKeys get*Interface() filter or key
     *     array.
     * @param {Boolean} contentOnly Copy content only? Default is true.
     * @returns {Array} A shallow copy of the receiver.
     * @todo
     */

    var content,

        newinst,

        filter,
        keys,

        len,
        i,
        ndx;

    content = TP.ifInvalid(contentOnly, true);
    if (content && TP.notValid(aFilterNameOrKeys)) {
        //  content only, we can optimize with a native call
        return this.slice(0, this.length);
    } else {
        //  looking for a filtered set of properties, have to reflect
        newinst = TP.ac();

        filter = TP.ifInvalid(aFilterNameOrKeys, TP.UNIQUE);

        if (TP.isString(filter)) {
            keys = this.getLocalInterface(filter);
        } else if (TP.isArray(filter)) {
            keys = filter;
        } else {
            //  Unusable filter
            return newinst;
        }

        len = keys.getSize();

        for (i = 0; i < len; i++) {
            ndx = keys.at(i);
            newinst.$set(ndx, this.at(ndx), false);
        }
    }

    return newinst;
});

//  ------------------------------------------------------------------------

Boolean.Inst.defineMethod('copy',
function() {

    /**
     * @name copy
     * @synopsis Returns a 'copy' of the receiver. Actually, a new instance
     *     whose value is equalTo that of the receiver.
     * @returns {Boolean} A copy of the receiver.
     */

    return TP.bc(this);
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('copy',
function() {

    /**
     * @name copy
     * @synopsis Returns a 'copy' of the receiver. Actually, a new instance
     *     whose value is equalTo that of the receiver.
     * @returns {Date} A copy of the receiver.
     */

    return TP.dc(this.getTime());
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('copy',
function() {

    /**
     * @name copy
     * @synopsis Returns a 'copy' of the receiver. Actually, a new instance
     *     whose value is equalTo that of the receiver. When copying a function
     *     the original is instrumented to know how many copies have been made
     *     and the new copy has the name of the original with an _n appended
     *     where n is the copy number.
     * @returns {Function} A copy of the receiver.
     */

    var count,
        source,
        $$funcCopy,
        realFunc;

    realFunc = this.$realFunc || this;

    //  track number of copies
    count = realFunc.$$copyCount || 0;
    count++;
    realFunc.$$copyCount = count;

    //  trick here is to turn the receiver's source into source for an
    //  anonymous function so we don't just get another with the same name
    //  Note the non-greediness of the RegExp here - don't want to match
    //  past the actual end of the parameter list.
    source = '$$funcCopy = ' +
                realFunc.toString().replace(/function (.*?)\(/,
                    'function $1_' + count + '(');
    eval(source);
    $$funcCopy.$realFunc = realFunc;

    return $$funcCopy;
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('copy',
function() {

    /**
     * @name copy
     * @synopsis Returns a 'copy' of the receiver. Actually, a new instance
     *     whose value is equalTo that of the receiver.
     * @returns {Number} A copy of the receiver.
     */

    return TP.nc(this);
});

//  ------------------------------------------------------------------------

RegExp.Inst.defineMethod('copy',
function() {

    /**
     * @name copy
     * @synopsis Returns a 'copy' of the receiver. Actually, a new instance
     *     whose value is equalTo that of the receiver.
     * @returns {RegExp} A copy of the receiver.
     */

    return TP.rc(this.toString());
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('copy',
function() {

    /**
     * @name copy
     * @synopsis Returns a 'copy' of the receiver. Actually, a new instance
     *     whose value is equalTo that of the receiver.
     * @returns {String} A copy of the receiver.
     */

    return TP.sc(this);
});

//  ------------------------------------------------------------------------
//  ITERATION
//  ------------------------------------------------------------------------

/*
JavaScript iteration is a real problem when handed an object which could be
of any type, and TP.ObjectProto has been modified. The iteration methods
here provide a common interface to iteration which ensures consistency and
proper behavior regardless. You can still use for/in for very limited cases
but TIBET's iteration methods, as well as our get*Interface calls, are a
much better way to either iterate or reflect on an object.

TIBET's iteration methods are based on the Smalltalk and Ruby APIs for
iteration, much in the same way TIBET mirrors their collection APIs.
Additional iteration methods mirroring those found natively in Mozilla
(every, some, map, etc. are found later in the kernel as well). We've
extended these functions from the Mozilla API slightly to offer first and
last element checking as well as the ability to break/continue from a nested
loop construct quickly. Reverse iteration is also supported in many cases.
*/

//  ------------------------------------------------------------------------

TP.defineCommonMethod('perform',
function(aFunction, shouldReverse) {

    /**
     * @name perform
     * @synopsis Performs the function with each item of the receiver where an
     *     item is typically a key/value pair in array form.
     * @description Perform can be used as an alternative to constructing for
     *     loops to iterate over a collection. By returning TP.BREAK from your
     *     iterator you can also cause the enclosing iteration to terminate. You
     *     can also call atStart or atEnd within your implemenation of aFunction
     *     to test if the iteration is at the beginning or end of the
     *     collection.
     * @param {Function} aFunction A function which performs some action with
     *     the element it is passed.
     * @param {Boolean} shouldReverse Should this be "reversePerform" ?
     * @returns {Object} The receiver.
     * @todo
     */

    var reverse,
        i,
        k,
        len,
        ind,
        instrument;

    reverse = TP.ifInvalid(shouldReverse, false);

    //  this works effectively for most object, even if it has to iterate
    //  once using for/in to acquire the list
    k = TP.keys(this);
    len = k.length;

    //  instrumenting at[Start|End] is expensive, make sure we need it
    instrument = true;
    if (len > TP.sys.cfg('perform.instrument_max')) {
        //  Test the interior of aFunction (*not* func in case it was bound)
        //  to see if there are any calls to atStart() or atEnd().
        instrument = TP.regex.PERFORM_INSTRUMENT.test(aFunction.toString());
    }

    for (i = 0; i < len; i++) {
        ind = reverse ? len - i - 1 : i;

        if (instrument) {
            //  update iteration edge flags so our function can tell
            //  when its at the start/end of the overall collection
            aFunction.atStart((i === 0) ? true : false);
            aFunction.atEnd((i === len - 1) ? true : false);
        }

        //  second parameter is location of data, so it will vary based on
        //  direction, content, etc. NOTE here that it's the actual key
        //  (hash key) to the data value
        if (aFunction(TP.ac(k[ind], this.at(k[ind])), k[ind]) === TP.BREAK) {
            break;
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('perform',
function(aFunction, shouldReverse) {

    /**
     * @name perform
     * @synopsis Performs the function with each element of the receiver. This
     *     is the core method in the iteration model, providing the basis for
     *     many of the other iteration aspects in TIBET.
     * @description Perform can be used as an alternative to constructing for
     *     loops to iterate over a collection. By returning TP.BREAK from your
     *     iterator you can also cause the enclosing iteration to terminate. You
     *     can also call atStart or atEnd within your implemenation of aFunction
     *     to test if the iteration is at the beginning or end of the
     *     collection.
     * @param {Function} aFunction A function which performs some action with
     *     the element it is passed.
     * @param {Boolean} shouldReverse Should this be "reversePerform" ?
     * @returns {Array} The receiver.
     * @todo
     */

    var len,
        reverse,

        instrument,

        i,
        ind;

    reverse = TP.ifInvalid(shouldReverse, false);

    len = this.length;

    //  SORT the array if necessary, before doing the iteration so we can
    //  deal with lazy sorting properly.
    this.$sortIfNeeded();

    //  instrumenting at[Start|End] is expensive, make sure we need it
    instrument = true;
    if (len > TP.sys.cfg('perform.instrument_max')) {
        //  Test the interior of aFunction (*not* func in case it was bound)
        //  to see if there are any calls to atStart() or atEnd().
        instrument = TP.regex.PERFORM_INSTRUMENT.test(aFunction.toString());
    }

    for (i = 0; i < len; i++) {
        ind = reverse ? len - i - 1 : i;

        if (instrument) {
            //  update iteration edge flags so our function can tell when
            //  its at the start/end of the overall collection.
            aFunction.atStart((i === 0) ? true : false);
            aFunction.atEnd((i === len - 1) ? true : false);
        }

        //  second parameter is location of data, so it will vary
        //  based on direction, content, etc
        if (aFunction(this[ind], ind) === TP.BREAK) {
            break;
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('perform',
function(aFunction, shouldReverse) {

    /**
     * @name perform
     * @synopsis Performs the function from 0 to N times where N is the value of
     *     the receiver. Note that negative numbers won't cause an iteration to
     *     occur.
     * @description Perform can be used as an alternative to constructing for
     *     loops to iterate over a collection. By returning TP.BREAK from your
     *     iterator you can also cause the enclosing iteration to terminate. You
     *     can also call atStart or atEnd within your implemenation of aFunction
     *     to test if the iteration is at the beginning or end of the
     *     collection.
     * @param {Function} aFunction A function which performs some action with
     *     the element it is passed.
     * @param {Boolean} shouldReverse Should this be "reversePerform" ?
     * @returns {Number} The receiver.
     * @todo
     */

    var i,
        ind,
        instrument,
        reverse;

    reverse = TP.ifInvalid(shouldReverse, false);

    //  instrumenting at[Start|End] is expensive, make sure we need it
    instrument = true;
    if (this > TP.sys.cfg('perform.instrument_max')) {
        //  Test the interior of aFunction (*not* func in case it was bound)
        //  to see if there are any calls to atStart() or atEnd().
        instrument = TP.regex.PERFORM_INSTRUMENT.test(aFunction.toString());
    }

    for (i = 0; i < this; i++) {
        ind = reverse ? this - i - 1 : i;

        if (instrument) {
            //  update iteration edge flags so our function can tell
            //  when its at the start/end of the overall collection
            aFunction.atStart((i === 0) ? true : false);
            aFunction.atEnd((i === this - 1) ? true : false);
        }

        //  since we're using a number as our iteration control the
        //  value and index provided are the same. the perform call
        //  for each collection type deals with that in its own way
        if (aFunction(ind, ind) === TP.BREAK) {
            break;
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('perform',
function(aFunction, shouldReverse) {

    /**
     * @name perform
     * @synopsis Performs the function from 0 to N times where N is the length
     *     of the receiver. Each iteration receives one character from the
     *     string.
     * @description Perform can be used as an alternative to constructing for
     *     loops to iterate over a collection. By returning TP.BREAK from your
     *     iterator you can also cause the enclosing iteration to terminate. You
     *     can also call atStart or atEnd within your implemenation of aFunction
     *     to test if the iteration is at the beginning or end of the
     *     collection.
     * @param {Function} aFunction A function which performs some action with
     *     the element it is passed.
     * @param {Boolean} shouldReverse Should this be "reversePerform" ?
     * @returns {String} The receiver.
     * @todo
     */

    var i,
        len,
        ind,
        instrument,
        reverse;

    reverse = TP.ifInvalid(shouldReverse, false);

    len = this.length;

    //  instrumenting at[Start|End] is expensive, make sure we need it
    instrument = true;
    if (len > TP.sys.cfg('perform.instrument_max')) {
        //  Test the interior of aFunction (*not* func in case it was bound)
        //  to see if there are any calls to atStart() or atEnd().
        instrument = TP.regex.PERFORM_INSTRUMENT.test(aFunction.toString());
    }

    for (i = 0; i < len; i++) {
        ind = reverse ? len - i - 1 : i;

        if (instrument) {
            //  update iteration edge flags so our function can tell
            //  when its at the start/end of the overall collection
            aFunction.atStart((i === 0) ? true : false);
            aFunction.atEnd((i === this - 1) ? true : false);
        }

        //  since we're iterating on a string here we'll pass the
        //  character at the current index as the 'item'
        if (aFunction(this.charAt(ind), ind) === TP.BREAK) {
            break;
        }
    }

    return this;
});

//  ------------------------------------------------------------------------
//  COMMON ITERATION VARIANTS
//  ------------------------------------------------------------------------

/*
The variants here all leverage their base type's ability to perform() over
an item (individual or ordered pair for a hash). While the core API here is
based on Smalltalk and Ruby we've got a few extras that help with common
operations you might want to perform on the contents like using apply, get,
set, etc.
*/

//  ------------------------------------------------------------------------

TP.defineCommonMethod('collect',
function(aFunction) {

    /**
     * @name collect
     * @synopsis Returns a new array which contains the elements of the receiver
     *     transformed by the function provided.
     * @param {Function} aFunction A function which should return the
     *     transformation of the element it is passed.
     * @returns {Array} An array containing the transformed elements.
     * @todo
     */

    var tmparr;

    tmparr = TP.ac();

    this.perform(
        function(item, index) {
            tmparr.push(aFunction(item, index));
        });

    return tmparr;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('collectGet',
function(propertyName) {

    /**
     * @name collectGet
     * @synopsis Collects the result of running a get() on each item in the
     *     receiver using the propertyName provided. This is a powerful way to
     *     "query" a set of objects for a particular property value. If an
     *     object doesn't implement get() a direct slot access is attempted.
     * @param {String} propertyName The name of the property to get() from each
     *     item.
     * @returns {Array} An array containing the return values of the individual
     *     invocations. Skipped objects have nulls in their return value
     *     positions.
     * @todo
     */

    return this.collect(
        function(item, index) {

            if (TP.canInvoke(item, 'get')) {
                return item.get(propertyName);
            } else {
                try {
                    //  yes, IE will throw exceptions sometimes
                    return item[propertyName];
                } catch (e) {
                    return null;
                }
            }
        });
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('collectInvoke',
function(aMethodName) {

    /**
     * @name collectInvoke
     * @synopsis Collects the result of running the named method on each item in
     *     the receiver, providing any remaining arguments as the arguments to
     *     the method. If any of the objects don't implement the named function
     *     then that object is simply skipped.
     * @param {String} aMethodName The name of the method to invoke.
     * @returns {Array} An array containing the return values of the individual
     *     invocations. Skipped objects have nulls in their return value
     *     positions.
     * @todo
     */

    var args;

    args = TP.args(arguments, 1);

    return this.collect(
        function(item, index) {

            if (TP.canInvoke(item, aMethodName)) {
                return item[aMethodName].apply(item, args);
            } else {
                return null;
            }
        });
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('convert',
function(aFunction) {

    /**
     * @name convert
     * @synopsis Alters each of the receivers elements by replacing them with
     *     the result returned by aFunction's transformation on that element.
     *     Similar to collect() but results replace originals rather than being
     *     returned in an array. Using convert with a consistent return value is
     *     like a fill().
     * @param {Function} aFunction The function to use to transform each element
     *     in the array.
     * @returns {Array} The receiver.
     * @signals Change
     * @todo
     */

    var thisref;

    thisref = this;

    this.perform(
        function(item, index) {
            thisref.atPut(index, aFunction(item, index));
        });

    //  NOTE: this ASSumes the function did something to at least one index
    this.changed('value', TP.UPDATE);

    return this;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('detectInvoke',
function(aMethodName) {

    /**
     * @name detectInvoke
     * @synopsis Executes the named method on each item in the receiver,
     *     providing any remaining arguments as the arguments to the method.
     * @description The semantics of this call are subtly different from both
     *     detect() and apply(). In this case the first invocation to return a
     *     non-null value is considered successful and the loop terminates,
     *     returning the value from the first successful invoke call. Note that
     *     the method will be bound to each item in the receiver in turn.
     * @param {String} aMethodName The name of the method to invoke.
     * @param {arguments} varargs Zero or more additional arguments to provide
     *     to the function.
     * @returns {Object} The receiver.
     * @todo
     */

    var args,
        retval;

    args = TP.args(arguments, 1);

    this.perform(
        function(item, index) {

            if (TP.canInvoke(item, aMethodName)) {
                retval = item[aMethodName].apply(item, args);
                if (TP.isValid(retval)) {
                    return TP.BREAK;
                }
            }
        });

    return retval;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('detectMax',
function(aFunction) {

    /**
     * @name detectMax
     * @synopsis Returns the "maximum" or largest value returned by aFunction
     *     when invoked successively on the receiver's items.
     * @param {Function} aFunction A function which should return the
     *     transformation of the element it is passed. when no function is
     *     provided the TP.RETURN_ARG0 function is used, meaning the values are
     *     tested without any change.
     * @returns {Object} The maximum value or undefined.
     */

    var func,
        retval;

    //  since the function is optional we'll use the ARG0 return and bind
    //  (which creates a wrapper) if needed
    func = TP.ifInvalid(aFunction, TP.RETURN_ARG0);

    retval = undefined;

    this.perform(
        function(item, index) {

            var val;

            val = func(item, index);
            if (val >= (retval || item)) {
                retval = item;
            }
        });

    return retval;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('detectMin',
function(aFunction) {

    /**
     * @name detectMin
     * @synopsis Returns the "minimum" or smallest value returned by aFunction
     *     when invoked successively on the receiver's items.
     * @param {Function} aFunction A function which should return the
     *     transformation of the element it is passed. when no function is
     *     provided the TP.RETURN_ARG0 function is used, meaning the values are
     *     tested without any change.
     * @returns {Object} The minimum value or undefined.
     */

    var func,
        retval;

    //  since the function is optional we'll use the ARG0 return and bind
    //  (which creates a wrapper) if needed
    func = TP.ifInvalid(aFunction, TP.RETURN_ARG0);

    retval = undefined;

    this.perform(
        function(item, index) {

            var val;

            val = func(item, index);
            if (val <= (retval || item)) {
                retval = item;
            }
        });

    return retval;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('flatten',
function() {

    /**
     * @name flatten
     * @synopsis Returns an array containing the receiver's key/value items in a
     *     flattened form. For example, TP.hc('a', 1, 'b', 2).flatten() returns
     *     the equivalent of TP.ac('a', 1, 'b', 2);
     * @returns {Array} A new array containing the elements of the receiver in
     *     flattened form.
     * @todo
     */

    return this.getItems().flatten();
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('grep',
function(aPattern, aFunction) {

    /**
     * @name grep
     * @synopsis Returns an array containing items (potentially transformed by
     *     aFunction) whose TP.str(item) values matched the regular expression
     *     pattern provided.
     * @description This method works on the values of the collection, so a call
     *     to grep() on a Hash will not grep the keys, it will grep the values.
     *     Use grepKeys() to scan a collection by its keys/indexes.
     * @param {String|RegExp} aPattern A string or regular expression to test
     *     items with.
     * @param {Function} aFunction A function which should return the
     *     transformation of the element it is passed.
     * @returns {Array} An array containing the matched values.
     * @todo
     */

    var func,
        grepRegex,
        tmparr;

    //  since the function is optional we'll use the ARG0 return
    //  and bind (which creates a wrapper) if needed
    func = TP.ifInvalid(aFunction, TP.RETURN_ARG0);

    tmparr = TP.ac();
    grepRegex = TP.isRegExp(aPattern) ? aPattern : TP.rc(aPattern);

    this.perform(
        function(item, index) {

            //  by default we grep the values, not the keys
            if (TP.isPair(item)) {
                if (grepRegex.test(TP.str(item.last()))) {
                    tmparr.push(func(item, index));
                }
            } else {
                if (grepRegex.test(TP.str(item))) {
                    tmparr.push(func(item, index));
                }
            }
        });

    return tmparr;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('grepKeys',
function(aPattern, aFunction) {

    /**
     * @name grepKeys
     * @synopsis Returns an array containing items (potentially transformed by
     *     aFunction) whose TP.str(index) values matched the regular expression
     *     pattern provided.
     * @description The value being tested is the index (0-N for Arrays, key
     *     value for Object/Hash).
     * @param {String|RegExp} aPattern A string or regular expression to test
     *     items with.
     * @param {Function} aFunction A function which should return the
     *     transformation of the element it is passed.
     * @returns {Array} An array containing the matched items.
     * @todo
     */

    var func,
        grepRegex,
        tmparr;

    //  since the function is optional we'll use the ARG0 return
    //  and bind (which creates a wrapper) if needed
    func = TP.ifInvalid(aFunction, TP.RETURN_ARG0);

    tmparr = TP.ac();
    grepRegex = TP.isRegExp(aPattern) ? aPattern : TP.rc(aPattern);

    this.perform(
        function(item, index) {

            if (grepRegex.test(TP.str(index))) {
                tmparr.push(func(item, index));
            }
        });

    return tmparr;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('groupBy',
function(keyCriteria, selectionCriteria) {

    /**
     * @name groupBy
     * @synopsis Returns a TP.lang.Hash whose keys are the return values
     *     produced by keyCriteria for each item, and whose values are arrays of
     *     the items matching that key OR an Array containing nested arrays of
     *     length N where N is the criteria you provided. To skip an element and
     *     have it left out (i.e. the equivalent of a "having" clause) you can
     *     add a second function which returns true when the value should be
     *     included.
     * @param {Number|Function} keyCriteria When a number, works to split the
     *     collection in groups of that count. When a function the return value
     *     of the function serves as the 'key' which sorts the values into a
     *     hash.
     * @param {Function} selectionCriteria A function which should return true
     *     for elements that should be grouped.
     * @returns {Array} A new array containing the elements selected.
     * @example
     *      arr = TP.ac(1,2,3,4,5,6).groupBy(3);
     *
     *     returns:
     *
     *     [[1, 2, 3], [4, 5, 6]]
     *
     *     while the same array after:
     *
     *     groupBy(function(item){return item.isOdd()})
     *
     *     returns:
     *
     *     {'true' : [1, 3, 5], 'false' : [2, 4, 6]}
     * @todo
     */

    var dict,
        list;

    switch (typeof(keyCriteria)) {
        case 'number':

            list = TP.ac();

            this.perform(
                function(item, index) {

                    var arr;

                    if (TP.isCallable(selectionCriteria)) {
                        if (!selectionCriteria(item)) {
                            return;
                        }
                    }

                    //  when starting a new break we push a new entry in the
                    //  list
                    if ((index % keyCriteria) === 0) {
                        arr = TP.ac();
                        list.push(arr);
                    } else {
                        arr = list.last();
                    }

                    arr.push(item);
                });

            return list;

        case 'function':

            dict = TP.hc();

            this.perform(
                function(item, index) {

                    var key,
                        arr;

                    if (TP.isCallable(selectionCriteria)) {
                        if (!selectionCriteria(item)) {
                            return;
                        }
                    }

                    key = keyCriteria(item, index);
                    if (TP.notValid(arr = dict.at(key))) {
                        arr = TP.ac();
                        dict.atPut(key, arr);
                    }
                    arr.push(item);
                });

            return dict;

        default:

            return this.raise('TP.sig.InvalidParameter');
    }
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('injectInto',
function(anAccumulator, aFunction) {

    /**
     * @name injectInto
     * @synopsis Performs the function with each element of the receiver as the
     *     first argument and anAccumulator as the second argument. The current
     *     item index is provided as the third argument.
     * @description injectInto allows you to pass an "accumulator" to the
     *     function along with each element of the receiver as it performs the
     *     function. This is useful when attempting to do an operation like
     *     summing all the values in an array where the added variable you pass
     *     in holds the sum.
     *
     *     The actual behavior is embodied in:
     *
     *     anAccumulator = aFunction(this[index], anAccumulator, index)
     *
     *     You should therefore pass a function which expects three arguments
     *     where the first argument is the current array element. On completion
     *     the injected value is returned.
     * @param {Object} anAccumulator The value to pass as the second argument to
     *     aFunction.
     * @param {Function} aFunction A function which performs some action with
     *     the elements it is passed and returns anAccumulator.
     * @returns {Object} The value of performing aFunction with anAccumulator
     *     over the receiver.
     * @todo
     */

    var value;

    value = anAccumulator;

    this.perform(
        function(item, index) {
            value = aFunction(item, value, index);
        });

    return value;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('orderedBy',
function(aFunction) {

    /**
     * @name orderedBy
     * @synopsis Sorts the receiver's data based on the return values of the
     *     function provided. This method allows you to avoid some of the
     *     semantics involved in the native sort() routine so you can write sort
     *     functions that are more natural.
     * @param {Function} aFunction The return value function.
     * @returns {Array} An array containing the items of the receiver sorted as
     *     requested.
     * @todo
     */

    var items;

    items = this.collect(
        function(item, index) {
            return TP.ac(item, aFunction(item, index));
        });

    return items.sort(TP.SECOND_ITEM_SORT);
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('partition',
function(aFunction) {

    /**
     * @name partition
     * @synopsis Tests each element against the function provided and returns a
     *     new array containing the passed items in the first index and the
     *     failed items in the second index.
     * @param {Function} aFunction A function which should return true or false
     *     after testing the element it is passed.
     * @returns {Array} A new array containing the elements selected.
     * @todo
     */

    var good,
        evil;

    good = TP.ac();
    evil = TP.ac();

    this.perform(
        function(item, index) {

            if (aFunction(item, index)) {
                good.push(item);
            } else {
                evil.push(item);
            }
        });

    return TP.ac(good, evil);
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('performInvoke',
function(aMethodName) {

    /**
     * @name performInvoke
     * @synopsis Executes the named method on each item in the receiver,
     *     providing any remaining arguments as the arguments to the method. If
     *     any of the objects don't implement the named function then that
     *     object is simply skipped.
     * @param {String} aMethodName The name of the method to invoke.
     * @returns {Object} The receiver.
     */

    var args;

    args = TP.args(arguments, 1);

    return this.perform(
        function(item, index) {

            if (TP.canInvoke(item, aMethodName)) {
                return item[aMethodName].apply(item, args);
            } else {
                return null;
            }
        });
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('performOver',
function(aFunction, aCollection) {

    /**
     * @name performOver
     * @synopsis Executes aFunction on the elements found at the indexes in
     *     aCollection. This allows you to iterate in a more sparse fashion. If
     *     no collection is provided this works just like perform.
     * @param {Function} aFunction The function to perform.
     * @param {TP.api.CollectionAPI} aCollection The collection of indexes.
     * @returns {Object} The receiver.
     * @todo
     */

    var thisref;

    if (TP.notValid(aCollection)) {
        return this.perform(aFunction);
    }

    thisref = this;

    aCollection.perform(
        function(item, index) {
            aFunction(thisref.at(item), item, index);
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('performSet',
function(attributeName, attributeValue) {

    /**
     * @name performSet
     * @synopsis Executes a set() on each item in the receiver using the
     *     attributeName and attributeValue provided. This is a powerful way to
     *     "update" a set of objects with a particular property value. If an
     *     object doesn't implement set() a direct slot access is attempted.
     * @param {String} attributeName The name of the attribute to set() on each
     *     item.
     * @returns {Object} The receiver.
     */

    this.perform(
        function(item, index) {

            if (TP.canInvoke(item, 'set')) {
                item.set(attributeName, attributeValue);
            } else {
                try {
                    //  yes, IE will throw exceptions sometimes
                    item[attributeName] = attributeValue;
                    return item[attributeName];
                } catch (e) {
                }
            }
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('performUntil',
function(aFunction, terminateFunction) {

    /**
     * @name performUntil
     * @synopsis Performs the function with each element of the receiver until
     *     terminateFunction returns true.
     * @description performUntil can be used as an alternative to constructing
     *     repeat loops to iterate over a collection.
     * @param {Function} aFunction A function which performs some action with
     *     the element it is passed.
     * @param {Function} terminateFunction A test Function which ends the loop.
     *     This should be a Function that returns a Boolean. It is passed the
     *     same data as the performed function.
     * @returns {Object} The receiver.
     * @todo
     */

    this.perform(
        function(item, index) {

            aFunction(item, index);

            if (terminateFunction(item, index)) {
                return TP.BREAK;
            }
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('performWhile',
function(aFunction, terminateFunction) {

    /**
     * @name performWhile
     * @synopsis Performs the function with each element of the receiver while
     *     terminateFunction returns true.
     * @description performWhile can be used as an alternative to constructing
     *     while loops to iterate over a collection.
     * @param {Function} aFunction A function which performs some action with
     *     the element it is passed.
     * @param {Function} terminateFunction A test Function which ends the loop.
     *     This should be a Function that returns a Boolean. It is passed the
     *     same data as the performed function.
     * @returns {Object} The receiver.
     * @todo
     */

    this.perform(
        function(item, index) {

            if (TP.notTrue(terminateFunction(item, index))) {
                return TP.BREAK;
            }

            aFunction(item, index);
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('performWith',
function(aFunction, aCollection) {

    /**
     * @name performWith
     * @synopsis Executes a two-argument function (aFunction) with the first
     *     argument set to receiver[item] and second argument set to
     *     aCollection.at(index) for each element in the receiver. Note that
     *     once the items in the receiver have been exhausted this method will
     *     stop processing. If the collection is shorter nulls are used, if the
     *     collection is longer its trailing items are left unused.
     * @param {Function} aFunction A function which accepts three arguments: 1)
     *     The element at the current index in the receiver. 2) The element at
     *     the current index in aCollection. 3) The current index.
     * @param {TP.api.CollectionAPI} aCollection The collection of elements to
     *     use for the second argument to aFunction.
     * @raises TP.sig.InvalidCollection, CollectionSizeMismatch
     * @returns {Object} The receiver.
     * @todo
     */

    this.perform(
        function(item, index) {

            //  NOTE that the index is the key where the data was found, so
            //  this should work as long as the two collections are of the
            //  same index type...otherwise it's a bit of a mess :)
            aFunction(item, aCollection.at(index), index);
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('reject',
function(aFunction) {

    /**
     * @name reject
     * @synopsis Tests each element against the function provided and returns a
     *     new array containing those elements which aren't rejected by the
     *     function. The function should return true for elements which are to
     *     be skipped.
     * @param {Function} aFunction A function which should return true or false
     *     after testing the element it is passed.
     * @returns {Array} A new array containing the elements which weren't
     *     rejected.
     * @todo
     */

    var tmparr;

    tmparr = TP.ac();

    this.perform(
        function(item, index) {

            if (!aFunction(item, index)) {
                tmparr.push(item);
            }
        });

    if (TP.isString(this)) {
        return tmparr.join('');
    }

    return tmparr;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('select',
function(aFunction) {

    /**
     * @name select
     * @synopsis Tests each element against the function provided and returns a
     *     new array containing those elements which are selected by the
     *     function. The function should return true for elements which are to
     *     be returned.
     * @param {Function} aFunction A function which should return true or false
     *     after testing the element it is passed.
     * @returns {Array} A new array containing the elements selected.
     * @todo
     */

    var tmparr;

    tmparr = TP.ac();

    this.perform(
        function(item, index) {

            if (aFunction(item, index)) {
                tmparr.push(item);
            }
        });

    if (TP.isString(this)) {
        return tmparr.join('');
    }

    return tmparr;
});

//  ------------------------------------------------------------------------
//  TYPE-SPECIFIC VARIANTS
//  ------------------------------------------------------------------------

/*
The operations here are variants that rely on type-specific processing to do
their work.
*/

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('choose',
function() {

    /**
     * @name choose
     * @synopsis Runs the functions contained in the receiver using the argument
     *     list provided, returning the first successful Function's return
     *     value. Essentially an iteration-based try/catch using blocks.
     * @description This is a function-specific operation, meaning that it's
     *     appropriate for arrays containing alternative functions you want to
     *     run. In this case, the return value of the first function which
     *     doesn't throw an exception will be used.
     * @returns {Object} The first successful Function's return value.
     */

    var args,
        retval;

    args = TP.args(arguments);

    this.perform(
        function(item, index) {

            try {
                retval = item.apply(item, args);

                //  a successful execution means break our iteration
                return TP.BREAK;
            } catch (e) {
                //  an exception in the function just means continue trying
                return;
            }
        });

    return retval;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('compact',
function(aFilter) {

    /**
     * @name compact
     * @synopsis Returns the receiver with all filtered values removed. When a
     *     filter is supplied that filter defines what values should be removed,
     *     i.e. the default filter is TP.notValid(). When invoked without a
     *     filter the standard TP.notValid() call is used so that nulls and
     *     undefined values are removed. NOTE that the receiver is always
     *     modified in place. Use select() or reject() to produce a new array
     *     without values and simply provide a suitable filtering function.
     * @description In some sense using a filtering function seems like
     *     something that should be done via the remove() function but that
     *     would complicate the semantics when you want to remove function
     *     instances as values in an array. Hence we allow an optional filtering
     *     function in compact whose semantics aren't tied to value removal as
     *     closely. Also note that the filtering value is inverted from how
     *     you'd expect remove to operate...compact is more like reject() than
     *     select().
     * @param {Function} aFilter An optional filtering function which should
     *     return true for elements which should be removed. The default
     *     function is TP.notValid().
     * @returns {Array} The receiver.
     * @todo
     */

    var filter,
        wi,

        len,
        i,

        val;

    //  default test is is the value valid (non null and defined)
    filter = TP.ifInvalid(aFilter, TP.notValid);

    wi = 0;
    len = this.length;

    for (i = 0; i < len; i++) {
        val = this[i];

        //  NOTE that the filter defines what to remove, so we invert that
        //  and write only those elements the filter doesn't reject
        if (!filter(val)) {
            this[wi] = val;
            wi++;
        }
    }

    if (wi < len) {
        this.length = wi;
        this.changed('length', TP.DELETE,
                        TP.hc(TP.OLDVAL, len, TP.NEWVAL, wi));
    }

    return this;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('conform',
function(anInterface, inline) {

    /**
     * @name conform
     * @synopsis Returns the receiver with all values which don't implement the
     *     interface removed. The resulting collection's values will, on
     *     completion of this method, respond to the next iteration
     *     (collectInvoke perhaps) that you want to run.
     * @param {String|Array} anInterface A method name or collection of them to
     *     test against.
     * @param {Boolean} inline False to return a new array instead of collapsing
     *     inline. Default is true.
     * @returns {Array} The receiver.
     * @todo
     */

    var i,
        len,
        item;

    //  simple select when a new collection is desired
    if (TP.isFalse(inline)) {
        return this.select(
            function(it) {

                return TP.canInvoke(it, anInterface);
            });
    }

    //  this loop will clear any values where the value isn't conforming,
    //  which sets the collection up for a compact to remove all nulls
    //  (since they don't conform to any interface)
    len = this.length;
    for (i = 0; i < len; i++) {
        item = this[i];
        if (!TP.canInvoke(item, anInterface)) {
            this.atPut(i, null, false);
        }
    }

    return this.compact();
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('detect',
function(aFunction, startIndex) {

    /**
     * @name detect
     * @synopsis Returns the first element in the receiver which matches the
     *     criteria provided or null if the element isn't found.
     * @param {Function} aFunction A function which should return true if the
     *     element it is passed passes the function's test, or false if it does
     *     not.
     * @param {Number} startIndex A starting index for the search.
     * @returns {Object} The element detected or undefined.
     * @todo
     */

    var retval,
        start;

    start = TP.ifInvalid(this.normalizeIndex(startIndex), 0);

    this.$sortIfNeeded();

    retval = undefined;

    this.perform(
        function(item, index) {

            if (index < start) {
                return;
            }

            if (aFunction(item, index)) {
                retval = item;

                return TP.BREAK;
            }
        });

    return retval;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('detectInvoke',
function(aMethodName) {

    /**
     * @name detectInvoke
     * @synopsis Executes the named method on each item in the receiver,
     *     providing any remaining arguments as the arguments to the method.
     * @description The semantics of this call are subtly different from both
     *     detect() and apply(). In this case the first invocation to return a
     *     non-null value is considered successful and the loop terminates,
     *     returning the value from the first successful invoke call. Note that
     *     the method will be bound to each item in the receiver in turn.
     * @param {String} aMethodName The name of the method to invoke.
     * @param {arguments} varargs Zero or more additional arguments to provide
     *     to the function.
     * @returns {Object} The receiver.
     * @todo
     */

    var args,
        retval;

    args = TP.args(arguments, 1);

    this.perform(
        function(item, index) {

            if (TP.canInvoke(item, aMethodName)) {
                retval = item[aMethodName].apply(item, args);
                if (TP.isValid(retval)) {
                    return TP.BREAK;
                }
            }
        });

    return retval;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('invoke',
function(aThis, anArgArray, whenError) {

    /**
     * @name invoke
     * @synopsis Runs the functions contained in the receiver using the argument
     *     list provided. An easy way to run a list of functions as if they were
     *     a single function.
     * @description This operation is used to allow a list of functions to
     *     operate somewhat polymorphically with a single function for purposes
     *     of execution. Because of that semantic goal we return the value of
     *     the last function's invocation. This means an array of one function,
     *     or the function itself, are indistinguishable when using invoke.
     * @param {Object} aThis An object to use as the this reference for the
     *     apply call.
     * @param {arguments} anArgArray An array or arguments object containing the
     *     arguments to apply.
     * @param {Function} whenError An optional error handler function to call
     *     for any iterations which fail. Arguments to this function include the
     *     item, index, and error object. Called for each individual function in
     *     the list which fails in any way.
     * @returns {Object} The result of the last invocation.
     * @todo
     */

    var retval;

    this.perform(
        function(item, index) {

            try {
                retval = item.apply(aThis, anArgArray);
            } catch (e) {
                if (TP.isCallable(whenError)) {
                    whenError(item, index, e);
                }
            }
        });

    return retval;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('invokeAsync',
function(aThis, anArgArray, whenError, stopOnError) {

    /**
     * @name invokeAsync
     * @synopsis Runs the functions contained in the receiver asynchronously
     *     using the argument list provided. An easy way to run a list of
     *     functions as if they were a series of synchronous operations when
     *     they need to run asynchronously (usually so they can flush output to
     *     the screen). The array will signal InvokeComplete when all items have
     *     been processed. Results/errors can be found in the signal.
     * @param {Object} aThis An object to use as the this reference for the
     *     apply call.
     * @param {arguments} anArgArray An array or arguments object containing the
     *     arguments to apply.
     * @param {Function} whenError An optional error handler function to call
     *     for any iterations which fail. Arguments to this function include the
     *     item, index, and error object. Called for each individual function in
     *     the list which fails in any way.
     * @param {Boolean} stopOnError True to have the invocation sequence stop
     *     after any error occur. Default is false.
     * @todo
     */

    var that,
        results,
        arr,
        runner,
        errors,
        next;

    that = this;
    results = TP.ac();
    errors = TP.ac();

    arr = this.collect(
            function (item, index) {
                return function () {
                    try {
                        results.atPut(index, item.apply(aThis, anArgArray));
                    } catch (e) {
                        errors.atPut(index, e);
                        if (TP.isCallable(whenError)) {
                            whenError(next, index, e);
                        } else {
                            that.raise('TP.sig.InvokeFailed',
                                TP.ec(e, 'Invocation failed'));
                        }
                    } finally {
                        arr.signal('TP.sig.InvokeNext');
                    }
                };
            });

    runner = function () {
        if (stopOnError && errors.length > 0) {
            that.signal('TP.sig.InvokeComplete',
                TP.hc('results', results, 'errors', errors));
        }

        next = arr.shift();
        if (TP.isCallable(next)) {
            setTimeout(next);
        } else {
            that.signal('TP.sig.InvokeComplete',
                TP.hc('results', results, 'errors', errors));
        }
    };

    runner.observe(arr, 'TP.sig.InvokeNext');
    runner();

    return;
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('by',
function(aStep, aFunction) {

    /**
     * @name by
     * @synopsis Runs the function provided, much like perform(), for each index
     *     which matches the step value. The indexing is zero-based. For
     *     example, (9).by(3) is equivalent to (0).to(9).by(3).perform() and the
     *     function will run at indexes 0, 2, 5, and 8.
     * @param {Number} aStep A number to mod (%) against the index to determine
     *     if the function should be run at this index.
     * @param {Function} aFunction The iteration block to execute.
     * @returns {Number} The number of times the function was invoked.
     * @todo
     */

    var count;

    count = 0;

    this.perform(
        function(item, index) {

            if ((index % aStep) === 0) {
                count++;
                aFunction(item, index);
            }
        });

    return count;
});

//  ------------------------------------------------------------------------

RegExp.Inst.defineMethod('performWith',
function(aFunction, anObject) {

    /**
     * @name performWith
     * @synopsis Performs the function from 0 to N times where N is the number
     *     of times the receiver matches the string value of the object
     *     provided. Obviously for N to be greater than 1 you must be messaging
     *     a global regular expression, otherwise the replacement function will
     *     only be called once for the first match. Note that this iteration
     *     model cannot be reversed.
     * @description A variation on String.replace where the function is used
     *     within an iterator so it can be controlled via normal TIBET iteration
     *     logic. As with String.replace the function will be passed at least 3
     *     arguments, the match string, the index of the match, and the string
     *     itself. There may be additional arguments, at arguments[1] through N,
     *     for any parenthesized subexpressions in the expression. Returning a
     *     TP.CONTINUE in your function will cause the current match to be
     *     skipped and the value preserved. Returning a TP.BREAK will terminate
     *     the replacement loop entirely, skipping any remaining matches.
     * @param {Function} aFunction A function accepting the parameters typically
     *     provided to a replace() function.
     * @param {Object} anObject The object whose string representation should be
     *     iterated.
     * @todo
     */

    var str,
        thisref,
        len;

    str = TP.str(anObject);
    thisref = this;

    //  "auto-reset" so we start from the beginning of the string
    this.lastIndex = 0;

    //  only going to find one match if we're not global...but if we're
    //  global then we'd have to run it to see how many matches we get
    len = this.global ? NaN : 1;

    //  the replace call is what drives the actual iteration so we don't
    //  have to construct a loop here. what we do have to do is create a
    //  function that can pass the arguments along to the incoming function
    //  and which can trap the continue and break logic from the inner
    //  function properly
    return str.replace(
        this,
        function() {

            var retval;

            retval = aFunction.apply(this, arguments);
            switch (retval) {
                case TP.BREAK:

                    //  break trick is to set the regular expression's
                    //  lastIndex to the length of the string, terminating
                    //  the loop
                    thisref.lastIndex = str.length;
                    return arguments[0];

                case TP.CONTINUE:

                    //  nothing to do, but don't return new value
                    return arguments[0];

                default:
                    return retval;
            }
        });
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('convert',
function(aFunction) {

    /**
     * @name convert
     * @synopsis Returns a new String whose content represents the converted
     *     characters from aFunction.
     * @param {Function} aFunction The function to use to transform each
     *     character.
     * @returns {String} A String containing the converted characters.
     */

    var thisref,
        arr;

    thisref = this;
    arr = TP.ac();

    this.perform(
        function(item, index) {
            arr.push(aFunction(item, index));
        });

    return arr.join('');
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('times',
function(aNumber) {

    /**
     * @name times
     * @synopsis Returns the string repeated the specified number of times.
     * @param {Number} aNumber The number of times to repeat string.
     * @raises TP.sig.InvalidParameter
     * @returns {String} The receiver repeated aNumber of times.
     */

    var arr,
        thisref;

    if (!TP.isNumber(aNumber)) {
        this.raise('TP.sig.InvalidParameter');
    }

    arr = TP.ac();
    thisref = this;

    aNumber.perform(
        function() {
            arr.push(thisref);
        });

    return arr.join('');
});

//  ------------------------------------------------------------------------
//  CONTAINMENT
//  ------------------------------------------------------------------------

/**
 * @Standard collection query...do you have this object/value/key/etc? TIBET
 *     adds additional functionality here by supporting two types of testing:
 *     TP.EQUALITY and TP.IDENTITY. So when you ask whether obj.contains(x) you
 *     can ask for the results based on either condition.
 * @todo
 */

//  ------------------------------------------------------------------------

TP.defineCommonMethod('containsKey',
function(aKey) {

    /**
     * @name containsKey
     * @synopsis Returns true if the receiver contains the key provided.
     * @param {Object} aKey The key to test.
     * @returns {Boolean} Whether or not the receiver contains the key provided.
     */

    var obj;

    obj = this.at(aKey);

    return TP.isDefined(obj) && !TP.$$isDNU(obj);
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('containsValue',
function(aValue, aTest) {

    /**
     * @name containsValue
     * @synopsis Returns true if the receiver contains the value provided.
     * @param {Object} aValue The value to test.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Boolean} Whether or not the receiver contains the value
     *     provided.
     * @todo
     */

    var it;

    it = this.detect(
        function(item, index) {

            switch (aTest) {
                case TP.IDENTITY:

                    return TP.identical(item.last(), aValue);

                default:

                    return TP.equal(item.last(), aValue);
            }
        });

    return TP.isDefined(it);
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('contains',
function(anItem, aTest) {

    /**
     * @name contains
     * @synopsis Returns true if the receiver contains the item provided.
     * @description The test provided allows the caller to define whether
     *     identity (===) or equality (==) are used for comparisons. NOTE: this
     *     method makes use of the TP.equal() function of TIBET for equality
     *     comparisons so that arrays, objects, dates, and functions with
     *     equivalent string values will compare equal.
     * @param {TPOrderedPair} anItem The item (key/value pair) to test.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Boolean} Whether or not the receiver contains the value
     *     provided.
     * @todo
     */

    var key,
        val;

    if (!TP.isPair(anItem) || TP.notValid(key = anItem.at(0))) {
        return false;
    }

    val = this.at(key);

    switch (aTest) {
        case TP.IDENTITY:

            return TP.identical(val, anItem.last());

        default:

            return TP.equal(val, anItem.last());
    }

    return false;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('contains',
function(aValue, aTest) {

    /**
     * @name contains
     * @synopsis Returns true if the receiver contains the value provided.
     * @description The test provided allows the caller to define whether
     *     identity (===) or equality (==) are used for comparisons. NOTE: this
     *     method makes use of the TP.equal() function of TIBET for equality
     *     comparisons so that arrays, objects, dates, and functions with
     *     equivalent string values will compare equal.
     * @param {Object} aValue The value to test.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Boolean} Whether or not the receiver contains the value
     *     provided.
     * @todo
     */

    var it;

    //  string tests are a lot faster when using a custom test
    if (TP.isString(aValue)) {
        return this.containsString(aValue);
    }

    it = this.detect(
        function(item, index) {

            switch (aTest) {
                case TP.IDENTITY:

                    return TP.identical(item, aValue);

                default:

                    return TP.equal(item, aValue);
            }
        });

    //  might contain a null, and nulls can be compared
    return TP.isDefined(it);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('containsString',
function(aValue) {

    /**
     * @name containsString
     * @synopsis Returns true if the receiver contains the string provided. This
     *     call is significantly faster for finding strings in potentially large
     *     arrays than a simple contains call.
     * @param {String} aValue The value that at least one element in the
     *     receiver should be equal to for this method to return true.
     * @returns {Boolean} Whether or not the receiver contains the String
     *     provided.
     */

    var len,
        re,
        str,
        i,
        val;

    len = this.length;

    if (len < TP.sys.cfg('array.contains_loop_max')) {
        for (i = 0; i < len; i++) {
            if (this[i] === aValue) {
                return true;
            }
        }

        //  We didn't find it using a pendantic strict equality compare -
        //  we're sure not going to find it below.
        return false;
    }

    //  one issue is that things like literal $, '.', or other quantifiers
    //  won't match unless we escape them in the regular expression string
    TP.regex.QUANTIFIERS.lastIndex = 0;
    if (TP.regex.QUANTIFIERS.test(aValue)) {
        val = aValue.replace(/\$/g, '\\$');
        val = val.replace(/\./g, '\\.');
        val = val.replace(/\?/g, '\\?');
        val = val.replace(/\(/g, '\\(');
        val = val.replace(/\)/g, '\\)');
    } else {
        val = aValue;
    }

    //  trick here is to create a bounded string so we can search via regex
    try {
        str = TP.JOIN + this.join(TP.JOIN) + TP.JOIN;
        re = TP.rc(TP.JOIN + val + TP.JOIN);

        return re.test(str);
    } catch (e) {
        //  old-fashioned way, just iterate
        for (i = 0; i < this.length; i++) {
            if (this[i] === aValue) {
                return true;
            }
        }
    }

    return false;
});

//  ------------------------------------------------------------------------
//  LOGGING - COMPONENT FILTERING
//  ------------------------------------------------------------------------

/**
 * For the TIBET logging system to function more effectively it's necessary to
 * have ways to control which components are activated for certain forms of
 * logging. This is accomplished by a combination of flags which are maintained
 * on an instance and type level which the logging methods check when logging.
 * @todo
 */

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('shouldLog',
function(aFlag, aLogName) {

    /**
     * @name shouldLog
     * @synopsis Defines whether the receiver should log to the activity log
     *     relative to a particular log type. When no type is provided the
     *     setting takes effect for all logging for the receiver.
     * @param {Boolean} aFlag The optional state of the flag to be set as a
     *     result of this call.
     * @param {String} aLogName One of the TIBET log type names, or a custom
     *     name if custom logging is being used. See TP.*_LOG for names.
     * @returns {Boolean} The value of the flag after any optional set.
     * @todo
     */

    var flag,
        owner;

    //  specific instruction/query regarding a particular log
    if (TP.isString(aLogName)) {
        if (TP.isBoolean(aFlag)) {
            this['$shouldLog' + aLogName] = TP.bc(aFlag);
        }

        flag = this['$shouldLog' + aLogName];
    } else {
        if (TP.isBoolean(aFlag)) {
            this['$shouldLog' + TP.LOG] = TP.bc(aFlag);
        }

        flag = this['$shouldLog' + TP.LOG];
    }

    if (TP.isBoolean(flag)) {
        return flag;
    } else if (TP.isMethod(this)) {
        //  functions that are methods can test their owners to see if
        //  logging is turned off for specific types or instances
        if (TP.isValid(owner = this[TP.OWNER])) {
            if (TP.canInvoke(owner, 'shouldLog')) {
                return owner.shouldLog(aFlag, aLogName);
            }
        }

        return true;
    } else {
        return true;
    }
});

//  ------------------------------------------------------------------------
//  LOGGING - TP.boot.Log ENHANCEMENTS
//  ------------------------------------------------------------------------

/**
 *  Additional methods for the primitive log type. These support simple log
 *  maintenance by leveraging more of the TIBET kernel than the boot system
 *  scripts can assume.
 */

//  ------------------------------------------------------------------------

TP.boot.Log.prototype.clearEntries = function(aLogName, aLogLevel) {

    /**
     * @name clearEntries
     * @synopsis Removes all entries whose log name and level matches the log
     *     name and level provided. For example, providing a log name of
     *     TP.IO_LOG will remove all IO log entries from the activity log, while
     *     adding a level of TP.ERROR will remove all IO log entries that have a
     *     level of TP.ERROR.
     * @param {String} aLogName The log name, such as TP.IO_LOG,
     *     TP.INFERENCE_LOG, etc. Default is the entire activity log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM. Default is to remove all levels.
     * @todo
     */

    if (TP.isEmpty(aLogName)) {
        this.messages.length = 0;

        return this;
    }

    //  compact will remove anything which this function returns true for,
    //  so our goal is to return true whenever an entry matches our spec
    return this.messages.compact(
        function(it) {

            //  empty? every entry is suspect...just check level
            if (TP.isEmpty(aLogName) ||
                    (aLogName === it[TP.boot.LOG_ENTRY_NAME])) {
                //  no level filter? all entries for the named log go
                if (TP.isEmpty(aLogLevel)) {
                    return true;
                } else {
                    return aLogLevel !== it[TP.boot.LOG_ENTRY_LEVEL];
                }
            }

            return false;
        });
};

//  ------------------------------------------------------------------------

TP.boot.Log.prototype.lastEntry = function(aLogName, aLogLevel) {

    /**
     * @name lastEntry
     * @synopsis Returns the last entry for the named log. If no log name is
     *     provided then the last entry of any category is returned.
     * @param {String} aLogName The log name, such as TP.IO_LOG,
     *     TP.INFERENCE_LOG, etc.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Array} The log entry containing the last entry for the named
     *     log.
     * @todo
     */

    var list,
        entry;

    if (TP.isEmpty(list = this.getEntries(aLogName, aLogLevel))) {
        return null;
    }

    entry = list.last();

    return entry;
};

//  ------------------------------------------------------------------------

TP.boot.Log.prototype.getEntries = function(aLogName, aLogLevel) {

    /**
     * @name getEntries
     * @synopsis Returns an array containing the entries for the named log which
     *     match the log level provided.
     * @param {String} aLogName The log name, such as TP.IO_LOG,
     *     TP.INFERENCE_LOG, etc.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Array} An array of the individual log entries (which are
     *     themselves Arrays) for the named log.
     * @todo
     */

    var arr;

    arr = this.messages.select(
        function(it) {

            if (TP.isEmpty(aLogName) ||
                    (aLogName === it[TP.boot.LOG_ENTRY_NAME])) {
                if (TP.isEmpty(aLogLevel)) {
                    return true;
                } else {
                    return aLogLevel === it[TP.boot.LOG_ENTRY_LEVEL];
                }
            }

            return false;
        });

    return arr;
};

//  ------------------------------------------------------------------------

TP.boot.Log.prototype.hasEntries = function(aLogName, aLogLevel) {

    /**
     * @name $hasLogEntries
     * @synopsis Returns true if the activity log has entries for the named log.
     * @param {String} aLogName The log name, such as TP.IO_LOG,
     *     TP.INFERENCE_LOG, etc.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the log has entries.
     * @todo
     */

    return TP.isValid(
            this.messages.detect(
                function(it) {

                    if (TP.isEmpty(aLogName) ||
                        (aLogName === it[TP.boot.LOG_ENTRY_NAME])) {
                        if (TP.isEmpty(aLogLevel)) {
                            return true;
                        } else {
                            return aLogLevel === it[TP.boot.LOG_ENTRY_LEVEL];
                        }
                    }

                    return false;
                }));
};

//  ------------------------------------------------------------------------
//  LOGGING - CORE METHODS
//  ------------------------------------------------------------------------

TP.sys.defineMethod('$logChanged',
function(aLogName) {

    /**
     * @name $logChanged
     * @synopsis Notifies observers, if any, that a particular log has changed.
     * @description This method provides common flag manipulations which are
     *     necessary to avoid recursive logging during notification of log
     *     changes. Note that the patch log and boot logs don't participate in
     *     this process since they're static by the time this function has been
     *     installed. Also note that TP.sys.shouldSignalLogChange() is false by
     *     default.
     * @param {The} aLogName name of the log that changed. The name provided is
     *     given a suffix of Log and a [name]LogChange signal is triggered.
     * @todo
     */

    var flag;

    TP.stop('break.change');

    if (TP.notValid(aLogName)) {
        return;
    }

    if (TP.sys.shouldSignalLogChange()) {
        try {
            flag = TP.sys.shouldLogActivities();
            TP.sys.shouldLogActivities(false);

            TP.signal(TP.sys, aLogName + 'LogChange');
        } catch (e) {
        } finally {
            TP.sys.shouldLogActivities(flag);
        }
    }

    return;
});

//  ------------------------------------------------------------------------
//  ACTIVITY (META) LOG
//  ------------------------------------------------------------------------

//  NOTE the activity log is a shared log containing all log content other
//  than boot/patch entries (found in the boot log), change entries (found
//  in the change log), and test entries (found in the test log). These two
//  secondary logs are separate since they contain information important to
//  the environment and data that should not be cleared without
//  confirmation.
TP.sys.$activity = TP.ifInvalid(TP.sys.$activity, new TP.boot.Log());

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getActivityLog',
function() {

    /**
     * @name getActivityLog
     * @synopsis Returns the overall TIBET activity log, which contains log
     *     entries covering all client-side activity other than boot/patch
     *     logging and source code change logging.
     * @returns {TP.boot.Log} A primitive log object.
     */

    return TP.sys.$activity;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('$$log',
function(anObject, aLogName, aLogLevel) {

    /**
     * @name $$log
     * @synopsis A private method for logging to the TIBET log. The log that
     *     will be modified is based on the supplied log name.
     * @param {Object} anObject The message/object to log.
     * @param {String} aLogName The log name, such as TP.IO_LOG,
     *     TP.INFERENCE_LOG, etc.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     * @todo
     */

    var name,
        level,
        iserr,

        actflag,
        errflag,

        entry,
        stackInfo,

        stdioDict,
        format,
        output,
        str,
        msg;

    //  sometimes we can get lucky if a recursion includes logging
    TP.sys.trapRecursion();

    if (!TP.sys.shouldLogActivities()) {
        return false;
    }

    name = TP.ifInvalid(aLogName, TP.LOG);
    level = TP.ifInvalid(aLogLevel, TP.sys.getLogLevel());
    iserr = (level > TP.WARN) && (level < TP.SYSTEM);

    //  enclose the entire method in a try/finally block to mask off
    //  logging temporarily while ensuring it gets turned back on
    try {
        //  turn off logging while we log :)
        actflag = TP.sys.shouldLogActivities();
        errflag = TP.sys.shouldLogErrors();

        TP.sys.shouldLogActivities(false, false);
        TP.sys.shouldLogErrors(false, false);

        //  add entry to the low-level log container and grab that entry so
        //  we can augment it with stack and argument data as needed
        TP.sys.$activity.log(anObject, name, level);
        entry = TP.sys.$activity.last();

        //  NOTE that we never log stack information for SYSTEM messages
        if (level !== TP.SYSTEM) {
            if (TP.sys.shouldLogStack()) {

                try {
                    throw new Error();
                } catch (e) {
                    stackInfo = TP.getStackInfo(e);
                }

                //  the 3 here is intended to strip off the logging and
                //  stack functions themselves so we only see the portion of
                //  the stack not included in the infrastructure
                stackInfo.shift();
                stackInfo.shift();
                stackInfo.shift();

                //  adjust the entry to hold captured stack/arg data
                entry.push(stackInfo);
            }
        }

        //  keep log from growing without bound
        if (TP.sys.$activity.getSize() > TP.sys.cfg('log.size_max')) {
            TP.sys.$activity.shift();
        }

        stdioDict = TP.hc();
        stdioDict.atPut('messageLevel', level);
        stdioDict.atPut('messageType', 'log');

        //  these are for TP.tdp.Console support
        stdioDict.atPut('cmd',
                        TP.boot.Log.getStringForLevel(level).toLowerCase());

        format = TP.sys.cfg('log.default_format', 'tsh:pp');
        output = TP.format(anObject, format, stdioDict);

        stdioDict.atPut('cmdAsIs', true);
        stdioDict.atPut('cmdBox', false);

        stdioDict.atPut('echoRequest', true);

        if (iserr) {
            //  if we're still booting then announce it in the bootlog
            if (!TP.sys.hasStarted()) {
                if (TP.canInvoke(TP.boot, '$stderr')) {
                    TP.boot.$stderr(anObject);
                }
            } else {
              TP.stderr(output, stdioDict);
            }
        } else {
            //  NOTE that this logs the original message content
            //  regardless of what may have been done during this
            //  function
            TP.stdout(output, stdioDict);
        }

        //  allow observers of the log to see changes...
        TP.sys.$logChanged(name);
    } catch (e) {
        try {
            str = ' obj: ' + TP.str(anObject);
        } catch (e2) {
            str = '';
        }
        msg = 'Error in TP.sys.$$log: ' + TP.str(e) + str;

        // Make sure the error makes it to the browser console at least.
        top.console.error(msg);

        // Try to alert if TP.alert is currently active.
        TP.alert(msg);
    } finally {
        TP.sys.shouldLogActivities(actflag, false);
        TP.sys.shouldLogErrors(errflag, false);
    }

    //  last chance...invoke the debugger ?
    if (iserr && TP.sys.shouldUseDebugger()) {
        TP.sys.$launchDebugger(arguments);
    }

    return true;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('log',
function(anObject, aLogName, aLogLevel) {

    /**
     * @name log
     * @synopsis A simple public wrapper for logging to a TIBET log. Normally
     *     you'll call a method specific to a particular log subset such as
     *     TP.sys.logInference, or a helper specific to a particular logging
     *     level such as TP.trace() or TP.warn(). This method largely provides
     *     symmetry with the TP.boot.log() call which logs to the boot log
     *     rather than the activity log.
     * @param {Object} anObject The message/object to log.
     * @param {String} aLogName The log name, such as TP.IO_LOG,
     *     TP.INFERENCE_LOG, etc.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     * @todo
     */

    var level;

    level = TP.ifInvalid(aLogLevel, TP.WARN);
    if (TP.sys.getLogLevel() <= level) {
        return TP.sys.$$log(anObject, aLogName, aLogLevel);
    }

    return false;
});

//  ------------------------------------------------------------------------
//  TEST LOG
//  ------------------------------------------------------------------------

//  NOTE that the test log is a separate log to ensure that it cannot be
//  cleared accidentally when clearing the larger activity log.
TP.sys.$testlog = TP.ifInvalid(TP.sys.$testlog, new TP.boot.Log());

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getTestLog',
function() {

    /**
     * @name getTestLog
     * @synopsis Returns the TIBET test log, which contains entries for all
     *     tests run during one or more test suite executions.
     * @returns {TP.boot.Log} A primitive log object.
     */

    return TP.sys.$testlog;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('logTest',
function(anObject, aLogLevel) {

    /**
     * @name logTest
     * @synopsis Adds an entry to the test log. Note that there is no level
     *     filtering in test logging, the level parameter only filters parallel
     *     entries which might be made to the activity log.
     * @description This call is used by test harness routines to log their
     *     activity. The object argument can provide data in one or more keys
     *     including:
     *
     *     'name'               the test name
     *     'number'             the test number *in the reporting run*
     *     'test-status'        the test status. Should be one of:
     *                              TP.ACTIVE
     *                              TP.SKIP
     *                              TP.TODO
     *     'result-status'      the result status. Should be one of:
     *                              TP.SUCCEEDED
     *                              TP.FAILED
     *                              TP.CANCELLED
     *                              TP.SKIPPED
     *                              TP.TIMED_OUT
     *     'message'            the test message
     *     'failure-severity'   the severity level of the failure. Usually set
     *                          to 'fail'.
     *     'failure-data'       A hash with two keys containing the data:
     *                              TP.PRODUCED
     *                              TP.EXPECTED
     * @param {Object} anObject The test data to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     * @todo
     */

    TP.sys.$testlog.log(anObject, TP.TEST_LOG, TP.SYSTEM);

    if (TP.sys.cfg('boot.context') === 'phantomjs') {
        console.log(TP.str(anObject));
    }

    TP.sys.log(anObject, TP.TEST_LOG, aLogLevel);

    //  with all logging complete signal change on the test log
    TP.sys.$logChanged(TP.TEST_LOG);

    return true;
});

//  ------------------------------------------------------------------------
//  CSS LOGGING
//  ------------------------------------------------------------------------

/**
 * All CSS processor output can be captured in the CSS log for review provided
 * that TP.sys.shouldLogCSS() is true.
 */

//  ------------------------------------------------------------------------

TP.sys.defineMethod('logCSS',
function(anObject, aLogLevel) {

    /**
     * @name logCSS
     * @synopsis Adds anObject to the CSS log. This method will have no effect
     *     if the TP.sys.shouldLogCSS() flag is false.
     * @param {Object} anObject The message/object to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     * @todo
     */

    if (!TP.sys.shouldLogCSS()) {
        return false;
    }

    TP.sys.log(anObject, TP.CSS_LOG, aLogLevel);

    return true;
});

//  ------------------------------------------------------------------------
//  INFERENCE LOGGING
//  ------------------------------------------------------------------------

/*
The inference log is a simple log for tracking activity of the inferencing
engine. All messages generated by the inference engine show up here, with
content that often includes the message, target, arguments, etc.
*/

//  ------------------------------------------------------------------------

TP.sys.defineMethod('logInference',
function(anObject, aLogLevel) {

    /**
     * @name logInference
     * @synopsis Adds anObject to the inference log. This method will have no
     *     effect if the TP.sys.shouldLogInferences() flag is false. The default
     *     logging level for messages of this type is TP.TRACE.
     * @param {Object} anObject The message/object to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     * @todo
     */

    if (!TP.sys.shouldLogInferences()) {
        return false;
    }

    TP.sys.log(anObject,
                TP.INFERENCE_LOG,
                aLogLevel);

    return true;
});

//  ------------------------------------------------------------------------
//  IO LOGGING
//  ------------------------------------------------------------------------

/*
The IO log tracks activity of communication primitives for both file and
http access. All messages generated by communication calls show up here
allowing you to see a single view of all server or host communication.
*/

//  ------------------------------------------------------------------------

TP.sys.defineMethod('logIO',
function(anObject, aLogLevel) {

    /**
     * @name logIO
     * @synopsis Logs anObject to the IO log. Note that this method will have no
     *     effect if TP.sys.shouldLogIO() is false. Also note that this method
     *     logs information at TP.TRACE.
     * @description This call is used by various file and http access routines
     *     to log their activity. The object argument can provide data in one or
     *     more keys including:
     *
     *     'uri'        the targetUrl
     *     'uriparams'  optional parameters for url-encoding,
     *     'separator'  optional uri parameter separator
     *
     *     'headers'    http headers, or response headers,
     *     'async'      true or false
     *     'verb'       the command verb (GET/POST/PUT/DELETE etc)
     *     'body'       any data content for the call,
     *
     *     'noencode'   turns off body content encoding 'mimetype'
     *     'mimetype'   used for body encoding 'encoding'
     *     'charset'    encoding used for multi-part
     *     'mediatype'  used for multi-part encodings
     *
     *     'xhr'        the XMLHttpRequest object used, if any
     *
     *     'request'    TP.sig.Request reference
     *     'response'   TP.sig.Response reference
     *
     *     'direction'  TP.SEND or TP.RECV
     *     'message'    the log message
     *     'object'     any Error object which might be related,
     *
     *     'finaluri'   the fully expanded uri w/parameters
     *     'finalbody'  the TP.str(body) value actually sent
     *
     *     Note that IO log entries will only be pushed to the activity log
     *     (and stdout) when the logging level is INFO.
     * @param {Object} anObject The message/object to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     * @todo
     */

    if (!TP.sys.shouldLogIO()) {
        return false;
    }

    TP.sys.log(anObject, TP.IO_LOG, aLogLevel);

    return true;
});

//  ------------------------------------------------------------------------
//  JOB LOGGING
//  ------------------------------------------------------------------------

/*
The job log contains information on all TP.core.Job processing done by
TIBET. The TP.core.Job type manages virtually all setInterval/setTimeout
style processing in TIBET so that all asynchronous processing can be managed
consistently.
*/

//  ------------------------------------------------------------------------

TP.sys.defineMethod('logJob',
function(anObject, aLogLevel) {

    /**
     * @name logJob
     * @synopsis Logs a job-related event. This method has no effect if
     *     TP.sys.shouldLogJobs() is false.
     * @param {Object} anObject The message/object to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     * @todo
     */

    if (!TP.sys.shouldLogJobs()) {
        return false;
    }

    TP.sys.log(anObject, TP.JOB_LOG, aLogLevel);

    return true;
});

//  ------------------------------------------------------------------------
//  KEY LOGGING
//  ------------------------------------------------------------------------

/*
The key log contains information on all key events being logged. Logging
keys can be a useful way to help adjust keyboard map entries.
*/

//  ------------------------------------------------------------------------

TP.sys.defineMethod('logKey',
function(anObject, aLogLevel) {

    /**
     * @name logKey
     * @synopsis Logs a key event. This method has no effect if
     *     TP.sys.shouldLogKeys() is false.
     * @param {Object} anObject The message/object to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     * @todo
     */

    if (!TP.sys.shouldLogKeys()) {
        return false;
    }

    TP.sys.log(anObject, TP.KEY_LOG, aLogLevel);

    return true;
});

//  ------------------------------------------------------------------------
//  LINK LOGGING
//  ------------------------------------------------------------------------

/*
The link log contains information on all links traversed via TIBET's link
methods such as TP.go2(). This information can be used to provide valuable
usability analysis data, user tracking data, or debugging information on the
path a user took up to the point of an error.
*/

//  ------------------------------------------------------------------------

TP.sys.defineMethod('logLink',
function(anObject, aLogLevel) {

    /**
     * @name logLink
     * @synopsis Logs a link activation event. This method has no effect if
     *     TP.sys.shouldLogLinks() is false. Also note that link logging occurs
     *     at TP.TRACE level.
     * @param {Object} anObject The message/object to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     * @todo
     */

    if (!TP.sys.shouldLogLinks()) {
        return false;
    }

    TP.sys.log(anObject, TP.LINK_LOG, aLogLevel);

    return true;
});

//  ------------------------------------------------------------------------
//  SECURITY LOGGING
//  ------------------------------------------------------------------------

/*
Security events such as requesting permissions on Mozilla or performing a
cross-domain HTTP request can be logged separately (and are by default).
*/

//  ------------------------------------------------------------------------

TP.sys.defineMethod('logSecurity',
function(anObject, aLogLevel) {

    /**
     * @name logSecurity
     * @synopsis Logs a security event. This method has no effect if
     *     TP.sys.shouldLogSecurity() is false.
     * @param {Object} anObject The message/object to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     * @todo
     */

    if (!TP.sys.shouldLogSecurity()) {
        return false;
    }

    TP.sys.log(anObject, TP.SECURITY_LOG, aLogLevel);

    return true;
});

//  ------------------------------------------------------------------------
//  SIGNAL LOGGING
//  ------------------------------------------------------------------------

/*
The signal log tracks the activity of the TIBET signaling engine. This
subset of log entries can be critical to understanding how your application
operates. The log entries typically contain the signal object itself.
*/

//  ------------------------------------------------------------------------

TP.sys.defineMethod('logSignal',
function(anObject, aLogLevel) {

    /**
     * @name logSignal
     * @synopsis Logs a signaling message to the activity log. The signal string
     *     typically contains the origin, signal name, context, and any
     *     arguments which were passed. Note that the signal log data will only
     *     be pushed to the activity log (and stdout) if the log level is
     *     TP.TRACE.
     * @param {Object} anObject The message/object to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     * @todo
     */

    var level;

    if (!TP.sys.shouldLogSignals()) {
        return false;
    }

    //  since this method "does work" we avoid that unless we're at the
    //  right level.
    level = TP.ifInvalid(aLogLevel, TP.TRACE);
    if (TP.sys.getLogLevel() <= level) {
        TP.sys.log(anObject.get('message'),
                    TP.SIGNAL_LOG,
                    level);
    }

    return true;
});

//  ------------------------------------------------------------------------
//  TRANSFORM LOGGING
//  ------------------------------------------------------------------------

/*
The transform log contains all output from the content processing system
The TP.sys.shouldLogTransforms() method controls whether logging actually
occurs.
*/

//  ------------------------------------------------------------------------

TP.sys.defineMethod('logTransform',
function(anObject, aLogLevel) {

    /**
     * @name logTransform
     * @synopsis Logs a content transfomation event to the transform log.
     * @param {Object} anObject The message/object to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @returns {Boolean} True if the logging operation succeeded.
     * @todo
     */

    if (!TP.sys.shouldLogTransforms()) {
        return false;
    }

    TP.sys.log(anObject,
                TP.TRANSFORM_LOG,
                aLogLevel);

    return true;
});

//  ------------------------------------------------------------------------
//  METHOD CONFORMANCE
//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('asInterface',
function() {

    /**
     * @name asInterface
     * @synopsis Returns the receiver as a method interface. This is an array of
     *     method names useful for testing protocol conformance. For general
     *     objects this results in a list of the methods the receiver implements
     *     which could be quite large.
     * @returns {Array} An array of method names.
     * @todo
     */

    return this.getLocalInterface('methods');
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('asInterface',
function() {

    /**
     * @name asInterface
     * @synopsis Returns the receiver as a method interface. For arrays this
     *     method assumes the array already contains a list of strings.
     * @returns {Array} The receiver.
     * @todo
     */

    return this;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asInterface',
function() {

    /**
     * @name asInterface
     * @synopsis Returns the receiver as a method interface. For strings this
     *     returns an array containing the string suitable for testing as an
     *     interface.
     * @returns {Array} An array containing the receiver.
     * @todo
     */

    var intArray;

    intArray = TP.ac();
    intArray.push(this);

    return intArray;
});

//  ------------------------------------------------------------------------
//  DNU CONSTRUCTION
//  ------------------------------------------------------------------------

TP.sys.$$NSMString =
    'TP.raise(this, "TP.sig.NoSuchMethod"); return;';

//  ------------------------------------------------------------------------

TP.FunctionProto.defineMethod('asDNU',
function() {

    /**
     * @name asDNU
     * @synopsis Returns a doesNotUnderstand wrapper function which is capable
     *     of providing information on which function name was not found along
     *     with the calling context.
     * @returns {Function} An appropriate wrapper function.
     */

    var dnuFunc,
        thisName;

    //  notice the passage of 'this' as the variable which will become the
    //  anOrigin parameter in TP.sys.dnu. Also, the passage of the method
    //  name acquired from the current function and the arguments and
    //  calling context.

    //  construct the function and get it set as if "add*Method" had been
    //  called on it. The $$dnu flag is critical so that other methods in
    //  the system can distinguish between functions which have "real"
    //  implementations and those which are simply "backstops".

    thisName = this[TP.NAME];
    dnuFunc = function () {
                var ret;
                ret = TP.sys.dnu(this, thisName, arguments, arguments);
                return ret;
    };

    dnuFunc[TP.NAME] = this[TP.NAME] || 'DoesNotUnderstand' +
                                                this.getName();
    dnuFunc[TP.OWNER] = this[TP.OWNER] || TP.NONE;
    dnuFunc[TP.TRACK] = this[TP.TRACK] || TP.NONE;
    dnuFunc[TP.DISPLAY] = TP.id(dnuFunc[TP.OWNER]) + '.' + dnuFunc[TP.NAME];
    dnuFunc.$$dnu = true;

    return dnuFunc;
});

//  ------------------------------------------------------------------------

Function.Type.defineMethod('constructDNU',
function(aName) {

    /**
     * @name constructDNU
     * @synopsis Returns a doesNotUnderstand wrapper function which is capable
     *     of providing information on which function name was not found along
     *     with the calling context.
     * @param {String} aName The name of the function this DNU stands in for.
     * @returns {Function} An appropriate wrapper function.
     */

    var dnuFunc;

    if (TP.isEmpty(aName)) {
        this.raise('TP.sig.InvalidParameter');
    }

    dnuFunc = function () {
                var ret;
                ret = TP.sys.dnu(this, aName, arguments, arguments);
                return ret;
    };

    dnuFunc[TP.NAME] = aName;
    dnuFunc[TP.OWNER] = TP.NONE;
    dnuFunc[TP.TRACK] = TP.NONE;
    dnuFunc[TP.DISPLAY] = TP.id(dnuFunc[TP.OWNER]) + '.' + dnuFunc[TP.NAME];
    dnuFunc.$$dnu = true;

    return dnuFunc;
});

//  ------------------------------------------------------------------------

Function.Type.defineMethod('constructDelegator',
function(aName) {

    /**
     * @name constructDelegator
     * @synopsis Returns a "delegator" wrapper function which servers as a
     *     router to the receiver's delegate for a particular method. The return
     *     value of this function is typically used as part of the TP.delegate()
     *     function.
     * @param {String} aName The name of the function this delegator should
     *     invoke.
     * @returns {Function} An appropriate wrapper function.
     */

    var delFunc,
        delStr;

    if (TP.isEmpty(aName)) {
        this.raise('TP.sig.InvalidParameter');
    }

    delStr = TP.join(
            'var del;',
            'var func;',
            'del = this.getDelegate();',
            'if (TP.notValid(del)) return;',
            'func = del["', aName, '"];',
            'if (TP.isCallable(func)) return func.apply(del, arguments);',
            'return;');

    delFunc = TP.fc(delStr);
    if (!TP.isFunction(delFunc)) {
        //  problem with aName, not a valid function name
        TP.ifWarn() ?
            TP.warn('Unable to construct delegator for ' + aName,
                    TP.LOG) : 0;
    }

    return delFunc;
});

//  ------------------------------------------------------------------------

Function.Type.defineMethod('constructNSM',
function(aName) {

    /**
     * @name constructNSM
     * @synopsis Returns a "NoSuchMethod" wrapper function which is capable of
     *     deadening part of a global doesNotUnderstand hook.
     * @param {String} aName The name of the function this deadener stands in
     *     for.
     * @returns {Function} An appropriate "no such method" function.
     */

    var nsmFunc;

    if (TP.isEmpty(aName)) {
        this.raise('TP.sig.InvalidParameter');
    }

    nsmFunc = TP.fc(TP.sys.$$NSMString);
    nsmFunc[TP.NAME] = aName;
    nsmFunc[TP.OWNER] = TP.NONE;
    nsmFunc[TP.TRACK] = TP.NONE;
    nsmFunc[TP.DISPLAY] = TP.id(nsmFunc[TP.OWNER]) + '.' + nsmFunc[TP.NAME];
    nsmFunc.$$dnu = true;   //  TODO:   should we update elsewhere for this?
    nsmFunc.$$nsm = true;

    return nsmFunc;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
