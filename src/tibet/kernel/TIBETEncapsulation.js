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
TIBET provides a number of functions designed to increase the level of object
encapsulation in JavaScript programs. This means we control slot access via
set/get as well as object creation via construct(). This section installs the
basic support required for encapsulation.
*/

/* eslint no-new-func:0, no-new-wrappers:0, no-new-object:0 */

//  ------------------------------------------------------------------------
//  FUNCTION EXTRAS
//  ------------------------------------------------------------------------

//  does the function reference 'this' or is it native code we need to bind
Function.$$methodTestRegex = /this[\.;]|native code/;

//  if the function references 'this' what is it going to use/invoke?
Function.$$methodNeedRegex = /this\.([$]*[\w]+)/g;

//  ------------------------------------------------------------------------

TP.FunctionProto.defineMethod('$getNeeds',
function() {

    /**
     * @method $getNeeds
     * @summary Returns a list of 'needs' or functions that the receiver will
     *     attempt to invoke on any internal 'this' references.
     * @description This is useful for the inferencer since it can decide to
     *     rank order its options by how well the function in question matches
     *     the needs. It's also useful for collecting information on 'senders'.
     *     The add*Method calls already track 'implementers' but by invoking
     *     $getNeeds() on each method as it goes by the system can capture
     *     senders too.
     * @returns {Function[]} The list of functions that the receiver will attempt
     *     to invoke on itself.
     */

    var re,
        arr,
        results;

    re = Function.$$methodNeedRegex;
    re.lastIndex = 0;

    arr = TP.ac();

    if (re.test(this.toString())) {
        re.lastIndex = 0;
        results = this.toString().match(re);

        results.perform(
                function(item) {
                    arr.push(item.strip('this.'));
                });

        arr = arr.unique();
    }

    return arr;
});

//  ------------------------------------------------------------------------

TP.FunctionProto.defineMethod('$hasThis',
function() {

    /**
     * @method $hasThis
     * @summary Returns true if the receiver has any 'this' references, either
     *     as method/attribute access (this.blah) or by associating 'this' with
     *     a variable for closure purposes as in var thisArg = this;. The result
     *     of this check is cached for future lookup to help support faster
     *     invocations.
     * @returns {Boolean} True if the receiver has this references.
     */

    if (!this.hasOwnProperty('$$this')) {
        this.$$this = Function.$$methodTestRegex.test(this.toString());
    }

    return TP.isTrue(this.$$this);
});

//  ------------------------------------------------------------------------
//  SUPPORT
//  ------------------------------------------------------------------------

//  stub for early Array calls, replaced later in kernel
TP.ArrayProto.changed = TP.RETURN_THIS;

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('unique',
function(aFilter, undefNotNull) {

    /**
     * @method unique
     * @summary Collapses the array to contain only 1 of each unique value
     *     based on a filtering function, or on unique object ID. One special
     *     consideration is whether invalid values (null and undefined) should
     *     be considered "equal" for purposes of this uniquing process.
     * @param {Function} aFilter A function which accepts an object and returns
     *     the value to compare for uniqueness.
     * @param {Boolean} undefNotNull True to have undefined values compare
     *     differently than nulls for uniquing purposes.
     * @returns {Array} The receiver.
     * @fires Change
     */

    var func,
        undef,
        dict,
        len,
        wi,
        i,
        obj,
        val;

    //  can't be anything but unique if only one element
    if (this.length < 2) {
        return this;
    }

    func = TP.ifInvalid(aFilter, TP.gid);
    undef = TP.ifInvalid(undefNotNull, false);

    dict = TP.hc();
    len = this.getSize();

    //  the current "write index"
    wi = 0;

    for (i = 0; i < len; i++) {
        obj = this[i];

        try {
            val = func(obj);
        } catch (e) {
            TP.ifError() ?
                TP.error(TP.ec(e, 'Error uniquing Array')) : 0;
        }

        //  have to process null/undefined into string keys we can match
        //  against with relative safety...
        if (undef) {
            if (TP.notDefined(val)) {
                val = TP.UNDEF;
            } else if (TP.isNull(val)) {
                val = TP.NULL;
            }
        } else if (TP.notValid(val)) {
            val = TP.NULL;
        }

        if (TP.isValid(dict.at(val))) {
            continue;
        }

        //  doesn't matter what we put here, so keep it simple
        dict.atPut(val, true);

        this[wi] = obj;
        wi++;
    }

    if (wi < len) {
        this.length = wi;
        this.changed('length', TP.UPDATE,
                        TP.hc(TP.OLDVAL, len, TP.NEWVAL, this.length));
    }

    return this;
});

//  ------------------------------------------------------------------------
//  ATTRIBUTE / SLOT MANAGEMENT
//  ------------------------------------------------------------------------

TP.definePrimitive('stripPropertyPrefix',
function(anObject) {

    /**
     * @method stripPropertyPrefix
     * @summary Removes any leading attribute prefix from the property name,
     *     typically in order to produce a change signal.
     * @param {String|Number} anObject An attribute name or index (sometimes
     *     numerical) that may require adjustment for lookup via get() or set().
     * @returns {String|Number} The supplied object stripped of its prefix.
     */

    var prefixChar;

    //  called from get so if we didnt' get a viable string return
    if (!TP.isString(anObject)) {
        return anObject;
    }

    prefixChar = anObject.charAt(0);

    if (prefixChar === '_') {
        //  by far the most common, protected variable
        return anObject.slice(1);
    } else if (prefixChar === '$') {
        //  private or internal?
        if (anObject.charAt(1) === '$') {
            //  $$ is internal
            return anObject.slice(2);
        } else {
            //  single $ is private
            return anObject.slice(1);
        }
    }

    return anObject;
});

