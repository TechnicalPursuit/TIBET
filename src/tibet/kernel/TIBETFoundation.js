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
include additional reflection, iteration, type checking, encapsulation, and
more. This file provides the foundational elements leading up to the
construction of the TIBET metaobject/inheritance system and the rest of the
TIBET platform.
*/

//  ------------------------------------------------------------------------
//  GLOBAL DISCOVERY
//  ------------------------------------------------------------------------

TP.sys.defineMethod('$getContextGlobals',
function(params, windowContext) {

    /**
     * @method $getContextGlobals
     * @summary Returns an Array of global property names.
     * @description Computing this list is done by iterating over the context
     *     object provided and filtering the resulting keys against known window
     *     slots and "exclusions" that don't represent global functionality. In
     *     other words, a property on a window that's truly a property of a
     *     Window isn't returned by this search, but a function on Window
     *     intended as a Global function would be.
     * @param {TP.core.Hash} params A hash of various parameters that will
     *     affect the return value in the following way: 'internal' Return
     *     global slots that are internal - that is, they start with '$$'
     *     'hidden' Return global slots that are internal - that is, they start
     *     with '$$' or '$'. 'public' Return global slots that are not internal
     *     - that is, they do not start with '$$' or '$'. 'types' Return global
     *     slots that are TIBET types. 'functions' Return global slots that are
     *     functions. 'variables' Return global slots that are not functions.
     * @param {Window} windowContext The window/frame whose globals should be
     *     returned. Default is the current window.
     * @returns {String[]} The list of Strings representing keys on the JavaScript
     *     global object.
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

    /* eslint-disable guard-for-in */
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
            void 0;
        }
    }
    /* eslint-enable guard-for-in */

    return arr;
});

//  ------------------------------------------------------------------------
//  TIBET - TYPE DICTIONARIES
//  ------------------------------------------------------------------------

//  the missing type hash. we hold the types missing from TIBET's type
//  system here
TP.sys.$missingTypes = TP.sys.$missingTypes || TP.hc();

//  Right now its a primitive hash
TP.sys.$missingTypes.$isHash =
    TP.ifInvalid(TP.sys.$missingTypes.$isHash, false);

//  ------------------------------------------------------------------------