//  ------------------------------------------------------------------------

/*
Array properties required for sorting behavior. Sorting is a step TIBET's
arrays take when accessed via set/get or at/atPut to ensure the proper data
is being altered and that the data returned is in the proper order. Until
they are accessed the Array contents aren't kept in sorted order for
efficiency.
*/

//  control flag helping avoid redundant sorts in certain scenarios
TP.ArrayProto.$firstSort = true;

//  is the array dirty?
TP.ArrayProto.$needsSort = true;

//  which sort function?
TP.ArrayProto.sortFunction = null;

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('$sortIfNeeded',
function() {

    /**
     * @method $sortIfNeeded
     * @summary Sorts the receiver if it is both acting as a sorted collection
     *     and is currently in need of sorting (it's changed since the last
     *     sort).
     * @returns {Array} The receiver.
     */

    if (this.$needsSort && this.sortFunction) {
        //  apparently "undefined" isn't a "valid sort argument", even
        //  though the docs will tell you sort() without a param is ok
        if (TP.isCallable(this.sortFunction)) {
            this.sort(this.sortFunction);
        } else {
            this.sort();
        }

        this.$needsSort = false;

        //  if this is set to true we just changed to a sorted collection
        //  and notification happened there...don't do it again
        if (TP.isFalse(this.$firstSort)) {
            this.changed('order', TP.SORTED);
            this.$firstSort = false;
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('$get',
function(attributeName) {

    /**
     * @method $get
     * @summary Returns the value, if any, for the attribute provided. In the
     *     case of Array we deal with the fact that there are numeric indexes as
     *     well as the 'object keys' normally found on objects. See $get on
     *     Object for more information.
     * @param {String} attributeName The name of the particular attribute.
     * @returns {Object} The value contained in the named attribute on the
     *     receiver.
     */

    var attr;

    if (TP.isNumber(attributeName)) {
        //  have to deal with negative indices, out-of-bounds, etc.
        attr = attributeName;

        if (attr < 0) {
            attr = Math.max(0, this.length + attr);
        }

        if (attr >= this.length) {
            return;
        }

        //  sort prior to retrieval so we get the right value
        this.$sortIfNeeded();

        return this[attr];
    } else {
        //  defer to standard lookup from Object if non-numeric key
        return this[attributeName];
    }
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('$set',
function(attributeName, attributeValue, shouldSignal, allowUndef) {

    /**
     * @method $set
     * @summary Sets the value of the named slot to the value provided and
     *     signals changes if appropriate. No attempt is made to manage aspects,
     *     or to lookup setters. This is the default primitive slot setter.
     * @param {String} attributeName The name of the attribute.
     * @param {Object} attributeValue The value to set in that slot.
     * @param {Boolean} shouldSignal If false no signaling occurs. Defaults to
     *     this.shouldSignalChange().
     * @param {Boolean} allowUndef True to let the slot value be set to
     *     undefined. This isn't normally done except by certain container
     *     types, especially response objects.
     * @returns {Object} The receiver.
     */

    var newVal,
        oldVal,
        op,

        sigFlag,
        oldFlag;

    if (allowUndef !== true) {
        newVal = TP.ifInvalid(attributeValue, null);
    } else {
        newVal = attributeValue;
    }

    oldVal = this[attributeName];

    //  bypass warning for "internal" since we assume these are very
    //  explicit and can often be "demand driven" to avoid exposure
    if (!allowUndef &&
        !TP.isProperty(this, attributeName) &&
        !TP.regex.INTERNAL_SLOT.test(attributeName)) {
        TP.ifWarn() ?
            TP.warn(TP.sc('Setting undefined attribute: ',
                            TP.name(this), '.', attributeName,
                            ' (', TP.tname(this), ')',
                            TP.tname(this) === 'Window' ?
                                TP.sc(' -- Possible unbound function') :
                                '')) : 0;
    }

    op = TP.UPDATE;

    if (TP.notDefined(oldVal)) {
        //  no change? no reason to continue
        if (TP.notDefined(newVal)) {
            return this;
        }
        op = TP.CREATE; //  value didn't exist - we're creating it.
    } else if (TP.isNull(oldVal)) {
        //  no change? no reason to continue
        if (TP.isNull(newVal)) {
            return this;
        }
    } else if (TP.isValid(oldVal)) {
        //  if the value is non-null it's been set before, so the slot
        //  exists, but we need to know if we're being asked to change it

        //  for 'change' testing we demand equivalent types
        if (typeof oldVal === typeof newVal) {
            /* eslint-disable eqeqeq */
            if (oldVal == newVal) {
            /* eslint-enable eqeqeq */
                return this;
            }
        }
    }

    //  note that we set null as the default here so we'll know a set call
    //  was made at some point
    this[attributeName] = newVal;

    //  NB: Use this construct this way for better performance
    if (TP.notValid(sigFlag = shouldSignal)) {
        sigFlag = this.shouldSignalChange();
    }

    if (sigFlag) {
        oldFlag = this.shouldSignalChange();

        this.shouldSignalChange(sigFlag);
        this.changed(TP.stripPropertyPrefix(attributeName),
                        op,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, newVal));
        this.shouldSignalChange(oldFlag);
    }

    return this;
});

//  ------------------------------------------------------------------------

//  hook for 'call next' from Array, but don't use 'Inst.defineMethod()' as we
//  don't want to reset the owner, track, etc.
Array.prototype.$$set = Array.prototype.$set;

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('$set',
function(attributeName, attributeValue, shouldSignal) {

    /**
     * @method $set
     * @summary Sets the value of the named/numbered slot to the value provided
     *     and signals changes if appropriate. No attempt is made to manage
     *     aspects, or to lookup setters. This is *the* primitive slot setter.
     * @param {String|Number} attributeName The name or # of the attribute.
     * @param {Object} attributeValue The value to set in that slot.
     * @param {Boolean} shouldSignal If false no signaling occurs. Defaults to
     *     this.shouldSignalChange().
     * @returns {Object} The receiver.
     */

    var newVal,
        attr,
        op,
        oldVal,

        sigFlag,
        oldFlag;

    newVal = TP.ifInvalid(attributeValue, null);

    if (TP.isNumber(attributeName)) {
        attr = attributeName;
        if (attr < 0) {
            attr = Math.max(0, this.length + attr);
        }

        //  make sure we're in the right order before testing slot
        this.$sortIfNeeded();

        oldVal = this[attr];

        if (TP.isDefined(oldVal)) {
            if (typeof oldVal === typeof newVal) {
                /* eslint-disable eqeqeq */
                if (oldVal == newVal) {
                /* eslint-enable eqeqeq */
                    return this;
                }
            }
            op = TP.UPDATE;

        } else {
            //  value didn't exist - we're creating it.
            op = TP.CREATE;
        }

        this[attr] = newVal;

        sigFlag = shouldSignal;
        if (TP.notValid(sigFlag)) {
            sigFlag = this.shouldSignalChange();
        }

        if (sigFlag) {
            oldFlag = this.shouldSignalChange();

            this.shouldSignalChange(sigFlag);
            this.changed(TP.stripPropertyPrefix(attributeName),
                            op,
                            TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, newVal));
            this.shouldSignalChange(oldFlag);
        }
    } else {
        return this.$$set(attributeName, newVal, shouldSignal);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('normalizeIndex',
function(anIndex) {

    /**
     * @method normalizeIndex
     * @summary Adapts negative indexes to indexed collection sizes. When using
     *     any of the at*(), or *At() methods in TIBET the indexes can be
     *     negative. This method adjusts the negative indexes using a common
     *     algorithm which wraps negative values repeatedly until they settle
     *     within the receiver's size.
     * @param {Number|String} anIndex An index to adjust to a location within
     *     the receiver.
     * @returns {Number|String} The normalized index.
     */

    var size,
        index;

    if (!TP.isNumber(anIndex)) {
        return anIndex;
    }

    if (anIndex >= 0) {
        return anIndex;
    }

    size = this.getSize();

    //  one boundary condition is a negative index into an empty array.
    //  we'll set that to 0
    if (size === 0) {
        return 0;
    }

    index = anIndex;

    //  any other scenario means we've got a shot at reducing the index
    //  until it lands in the array at some location
    index = size + index;

    return this.normalizeIndex(index);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('at',
function(anIndex) {

    /**
     * @method at
     * @summary Returns the value at the index provided. DNU slots are ignored
     *     and no prefix translation is performed. If the receiver implements
     *     get() this method defers to that call.
     * @param {Object} anIndex The index of the value to return.
     * @returns {Object} The element at anIndex in this collection.
     */

    if (TP.canInvoke(this, 'get')) {
        return this.get(anIndex);
    }

    return this[anIndex];
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('atPut',
function(anIndex, aValue) {

    /**
     * @method atPut
     * @summary Replaces the value at anIndex with aValue.
     * @param {Object} anIndex The index to put aValue into.
     * @param {Object} aValue The value to place at anIndex.
     * @returns {Object} The receiver.
     * @fires Change
     */

    var index;

    index = anIndex > 0 ? anIndex : this.normalizeIndex(anIndex);

    //  no translation...just direct set/change notification - note that by
    //  passing 'null' for the 'shouldSignal' parameter here, we let the
    //  receiver's 'shouldSignalChange' property take effect.
    return this.$set(index, aValue, null, false);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('at',
function(anIndex, varargs) {

    /**
     * @method at
     * @summary Returns the value found at an index. Provides polymorphic
     *     access to indexed collection data, which isn't possible with literal
     *     bracket syntax (you can't use []'s on strings etc).
     * @description To support multi-dimensional access this method will allow
     *     more than one index parameter as in arr.at(1, 1) so that, in reality,
     *     the value is acquired from a nested child of the receiver. For
     *     example, arr.at(1, 1) returns the value 3 when used on the array
     *     [[0,1],[2,3]]. This is equivalent to the syntax arr[1][1];
     * @param {Number} anIndex The index to access. Note that this value is the
     *     first index in a potential list of indicies.
     * @param {arguments} varargs A variable list of 0 to N additional indexes
     *     which descend into nested array children.
     * @returns {Object} The value at the index.
     * @addon Array
     */

    var index,
        len,

        val,
        i;

    //  non-numerical indexes are supported via get() which doesn't need to
    //  support multi-dimensional content access.
    if (!TP.isNumber(anIndex)) {
        return this.get(anIndex);
    }

    index = this.normalizeIndex(anIndex);

    //  99% case, and touching arguments object slows it down
    if (TP.notValid(varargs)) {
        return this[index];
    }

    len = arguments.length;
    switch (len) {
        case 0:

            return TP.raise(this, 'TP.sig.InvalidIndex');

        default:

            val = this[index];

            for (i = 1; i < len; i++) {
                if (TP.isValid(val)) {
                    val = val[this.normalizeIndex(arguments[i])];
                } else {
                    //  won't consider this an error, just return null
                    break;
                }
            }

            return val;
    }
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('atPut',
function(anIndex, varargs, aValue) {

    /**
     * @method atPut
     * @summary Sets the value found at anIndex. Provides polymorphic access to
     *     updating indexed collection data, which isn't possible with literal
     *     bracket syntax. This version does not provide change notification.
     *     NOTE that this initial version does not support vararg values or
     *     negative indices.
     * @description To support multi-dimensional access this method will allow
     *     more than one index parameter as in arr.atPut(1, 2, 'foo') so that,
     *     in reality, aValue is defined by the last argument and is placed in
     *     the location found by traversing to the last index (arguments.length
     *     - 2) provided.
     * @param {Number} anIndex The index to set/update.
     * @param {arguments} varargs A variable list of 0 to N additional indexes
     *     which descend into nested array children.
     * @param {Object} aValue The object to place at anIndex. NOTE that the
     *     position of this attribute may actually vary if multiple indexes are
     *     supplied.
     * @returns {Array} The receiver.
     * @addon Array
     */

    var index,
        val,
        op,

        len,

        obj,
        i;

    //  non-numerical indexes are supported via get() which doesn't need to
    //  support multi-dimensional content access.
    if (!TP.isNumber(anIndex)) {
        return this.set(anIndex, varargs || aValue, null, false);
    }

    index = this.normalizeIndex(anIndex);

    //  99% case, and touching arguments object slows it down
    if (aValue === undefined) {

        val = this[index];

        this[index] = varargs;

        /* eslint-disable eqeqeq */
        if (val != varargs) {
        /* eslint-enable eqeqeq */
            op = val === undefined ? TP.CREATE : TP.UPDATE;

            //  Still subject to whether the object has 'shouldSignalChange()'
            //  set -- usually false.
            this.changed(index, op, TP.hc(TP.OLDVAL, val, TP.NEWVAL, varargs));
        }

        return this;
    }

    len = arguments.length;
    switch (len) {
        case 0:
            return TP.raise(this, 'TP.sig.InvalidIndex');

        default:

            /* eslint-disable consistent-this */

            //  navigate to the proper location, stopping just before the
            //  end so we've trimmed down to index and value
            obj = this;
            for (i = 0; i < len - 2; i++) {
                if (TP.isValid(obj)) {
                    obj = obj[this.normalizeIndex(arguments[i])];
                } else {
                    //  can't access an object at the index provided, so
                    //  we'll raise an exception for now. in some cases we
                    //  might have preferred to build a new container
                    return TP.raise(this, 'TP.sig.InvalidIndex');
                }
            }

            //  perform the operation on the final object using our last
            //  index and the value provided
            if (TP.canInvoke(obj, 'atPut')) {
                val = obj.at(arguments[len - 2]);
                obj.atPut(arguments[len - 2], arguments[len - 1]);
            } else {
                try {
                    val = arguments[len - 2];
                    obj[arguments[len - 2]] = arguments[len - 1];
                } catch (e) {
                    return TP.raise(this, 'TP.sig.ArrayException',
                                    TP.ec(e));
                }
            }

            /* eslint-enable consistent-this */

            //  fall through so we can do change notification
    }

    /* eslint-disable eqeqeq */
    if (val != aValue) {
    /* eslint-enable eqeqeq */
        //  Since we changed multiple slots, some or all of which might have
        //  already existed, we just send 'TP.UPDATE' here with an aspect of
        //  'length'.
        this.changed('length', TP.UPDATE);
    }

    return this;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('at',
function(anIndex) {

    /**
     * @method at
     * @summary Returns the value at the index provided. See charAt().
     * @param {Number} anIndex The index to use for locating the character.
     * @returns {String} The item at the index provided or undefined.
     */

    if (TP.isNumber(anIndex)) {
        return this.charAt(this.normalizeIndex(anIndex));
    } else {
        return this.get(anIndex);
    }
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('atPut',
function(anIndex, aValue) {

    /**
     * @method atPut
     * @summary Replaces the value at anIndex with aValue. NOTE that because
     *     strings are not mutable objects and aren't strictly collections in
     *     JavaScript this method returns a new string instance rather than
     *     updating the string in place.
     * @param {Object} anIndex The index to put aValue into.
     * @param {Object} aValue The value to place at anIndex.
     * @returns {Object} A new string with the adjusted value.
     * @fires Change
     */

    var index;

    //  NB: Because we're not changing the original String, there is no change
    //  notification here.

    index = anIndex > 0 ? anIndex : this.normalizeIndex(anIndex);

    //  basically slicing on both sides of the index and opening a hole for
    //  the new content the size of the content...effectively replacing one
    //  or more characters
    return this.slice(0, index) +
                        aValue +
                        this.slice(index + aValue.length);
});

//  ------------------------------------------------------------------------
//  METADATA SUPPORT FUNCTIONS
//  ------------------------------------------------------------------------

/**
 * @
 */

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getCustomTypeNames',
function() {

    /**
     * @method getCustomTypeNames
     * @summary Returns a list of all known custom (TIBET) types in the system,
     *     or available to it via dyna-loading. This list is typically populated
     *     by combining pre-existing metadata with runtime information to
     *     construct a complete list.
     * @returns {String[]} An array of the non-native type names.
     */

    return TP.keys(TP.sys.getMetadata('types'));
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getMethodIds',
function() {

    /**
     * @method getMethodIds
     * @summary Returns a list of all the methods available in the system or
     *     available to it via dyna-loading. Each method ID is a composite of
     *     the Type.Track.MethodName separated with periods. This information is
     *     used by both the canResolveDNU and method linting routines in TIBET.
     * @returns {String[]} An array of the unique method IDs.
     */

    return TP.keys(TP.sys.getMetadata('methods'));
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getMethodNames',
function() {

    /**
     * @method getMethodNames
     * @summary Returns a list of all the methods available in the system or
     *     available to it via dyna-loading. This list is typically populated by
     *     combining pre-existing metadata with runtime information to construct
     *     a complete picture of the methods which are available.
     * @param {Boolean} full True if full metadata is required for this call,
     *     meaning the external metadata cache should be loaded.
     * @returns {String[]} An array of the unique method names.
     */

    var methods,
        methodKeys,

        result,
        len,
        i;

    methods = TP.sys.getMetadata('methods');
    methodKeys = methods.getKeys();

    result = TP.ac();

    len = methodKeys.getSize();
    for (i = 0; i < len; i++) {
        //  NB: We use primitive property access here since 'methodObj' is
        //  property of a property descriptor
        result.push(methods.at(methodKeys.at(i))[TP.NAME]);
    }

    return result;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getMethodOwners',
function(aFunction, namesOnly) {

    /**
     * @method getMethodOwners
     * @summary Returns the list of method/function owners for the given
     *     function/fname. This information is tracked via metadata.
     * @param {Function|String} aFunction The function being tracked.
     * @param {Boolean} namesOnly True means return the list of owner names
     *     only. Default is false.
     * @returns {Object[]} An array of objects/types.
     */

    var fname,
        str,
        arr,
        len,
        i;

    //  need a function or string name
    if (TP.notValid(aFunction)) {
        return;
    }

    //  even if aFunction is a string this will work, string.getName is the
    //  string itself
    fname = aFunction.getName();

    str = TP.sys.getMetadata('owners').at(fname);
    if (TP.isEmpty(str)) {
        return TP.ac();
    }

    //  Split into an array of owner names.
    arr = str.split(TP.JOIN);

    if (TP.isTrue(namesOnly)) {
        return arr;
    }

    len = arr.getSize();
    for (i = 0; i < len; i++) {
        //  Gather owners, but only check for registered objects.
        arr[i] = TP.sys.getObjectById(arr[i], true);
    }

    //  remove nulls for those we didn't find/fault in
    arr.compact();

    return arr;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getMetadata',
function(kind) {

    /**
     * @method getMetadata
     * @summary Returns the TIBET metadata hash, a hash containing information
     *     on the types, methods, etc. in the current system and/or available to
     *     it via autoloading. This data isn't exhaustive, its primary goal is
     *     to support proxies and autoloading, not reflection. You can use
     *     reflection directly to get more information on a specific type or
     *     object.
     * @param {String} kind The subset of metadata to return. Should be one of
     *     'types', 'attributes', 'methods', 'owners', or 'pathinfo'.
     * @returns {TP.core.Hash} The TIBET metadata hash.
     */

    switch (kind) {
        case 'types':
            return TP.sys.$$meta_types;
        case 'attributes':
            return TP.sys.$$meta_attributes;
        case 'methods':
            return TP.sys.$$meta_methods;
        case 'namespaces':
            return TP.sys.$$meta_namespaces;
        case 'owners':
            return TP.sys.$$meta_owners;
        case 'pathinfo':
            return TP.sys.$$meta_pathinfo;
        default:
            return TP.sys.$$metadata;
    }
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getNamespaceNames',
function() {

    /**
     * @method getNamespaceNames
     * @summary Returns a list of all of the namespaces available in the system.
     * @returns {String[]} An array of the namespace names.
     */

    return TP.keys(TP.sys.getMetadata('namespaces'));
});

//  ------------------------------------------------------------------------
//  SOURCE GENERATION
//  ------------------------------------------------------------------------

/*
There are numerous places where TIBET takes advantage of JavaScript's
ability to dynamically evaluate code. The construct() methods are the first
of these so we get some support routines for this capability in place early.
*/

//  ------------------------------------------------------------------------

TP.sys.defineMethod('$buildArgString',
function(startIndex, endIndex, arrayPrefix) {

    /**
     * @method $buildArgString
     * @summary Constructs and returns a string representation of the arguments
     *     array found in the standard 'arguments' array. This is used in
     *     locations where the arguments array needs to be eval'd as part of a
     *     larger operation. The arguments found between start and start + end
     *     are used.
     * @param {Number} startIndex The initial index to work from.
     * @param {Number} endIndex The final index.
     * @param {String} arrayPrefix Name of the array to reference.
     * @returns {String}
     */

    var start,
        end,

        prefix,
        arr,

        i;

    //  typically will start with 0, but can be built for oter indexes
    start = TP.ifInvalid(startIndex, 0);
    end = TP.ifInvalid(endIndex, 0);

    //  typically working on the arguments object, but in some cases we'll
    //  be working with an array built from that object instead. the
    //  canonical name for that parameter is anArgArray but it's always
    //  passed in rather than presumed
    prefix = TP.ifInvalid(arrayPrefix, 'arguments');

    arr = TP.ac();

    for (i = start; i <= end; i++) {
        arr.push(TP.join(prefix, '[', i, ']'));
    }

    return arr.join(', ');
});

//  ------------------------------------------------------------------------
//  NATIVE TYPES - CONSTRUCTION
//  ------------------------------------------------------------------------

/**
 * @A significant amount of TIBET's power comes from controlling the object
 *     creation process so we start that as early as possible.
 */

//  ------------------------------------------------------------------------

Array.Type.defineMethod('construct',
function() {

    /**
     * @method construct
     * @summary Constructs and returns a new array instance.
     * @description The arguments provided are treated as elements of the array
     *     with three exceptions. When an arguments object, node list, or named
     *     node map is passed as the single argument to this call the new
     *     instance's data is the result of converting those objects into native
     *     array form rather than an array with a single object in it. Also note
     *     that Array.construct (and TP.ac()) do not follow the JavaScript
     *     convention of accepting a single argument Number and treating it as a
     *     size.
     * @returns {Array} A new instance.
     */

    var arg,
        arr;

    switch (arguments.length) {
        case 0:
            return [];
        case 1:
            //  Flatten argument lists, node lists and named node maps.
            arg = arguments[0];
            if (TP.isArgArray(arg) ||
                TP.isNodeList(arg) ||
                TP.isNamedNodeMap(arg)) {
                return TP.ArrayProto.slice.call(arg, 0);
            }
            arr = [];
            arr.push(arg);
            return arr;
        default:
            return TP.ArrayProto.slice.call(arguments, 0);
    }
});

//  ------------------------------------------------------------------------

//  alias
TP.defineMethodAlias(TP, 'ac', Array.construct);

//  ------------------------------------------------------------------------

Boolean.Type.defineMethod('construct',
function(anObject) {

    /**
     * @method construct
     * @summary Constructs and returns a new instance of Boolean. Booleans are
     *     localized by using the current locale's parse routine to help ensure
     *     proper translation of Boolean string input.
     * @description Note that this method, being on a type that produces
     *     non-mutable instances, will always return its primitive value.
     * @param {Object} anObject An optional object to return in Boolean form.
     * @returns {Boolean} A new instance.
     */

    var val,
        kallee;

    kallee = Boolean.construct;

    if (anObject === true || anObject === false) {
        return anObject;
    }

    //  if we've got a string and a full kernel we can try to localize
    if (TP.isString(anObject) && TP.sys.hasKernel()) {
        //  any 'construct' that calls a 'from' needs a recursion trap
        if (TP.notTrue(kallee.$$onStack)) {
            kallee.$$onStack = true;
            val = Boolean.fromString(anObject);
            kallee.$$onStack = false;

            return val.valueOf();
        } else {
            kallee.$$onStack = false;
        }
    }

    //  only one possible argument for a Boolean
    return (new Boolean(anObject)).valueOf();
});

//  ------------------------------------------------------------------------

//  alias
TP.defineMethodAlias(TP, 'bc', Boolean.construct);

//  ------------------------------------------------------------------------

Date.Type.defineMethod('construct',
function() {

    /**
     * @method construct
     * @summary Constructs and returns a new instance of Date. Dates are parsed
     *     using any date parsers which have been added to the Date type,
     *     followed by the current TP.i18n.Locale which attempts to construct a
     *     Date using localized parsing logic.
     * @description Date parsing is a key element of usability. TIBET's approach
     *     is to attempt to use the standard Date constructor, followed by the
     *     Date.fromString() method when the input is a string. The fromString
     *     method looks for any parsers which may have been registered via prior
     *     Date.addParser() calls. If those parsers are unsuccessful the current
     *     TP.i18n.Locale is invoked to parse the input string in an attempt to
     *     offer locale-specific Date construction.
     * @returns {Date} A new instance.
     */

    var $$newinst,
        kallee;

    kallee = Date.construct;

    //  we start by using the built-in constructor for any arguments so
    //  behavior is consistent with native JS, and then we try parsing on
    //  our own
    switch (arguments.length) {
        case 0:
            $$newinst = new Date();
            break;
        case 1:
            $$newinst = new Date(arguments[0]);
            break;
        case 2:
            $$newinst = new Date(arguments[0], arguments[1]);
            break;
        case 3:
            $$newinst = new Date(arguments[0], arguments[1],
                arguments[2]);
            break;
        case 4:
            $$newinst = new Date(arguments[0], arguments[1],
                arguments[2], arguments[3]);
            break;
        case 5:
            $$newinst = new Date(arguments[0], arguments[1],
                arguments[2], arguments[3], arguments[4]);
            break;
        case 6:
            $$newinst = new Date(arguments[0], arguments[1],
                arguments[2], arguments[3], arguments[4], arguments[5]);
            break;
        case 7:
            $$newinst = new Date(arguments[0], arguments[1],
                arguments[2], arguments[3], arguments[4], arguments[5],
                arguments[6]);
            break;
        default:
            break;
    }

    //  have to watch out for "valid" data that's really saying the Date
    //  parameters didn't produce a valid date.
    if (TP.notValid($$newinst) ||
            $$newinst.toString() === 'Invalid Date' || //  mozilla
            $$newinst.toString() === 'NaN') {            //  IE
        //  any 'construct' that calls a 'from' needs a recursion trap
        if (TP.notTrue(kallee.$$onStack)) {
            kallee.$$onStack = true;
            $$newinst = Date.fromString(arguments[0]);
            kallee.$$onStack = false;

            return $$newinst;
        } else {
            kallee.$$onStack = false;
        }
    }

    return $$newinst;
});

//  ------------------------------------------------------------------------

//  alias
TP.defineMethodAlias(TP, 'dc', Date.construct);

//  ------------------------------------------------------------------------

Function.Type.defineMethod('construct',
function() {

    /**
     * @method construct
     * @summary Constructs and returns a new instance of the receiver.
     * @returns {Function} A new instance.
     */

    var $$newinst,
        msg;

    try {
        switch (arguments.length) {
            case 0:
                $$newinst = new Function();
                break;
            case 1:
                $$newinst = new Function(arguments[0]);
                break;
            case 2:
                $$newinst = new Function(arguments[0], arguments[1]);
                break;
            case 3:
                $$newinst = new Function(arguments[0], arguments[1],
                    arguments[2]);
                break;
            case 4:
                $$newinst = new Function(arguments[0], arguments[1],
                    arguments[2], arguments[3]);
                break;
            case 5:
                $$newinst = new Function(arguments[0], arguments[1],
                    arguments[2], arguments[3], arguments[4]);
                break;
            case 6:
                $$newinst = new Function(arguments[0], arguments[1],
                    arguments[2], arguments[3], arguments[4], arguments[5]);
                break;
            case 7:
                $$newinst = new Function(arguments[0], arguments[1],
                    arguments[2], arguments[3], arguments[4], arguments[5],
                    arguments[6]);
                break;
            case 8:
                $$newinst = new Function(arguments[0], arguments[1],
                    arguments[2], arguments[3], arguments[4], arguments[5],
                    arguments[6], arguments[7]);
                break;
            case 9:
                $$newinst = new Function(arguments[0], arguments[1],
                    arguments[2], arguments[3], arguments[4], arguments[5],
                    arguments[6], arguments[7], arguments[8]);
                break;
            default:
                break;
        }
    } catch (e) {
        msg = TP.join('Error creating function: ',
                    TP.args(arguments).join(' :: '));

        TP.ifError() ? TP.error(TP.ec(e, msg)) : 0;

        return null;
    }

    return $$newinst;
});

//  ------------------------------------------------------------------------

//  alias
TP.defineMethodAlias(TP, 'fc', Function.construct);

//  ------------------------------------------------------------------------

Number.Type.defineMethod('construct',
function(anObject) {

    /**
     * @method construct
     * @summary Constructs and returns a new instance of Number. Numbers are
     *     parsed using any number parsers which have been added to the number
     *     type, followed by the current TP.i18n.Locale which attempts to
     *     construct a Number using localized parsing logic.
     * @description Number parsing is a key element of usability. TIBET's
     *     approach is to attempt to use the Number.fromString() method when the
     *     input is a string. The fromString method looks for any parsers which
     *     may have been registered via addParser. If those parsers are
     *     unsuccessful the current TP.i18n.Locale is invoked to parse the input
     *     string in an attempt to offer locale-specific Number construction.
     *     Note that this method, being on a type that produces non-mutable
     *     instances, will always return its primitive value.
     * @param {Object} anObject An optional object to return in Number form.
     * @returns {Number} A new instance.
     */

    var val,
        kallee;

    kallee = Number.construct;

    //  if we've got a string and a full kernel we can try to localize
    if (TP.isString(anObject) && TP.sys.hasKernel()) {
        //  any 'construct' that calls a 'from' needs a recursion trap
        if (TP.notTrue(kallee.$$onStack)) {
            kallee.$$onStack = true;
            val = Number.fromString(anObject);
            kallee.$$onStack = false;

            return val.valueOf();
        } else {
            kallee.$$onStack = false;
        }
    }

    //  number only takes one argument so we can invoke directly
    return (new Number(anObject)).valueOf();
});

//  ------------------------------------------------------------------------

//  alias
TP.defineMethodAlias(TP, 'nc', Number.construct);

//  ------------------------------------------------------------------------

Object.Type.defineMethod('construct',
function() {

    /**
     * @method construct
     * @description Constructs and returns a new instance of the receiver.
     *     Arguments are treated as alternating keys and values to match the
     *     semantics of the standard call, but not quite the same syntax (a, b,
     *     c, d rather than a: b, c: d). NOTE that in TIBET it is deprecated to
     *     use an object as a hash for a number of reasons. If you truly want a
     *     "dictionary" (i.e. "hash") you should use TP.hc() instead.
     * @returns {Object} A new instance.
     */

    var i,
        newinst;

    newinst = new Object();

    //  do the key/value pair thing for all even pairs, any dangling key
    //  gets a null as a value.
    for (i = 0; i < arguments.length; i = i + 2) {
        //  NOTE:   by putting this inside a test we will not replace
        //          existing properties -- either attributes or methods.
        if (!TP.isProperty(newinst, arguments[i])) {
            newinst[arguments[i]] =
                    TP.notDefined(arguments[i + 1]) ? null : arguments[i + 1];
        } else {
            //  TP.raise(newinst, 'TP.sig.DuplicateKey',
            //              arguments[i]);
            void 0;
        }
    }

    return newinst;
});

//  ------------------------------------------------------------------------

RegExp.Type.defineMethod('construct',
function(pattern, flags, silent) {

    /**
     * @method construct
     * @summary Constructs and returns a new instance of the receiver.
     * @param {String} pattern The regular expression pattern.
     * @param {String} flags A concatenated set of flags to control the RegExp
     *     object. These are:
     *     'g' match globally
     *     'i' ignore case
     *     'm' match over multiple lines.
     *     'y' whether the regular expression search starts from its lastIndex
     * @param {Boolean} [silent=false] True to turn off error logging for bad
     *     regular expression source text.
     * @returns {RegExp} A new instance.
     */

    var parts,
        restr,
        attrs,
        tail,
        newinst,
        msg;

    if (TP.isRegExp(pattern)) {
        return pattern;
    }

    parts = TP.stringRegExpComponents(pattern);
    if (TP.isEmpty(parts)) {
        if (TP.notTrue(silent)) {
            msg = TP.join('Error creating regex: ', pattern);
            TP.ifError() ? TP.error(msg) : 0;
        }

        return null;
    }

    restr = TP.ifInvalid(parts.first(), '');
    attrs = TP.ifInvalid(flags, '');
    tail = parts.last();
    attrs += tail;

    //  Don't duplicate flags or we get no regex back :(.
    attrs = attrs.split('').unique().join('');

    try {
        newinst = new RegExp(restr, attrs);
    } catch (e) {
        if (TP.notTrue(silent)) {
            msg = TP.join('Error creating regex: ', restr);
            TP.ifError() ? TP.error(TP.ec(e, msg)) : 0;
        }

        return null;
    }

    return newinst;
});

//  ------------------------------------------------------------------------

//  alias
TP.defineMethodAlias(TP, 'rc', RegExp.construct);

//  ------------------------------------------------------------------------

TP.definePrimitive('$sc', TP.sc);

//  ------------------------------------------------------------------------

String.Type.defineMethod('construct',
function(varargs) {

    /**
     * @method construct
     * @summary Constructs and returns a new instance of String from the
     *     arguments supplied. This routine localizes each argument.
     * @description Note that this method, being on a type that produces
     *     non-mutable instances, will always return its primitive value.
     * @param {arguments} varargs A variable list of 0 to N values to build the
     *     String from.
     * @returns {String} A new instance.
     */

    var locale,
        result,
        arr,
        len,
        i;

    //  Use the original primitive version that leverages TP.msg lookup if we
    //  haven't loaded enough kernel to have locale support.
    if (!TP.sys.hasKernel()) {
        return TP.$sc.apply(TP, arguments);
    }

    locale = TP.sys.getLocale();

    switch (arguments.length) {
        case 0:
            return '';
        case 1:
            return locale.localizeString('' + varargs);
        default:
            result = TP.ac();
            arr = TP.ac(arguments);

            len = arr.getSize();
            for (i = 0; i < len; i++) {
                result.push(locale.localizeString('' + arr[i]));
            }

            return result.join('');
    }
});

//  ------------------------------------------------------------------------

//  alias
TP.defineMethodAlias(TP, 'sc', String.construct);

//  ------------------------------------------------------------------------
//  NATIVE TYPES - MEMBERSHIP
//  ------------------------------------------------------------------------

/*
The methods here allow instances of native types to return true very quickly
from certain TP.isKindOf()/TP.isMemberOf() queries.
*/

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('$$isMemberOf',
function(aType) {

    /**
     * @method $$isMemberOf
     * @summary Returns true if the receiver is a direct member (instance) of
     *     the named type.
     * @param {TP.lang.RootObject|String} aType A Type object, or type name.
     * @returns {Boolean} Whether or not the receiver is a direct member of the
     *     supplied type.
     */

    if (aType === Array || aType === 'Array') {
        return true;
    }
});

//  ------------------------------------------------------------------------

Boolean.Inst.defineMethod('$$isMemberOf',
function(aType) {

    /**
     * @method $$isMemberOf
     * @summary Returns true if the receiver is a direct member (instance) of
     *     the named type.
     * @param {TP.lang.RootObject|String} aType A Type object, or type name.
     * @returns {Boolean} Whether or not the receiver is a direct member of the
     *     supplied type.
     */

    if (aType === Boolean || aType === 'Boolean') {
        return true;
    }
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('$$isMemberOf',
function(aType) {

    /**
     * @method $$isMemberOf
     * @summary Returns true if the receiver is a direct member (instance) of
     *     the named type.
     * @param {TP.lang.RootObject|String} aType A Type object, or type name.
     * @returns {Boolean} Whether or not the receiver is a direct member of the
     *     supplied type.
     */

    if (aType === Date || aType === 'Date') {
        return true;
    }
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('$$isMemberOf',
function(aType) {

    /**
     * @method $$isMemberOf
     * @summary Returns true if the receiver is a direct member (instance) of
     *     the named type.
     * @param {TP.lang.RootObject|String} aType A Type object, or type name.
     * @returns {Boolean} Whether or not the receiver is a direct member of the
     *     supplied type.
     */

    if (aType === Function || aType === 'Function') {
        return true;
    }
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('$$isMemberOf',
function(aType) {

    /**
     * @method $$isMemberOf
     * @summary Returns true if the receiver is a direct member (instance) of
     *     the named type.
     * @param {TP.lang.RootObject|String} aType A Type object, or type name.
     * @returns {Boolean} Whether or not the receiver is a direct member of the
     *     supplied type.
     */

    if (aType === Number || aType === 'Number') {
        return true;
    }
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('$$isMemberOf',
function(aType) {

    /**
     * @method $$isMemberOf
     * @summary Returns true if the receiver is a direct member (instance) of
     *     the named type.
     * @param {TP.lang.RootObject|String} aType A Type object, or type name.
     * @returns {Boolean} Whether or not the receiver is a direct member of the
     *     supplied type.
     */

    //  The problem here is that, according to JS, *all* objects can use
    //  this method (including objects that have TP* types as their type).
    //  Since this is restricted to 'is member of', we need to check their
    //  type object against 'Object' directly.

    if (TP.isString(aType)) {
        return this.getTypeName() === TP.name(aType);
    }

    return this.getType() === aType;
});

//  ------------------------------------------------------------------------

RegExp.Inst.defineMethod('$$isMemberOf',
function(aType) {

    /**
     * @method $$isMemberOf
     * @summary Returns true if the receiver is a direct member (instance) of
     *     the named type.
     * @param {TP.lang.RootObject|String} aType A Type object, or type name.
     * @returns {Boolean} Whether or not the receiver is a direct member of the
     *     supplied type.
     */

    if (aType === RegExp || aType === 'RegExp') {
        return true;
    }
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('$$isMemberOf',
function(aType) {

    /**
     * @method $$isMemberOf
     * @summary Returns true if the receiver is a direct member (instance) of
     *     the named type.
     * @param {TP.lang.RootObject|String} aType A Type object, or type name.
     * @returns {Boolean} Whether or not the receiver is a direct member of the
     *     supplied type.
     */

    if (aType === String || aType === 'String') {
        return true;
    }
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