TP.sys.defineMethod('addCustomType',
function(typeName, customType) {

    /**
     * @method addCustomType
     * @summary Adds the named custom type to the global type hash.
     * @param {String} typeName The key under which to store the type.
     * @param {Object} customType The type to store.
     * @returns {Object} The receiver.
     */

    //  Note that we use a primitive hash here since that way all of the
    //  metadata is stored using the same kind of data structure (and also to
    //  avoid booting problems when TP.core.Hash is only 'half loaded')

    TP.sys.getMetadata('types').atPut(typeName, customType);

    return this;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getCustomTypes',
function() {

    /**
     * @method getCustomTypes
     * @summary Returns an object containing the names and type objects for all
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
        //  NB: We use primitive property access here.
        result.atPut(typeKeys.at(i), types.at(typeKeys.at(i)));
    }

    return result;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getMissingTypes',
function() {

    /**
     * @method getMissingTypes
     * @summary Returns a hash whose keys represent type names that TIBET was
     *     asked for (typically via require) which do not exist. Common cases
     *     are node wrappers for unknown XML tags and signal names for
     *     fabricated signals.
     * @returns {Object} An object containing the name and type objects for all
     *     custom types.
     */

    //  convert to a full hash as soon as possible
    if (TP.isFalse(this.$missingTypes.$isHash) &&
        TP.isType(TP.sys.getTypeByName('TP.core.Hash'))) {
        this.$missingTypes = this.$missingTypes.asTP_core_Hash();
        this.$missingTypes.$isHash = true;
    }

    return this.$missingTypes;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getTypeByName',
function(aName, shouldFault) {

    /**
     * @method getTypeByName
     * @summary Returns a handle to the type with the name provided. If the
     *     type isn't found this method returns undefined. This method is used
     *     extensively to assist with dynamic loading of types.
     * @param {String} aName The name of the type to locate.
     * @param {Boolean} shouldFault False to turn off testing and conversion of
     *     TP.lang.Proxy instances. This is considered a private parameter used
     *     by the kernel only.
     * @returns {TP.lang.RootObject|undefined} The type object registered under
     *     the name given.
     */

    var type,
        tName,
        entry,

        typeMetadata;

    //  make sure it's a real type name...we often get called with instance
    //  IDs because of signaling etc.
    if (!TP.isTypeName(aName)) {
        if (TP.isType(aName)) {
            return aName;
        }
        return;
    }

    if (TP.isString(aName)) {
        tName = aName;

        //  Namespaces end with a colon (:) as in ev: or xmpp:.
        if (tName[tName.length - 1] === ':') {
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
                type = entry; // .typeObj;
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
                type = entry; // .typeObj;
            }

            if (!type) {
                if (TP.isValid(entry = typeMetadata.at('APP.' + tName))) {
                    type = entry; // .typeObj;
                }
            }
        } else {
            if (TP.isValid(entry = typeMetadata.at(tName))) {
                type = entry; // .typeObj;
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
    if (TP.$$isTypeProxy(type) && type !== TP.lang.Proxy) {

        //  Note the explicit check for false... undefined here would allow the
        //  method's default value of this parameter to true.
        if (TP.isFalse(shouldFault)) {
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
     * @method getTypes
     * @summary Returns a hash containing the names and type objects which have
     *     actual implementations in the current environment. This is a
     *     combination of custom types and those native types which have true
     *     type object implementations.
     * @returns {TP.core.Hash} A hash of types, keyed by name, that have actual
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

        /* eslint-disable consistent-this */

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
            retFunc = function() {

                var newArgs;

                newArgs = TP.args(arguments);
                newArgs.unshift(boundArgs);

                return thisFunc.apply(aThis, newArgs);
            };
        } else {
            //  otherwise, build a return Function that applies the bound
            //  Function with its own arguments when invoked.
            retFunc = function() {
                return thisFunc.apply(aThis, arguments);
            };
        }

        /* eslint-enable consistent-this */

        return retFunc;
    };
} else {
    //  The platform provides a native bind() - alias it to '$$bind()' so that
    //  we can override it below
    TP.FunctionProto.$$bind = TP.FunctionProto.bind;
}

//  ---

Function.Inst.defineMethod('bind',
function(aThis, varargs) {

    /**
     * @method bind
     * @summary Binds a function to a particular context...for good :).
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
     */

    var retFunc;

    //  if more than 1 argument was supplied, then call $$bind() with the
    //  arguments object.
    if (arguments.length > 1) {
        retFunc = this.$$bind.apply(this, arguments);
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

TP.definePrimitive('unbound',
function(aFunction) {

    /**
     * @method unbound
     * @summary Returns the true function that would be invoked by a
     *     potentially bound function - or series of them. This method "drills
     *     down" through a set of bound functions until it reaches the
     *     originally bound function reference.
     * @param {Function} aFunction A function to unbind, returning the original.
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
     * @method afterUnwind
     * @summary Causes the receiver to be executed when the stack has been
     *     completely 'unwound' (i.e. when we're back at the main event loop).
     * @description This method provides a convenient way for the receiver to
     *     execute at the 'top' of the event loop. If you want to pass arguments
     *     to the function itself, simply pass them as parameters to this
     *     method:
     *         f.afterUnwind(farg1, farg2, ...).
     *     Note that this method provides a slightly better mechanism for
     *     executing Functions at the top the stack than a '0' based timeout or
     *     fork as it leverage some underlying platform capabilities, but
     *     shouldn't be used when waiting for the screen to refresh as the GUI
     *     thread might not have been serviced yet. Instead, use the
     *     queueForNextRepaint() method.
     * @returns {Function} The receiver.
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

    //  Leverage Promises if they're available. This is better if we're running
    //  in an environment where we may already have Promises scheduling since
    //  this will use a common scheduler for everything.
    if (TP.isDefined(TP.extern.Promise)) {

        TP.extern.Promise.resolve(TP.extern.Promise.construct(func));

    } else if (window.MutationObserver) {

        //  Leverage MutationObservers if they're available

        //  If there is no 'TP.$$unwindElem' global, then we need to set it up
        //  along with the MutationObserver that will trigger *at the top of the
        //  event loop* (as MutationObservers do) and run all of the functions
        //  in the TP.$$unwindQueue
        if (!TP.isElement(TP.$$unwindElem)) {

            //  Set up our globals. Note that we don't even have to append the
            //  TP.$$unwindElem to a document or anything to get
            //  MutationObserver goodness.
            TP.defineAttributeSlot(TP,
                                    '$$unwindElem',
                                    document.createElement('div'));
            TP.defineAttributeSlot(TP, '$$unwindQueue', TP.ac());

            //  Define a function that runs all functions in the
            //  TP.$$unwindQueue and then empties the queue.
            flushQueue = function() {
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
                TP.$$unwindElem,
                {
                    attributes: true
                });
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

            //  NB: We specifically do not capture the return value here because
            //  the caller couldn't know what mechanism we use to run this, so
            //  it's of limited value.
            setTimeout(this, 0);
        }

        //  NB: We specifically do not capture the return value here because the
        //  caller couldn't know what mechanism we use to run this, so it's of
        //  limited value.
        setTimeout(func, 0);
    }

    return this;
}, {
    dependencies: [TP.extern.Promise]
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('queueBeforeNextRepaint',
function(aWindow) {

    /**
     * @method queueBeforeNextRepaint
     * @summary Causes the receiver to be executed before the browser begins its
     *     next repainting of the screen.
     * @description This method provides a convenient way for the receiver to
     *     execute just before the browser repaints the screen. If you want to
     *     pass arguments to the function itself, simply pass them as parameters
     *     to this method:
     *         f.queueBeforeNextRepaint(farg1, farg2, ...).
     * @param {Window|TP.core.Window} [aWindow] The window to be waiting for
     *     refresh. This is an optional parameter that will default to the
     *     current UI canvas.
     * @returns {Object} The object to use to stop the queueBeforeNextRepaint()
     *     prematurely (via cancelAnimationFrame()).
     */

    var thisref,
        arglist,

        func,

        win;

    //  we'll want to invoke the receiver (this) but need a way to get it
    //  to close properly into the function we'll use for argument passing
    thisref = this;
    arglist = TP.args(arguments);

    //  have to build a second function to ensure the arguments are used
    func = function() {
        return thisref.apply(thisref, arglist);
    };

    //  Just in case we were handed a TP.core.Window
    win = TP.unwrap(aWindow);

    if (!TP.isWindow(win)) {
        win = TP.sys.getUICanvas(true);
    }

    //  Call requestAnimationFrame with the Function that we calculated above.
    //  This will 'schedule' the call for just before next time the screen is
    //  repainted.
    return win.requestAnimationFrame(func);
});

//  ------------------------------------------------------------------------
//  FUNCTION INFORMATION
//  ------------------------------------------------------------------------

Function.Inst.defineMethod('getArity',
function() {

    /**
     * @method getArity
     * @summary Returns the arity (that is, the number of formally declared
     *     parameters) to this function.
     * @returns {Number} The number of formally declared parameters to this
     *     function.
     */

    var obj;

    obj = TP.getRealFunction(this);

    return obj.length;
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('getCommentLines',
function() {

    /**
     * @method getCommentLines
     * @summary Parses the receiver's comment text and returns it as a set of
     *     lines, one per JSDoc tag found in the comment. The resulting lines
     *     can be individually parsed by tag-specific line parsers as part of a
     *     larger comment processing operation.
     *  @example
     *          line 1
     *          line 2
     *          line 3
     *                  indented line 4
     *              line 5 back out
     *          line 6
     *          line 7
     * @returns {String[]} The comment lines in order from the comment.
     */

    var text,
        example,
        lines,
        clean,
        len,
        i,
        line,
        joined;

    //  Get the JSDoc comment text of the receiver. If this is empty no real
    //  structure can be provided.
    text = this.getCommentText();
    if (TP.isEmpty(text)) {
        return TP.ac();
    }

    //  ---
    //  cleanse
    //  ---

    //  Set our 'in @example' state flag to false before we enter loop.
    example = false;

    //  Simplistic cleansing of the comment text to make processing content tags
    //  a little easier.
    lines = text.split('\n');
    lines = lines.map(
            function(aLine) {
                var str;

                str = aLine.trim();

                //  Ignore the opening and closing lines for a doc comment.
                if (str.startsWith('/**') || str.startsWith('*/')) {
                    return undefined;
                }

                //  If the line's starting text is @example turn off whitespace
                //  stripping until we come to the next tag.
                if (str.match(/^\s*\*\s*@example/)) {
                    example = true;
                    return str.replace(/^\s*\*\s*@example/, '@example');
                }

                //  Check to see if we're in example mode but have hit a new
                //  tag. If so we flip back out of example mode so we trim
                //  whitespace.
                if (example && str.match(/^\s*\*\s*@/)) {
                    example = false;
                }

                if (!example) {
                    //  str is already trimmed, just remove any leading '*' etc.
                    str = str.replace(/^\*\s*/, '');
                } else {
                    str = aLine;
                    //  Replace any * in the text with a space, preserving any
                    //  other whitespace on that line.
                    str = str.replace(/^(\s*)\*(\s*)/, '$1 $2');
                }

                return str;
            }).compact();   //  Compact removes null-valued lines.

    //  Might be an empty comment, in which case we return an empty array rather
    //  than null to signify there was a comment, but it was empty.
    if (TP.isEmpty(lines)) {
        return lines;
    }

    //  ---
    //  join
    //  ---

    //  Join "blocks" of text with their associated tag. Also watch out for
    //  opening block which may not start with @name or a similar tag.
    clean = TP.ac();

    //  First line. Should start with @name or similar but some authors put in
    //  description without an opening tag.
    if (lines[0].charAt(0) !== '@') {
        lines[0] = '@summary ' + lines[0];
    }

    //  Set our 'in @example' state flag to false before we enter loop.
    example = false;

    //  With first line cleansed we should be able to loop over the lines and
    //  join any which don't start with '@' to the currently open tag.
    len = lines.length;
    for (i = 0; i < len; i++) {

        line = lines.at(i);

        if (line.charAt(0) === '@') {

            if (i !== 0) {
                clean.push(joined);
            }
            joined = line;

            example = line.startsWith('@example');
            if (example) {
                clean.push(joined);
            }
        } else if (!example) {
            joined += ' ' + line;
        } else {
            clean.push(line);
            joined = null;
        }
    }

    //  Push any remaining line and ensure we don't have any null lines.
    clean.push(joined);
    clean.compact();

    return clean;
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('getCommentText',
function() {

    /**
     * @method getCommentText
     * @summary Returns the JSDoc comment text for the receiver, if any.
     * @returns {String} The comment text.
     */

    var obj,

        text,
        tokens,
        comment;

    obj = TP.getRealFunction(this);

    text = obj.toString();
    tokens = TP.$tokenize(text);

    comment = tokens.detect(
                function(token) {
                    return token.name === 'comment' &&
                            token.value.startsWith('/**');
                });

    if (TP.isValid(comment)) {
        return comment.value;
    }
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('getMethodPatch',
function(newMethodText, loadedFromSourceFile) {

    /**
     * @method getMethodPatch
     * @summary Returns patch information suitable for applying to the
     *     receiver's source file. The JsDiff package must be loaded for this
     *     operation to work. The JsDiff package is typically loaded by the
     *     Sherpa config.
     * @param {String} newMethodText The new method text.
     * @param {Boolean} [loadedFromSourceFile=true] Whether or not the receiver
     *     was loaded from a source file on startup or is being dynamically
     *     patched during runtime.
     * @returns {String[]|undefined} An Array of Strings consisting of a) the
     *     patch as computed between the current method text and the supplied
     *     method text in 'unified diff' format and b) the new content text of
     *     the method's source file as computed by splicing the current method
     *     text into the source file (effectively updating it).
     */

    var obj,

        path,
        url,
        str,
        matcher,
        resp,
        currentContent,
        newText,

        match,
        newContent,
        patch;

    obj = TP.getRealFunction(this);

    if (TP.notValid(TP.extern.JsDiff)) {
        TP.ifWarn() ?
            TP.warn('Unable to generate method patch. JsDiff not loaded.') : 0;
        return;
    }

    //  Get the original source url...
    path = TP.objectGetSourcePath(obj);
    if (TP.isEmpty(path)) {
        TP.ifWarn() ?
            TP.warn('Unable to generate method patch. Source path not found.') :
            0;
        return;
    }

    //  Get the original source text. Note here how we do this synchronously
    //  and we set 'refresh' to true, thereby forcing the browser to go back to
    //  the server for the latest version of the file. This is so that we can
    //  compute the diff against the latest version that is real.
    url = TP.uc(path);
    resp = url.getResource(TP.hc('async', false,
                                    'resultType', TP.TEXT,
                                    'refresh', true,
                                    'signalChange', false));
    currentContent = resp.get('result');

    if (TP.isEmpty(currentContent)) {
        TP.ifWarn() ?
            TP.warn('Unable to generate method patch. Source text not found.') :
            0;
        return;
    }

    newText = newMethodText;

    if (TP.isFalse(loadedFromSourceFile)) {
        //  This method did not come from a source file on startup - just append
        //  it to the existing content.
        newContent = currentContent + newText;
    } else {
        //  Get the current method's body text...
        str = TP.src(obj);

        //  If there's a trailing ';', then we want to slice it off. We may be
        //  trying to match in a place where there's a '})', but the Function is
        //  standing alone and is generating these ';'s.
        if (/\};$/.test(str)) {
            str = str.slice(0, -1);
            if (TP.isValid(obj[TP.OWNER])) {
                str += ');';
            }
        }

        if (/\};$/.test(newText)) {
            newText = newText.slice(0, -1);
            if (TP.isValid(obj[TP.OWNER])) {
                newText += ');';
            }
        }

        //  Convert the body text into a RegExp we can use as a way of indexing
        //  into the original source file text.
        /* eslint-disable no-control-regex */
        matcher = TP.rc(RegExp.escapeMetachars(
                    str.replace(/[\u0009\u000A\u0020\u000D]+/g, 'SECRET_SAUCE')).
                        replace(/SECRET_SAUCE/g, '\\s*'));
        /* eslint-enable no-control-regex */

        //  Try to find an index into current content using the generated
        //  RegExp. If we can't find one, we'll just use all of the new text to
        //  try to generate a patch.
        match = currentContent.match(matcher);
        if (TP.notValid(match)) {
            TP.ifWarn() ?
                TP.warn('Unable to generate specific method patch.' +
                            ' Using large-grained method diff.') :
                0;
            newContent = newText;
        } else {
            newContent = currentContent.slice(0, match.index) +
                        newText +
                        currentContent.slice(match.index + match.at(0).length);
        }
    }

    //  NOTE we use the original srcPath string here to retain relative address.
    patch = TP.extern.JsDiff.createPatch(path, currentContent, newContent);

    return TP.ac(patch, newContent);
}, {
    dependencies: [TP.extern.JsDiff]
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('getMethodSourceHead',
function() {

    /**
     * @method getMethodSourceHead
     * @summary Returns a String that is a representation of the 'source head'
     *     of the canonical TIBET way of adding a method to the system.
     * @description NOTE: this method produces a representation which *must* be
     *     followed with a Function statement (i.e. 'function() {...}') and the
     *     method tail.
     * @returns {String} A representation of the 'source method head' of the
     *     receiver in TIBET.
     */

    var obj,

        owner,
        track,
        descriptor,

        str,
        ownerName;

    obj = TP.getRealFunction(this);

    owner = obj[TP.OWNER];
    track = obj[TP.TRACK];
    descriptor = obj[TP.DESCRIPTOR];

    str = TP.ac();

    //  We need to have both a valid owner and track to generate the header.
    if (TP.isValid(owner) && TP.isValid(track)) {

        ownerName = owner.getName();

        //  If the descriptor has a valid 'signal' slot on it, then it's a
        //  handler.
        if (TP.isValid(descriptor.signal)) {

            if (track === TP.TYPE_LOCAL_TRACK ||
                track === TP.LOCAL_TRACK) {
                str.push(ownerName, '.defineHandler(');
            } else {
                str.push(ownerName, '.', track, '.defineHandler(');
            }

            str.push('\'', descriptor.signal.getSignalName() + '\',\n');
        } else {

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

            str.push('\'', obj.getName() + '\',\n');
        }
    }

    return str.join('');
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('getMethodSourceTail',
function() {

    /**
     * @method getMethodSourceTail
     * @summary Returns a String that is a representation of the 'source tail'
     *     of the canonical TIBET way of adding a method to the system.
     * @returns {String} A representation of the 'source method head' of the
     *     receiver in TIBET.
     */

    var obj,

        descriptor,

        str;

    obj = TP.getRealFunction(this);

    descriptor = obj[TP.DESCRIPTOR];

    str = TP.ac();

    //  If the descriptor has valid 'phase', 'origin' or 'state' slots on it,
    //  then it's a handler that needs to be followed by a descriptor of these
    //  additional properties.
    if (TP.isValid(descriptor.phase) ||
        TP.isValid(descriptor.origin) ||
        TP.isValid(descriptor.state)) {

        str.push(',', ' {');

        //  We like to use the TP.CAPTURING constant
        if (TP.isValid(descriptor.phase)) {
            if (descriptor.phase === TP.CAPTURING) {
                str.push('phase: TP.CAPTURING', ', ');
            } else {
                str.push('phase: ', descriptor.phase, ', ');
            }
        }
        if (TP.isValid(descriptor.origin)) {
            str.push('origin: \'', descriptor.origin, '\'', ', ');
        }
        if (TP.isValid(descriptor.state)) {
            str.push('state: \'', descriptor.state, '\'', ', ');
        }

        //  Pop off the last ', '
        str.pop();

        str.push('}');
    }

    str.push(')');

    return str.join('');
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('$getFunctionLiteralIndexes',
function() {

    /**
     * @method $getFunctionLiteralIndexes
     * @summary Returns an Array of start and end indexes of each occurrence of
     *     a 'function() {...}' literal in the receiver's source text. Note that
     *     the first pair here will be the method's 'function() {...}' statement
     *     for itself.
     * @returns {Number[]} An Array of two numbers: the start index and the end
     *     index of each occurrence of the literal.
     */

    var obj,

        text,
        tokens,

        funcIndexes,
        i,
        j,
        count,

        startPos,
        endPos;

    obj = TP.getRealFunction(this);

    text = obj.toString();

    //  Tokenize our source String - it's the only way ;-).
    tokens = TP.$tokenize(text);

    funcIndexes = TP.ac();

    for (i = 0; i < tokens.getSize(); i++) {

        //  Look for an opening 'function' keyword
        if (tokens.at(i).value !== 'function') {
            continue;
        }

        //  Find the first '{' after that.
        count = 0;
        for (j = i; j < tokens.getSize(); j++) {
            if (tokens.at(j).value === '{') {

                //  Capture the starting position and begin the counter.
                startPos = tokens.at(j).to + 1;
                count++;

                break;
            }
        }

        //  Increment to the next token and continue.
        for (j = j + 1; j < tokens.getSize(); j++) {

            //  Kick the counter back and forth as we hit opening and closing
            //  braces.
            if (tokens.at(j).value === '{') {
                count++;
            }
            if (tokens.at(j).value === '}') {
                count--;
            }

            //  If the counter is back at 0, exit.
            if (count === 0) {
                break;
            }
        }

        //  Capture the ending position.
        endPos = tokens.at(j).to;

        funcIndexes.push(TP.ac(startPos, endPos));
    }

    return funcIndexes;
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('getMethodName',
function() {

    /**
     * @method getMethodName
     * @summary Returns the "method name" which is the fully-qualified name of
     *     the function including owner and track (if Inst or Type).
     * @returns {String} The method name string.
     */

    var obj,

        id,
        owner,
        track,
        name;

    obj = TP.getRealFunction(this);

    id = '';

    if (TP.isValid(obj[TP.OWNER])) {
        owner = TP.name(obj[TP.OWNER]);
    }

    if (TP.isValid(obj[TP.TRACK])) {
        track = obj[TP.TRACK];
        switch (track) {
            case TP.TYPE_TRACK:
                /* fall through */
            case TP.INST_TRACK:
                break;
            default:
                track = '';
                break;
        }
    }

    name = TP.name(obj);

    id += owner ? owner + '.' : '';
    id += track ? track + '.' : '';
    id += name;

    return id;
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('getParameterNames',
function() {

    /**
     * @method getParameterNames
     * @summary Returns an Array of the formal parameter names of this
     *     function.
     * @returns {String[]} The formal parameter names to this function.
     */

    var obj,

        text,
        params,
        tokens,
        comments;

    obj = TP.getRealFunction(this);

    text = obj.toString();
    params = text.slice(text.indexOf('(') + 1, text.indexOf(')'));

    //  Some people put comments in their parameter lists so we might as well
    //  leverage tokenizing and just return identifiers.
    tokens = TP.$tokenize(params);

    //  Warn about any comments in parameter lists. This is done here since the
    //  largest invocation of this method occurs as part of the :doclint
    //  command in TIBET which tries to lint comments.
    comments = tokens.filter(
                    function(token) {
                        return token.name === 'comment';
                    });

    if (TP.notEmpty(comments)) {
        TP.warn('Comment(s) in parameter list for ' + obj.getName());
    }

    tokens = tokens.filter(
                    function(token) {
                        return token.name === 'identifier';
                    });

    return tokens.map(
                function(token) {
                    return token.value;
                });
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('getSignature',
function() {

    /**
     * @method getSignature
     * @summary Returns the "method signature" or function calling signature
     *     for the receiver.
     * @returns {String} The signature string.
     */

    var obj,

        str;

    obj = TP.getRealFunction(this);

    str = 'function ' + obj.getName() +
            '(' + obj.getParameterNames().join(', ') + ')';

    return str;
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('getSourceText',
function() {

    /**
     * @method getSourceText
     * @summary Returns the source text for the receiver after stripping all
     *     comment text from it.
     * @returns {String} The source text.
     */

    var obj,

        text,
        tokens;

    obj = TP.getRealFunction(this);

    text = obj.toString();
    tokens = TP.$tokenize(text);
    tokens = tokens.filter(
                    function(token) {
                        return token.name !== 'comment';
                    });

    text = tokens.reduce(
                    function(previous, current) {
                        return previous + current.value;
                    },
                    '');

    return text;
});

//  ------------------------------------------------------------------------
//  FUNCTION SIGNAL OBSERVING
//  ------------------------------------------------------------------------

Function.Inst.defineMethod('execIfTrueOrWaitForSignal',
function(condition, anOrigin, aSignal, timeout) {

    /**
     * @method execIfTrueOrWaitForSignal
     * @summary Executes the receiver immediately if the condition is true. If
     *     not, the receiver will be executed when the specified signal from the
     *     specified origin is received.
     * @param {Boolean} condition The condition to test for immediate execution.
     * @param {Object|Object[]} anOrigin The originator(s) to be observed.
     * @param {TP.sig.Signal|Array<TP.sig.Signal|String>} aSignal The signal(s)
     *     to observe.
     * @param {Number} [timeout] An optional delay for when this method will
     *     cause the receiver to be unsubscribed to the signal if the handler
     *     hasn't been executed yet. This default to the value of the
     *     'content.signal.delay' cfg value.
     * @returns {Function} The receiver.
     */

    var thisref,

        didRun,
        handler;

    if (TP.isTrue(condition)) {
        this();
        return this;
    }

    thisref = this;

    didRun = false;
    handler = function(aSig) {
        handler.ignore(anOrigin, aSig);

        thisref();

        didRun = true;
    };

    handler.observe(anOrigin, aSignal);

    setTimeout(
        function() {
            if (!didRun) {
                handler.ignore(anOrigin, aSignal);
            }
        }, TP.ifInvalid(timeout, TP.sys.cfg('content.signal.delay', 1000)));

    return this;
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
     * @method asType
     * @summary Returns the receiver as a Type. If the receiver *is* a type
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
     * @method getSubtypes
     * @summary Returns an array containing the subtypes of the receiver. When
     *     working with immediate children (no descent), you should consider
     *     this array private and avoid manipulating it directly.
     * @param {Boolean} shouldDescend A flag controlling whether the list
     *     includes all subtypes or only immediate children.
     * @returns {Object[]} An array of subtypes.
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

        //  update length in case we found some more to work through
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
     * @method getSubtypeNames
     * @summary Returns an array containing the subtype names of the receiver.
     *     The default list contains names of immediate subtypes.
     * @param {Boolean} shouldDescend A flag controlling whether the list
     *     includes all subtypes or only immediate children.
     * @returns {String[]} An array of subtype names.
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
     * @method getSupertype
     * @summary Returns the supertype of the receiver.
     * @returns {Object|undefined} The supertype of the receiver.
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
     * @method getSupertypeName
     * @summary Returns the supertype name of the receiver.
     * @returns {String|undefined} The supertype name of the receiver.
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
     * @method getSupertypes
     * @summary Returns an array containing the supertypes of the receiver. If
     *     the receiver is an 'instance' then the supertypes of the receiver's
     *     types are returned. You should consider this array private and avoid
     *     manipulating it. The first element in this array is the immediate
     *     supertype of the receiver or, in the case of an instance, it's the
     *     receiver's type.
     * @returns {Object[]} An array of root to immediate supertypes.
     */

    var arr,
        type;

    if (TP.isType(this)) {
        arr = this[TP.ANCESTORS];
        if (TP.isValid(arr)) {
            return arr;
        }

        arr = TP.ac();

        /* eslint-disable consistent-this */

        type = this;
        /* eslint-disable no-cond-assign */
        while (type = type[TP.SUPER]) {
            arr.push(type);
        }
        /* eslint-enable no-cond-assign */

        this[TP.ANCESTORS] = arr;

        /* eslint-enable consistent-this */

        return arr;
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
     * @method getSupertypeNames
     * @summary Returns an array containing the supertype names of the
     *     receiver.
     * @returns {String[]} An array containing the supertype names of the
     *     receiver.
     */

    var type,
        arr;

    //  types keep this list, which is built from defineSubtype calls
    if (TP.isType(this)) {
        arr = this[TP.ANCESTOR_NAMES];
        if (TP.isValid(arr)) {
            return arr;
        }

        arr = TP.ac();

        /* eslint-disable consistent-this */

        type = this;
        /* eslint-disable no-cond-assign */
        while (type = type[TP.SUPER]) {
            arr.push(type.getName());
        }
        /* eslint-enable no-cond-assign */

        this[TP.ANCESTOR_NAMES] = arr;

        /* eslint-enable consistent-this */

        return arr;
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
//  POLYMORPHIC SIGNAL METHODS
//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getSignalName',
function() {

    /**
     * @method getSignalName
     * @summary Returns the 'signal name' of the receiver. If the receiver is
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
     * @method getSignalName
     * @summary Returns the 'signal name' of the receiver. If the receiver is
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
     * @method getSignalName
     * @summary Returns the 'signal name' of the receiver. If the receiver is
     *     an Object this is equivalent to getTypeName(). If the receiver is a
     *     String the content of the string is returned.
     * @description This method allows Strings to function as Signals within the
     *     framework so that the individual signal types don't have to exist
     *     when the signal is thrown.
     * @returns {String} The signal name of the receiver.
     */

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
     * @method isMemberOf
     * @summary Returns true if anObject is a direct member of aType. The test
     *     performed is both on identity and name so that certain forms of 'type
     *     spoofing' can be done to get around not being able to create direct
     *     subtypes of native types in certain browsers.
     * @param {Object} anObject The object to test.
     * @param {TP.lang.RootObject|String} aType A Type object, or type name.
     * @returns {Boolean} Whether or not the supplied object is a member of the
     *     supplied type.
     */

    var result,

        objTypeName,
        typeName,

        testType;

    //  NB: This is a very heavily used routine, so we use very primitive
    //  checking in it.

    //  NB: We have to treat NaN specially - sigh. Note here that we compare
    //  directly with NaN since isNaN will return true for things like the
    //  'undefined' value.
    /* eslint-disable use-isnan */
    if (anObject === NaN) {
    /* eslint-enable use-isnan */
        //  empty
    } else if (
        //  This seems very pendantic, but these are single compare statements
        //  in most JS VMs and so are much faster than '!anObject', etc. They're
        //  also more accurate, since otherwise "falsey" values won't be
        //  properly tested.
        anObject === undefined || anObject === null ||
        aType === undefined || aType === null ||
        anObject.constructor === undefined || anObject.constructor === null) {
        //  If any of these are not a valid object, then just return false -
        //  can't do any comparisons.
        return false;
    }

    if (TP.isNonFunctionConstructor(anObject)) {
        //  The object is created by non Function constructors and has a
        //  constructor name for us to use.

        /* eslint-disable no-extra-parens */
        if ((result = anObject.$$nonFunctionConstructorConstructorName)) {
            return result;
        }

        return (aType === 'Object' || aType === Object);
        /* eslint-enable no-extra-parens */
    }

    typeName = TP.isType(aType) ? TP.name(aType) : aType;

    //  anObject is a TIBET 'type' itself? Then check to see if the object's
    //  type or typename matches the supplied type or typename. Otherwise, the
    //  last test in this method will get confused and return 'true' for things
    //  like TP.isMemberOf(String, 'String'), which is seriously incorrect.
    if (TP.isType(anObject) && !TP.isNativeType(anObject)) {

        /* eslint-disable no-extra-parens */
        return (anObject.getType() === aType ||
                anObject.getTypeName() === typeName);
        /* eslint-enable no-extra-parens */
    }

    //  direct instance of a native type? fast exit, but not all constructors
    //  respond to getName
    try {
        /* eslint-disable no-extra-parens */
        if ((aType !== Object) &&
            ((anObject.constructor === aType) ||
                (TP.isCallable(anObject.constructor.getName) &&
                (anObject.constructor.getName() === aType)))) {
            return true;
        }
        /* eslint-enable no-extra-parens */
    } catch (e) {
        void 0;
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
    if (TP.isNativeFunction(anObject.constructor)) {
        if (TP.isString(testType = aType)) {
            testType = TP.global[aType];
        }

        if (TP.isNativeFunction(testType)) {
            return anObject.constructor.toString() === testType.toString();
        }
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isKindOf',
function(anObject, aType) {

    /**
     * @method isKindOf
     * @summary Returns true if TP.isMemberOf(anObject, aType) is true or if
     *     TP.isMemberOf() returns true for any subtypes of aType.
     * @param {Object} anObject The object to test.
     * @param {TP.lang.RootObject|String} aType A Type object, or type name.
     * @returns {Boolean} Whether or not the supplied object is a kind of the
     *     supplied type.
     */

    var typeName,
        superTNames;

    //  NB: This is a very heavily used routine, so we use very primitive
    //  checking in it.

    //  if we're a direct member of that type then yes, we're a kind of that
    //  type...and this is a fairly fast test
    if (TP.isMemberOf(anObject, aType)) {
        return true;
    }

    //  NB: We have to treat NaN specially - sigh. Note here that we compare
    //  directly with NaN since isNaN will return true for things like the
    //  'undefined' value.
    /* eslint-disable use-isnan */
    if (anObject === NaN) {
    /* eslint-enable use-isnan */
        //  empty
    } else if (
        //  This seems very pendantic, but these are single compare statements
        //  in most JS VMs and so are much faster than '!anObject', etc. They're
        //  also more accurate, since otherwise "falsey" values won't be
        //  properly tested.
        anObject === undefined || anObject === null ||
        aType === undefined || aType === null ||
        anObject.constructor === undefined || anObject.constructor === null) {
        //  If any of these are not a valid object, then just return false -
        //  can't do any comparisons.
        return false;
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
     * @method isSubtypeOf
     * @summary Returns true if the receiver is a subtype of the type provided.
     *     This is always false for 'instances', which an essential difference
     *     between this function and TP.isKindOf().
     * @param {Object} anObject The object to test.
     * @param {TP.lang.RootObject|String} aType A Type object, or type name.
     * @returns {Boolean} Whether or not the supplied object is a subtype of the
     *     supplied type.
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
     * @method isURI
     * @summary Returns true if the object provided is either a valid instance
     *     of TP.uri.URI (or a subtype) or a String whose content appears
     *     likely to represent a URI. The test is performed using the
     *     TP.regex.URI_LIKELY regular expression, which is *not* a strict
     *     attempt to parse the URI.
     * @description Scheme-specific differences inherent in URI definitions make
     *     it impossible to do a reasonable job without using subtypes specific
     *     to each scheme (which TIBET supports but which it does not leverage
     *     for this method).
     *     NOTE: This method is evolving to become just a type check for
     *     TP.uri.URI. Use TP.isURIString() to check to see if a String looks
     *     like a URI.
     * @param {Object} anObject The object to test.
     * @returns {Boolean} True if the object appears to be a URI.
     */

    if (TP.notValid(anObject)) {
        return false;
    }

    if (TP.isString(anObject)) {

        //  A warning that, at some point, this API will change to no longer
        //  test Strings.
        TP.ifWarn() ?
            TP.warn('String supplied to isURI: ' + anObject + '.' +
                    ' Use TP.isURIString() instead.') : 0;

        //  simple check for proper URI form - but make sure it's not a RegExp
        //  literal.
        return TP.regex.URI_LIKELY.test(anObject) &&
                !TP.regex.REGEX_LITERAL_STRING.test(anObject);
    }

    return TP.isKindOf(anObject, 'TP.uri.URI');
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
     * @method trapRecursion
     * @summary Terminates TIBET execution and optionally alerts the current
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
     * @returns {Boolean} True if a recursion was detected.
     */

    var doNotify,
        doThrow,
        depth,
        stack,
        stackInfo;

    if (!TP.sys.shouldTrapRecursion()) {
        return false;
    }

    doNotify = TP.ifInvalid(shouldNotify, true);
    doThrow = TP.ifInvalid(shouldThrow, false);

    depth = TP.isNumber(stackDepth) ?
                            stackDepth :
                            TP.sys.cfg('stack.max_recursion');

    try {
        throw new Error();
    } catch (e) {
        stack = e.stack || [];
        if (doNotify) {
            stackInfo = TP.getStackInfo(e);
        }
    }

    //  don't need to use activations here, only care about length
    if (TP.isArray(stack) && stack.length > depth) {
        if (doNotify) {
            TP.boot.$stderr('RecursionException', stackInfo, TP.log.ERROR);
        }
        if (TP.notFalse(doThrow)) {
            throw new Error('RecursionError');
        }
        return true;
    }

    return false;
});

//  ------------------------------------------------------------------------

//  NOTE: DO NOT REGISTER THIS...
TP.sys.onerror = function(msg, url, line, column, errorObj) {

    /**
     * @method onerror
     * @summary Captures global errors and outputs them appropriately. This
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
     */

    var file,
        path,
        str;

    try {
        //  The boot system will set a file reference in certain cases to help
        //  ensure we report the proper origin.
        file = TP.boot.$$onerrorFile;
        path = TP.notValid(file) ? url : file;

        str = msg || 'Error';
        str += ' in file: ' + path + ' line: ' + line + ' column: ' + column;

        if (TP.sys.shouldLogStack() && TP.isError(errorObj)) {
            str += '\nSTACK:\n' + TP.getStackInfo(errorObj).join('\n');
        }

        //  If we're still booting errors that are uncaught are considered FATAL.
        if (!TP.sys.hasStarted()) {
            TP.fatal(str);
        } else {
            //  Uncaught errors are errors relative to those we raise/catch.
            TP.ifError() ? TP.error(str) : 0;
        }
    } catch (e) {
        //  don't let log errors trigger recursion, but don't bury them either.
        top.console.error('Error logging onerror: ' + e.message);
        top.console.error(str || msg);
    }

    //  last chance...invoke the debugger :)
    if (TP.sys.shouldUseDebugger()) {
        TP.sys.$launchDebugger(arguments);
    }

    //  NOTE we use this construct because declaring this as a global causes
    //  ESLint to freak out about an unused variable on line 28 even if we
    //  encapsulate it in no-unused-vars directives.

    /* eslint-disable no-undef */
    $STATUS = TP.FAILED;
    /* eslint-enable no-undef */

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
if (TP.notValid(TP.sys.$signalQueue)) {
    TP.sys.$signalQueue = TP.ac();
}

//  ------------------------------------------------------------------------

TP.definePrimitive('queue',
function(anOrigin, aSignal, aPayload, aPolicy, aType) {

    /**
     * @method queue
     * @summary Provides a way to queue a signal for processing. This method is
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
     * @method queue
     * @summary Queues a set of signal parameters for processing at the end of
     *     the current signal handling cycle.
     * @param {TP.sig.Signal} aSignal The signal to fire.
     * @param {Object} aPayload Optional argument object.
     * @param {Function} aPolicy A "firing" policy that will define how the
     *     signal is fired.
     * @param {String|TP.sig.Signal} aType The default supertype to use when
     *     aSignal type doesn't exist.
     */

    return TP.queue(this, aSignal, aPayload, aPolicy, aType);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('signal',
function(anOrigin, aSignal, aPayload, aPolicy, aType) {

    /**
     * @method signal
     * @summary Signals activity to registered observers. Any additional
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

    TP.ifTrace() && TP.sys.shouldLogLoadSignals() ?
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
     * @method signal
     * @summary Signals activity to registered observers using the receiver as
     *     the origin of the signal.
     * @param {TP.sig.Signal} aSignal The signal to fire.
     * @param {Object} aPayload Optional argument object.
     * @param {Function} aPolicy A "firing" policy that will define how the
     *     signal is fired.
     * @param {String|TP.sig.Signal} aType The default supertype to use when
     *     aSignal type doesn't exist.
     * @returns {TP.sig.Signal} The fired signal.
     */

    return TP.signal(this, aSignal, aPayload, aPolicy, aType);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('ignore',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @method ignore
     * @summary Causes notifications to a particular handler to stop. If the
     *     handler is null all notifications from that origin/signal pair are
     *     removed regardless of the handler in question.
     * @param {Object|Object[]} anOrigin The originator(s) to be ignored.
     * @param {TP.sig.Signal|Array<TP.sig.Signal|String>} aSignal The signal(s)
     *     to ignore.
     * @param {Object} aHandler The handler to disable.
     * @param {Function} aPolicy A "removal" policy that will define how the
     *     handler is removed.
     * @returns {Object} The registration object.
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
     * @method ignore
     * @summary Causes notifications to a particular handler to stop. If the
     *     handler is null all notifications from that origin/signal pair are
     *     removed regardless of the handler in question. If no handler is
     *     provided the receiver is assumed to be the handler.
     * @param {Object|Object[]} anOrigin The originator(s) to be ignored.
     * @param {TP.sig.Signal|Array<TP.sig.Signal|String>} aSignal The signal(s)
     *     to ignore.
     * @param {Object} aHandler The handler to disable.
     * @param {Function} aPolicy A "removal" policy that will define how the
     *     handler is removed.
     * @returns {Object} The registration object.
     */

    var handler;

    handler = TP.ifInvalid(aHandler, this);

    return TP.ignore(anOrigin, aSignal, handler, aPolicy);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('observe',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @method observe
     * @summary Causes notifications to a particular handler to start. The
     *     origin and signal combination define how this occurs. Using null for
     *     either value means "any" and sets up a generic observation. The
     *     policy is a "registration" policy that defines how the observation
     *     will be configured.
     * @param {Object|Object[]} anOrigin The originator(s) to be observed.
     * @param {TP.sig.Signal|Array<TP.sig.Signal|String>} aSignal The signal(s)
     *     to observe.
     * @param {Object} aHandler The handler to notify.
     * @param {Function} aPolicy A "registration" policy that will define how
     *     the handler is registered.
     * @returns {Object} The registration object.
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
     * @method observe
     * @summary Causes notifications to a particular handler to start. The
     *     origin and signal combination define how this occurs. Using null for
     *     either value means "any" and sets up a generic observation. The
     *     policy is a "registration" policy that defines how the observation
     *     will be configured. If no handler is provided the receiver is assumed
     *     and registered.
     * @param {Object|Object[]} anOrigin The originator(s) to be observed.
     * @param {TP.sig.Signal|Array<TP.sig.Signal|String>} aSignal The signal(s)
     *     to observe.
     * @param {Object} aHandler The handler to notify.
     * @param {Function} aPolicy A "registration" policy that will define how
     *     the handler is registered.
     * @returns {Object} The registration object.
     */

    var handler;

    handler = TP.ifInvalid(aHandler, this);

    return TP.observe(anOrigin, aSignal, handler, aPolicy);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('resume',
function(anOrigin, aSignal) {

    /**
     * @method resume
     * @summary Causes notifications matching the criteria to resume. Undoes
     *     the effect of having called TP.suspend().
     * @param {Object|Object[]} anOrigin The origin(s) for signals to resume.
     * @param {TP.sig.Signal|Array<TP.sig.Signal|String>} aSignal The signal(s)
     *     to resume.
     * @returns {Object} The registration.
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
     * @method resume
     * @summary Causes notifications of the signal provided to resume. Undoes
     *     the effect of having called suspend(). The origin being resumed is
     *     the receiver.
     * @param {TP.sig.Signal|Array<TP.sig.Signal|String>} aSignal The signal(s)
     *     to resume.
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
     * @method suspend
     * @summary Causes notifications matching the criteria to pause. No
     *     registrations are removed but no signaling is performed until a
     *     TP.resume() is called.
     * @param {Object|Object[]} anOrigin The origin(s) to suspend.
     * @param {TP.sig.Signal|Array<TP.sig.Signal|String>} aSignal The signal(s)
     *     to suspend.
     * @returns {Object} The registration.
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
     * @method suspend
     * @summary Causes notifications of aSignal to pause from the receiver.
     *     Calling resume() with the same signal type will turn them back on.
     * @param {TP.sig.Signal|Array<TP.sig.Signal|String>} aSignal The signal(s)
     *     to suspend.
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
function(signalName, aHandler, aDescriptor) {

    /**
     * @method defineHandler
     * @summary Defines a new signal handler. The signalName is typically a
     *     string but can also be a signal type. The descriptor provides a way
     *     to override signalName if you need, and to also provide criteria
     *     origin, state, capturing, etc. which further restrict when the
     *     handler should be matched for use with a signal.
     * @param {String|TP.lang.RootObject.Type} signalName The signal or type
     *     this handler will respond to. NOTE that this value can be ignored
     *     completed if you provide a 'signal' key in the descriptor.
     * @param {Function} aHandler The function body for the event handler.
     * @param {String|Object} descriptor The 'descriptor' parameter can be
     *     either a simple String denoting signal name or a property descriptor.
     *     That property descriptor should be a plain JS object containing one
     *     or more of the following properties:
     *          signal (TIBET type or String signal name)
     *          origin (object or String id)
     *          state (String state name)
     *          phase (TP.CAPTURING, TP.AT_TARGET, TP.BUBBLING (default)).
     * @returns {Function} The newly defined handler method.
     */

    var name,
        desc;

    if (!TP.isFunction(aHandler)) {
        return this.raise('InvalidFunction');
    }

    if (TP.isValid(aDescriptor)) {

        if (TP.isTrue(aDescriptor)) {
            TP.warn('Deprecated API. Use a descriptor object for capture flag.');
            desc = {
                phase: TP.CAPTURING
            };
        } else if (!TP.isPlainObject(aDescriptor)) {
            return this.raise('InvalidDescriptor');
        } else {
            desc = aDescriptor;
        }

        //  Map over signalName as signal key if missing. Otherwise note that
        //  the signalName value is essentially discarded.
        if (TP.notValid(desc.signal)) {
            desc.signal = signalName;
        }

        //  Support 'capturing: true' shortcut in descriptor.
        if (TP.isTrue(desc.capturing)) {
            desc.phase = TP.CAPTURING;
        }

        name = TP.composeHandlerName(desc);

    } else if (TP.isString(signalName)) {
        desc = {
            signal: signalName
        };
        name = TP.composeHandlerName(signalName);
    } else {
        desc = {
            signal: signalName
        };
        name = TP.composeHandlerName(desc);
    }

    //  Simple method definition once we have a normalized handler name. Note
    //  however that we need to pass a special flag to keep defineMethod from
    //  whining about us defining a method starting with 'handle'.
    //  NOTE that we pass the descriptor along to defineMethod in case it has
    //  other keys of interest to that method such as patchCallee.
    return this.defineMethod(name, aHandler, desc, null, true);
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('fireNextSignal',
function() {

    /**
     * @method fireNextSignal
     * @summary Activates (fires) the next signal in the signal queue.
     * @description This method is called on kernel finalization and by the
     *     signal call as it completes each signal, forming a kind of event loop
     *     which terminates when no pending signals exist.
     */

    var it;

    it = TP.sys.$signalQueue.shift();

    if (TP.notValid(it)) {
        return;
    }

    return TP.signal(it.at(0), it.at(1), it.at(2), it.at(3), it.at(4));
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
     * @method isOriginSet
     * @summary Returns true if the receiver has been flagged as a signal
     *     origin set. If aFlag is provided it will set this value.
     * @param {Boolean} aFlag True if the receiver should be treated as a list
     *     of origins and not the actual origin itself.
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
     * @method $getInstPropertyScope
     * @summary Returns the 'scope' of the named property.
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
     * @method $getPrototypePropertyScope
     * @summary Returns the 'scope' of the named property.
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

TP.defineMetaInstMethod('$getTypePropertyScope',
function(aName) {

    /**
     * @method $getTypePropertyScope
     * @summary Returns the 'scope' of the named property.
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
     * @method $getTypePropertyScope
     * @summary Returns the 'scope' of the named property.
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
     * @method getPropertyScope
     * @summary Returns the 'scope' of the named property. The scope returned
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
    } finally {
        TP.sys.shouldLogStack(flag);
    }
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('$getInterface',
function(aFilter) {

    /**
     * @method $getInterface
     * @summary Returns an array containing the keys of the receiver, filtered
     *     according to a filtering specification. The valid filtering specs are
     *     listed with TP.SLOT_FILTERS, filtered to match the desired subset of
     *     keys.
     * @param {Object|String} aFilter An object containing filter properties or
     *     a name of one of the keys registered under TP.SLOT_FILTERS. The
     *     default is 'unique_methods'.
     * @returns {String[]} An array containing matching slots.
     */

    var obj,

        filter,
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

        propScope;

        //  TODO: why don't we use this value?
        // proto;

    //  shortcut for using this method to get all keys of any kind.
    if (aFilter === 'known' || aFilter === TP.SLOT_FILTERS.known) {

        //  NB: This was written to be hyper-efficient, hence the use of native
        //  JS here.
        keys = [];

        /* eslint-disable consistent-this */

        obj = this;

        do {
            keys.push(TP.objectGetKeys(obj));
            obj = Object.getPrototypeOf(obj);
        } while (obj);

        keys = Array.prototype.concat.apply([], keys);
        keys = keys.filter(
                        function(aKey) {
                            return !TP.regex.INTERNAL_SLOT.test(aKey);
                        });

        /* eslint-enable consistent-this */

        return keys;
    }

    keys = TP.ac();

    //  next question is can we find the requested subset on the list?
    filter = TP.ifInvalid(aFilter, 'unique_methods');

    if (TP.isString(filter)) {
        filter = filter.toLowerCase();

        if (TP.notValid(params = TP.SLOT_FILTERS[filter])) {
            TP.ifWarn() ?
                TP.warn('Invalid reflection filter: ' + filter) : 0;

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
            TP.warn('Invalid reflection filter: ' + filter) : 0;

        return TP.ac();
    }

    /* eslint-disable no-extra-parens */
    unique = (scope === TP.UNIQUE);
    /* eslint-enable no-extra-parens */

    if (!unique) {
        //  warn for any non-unique scans. when it's a unique scan we can
        //  leverage hasOwnProperty to avoid too much overhead, otherwise we
        //  consider this a performance warning issue.
        TP.ifWarn() && TP.sys.cfg('log.scans') ?
            TP.warn('Scanning ' + filter + ' on ' + this) : 0;
    }

    /* eslint-disable guard-for-in */
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
            if (window[key] === it && TP.ObjectProto[key] !== it) {
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
                if (propScope !== TP.INTRODUCED &&
                    propScope !== TP.LOCAL &&
                    propScope !== TP.OVERRIDDEN) {
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
    /* eslint-enable guard-for-in */

    return keys;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getInterface',
function(aFilter) {

    /**
     * @method getInterface
     * @summary Returns a list of the 'slots' on the receiver. This is what you
     *     get if you use for/in on an array rather than for() -- the properties
     *     rather than the indexes of content. See $getInterface for more
     *     information.
     * @param {Object|String} aFilter An object containing filter properties or
     *     a name of one of the keys registered under TP.SLOT_FILTERS.
     * @returns {String[]} Array of slot names matching the filter.
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
     * @method getInstInterface
     * @summary Returns the slot names found on instances of the receiver which
     *     match the filter provided.
     * @param {Object|String} aFilter An object containing filter properties or
     *     a name of one of the keys registered under TP.SLOT_FILTERS.
     * @returns {String[]} Array of slot names matching the filter.
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
     * @method getLocalInterface
     * @summary Returns the slot names found directly on the receiver which
     *     match the filter provided.
     * @param {Object|String} aFilter An object containing filter properties or
     *     a name of one of the keys registered under TP.SLOT_FILTERS.
     * @returns {String[]} Array of slot names matching the filter.
     */

    return this.$getInterface(aFilter);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getTypeInterface',
function(aFilter) {

    /**
     * @method getTypeInterface
     * @summary Returns the slot names found on the receiver's Type which match
     *     the filter provided.
     * @param {Object|String} aFilter An object containing filter properties or
     *     a name of one of the keys registered under TP.SLOT_FILTERS.
     * @returns {String[]} Array of slot names matching the filter.
     */

    var type;

    if (TP.isType(this)) {
        return this.$getInterface(aFilter);
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
function() {

    /**
     * @method getKeys
     * @summary Returns the set of keys requested for the receiver.
     * @returns {String[]} An array containing the keys of the receiver.
     */

    //  non-mutable things like strings etc. can't have had new keys placed
    //  on them so only process mutables.
    if (TP.isMutable(this)) {
        return TP.$getOwnKeys(this);
    }

    return TP.ac();
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('getKeys',
function() {

    /**
     * @method getKeys
     * @summary Top-level key-getter for Array instances. Returns the 'indexes'
     *     or 'keys' of the array. This version returns all keys. An interesting
     *     alternative is only returning keys whose values are non-null (see
     *     TP.core.Mask.getMasks() for an example).
     * @returns {String[]} An array containing the keys of the receiver.
     */

    var tmparr;

    tmparr = TP.$getOwnKeys(this);

    return tmparr.concat(TP.sys.$arraykeys);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('getKeys',
function() {

    /**
     * @method getKeys
     * @summary Returns the set of keys which represent attribute values for
     *     the receiver. This is supported on String to allow it to behave as a
     *     collection of characters.
     * @returns {String[]} An array containing the keys of the receiver.
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
function() {

    /**
     * @method getSize
     * @summary Returns the size of the receiver. This is thought of as the
     *     number of attributes the receiver contains unless a different filter
     *     is provided.
     * @returns {Number} The receiver's size.
     */

    var k,
        res;

    k = this.getKeys();
    res = k.getSize();

    return res;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('getSize',
function() {

    /**
     * @method getSize
     * @summary Returns the size of the receiver. For simple strings this is
     *     the length.
     * @returns {Number} The receiver's size.
     */

    return this.length;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getValues',
function(aFilterName) {

    /**
     * @method getValues
     * @summary Returns an array containing the values for the objects'
     *     attributes. The filter provided determines which set of keys is used
     *     to acquire the values.
     * @returns {Object[]} An array of the values for the receiver's keys.
     */

    var arr,
        i,
        k;

    arr = TP.ac();
    k = this.getKeys();

    for (i = 0; i < k.getSize(); i++) {
        arr.push(this.at(k.at(i)));
    }

    return arr;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('getValues',
function() {

    /**
     * @method getValues
     * @summary Top-level value-getter. For Arrays the values are contained in
     *     the array itself.
     * @returns {Object[]} An array containing the receiver's values.
     */

    return this;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('getValues',
function() {

    /**
     * @method getValues
     * @summary Returns an array containing the characters in the receiver.
     * @returns {String[]} An array of characters.
     */

    return this.split('');
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('hasKey',
function(aKey) {

    /**
     * @method hasKey
     * @summary Returns true if aKey has been defined for the receiver. This is
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
     * @method hasKey
     * @summary Returns true if aKey has been defined for the receiver. For an
     *     array there are a couple of ways to look at this. First is whether
     *     the key must be a number. For object comparison reasons we don't
     *     enforce this. Second is whether we should consider 'sparse locations'
     *     to exist (they don't by default so use includeUndefined to confirm).
     * @param {Number} aKey The index (key) to test.
     * @param {Boolean} includeUndefined Should 'sparse' slots be included?
     * @returns {Boolean} True if the key is defined.
     */

    var includeUndef;

    if (TP.isNumber(aKey)) {
        if (this.length < aKey) {
            return false;
        }
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
     * @method inherits
     * @summary Returns true if the name represents an inherited property of
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
     * @method inheritsFromIntroducer
     * @summary Returns true if the name represents an inherited property of
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
     * @method introduces
     * @summary Returns true if the name represents an introduced property of
     *     the receiver.
     * @param {String} aName The property name to check.
     * @returns {Boolean} Whether or not the property was introduced by the
     *     receiver.
     */

    return this.getPropertyScope(aName) === TP.INTRODUCED;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('isEmpty',
function(aFilterName) {

    /**
     * @method isEmpty
     * @summary Returns whether or not the receiver is considered 'empty'.
     * @description At this level, this uses the number of attributes the
     *     receiver contains unless a different filter is provided and compares
     *     the size of that to 0.
     * @param {String} aFilterName A get*Interface() filter.
     * @returns {Boolean} Whether or not the receiver is empty.
     */

    return this.getSize() === 0;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('isEmpty',
function() {

    /**
     * @method isEmpty
     * @summary Returns whether or not the receiver is considered 'empty'.
     * @returns {Boolean} Whether or not the receiver is empty.
     */

    return this.length === 0;
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('isEmpty',
function() {

    /**
     * @method isEmpty
     * @summary Returns whether or not the receiver is considered 'empty'.
     * @returns {Boolean} Whether or not the receiver is empty.
     */

    return this.toString().length === 0;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('isEmpty',
function() {

    /**
     * @method isEmpty
     * @summary Returns whether or not the receiver is considered 'empty'.
     * @returns {Boolean} Whether or not the receiver is empty.
     */

    return this.length === 0;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('overrides',
function(aName) {

    /**
     * @method overrides
     * @summary Returns true if the name represents an overridden property of
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
 */

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('$$isPair',
function() {

    /**
     * @method $$isPair
     * @summary Returns true if the object is considered an ordered pair.
     *     Objects (and TP.core.Hashes) are never considered ordered pairs.
     * @returns {Boolean} Whether or not the receiver is considered to be an
     *     ordered pair.
     */

    return false;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('$$isPair',
function() {

    /**
     * @method $$isPair
     * @summary Returns true if the receiver can be thought of as an ordered
     *     pair.
     * @description For arrays an ordered pair is a two-element array, however
     *     an array whose 'key' i.e. the first() element is null will not be
     *     considered a valid pair.
     * @returns {Boolean} Whether or not the receiver is considered to be an
     *     ordered pair.
     */

    /* eslint-disable no-extra-parens */
    return (this.getSize() === 2) && TP.isValid(this.at(0));
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('first',
function(aNumber) {

    /**
     * @method first
     * @summary Returns the first N items from the receiver, where N defaults
     *     to 1.
     * @description This method only returns consistent results on ordered
     *     collections, but it should always successfully return N items if
     *     they're available.
     * @param {Number} aNumber The number of items to return. When N is greater
     *     than 1 the return value is a new array.
     * @returns {Object} When N is 1 the result is an array of length 2 with key
     *     and value in positions 0 and 1. When N is greater than 1 the return
     *     value is an array containing N ordered pairs of this form.
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
     * @method first
     * @summary Returns the first N items of the receiver, where N defaults to
     *     1.
     * @param {Number} aNumber The number of items to return. When N is greater
     *     than 1 the return value is a new array.
     * @exception TP.sig.InvalidIndex
     * @returns {Object} The first N items in this array.
     */

    this.$sortIfNeeded();

    if (TP.isNumber(aNumber) && aNumber > 1) {
        return this.slice(0, aNumber);
    }

    /* eslint-disable no-extra-parens */
    return (this.length > 0) ? this.at(0) : null;
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('first',
function(aNumber) {

    /**
     * @method first
     * @summary Returns the first N characters of the receiver, where N
     *     defaults to 1.
     * @param {Number} aNumber The number of characters to return. When N is
     *     greater than 1 the return value is a string with that length (if
     *     enough characters are available).
     * @returns {Object} The first N characters in the string.
     */

    if (TP.isNumber(aNumber) && aNumber > 1) {
        return this.slice(0, aNumber);
    }

    /* eslint-disable no-extra-parens */
    return (this.length > 0) ? this.charAt(0) : null;
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('last',
function(aNumber) {

    /**
     * @method last
     * @summary Returns the last N items from the receiver, where N defaults to
     *     1.
     * @description This method only returns consistent results on ordered
     *     collections, but it should always successfully return N items if
     *     they're available.
     * @param {Number} aNumber The number of items to return. When N is greater
     *     than 1 the return value is a new array.
     * @returns {Object} When N is 1 the result is an array of length 2 with key
     *     and value in positions 0 and 1. When N is greater than 1 the return
     *     value is an array containing N ordered pairs of this form.
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
     * @method last
     * @summary Returns the last N items of the receiver, where N defaults to
     *     1.
     * @param {Number} aNumber The number of items to return. When N is greater
     *     than 1 the return value is a new array.
     * @exception TP.sig.InvalidIndex
     * @returns {Object} The last N items in this array.
     */

    this.$sortIfNeeded();

    if (TP.isNumber(aNumber) && aNumber > 1) {
        return this.slice(this.length - aNumber);
    }

    /* eslint-disable no-extra-parens */
    return (this.length > 0) ? this.at(this.length - 1) : null;
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('last',
function(aNumber) {

    /**
     * @method last
     * @summary Considering the number as a range this returns the last index in
     *     that range.
     * @param {Number} aNumber The number of items to return. When N is greater
     *     than 1 the return value is a new array. Ignored for this type.
     * @exception TP.sig.InvalidIndex
     * @returns {Object} The last index.
     */

    if (this > 0) {
        return this - 1;
    } else {
        return 0;
    }
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('last',
function(aNumber) {

    /**
     * @method last
     * @summary Returns the last N characters of the receiver, where N defaults
     *     to 1.
     * @param {Number} aNumber The number of characters to return. When N is
     *     greater than 1 the return value is a string with that length (if
     *     enough characters are available).
     * @returns {Object} The last N characters in the string.
     */

    if (TP.isNumber(aNumber) && aNumber > 1) {
        return this.slice(this.length - aNumber);
    }

    /* eslint-disable no-extra-parens */
    return (this.length > 0) ? this.at(this.length - 1) : null;
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getPairs',
function(aSelectFunction) {

    /**
     * @method getPairs
     * @summary Returns an array of ordered pairs generated from the receiver.
     *     The individual pairs are [key,value] arrays where the keys are
     *     filtered using the optional function provided.
     * @param {Function} aSelectFunction A function used to select items that
     *     will be returned. Each item is passed to this function and if the
     *     function returns true the item is included in the result.
     * @exception TP.sig.InvalidPairRequest
     * @returns {Object[]} The array of ordered pairs.
     */

    //  if we can provide keys and do an 'at' then we can get pairs
    if (!TP.canInvokeInterface(this, ['at', 'getKeys'])) {
        return this.raise('TP.sig.InvalidPairRequest');
    }

    //  the work is easy for key/value objects
    return this.select(aSelectFunction || TP.RETURN_TRUE);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('getPairs',
function(aSelectFunction) {

    /**
     * @method getPairs
     * @summary Returns the ordered pairs contained in the receiver, or implied
     *     by the receiver's key/value content. For example, an array of the
     *     form [['a',1], ['b',2]] will simply return its content wrapped in a
     *     new container, while an array of the form ['a','b','c'] will return
     *     [['a','b'],['c',null]]. This is the inverse operation a flatten would
     *     have had on the results of a getPairs on a TP.core.Hash.
     * @description To allow Arrays to serve as a form of interchange format
     *     between collections of various types they have special behavior when
     *     it comes to managing "items" and "pairs". In particular, although the
     *     array's "keys" could be thought of as its numeric indexes the
     *     getPairs operation doesn't think in those terms, instead focusing on
     *     content rather than ordering information.
     * @param {Function} aSelectFunction A function used to select items that
     *     will be returned. Each item is passed to this function and if the
     *     function returns true the item is included in the result.
     * @returns {Object[]} A new array containing the pairs.
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
    if (len > 0 && TP.isPair(this.first())) {
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
function() {

    /**
     * @method getPairs
     * @summary Returns an array of ordered pairs generated from the receiver.
     * @description For a String this is an invalid operation and an
     *     TP.sig.InvalidPairRequest exception will be raised.
     * @exception TP.sig.InvalidPairRequest
     */

    return this.raise('TP.sig.InvalidPairRequest');
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getKVPairs',
function(aSelectFunction) {

    /**
     * @method getKVPairs
     * @summary Returns an array of ordered pairs generated from the receiver.
     *     The individual pairs are [key,value] arrays where the keys are
     *     filtered using the optional function provided.
     * @param {Function} aSelectFunction A function used to select items that
     *     will be returned. Each item is passed to this function and if the
     *     function returns true the item is included in the result.
     * @exception TP.sig.InvalidPairRequest
     * @returns {Object[]} The array of ordered pairs.
     */

    //  if we can provide keys and do an 'at' then we can get pairs
    if (!TP.canInvokeInterface(this, ['at', 'getKeys'])) {
        return this.raise('TP.sig.InvalidPairRequest');
    }

    //  the work is easy for key/value objects
    return this.select(aSelectFunction || TP.RETURN_TRUE);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('getKVPairs',
function(aSelectFunction) {

    /**
     * @method getKVPairs
     * @summary Returns the key/value pairs contained in the receiver.
     * @description For Arrays this returns an array of ordered pairs where each
     *     ordered pair consists of a numerical index and the value at that
     *     index. This is a more "inspection string" format used specifically
     *     for dumping key/value data.
     * @param {Function} aSelectFunction A function used to select items that
     *     will be returned. Each item is passed to this function and if the
     *     function returns true the item is included in the result.
     * @returns {Object[]} A new array containing the pairs.
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
function(depth, level) {

    /**
     * @method asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @param {Number} [depth=1] Optional max depth to descend into target.
     * @param {Number} [level=1] Passed by machinery, don't provide this.
     * @returns {String} The receiver's dump String representation.
     */

    var marker,
        arr,
        keys,
        len,
        i,
        val,
        str,
        $depth,
        $level;

    if (TP.isWindow(this)) {
        return '[' + TP.tname(this) + ' :: ' + TP.windowAsString(this) + ']';
    }

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asDumpString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }

    //  NB: For 'Object', we put this in a try...catch since some native Objects
    //  (i.e. XHR objects) don't like to have slots placed on them.
    try {
        this[marker] = true;
    } catch (e) {
        void 0;
    }

    /* eslint-disable no-array-constructor */
    arr = new Array();
    /* eslint-enable no-array-constructor */

    str = '[' + TP.tname(this) + ' :: ';

    $depth = TP.ifInvalid(depth, 1);
    $level = TP.ifInvalid(level, 0);

    try {
        keys = TP.$getOwnKeys(this);
        len = keys.length;

        for (i = 0; i < len; i++) {

            val = this[keys.at(i)];

            if (val === this) {
                if (TP.canInvoke(val, 'asRecursionString')) {
                    arr.push(keys[i] + ': ' + val.asRecursionString());
                } else {
                    arr.push(keys[i] + ': ' + 'this');
                }
            } else {
                if ($level > $depth && TP.isMutable(this)) {
                    if (TP.isReferenceType(this)) {
                        arr.push(keys[i] + ': ' +
                            '@' + TP.id(this) + ']');
                    } else {
                        arr.push(keys[i] + ': ' +
                            TP.str(this) + ']');
                    }
                } else {
                    arr.push(keys[i] + ': ' + TP.dump(this[keys[i]],
                        $depth, $level + 1));
                }
            }
        }

        str += '(' + arr.join(', ') + ')' + ']';
    } catch (e) {
        str += '(' + TP.str(this) + ')' + ']';
    } finally {
        try {
            delete this[marker];
        } catch (e) {
            void 0;
        }
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('asPrettyString',
function() {

    /**
     * @method asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} The receiver's 'pretty print' String representation.
     */

    var marker,
        arr,
        keys,
        len,
        i,
        str;

    if (TP.isWindow(this)) {
        return TP.tname(this) + ' :: ' + TP.windowAsString(this);
    }

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asPrettyString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    //  NB: For 'Object', we put this in a try...catch since some native Objects
    //  (i.e. XHR objects) don't like to have slots placed on them.
    try {
        this[marker] = true;
    } catch (e) {
        void 0;
    }

    /* eslint-disable no-array-constructor */
    arr = new Array();
    /* eslint-enable no-array-constructor */

    try {
        keys = TP.$getOwnKeys(this);
        len = keys.length;

        for (i = 0; i < len; i++) {
            arr.push(
                TP.join('<dt class="pretty key">', keys[i], '</dt>',
                        '<dd class="pretty value">',
                            TP.pretty(this[keys[i]]),
                        '</dd>'));
        }

        str = '<dl class="pretty">' + arr.join(', ') + '</dl>';
    } catch (e) {
        str = this.toString();
    } finally {
        try {
            delete this[marker];
        } catch (e) {
            void 0;
        }
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('asRecursionString',
function() {

    /**
     * @method asRecursionString
     * @summary Returns a string representation of the receiver which is used
     *     when the receiver is encountered in a circularly referenced manner
     *     during the production of some sort of formatted String
     *     representation.
     * @returns {String}
     */

    var id;

    id = TP.gid(this);

    if (TP.sys.cfg('debug.register_recursion')) {
        //  If the ID isn't a URI (even one without a scheme), then make it a
        //  TIBET URN and set the content.
        if (!TP.isURIString(id, true)) {
            id = 'urn:tibet:' + id;
            TP.uc(id).setResource(this);
        }
        return id;
    }

    return '@' + id;
});

//  ------------------------------------------------------------------------
//  NOTIFICATION - PART II
//  ------------------------------------------------------------------------

/**
 * More signaling support. In particular, the working versions of the change
 * notification methods.
 */

//  ------------------------------------------------------------------------

TP.$changed = function(anAspect, anAction, aDescription) {

    /**
     * @method $changed
     * @summary Notifies observers that some aspect of the receiver has
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
     * @param {TP.core.Hash} aDescription A hash describing details of the
     *     change.
     * @returns {Object} The receiver.
     * @fires Change
     */

    var sig,
        asp,
        desc,

        baseSignalType;

    //  If this method is invoked before signaling is ready then exit.
    if (!TP.sys.hasInitialized()) {
        return this;
    }

    //  Build up the signal name we'll be firing.
    sig = 'Change';
    asp = TP.ifKeyInvalid(aDescription, 'aspect', anAspect) || 'value';

    if (asp === 'value') {
        sig = 'TP.sig.ValueChange';
    } else {
        sig = TP.makeStartUpper(asp.toString()) + sig;
    }

    //  Convert nChange to IndexNChange signals.
    if (/^[0-9]+/.test(sig)) {
        sig = 'Index' + sig;
    }

    //  Build up a standard form for the description hash.
    desc = TP.isValid(aDescription) ? aDescription : TP.hc();
    if (!TP.canInvoke(desc, 'atPutIfAbsent')) {
        this.raise('TP.sig.InvalidParameter',
                    'Description not a collection.');

        return this;
    }
    desc.atPutIfAbsent('aspect', asp);
    desc.atPutIfAbsent('action', anAction || TP.UPDATE);
    desc.atPutIfAbsent('facet', 'value');
    desc.atPutIfAbsent('target', this);

    baseSignalType = TP.ifInvalid(desc.at('baseSignalType'),
                                    TP.sig.FacetChange);

    //  Fire the signal. Note that we force the firing policy here. This allows
    //  observers of a generic Change to see 'aspect'Change notifications, even
    //  if those 'aspect'Change signals haven't been defined as being subtypes
    //  of Change (although we also supply 'TP.sig.ValueChange' as the default
    //  signal type here so that undefined aspect signals will use that type).
    TP.signal(this, sig, desc, TP.INHERITANCE_FIRING, baseSignalType);

    return this;
};

TP.defineMetaInstMethod('$changed', TP.$changed);
TP.sys.$changed = TP.$changed;

//  ------------------------------------------------------------------------

TP.changed = function(anAspect, anAction, aDescription) {

    /**
     * @method changed
     * @summary Notifies observers that some aspect of the receiver has
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
     * @param {TP.core.Hash} aDescription A hash describing details of the
     *     change.
     * @returns {Object} The receiver.
     * @fires Change
     */

    //  NB: For new objects, this relies on 'undefined' being a 'falsey' value.
    //  We don't normally do this in TIBET, but this method is used heavily and
    //  is a hotspot.
    if (!this.shouldSignalChange()) {
        return this;
    }

    return this.$changed(anAspect, anAction, aDescription);
};

TP.defineMetaInstMethod('changed', TP.changed);
TP.sys.changed = TP.changed;

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('changed',
function(anAspect, anAction, aDescription) {

    /**
     * @method changed
     * @summary Notifies observers that some aspect of the receiver has
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
     * @param {TP.core.Hash} aDescription A hash describing details of the
     *     change.
     * @returns {Array} The receiver.
     * @fires Change
     */

    //  NB: For new objects, this relies on 'undefined' being a 'falsey' value.
    //  We don't normally do this in TIBET, but this method is used heavily and
    //  is a hotspot.
    if (!this.shouldSignalChange()) {
        return this;
    }

    //  might need to sort on next get()
    this.$needsSort = true;

    return this.$changed(anAspect, anAction, aDescription);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('changed',
function(anAspect, anAction, aDescription) {

    /**
     * @method changed
     * @summary Uses the receiving string as a ID and constructs an appropriate
     *     Change notification signal for that ID. See the discussion on
     *     TP.ObjectProto.changed for more info.
     * @param {String} anAspect The aspect of the receiver that changed. This is
     *     usually an attribute name.
     * @param {String} anAction The action which caused the change. This usually
     *     'add', 'remove', etc.
     * @param {TP.core.Hash} aDescription A hash describing details of the
     *     change.
     * @returns {String} The receiver.
     * @fires Change
     */

    var target,
        asp,
        sig,
        desc;

    //  If this method is invoked before signaling is ready then exit.
    if (!TP.sys.hasInitialized()) {
        return this;
    }

    //  NB: For new objects, this relies on 'undefined' being a 'falsey' value.
    //  We don't normally do this in TIBET, but this method is used heavily and
    //  is a hotspot.
    if (!this.shouldSignalChange()) {
        return this;
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
        sig = TP.makeStartUpper(asp.toString()) + sig;
    }

    //  Build up a standard form for the description hash.
    desc = TP.isValid(aDescription) ? aDescription : TP.hc();
    if (!TP.canInvoke(desc, 'atPutIfAbsent')) {
        this.raise('TP.sig.InvalidParameter',
                    'Description not a collection.');

        return this;
    }
    desc.atPutIfAbsent('aspect', asp);
    desc.atPutIfAbsent('action', anAction || TP.UPDATE);
    desc.atPutIfAbsent('facet', 'value');
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
 * RE: the discussion on TIBET's ordered pairs, an object's 'items' in TIBET
 * terminology are ordered pairs of keys/values for Objects and the index/value
 * for Arrays.
 */

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('item',
function(anIndex) {

    /**
     * @method item
     * @summary Returns the item at the index provided. This allows Array
     *     instances to function as valid NodeList instances.
     * @returns {Object} The object at the index in the receiver.
     */

    return this.at(anIndex);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getItems',
function(aSelectFunction) {

    /**
     * @method getItems
     * @summary Returns a list of items from the collection, filtering them via
     *     aSelectFunction if provided. Note that you can use the same semantics
     *     as select for this call.
     * @description The term "items", as opposed to "keys", "values", or "pairs"
     *     is variant in TP.sys. For most collections "items" are "values",
     *     however for TP.core.Hash in particular the "items" are more like
     *     Smalltalk "associations", the key/value pairs. Using getItems is a
     *     way to deal with the "natural item form" of each collection without
     *     concern for the specific nature of those items so this method is
     *     typically called only by the collection itself or by generic
     *     iteration functions.
     * @param {Function} aSelectFunction A function used to select items that
     *     will be returned. Each item is passed to this function and if the
     *     function returns true the item is included in the result.
     * @returns {Object[]} The receiver's items in array key/value form.
     */

    //  Most objects are associative arrays, so we can work from the
    //  getPairs() perspective
    return this.getPairs(aSelectFunction);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('getItems',
function(aSelectFunction) {

    /**
     * @method getItems
     * @summary Returns a list of items from the collection, filtering them via
     *     aSelectFunction if provided. Note that you can use the same semantics
     *     as select for this call.
     * @description The term "items", as opposed to "keys", "values", or "pairs"
     *     is variant in TP.sys. For most collections "items" are "values",
     *     however for TP.core.Hash in particular the "items" are more like
     *     Smalltalk "associations", the key/value pairs. Using getItems is a
     *     way to deal with the "natural item form" of each collection without
     *     concern for the specific nature of those items so this method is
     *     typically called only by the collection itself or by generic
     *     iteration functions.
     * @param {Function} aSelectFunction A function used to select items that
     *     will be returned. Each item is passed to this function and if the
     *     function returns true the item is included in the result.
     * @returns {Object[]} The receiver or a new Array containing the filtered
     *     results.
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
     * @method getItems
     * @summary Returns a list of items from the collection, filtering them via
     *     aSelectFunction if provided. Note that you can use the same semantics
     *     as select for this call.
     * @description The term "items", as opposed to "keys", "values", or "pairs"
     *     is variant in TP.sys. For most collections "items" are "values",
     *     however for TP.core.Hash in particular the "items" are more like
     *     Smalltalk "associations", the key/value pairs. Using getItems is a
     *     way to deal with the "natural item form" of each collection without
     *     concern for the specific nature of those items so this method is
     *     typically called only by the collection itself or by generic
     *     iteration functions.
     * @param {Function} aSelectFunction A function used to select chars that
     *     will be returned. Each char is passed to this function and if the
     *     function returns true the char is included in the result.
     * @returns {String[]} An array of characters in the receiver.
     */

    if (TP.isCallable(aSelectFunction)) {
        return this.getValues().select(aSelectFunction);
    }

    return this.getValues();
});

//  ------------------------------------------------------------------------
//  STRING REPRESENTATION
//  ------------------------------------------------------------------------

/**
 * There are a number of scenarios where getting a displayable output string for
 * an object is important.

 * The asDisplayString() function is the foundation for many of TIBET's
 * formatters since it's capable of producing HTML, XML, or other
 * representations of an object and its children/properties.
*/

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('asDisplayString',
function(aHash, aLevel) {

    /**
     * @method asDisplayString
     * @summary Returns the receiver as a formatted string. This method is
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
     * @param {TP.core.Hash} aHash A TP.core.Hash containing one or more of the
     *     previously mentioned keys.
     * @param {Number} aLevel Number of levels to descend in nested objs.
     * @returns {String} A formatted string.
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

    params = aHash;
    if (TP.notValid(params)) {
        params = TP.hc('filter', 'unique_attributes');
    }

    lvl = TP.notDefined(aLevel) ? TP.sys.cfg('stack.max_descent') :
                                Math.max(0, aLevel);

    //  level 0 means no keys, nada, just the receiver
    if (lvl === 0) {
        return this.toString();
    }

    nullTransform =
            function(it) {
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
                                    TP.RETURN_EMPTY_STRING);
    footer = TP.ifInvalid(params.at('footer'), ';');
    nullValue = TP.ifInvalid(params.at('nullValue'), 'null');
    filter = TP.ifInvalid(params.at('filter'), 'unique_attributes');

    if (TP.isArray(this)) {
        useKeys = TP.ifInvalid(params.at('useKeys'), true);
    } else {
        useKeys = TP.ifInvalid(params.at('useKeys'), false);
    }

    //  note this is here to allow it to close around nullValue
    sourceTransform =
        function(it) {

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
        k = this.getKeys();

        //  Make sure we don't leave the 'length' key in the Array - it will
        //  mess up our sort:
        k.splice(k.indexOf('length'), 1);
    } else {
        //  keys for anything here that's got a unique value
        k = this.getLocalInterface(filter);
    }

    if (TP.isDefined(sorter = params.at('useSort'))) {
        if (TP.isCallable(sorter)) {
            k.sort(sorter);
        } else if (TP.notFalse(sorter)) {
            if (TP.isValid(k.at(0))) {
                if (TP.isArray(this)) {
                    k.sort(TP.sort.NUMERIC);
                } else {
                    k.sort();
                }
            }
        }
    } else {
        if (TP.isValid(k.at(0))) {
            if (TP.isArray(this)) {
                k.sort(TP.sort.NUMERIC);
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

        /* eslint-disable no-extra-parens */
        if (i < (k.getSize() - 1)) {
        /* eslint-enable no-extra-parens */
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

TP.defineMetaInstMethod('asHTTPValue',
function() {

    /**
     * @method asHTTPValue
     * @summary Returns the best value to be used for the receiver to send via
     *     HTTP.
     * @returns {Object} The best value for HTTP sending.
     */

    return this.getValue();
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('asJSONSource',
function() {

    /**
     * @method asJSONSource
     * @summary Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    var marker,
        str;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asJSONSource';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }

    //  NB: For 'Object', we put this in a try...catch since some native Objects
    //  (i.e. XHR objects) don't like to have slots placed on them.
    try {
        this[marker] = true;
    } catch (e) {
        void 0;
    }

    try {
        str = TP.js2json(this);
    } finally {
        try {
            delete this[marker];
        } catch (e) {
            void 0;
        }
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('asSource',
function() {

    /**
     * @method asSource
     * @summary Returns the receiver as a TIBET source code string.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    var marker,
        keys,
        len,
        arr,
        i,
        val;

    if (TP.isType(this)) {
        return this.getTypeName();
    }

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asSource';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }

    //  NB: For 'Object', we put this in a try...catch since some native Objects
    //  (i.e. XHR objects) don't like to have slots placed on them.
    try {
        this[marker] = true;
    } catch (e) {
        void 0;
    }

    keys = this.getKeys();
    len = keys.length;
    arr = TP.ac();

    try {
        for (i = 0; i < len; i++) {
            if (TP.isDefined(val = this.at(keys[i]))) {
                arr.push(
                    TP.join(
                        '\'', TP.str(keys[i]), '\'',
                        ':',
                        TP.src(val)));
            }
        }
    } finally {
        try {
            delete this[marker];
        } catch (e) {
            void 0;
        }
    }

    return TP.join('{', arr.join(', '), '}');
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('asSource',
function() {

    /**
     * @method asSource
     * @summary Returns the receiver as a TIBET source code string.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    var marker,
        len,
        arr,
        i;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asSource';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    len = this.length;
    arr = TP.ac();

    try {
        for (i = 0; i < len; i++) {
            arr.push(TP.src(this[i]));
        }
    } finally {
        delete this[marker];
    }

    return TP.join('TP.ac(', arr.join(', '), ')');
});

//  ------------------------------------------------------------------------

Boolean.Inst.defineMethod('asSource',
function() {

    /**
     * @method asSource
     * @summary Returns the receiver as a string in source form: true or false.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    return this ? 'TP.bc(true)' : 'TP.bc(false)';
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('asSource',
function() {

    /**
     * @method asSource
     * @summary Returns "TP.dc(this.getTime())" which if eval'd will construct
     *     a Date instance with the same value.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    return 'TP.dc(' + this.getTime() + ')';
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('asSource',
function(aFilterName, aLevel) {

    /**
     * @method asSource
     * @summary Returns a string capable of recreating the receiver. For a
     *     function this is a variation of the toString() results which include
     *     any owner/track information required to recreate the method. For a
     *     type it's the defineSubtype call in string form.
     * @param {String} aFilterName Ignored.
     * @param {Number} aLevel If 0, returns function() {...}
     * @returns {String} An appropriate form for recreating the receiver.
     */

    var obj,

        lvl,

        src,

        head,
        tail,
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

    obj = TP.getRealFunction(this);

    lvl = TP.notDefined(aLevel) ?
            TP.sys.cfg('stack.max_descent') :
            Math.max(0, aLevel);

    if (lvl === 0) {
        return 'function() {}';
    }

    if (TP.sys.cfg('tibet.space_after_function_name') === true) {
        src = obj.asString();
    } else {
        //  NB: We're only interested in the first occurrence of the 'function'
        //  keyword here - it's the only one that's reconstructed from the
        //  system - the rest of the Function source is brought in as-is on all
        //  platforms we care about.
        src = obj.asString().replace('function (', 'function(');
    }

    str = TP.ac();

    if (TP.isMethod(obj)) {

        //  Generate the 'method header' and 'method tail' - this gives us a
        //  String that is a representation of the canonical TIBET way to add
        //  methods to the system. Note that this produces a representation of
        //  the head which *must* be followed with a Function statement (i.e.
        //  'function() {...}') and the method tail.
        head = obj.getMethodSourceHead();
        tail = obj.getMethodSourceTail();

        //  Add that head, our source and that tail to the representation.
        str.push(head, src, tail);
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
     * @method asSource
     * @summary Returns the receiver in source code form i.e. as a number with
     *     no quotes etc.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

RegExp.Inst.defineMethod('asSource',
function() {

    /**
     * @method asSource
     * @summary Returns the receiver in TIBET source code form. The flags for
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

    if (this.sticky) {
        args += 'y';
    }

    if (this.unicode) {
        args += 'u';
    }

    return TP.join('TP.rc(',
                    this.source.quoted(), ', ', args.quoted(),
                    ')');
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asSource',
function() {

    /**
     * @method asSource
     * @summary Returns the receiver in source code form. Embedded quotes are
     *     escaped as needed and single quotes are used for the external quoting
     *     so the string would function properly inside an XML attribute.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    //  Make sure to force the conversion to a primitive string.
    return this.toString().quoted();
});

//  ------------------------------------------------------------------------
//  EQUALITY/IDENTITY
//  ------------------------------------------------------------------------

/**
 * JavaScript has different notions of equality and identity than those required
 * by TIBET's semantics. In particular, TIBET's sense of equality requires that
 * two arrays containing equal elements return true when tested for equality.
 * JavaScript won't do this for reference types. Identity is included for both
 * consistency and to allow us to 'proxy' by essentially lying about identity.
 */

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('$getEqualityValue',
function() {

    /**
     * @method $getEqualityValue
     * @summary Returns the value which should be used for testing equality
     *     for the receiver. The default is the receiver, which normally
     *     results in a deep compare for object types.
     * @returns {Object} A value appropriate for use in equality comparisons.
     */

    //  If the receiver is a value holder, then we return the underlying value
    //  for equality comparison purposes.
    if (this.$get('$$isValueHolder')) {
        return this.get('value');
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('$getIdentityValue',
function() {

    /**
     * @method $getIdentityValue
     * @summary Returns the value which should be used for testing identity
     *     for the receiver. The default is the receiver itself. Types that
     *     allow themselves to be proxied can return their GID or similar value.
     * @returns {Object} A value appropriate for use in identity comparisons.
     */

    return this;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('$getEqualityValue',
function() {

    /**
     * @method $getEqualityValue
     * @summary Returns the value which should be used for testing equality.
     *     Arrays return themselves to support a deep comparison.
     * @returns {String} A value appropriate for use in equality comparisons.
     */

    return this;
});

//  ------------------------------------------------------------------------

Boolean.Inst.defineMethod('$getEqualityValue',
function() {

    /**
     * @method $getEqualityValue
     * @summary Returns the value which should be used for testing equality for
     *     the receiver. For Booleans, we return the object itself.
     * @returns {Boolean} A value appropriate for use in equality comparisons.
     */

    return this;
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('$getEqualityValue',
function() {

    /**
     * @method $getEqualityValue
     * @summary Returns the value which should be used for testing equality for
     *     the receiver. For Dates, we return the numeric getTime() value.
     * @returns {Number} A value appropriate for use in equality comparisons.
     */

    return this.getTime();
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('$getEqualityValue',
function() {

    /**
     * @method $getEqualityValue
     * @summary Returns the value which should be used for testing equality for
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
     * @method $getEqualityValue
     * @summary Returns the value which should be used for testing equality for
     *     the receiver. For Numbers, we return the object itself.
     * @returns {Number} A value appropriate for use in equality comparisons.
     */

    return this;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('$getEqualityValue',
function() {

    /**
     * @method $getEqualityValue
     * @summary Returns the value which should be used for testing equality for
     *     the receiver. For Strings, we return the object itself.
     * @returns {String} A value appropriate for use in equality comparisons.
     */

    return '' + this;
});

//  ------------------------------------------------------------------------

RegExp.Inst.defineMethod('$getEqualityValue',
function() {

    /**
     * @method $getEqualityValue
     * @summary Returns the value which should be used for testing equality for
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
     * @method equalTo
     * @summary Compare for equality.
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

    //  Must be something to compare to.
    if (arguments.length < 1) {
        return false;
    }

    a = TP.canInvoke(this, '$getEqualityValue') ?
                        this.$getEqualityValue() :
                        this;
    b = TP.canInvoke(that, '$getEqualityValue') ?
                        that.$getEqualityValue() :
                        that;

    //  Once we have the equality values use a primitive deep compare. This
    //  works effectively to allow objects to provide whatever they like, such
    //  as a random identifier (employee ID etc) or other value, or just return
    //  themselves for a deep compare.
    return TP.$equal(a, b);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('equalTo',
function(that) {

    /**
     * @method equalTo
     * @summary Returns true if the two objects compare equally. TIBET's notion
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
     * @method equalTo
     * @summary Compare for equality. In TIBET equality means the values i.e.
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
     * @method equalTo
     * @summary Compare for equality. In TIBET equality means the values i.e.
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
     * @method equalTo
     * @summary Compare for equality. In TIBET equality means the values i.e.
     *     the content is equal. Functions are equal if they have the same
     *     string value.
     * @param {Object} that The object to test against.
     * @returns {Boolean} Whether or not the receiver is equal to the supplied
     *     object.
     */

    if (!TP.isCallable(that)) {
        return false;
    }

    return this.toString().replace(/^function \(/, 'function(') ===
            that.toString().replace(/^function \(/, 'function(');
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('equalTo',
function(that) {

    /**
     * @method equalTo
     * @summary Compare for equality. In TIBET equality means the values i.e.
     *     the content is equal.
     * @param {Object} that The object to test against.
     * @returns {Boolean} Whether or not the receiver is equal to the supplied
     *     object.
     */

    if (!TP.isNumber(that)) {
        return false;
    }

    //  force primitive comparison
    /* eslint-disable no-extra-parens */
    return (this - 0) === (that - 0);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('equalTo',
function(that) {

    /**
     * @method equalTo
     * @summary Compare for equality. In TIBET equality means the values i.e.
     *     the content is equal.
     * @param {Object} that The object to test against.
     * @returns {Boolean} Whether or not the receiver is equal to the supplied
     *     object.
     */

    if (!TP.isString(that)) {
        return false;
    }

    //  force primitive comparison
    /* eslint-disable no-extra-parens */
    return ('' + this) === ('' + that);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('identicalTo',
function(that) {

    /**
     * @method identicalTo
     * @summary Compare for identity.
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

    //  Must be something to compare to.
    if (arguments.length < 1) {
        return false;
    }

    a = TP.canInvoke(this, '$getIdentityValue') ?
                        this.$getIdentityValue() :
                        this;
    b = TP.canInvoke(that, '$getIdentityValue') ?
                        that.$getIdentityValue() :
                        that;

    return a === b;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('identicalTo',
function(that) {

    /**
     * @method identicalTo
     * @summary Compare for identity.
     * @param {Object} that The object to test against.
     * @returns {Boolean} Whether or not the receiver is identical to the
     *     supplied object.
     */

    return this === that;
});

//  ------------------------------------------------------------------------

Boolean.Inst.defineMethod('identicalTo',
function(that) {

    /**
     * @method identicalTo
     * @summary Compare for identity.
     * @param {Object} that The object to test against.
     * @returns {Boolean} Whether or not the receiver is identical to the
     *     supplied object.
     */

    if (!TP.isBoolean(that)) {
        return false;
    }

    //  force primitive comparison
    return Number(this) === Number(that);
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('identicalTo',
function(that) {

    /**
     * @method identicalTo
     * @summary Compare for identity.
     * @param {Object} that The object to test against.
     * @returns {Boolean} Whether or not the receiver is identical to the
     *     supplied object.
     */

    return this === that;
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('identicalTo',
function(that) {

    /**
     * @method identicalTo
     * @summary Compare for identity.
     * @param {Object} that The object to test against.
     * @returns {Boolean} Whether or not the receiver is identical to the
     *     supplied object.
     */

    return this === that;
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('identicalTo',
function(that) {

    /**
     * @method identicalTo
     * @summary Compare for identity.
     * @param {Object} that The object to test against.
     * @returns {Boolean} Whether or not the receiver is identical to the
     *     supplied object.
     */

    if (TP.isNaN(that)) {
        return TP.isNaN(this);
    }

    //  force primitive comparison
    return Number(this) === Number(that);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('identicalTo',
function(that) {

    /**
     * @method identicalTo
     * @summary Compare for identity.
     * @param {Object} that The object to test against.
     * @returns {Boolean} Whether or not the receiver is identical to the
     *     supplied object.
     */

    if (!TP.isString(that)) {
        return false;
    }

    /* eslint-disable no-extra-parens */
    //  force primitive comparison
    return ('' + this) === ('' + that);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$deepEqual',
function(objectA, objectB, aStack, bStack) {

    /**
     * @method $deepEqual
     * @summary A deep-compare test based heavily on the Underscore.js
     *     implementation. The primary differences relate to working with
     *     key sets that filter out TIBET private/internal slots like $$id.
     *     You don't normally call this directly, it's invoked by $equal as
     *     needed and that's invoked by TP.equal() as needed.
     * @param {Object} a The first object to compare.
     * @param {Object} b The second object to compare.
     * @param {Object[]} aStack A 'stack' of 'a side' comparison objects used to
     *     track equality as we descend deeply.
     * @param {Object[]} bStack A 'stack' of 'b side' comparison objects used to
     *     track equality as we descend deeply.
     * @returns {Boolean} Whether or not the two objects are equal to one
     *     another.
     */

    var a,
        b,

        className,

        areArrays,

        aCtor,
        bCtor,

        aStk,
        bStk,

        length,

        keys,
        key,

        aHasAt,
        bHasAt;

    //  Unwrap any wrapped objects.
    a = TP.unwrap(objectA);
    b = TP.unwrap(objectB);

    //  Compare `[[Class]]` names.
    className = TP.tostr(a);
    if (className !== TP.tostr(b)) {
        return false;
    }

    /* eslint-disable no-fallthrough,no-implicit-coercion */
    switch (className) {

        //  Strings, numbers, regular expressions, dates, and booleans are
        //  compared by value.
        case '[object RegExp]':
            //  RegExps are coerced to strings for comparison
            //  (Note: '' + /a/i === '/a/i')
        case '[object String]':
            //  Primitives and their corresponding object wrappers are
            //  equivalent; thus, `"5"` is equivalent to `new String("5")`.
            return '' + a === '' + b;

        case '[object Number]':
            //  `NaN`s are equivalent, but non-reflexive.
            /* eslint-disable no-self-compare */
            if (+a !== +a) {
                //  Object(NaN) is equivalent to NaN.
                return +b !== +b;
            }
            //  An `egal` comparison is performed for other numeric values.
            return +a === 0 ? 1 / +a === 1 / b : +a === +b;
            /* eslint-enable no-self-compare */

        case '[object Date]':
        case '[object Boolean]':
            //  Coerce dates and booleans to numeric primitive values. Dates are
            //  compared by their millisecond representations. Note that invalid
            //  dates with millisecond representations of `NaN` are not
            //  equivalent.
            return +a === +b;

        case '[object Symbol]':
            return window.SymbolProto.valueOf.call(a) ===
                        window.SymbolProto.valueOf.call(b);

        default:
            void 0;
    }
    /* eslint-enable no-fallthrough,no-implicit-coercion */

    areArrays = className === '[object Array]';
    if (!areArrays) {
        if (typeof a !== 'object' || typeof b !== 'object') {
            return false;
        }

        //  Objects with different constructors are not equivalent, but
        //  `Object`s or `Array`s from different frames are.
        aCtor = a.constructor;
        bCtor = b.constructor;

        if (aCtor !== bCtor &&
            !(TP.isFunction(aCtor) &&
                aCtor instanceof aCtor &&
                TP.isFunction(bCtor) &&
                bCtor instanceof bCtor) &&
                ('constructor' in a && 'constructor' in b)) {
            return false;
        }
    }

    //  Assume equality for cyclic structures. The algorithm for detecting
    //  cyclic structures is adapted from ES 5.1 section 15.12.3, abstract
    //  operation `JO`.

    //  Initializing stack of traversed objects.
    //  It's done here since we only need them for objects and arrays
    //  comparison.
    aStk = aStack || TP.ac();
    bStk = bStack || TP.ac();

    length = aStk.length;
    while (length--) {
        //  Linear search. Performance is inversely proportional to the number
        //  of unique nested structures.
        if (aStk.at(length) === a) {
            return bStack.at(length) === b;
        }
    }

    //  Add the first object to the stack of traversed objects.
    aStk.push(a);
    bStk.push(b);

    //  Recursively compare objects and arrays.
    if (areArrays) {
        //  Compare array lengths to determine if a deep comparison is
        //  necessary.
        length = a.length;
        if (length !== b.length) {
            return false;
        }

        //  Deep compare the contents, ignoring non-numeric properties.
        while (length--) {
            if (!TP.$equal(a[length], b[length], aStk, bStk)) {
                return false;
            }
        }
    } else {

        //  Deep compare objects.
        keys = TP.keys(a);
        length = keys.length;

        //  Ensure that both objects contain the same number of properties
        //  before comparing deep equality.
        if (TP.keys(b).length !== length) {
            return false;
        }

        aHasAt = TP.isFunction(a.at);
        bHasAt = TP.isFunction(b.at);

        while (length--) {
            //  Deep compare each member
            key = keys.at(length);
            if (!(TP.objectHasKey(b, key) &&
                    TP.$equal(
                        aHasAt ? a.at(key) : a[key],
                        bHasAt ? b.at(key) : b[key], aStk, bStk))) {
                return false;
            }
        }
    }

    //  Remove the first object from the stack of traversed objects.
    aStk.pop();
    bStk.pop();

    return true;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$equal',
function(a, b, aStack, bStack) {

    /**
     * @method $equal
     * @summary Returns true if the values of the two objects are 'equal'.
     * @param {Object} a The first object to compare.
     * @param {Object} b The second object to compare.
     * @param {Object[]} aStack A 'stack' of 'a side' comparison objects used to
     *     track equality as we descend deeply.
     * @param {Object[]} bStack A 'stack' of 'b side' comparison objects used to
     *     track equality as we descend deeply.
     * @returns {Boolean} Whether or not the two objects are equal to one
     *     another.
     */

    var type;

    //  Identical objects are equal. `0 === -0`, but they aren't identical.
    //  See the [Harmony `egal` proposal]
    //  (http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) {
        return a !== 0 || 1 / a === 1 / b;
    }

    //  A strict comparison is necessary because `null == undefined`.
    /* eslint-disable eqeqeq */
    if (a == null || b == null) {
        return a === b;
    }
    /* eslint-enable eqeqeq */

    //  `NaN`s are equivalent, but non-reflexive.
    /* eslint-disable no-self-compare */
    if (a !== a) {
        return b !== b;
    }
    /* eslint-enable no-self-compare */

    //  Exhaust primitive checks
    type = typeof a;
    if (type !== 'function' && type !== 'object' && typeof b !== 'object') {
        return false;
    }

    //  None of these checks passed - do a deep equal.
    return TP.$deepEqual(a, b, aStack, bStack);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('equal',
function(objectA, objectB, aType) {

    /**
     * @method equal
     * @summary Returns true if the values of the two objects are 'equal'.
     *     TIBET's approach differs from that of most libraries in that TIBET
     *     attempts to delegate to object-based methods which allow each type to
     *     specialize how it determines equality. When that approach isn't
     *     possible the objects are compared using a lower level primitive.
     * @param {Object} objectA The first object to compare.
     * @param {Object} objectB The second object to compare.
     * @param {TP.lang.RootObject|String} aType A Type object, or type name.
     *     Supplying this will force both objects to be compared by this
     *     supplied type.
     * @returns {Boolean} Whether or not the two objects are equal to one
     *     another.
     */

    //  Don't let a missing argument cause a false positive for undefined.
    if (arguments.length < 2) {
        return false;
    }

    //  Null and undefined compare equal in TIBET.
    /* eslint-disable eqeqeq */
    if (objectA == null || objectB == null) {
        return objectA === objectB;
    }
    /* eslint-enable eqeqeq */

    //  We also consider two NaN values to be equal.
    if (TP.isNaN(objectA)) {
        return TP.isNaN(objectB);
    }

    //  if they're both nodes, we can just use TP.nodeEqualsNode() to
    //  compare them here.
    if (TP.isNode(objectA) && TP.isNode(objectB)) {
        return TP.nodeEqualsNode(objectA, objectB);
    }

    //  remaining options rely on at least one object being able to perform
    //  the comparison with more intelligence than ==.
    if (TP.canInvoke(objectA, 'equalTo')) {
        return objectA.equalTo(objectB);
    } else if (TP.canInvoke(objectB, 'equalTo')) {
        return objectB.equalTo(objectA);
    }

    return TP.$equal(objectA, objectB);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('identical',
function(objectA, objectB) {

    /**
     * @method identical
     * @summary Returns true if the values of the two objects are 'identical'.
     *     Neither nulls nor undefined values will compare identical with
     *     anything.
     * @param {Object} objectA The first object to compare.
     * @param {Object} objectB The second object to compare.
     * @returns {Boolean} Whether or not the two objects are identical to one
     *     another.
     */

    //  Don't let a missing argument cause a false positive for undefined.
    if (arguments.length < 2) {
        return false;
    }

    //  Null and undefined compare identically in TIBET.
    /* eslint-disable eqeqeq */
    if (objectA == null || objectB == null) {
        return objectA === objectB;
    }
    /* eslint-enable eqeqeq */

    //  We also consider two NaN values to be identical.
    if (TP.isNaN(objectA)) {
        return TP.isNaN(objectB);
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
 * Not all objects work in a way consistent with standard sort functions,
 * meaning that they can't easily be sorted based on simple criteria. To help
 * with that we define a set of comparison support features here that you can
 * implement in your types to help sort at the object level.
 */

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('$getComparisonValue',
function() {

    /**
     * @method $getComparisonValue
     * @summary Returns the value which should be used for comparing
     *     "magnitudes" for purposes of sorting a set of objects. The default
     *     returns the result of calling getSize().
     * @returns {Number} The size of the object.
     */

    return this.getSize();
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('compareTo',
function(that) {

    /**
     * @method compareTo
     * @summary Compare for "magnitude" to support sort operations.
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
     * @method compare
     * @summary Returns -1, 0, or 1 based on whether objectA is "larger" than
     *     objectB as determined by their comparison values.
     * @param {Object} objectA The first object to compare.
     * @param {Object} objectB The second object to compare.
     * @returns {Number} -1 if objectA is "smaller" than objectB, 0 if they are
     *     "equal", and 1 if objectA is "larger" than objectB.
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
     * @method test
     * @summary Mirrors the test call on RegExp instances so we can use a
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

TP.definePrimitive('match',
function(aSelector, anObject) {

    /**
     * @method match
     * @summary Tests anObject using aSelector, to see if there's a match. This
     *     method is a convenience wrapper intended to help make string, regular
     *     expression, and css selector testing more polymorphic.
     * @param {String|RegExp|Object} aSelector A string, regular expression, or
     *     other object implementing 'test'.
     * @param {Object} anObject The object (usually string or node) to test.
     * @returns {Boolean} True if there's a match.
     */

    if (TP.canInvoke(aSelector, 'test')) {
        return aSelector.test(anObject);
    } else if (TP.canInvoke(anObject, 'equalTo')) {
        //  NOTE that we invert things here to avoid overly-simplistic
        //  checks for equality...we let the object decide
        return anObject.equalTo(aSelector);
    } else {
        /* eslint-disable eqeqeq */
        return aSelector == anObject;
        /* eslint-enable eqeqeq */
    }
});

//  ------------------------------------------------------------------------
//  INFERENCING - PART I (stubs)
//  ------------------------------------------------------------------------

/**
 * TIBET augments the programmer with built-in support for inferring object
 * functionality in certain cases. This capability helps keep code size smaller
 * while supporting a faster development cycle and significantly increased level
 * of functionality. The trigger for inferencing is the TP.sys.dnu function or
 * DNU, also referred to as the 'backstop'.
 */

//  ------------------------------------------------------------------------

TP.sys.defineMethod('dnu',
function() {

    /**
     * @method dnu
     * @summary The 'backstop' for TIBET inferencing. When inferencing is
     *     enabled this method is the entry point.
     * @returns {undefined}
     */

    return;
});

//  ------------------------------------------------------------------------
//  ENCAPSULATION - PART II (PostPatch)
//  ------------------------------------------------------------------------

String.Inst.defineMethod('asCSSName',
function() {

    /**
     * @method asCSSName
     * @summary Returns a new string converted into its equivalent CSS property
     *     name. For example, backgroundColor becomes 'background-color',
     *     'cssFloat' becomes 'float', etc. NOTE that strings which are not
     *     valid CSS keys return null.
     * @returns {String} A valid CSS property name, or null if the receiver
     *     can't produce a valid key.
     */

    var str;

    str = this.toString();

    if (TP.regex.CSS_CUSTOM_PROPERTY_NAME.test(str)) {
        return str;
    }

    if (str === 'cssFloat') {
        return 'float';
    }

    return str.asHyphenated();
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asDOMName',
function() {

    /**
     * @method asDOMName
     * @summary Returns a new string converted into its equivalent DOM property
     *     name. For example, background-color becomes backgroundColor, float
     *     becomes 'cssFloat', etc. NOTE that strings which are not valid CSS
     *     keys return null.
     * @returns {String} A valid DOM property name, or null if the receiver
     *     can't produce a valid key.
     */

    var str;

    str = this.toString();

    if (TP.regex.CSS_CUSTOM_PROPERTY_NAME.test(str)) {
        return str;
    }

    if (str === 'float') {
        return 'cssFloat';
    }

    return str.asCamelCase();
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('clearTextContent',
function() {

    /**
     * @method clearTextContent
     * @summary Clears out any text content of mutable items in the receiver,
     *     thereby clearing all of the non-mutable (primitive) items and leaving
     *     just the data structure.
     * @description At this type level, this method does nothing.
     * @returns {Object} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getProperty',
function(attributeName) {

    /**
     * @method getProperty
     * @summary Returns the value, if any, for the attribute provided. This
     *     method takes over when get() fails to find a specific getter or an
     *     aspect adapted getter.
     * @param {String} attributeName The name of the attribute to get.
     * @returns {Object|undefined} The value of the property on the receiver.
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
     * @method getAccessPathAliases
     * @summary Returns an Array of 'access path aliases' - that is, the
     *     aliased names that the receiver uses for a particular path (i.e.
     *     '/person/lastName' might map to 'lastName').
     * @param {String} aPath The path to check for aliases.
     * @returns {String[]|null} An Array of access path aliases for the receiver
     *     or null.
     */

    //  At this level, we just return null. See the implementation on
    //  TP.lang.RootObject for a real implementation of this method.
    return null;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getAccessPathFor',
function(attributeName, facetName, originalPath) {

    /**
     * @method getAccessPathFor
     * @summary Returns any access path facet value, if any, for the attribute
     *     and facet provided. See the 'TP.sys.addMetadata()' call for more
     *     information about facets.
     * @param {String} attributeName The name of the attribute to get the access
     *     path facet value for.
     * @param {String} facetName The name of the facet to get the access path
     *     facet value for.
     * @param {TP.core.AccessPath} [originalPath] An optional access path that
     *     the attribute name might have been derived from. Sometimes it is
     *     useful to have access to the original path.
     * @returns {Object} Any access path value of the supplied facet of the
     *     supplied attribute. If there is no access path, this method returns
     *     null.
     */

    var internalSlotName,
        pathVal;

    //  This method gets called from every getter & setter in the whole system.
    //  When we look up descriptors, by default this occurs 'up' the entire type
    //  hierarchy of the receiver (see the getDescriptorFor() methods). These
    //  descriptors contain the access path settings for a particular attribute.

    //  Therefore, to avoid that lookup overhead we cache any access path for a
    //  particular attribute/facet pair on the object itself the first time it
    //  is looked up.

    internalSlotName = attributeName + '_' + facetName;

    if (!TP.owns(this, '$$access_paths')) {

        //  NB: This is a JS literal object since this operates at a very low
        //  level and trying to use a TP.core.Hash here causes an endless
        //  recursion.
        this.$$access_paths = {};
    }

    //  Note here how we use a 'not defined' test here because the value very
    //  well might be 'null' which means that there really is no *access path*
    //  value for this attribute/facet pair (there very well might be another
    //  type of value).
    if (TP.notDefined(pathVal = this.$$access_paths[internalSlotName])) {

        pathVal = this.getFacetSettingFor(attributeName, facetName);

        if (TP.isValid(pathVal) && pathVal.isAccessPath()) {
            this.$$access_paths[internalSlotName] = pathVal;
        } else {
            this.$$access_paths[internalSlotName] = null;
            pathVal = null;
        }
    }

    return pathVal;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getDescriptorFor',
function(attributeName, includeSupertypes) {

    /**
     * @method getDescriptorFor
     * @summary Returns the property descriptor, if any, for the type
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

    //  At this level, we just return null. See the implementation on
    //  TP.lang.RootObject for a real implementation of this method.
    return null;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getInstDescriptorFor',
function(attributeName, includeSupertypes) {

    /**
     * @method getInstDescriptorFor
     * @summary Returns the property descriptor, if any, for the instance
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

    //  At this level, we just return null. See the implementation on
    //  TP.lang.RootObject for a real implementation of this method.
    return null;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getFacetSettingFor',
function(attributeName, facetName) {

    /**
     * @method getFacetSettingFor
     * @summary Returns any facet setting, if any, for the type attribute and
     *     facet provided. See the 'TP.sys.addMetadata()' call for more
     *     information about facets.
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

TP.defineMetaInstMethod('getInstFacetSettingFor',
function(attributeName, facetName) {

    /**
     * @method getInstFacetSettingFor
     * @summary Returns any facet value, if any, for the instance attribute and
     *     facet provided. See the 'TP.sys.addMetadata()' call for more
     *     information about facets.
     * @param {String} attributeName The name of the attribute to get the facet
     *     value for.
     * @param {String} facetName The name of the facet to get the facet value
     *     for.
     * @returns {Object} The value of the supplied facet of the supplied
     *     attribute.
     */

    var descriptor;

    descriptor = this.getInstDescriptorFor(attributeName);
    //  NB: We use primitive property access here since descriptors are
    //  primitive object.
    if (TP.isValid(descriptor)) {
        return descriptor[facetName];
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('get',
function(attributeName) {

    /**
     * @method get
     * @summary Returns the value, if any, for the attribute provided.
     * @description This method is a convenient wrapper that will automatically
     *     look for getAttributeName(), getattributeName(), .attribute, etc. to
     *     return the value. Using this method provides a way to fully
     *     encapsulate an attribute access whether the receiver has implemented
     *     a getter or not. Once a getter is implemented it is automatically
     *     used. Getters should follow the normal coding convention of
     *     this.attributeName for access while all others should use
     *     get('attributeName').
     * @param {String|TP.path.AccessPath} attributeName The name of the
     *     attribute to get.
     * @returns {Object} The value of the attribute on the receiver.
     */

    var path,
        pathStr,

        funcName,

        args;

    //  A shortcut - if the attribute name is '.' or '$_', then that's
    //  shorthand for returning ourselves.
    if (TP.regex.ONLY_PERIOD.test(attributeName) ||
        TP.regex.ONLY_STDIN.test(attributeName)) {
        return this;
    }

    //  If we got handed an 'access path', then we need to let it handle this.
    if (!TP.isString(attributeName) && attributeName.isAccessPath()) {
        path = attributeName;

        //  If the path's String representation is a simple JS_IDENTIFIER, then
        //  we need to check to see if this is just a TIBET path with a name to
        //  an 'aliased' access path (i.e. 'lastname' -> 'foo.bar.lastname').
        //  So, here we check to see if there is an access path for this simple
        //  identifier and, if there is, we use *that* path as the way to access
        //  the underlying data. If not, then we check to see (since we have a
        //  JS identifier as a simple path String) if there is a getter that
        //  matches the identifier.
        if (TP.regex.JS_IDENTIFIER.test(pathStr = path.get('srcPath'))) {
            if (TP.notValid(path = this.getAccessPathFor(
                                        pathStr, 'value', attributeName))) {
                //  try common naming convention first
                funcName = 'get' + TP.makeStartUpper(pathStr);
                if (TP.canInvoke(this, funcName)) {
                    switch (arguments.length) {
                        case 1:
                            return this[funcName]();
                        default:
                            args = TP.args(arguments, 1);
                            return this[funcName].apply(this, args);
                    }
                }

                //  There wasn't a valid access path aliased to that identifier,
                //  so just use the path we were originally going to use.
                path = attributeName;
            }
        }
    } else if (TP.regex.NON_SIMPLE_PATH.test(attributeName)) {
        path = TP.apc(attributeName, TP.hc('shouldCollapse', true));
    }

    if (TP.notValid(path)) {
        //  try common naming convention first
        funcName = 'get' + TP.makeStartUpper(attributeName);
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
        funcName = 'is' + TP.makeStartUpper(attributeName);
        if (TP.isMethod(this[funcName])) {
            return this[funcName]();
        }
    }

    //  If we got a valid path above or if we have a 'value' facet that has an
    //  access path, then invoke the path.
    if (TP.isValid(path) ||
        TP.isValid(path = this.getAccessPathFor(attributeName, 'value'))) {

        pathStr = path.asString();
        //  A shortcut - if the path string is '.' or '$_', then that's
        //  shorthand for returning ourselves.
        if (TP.regex.ONLY_PERIOD.test(pathStr) ||
            TP.regex.ONLY_STDIN.test(pathStr)) {
            return this;
        }

        //  Note here how, if we were given more than 1 arguments, we grab all
        //  of the arguments supplied, make our path source the first argument
        //  and invoke with an apply(). Otherwise, we make an Array that has our
        //  path source and our 'path parameters' as the last argument. In both
        //  cases, this is because executeGet() takes varargs (in case the path
        //  is parameterized).
        if (arguments.length > 1) {
            args = TP.args(arguments);
            args.atPut(0, this.getPathSource(path));
        } else {
            args = TP.ac(this.getPathSource(path), this.getPathParameters());
        }

        return path.executeGet.apply(path, args);
    }

    //  let the standard mechanism handle it
    return this.getProperty(attributeName);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getPathSource',
function(aPath) {

    /**
     * @method getPathSource
     * @summary Return the current source object being used by the executeGet()
     *     and executeSet() methods. At this level, this method returns the
     *     receiver.
     * @param {TP.path.AccessPath} aPath The path that the path source will be
     *     used with.
     * @returns {Object} The object used as the current path source object.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getPathParameters',
function() {

    /**
     * @method getPathParameters
     * @summary Return the current set of path parameters being used by the
     *     executeGet() and executeSet() methods to resolve path parameters for
     *     parameterized paths. At this level, this method returns null.
     * @returns {Object} The object used to resolve path references in
     *     parameterized paths. This usually should either be an Array or a
     *     TP.core.Hash.
     */

    return null;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('isAccessPath',
function() {

    /**
     * @method isAccessPath
     * @summary Returns whether or not the receiver is an access path object.
     * @returns {Boolean} False - most receivers are not a path.
     */

    return false;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('get',
function() {

    /**
     * @method get
     * @summary Returns the value, if any, for the attribute provided.
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
     * @method get
     * @summary Returns the value, if any, for the attribute provided.
     * @description This method is a convenient wrapper that will automatically
     *     look for getAttributeName(), getattributeName(), .attribute, etc. to
     *     return the value. Using this method provides a way to fully
     *     encapsulate an attribute access whether the receiver has implemented
     *     a getter or not. Once a getter is implemented it is automatically
     *     used. Getters should follow the normal coding convention of
     *     this.attributeName for access while all others should use
     *     get('attributeName').
     * @param {String|TP.path.AccessPath} attributeName The name of the
     *     attribute to get.
     * @returns {Object} The value of the attribute on the receiver.
     */

    var path,
        pathStr,

        attrStr,

        funcName,

        val,

        args;

    //  A shortcut - if the attribute name is '.' or '$_', then that's
    //  shorthand for returning ourselves.
    if (TP.regex.ONLY_PERIOD.test(attributeName) ||
        TP.regex.ONLY_STDIN.test(attributeName)) {
        return this;
    }

    //  If we got handed an 'access path', then we need to let it handle this.
    if (!TP.isString(attributeName) && attributeName.isAccessPath()) {
        path = attributeName;

        //  If the path's String representation is a simple JS_IDENTIFIER, then
        //  we need to check to see if this is just a TIBET path with a name to
        //  an 'aliased' access path (i.e. 'lastname' -> 'foo.bar.lastname').
        //  So, here we check to see if there is an access path for this simple
        //  identifier and, if there is, we use *that* path as the way to access
        //  the underlying data. If not, then we check to see (since we have a
        //  JS identifier as a simple path String) if there is a getter that
        //  matches the identifier.
        if (TP.regex.JS_IDENTIFIER.test(pathStr = path.get('srcPath'))) {
            if (TP.notValid(path = this.getAccessPathFor(
                                        pathStr, 'value', attributeName))) {
                //  try common naming convention first
                funcName = 'get' + TP.makeStartUpper(pathStr);
                if (TP.canInvoke(this, funcName)) {
                    switch (arguments.length) {
                        case 1:
                            return this[funcName]();
                        default:
                            args = TP.args(arguments, 1);
                            return this[funcName].apply(this, args);
                    }
                }

                //  There wasn't a valid access path aliased to that identifier,
                //  so just use the path we were originally going to use.
                path = attributeName;
            }
        }
    } else if (TP.regex.NON_SIMPLE_PATH.test(attributeName)) {
        path = TP.apc(attributeName, TP.hc('shouldCollapse', true));
    }

    attrStr = attributeName.toString();

    if (TP.notValid(path)) {
        //  try common naming convention first
        funcName = 'get' + TP.makeStartUpper(attrStr);
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
        funcName = 'is' + TP.makeStartUpper(attrStr);
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
        TP.isValid(path = this.getAccessPathFor(attrStr, 'value'))) {

        pathStr = path.asString();
        //  A shortcut - if the path string is '.' or '$_', then that's
        //  shorthand for returning ourselves.
        if (TP.regex.ONLY_PERIOD.test(pathStr) ||
            TP.regex.ONLY_STDIN.test(pathStr)) {
            return this;
        }

        //  Note here how, if we were given more than 1 arguments, we grab all
        //  of the arguments supplied, make our path source the first argument
        //  and invoke with an apply(). Otherwise, we make an Array that has our
        //  path source and our 'path parameters' as the last argument. In both
        //  cases, this is because executeGet() takes varargs (in case the path
        //  is parameterized).
        if (arguments.length > 1) {
            args = TP.args(arguments);
            args.atPut(0, this.getPathSource(path));
        } else {
            args = TP.ac(this.getPathSource(path), this.getPathParameters());
        }

        return path.executeGet.apply(path, args);
    }

    //  let the standard mechanism handle it
    return this.getProperty(attrStr);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('get',
function(attributeName) {

    /**
     * @method get
     * @summary Returns the value, if any, for the attribute provided.
     * @param {String|TP.path.AccessPath} attributeName The name of the
     *     attribute to get.
     * @returns {Object} The value of the attribute on the receiver.
     */

    var path,
        pathStr,

        funcName,

        args;

    //  A shortcut - if the attribute name is '.' or '$_', then that's
    //  shorthand for returning ourselves.
    if (TP.regex.ONLY_PERIOD.test(attributeName) ||
        TP.regex.ONLY_STDIN.test(attributeName)) {

        //  NB: Here we return the primitive string.
        return this.toString();
    }

    //  If we got handed an 'access path', then we need to let it handle this.
    if (!TP.isString(attributeName) && attributeName.isAccessPath()) {
        path = attributeName;

        //  If the path's String representation is a simple JS_IDENTIFIER, then
        //  we need to check to see if this is just a TIBET path with a name to
        //  an 'aliased' access path (i.e. 'lastname' -> 'foo.bar.lastname').
        //  So, here we check to see if there is an access path for this simple
        //  identifier and, if there is, we use *that* path as the way to access
        //  the underlying data. If not, then we check to see (since we have a
        //  JS identifier as a simple path String) if there is a getter that
        //  matches the identifier.
        if (TP.regex.JS_IDENTIFIER.test(pathStr = path.get('srcPath'))) {
            if (TP.notValid(path = this.getAccessPathFor(
                                        pathStr, 'value', attributeName))) {
                //  try common naming convention first
                funcName = 'get' + TP.makeStartUpper(pathStr);
                if (TP.canInvoke(this, funcName)) {
                    switch (arguments.length) {
                        case 1:
                            return this[funcName]();
                        default:
                            args = TP.args(arguments, 1);
                            return this[funcName].apply(this, args);
                    }
                }

                //  There wasn't a valid access path aliased to that identifier,
                //  so just use the path we were originally going to use.
                path = attributeName;
            }
        }
    } else if (TP.regex.NON_SIMPLE_PATH.test(attributeName)) {
        path = TP.apc(attributeName, TP.hc('shouldCollapse', true));
    }

    if (TP.notValid(path)) {
        //  try common naming convention first
        funcName = 'get' + TP.makeStartUpper(attributeName);
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
        funcName = 'is' + TP.makeStartUpper(attributeName);
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

        pathStr = path.asString();
        //  A shortcut - if the path string is '.' or '$_', then that's
        //  shorthand for returning ourselves.
        if (TP.regex.ONLY_PERIOD.test(pathStr) ||
            TP.regex.ONLY_STDIN.test(pathStr)) {
            return this;
        }

        //  Note here how, if we were given more than 1 arguments, we grab all
        //  of the arguments supplied, make our path source the first argument
        //  and invoke with an apply(). Otherwise, we make an Array that has our
        //  path source and our 'path parameters' as the last argument. In both
        //  cases, this is because executeGet() takes varargs (in case the path
        //  is parameterized).
        if (arguments.length > 1) {
            args = TP.args(arguments);
            args.atPut(0, this.getPathSource(path));
        } else {
            args = TP.ac(this.getPathSource(path), this.getPathParameters());
        }

        return path.executeGet.apply(path, args);
    }

    //  let the standard mechanism handle it
    return this.getProperty(attributeName);
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('getContent',
function() {

    /**
     * @method getContent
     * @summary Returns the 'content' of the receiver. The default version is a
     *     synonym for getValue.
     * @returns {Object} The value of the receiver.
     */

    return this.getValue();
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('getValue',
function() {

    /**
     * @method getValue
     * @summary Returns the 'value' of the receiver. This method follows a
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
     * @method getValue
     * @summary Returns the primitive value of the receiver.
     * @returns {Boolean} The value of the receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('getValue',
function() {

    /**
     * @method getValue
     * @summary Returns the primitive value of the receiver.
     * @returns {Number} The value of the receiver.
     */

    return this + 0;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('getValue',
function() {

    /**
     * @method getValue
     * @summary Returns the primitive value of the receiver.
     * @returns {String} The value of the receiver.
     */

    //  Make sure to force the conversion to a primitive string.
    return this.toString();
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('setProperty',
function(attributeName, attributeValue, shouldSignal) {

    /**
     * @method setProperty
     * @summary Sets the value of the named property. The base version is a
     *     simple wrapper around $set however other types override this method
     *     to provide custom behavior.
     * @param {String} attributeName The attribute name to set.
     * @param {Object} attributeValue The value to set.
     * @param {Boolean} shouldSignal If false no signaling occurs. Defaults to
     *     this.shouldSignalChange().
     * @returns {Object} The receiver.
     */

    return this.$set(attributeName, attributeValue, shouldSignal);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('set',
function(attributeName, attributeValue, shouldSignal) {

    /**
     * @method set
     * @summary Sets the value of the named attribute to the value provided. If
     *     no value is provided the value null is used.
     * @description As with get('attr') this method is a convenient
     *     encapsulation wrapper that will look for setAttribute, setattribute,
     *     and this.attribute to determine how to proceed. No notification is
     *     provided by this method if either function is found, however if the
     *     value is set directly at the attribute level this method will signal
     *     Change as appropriate. This allows the developer of a setter function
     *     complete control over behavior without fear of side-effects.
     * @param {String|TP.path.AccessPath} attributeName The name of the
     *     attribute to set.
     * @param {Object} attributeValue The value to set.
     * @param {Boolean} shouldSignal If false no signaling occurs. Defaults to
     *     this.shouldSignalChange().
     * @returns {Object} The receiver.
     */

    var path,
        pathStr,

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

        //  If the path's String representation is a simple JS_IDENTIFIER, then
        //  we need to check to see if this is just a TIBET path with a name to
        //  an 'aliased' access path (i.e. 'lastname' -> 'foo.bar.lastname').
        //  So, here we check to see if there is an access path for this simple
        //  identifier and, if there is, we use *that* path as the way to access
        //  the underlying data. If not, then we check to see (since we have a
        //  JS identifier as a simple path String) if there is a setter that
        //  matches the identifier.
        if (TP.regex.JS_IDENTIFIER.test(pathStr = path.get('srcPath'))) {
            if (TP.notValid(path = this.getAccessPathFor(
                                        pathStr, 'value', attributeName))) {
                //  try common naming convention first
                funcName = 'set' + TP.makeStartUpper(pathStr);
                if (TP.canInvoke(this, funcName)) {
                    switch (arguments.length) {
                        case 1:
                            return this[funcName]();
                        default:
                            args = TP.args(arguments, 1);
                            return this[funcName].apply(this, args);
                    }
                }

                //  There wasn't a valid access path aliased to that identifier,
                //  so just use the path we were originally going to use.
                path = attributeName;
            }
        }
    } else if (TP.regex.NON_SIMPLE_PATH.test(attributeName)) {
        path = TP.apc(attributeName, TP.hc('shouldCollapse', true));
    }

    if (TP.notValid(path)) {
        //  try common naming convention first
        funcName = 'set' + TP.makeStartUpper(attributeName);
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
            funcName = 'is' + TP.makeStartUpper(attributeName);
            if (TP.isMethod(this[funcName])) {
                return this[funcName](attributeValue);
            }
        }
    }

    //  If we got a valid path above or if we have a 'value' facet that has an
    //  access path, then invoke the path.
    if (TP.isValid(path) ||
        TP.isValid(path = this.getAccessPathFor(attributeName, 'value'))) {

        //  Note here how, if we were given more than 3 arguments, we grab all
        //  of the arguments supplied, make our path source the first argument
        //  and invoke with an apply(). Otherwise, we make an Array that has our
        //  path source and our 'path parameters' as the last argument. In both
        //  cases, this is because executeGet() takes varargs (in case the path
        //  is parameterized).
        if (arguments.length > 3) {
            args = TP.args(arguments);
            args.atPut(0, this.getPathSource(path));
        } else {
            args = TP.ac(this.getPathSource(path), attributeValue, shouldSignal,
                            this.getPathParameters());
        }

        return path.executeSet.apply(path, args);
    }

    //  let the standard method handle it
    return this.setProperty(attributeName, attributeValue, shouldSignal);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('set',
function(attributeName, attributeValue, shouldSignal) {

    /**
     * @method set
     * @summary Sets the value of the named attribute to the value provided. If
     *     no value is provided the value null is used.
     * @description As with get('attr') this method is a convenient
     *     encapsulation wrapper that will look for setAttribute, setattribute,
     *     and this.attribute to determine how to proceed. No notification is
     *     provided by this method if either function is found, however if the
     *     value is set directly at the attribute level this method will signal
     *     Change as appropriate. This allows the developer of a setter function
     *     complete control over behavior without fear of side-effects.
     * @param {String|TP.path.AccessPath} attributeName The name of the
     *     attribute to set.
     * @param {Object} attributeValue The value to set.
     * @param {Boolean} shouldSignal If false no signaling occurs. Defaults to
     *     this.shouldSignalChange().
     * @returns {Object} The receiver.
     */

    var path,
        pathStr,

        funcName,

        val,

        args;

    if (TP.isEmpty(attributeName)) {
        return this.raise('TP.sig.InvalidKey');
    }

    //  If we got handed an 'access path', then we need to let it handle this.
    if (!TP.isString(attributeName) && attributeName.isAccessPath()) {
        path = attributeName;

        //  If the path's String representation is a simple JS_IDENTIFIER, then
        //  we need to check to see if this is just a TIBET path with a name to
        //  an 'aliased' access path (i.e. 'lastname' -> 'foo.bar.lastname').
        //  So, here we check to see if there is an access path for this simple
        //  identifier and, if there is, we use *that* path as the way to access
        //  the underlying data. If not, then we check to see (since we have a
        //  JS identifier as a simple path String) if there is a setter that
        //  matches the identifier.
        if (TP.regex.JS_IDENTIFIER.test(pathStr = path.get('srcPath'))) {
            if (TP.notValid(path = this.getAccessPathFor(
                                        pathStr, 'value', attributeName))) {
                //  try common naming convention first
                funcName = 'set' + TP.makeStartUpper(pathStr);
                if (TP.canInvoke(this, funcName)) {
                    switch (arguments.length) {
                        case 1:
                            return this[funcName]();
                        default:
                            args = TP.args(arguments, 1);
                            return this[funcName].apply(this, args);
                    }
                }

                //  There wasn't a valid access path aliased to that identifier,
                //  so just use the path we were originally going to use.
                path = attributeName;
            }
        }
    } else if (TP.regex.NON_SIMPLE_PATH.test(attributeName)) {
        path = TP.apc(attributeName, TP.hc('shouldCollapse', true));
    }

    if (TP.notValid(path)) {
        //  try common naming convention first
        funcName = 'set' + TP.makeStartUpper(attributeName);
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
            funcName = 'is' + TP.makeStartUpper(attributeName);
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

        //  Note here how, if we were given more than 3 arguments, we grab all
        //  of the arguments supplied, make our path source the first argument
        //  and invoke with an apply(). Otherwise, we make an Array that has our
        //  path source and our 'path parameters' as the last argument. In both
        //  cases, this is because executeGet() takes varargs (in case the path
        //  is parameterized).
        if (arguments.length > 3) {
            args = TP.args(arguments);
            args.atPut(0, this.getPathSource(path));
        } else {
            args = TP.ac(this.getPathSource(path), attributeValue, shouldSignal,
                            this.getPathParameters());
        }

        return path.executeSet.apply(path, args);
    }

    //  let the standard method handle it
    return this.setProperty(attributeName, attributeValue, shouldSignal);
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('setValue',
function(aValue) {

    /**
     * @method setValue
     * @summary Sets the 'value' of the receiver. This method provides
     *     polymorphic behavior by allowing objects to serve as ValueHolders.
     *     The search for variable slots follows value, _value, and $value. This
     *     method calls changed if the value changes.
     * @param {Object} aValue The value to set the value of the receiver to.
     * @returns {Boolean} Whether or not the value was changed from the value it
     *     had before this method was called.
     */

    this.$set('value', aValue);

    return true;
});

//  ------------------------------------------------------------------------
//  DEBUGGING
//  ------------------------------------------------------------------------

TP.sys.defineMethod('hasDebugger',
function() {

    /**
     * @method hasDebugger
     * @summary Returns true if there's a TIBET implementation of a 'debugger'
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
     * @method runDebugger
     * @summary If there's a TIBET implementation of a debugging tool this
     *     function will run it if possible.
     * @param {Function|arguments} callingContext The context to debug.
     * @returns {TP.sys} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('$launchDebugger',
function(callingContext) {

    /**
     * @method $launchDebugger
     * @summary Launches the TIBET debugger if one is installed.
     * @description This method is invoked by TP.sys.dnu as a last resort. When
     *     TP.sys.hasDebugger() is true whatever implementation of
     *     TP.sys.runDebugger() is in effect will be called. When TIBET doesn't
     *     have a debugger installed the native debugger trigger will be invoked
     *     via the 'debugger' statement. Note that this will only occur if
     *     TP.sys.shouldUseDebugger() is true. Also note that the native
     *     debuggers will only become visible if a) installed and b) are already
     *     open.
     * @param {Function|arguments} callingContext The calling context.
     * @returns {TP.sys} The receiver.
     */

    if (this.hasDebugger()) {
        this.runDebugger(callingContext);
    } else {
        //  on IE or Mozilla this will foreground the native debugger, if
        //  installed and open. but it's a bit flaky.
        try {
            /* eslint-disable no-debugger */
            debugger;
            /* eslint-enable no-debugger */
        } catch (e) {
            void 0;
        }
    }

    return this;
});

//  ------------------------------------------------------------------------
//  DUPLICATION
//  ------------------------------------------------------------------------

/**
 * In a pure prototype-based system this is how we'd do everything...copy
 * something that's already there and then tweak it. But there's no built-in
 * copy command for objects in JavaScript and deep-copy semantics are difficult
 * in any case. We do the best we can by implementing a simple copy operation
 * that handles most situations.
 */

//  ------------------------------------------------------------------------

TP.defineCommonMethod('copy',
function(deep, aFilterNameOrKeys, contentOnly) {

    /**
     * @method copy
     * @summary Returns a copy of the receiver. The filter defines which keys
     *     are used to select from the receiver.
     * @param {Boolean} [deep=false] True to force clones to be deep.
     * @param {String|String[]} [aFilterNameOrKeys] get*Interface() filter or
     *     key array.
     * @param {Boolean} [contentOnly=true] Copy content only? This parameter is
     *     ignored for this type.
     * @returns {Object} A copy of the receiver.
     */

    var i,
        keys,
        newinst,
        filter,

        len,
        ndx,
        val;

    newinst = this.getType().construct();

    if (!TP.isArray(keys = aFilterNameOrKeys)) {
        filter = TP.ifInvalid(aFilterNameOrKeys, TP.UNIQUE);
        keys = this.getLocalInterface(filter);
    }

    len = keys.getSize();
    for (i = 0; i < len; i++) {
        ndx = keys.at(i);
        val = this.at(ndx);

        if (TP.isTrue(deep) && TP.isReferenceType(val)) {
            //  NB: We do *not* pass along the filter name or keys here
            val = TP.copy(val, deep, null, contentOnly);
        }

        newinst.$set(ndx, val, false, true);
    }

    return newinst;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('copy',
function(deep, aFilterNameOrKeys, contentOnly) {

    /**
     * @method copy
     * @summary Returns a copy of the receiver. If contentOnly is true then an
     *     Array is returned contains only the content values [0, 1, ...N], and
     *     no 'special values' on the receiver are copied.
     * @param {Boolean} [deep=false] True to force clones to be deep.
     * @param {String|String[]} aFilterNameOrKeys get*Interface() filter or key
     *     array.
     * @param {Boolean} [contentOnly=true] Copy content only?
     * @returns {Object[]} A copy of the receiver.
     */

    var onlyContent,

        newinst,

        filter,
        keys,

        len,
        i,
        ndx,
        val;

    onlyContent = TP.ifInvalid(contentOnly, true);
    if (onlyContent) {
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
            val = this.at(ndx);

            if (TP.isTrue(deep) && TP.isReferenceType(val)) {
                //  NB: We do *not* pass along the filter name or keys here
                val = TP.copy(val, deep, null, contentOnly);
            }

            newinst.$set(ndx, val, false, true);
        }
    }

    return newinst;
});

//  ------------------------------------------------------------------------

Boolean.Inst.defineMethod('copy',
function(deep, aFilterNameOrKeys, contentOnly) {

    /**
     * @method copy
     * @summary Returns a 'copy' of the receiver. Actually, a new instance
     *     whose value is equalTo that of the receiver.
     * @param {Boolean} [deep=false] True to force clones to be deep. This
     *     parameter is ignored for this type.
     * @param {String|String[]} aFilterNameOrKeys get*Interface() filter or key
     *     array. This parameter is ignored for this type.
     * @param {Boolean} [contentOnly=true] Copy content only? This parameter is
     *     ignored for this type.
     * @returns {Boolean} A copy of the receiver.
     */

    return TP.bc(this);
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('copy',
function(deep, aFilterNameOrKeys, contentOnly) {

    /**
     * @method copy
     * @summary Returns a 'copy' of the receiver. Actually, a new instance
     *     whose value is equalTo that of the receiver.
     * @param {Boolean} [deep=false] True to force clones to be deep.
     * @param {String|String[]} aFilterNameOrKeys get*Interface() filter or key
     *     array.
     * @param {Boolean} [contentOnly=true] Copy content only?
     * @returns {Date} A copy of the receiver.
     */

    var newinst,

        onlyContent,

        filter,
        keys,

        len,
        i,
        ndx,
        val;

    newinst = TP.dc(this.getTime());

    onlyContent = TP.ifInvalid(contentOnly, true);
    if (onlyContent) {
        //  content only
        return newinst;
    } else {
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
            val = this.at(ndx);

            if (TP.isTrue(deep) && TP.isReferenceType(val)) {
                //  NB: We do *not* pass along the filter name or keys here
                val = TP.copy(val, deep, null, contentOnly);
            }

            newinst.$set(ndx, val, false, true);
        }
    }

    return newinst;
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('copy',
function(deep, aFilterNameOrKeys, contentOnly) {

    /**
     * @method copy
     * @summary Returns a 'copy' of the receiver. Actually, a new instance
     *     whose value is equalTo that of the receiver. When copying a function
     *     the original is instrumented to know how many copies have been made
     *     and the new copy has the name of the original with an _n appended
     *     where n is the copy number.
     * @param {Boolean} [deep=false] True to force clones to be deep.
     * @param {String|String[]} aFilterNameOrKeys get*Interface() filter or key
     *     array.
     * @param {Boolean} [contentOnly=true] Copy content only?
     * @returns {Function} A copy of the receiver.
     */

    var count,
        source,
        $$funcCopy,
        realFunc,

        onlyContent,

        filter,
        keys,

        len,
        i,
        ndx,
        val;

    //  NB: We don't use TP.getRealFunction() here, since we're not interested
    //  in any trait '$resolutionMethod' slots.
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
    /* eslint-disable no-eval */
    eval(source);
    /* eslint-enable no-eval */
    $$funcCopy.$realFunc = realFunc;

    onlyContent = TP.ifInvalid(contentOnly, true);
    if (onlyContent) {
        return $$funcCopy;
    } else {
        filter = TP.ifInvalid(aFilterNameOrKeys, TP.UNIQUE);

        if (TP.isString(filter)) {
            keys = realFunc.getLocalInterface(filter);
        } else if (TP.isArray(filter)) {
            keys = filter;
        } else {
            //  Unusable filter
            return $$funcCopy;
        }

        len = keys.getSize();

        for (i = 0; i < len; i++) {
            ndx = keys.at(i);
            val = realFunc.at(ndx);

            if (TP.isTrue(deep) && TP.isReferenceType(val)) {
                //  NB: We do *not* pass along the filter name or keys here
                val = TP.copy(val, deep, null, contentOnly);
            }

            $$funcCopy.$set(ndx, val, false, true);
        }
    }

    return $$funcCopy;
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('copy',
function(deep, aFilterNameOrKeys, contentOnly) {

    /**
     * @method copy
     * @summary Returns a 'copy' of the receiver. Actually, a new instance
     *     whose value is equalTo that of the receiver.
     * @param {Boolean} [deep=false] True to force clones to be deep. This
     *     parameter is ignored for this type.
     * @param {String|String[]} aFilterNameOrKeys get*Interface() filter or key
     *     array. This parameter is ignored for this type.
     * @param {Boolean} [contentOnly=true] Copy content only? This parameter is
     *     ignored for this type.
     * @returns {Number} A copy of the receiver.
     */

    return TP.nc(this);
});

//  ------------------------------------------------------------------------

RegExp.Inst.defineMethod('copy',
function(deep, aFilterNameOrKeys, contentOnly) {

    /**
     * @method copy
     * @summary Returns a 'copy' of the receiver. Actually, a new instance
     *     whose value is equalTo that of the receiver.
     * @param {Boolean} [deep=false] True to force clones to be deep.
     * @param {String|String[]} aFilterNameOrKeys get*Interface() filter or key
     *     array.
     * @param {Boolean} [contentOnly=true] Copy content only?
     * @returns {RegExp} A copy of the receiver.
     */

    var newinst,

        onlyContent,

        filter,
        keys,

        len,
        i,
        ndx,
        val;

    newinst = TP.rc(this.toString());

    onlyContent = TP.ifInvalid(contentOnly, true);
    if (onlyContent) {
        //  content only
        return newinst;
    } else {
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
            val = this.at(ndx);

            if (TP.isTrue(deep) && TP.isReferenceType(val)) {
                //  NB: We do *not* pass along the filter name or keys here
                val = TP.copy(val, deep, null, contentOnly);
            }

            newinst.$set(ndx, val, false, true);
        }
    }

    return newinst;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('copy',
function(deep, aFilterNameOrKeys, contentOnly) {

    /**
     * @method copy
     * @summary Returns a 'copy' of the receiver. Actually, a new instance
     *     whose value is equalTo that of the receiver.
     * @param {Boolean} [deep=false] True to force clones to be deep. This
     *     parameter is ignored for this type.
     * @param {String|String[]} aFilterNameOrKeys get*Interface() filter or key
     *     array. This parameter is ignored for this type.
     * @param {Boolean} [contentOnly=true] Copy content only? This parameter is
     *     ignored for this type.
     * @returns {String} A copy of the receiver.
     */

    return TP.sc(this);
});

//  ------------------------------------------------------------------------
//  ITERATION
//  ------------------------------------------------------------------------

/**
 * JavaScript iteration is a real problem when handed an object which could be
 * of any type, and TP.ObjectProto has been modified. The iteration methods
 * here provide a common interface to iteration which ensures consistency and
 * proper behavior regardless. You can still use for/in for very limited cases
 * but TIBET's iteration methods, as well as our get*Interface calls, are a
 * much better way to either iterate or reflect on an object.

 * TIBET's iteration methods are based on the Smalltalk and Ruby APIs for
 * iteration, much in the same way TIBET mirrors their collection APIs.
 * Additional iteration methods mirroring those found natively in Mozilla
 * (every, some, map, etc. are found later in the kernel as well). We've
 * extended these functions from the Mozilla API slightly to offer first and
 * last element checking as well as the ability to break/continue from a nested
 * loop construct quickly. Reverse iteration is also supported in many cases.
 */

//  ------------------------------------------------------------------------

TP.defineCommonMethod('perform',
function(aFunction) {

    /**
     * @method perform
     * @summary Performs the function with each item of the receiver where an
     *     item is typically a key/value pair in array form.
     * @description Perform can be used as an alternative to constructing for
     *     loops to iterate over a collection.
     * @param {Function} aFunction A function which performs some action with
     *     the element it is passed.
     * @returns {Object} The receiver.
     */

    var i,
        k,
        len;

    //  this works effectively for most object, even if it has to iterate
    //  once using for/in to acquire the list
    k = TP.keys(this);
    len = k.length;

    for (i = 0; i < len; i++) {
        //  second parameter is location of data, so it will vary based on
        //  direction, content, etc. NOTE here that it's the actual key
        //  (hash key) to the data value
        aFunction([k[i], this.at(k[i])], k[i]);
    }

    return this;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('perform',
function(aFunction) {

    /**
     * @method perform
     * @summary Performs the function with each element of the receiver. This
     *     is the core method in the iteration model, providing the basis for
     *     many of the other iteration aspects in TIBET.
     * @description Perform can be used as an alternative to constructing for
     *     loops to iterate over a collection.
     * @param {Function} aFunction A function which performs some action with
     *     the element it is passed.
     * @returns {Array} The receiver.
     */

    return this.forEach(aFunction);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('perform',
function(aFunction) {

    /**
     * @method perform
     * @summary Performs the function from 0 to N times where N is the value of
     *     the receiver. Note that negative numbers won't cause an iteration to
     *     occur.
     * @description Perform can be used as an alternative to constructing for
     *     loops to iterate over a collection.
     * @param {Function} aFunction A function which performs some action with
     *     the element it is passed.
     * @returns {Number} The receiver.
     */

    var i;

    for (i = 0; i < this; i++) {
        //  since we're using a number as our iteration control the
        //  value and index provided are the same. the perform call
        //  for each collection type deals with that in its own way
        aFunction(i, i);
    }

    return this;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('perform',
function(aFunction) {

    /**
     * @method perform
     * @summary Performs the function from 0 to N times where N is the length
     *     of the receiver. Each iteration receives one character from the
     *     string.
     * @description Perform can be used as an alternative to constructing for
     *     loops to iterate over a collection.
     * @param {Function} aFunction A function which performs some action with
     *     the element it is passed.
     * @returns {String} The receiver.
     */

    var i,
        len;

    len = this.length;
    for (i = 0; i < len; i++) {

        //  since we're iterating on a string here we'll pass the
        //  character at the current index as the 'item'
        aFunction(this.charAt(i), i);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  COMMON ITERATION VARIANTS
//  ------------------------------------------------------------------------

/**
 * The variants here all leverage their base type's ability to perform() over
 * an item (individual or ordered pair for a hash). While the core API here is
 * based on Smalltalk and Ruby we've got a few extras that help with common
 * operations you might want to perform on the contents like using apply, get,
 * set, etc.
 */

//  ------------------------------------------------------------------------

TP.defineCommonMethod('collect',
function(aFunction) {

    /**
     * @method collect
     * @summary Returns a new array which contains the elements of the receiver
     *     transformed by the function provided.
     * @param {Function} aFunction A function which should return the
     *     transformation of the element it is passed.
     * @returns {Object[]} An array containing the transformed elements.
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

Array.Inst.defineMethod('collect',
function(aFunction) {

    /**
     * @method collect
     * @summary Returns a new array which contains the elements of the receiver
     *     transformed by the function provided.
     * @param {Function} aFunction A function which should return the
     *     transformation of the element it is passed.
     * @returns {Object[]} An array containing the transformed elements.
     */

    return this.map(aFunction);
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('collectGet',
function(propertyName) {

    /**
     * @method collectGet
     * @summary Collects the result of running a get() on each item in the
     *     receiver using the propertyName provided. This is a powerful way to
     *     "query" a set of objects for a particular property value. If an
     *     object doesn't implement get() a direct slot access is attempted.
     * @param {String} propertyName The name of the property to get() from each
     *     item.
     * @returns {Object[]} An array containing the return values of the
     *     individual invocations. Skipped objects have nulls in their return
     *     value positions.
     */

    return this.collect(
        function(item) {

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
     * @method collectInvoke
     * @summary Collects the result of running the named method on each item in
     *     the receiver, providing any remaining arguments as the arguments to
     *     the method. If any of the objects don't implement the named function
     *     then that object is simply skipped.
     * @param {String} aMethodName The name of the method to invoke.
     * @returns {Object[]} An array containing the return values of the
     *     individual invocations. Skipped objects have nulls in their return
     *     value positions.
     */

    var args;

    args = TP.args(arguments, 1);

    return this.collect(
        function(item) {

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
     * @method convert
     * @summary Alters each of the receivers elements by replacing them with
     *     the result returned by aFunction's transformation on that element.
     *     Similar to collect() but results replace originals rather than being
     *     returned in an array. Using convert with a consistent return value is
     *     like a fill().
     * @param {Function} aFunction The function to use to transform each element
     *     in the array.
     * @returns {Array} The receiver.
     * @fires Change
     */

    var thisref,
        change;

    thisref = this;

    if (TP.canInvoke(this, 'shouldSignalChange')) {
        change = this.shouldSignalChange();
        this.shouldSignalChange(false);
    }

    this.perform(
        function(item, index) {
            thisref.atPut(index, aFunction(item, index));
        });

    if (TP.canInvoke(this, 'shouldSignalChange')) {
        this.shouldSignalChange(change);
    }

    //  NOTE: this ASSumes the function did something to at least one index
    this.changed('value', TP.UPDATE);

    return this;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('detect',
function(aFunction, startIndex) {

    /**
     * @method detect
     * @summary Returns the first element in a collection which matches a
     *     condition as defined by the function provided.
     * @param {Function} aFunction A function which should return true or false
     *     after testing the element it is passed.
     * @param {Number} startIndex A starting index for the search.
     * @returns {Object} The first object to match the test criteria.
     */

    var start,
        result,
        items,
        len,
        i,
        item;

    start = TP.ifInvalid(this.normalizeIndex(startIndex), 0);

    items = this.getItems();
    len = items.getSize();
    for (i = start; i < len; i++) {
        item = items.at(i);
        if (aFunction(item, i)) {
            result = item;
            break;
        }
    }

    return result;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('detectInvoke',
function(aMethodName, varargs) {

    /**
     * @method detectInvoke
     * @summary Executes the named method on each item in the receiver,
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
     */

    var args,
        retval,
        items,
        len,
        i,
        item;

    args = TP.args(arguments, 1);

    items = this.getItems();
    len = items.getSize();

    for (i = 0; i < len; i++) {
        item = items.at(i);
        if (TP.canInvoke(item, aMethodName)) {
            retval = item[aMethodName].apply(item, args);
            if (TP.isValid(retval)) {
                break;
            }
        }
    }

    return retval;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('detectMax',
function(aFunction) {

    /**
     * @method detectMax
     * @summary Returns the "maximum" or largest value returned by aFunction
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
     * @method detectMin
     * @summary Returns the "minimum" or smallest value returned by aFunction
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
     * @method flatten
     * @summary Returns an array containing the receiver's key/value items in a
     *     flattened form. For example, TP.hc('a', 1, 'b', 2).flatten() returns
     *     the equivalent of TP.ac('a', 1, 'b', 2);
     * @returns {Object[]} A new array containing the elements of the receiver
     *     in flattened form.
     */

    return this.getItems().flatten();
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('grep',
function(aPattern, aFunction) {

    /**
     * @method grep
     * @summary Returns an array containing items (potentially transformed by
     *     aFunction) whose values matched the regular expression pattern.
     * @description This method works on the values of the collection, so a call
     *     to grep() on a Hash will not grep the keys, it will grep the values.
     *     Use grepKeys() to scan a collection by its keys/indexes.
     * @param {String|RegExp} aPattern A string or regular expression to test
     *     items with.
     * @param {Function} aFunction A function which should return the
     *     transformation of the element it is passed.
     * @returns {Object[]} An array containing the matched values.
     */

    var func,
        grepRegex,
        tmparr;

    //  since the function is optional we'll use the ARG0 return
    //  and bind (which creates a wrapper) if needed
    func = TP.ifInvalid(aFunction, TP.RETURN_ARG0);

    tmparr = TP.ac();
    grepRegex = TP.isRegExp(aPattern) ? aPattern : TP.rc(aPattern);

    this.getValues().perform(
        function(item, index) {
            if (grepRegex.test(TP.str(item))) {
                tmparr.push(func(item, index));
            }
        });

    return tmparr;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('grepKeys',
function(aPattern, aFunction) {

    /**
     * @method grepKeys
     * @summary Returns an array containing items (potentially transformed by
     *     aFunction) whose key values matched the regular expression
     *     pattern provided.
     * @description The value being tested is the index (0-N for Arrays, key
     *     value for Object/Hash).
     * @param {String|RegExp} aPattern A string or regular expression to test
     *     items with.
     * @param {Function} aFunction A function which should return the
     *     transformation of the element it is passed.
     * @returns {Object[]} An array containing the matched items.
     */

    var func,
        grepRegex,
        tmparr;

    //  since the function is optional we'll use the ARG0 return
    //  and bind (which creates a wrapper) if needed
    func = TP.ifInvalid(aFunction, TP.RETURN_ARG0);

    tmparr = TP.ac();
    grepRegex = TP.isRegExp(aPattern) ? aPattern : TP.rc(aPattern);

    this.getKeys().perform(
        function(item, index) {
            if (grepRegex.test(TP.str(item))) {
                tmparr.push(func(item, index));
            }
        });

    return tmparr;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('groupBy',
function(keyCriteria, selectionCriteria) {

    /**
     * @method groupBy
     * @summary Returns a TP.core.Hash whose keys are the return values
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
     * @returns {Object[]|undefined} A new array containing the elements selected.
     * @example
     *      arr = TP.ac(1,2,3,4,5,6).groupBy(3);
     *
     *     returns:
     *
     *     [[1, 2, 3], [4, 5, 6]]
     *
     *     while the same array after:
     *
     *     groupBy(function(item, index){return item.isOdd()})
     *
     *     returns:
     *
     *     {'true' : [1, 3, 5], 'false' : [2, 4, 6]}
     */

    var dict,
        list;

    switch (typeof keyCriteria) {
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
                    if (index % keyCriteria === 0) {
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
                        if (!selectionCriteria(item, index)) {
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
     * @method injectInto
     * @summary Performs the function with each element of the receiver as the
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
     * @method orderedBy
     * @summary Sorts the receiver's data based on the return values of the
     *     function provided. This method allows you to avoid some of the
     *     semantics involved in the native sort() routine so you can write sort
     *     functions that are more natural.
     * @param {Function} aFunction The return value function.
     * @returns {Object[]} An array containing the items of the receiver sorted
     *     as requested.
     */

    var items;

    items = this.collect(
        function(item, index) {
            return TP.ac(item, aFunction(item, index));
        });

    return items.sort(TP.sort.SECOND_ITEM);
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('partition',
function(aFunction) {

    /**
     * @method partition
     * @summary Tests each element against the function provided and returns a
     *     new array containing the passed items in the first index and the
     *     failed items in the second index.
     * @param {Function} aFunction A function which should return true or false
     *     after testing the element it is passed.
     * @returns {Object[]} A new array containing the elements selected.
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
     * @method performInvoke
     * @summary Executes the named method on each item in the receiver,
     *     providing any remaining arguments as the arguments to the method. If
     *     any of the objects don't implement the named function then that
     *     object is simply skipped.
     * @param {String} aMethodName The name of the method to invoke.
     * @returns {Object} The receiver.
     */

    var args;

    args = TP.args(arguments, 1);

    return this.perform(
        function(item) {
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
     * @method performOver
     * @summary Executes aFunction on the elements found at the indexes in
     *     aCollection. This allows you to iterate in a more sparse fashion. If
     *     no collection is provided this works just like perform.
     * @param {Function} aFunction The function to perform.
     * @param {TP.api.Collection} aCollection The collection of indexes.
     * @returns {Object} The receiver.
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
     * @method performSet
     * @summary Executes a set() on each item in the receiver using the
     *     attributeName and attributeValue provided. This is a powerful way to
     *     "update" a set of objects with a particular property value. If an
     *     object doesn't implement set() a direct slot access is attempted.
     * @param {String} attributeName The name of the attribute to set() on each
     *     item.
     * @param {Object} attributeValue The value to set.
     * @returns {Object} The receiver.
     */

    this.perform(
        function(item) {

            if (TP.canInvoke(item, 'set')) {
                item.set(attributeName, attributeValue);
            } else {
                try {
                    //  yes, IE will throw exceptions sometimes
                    item[attributeName] = attributeValue;
                    return item[attributeName];
                } catch (e) {
                    void 0;
                }
            }
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('performUntil',
function(aFunction, terminateFunction) {

    /**
     * @method performUntil
     * @summary Performs the function with each element of the receiver until
     *     terminateFunction returns true.
     * @description performUntil can be used as an alternative to constructing
     *     repeat loops to iterate over a collection.
     * @param {Function} aFunction A function which performs some action with
     *     the element it is passed.
     * @param {Function} terminateFunction A test Function which ends the loop.
     *     This should be a Function that returns a Boolean. It is passed the
     *     same data as the performed function.
     * @returns {Object} The receiver.
     */

    var items,
        len,
        i,
        item;

    items = this.getItems();
    len = items.getSize();

    for (i = 0; i < len; i++) {
        item = items.at(i);
        aFunction(item, i);
        if (terminateFunction(item, i)) {
            break;
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('performWhile',
function(aFunction, terminateFunction) {

    /**
     * @method performWhile
     * @summary Performs the function with each element of the receiver while
     *     terminateFunction returns true.
     * @description performWhile can be used as an alternative to constructing
     *     while loops to iterate over a collection.
     * @param {Function} aFunction A function which performs some action with
     *     the element it is passed.
     * @param {Function} terminateFunction A test Function which ends the loop.
     *     This should be a Function that returns a Boolean. It is passed the
     *     same data as the performed function.
     * @returns {Object} The receiver.
     */

    var items,
        len,
        i,
        item;

    items = this.getItems();
    len = items.getSize();

    for (i = 0; i < len; i++) {
        item = items.at(i);
        if (terminateFunction(item, i)) {
            break;
        }
        aFunction(item, i);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('performWith',
function(aFunction, aCollection) {

    /**
     * @method performWith
     * @summary Executes a two-argument function (aFunction) with the first
     *     argument set to receiver[item] and second argument set to
     *     aCollection.at(index) for each element in the receiver. Note that
     *     once the items in the receiver have been exhausted this method will
     *     stop processing. If the collection is shorter nulls are used, if the
     *     collection is longer its trailing items are left unused.
     * @param {Function} aFunction A function which accepts three arguments: 1)
     *     The element at the current index in the receiver. 2) The element at
     *     the current index in aCollection. 3) The current index.
     * @param {TP.api.Collection} aCollection The collection of elements to
     *     use for the second argument to aFunction.
     * @exception TP.sig.InvalidCollection
     * @exception TP.sig.CollectionSizeMismatch
     * @returns {Object} The receiver.
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
     * @method reject
     * @summary Tests each element against the function provided and returns a
     *     new array containing those elements which aren't rejected by the
     *     function. The function should return true for elements which are to
     *     be skipped.
     * @param {Function} aFunction A function which should return true or false
     *     after testing the element it is passed.
     * @returns {Object[]} A new array containing the elements which weren't
     *     rejected.
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

Array.Inst.defineMethod('reject',
function(aFunction) {

    /**
     * @method reject
     * @summary Tests each element against the function provided and returns a
     *     new array containing those elements which aren't rejected by the
     *     function. The function should return true for elements which are to
     *     be skipped.
     * @param {Function} aFunction A function which should return true or false
     *     after testing the element it is passed.
     * @returns {Object[]} A new array containing the elements which weren't
     *     rejected.
     */

    return this.filter(
        function(item, index) {
            return !aFunction(item, index);
        });
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('select',
function(aFunction) {

    /**
     * @method select
     * @summary Tests each element against the function provided and returns a
     *     new array containing those elements which are selected by the
     *     function. The function should return true for elements which are to
     *     be returned.
     * @param {Function} aFunction A function which should return true or false
     *     after testing the element it is passed.
     * @returns {Object[]} A new array containing the elements selected.
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

Array.Inst.defineMethod('select',
function(aFunction) {

    /**
     * @method select
     * @summary Tests each element against the function provided and returns a
     *     new array containing those elements which are selected by the
     *     function. The function should return true for elements which are to
     *     be returned.
     * @param {Function} aFunction A function which should return true or false
     *     after testing the element it is passed.
     * @returns {Object[]} A new array containing the elements selected.
     */

    return this.filter(aFunction);
});

//  ------------------------------------------------------------------------
//  TYPE-SPECIFIC VARIANTS
//  ------------------------------------------------------------------------

/**
 * The operations here are variants that rely on type-specific processing to do
 * their work.
 */

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('choose',
function() {

    /**
     * @method choose
     * @summary Runs the functions contained in the receiver using the argument
     *     list provided, returning the first successful Function's return
     *     value. Essentially an iteration-based try/catch using blocks.
     * @description This is a function-specific operation, meaning that it's
     *     appropriate for arrays containing alternative functions you want to
     *     run. In this case, the return value of the first function which
     *     doesn't throw an exception will be used.
     * @returns {Object} The first successful Function's return value.
     */

    var args,
        retval,
        len,
        i,
        item;

    args = TP.args(arguments);

    len = this.length;
    for (i = 0; i < len; i++) {
        item = this[i];
        try {
            retval = item.apply(item, args);
            break;
        } catch (e) {
            //  an exception in the function just means continue trying
            void 0;
        }
    }

    return retval;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('compact',
function(aFilter) {

    /**
     * @method compact
     * @summary Returns the receiver with all filtered values removed. When a
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
     *     return true for value which should be removed. The default function
     *     is TP.notValid().
     * @returns {Array} The receiver.
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
     * @method conform
     * @summary Returns the receiver with all values which don't implement the
     *     interface removed. The resulting collection's values will, on
     *     completion of this method, respond to the next iteration
     *     (collectInvoke perhaps) that you want to run.
     * @param {String|String[]} anInterface A method name or collection of them
     *     to test against.
     * @param {Boolean} inline False to return a new array instead of collapsing
     *     inline. Default is true.
     * @returns {Array} The receiver.
     */

    var i,
        len,
        item;

    //  simple select when a new collection is desired
    if (TP.isFalse(inline)) {
        return this.select(
            function(it) {

                return TP.canInvokeInterface(it, anInterface);
            });
    }

    //  this loop will clear any values where the value isn't conforming,
    //  which sets the collection up for a compact to remove all nulls
    //  (since they don't conform to any interface)
    len = this.length;
    for (i = 0; i < len; i++) {
        item = this[i];
        if (!TP.canInvokeInterface(item, anInterface)) {
            this.atPut(i, null, false);
        }
    }

    return this.compact();
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('detect',
function(aFunction, startIndex) {

    /**
     * @method detect
     * @summary Returns the first element in the receiver which matches the
     *     criteria provided or null if the element isn't found.
     * @param {Function} aFunction A function which should return true if the
     *     element it is passed passes the function's test, or false if it does
     *     not.
     * @param {Number} startIndex A starting index for the search.
     * @returns {Object} The element detected or undefined.
     */

    var retval,
        start,
        len,
        i,
        item;

    start = TP.ifInvalid(this.normalizeIndex(startIndex), 0);

    this.$sortIfNeeded();

    retval = undefined;
    len = this.length;
    for (i = start; i < len; i++) {
        item = this[i];

        if (aFunction(item, i)) {
            retval = item;
            break;
        }
    }

    return retval;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('detectInvoke',
function(aMethodName, varargs) {

    /**
     * @method detectInvoke
     * @summary Executes the named method on each item in the receiver,
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
     */

    var args,
        retval,
        len,
        i,
        item;

    args = TP.args(arguments, 1);
    len = this.length;
    for (i = 0; i < len; i++) {
        item = this[i];
        if (TP.canInvoke(item, aMethodName)) {
            retval = item[aMethodName].apply(item, args);
            if (TP.isValid(retval)) {
                break;
            }
        }
    }

    return retval;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('invoke',
function(aThis, anArgArray, whenError) {

    /**
     * @method invoke
     * @summary Runs the functions contained in the receiver using the argument
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
     * @method invokeAsync
     * @summary Runs the functions contained in the receiver asynchronously
     *     using the argument list provided. An easy way to run a list of
     *     functions so they can provide rendering output between each
     *     item. The array will signal InvokeComplete when all items have
     *     been processed. Results/errors can be found in the signal.
     *     NOTE this is _not_ using Promises and the functions in the list
     *     should be synchronous under normal circumstances.
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
     * @returns {Array} The receiver.
     */

    var thisref,
        results,
        arr,
        runner,
        errors,
        next;

    thisref = this;
    results = TP.ac();
    errors = TP.ac();

    arr = this.collect(
            function(item, index) {
                return function() {
                    try {
                        results.atPut(index, item.apply(aThis, anArgArray));
                    } catch (e) {
                        errors.atPut(index, e);
                        if (TP.isCallable(whenError)) {
                            whenError(next, index, e);
                        } else {
                            thisref.raise('TP.sig.InvokeFailed',
                                TP.ec(e, 'Invocation failed'));
                        }
                    } finally {
                        runner();
                    }
                };
            });

    runner = function() {
        if (stopOnError && errors.length > 0) {
            thisref.signal('TP.sig.InvokeComplete',
                TP.hc('results', results, 'errors', errors));
        }

        next = arr.shift();
        if (TP.isCallable(next)) {
            setTimeout(next, 0);
        } else {
            thisref.signal('TP.sig.InvokeComplete',
                TP.hc('results', results, 'errors', errors));
        }
    };

    runner();

    return this;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('removeValue',
function(aValue) {

    /**
     * @method removeValue
     * @summary Removes all values in the receiver which are exact matches for
     *     the value provided. This is a specialized form of compact in which
     *     the filter function is prebuilt and filters for === aValue;
     * @param {Object} aValue The value to filter out of the array.
     * @returns {Array} The receiver.
     */

    if (aValue === undefined) {
        return this.raise('InvalidParameter');
    }

    this.compact(function(val) {
        return val === aValue;
    });

    return this;
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('by',
function(aStep, aFunction) {

    /**
     * @method by
     * @summary Runs the function provided, much like perform(), for each index
     *     which matches the step value. The indexing is zero-based. For
     *     example, (9).by(3) is equivalent to (0).to(9).by(3).perform() and the
     *     function will run at indexes 0, 2, 5, and 8.
     * @param {Number} aStep A number to mod (%) against the index to determine
     *     if the function should be run at this index.
     * @param {Function} aFunction The iteration block to execute.
     * @returns {Number} The number of times the function was invoked.
     */

    var count;

    count = 0;

    this.perform(
        function(item, index) {

            if (index % aStep === 0) {
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
     * @method performWith
     * @summary Performs the function from 0 to N times where N is the number
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
     */

    var str,
        thisref;

    str = TP.str(anObject);
    thisref = this;

    //  "auto-reset" so we start from the beginning of the string
    this.lastIndex = 0;

    //  only going to find one match if we're not global...but if we're
    //  global then we'd have to run it to see how many matches we get
    //  len = this.global ? NaN : 1;

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
     * @method convert
     * @summary Returns a new String whose content represents the converted
     *     characters from aFunction.
     * @param {Function} aFunction The function to use to transform each
     *     character.
     * @returns {String} A String containing the converted characters.
     */

    var arr;

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
     * @method times
     * @summary Returns the string repeated the specified number of times.
     * @param {Number} aNumber The number of times to repeat string.
     * @exception TP.sig.InvalidParameter
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
//  LOAD and SOURCE PATH QUALIFICATION
//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('qualifyToSourcePath',
function(paths) {

    /**
     * @method qualifyToSourcePath
     * @summary Qualifies the path or paths supplied in the parameter to the
     *     source path of the receiver.
     * @param {String|String[]} paths The URI paths to qualify to the
     *     receiver's source path.
     * @returns {String|String[]} The supplied paths qualified to the
     *     receiver's source path.
     */

    var sourceCollectionPath,

        result;

    if (TP.notValid(paths)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    sourceCollectionPath = TP.objectGetSourceCollectionPath(this);

    if (!TP.isArray(paths)) {
        result = TP.uriJoinPaths(sourceCollectionPath, paths);
    } else {
        result = paths.map(
                    function(aPath) {
                        return TP.uriJoinPaths(sourceCollectionPath, aPath);
                    });
    }

    return result;
});

//  ------------------------------------------------------------------------
//  CONTAINMENT
//  ------------------------------------------------------------------------

/**
 * Standard collection query...do you have this object/value/key/etc? TIBET adds
 * additional functionality here by supporting two types of testing: TP.EQUALITY
 * and TP.IDENTITY. So when you ask whether obj.contains(x) you can ask for the
 * results based on either condition.
 */

//  ------------------------------------------------------------------------

TP.defineCommonMethod('containsKey',
function(aKey) {

    /**
     * @method containsKey
     * @summary Returns true if the receiver contains the key provided.
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
     * @method containsValue
     * @summary Returns true if the receiver contains the value provided.
     * @param {Object} aValue The value to test.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Boolean} Whether or not the receiver contains the value
     *     provided.
     */

    var it;

    it = this.detect(
        function(item) {

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
     * @method contains
     * @summary Returns true if the receiver contains the item provided.
     * @description The test provided allows the caller to define whether
     *     identity (===) or equality (==) are used for comparisons. NOTE: this
     *     method makes use of the TP.equal() function of TIBET for equality
     *     comparisons so that arrays, objects, dates, and functions with
     *     equivalent string values will compare equal.
     * @param {TP.api.OrderedPair} anItem The item (key/value pair) to test.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Boolean} Whether or not the receiver contains the value
     *     provided.
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
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('contains',
function(aValue, aTest) {

    /**
     * @method contains
     * @summary Returns true if the receiver contains the value provided.
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
     */

    var it;

    //  string tests are a lot faster when using a custom test
    if (TP.isString(aValue)) {
        return this.containsString(aValue);
    }

    if (TP.isRegExp(aValue)) {
        return this.containsStringMatching(aValue);
    }

    it = this.detect(
        function(item) {

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
     * @method containsString
     * @summary Returns true if the receiver contains the string provided. This
     *     call is significantly faster for finding strings in potentially large
     *     arrays than a simple contains call.
     * @param {String} aValue The value that at least one element in the
     *     receiver should be equal to for this method to return true.
     * @returns {Boolean} Whether or not the receiver contains the String
     *     provided.
     */

    //  ECMA5 provides a nice indexOf() method on Array.
    return this.indexOf(aValue) !== TP.NOT_FOUND;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('containsStringMatching',
function(aValue) {

    /**
     * @method containsStringMatching
     * @summary Returns true if the receiver contains at least one string that
     *     matches the RegExp provided.
     * @param {RegExp} aValue The RegExp that at least one element in the
     *     receiver should match for this method to return true.
     * @returns {Boolean} Whether or not the receiver contains at least one
     *     String that tests true for the RegExp provided.
     */

    var i;

    for (i = 0; i < this.length; i++) {
        if (aValue.test(this[i])) {
            return true;
        }
    }

    return false;
});

//  ------------------------------------------------------------------------
//  METHOD CONFORMANCE
//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('asInterface',
function() {

    /**
     * @method asInterface
     * @summary Returns the receiver as a method interface. This is an array of
     *     method names useful for testing protocol conformance. For general
     *     objects this results in a list of the methods the receiver implements
     *     which could be quite large.
     * @returns {String[]} An array of method names.
     */

    return this.getLocalInterface(TP.SLOT_FILTERS.methods);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('asInterface',
function() {

    /**
     * @method asInterface
     * @summary Returns the receiver as a method interface. For arrays this
     *     method assumes the array already contains a list of strings.
     * @returns {Array} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asInterface',
function() {

    /**
     * @method asInterface
     * @summary Returns the receiver as a method interface. For strings this
     *     returns an array containing the string suitable for testing as an
     *     interface.
     * @returns {String[]} An array containing the receiver.
     */

    var intArray;

    intArray = TP.ac();
    intArray.push(this);

    return intArray;
});

//  ------------------------------------------------------------------------
//  DNU CONSTRUCTION
//  ------------------------------------------------------------------------

TP.FunctionProto.defineMethod('asDNU',
function() {

    /**
     * @method asDNU
     * @summary Returns a doesNotUnderstand wrapper function which is capable
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
    dnuFunc =
        function() {
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
     * @method constructDNU
     * @summary Returns a doesNotUnderstand wrapper function which is capable
     *     of providing information on which function name was not found along
     *     with the calling context.
     * @param {String} aName The name of the function this DNU stands in for.
     * @returns {Function} An appropriate wrapper function.
     */

    var dnuFunc;

    if (TP.isEmpty(aName)) {
        this.raise('TP.sig.InvalidParameter');
    }

    dnuFunc =
        function() {
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

Function.Type.defineMethod('constructNSM',
function(aName) {

    /**
     * @method constructNSM
     * @summary Returns a "NoSuchMethod" wrapper function which is capable of
     *     deadening part of a global doesNotUnderstand hook.
     * @param {String} aName The name of the function this deadener stands in
     *     for.
     * @returns {Function|undefined} An appropriate "no such method" function.
     */

    var nsmFunc;

    if (TP.isEmpty(aName)) {
        this.raise('TP.sig.InvalidParameter');
    }

    nsmFunc = function() {
        TP.raise(this, 'TP.sig.NoSuchMethod');
        return;
    };

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
