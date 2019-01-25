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
//  TP.api.CollectionAPI
//  ------------------------------------------------------------------------

/**
 * @type {TP.api.CollectionAPI}
 * @summary The TP.api.CollectionAPI, which defines the core methods we
 *     consider appropriate for a rich set of collections.
 */

//  ------------------------------------------------------------------------

TP.api.CollectionAPI =
    TP.ac(
        'add',
        'addAll',
        'addAllIfAbsent',
        'addIfAbsent',
        'addItem',
        'addWithCount',
        'asArray',
        'asHash',
        'asIterator',
        'asRange',
        'asString',
        'collapse',
        'collect',
        'collectGet',
        'collectInvoke',
        'compact',
        'conform',
        'contains',
        'containsAll',
        'containsAny',
        'containsString',
        'convert',
        'countOf',
        'detect',
        'detectInvoke',
        'detectMax',
        'detectMin',
        'difference',
        'disjunction',
        'empty',
        'flatten',
        'getItems',
        'getIterator',
        'getIteratorType',
        'getSize',
        'getValues',
        'grep',
        'groupBy',
        'injectInto',
        'intersection',
        'isSortedCollection',
        'merge',
        'partition',
        'perform',
        'performInvoke',
        'performSet',
        'performUntil',
        'performWhile',
        'performWith',
        'reject',
        'remove',
        'removeAll',
        'replace',
        'replaceAll',
        'select',
        'union',
        'unique'
    );

//  ------------------------------------------------------------------------
//  TP.api.IndexedCollectionAPI
//  ------------------------------------------------------------------------

/**
 * @type {TP.api.IndexedCollectionAPI}
 * @summary The TP.api.IndexedCollection API, which adds support for accessing
 *     elements of a collection by index and for working with the indexes
 *     themselves.
 */

//  ------------------------------------------------------------------------

TP.api.IndexedCollectionAPI =
    TP.ac(
        'addAt',
        'addAllAt',
        'at',
        'atAll',
        'atAllPut',
        'atIfInvalid',
        'atIfNull',
        'atIfUndefined',
        'atPut',
        'atPutIfAbsent',
        'containsKey',
        'containsValue',
        'detectKeyAt',
        'getKeys',
        'getKeysForValue',
        'getKVPairs',
        'getPairs',
        'getPosition',
        'getPositions',
        'grepKeys',
        'pad',
        'performOver',
        'removeAt',
        'removeAtAll',
        'removeKey',
        'removeKeys',
        'transpose'
    );

//  ------------------------------------------------------------------------
//  TP.api.OrderedCollectionAPI
//  ------------------------------------------------------------------------

/**
 * @type {TP.api.OrderedCollectionAPI}
 * @summary The TP.api.OrderedCollection API, which adds methods which deal
 *     with ordered element access.
 */

//  ------------------------------------------------------------------------

TP.api.OrderedCollectionAPI =
    TP.ac(
        'addAfter',
        'addAllAfter',
        'addAllBefore',
        'addAllFirst',
        'addAllLast',
        'addBefore',
        'addFirst',
        'addLast',
        'after',
        'before',
        'first',
        'getLastPosition',
        'last',
        'orderedBy',
        'removeFirst',
        'removeLast',
        'replaceFirst',
        'replaceLast',
        'reverse'
    );

//  ------------------------------------------------------------------------
//  TP.api.OrderedPairAPI
//  ------------------------------------------------------------------------

/**
 * @type {TP.api.OrderedPairAPI}
 * @summary The API required of objects which act as ordered pairs.
 * @description TP.api.OrderedPairAPI is an interface which can be implemented
 *     by any object which may be used to hold key/value pairs. Objects in the
 *     core which implement this API include Array, Object, and TP.core.Hash.
 */

//  ------------------------------------------------------------------------

TP.api.OrderedPairAPI =
    TP.ac(

        /**
         * @method getPair
         * @summary Returns an array containing the key and value of the
         *     receiver.
         * @description This method expects the receiver to have only a single
         *     key/value pair. Objects can be used as ordered pairs as in:
         *
         *     {'a':1}
         *
         *     but it it MUCH more efficient to use Arrays instead. This method
         *     is here primarily for flexibility and polymorphism.
         * @exception TP.sig.InvalidPairRequest
         * @returns {TPOrderedPair} The key/value pair.
         */

        'getPair',

        //  ---

        /**
         * @method first
         * @summary Returns the first element of the ordered pair.
         * @returns {Object} An Object.
         */

        'first',

        //  ---

        /**
         * @method last
         * @summary Returns the second (last) element of the ordered pair.
         * @returns {Object} An Object.
         */

        'last'
    );

//  ------------------------------------------------------------------------
//  TP.api.SortedCollectionAPI
//  ------------------------------------------------------------------------

/**
 * @type {TP.api.SortedCollectionAPI}
 * @summary The API required of objects which act as sorted collections.
 * @description TP.api.SortedCollectionAPI is an interface which various
 *     collections may implement as needed. Array is the only type in the system
 *     which has native sorting capability so the interface is typically
 *     implemented by types which use an array to manage either their internal
 *     data storage or indexes on same.
 */

//  ------------------------------------------------------------------------

TP.sys.SortedCollectionAPI =
    TP.ac(

        /**
         * @method getSortFunction
         * @summary Returns the sort function, if any, which has been assigned
         *     to handle sorting discrimination. Array takes a sort function
         *     which will allow control over how contents are sorted. This
         *     method returns whatever function has been assigned. If no
         *     function has been assigned an ALPHA sort will be performed by
         *     calls to sort().
         * @returns {Function} A Function or null.
         */

        'getSortFunction',

        //  ---

        /**
         * @method setSortFunction
         * @summary Sets the sort function which will be used to determine the
         *     ordering of items in the collection. The value can be null if the
         *     desired sort is an ALPHA sort.
         * @param {Function} aFunction A function or null. If a function is
         *     passed it should take two parameters for testing and return -1 if
         *     the first is "less than" the second, +1 if the first is "greater
         *     than" the second and 0 if the two are "equal" in value.
         * @exception TP.sig.InvalidFunction
         */

        'setSortFunction',

        //  ---

        /**
         * @method sort
         * @summary Performs a sort on the underlying collection.
         * @returns {Collection} The receiver.
         */

        'sort'
    );

//  ------------------------------------------------------------------------
//  TP.api.IterationAPI
//  ------------------------------------------------------------------------

/**
 * @type {TP.api.IterationAPI}
 * @summary The API required of objects which can support a TP.core.Iterator.
 * @description The TP.api.IterationAPI is an interface definition for the
 *     methods required by a collection to support TP.core.Iterator management
 *     of the collection. TIBET interfaces are essentially just collections of
 *     method names in the current version. The ability to do multiple
 *     inheritance is supported via the concept of multiple inheritance and is
 *     orthagonal to the definition of a public interface (assuming semantic
 *     consistency in the library).
 */

//  ------------------------------------------------------------------------

TP.api.IterationAPI =
    TP.ac(

        /**
         * @method at
         * @summary Returns the value at the index provided.
         * @param {Number} anIndex
         * @exception TP.sig.InvalidIndex
         * @returns {Object} The item at the index provided or undefined.
         */

        'at',

        //  ---

        /**
         * @method atAll
         * @summary Returns a new collection containing the items in the
         *     receiver at the various indexes contained in the collection
         *     provided.
         * @param {TPCollection} anIndexCollection
         * @exception TP.sig.InvalidParameter
         * @exception TP.sig.InvalidCollection
         * @returns {Object[]} An array of zero or more items.
         */

        'atAll',

        //  ---

        /**
         * @method getKeys
         * @summary Returns an array of keys for the underlying collection. In
         *     the case of an object with an Array for a data structure this
         *     results in an array containing the indices whose contents are not
         *     undefined. For Object data stores the result is the set of unique
         *     keys for the object.
         * @returns {Object[]} An array of 'keys' for the underlying collection.
         */

        'getKeys',

        //  ---

        /**
         * @method getSize
         * @summary Returns a count of the items in the receiving collection.
         * @returns {Number}
         */

        'getSize'

    );

//  ========================================================================
//  Array Extensions
//  ========================================================================

/**
 * @type {Array}
 * @summary Collection-oriented API's for Array base class.
 * @description The vast majority of functional support for the collection
 *     module. Most other collection classes rely on Array for their internal
 *     storage needs either for data, keys, or both. Array implements all of the
 *     TPCollection, TPIndexedCollection, and TPOrderedCollection APIs as well
 *     as the TPOrderedPair and TPSortedCollection interfaces.
 * @example See the /tibet/test directory for collection tests which provide a
 *     good view of usage.
 */

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

Array.Type.defineMethod('generateNumericSequence',
function(fromIndex, toIndex) {

    /**
     * @method generateNumericSequence
     * @summary Generates a simple monotonic sequence of numbers from the
           starting index to the ending index (inclusive).
     * @returns {Number[]} An Array of Numbers from the start to the end index,
     *     inclusive.
     */

    var nums,
        i;

    nums = TP.ac();

    for (i = fromIndex; i <= toIndex; i++) {
        nums.push(i);
    }

    return nums;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

Array.Inst.defineMethod('clearTextContent',
function() {

    /**
     * @method clearTextContent
     * @summary Clears out any text content of mutable items in the receiver,
     *     thereby clearing all of the non-mutable (primitive) items and leaving
     *     just the data structure.
     * @returns {Array} The receiver.
     */

    var len,
        i,
        it;

    len = this.length;
    for (i = 0; i < len; i++) {

        it = this[i];

        //  Make sure that the item is both mutable and implements a 'clear'
        //  method.
        if (TP.isMutable(it) && TP.canInvoke(it, 'clear')) {
            it.clear();
        } else {
            this[i] = '';
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('$$isCollection',
function() {

    /**
     * @method $$isCollection
     * @summary Returns true if the receiver is a collection instance.
     * @returns {Boolean} True if the receiver is a collection.
     */

    return true;
});

//  ------------------------------------------------------------------------
//  $$isPair                    Kernel
//  ------------------------------------------------------------------------

Array.Inst.defineMethod('getIndices',
function() {

    /**
     * @method getIndices
     * @summary Returns the indices of the receiver. That is, all indices that
     *     have an actual value. This is different from getKeys() for an Array,
     *     since the results of that method also include the key 'length'.
     * @returns {Number[]} The indices of the receiver.
     */

    var keys;

    //  NB: We don't want any keys besides the ones that this object owns (not
    //  even 'length').
    keys = this.getKeys();
    keys.splice(keys.indexOf('length'), 1);

    return keys;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('vslice',
function(startIndexOrSpec, endIndex, aStep) {

    /**
     * @method vslice
     * @summary Returns a 'virtual slice' as a TP.core.Range that allows
     *     iteration over contents of the receiver.
     * @description This method can take a 'range spec' as the first argument.
     *     This range spec follows the Python syntax for 'slicing' (which has
     *     also been proposed for JavaScript):
     *     [1:3]    -> slice items 1 and 2
     *     [:3]     -> slice items 0, 1 and 2
     *     [2:]     -> slice from item 2 to the end of the Array
     *     [2:-1]   -> slice from item 2 to the second to last element
     *     [1:6:2]  -> slice from item 1 to item 5 stepping by 2
     *     [6:1:-2] -> slice from item 6 to item 2 stepping by -2 (i.e.
     *                 reversing)
     * @param {Number|String} startIndexOrSpec A Number specifying the starting
     *     index or a String containing the 'range spec' as discussed above. If
     *     this argument is null, the starting index will be set to 0.
     * @param {Number} endIndex A Number specifying the ending index. If this
     *     argument is null or undefined and the start index is not a range
     *     spec, the ending index will be set to the length of the receiver.
     * @param {Number} aStep A Number specifying the 'step' of the slice. If
     *     this argument is null or undefined and the start index is not a range
     *     spec, the step will be set to 1.
     * @example Construct an Array and vslices on that Array:
     *     <code>
     *          myArr = TP.ac(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
     *          myArr.vslice(6, 1, -2).perform(
     *          function(item) {
     *              TP.info(item);
     *          });
     *          <samp>6 4 2</samp>
     *          myArr.vslice('[2:6:2]').perform(
     *          function(item) {
     *              TP.info(item);
     *          });
     *          <samp>2 4</samp>
     *     </code>
     * @returns {TP.core.Range} The newly constructed TP.core.Range.
     */

    var rangeSpec,

        len,

        step,

        start,
        end,

        atEnd,

        swap,

        newRange;

    //  If its a String, see if we can split along ':' - at least one is
    //  required.
    if (TP.isString(startIndexOrSpec)) {
        if (TP.isEmpty(rangeSpec = startIndexOrSpec.split(':'))) {
            return null;
        }

        //  The format is 'start:end:step' - they're all optional, but we'll
        //  get at least 2 values by splitting along a single colon, which
        //  ensures that at least empty values are at 0 and 1.

        //  Make sure to strip off the leading '['
        start = rangeSpec.at(0).slice(1).asNumber();

        if (rangeSpec.getSize() > 2) {
            end = rangeSpec.at(1).asNumber();

            //  Make sure to strip off the trailing '['
            step = rangeSpec.at(2).slice(
                        0, rangeSpec.at(2).getSize() - 1).asNumber();
        } else {
            //  Make sure to strip off the trailing '['
            end = rangeSpec.at(1).slice(
                        0, rangeSpec.at(1).getSize() - 1).asNumber();
        }
    } else {
        start = startIndexOrSpec;
        end = endIndex;
        step = aStep;
    }

    //  Default step to be 1.
    if (TP.notValid(step) || TP.isNaN(step = step.asNumber())) {
        step = 1;
    }

    //  Default start to be 0 (or one off the size, if we're stepping
    //  backwards).
    if (TP.notValid(start) || TP.isNaN(start = start.asNumber())) {
        if (step.isNegative()) {
            start = this.getSize() - 1;
        } else {
            start = 0;
        }
    }

    atEnd = false;

    //  Default end to be the size (or 0, if we're stepping backwards).
    if (TP.notValid(end) || TP.isNaN(end = end.asNumber())) {
        atEnd = true;

        if (step.isNegative()) {
            end = 0;
        } else {
            end = this.getSize() - 1;
        }
    }

    len = this.getSize();

    //  Adjust for how TP.core.Ranges work.

    //  TP.core.Ranges don't support negative start indexes, but slices do,
    //  so we adjust the start and end.

    //  Normalize start and end as per Brendan's slicing proposal for a
    //  future version of JavaScript:
    //      http://wiki.ecmascript.org/doku.php?id=proposals:slice_syntax

    if (start.isNegative()) {
        start = (len + start).max(0);
    } else {
        start = start.min(len);
    }

    if (end.isNegative()) {
        end = (len + end).max(0);
    } else {
        end = end.min(len);
    }

    //  TP.core.Ranges always include the end index - slicing doesn't
    if (!atEnd) {
        if (step.isPositive()) {
            end -= 1;
        } else {
            end += 1;
        }
    }

    //  If start is greater than end (and we're not stepping negatively),
    //  swap them to make the TP.core.Range work right.
    if (start > end && !step.isNegative()) {
        swap = end;
        end = start;
        start = swap;
    }

    //  Construct the new TP.core.Range and set its 'values' to be ourself
    //  (and it will therefore iterate over our items).
    newRange = TP.core.Range.construct(start, end, step);

    return newRange;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('truncate',
function(aSize) {

    /**
     * @method truncate
     * @summary Reduces the size of the receiver to the size specified.
     * @description If the size provided is larger than the receiver the
     *     receiver is unaltered. If the size provided is negative the receiver
     *     is emptied. If no size is provided this method does nothing.
     * @param {Number} aSize The new size (if smaller than current).
     * @returns {Array} The receiver.
     * @fires Change
     */

    var size,
        len;

    size = parseInt(aSize, 10);
    len = this.length;

    if (!TP.isNumber(size)) {
        return this;
    }

    size = size.max(0);
    if (size > this.getSize()) {
        return this;
    }

    this.length = size;
    if (len !== size) {
        this.changed('length', TP.DELETE,
                        TP.hc(TP.OLDVAL, len, TP.NEWVAL, this.length));
    }

    return this;
});

//  ------------------------------------------------------------------------
//  TPCollection API
//  ------------------------------------------------------------------------

Array.Inst.defineMethod('add',
function(varargs) {

    /**
     * @method add
     * @summary Adds (appends) the argument(s) provided.
     * @param {arguments} varargs A variable list of arguments.
     * @returns {Array} The receiver.
     * @fires Change
     */

    var len;

    if (arguments.length > 0) {

        len = this.length;
        this.push.apply(this, arguments);

        this.changed('length', TP.INSERT,
                        TP.hc(TP.OLDVAL, len, TP.NEWVAL, this.length));
    }

    return this;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('addAll',
function(aCollection) {

    /**
     * @method addAll
     * @summary Adds all items from the collection as elements of the receiver.
     * @param {TPCollection} aCollection The collection to add items from.
     * @returns {Array} The receiver.
     */

    var thisref,
        len;

    len = this.length;

    thisref = this;

    if (TP.isArray(aCollection)) {
        this.push.apply(this, aCollection);
    } else {
        if (!TP.canInvoke(aCollection, 'perform')) {
            return this.raise('TP.sig.InvalidCollection');
        }

        aCollection.perform(
            function(item) {
                thisref.push(item);
            });
    }

    if (this.length !== len) {
        this.changed('length', TP.INSERT,
                        TP.hc(TP.OLDVAL, len, TP.NEWVAL, this.length));
    }

    return this;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('addAllIfAbsent',
function(aCollection) {

    /**
     * @method addAllIfAbsent
     * @summary Adds all items from the collection provided which are not
     *     currently found in the receiver.
     * @param {TPCollection} aCollection The collection to add items from.
     * @returns {Array} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('addIfAbsent',
function(anObject, aTest) {

    /**
     * @method addIfAbsent
     * @summary Adds an object to the receiver if it isn't already in the
     *     collection.
     * @description Note that the semantics of this call are slightly different
     *     between Array and Hash. In the case of Array the object is added if
     *     it isn't contained in the Array, meaning the test is against the
     *     _value_. In the case of a Hash the object (a pair) is added if the
     *     _key_ isn't found so the value itself isn't altered for existing
     *     keys.
     * @param {Object} anObject The object to add.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Array} The receiver.
     * @fires Change
     */

    if (this.contains(anObject, aTest)) {
        return this;
    }

    return this.add(anObject);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('addItem',
function(anItem) {

    /**
     * @method addItem
     * @summary Adds a single item to the receiver.
     * @description As mentioned in other contexts an item may have different
     *     properties. For an array an item is a value unless that value happens
     *     to be an ordered pair whose first element is a number. In that case
     *     the receiver works like a numerically-indexed hash and adds the
     *     last() element of anItem at the index defined by the first() element.
     * @param {Object|Pair} anItem The item to add.
     * @returns {Array} The receiver.
     * @fires Change
     */

    //  a numerically-indexed pair is considered special to this method, a
    //  way of defining a key/value pair rather than just a value.
    if (TP.isPair(anItem) && TP.isNumber(anItem.first())) {
        this.atPut(anItem.first(), anItem.last());
    } else {
        this.add(anItem);
    }

    return this;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('addWithCount',
function(anObject, aCount) {

    /**
     * @method addWithCount
     * @summary Adds the object N times, where N defaults to 0. NOTE that in
     *     the absence of a valid count the object is not added.
     * @param {Object} anObject The object to add.
     * @param {Number} aCount A number of times to add the object. Default is 0.
     * @returns {Array} The receiver.
     * @fires Change
     */

    var i,
        count,

        len;

    //  no count? no work to do
    if (TP.notValid(aCount)) {
        return this;
    }

    //  count, but not a number? won't try to convert, just warn/exit
    count = parseInt(aCount, 10);
    if (!TP.isNumber(count)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    len = this.length;

    for (i = 0; i < count; i++) {
        this.push(anObject);
    }

    if (count > 1) {
        this.changed('length', TP.INSERT,
                        TP.hc(TP.OLDVAL, len, TP.NEWVAL, this.length));
    }

    return this;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('asArray',
function() {

    /**
     * @method asArray
     * @summary Returns the receiver in Array form. For an Array instance this
     *     method simply returns the array.
     * @returns {Array} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('asHash',
function() {

    /**
     * @method asHash
     * @alias asTP_core_Hash
     * @summary Returns a hash containing the key/value pairs of the array. The
     *     indexes of this hash are the numerical indices of the receiver for
     *     which the value TP.isDefined().
     * @description The resulting hash's keys are the indices of the array from
     *     0 to array.length. Note that if the receiver is an ordered pair the
     *     result is a hash containing the key/value data from the single
     *     ordered pair.
     * @returns {TP.core.Hash} A new TP.core.Hash.
     */

    var result,
        len,
        i;

    //  Unlike the hash constructor being used to construct a Hash from an
    //  Array, we use numeric indexes from an Array as the keys
    result = TP.hc();

    len = this.length;
    for (i = 0; i < len; i++) {
        result.atPut(i, this[i]);
    }

    return result;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('asTP_core_Hash', Array.getInstPrototype().asHash);

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('asIterator',
function(aStep) {

    /**
     * @method asIterator
     * @summary Returns a new iterator on the receiver.
     * @param {Number} aStep Defines the increment size the iteration should
     *     use. The default value is 1.
     * @returns {TP.core.Iterator} The new iterator.
     */

    //  sort first because the iterator will copy our keys on init()
    this.$sortIfNeeded();

    return this.getIteratorType().construct(this, aStep);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('asObject',
function() {

    /**
     * @method asObject
     * @summary Returns a 'plain JavaScript object' version of the receiver -
     *     and makes sure that any nested content is also converted to its plain
     *     JavaScript equivalent.
     * @returns {Object} The receiver - and its content - as plain JavaScript
     *     objects.
     */

    var marker,
        len,
        obj,
        i,
        val;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asObject';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    len = this.getSize();
    obj = [];

    try {
        for (i = 0; i < len; i++) {
            val = this.at(i);

            //  Make sure to recurse so we end up with versions of all values.
            if (TP.canInvoke(val, 'asObject')) {
                val = val.asObject();
            }
            obj[i] = val;
        }
    } finally {
        delete this[marker];
    }

    return obj;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('asRange',
function() {

    /**
     * @method asRange
     * @summary Returns a new TP.core.Range based on the size of the receiver.
     * @exception TP.sig.TypeNotFound
     * @returns {TP.core.Range} The receiver as a range.
     */

    var type;

    //  TP.core.Range is an optional type, so we'll need to try to load it
    if (TP.notValid(type = TP.sys.getTypeByName('TP.core.Range'))) {
        return this.raise('TP.sig.TypeNotFound');
    }

    //  use size of array to configure the range
    return type.construct(1, this.length);
});

//  ------------------------------------------------------------------------
//  asString                    Kernel
//  ------------------------------------------------------------------------

Array.Inst.defineMethod('collapse',
function() {

    /**
     * @method collapse
     * @summary Returns the "simplest" form of the receiver possible, meaning
     *     that when the receiver has only one item that item is returned,
     *     otherwise the receiver is returned.
     * @returns {Array|Object} The receiver or its single item.
     */

    if (this.getSize() === 1) {
        return this.at(0);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  collect                     Kernel
//  ------------------------------------------------------------------------
//  collectGet                  Kernel
//  ------------------------------------------------------------------------
//  collectInvoke               Kernel
//  ------------------------------------------------------------------------
//  compact                     Kernel
//  ------------------------------------------------------------------------
//  conform                     Kernel
//  ------------------------------------------------------------------------
//  contains                    Kernel
//  ------------------------------------------------------------------------

Array.Inst.defineMethod('containsAll',
function(aCollection, aTest) {

    /**
     * @method containsAll
     * @summary Returns true if all the values in the collection provided are
     *     found in the receiver.
     * @param {TPCollection} aCollection The collection of elements all of which
     *     must be equal to at least one element in the receiver for this method
     *     to return true.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @exception TP.sig.InvalidCollection
     * @returns {Boolean} Whether or not the receiver contains all of the values
     *     in the collection provided.
     */

    var comp,
        copy,
        found;

    if (TP.isArray(aCollection)) {
        if (TP.isEmpty(aCollection)) {
            return false;
        }

        comp = aCollection.copy();
    } else {
        if (!TP.canInvoke(aCollection, 'asArray')) {
            return this.raise('TP.sig.InvalidCollection');
        }

        comp = aCollection.asArray();
        if (TP.isEmpty(comp)) {
            return false;
        }
    }

    //  we'll be sorting so let's work on a copy
    copy = this.copy();

    if (aTest === TP.IDENTITY) {
        copy.sort(TP.sort.IDENTITY);
        comp.sort(TP.sort.IDENTITY);
    } else {
        copy.sort(TP.sort.EQUALITY);
        comp.sort(TP.sort.EQUALITY);
    }

    //  iterating on the incoming data means item is what we'll be looking
    //  for in ourselves (or at least, our copy of ourselves). the first
    //  detected missing value will terminate the loop here
    found = comp.detect(
        function(item, index) {

            return !copy.contains(item, aTest);
        });

    return TP.notValid(found);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('containsAny',
function(aCollection, aTest) {

    /**
     * @method containsAny
     * @summary Returns true if any of the values in the collection provided
     *     are found in the receiver.
     * @param {TPCollection} aCollection The collection of elements any of which
     *     must be equal to any element in the receiver for this method to be
     *     true.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @exception TP.sig.InvalidCollection
     * @returns {Boolean} Whether or not the receiver contains any of the values
     *     in the collection provided.
     */

    var comp,
        copy,
        found;

    if (TP.isArray(aCollection)) {
        if (TP.isEmpty(aCollection)) {
            return false;
        }

        comp = aCollection.copy();
    } else {
        if (!TP.canInvoke(aCollection, 'asArray')) {
            return this.raise('TP.sig.InvalidCollection');
        }

        comp = aCollection.asArray();
        if (TP.isEmpty(comp)) {
            return false;
        }
    }

    //  we'll be sorting so let's work on a copy
    copy = this.copy();

    if (aTest === TP.IDENTITY) {
        copy.sort(TP.sort.IDENTITY);
        comp.sort(TP.sort.IDENTITY);
    } else {
        copy.sort(TP.sort.EQUALITY);
        comp.sort(TP.sort.EQUALITY);
    }

    //  iterating on the incoming data means item is what we'll be looking
    //  for in ourselves (or at least, our copy of ourselves). the first
    //  detected found value will terminate the loop here
    found = comp.detect(
        function(item, index) {

            return copy.contains(item, aTest);
        });

    return TP.isValid(found);
});

//  ------------------------------------------------------------------------
//  containsString              Kernel
//  ------------------------------------------------------------------------
//  convert                     Kernel
//  ------------------------------------------------------------------------

Array.Inst.defineMethod('countOf',
function(anItem, aTest) {

    /**
     * @method countOf
     * @summary Returns a count of the number of times anItem is found in the
     *     array.
     * @param {Object} anItem The element whose value is checked against.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Number} The number of occurrences of anItem.
     */

    return this.select(
        function(item, index) {

            switch (aTest) {
                case TP.IDENTITY:
                    return TP.identical(item, anItem);
                default:
                    return TP.equal(item, anItem);
            }
        }).getSize();
});

//  ------------------------------------------------------------------------
//  detect                      Kernel
//  ------------------------------------------------------------------------
//  detectInvoke                Kernel
//  ------------------------------------------------------------------------
//  detectMax                   Kernel
//  ------------------------------------------------------------------------
//  detectMin                   Kernel
//  ------------------------------------------------------------------------

Array.Inst.defineMethod('difference',
function(aCollection, aTest) {

    /**
     * @method difference
     * @summary Returns the elements contained in the receiver which are not in
     *     the collection provided.
     * @description This method can be thought of as subtracting all elements
     *     found in the collection provided from the receiver. What's left are
     *     those elements unique to the receiver.
     * @param {TPCollection} aCollection The collection to difference against
     *     the receiver.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @exception TP.sig.InvalidCollection
     * @returns {Object[]} The difference between aCollection and the receiver.
     */

    var arr;

    if (!TP.canInvoke(aCollection, 'asArray')) {
        return this.raise('TP.sig.InvalidCollection');
    }

    arr = aCollection.asArray();

    return this.select(
        function(item, index) {
            return !arr.contains(item, aTest);
        });
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('disjunction',
function(aCollection, aTest) {

    /**
     * @method disjunction
     * @summary Returns the 'symmetric difference' or those elements which are
     *     disjunct between the collections (in one or the other but not both).
     * @description This method returns a new array containing the disjunction
     *     between the receiver and aCollection. This means that only those
     *     elements which occur in one of the collections but not the other are
     *     returned.
     * @param {TPCollection} aCollection The collection to disjunct against the
     *     receiver.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Object[]} The disjunction of aCollection and the receiver.
     */

    var thisref,
        diffs;

    thisref = this;

    //  the disjunction is the combined differences so start with the one
    //  set...
    diffs = this.difference(aCollection);

    //  and provide that to a second iteration to be filled out further
    diffs = aCollection.injectInto(
                diffs,
                function(item, accum, index) {

                    if (!thisref.contains(item, aTest)) {
                        accum.push(item);
                    }

                    return accum;
                });

    return diffs;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('empty',
function() {

    /**
     * @method empty
     * @summary Empties the receiver.
     * @returns {Array} The receiver.
     * @fires Change
     */

    var len;

    len = this.length;
    this.length = 0;

    this.changed('length', TP.DELETE,
                        TP.hc(TP.OLDVAL, len, TP.NEWVAL, this.length));

    return this;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('flatten',
function() {

    /**
     * @method flatten
     * @summary Extracts embedded elements which may exist and flattens them.
     * @returns {Object[]} A new array containing the elements of the receiver
     *     in flattened form.
     */

    var result,
        len,
        i,
        it;

    result = TP.ac();

    len = this.length;
    for (i = 0; i < len; i++) {
        it = this[i];
        if (TP.isArray(it)) {
            result.addAll(it.flatten());
        } else {
            result.push(it);
        }
    }

    return result;
});

//  ------------------------------------------------------------------------
//  getItems                    Kernel
//  ------------------------------------------------------------------------

Array.Inst.defineMethod('getIterator',
function() {

    /**
     * @method getIterator
     * @summary Returns the receiver's internal iterator. If no iterator exists
     *     a new one is constructed and assigned. You shouldn't count on the
     *     iterator being at the start() when you receive it. If you need
     *     multiple iterators use asIterator().
     * @returns {TP.core.Iterator} An iterator on the receiver.
     */

    if (TP.notValid(this.$get('iterator'))) {
        this.$set('iterator', this.asIterator());
    }

    return this.$get('iterator');
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('getIteratorType',
function() {

    /**
     * @method getIteratorType
     * @summary Returns the type of iterator used for the receiver.
     * @returns {TP.core.Iterator} The type of the iterator.
     */

    var type;

    if (TP.notValid(type = TP.sys.getTypeByName('TP.core.Iterator'))) {
        return this.raise('TP.sig.TypeNotFound');
    }

    return type;
});

//  ------------------------------------------------------------------------
//  getSize                     Kernel
//  ------------------------------------------------------------------------
//  getValues                   Kernel
//  ------------------------------------------------------------------------
//  grep                        Kernel
//  ------------------------------------------------------------------------
//  groupBy                     Kernel
//  ------------------------------------------------------------------------
//  injectInto                  Kernel
//  ------------------------------------------------------------------------

Array.Inst.defineMethod('intersection',
function(aCollection, aTest) {

    /**
     * @method intersection
     * @summary Returns the intersection of the two collections.
     * @description This method returns a collection of those elements which
     *     occur in BOTH the receiver and in aCollection.
     * @param {TPCollection} aCollection The collection to intersect the
     *     receiver with.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @exception TP.sig.InvalidCollection
     * @returns {Object[]} An array of elements occurring in both.
     */

    if (!TP.canInvoke(aCollection, 'contains')) {
        return this.raise('TP.sig.InvalidCollection');
    }

    return this.select(
        function(item) {

            return aCollection.contains(item, aTest);
        });
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('isSortedCollection',
function() {

    /**
     * @method isSortedCollection
     * @summary Returns true if the receiver is behaving as a sorted
     *     collection. Effectively true any time the receiver has a valid sort
     *     function assigned.
     * @description Arrays can maintain their content in a sorted fashion so
     *     that any access of the underlying data will be against a sorted data
     *     set. This method returns true if the receiver is operating in that
     *     fashion.
     * @returns {Boolean}
     */

    return TP.isCallable(this.getSortFunction());
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('merge',
function(varargs) {

    /**
     * @method merge
     * @summary Merge the receiver's elements with elements from one or more
     *     collections. In some sense the reverse of partition, using an
     *     optional function to determine which elements of a set of collections
     *     should be grouped into pairs/triplets/quads etc.
     * @param {arguments} varargs Variable-length argument list of ordered
     *     pairs.
     * @returns {Object[]} An array containing ordered pairs (or triplets,
     *     quads, etc.) constructed from the receiver and incoming collection
     *     elements.
     */

    var arr,
        result,
        i,
        len;

    //  collections go into a new list and we go on the front so our items
    //  are first in line in the results
    arr = TP.args(arguments);
    arr.unshift(this);

    result = TP.ac();

    //  iterate on this to run the proper number of times, collecting the
    //  new content as we go. each iteration returns an array built by
    //  asking each collection in turn for the content at the current index
    len = this.length;
    for (i = 0; i < len; i++) {
        result.push(arr.collectGet(i));
    }

    return result;
});

//  ------------------------------------------------------------------------
//  partition                   Kernel
//  ------------------------------------------------------------------------
//  perform                     Kernel
//  ------------------------------------------------------------------------
//  performInvoke               Kernel
//  ------------------------------------------------------------------------
//  performSet                  Kernel
//  ------------------------------------------------------------------------
//  performUntil                Kernel
//  ------------------------------------------------------------------------
//  performWhile                Kernel
//  ------------------------------------------------------------------------
//  performWith                 Kernel
//  ------------------------------------------------------------------------
//  reject                      Kernel
//  ------------------------------------------------------------------------

Array.Inst.defineMethod('remove',
function(anItem, aTest) {

    /**
     * @method remove
     * @summary Removes a value from the receiver.
     * @description In this method, all instances of the value are removed. To
     *     remove only the first instance use 'removeFirst()'. The array is
     *     updated in place. NOTE that this method won't remove nulls so
     *     remove(null) or remove() won't work. You have to use compact so TIBET
     *     can be sure that you intended the removal and didn't get a null
     *     argument by accident, altering the receiver unintentionally.
     * @param {Object} anItem The item to be removed.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Number} The number of elements removed.
     * @fires Change
     */

    var i,
        len,
        wi,
        val,
        deleted;

    //  nothing to remove. have to use compact to remove nulls
    if (TP.notValid(anItem)) {
        return 0;
    }

    wi = 0;
    len = this.length;
    for (i = 0; i < len; i++) {
        val = this[i];
        switch (aTest) {
            case TP.IDENTITY:
                if (!TP.identical(val, anItem)) {
                    this[wi] = val;
                    wi++;
                }
                break;
            default:
                if (!TP.equal(val, anItem)) {
                    this[wi] = val;
                    wi++;
                }
                break;
        }
    }

    deleted = 0;
    if (wi < len) {
        deleted = len - wi;
        this.length = wi;

        this.changed('length', TP.DELETE,
                        TP.hc(TP.OLDVAL, len, TP.NEWVAL, this.length));
    }

    return deleted;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('removeAll',
function(aCollection, aTest) {

    /**
     * @method removeAll
     * @summary Removes the values contained in the collection from the
     *     receiver.
     * @param {TPCollection} aCollection The collection of elements that removed
     *     elements need to be equal to.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @exception TP.sig.InvalidCollection
     * @returns {Number} The number of elements removed.
     * @fires Change
     */

    var arr,
        deleted,
        thisref,

        shouldSignal,

        len;

    if (TP.isArray(aCollection)) {
        arr = aCollection;
    } else {
        if (!TP.canInvoke(aCollection, 'asArray')) {
            return this.raise('TP.sig.InvalidCollection');
        }

        arr = aCollection.asArray();
    }

    if (TP.isEmpty(arr)) {
        return 0;
    }

    deleted = 0;
    thisref = this;

    //  turn off change signaling
    shouldSignal = this.shouldSignalChange();
    this.shouldSignalChange(false);

    len = this.length;

    try {
        arr.perform(
            function(item, index) {
                deleted += thisref.remove(item, aTest);
            });
    } finally {
        //  re-enable change notification
        this.shouldSignalChange(shouldSignal);
    }

    if (deleted > 0) {
        this.changed('length', TP.DELETE,
                        TP.hc(TP.OLDVAL, len, TP.NEWVAL, this.length));
    }

    return deleted;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('replace',
function(oldValue, newValue, aTest) {

    /**
     * @method replace
     * @summary Replaces the element having the value oldValue with an element
     *     having the value newValue whereever it occurs in the receiver.
     * @param {Object} oldValue The old value to look for.
     * @param {Object} newValue The new value to replace the old value with.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Array} The receiver.
     * @fires Change
     */

    var shouldSignal,

        replaced,

        len;

    //  turn off change signaling
    shouldSignal = this.shouldSignalChange();
    this.shouldSignalChange(false);

    replaced = 0;

    len = this.length;

    try {
        this.convert(
            function(item, index) {

                switch (aTest) {
                    case TP.IDENTITY:
                        if (TP.identical(item, oldValue)) {
                            replaced++;
                            return newValue;
                        }
                        break;
                    default:
                        if (TP.equal(item, oldValue)) {
                            replaced++;
                            return newValue;
                        }
                        break;
                }

                return item;
            });
    } finally {
        //  re-enable change signaling
        this.shouldSignalChange(shouldSignal);
    }

    if (replaced > 0) {
        this.changed('length', TP.UPDATE,
                        TP.hc(TP.OLDVAL, len, TP.NEWVAL, this.length));
    }

    return replaced;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('replaceAll',
function(aCollection, newValue, aTest) {

    /**
     * @method replaceAll
     * @summary Replaces all values in aCollection with a newValue using the
     *     test provided to determine a match. The default test is TP.EQUALITY.
     * @param {TPCollection} aCollection A collection containing the elements to
     *     replace.
     * @param {Object} newValue A new value to replace objects with.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @exception TP.sig.InvalidCollection
     * @returns {Array} The receiver.
     * @fires Change
     */

    var arr,
        replaced,
        thisref,

        len,

        shouldSignal;

    if (TP.isArray(aCollection)) {
        arr = aCollection;
    } else {
        if (!TP.canInvoke(aCollection, 'asArray')) {
            return this.raise('TP.sig.InvalidCollection');
        }

        arr = aCollection.asArray();
    }

    if (TP.isEmpty(arr)) {
        return 0;
    }

    replaced = 0;
    thisref = this;

    len = this.length;

    //  turn off change signaling
    shouldSignal = this.shouldSignalChange();
    this.shouldSignalChange(false);

    try {
        arr.perform(
            function(item, index) {
                replaced += thisref.replace(item, newValue, aTest);
            });
    } finally {
        //  re-enable change notification
        this.shouldSignalChange(shouldSignal);
    }

    if (replaced > 0) {
        this.changed('length', TP.UPDATE,
                        TP.hc(TP.OLDVAL, len, TP.NEWVAL, this.length));
    }

    return replaced;
});

//  ------------------------------------------------------------------------
//  select                      Kernel
//  ------------------------------------------------------------------------

Array.Inst.defineMethod('union',
function(aCollection) {

    /**
     * @method union
     * @summary Returns a new array containing the members of both arrays.
     * @description This method computes a new array of elements, placing into
     *     it all elements from this array and all elements from aCollection.
     * @param {TPCollection} aCollection The other collection to union this
     *     array against.
     * @exception TP.sig.InvalidCollection
     * @returns {Object[]} The new array containing elements from both arrays.
     */

    var arr;

    if (!TP.canInvoke(aCollection, 'injectInto')) {
        return this.raise('TP.sig.InvalidCollection');
    }

    arr = this.copy();
    arr = aCollection.injectInto(
                arr,
                function(item, accum, index) {

                    accum.push(item);
                    return accum;
                });

    return arr;
});

//  ------------------------------------------------------------------------
//  unique                      Kernel
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  TPIndexedCollection API
//  ------------------------------------------------------------------------

Array.Inst.defineMethod('addAt',
function(anItem, anIndex) {

    /**
     * @method addAt
     * @summary Adds the value provided at anIndex. Note that this does not
     *     replace the item at that location, it splices the new value into
     *     place hence the 'add' terminology. To replace use atPut() or set().
     * @param {Object} anItem The element to add at anIndex.
     * @param {Number} anIndex The index to add anItem at.
     * @returns {Array} The receiver.
     * @fires Change
     */

    var index,
        len;

    index = parseInt(anIndex, 10);
    if (!TP.isNumber(index)) {
        return this.raise('TP.sig.InvalidIndex');
    }

    /* eslint-disable no-extra-parens */
    index = (index > 0) ? index : this.normalizeIndex(index);
    /* eslint-enable no-extra-parens */

    len = this.length;

    //  if we're not that long yet just use the sparse array indexing
    //  behavior to add the element. if data already exists at the location
    //  in question we splice the new element into place
    if (this.length < index) {
        //  primitive so we control signaling
        this[index] = anItem;
    } else {
        this.splice(index, 0, anItem);
    }

    this.changed('length', TP.INSERT,
                        TP.hc(TP.OLDVAL, len, TP.NEWVAL, this.length));

    return this;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('addAllAt',
function(aCollection, anIndex) {

    /**
     * @method addAllAt
     * @summary Adds all the elements of aCollection beginning at the index
     *     provided.
     * @param {TPCollection} aCollection The collection to add elements from.
     * @param {Number} anIndex The index to begin adding elements.
     * @exception TP.sig.InvalidCollection
     * @exception TP.sig.InvalidIndex
     * @returns {Array} The receiver.
     * @fires Change
     */

    var arr,
        index,

        len,

        tmparr;

    index = parseInt(anIndex, 10);
    if (!TP.isNumber(index)) {
        return this.raise('TP.sig.InvalidIndex');
    }

    if (TP.isArray(aCollection)) {
        arr = aCollection;
    } else {
        if (!TP.canInvoke(aCollection, 'asArray')) {
            return this.raise('TP.sig.InvalidCollection');
        }

        arr = aCollection.asArray();
    }

    tmparr = TP.ac();
    /* eslint-disable no-extra-parens */
    index = (index > 0) ? index : this.normalizeIndex(index);
    /* eslint-enable no-extra-parens */

    len = this.length;

    //  build argument array for splicing without deletion
    if (this.length < index) {
        //  work around spec's inability to support sparseness with
        //  splice()
        this[index] = '$$BOGON$$';
        tmparr.push(index, 1);
    } else {
        tmparr.push(index, 0);
    }

    //  we use apply so we 'unroll' the collection at items
    this.splice.apply(this, tmparr.addAll(arr));

    this.changed('length', TP.INSERT,
                        TP.hc(TP.OLDVAL, len, TP.NEWVAL, this.length));

    return this;
});

//  ------------------------------------------------------------------------
//  at                          Kernel
//  ------------------------------------------------------------------------

Array.Inst.defineMethod('atAll',
function(aCollection) {

    /**
     * @method atAll
     * @summary Returns an array containing the values at each of the indices
     *     provided.
     * @param {TPCollection} aCollection The collection of indexes.
     * @exception TP.sig.InvalidCollection
     * @exception TP.sig.InvalidIndex
     * @returns {Object[]} A new array containing the values collected.
     */

    var arr,
        tmparr,
        thisref;

    if (TP.isArray(aCollection)) {
        arr = aCollection;
    } else {
        if (!TP.canInvoke(aCollection, 'asArray')) {
            return this.raise('TP.sig.InvalidCollection');
        }

        arr = aCollection.asArray();
    }

    this.$sortIfNeeded();

    thisref = this;
    tmparr = TP.ac();

    arr.perform(
        function(item, index) {
            //  the at call here will normalize index
            tmparr.push(thisref.at(item));
        });

    return tmparr;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('atAllPut',
function(aCollection, anItem) {

    /**
     * @method atAllPut
     * @summary Inserts anItem at a set of locations.
     * @description Places anItem at each location in the receiver. If the
     *     optional collection is provided the indices listed in the collection
     *     are updated rather than the entire array.
     * @param {TPCollection} aCollection An optional collection specifying
     *     indexes which should be altered to contain anItem.
     * @param {Object} anItem The element to put at all the locations in this
     *     array (unless aCollection of indexes is provided).
     * @exception TP.sig.InvalidCollection
     * @returns {Array} The receiver.
     * @fires Change
     */

    var arr,
        altered,
        thisref,

        len;

    if (TP.isArray(aCollection)) {
        arr = aCollection;
    } else {
        if (!TP.canInvoke(aCollection, 'asArray')) {
            return this.raise('TP.sig.InvalidCollection');
        }

        arr = aCollection.asArray();
    }

    this.$sortIfNeeded();

    altered = 0;
    thisref = this;

    len = this.length;

    arr.perform(
        function(item, index) {
            //  only count true changes
            if (!TP.equal(thisref.at(item), anItem)) {
                altered++;
                thisref.atPut(item, anItem);
            }
        });

    if (altered > 0) {
        this.changed('length', TP.UPDATE,
                        TP.hc(TP.OLDVAL, len, TP.NEWVAL, this.length));
    }

    return this;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('atIfInvalid',
function(anIndex, aDefault) {

    /**
     * @method atIfInvalid
     * @summary Returns the value at the index provided or the default value if
     *     the key returns an invalid value.
     * @description If a Function is supplied as the default value to this
     *     method, it will be executed and its value will be returned as the
     *     value. Therefore, this method cannot be used if the Function object
     *     itself is what is desired as the returned value.
     * @param {Number} anIndex The index of the value to return.
     * @param {Object} aDefault The default value to return if undefined.
     *     Functions are executed to return their value in response.
     * @returns {Object} The element at anIndex in this collection.
     */

    var value;

    if (TP.isValid(value = this.at(anIndex))) {
        return value;
    } else if (TP.isCallable(aDefault)) {
        return aDefault();
    } else {
        return aDefault;
    }
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('atIfNull',
function(anIndex, aDefault) {

    /**
     * @method atIfNull
     * @summary Returns the value at the index provided or the default value if
     *     the key returns null (and not undefined).
     * @description If a Function is supplied as the default value to this
     *     method, it will be executed and its value will be returned as the
     *     value. Therefore, this method cannot be used if the Function object
     *     itself is what is desired as the returned value.
     * @param {Number} anIndex The index of the value to return.
     * @param {Object} aDefault The default value to return if undefined.
     *     Functions are executed to return their value in response.
     * @returns {Object} The element at anIndex in this collection.
     */

    var value;

    if (TP.notNull(value = this.at(anIndex))) {
        return value;
    } else if (TP.isCallable(aDefault)) {
        return aDefault();
    } else {
        return aDefault;
    }
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('atIfUndefined',
function(anIndex, aDefault) {

    /**
     * @method atIfUndefined
     * @summary Returns the value at the index provided or the default value if
     *     the key returns undefined.
     * @description If a Function is supplied as the default value to this
     *     method, it will be executed and its value will be returned as the
     *     value. Therefore, this method cannot be used if the Function object
     *     itself is what is desired as the returned value.
     * @param {Number} anIndex The index of the value to return.
     * @param {Object} aDefault The default value to return if undefined.
     *     Functions are executed to return their value in response.
     * @returns {Object} The element at anIndex in this collection.
     */

    var value;

    if (TP.isDefined(value = this.at(anIndex))) {
        return value;
    } else if (TP.isCallable(aDefault)) {
        return aDefault();
    } else {
        return aDefault;
    }
});

//  ------------------------------------------------------------------------
//  atPut                       Kernel
//  ------------------------------------------------------------------------

Array.Inst.defineMethod('atPutIfAbsent',
function(aKey, aValue) {

    /**
     * @method atPutIfAbsent
     * @summary Add the key and value if the key doesn't already exist. NOTE
     *     that the value isn't relevant in this test, the value may be null, or
     *     undefined, and as long at the key has been defined at some point this
     *     method will not update the value.
     * @param {Object} aKey The key to test and optionally add to the receiver.
     * @param {Object} aValue Optional value to store when the first argument is
     *     a string.
     * @exception InvalidPair
     * @returns {Object} The key's value after processing.
     * @fires Change
     */

    if (!TP.isNumber(aKey)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    if (TP.notDefined(this[aKey])) {
        this.atPut(aKey, aValue);
    }

    return this.at(aKey);
});

//  ------------------------------------------------------------------------
//  containsKey                 Kernel
//  ------------------------------------------------------------------------
//  containsValue               Kernel
//  ------------------------------------------------------------------------

Array.Inst.defineMethod('detectKeyAt',
function(aKey, anIndex) {

    /**
     * @method detectKeyAt
     * @summary Searches for the first nested element whose value at(anIndex)
     *     matches aKey. This can be a useful detection for finding data in an
     *     ordered collection (array, sorted hash, or node) by the value at a
     *     particular index or attribute location.
     * @param {String|RegExp} aKey The string or regular expression selector to
     *     match with.
     * @param {Number} anIndex The "column" index to check in each nested array.
     * @returns {Object[]} The nested array whose value at anIndex matches aKey.
     */

    var index;

    index = TP.ifInvalid(anIndex, 0);

    return this.detect(
        function(obj) {

            if (!TP.isArray(obj)) {
                return;
            }

            return TP.isValid(aKey.match(obj.at(index)));
        });
});

//  ------------------------------------------------------------------------
//  getKeys                     Kernel
//  ------------------------------------------------------------------------

Array.Inst.defineMethod('getKeysForValue',
function(aValue, aTest) {

    /**
     * @method getKeysForValue
     * @summary Returns an array containing the keys where the value matches the
     *     supplied value, according to the test.
     * @param {Object} aValue The value to check.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {String[]} An array of the keys for the supplied value.
     */

    var arr,
        i,
        val;

    arr = TP.ac();

    for (i = 0; i < this.length; i++) {

        val = this[i];

        switch (aTest) {
            case TP.IDENTITY:
                if (TP.identical(aValue, val)) {
                    arr.push(i);
                }
                break;
            default:
                if (TP.equal(aValue, val)) {
                    arr.push(i);
                }
        }
    }

    return arr;
});

//  ------------------------------------------------------------------------
//  getKVPairs                  Kernel
//  ------------------------------------------------------------------------
//  getPairs                    Kernel
//  ------------------------------------------------------------------------

Array.Inst.defineMethod('getPosition',
function(anItem, startIndex, aTest) {

    /**
     * @method getPosition
     * @summary Returns the first index of anItem in the receiver.
     * @param {Object} anItem The element to search for.
     * @param {Number} startIndex The index to start looking for anItem.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Number} The first index of an element equal to anItem.
     */

    var found;

    found = TP.NOT_FOUND;

    //  we'll use detect since that will stop once our test succeeds and
    //  will adjust for a negative index if provided for a start... it'll
    //  also sortIfNeeded()
    this.detect(
        function(item, index) {

            switch (aTest) {
                case TP.IDENTITY:
                    if (TP.identical(item, anItem)) {
                        found = index;
                        return true;
                    }
                    break;
                default:
                    if (TP.equal(item, anItem)) {
                        found = index;
                        return true;
                    }
                    break;
            }
        },
        startIndex);

    return found;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('getPositions',
function(anItem, startIndex, aTest) {

    /**
     * @method getPositions
     * @summary Returns an array containing all indexes where anItem exists.
     * @param {Object} anItem The value to search for.
     * @param {Number} startIndex The index to start looking for anItem.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Number[]} A new array of indexes.
     */

    var tmparr,
        start,
        test,
        len,
        i;

    start = TP.ifInvalid(this.normalizeIndex(startIndex), 0);

    this.$sortIfNeeded();

    tmparr = TP.ac();
    test = aTest === TP.IDENTITY ? TP.identical : TP.equal;

    len = this.length;
    for (i = start; i < len; i++) {
        if (test(this.at(i), anItem)) {
            tmparr.push(i);
        }
    }

    return tmparr;
});

//  ------------------------------------------------------------------------
//  grepKeys                    Kernel
//  ------------------------------------------------------------------------
//  performOver                 Kernel
//  ------------------------------------------------------------------------

Array.Inst.defineMethod('pad',
function(places, padContent, appendIndex) {

    /**
     * @method pad
     * @summary Pads the receiver out to the number of places supplied
     * @param {Number} numPlaces The number of places to pad the receiver out
     *     to.
     * @param {Object} padContent The content to put into each padded place.
     * @param {Boolean} [appendIndex=false] Whether or not to append each index
     *     onto the padding content as it is filled out.
     * @returns {Array} The receiver.
     * @fires Change
     */

    var startIndex,
        len,

        i;

    //  If we've already got the number of places supplied, then just exit.
    if (this.length >= places) {
        return this;
    }

    startIndex = this.length;
    len = places - this.length;

    //  Iterate over the padding indexes, placing the padding content into each
    //  one.
    for (i = startIndex; i < startIndex + len; i++) {
        if (appendIndex) {
            this.atPut(i, padContent + '_' + i);
        } else {
            this.atPut(i, padContent);
        }
    }

    this.changed('length', TP.DELETE,
                        TP.hc(TP.OLDVAL, len, TP.NEWVAL, this.length));

    return this;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('removeAt',
function(anIndex) {

    /**
     * @method removeAt
     * @summary Removes the element at the index provided.
     * @param {Number} anIndex The index at which to remove the element.
     * @exception TP.sig.InvalidIndex
     * @returns {Array} The receiver.
     * @fires Change
     */

    var index,

        len;

    index = parseInt(anIndex, 10);
    if (!TP.isNumber(index)) {
        return this.raise('TP.sig.InvalidIndex');
    }

    this.$sortIfNeeded();

    /* eslint-disable no-extra-parens */
    index = (index > 0) ? index : this.normalizeIndex(index);
    /* eslint-enable no-extra-parens */

    len = this.length;

    this.splice(index, 1);

    this.changed('length', TP.DELETE,
                        TP.hc(TP.OLDVAL, len, TP.NEWVAL, this.length));

    return this;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('removeAtAll',
function(aCollection) {

    /**
     * @method removeAtAll
     * @summary Removes the elements at the indexes (keys) contained in the
     *     collection provided. Upon completion the remaining elements are
     *     shifted into new positions.
     * @param {TPCollection} aCollection The collection of indexes. TP.EQUALITY.
     * @exception TP.sig.InvalidCollection
     * @returns {Array} The receiver.
     * @fires Change
     */

    var arr,
        deleted,
        thisref,

        len;

    deleted = 0;
    thisref = this;

    if (TP.isArray(aCollection)) {
        //  we'll be sorting, so make a copy
        arr = aCollection.copy();
    } else {
        if (!TP.canInvoke(aCollection, 'asArray')) {
            return this.raise('TP.sig.InvalidCollection');
        }

        arr = aCollection.asArray();
    }

    if (TP.isEmpty(arr)) {
        return this;
    }

    //  sort the indexes so we can process them in order
    arr.sort();

    len = this.length;

    arr.perform(
        function(index) {
            thisref.splice(thisref.normalizeIndex(index) - deleted, 1);
            deleted++;
        });

    if (deleted > 0) {
        this.changed('length', TP.DELETE,
                        TP.hc(TP.OLDVAL, len, TP.NEWVAL, this.length));
    }

    return this;
});

//  ------------------------------------------------------------------------
//  removeKey                   Kernel
//  ------------------------------------------------------------------------
//  removeKeys                  Kernel
//  ------------------------------------------------------------------------

Array.Inst.defineMethod('transpose',
function() {

    /**
     * @method transpose
     * @summary Transposes the rows and columns of an array whose elements are
     *     other arrays. For example, [[1,2],[3,4],[5,6]] becomes an array
     *     containing [[1,3,5],[2,4,6]].
     * @returns {Object[]} An array containing ordered pairs (or triplets,
     *     quads, etc.) constructed from the receiver and incoming collection
     *     elements.
     */

    var items,
        first;

    //  items is our current "row set"
    items = this.getItems();

    //  peel off the first one so we have a starting array to work with
    first = items.shift();

    //  ask it to merge, which will splice the elements (columns) together
    //  but use apply here so items "unrolls" into an argument list
    return first.merge.apply(first, items);
});

//  ------------------------------------------------------------------------
//  TPOrderedCollection API
//  ------------------------------------------------------------------------

Array.Inst.defineMethod('addAfter',
function(aValue, anItem, aTest) {

    /**
     * @method addAfter
     * @summary Adds the value provided after the element provided.
     * @param {Object} aValue The value to add after anItem.
     * @param {Object} anItem The item located to define the index.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @exception NotFound
     * @returns {Array} The receiver.
     * @fires Change
     */

    var ind;

    ind = this.getPosition(anItem, 0, aTest);
    if (ind === TP.NOT_FOUND) {
        return this.raise('TP.sig.NotFound');
    }

    return this.addAt(aValue, ind + 1);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('addAllAfter',
function(aCollection, anItem, aTest) {

    /**
     * @method addAllAfter
     * @summary Adds the collection of elements after the element provided.
     * @param {TPCollection} aCollection The collection containing the elements
     *     to add after aValue.
     * @param {Object} anItem The element used to locate the index for the
     *     addition.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @exception NotFound
     * @returns {Array} The receiver.
     * @fires Change
     */

    var ind;

    ind = this.getPosition(anItem, 0, aTest);
    if (ind === TP.NOT_FOUND) {
        return this.raise('TP.sig.NotFound');
    }

    return this.addAllAt(aCollection, ind + 1);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('addAllBefore',
function(aCollection, anItem, aTest) {

    /**
     * @method addAllBefore
     * @summary Adds the collection of elements before the element equal to the
     *     value provided.
     * @param {TPCollection} aCollection The collection containing the elements
     *     to add before aValue.
     * @param {Object} anItem The element used to locate the insertion index.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @exception NotFound
     * @returns {Array} The receiver.
     * @fires Change
     */

    var ind;

    ind = this.getPosition(anItem, 0, aTest);
    if (ind === TP.NOT_FOUND) {
        return this.raise('TP.sig.NotFound');
    }

    return this.addAllAt(aCollection, ind);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('addAllFirst',
function(aCollection) {

    /**
     * @method addAllFirst
     * @summary Adds the elements of the collection at the start of the array.
     * @param {TPCollection} aCollection The collection containing the elements
     *     to prepend.
     * @returns {Array} The receiver.
     * @fires Change
     */

    return this.addAllAt(aCollection, 0);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('addAllLast',
function(aCollection) {

    /**
     * @method addAllLast
     * @summary Appends the elements of the collection to the receiver.
     * @param {TPCollection} aCollection The collection containing the elements
     *     to append.
     * @returns {Array} The receiver.
     * @fires Change
     */

    return this.addAllAt(aCollection, this.length);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('addBefore',
function(aValue, anItem, aTest) {

    /**
     * @method addBefore
     * @summary Adds aValue prior to the first occurrence of anItem
     * @param {Object} aValue The value to add before the search element.
     * @param {Object} anItem The element used to locate the insertion point.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @exception NotFound
     * @returns {Array} The receiver.
     * @fires Change
     */

    var ind;

    ind = this.getPosition(anItem, 0, aTest);
    if (ind === TP.NOT_FOUND) {
        return this.raise('TP.sig.NotFound');
    }

    return this.addAt(aValue, ind);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('addFirst',
function(varargs) {

    /**
     * @method addFirst
     * @summary Adds the values provided to the start of the receiver.
     * @param {arguments} varargs A variable list of arguments.
     * @returns {Array} The receiver.
     * @fires Change
     */

    var len;

    if (arguments.length > 0) {

        len = this.length;
        this.unshift.apply(this, arguments);

        this.changed('length', TP.INSERT,
                        TP.hc(TP.OLDVAL, len, TP.NEWVAL, this.length));
    }

});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('addLast',
function(varargs) {

    /**
     * @method addLast
     * @summary Appends the values provided to the end of the receiver.
     * @param {arguments} varargs A variable list of arguments.
     * @returns {Array} The receiver.
     * @fires Change
     */

    var len;

    if (arguments.length > 0) {

        len = this.length;
        this.push.apply(this, arguments);

        this.changed('length', TP.INSERT,
                        TP.hc(TP.OLDVAL, len, TP.NEWVAL, this.length));
    }

    return this;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('after',
function(anItem, aTest) {

    /**
     * @method after
     * @summary Returns the element, if any, after the element provided.
     * @param {Object} anItem The item to search for.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @exception NotFound
     * @returns {Object} An object or undefined.
     */

    var ind;

    ind = this.getPosition(anItem, 0, aTest);
    if (ind === TP.NOT_FOUND) {
        return;
    }

    return this.at(ind + 1);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('before',
function(anItem, aTest) {

    /**
     * @method before
     * @summary Returns the element, if any, before the element provided.
     * @param {Object} anItem The item to search for.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @exception NotFound
     * @returns {Object} An object or undefined.
     */

    var ind;

    ind = this.getPosition(anItem, 0, aTest);
    if (ind === TP.NOT_FOUND || ind === 0) {
        return;
    }

    return this.at(ind - 1);
});

//  ------------------------------------------------------------------------
//  first                       Kernel
//  ------------------------------------------------------------------------

Array.Inst.defineMethod('getLastPosition',
function(anItem, startIndex, aTest) {

    /**
     * @method getLastPosition
     * @summary Returns the last index of anItem in the receiver.
     * @param {Object} anItem The item to search for.
     * @param {Number} startIndex What index should search "start" from keeping
     *     in mind that we're working backwards so this will be the "last" index
     *     that is checked.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Number} The last index of the element equal to anItem.
     */

    var found,
        item,
        i,
        len,
        test;

    found = TP.NOT_FOUND;

    test = aTest === TP.IDENTITY ? TP.identical : TP.equal;

    len = this.getSize();
    for (i = len - 1; i >= 0; i--) {
        item = this.at(i);
        if (test(item, anItem)) {
            found = i;
            break;
        }
    }

    return found;
});

//  ------------------------------------------------------------------------
//  last                        Kernel
//  ------------------------------------------------------------------------
//  orderedBy                   Kernel
//  ------------------------------------------------------------------------

Array.Inst.defineMethod('removeFirst',
function(anItem, aTest) {

    /**
     * @method removeFirst
     * @summary Removes the first occurrence of anItem in the receiver.
     * @param {Object} anItem The item to remove.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Array} The receiver.
     * @fires Change
     */

    var ind,

        len;

    ind = this.getPosition(anItem, 0, aTest);
    if (ind !== TP.NOT_FOUND) {

        len = this.length;

        this.splice(ind, 1);

        this.changed('length', TP.DELETE,
                        TP.hc(TP.OLDVAL, len, TP.NEWVAL, this.length));
    }

    return this;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('removeLast',
function(anItem, aTest) {

    /**
     * @method removeLast
     * @summary Removes the last occurrence of anItem in the receiver, or the
     *     last element if no specific element is provided.
     * @param {Object} anItem The item to remove.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Array} The receiver.
     * @fires Change
     */

    var len,

        ind;

    len = this.length;

    if (TP.notValid(anItem)) {
        this.length = this.length - 1;

        this.changed('value', TP.DELETE,
                        TP.hc(TP.OLDVAL, len, TP.NEWVAL, this.length));
    } else {
        ind = this.getLastPosition(anItem, this.getSize(), aTest);

        if (ind !== TP.NOT_FOUND) {
            this.splice(ind, 1);

            this.changed('value', TP.DELETE,
                        TP.hc(TP.OLDVAL, len, TP.NEWVAL, this.length));
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('replaceFirst',
function(oldValue, newValue, aTest) {

    /**
     * @method replaceFirst
     * @summary Replaces the first element having the value oldValue with an
     *     element having the value newValue.
     * @param {Object} oldValue The old value to look for.
     * @param {Object} newValue The new value to replace the old value with.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Array} The receiver.
     * @fires Change
     */

    var index;

    index = this.getPosition(oldValue, 0, aTest);
    if (index === TP.NOT_FOUND) {
        return this;
    }

    this.atPut(index, newValue);

    return this;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('replaceLast',
function(oldValue, newValue, aTest) {

    /**
     * @method replaceLast
     * @summary Replaces the last element having the value oldValue with an
     *     element having the value newValue.
     * @param {Object} oldValue The old value to look for.
     * @param {Object} newValue The new value to replace the old value with.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Array} The receiver.
     * @fires Change
     */

    var index;

    index = this.getLastPosition(oldValue, aTest);
    if (index === TP.NOT_FOUND) {
        return this;
    }

    this.atPut(index, newValue);

    return this;
});

//  ------------------------------------------------------------------------
//  reverse                     built-in
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  TPSortedCollection
//  ------------------------------------------------------------------------

Array.Inst.defineMethod('getSortFunction',
function() {

    /**
     * @method getSortFunction
     * @summary Returns the current sort function or null.
     * @returns {Function} This array's sort function.
     */

    return this.sortFunction;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('isSorted',
function() {

    /**
     * @method isSorted
     * @summary Returns true if the receiver is sorted.
     * @returns {Boolean}
     */

    return !this.$needsSort;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('setSortFunction',
function(aFunction) {

    /**
     * @method setSortFunction
     * @summary Sets the receiver's internal sort function.
     * @description This function will be called any time the receiver has been
     *     updated without being sorted and a request for a value is made. This
     *     method will flag the receiver so that a re-sort will occur on the
     *     next data access call.
     * @param {Function} aFunction The function to set this array's sort
     *     function to.
     * @exception TP.sig.InvalidFunction
     * @returns {Array} The receiver.
     * @fires Change
     */

    //  no change? don't waste time
    if (TP.identical(aFunction, this.sortFunction)) {
        return this;
    }

    this.sortFunction = aFunction;
    this.$firstSort = true;

    //  notify, since our order will be different for consumers
    this.changed('order', TP.SORTED);

    return this;
});

//  ------------------------------------------------------------------------
//  sort                        built-in
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Math
//  ------------------------------------------------------------------------

Array.Inst.defineMethod('avg',
function() {

    /**
     * @method avg
     * @summary Returns the average value from an array of numbers. This is
     *     equivalent to sum()/getSize();
     * @returns {Number} The average of numeric values in the receiver.
     */

    return this.sum() / this.getSize();
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('max',
function() {

    /**
     * @method max
     * @summary Returns the numerical maximum value from the receiver.
     * @returns {Number} The highest value number in the receiver.
     */

    return this.detectMax(TP.RETURN_ARG0);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('min',
function() {

    /**
     * @method min
     * @summary Returns the numerical minimum value from the receiver.
     * @returns {Number} The lowest value number in the receiver.
     */

    return this.detectMin(TP.RETURN_ARG0);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('sum',
function() {

    /**
     * @method sum
     * @summary Adds the numeric values in the receiver to produce a sum.
     * @returns {Number} The sum of all numeric values in the receiver.
     */

    var sum;

    sum = 0;
    sum = this.injectInto(
        sum,
        function(item, accum, index) {

            var num;

            num = parseInt(item, 10);
            if (TP.isNumber(num)) {
                return accum + num;
            }

            return accum;
        });

    return sum;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('times',
function(aCount, inline) {

    /**
     * @method times
     * @summary Expands the receiver's content multiple times. For example, an
     *     array containing 1,2,3 * 3 becomes 1,2,3,1,2,3,1,2,3.
     * @param {Number} aCount The number of times to duplicate the receiver's
     *     content.
     * @param {Boolean} inline False to construct a new instance, otherwise the
     *     receiver is modified.
     * @returns {Array|Object[]} The receiver, or a new instance if inline is
     *     false.
     */

    var arr,
        dat;

    if (aCount < 2) {
        return TP.isFalse(inline) ? this.copy() : this;
    }

    /* eslint-disable consistent-this */
    if (TP.isFalse(inline)) {
        dat = this;
        arr = this.copy();
    } else {
        dat = this.copy();
        arr = this;
    }
    /* eslint-enable consistent-this */

    (aCount - 1).perform(
            function() {
                arr.addAll(dat);
            });

    return arr;
});

//  ========================================================================
//  Object Extensions
//  ========================================================================

/**
 * @type {Object}
 * @summary Collection API extensions for Object.
 * @description Because of the problems associated with keeping a clear
 *     distinction between keys which are "content" and keys which are
 *     "properties" we _STRONGLY_ discourage using Objects as hashes. But for
 *     polymorphic reasons we add a few methods in the kernel so if you get an
 *     Object rather than a TP.core.Hash once in a while it hopefully won't
 *     cause everything to break.
 * @subject Collection Extensions
 */

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.defineCommonMethod('collapse',
function() {

    /**
     * @method collapse
     * @summary Returns the receiver.
     * @description This method is defined purely for polymorphic reasons so
     *     that the system can just send 'collapse' to any object. For Arrays
     *     and other collections, the first item is returned.
     * @returns {Object} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('asHash',
function() {

    /**
     * @method asHash
     * @summary Returns the receiver as a suitable hash.
     * @returns {TP.core.Hash} The receiver as a TP.core.Hash.
     */

    var dict;

    dict = TP.hc();

    this.perform(
        function(item, index) {
            dict.atPut(item.first(), item.last(), false);
        });

    return dict;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('removeKey',
function(aKey) {

    /**
     * @method removeKey
     * @summary Removes the key provided if the collection contains it. Note
     *     that this won't remove a key if the key references a method.
     * @param {Object} aKey The key value to remove.
     * @exception TP.sig.InvalidParameter
     * @returns {Object|undefined} The receiver.
     * @fires Change
     */

    var k;

    if (TP.notValid(aKey)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    k = this.at(aKey);
    if (TP.notDefined(k)) {
        return;
    }

    if (TP.isMethod(k)) {
        return this.raise('TP.sig.InvalidOperation',
            'Attempt to replace/remove method: ' + k);
    }

    delete this[aKey];

    this.changed('value', TP.DELETE);

    return this;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('removeKeys',
function(aKeyArray) {

    /**
     * @method removeKeys
     * @summary Removes the keys provided if the collection contains them. Note
     *     that this won't remove a key if the key references a method.
     * @param {Object[]} aKeyArray The key values to remove.
     * @exception TP.sig.InvalidParameter
     * @returns {Object} The receiver.
     * @fires Change
     */

    var changed,
        len,
        i,
        key,
        slot;

    if (TP.notValid(aKeyArray)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    changed = false;

    len = aKeyArray.getSize();
    for (i = 0; i < len; i++) {
        key = aKeyArray.at(i);
        slot = this.at(key);

        if (TP.notDefined(slot)) {
            continue;
        }

        if (TP.isMethod(slot)) {
            this.raise('TP.sig.InvalidOperation',
                'Attempt to replace/remove method: ' + slot);
            break;
        }

        changed = true;
        delete this[key];
    }

    if (changed) {
        this.changed('value', TP.DELETE);
    }

    return this;
});

//  ========================================================================
//  Number Extensions
//  ========================================================================

/**
 * @type {Number}
 * @summary Extensions to Number for collection-related behavior.
 */

//  ------------------------------------------------------------------------
//  Type Definition
//  ------------------------------------------------------------------------

//  don't let numbers get treated like collections unless you want add(123)
//  to result in [1,2,3].
TP.backstop(['asIterator'], TP.NumberProto);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

Number.Inst.defineMethod('asRange',
function(startIndex, aStep) {

    /**
     * @method asRange
     * @summary Returns a TP.core.Range from startIndex to the receiver by
     *     step.
     * @param {Number} startIndex What index should begin the range. The default
     *     is 0.
     * @param {Number} aStep What step should we use? The default is 1.
     * @returns {TP.core.Range}
     */

    var step,
        start;

    start = TP.ifInvalid(this.normalizeIndex(startIndex), 0);
    step = TP.ifInvalid(aStep, 1);

    /* eslint-disable no-extra-parens */
    return (start).to(this).by(step);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('getItems',
function() {

    /**
     * @method getItems
     * @summary Returns the "values" of the receiver, in this case a
     *     TP.core.Range representing those values suitable for iteration.
     * @returns {TP.core.Range} A range from 0 to N where N is the value of the
     *     receiver.
     */

    return this.asRange();
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('getPosition',
function(aValue) {

    /**
     * @method getPosition
     * @summary Returns the first index of the element provided or undefined if
     *     the element isn't found.
     * @description For numbers this is a bit of a strange concept but it tends
     *     to get invoked when dealing with numerical keys in hashes.
     * @param {Object} aValue What to search for.
     * @returns {Number} The index of the value or undefined.
     */

    return this.toString().getPosition(aValue);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('times',
function(anObject) {

    /**
     * @method times
     * @summary Performs an operation the number of times defined by the
     *     receiver, for example (10).times(x) will process 'x' ten times.
     * @description The return value of this method will vary based on what type
     *     of object was provided. When a string is passed the return value is
     *     that string's value concatenated that number of times. When a
     *     function is passed this method works like perform() to run the
     *     function a number of times.
     * @param {Object} anObject The object to "multiply".
     * @returns {Object} See the 'discussion' above.
     */

    var count;

    if (TP.notValid(anObject)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  obvious one is math
    count = parseInt(anObject, 10);
    if (TP.isNumber(count)) {
        return this * count;
    }

    //  function? do a perform then
    if (TP.isCallable(anObject)) {
        return this.perform(anObject);
    }

    //  less obvious is do "double dispatch" here and let the type handle it
    if (TP.canInvoke(anObject, 'times')) {
        return anObject.times(this);
    }

    //  not sure what else to do here, just return as if multiplied by 1
    return this;
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('to',
function(endIndex) {

    /**
     * @method to
     * @summary Constructs a range from the receiver to the number provided.
     * @param {Number} endIndex A numerical index for the end of the range.
     * @exception TP.sig.TypeNotFound
     * @returns {TP.core.Range} A newly constructed TP.core.Range.
     */

    var type;

    if (TP.notValid(type = TP.sys.getTypeByName('TP.core.Range'))) {
        return this.raise('TP.sig.TypeNotFound');
    }

    return type.construct(this, endIndex);
});

//  ========================================================================
//  String Extensions
//  ========================================================================

/**
 * @type {String}
 * @summary Extensions allowing strings to perform more powerful operations.
 *     NOTE that we don't implement any of the mutation methods since native
 *     String types aren't mutable.
 * @subject Collection Extensions
 */

//  ------------------------------------------------------------------------

String.Inst.defineMethod('$$isPair',
function() {

    /**
     * @method $$isPair
     * @summary Returns true if the receiver can be thought of as an ordered
     *     pair. Strings are never considered ordered pairs.
     * @returns {Boolean} Whether or not the receiver is considered to be an
     *     ordered pair. For Strings, this is always false.
     */

    return false;
});

//  ------------------------------------------------------------------------
//  TPCollection
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  add                         Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  addAll                      Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  addAllIfAbsent              Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  addIfAbsent                 Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  addItem                     Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  addWithCount                Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  asArray                     Kernel
//  ------------------------------------------------------------------------

String.Inst.defineMethod('asHash',
function() {

    /**
     * @method asHash
     * @summary Returns the receiver as a TP.core.Hash.
     * @returns {TP.core.Hash} The receiver converted into a TP.core.Hash.
     */

    var str;

    //  Make sure to '.toString()' this to get the primitive value.
    str = this.toString();

    if (TP.isJSONString(str)) {
        return TP.json2js(str);
    } else {
        return TP.hc('value', str);
    }
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asIterator',
function(aStep) {

    /**
     * @method asIterator
     * @summary Returns a new iterator on the receiver.
     * @param {Number} aStep Defines the increment size the iteration should
     *     use. The default value is 1.
     * @returns {TP.core.Iterator} The new iterator.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asRange',
function() {

    /**
     * @method asRange
     * @summary Returns a new TP.core.Range based on the size of the receiver.
     * @exception TP.sig.TypeNotFound
     * @returns {TP.core.Range} The receiver as a range.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------
//  asString                    Kernel
//  ------------------------------------------------------------------------

String.Inst.defineMethod('collapse',
function() {

    /**
     * @method collapse
     * @summary Returns the "simplest" form of the receiver possible, meaning
     *     that when the receiver has only one item that item is returned,
     *     otherwise the receiver is returned.
     * @returns {String|Object|null} The receiver or its single item or null if
     *     empty.
     */

    if (this.getSize() === 1) {
        return this.charAt(0);
    }

    if (TP.isEmpty(this)) {
        return null;
    }

    return this;
});

//  ------------------------------------------------------------------------
//  collect                     Kernel
//  ------------------------------------------------------------------------
//  collectGet                  Kernel
//  ------------------------------------------------------------------------
//  collectInvoke               Kernel
//  ------------------------------------------------------------------------
//  compact                     Kernel
//  ------------------------------------------------------------------------
//  conform                     Kernel
//  ------------------------------------------------------------------------

String.Inst.defineMethod('contains',
function(aValue) {

    /**
     * @method contains
     * @summary Returns true if the receiver contains the value.
     * @param {String} aValue The value that at least one element in the
     *     receiver should be equal to for this method to return true.
     * @returns {Boolean} Whether or not the receiver contains the value
     *     provided.
     */

    return this.indexOf(aValue) !== TP.NOT_FOUND;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('containsAll',
function(aCollection) {

    /**
     * @method containsAll
     * @summary Returns true if all the values in the collection provided are
     *     found in the receiver.
     * @param {TPCollection} aCollection The collection of elements all of which
     *     must be equal to at least one element in the receiver for this method
     *     to return true.
     * @exception TP.sig.InvalidCollection
     * @returns {Boolean} Whether or not the receiver contains all of the values
     *     in the collection provided.
     */

    var arr,
        found,
        thisref;

    if (TP.isArray(aCollection)) {
        arr = aCollection;
    } else {
        if (!TP.canInvoke(aCollection, 'asArray')) {
            return this.raise('TP.sig.InvalidCollection');
        }

        arr = aCollection.asArray();
    }

    if (TP.isEmpty(arr)) {
        return false;
    }

    thisref = this;

    found = arr.detect(
        function(item, index) {

            return TP.notTrue(thisref.contains(item));
        });

    //  if we found a "failed" element then no, we don't
    return TP.notValid(found);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('containsAny',
function(aCollection) {

    /**
     * @method containsAny
     * @summary Returns true if any of the values in the collection provided
     *     are found in the receiver.
     * @param {TPCollection} aCollection The collection of elements any of which
     *     must be equal to any element in the receiver for this method to be
     *     true.
     * @exception TP.sig.InvalidCollection
     * @returns {Boolean} Whether or not the receiver contains any of the values
     *     in the collection provided.
     */

    var arr,
        found,
        thisref;

    if (TP.isArray(aCollection)) {
        arr = aCollection;
    } else {
        if (!TP.canInvoke(aCollection, 'asArray')) {
            return this.raise('TP.sig.InvalidCollection');
        }

        arr = aCollection.asArray();
    }

    if (TP.isEmpty(arr)) {
        return false;
    }

    thisref = this;

    found = arr.detect(
        function(item, index) {

            return thisref.contains(item);
        });

    return TP.isValid(found);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('containsString',
function(aValue) {

    /**
     * @method containsString
     * @summary Returns true if the receiver contains the string provided.
     * @param {String} aValue The value that at least one element in the
     *     receiver should be equal to for this method to return true.
     * @returns {Boolean} Whether or not the receiver contains the String
     *     provided.
     */

    return this.indexOf(aValue) !== TP.NOT_FOUND;
});

//  ------------------------------------------------------------------------
//  convert                     Mutator - not implemented for String
//  ------------------------------------------------------------------------

String.Inst.defineMethod('countOf',
function(aValue, aTest) {

    /**
     * @method countOf
     * @summary Returns a count of the number of times aValue is found in the
     *     string.
     * @param {String} aValue The value that elements in the string must be
     *     equal to to be counted.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Number} The number of occurrences of aValue.
     */

    return this.getPositions(aValue).getSize();
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('detect',
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
        c;

    start = TP.ifInvalid(this.normalizeIndex(startIndex), 0);

    retval = undefined;

    len = this.length;
    for (i = start; i < len; i++) {
        c = this.charAt(i);
        if (aFunction(c, i)) {
            retval = c;
            break;
        }
    }

    return retval;
});

//  ------------------------------------------------------------------------
//  detectInvoke                Kernel
//  ------------------------------------------------------------------------
//  detectMax                   Kernel
//  ------------------------------------------------------------------------
//  detectMin                   Kernel
//  ------------------------------------------------------------------------

String.Inst.defineMethod('difference',
function(aCollection, aTest) {

    /**
     * @method difference
     * @summary Returns the elements contained in the receiver which are not in
     *     the collection provided.
     * @description This method can be thought of as subtracting all elements
     *     found in the collection provided from the receiver. What's left are
     *     those elements unique to the receiver.
     * @param {TPCollection} aCollection The collection to difference against
     *     the receiver.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @exception TP.sig.InvalidCollection
     * @returns {String} The difference between aCollection and the receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('disjunction',
function(aCollection, aTest) {

    /**
     * @method disjunction
     * @summary Returns the 'symmetric difference' or those elements which are
     *     disjunct between the two collections.
     * @description This method returns a new string containing the disjunction
     *     between the receiver and aCollection. This means that only those
     *     characters which occur in one of the collections but not the other
     *     are returned.
     * @param {TPCollection} aCollection The collection to disjunct against the
     *     receiver.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {String} The disjunction of aCollection and the receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------
//  empty                       Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  flatten                     Kernel
//  ------------------------------------------------------------------------

String.Inst.defineMethod('getIterator',
function() {

    /**
     * @method getIterator
     * @summary Returns the receiver's internal iterator. If no iterator exists
     *     a new one is constructed and assigned. You shouldn't count on the
     *     iterator being at the start() when you receive it. If you need
     *     multiple iterators use asIterator().
     * @returns {TP.core.Iterator} An iterator on the receiver.
     */

    if (TP.notValid(this.$get('iterator'))) {
        this.$set('iterator', this.asIterator());
    }

    return this.$get('iterator');
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('getIteratorType',
function() {

    /**
     * @method getIteratorType
     * @summary Returns the type of iterator used for the receiver.
     * @returns {TP.core.Iterator} The type of the iterator.
     */

    var type;

    if (TP.notValid(type = TP.sys.getTypeByName('TP.core.Iterator'))) {
        return this.raise('TP.sig.TypeNotFound');
    }

    return type;
});

//  ------------------------------------------------------------------------
//  getSize                     Kernel
//  ------------------------------------------------------------------------
//  getValues                   Kernel
//  ------------------------------------------------------------------------
//  grep                        Kernel
//  ------------------------------------------------------------------------
//  groupBy                     Kernel
//  ------------------------------------------------------------------------
//  injectInto                  Kernel
//  ------------------------------------------------------------------------

String.Inst.defineMethod('intersection',
function(aCollection) {

    /**
     * @method intersection
     * @summary Returns the intersection of the two collections.
     * @description This method returns a collection of those elements which
     *     occur in BOTH the receiver and in aCollection.
     * @param {TPCollection} aCollection The collection to intersect the
     *     receiver with.
     * @exception TP.sig.InvalidCollection
     * @returns {Object[]} An array of elements occurring in both.
     */

    if (!TP.canInvoke(aCollection, 'contains')) {
        return this.raise('TP.sig.InvalidCollection');
    }

    return this.select(
        function(item) {

            return aCollection.contains(item);
        });
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('isSortedCollection',
function() {

    /**
     * @method isSortedCollection
     * @summary Returns true if the receiver is a sorted collection. String
     *     subtypes are NOT sorted.
     * @returns {Boolean} Always false.
     */

    return false;
});

//  ------------------------------------------------------------------------
//  merge                       Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  partition                   Kernel
//  ------------------------------------------------------------------------
//  perform                     Kernel
//  ------------------------------------------------------------------------
//  performInvoke               Kernel
//  ------------------------------------------------------------------------
//  performSet                  Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  performUntil                Kernel
//  ------------------------------------------------------------------------
//  performWhile                Kernel
//  ------------------------------------------------------------------------
//  performWith                 Kernel
//  ------------------------------------------------------------------------
//  reject                      Kernel
//  ------------------------------------------------------------------------
//  remove                      Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  removeAll                   Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  replace                     Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  replaceAll                  Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  select                      Kernel
//  ------------------------------------------------------------------------

String.Inst.defineMethod('union',
function(aCollection) {

    /**
     * @method union
     * @summary Returns a new string containing the members of both strings.
     * @description This method computes a new string of characters, placing
     *     into it all characters from this string and all elements from
     *     aCollection.
     * @param {TPCollection} aCollection The other collection to union this
     *     string against.
     * @exception TP.sig.InvalidCollection
     * @returns {Object[]} The new string containing elements from both
     *     collections.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------
//  unique                      Mutator - not implemented for String
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  TPIndexedCollection
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  addAt                       Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  addAllAt                    Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  at                          Kernel
//  ------------------------------------------------------------------------

String.Inst.defineMethod('atAll',
function(aCollection) {

    /**
     * @method atAll
     * @summary Returns a new collection containing the characters in the
     *     receiver at the various indexes contained in the collection provided.
     * @param {TPCollection} aCollection The collection of numeric indices to
     *     use.
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.InvalidCollection
     * @returns {String[]} An array of zero or more items.
     */

    return this.split('').atAll(aCollection);
});

//  ------------------------------------------------------------------------
//  atAllPut                    Mutator - not implemented for String
//  ------------------------------------------------------------------------

String.Inst.defineMethod('atIfInvalid',
function(anIndex, aDefault) {

    /**
     * @method atIfInvalid
     * @summary Returns the value at the index provided or the default value if
     *     the key returns an invalid value.
     * @description If a Function is supplied as the default value to this
     *     method, it will be executed and its value will be returned as the
     *     value. Therefore, this method cannot be used if the Function object
     *     itself is what is desired as the returned value.
     * @param {Number} anIndex The index of the value to return.
     * @param {Object} aDefault The default value to return if undefined.
     *     Functions are executed to return their value in response.
     * @returns {Object} The element at anIndex in this collection.
     */

    var value;

    if (TP.isValid(value = this.at(anIndex))) {
        return value;
    } else if (TP.isCallable(aDefault)) {
        return aDefault();
    } else {
        return aDefault;
    }
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('atIfNull',
function(anIndex, aDefault) {

    /**
     * @method atIfNull
     * @summary Returns the value at the index provided or the default value if
     *     the key returns null (and not undefined).
     * @description If a Function is supplied as the default value to this
     *     method, it will be executed and its value will be returned as the
     *     value. Therefore, this method cannot be used if the Function object
     *     itself is what is desired as the returned value.
     * @param {Number} anIndex The index of the value to return.
     * @param {Object} aDefault The default value to return if undefined.
     *     Functions are executed to return their value in response.
     * @returns {Object} The element at anIndex in this collection.
     */

    var value;

    if (TP.notNull(value = this.at(anIndex))) {
        return value;
    } else if (TP.isCallable(aDefault)) {
        return aDefault();
    } else {
        return aDefault;
    }
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('atIfUndefined',
function(anIndex, aDefault) {

    /**
     * @method atIfUndefined
     * @summary Returns the value at the index provided or the default value if
     *     the key returns undefined.
     * @description If a Function is supplied as the default value to this
     *     method, it will be executed and its value will be returned as the
     *     value. Therefore, this method cannot be used if the Function object
     *     itself is what is desired as the returned value.
     * @param {Number} anIndex The index of the value to return.
     * @param {Object} aDefault The default value to return if undefined.
     *     Functions are executed to return their value in response.
     * @returns {Object} The element at anIndex in this collection.
     */

    var value;

    if (TP.isDefined(value = this.at(anIndex))) {
        return value;
    } else if (TP.isCallable(aDefault)) {
        return aDefault();
    } else {
        return aDefault;
    }
});

//  ------------------------------------------------------------------------
//  atPut                       Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  atPutIfAbsent               Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  containsKey                 Kernel
//  ------------------------------------------------------------------------
//  containsValue               Kernel
//  ------------------------------------------------------------------------

String.Inst.defineMethod('detectKeyAt',
function(aKey, anIndex) {

    /**
     * @method detectKeyAt
     * @summary Searches for the first nested element whose value at(anIndex)
     *     matches aKey. This can be a useful detection for finding data in an
     *     ordered collection (array, sorted hash, or node) by the value at a
     *     particular index or attribute location.
     * @param {String|RegExp} aKey The string or regular expression selector to
     *     match with.
     * @param {Number} anIndex The "column" index to check in each nested array.
     * @returns {String[]} The nested array whose value at anIndex matches aKey.
     */

    var index;

    index = TP.ifInvalid(anIndex, 0);

    return this.detect(
        function(obj) {

            if (!TP.isArray(obj)) {
                return;
            }

            return TP.isValid(aKey.match(obj.at(index)));
        });
});

//  ------------------------------------------------------------------------
//  getKeys                     Kernel
//  ------------------------------------------------------------------------
//  getKVPairs                  Kernel
//  ------------------------------------------------------------------------
//  getPairs                    Kernel
//  ------------------------------------------------------------------------

String.Inst.defineMethod('getPosition',
function(anItem, startIndex) {

    /**
     * @method getPosition
     * @summary Returns the first index of anItem in the receiver.
     * @param {Object} anItem The element to search for.
     * @param {Number} startIndex The index to start looking for anItem.
     * @returns {Number} The first index of an element equal to anItem.
     */

    return this.indexOf(anItem, startIndex);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('getPositions',
function(aValue, startIndex) {

    /**
     * @method getPositions
     * @summary Returns a collection of all indexes where the value is found.
     * @param {String} aValue The character to look for.
     * @param {Number} startIndex The index to start looking for aValue.
     * @returns {Number[]} An array containing indexes for the value provided.
     *     May be empty.
     */

    var tmparr,
        start;

    tmparr = TP.ac();

    start = this.indexOf(aValue, startIndex);
    while (start !== TP.NOT_FOUND) {
        tmparr.add(start);
        start = this.indexOf(aValue, start + 1);
    }

    return tmparr;
});

//  ------------------------------------------------------------------------
//  grepKeys                    Kernel
//  ------------------------------------------------------------------------
//  performOver                 Kernel
//  ------------------------------------------------------------------------
//  removeAt                    Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  removeAtAll                 Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  removeKey                   Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  removeKeys                  Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  transpose                   Mutator - not implemented for String
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  TPOrderedCollection
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  addAfter                    Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  addAllAfter                 Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  addAllBefore                Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  addAllFirst                 Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  addAllLast                  Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  addBefore                   Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  addFirst                    Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  addLast                     Mutator - not implemented for String
//  ------------------------------------------------------------------------

String.Inst.defineMethod('after',
function(substring) {

    /**
     * @method after
     * @summary Returns the portion of the receiver after the substring
     *     provided.
     * @param {String} substring The substring to search for.
     * @returns {String|undefined} The next element or undefined.
     */

    var ind;

    ind = this.indexOf(substring);
    if (ind === TP.NOT_FOUND) {
        return;
    }

    return this.slice(ind + substring.getSize(), this.getSize());
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('before',
function(substring) {

    /**
     * @method before
     * @summary Returns the portion of the receiver preceding the substring
     *     provided.
     * @param {String} substring The substring to search for.
     * @returns {String|undefined} The previous substring.
     */

    var ind;

    ind = this.indexOf(substring);
    if (ind === TP.NOT_FOUND) {
        return;
    }

    return this.slice(0, ind);
});

//  ------------------------------------------------------------------------
//  first                       Kernel
//  ------------------------------------------------------------------------

String.Inst.defineMethod('getLastPosition',
function(anItem, startIndex, aTest) {

    /**
     * @method getLastPosition
     * @summary Returns the last index of anItem in the receiver.
     * @param {Object} anItem The element to search for.
     * @param {Number} startIndex The index to start looking for anItem.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY.
     *     Ignore for this type.
     * @returns {Number} The last index of an element equal to anItem.
     */

    return this.lastIndexOf(anItem, startIndex);
});

//  ------------------------------------------------------------------------
//  last                        Kernel
//  ------------------------------------------------------------------------
//  orderedBy                   Kernel
//  ------------------------------------------------------------------------
//  removeFirst                 Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  removeLast                  Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  replaceFirst                Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  replaceLast                 Mutator - not implemented for String
//  ------------------------------------------------------------------------
//  reverse                     Mutator - not implemented for String
//  ------------------------------------------------------------------------

//  ========================================================================
//  TP.core.Hash
//  ========================================================================

/**
 * @type {TP.core.Hash}
 * @summary Collection-oriented API's for TP.core.Hash base class.
 * @description TIBET's hash (dictionary, associative array) type. You should
 *     always use a TP.core.Hash (available via TP.hc()) when dealing with data
 *     in key/value form. In TIBET it's a dangerous, and potentially slow
 *     practice to use a regular object ({}) as a hash. We recommend you never
 *     use an Object as a hash since there's no clear separation between
 *     properties that represent content and those that represent the state
 *     and/or behavior of the hash itself. In addition, iteration on a standard
 *     object in TIBET using for/in can be quite slow.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.Hash');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  NOTE: Make sure this parser is installed first! Because of ambiguities
//  in syntax, the URI parsers below will also match a 'style string' and we
//  want to give one first crack at it.
TP.core.Hash.Type.defineConstant('STYLE_STRING_PARSER',
function(aString) {

    /**
     * @method STYLE_STRING_PARSER
     * @summary A parse function specific to CSS style strings.
     * @description The input is checked for conformance to key:value; syntax
     *     and parsed into a valid hash if it matches. In addition the keys are
     *     converted into their proper DOM equivalents so that 'float' in CSS
     *     becomes 'cssFloat' in the hash.
     * @param {String} aString A valid CSS style string.
     * @returns {TP.core.Hash} A new instance.
     */

    var dict;

    TP.regex.STYLE_STRING.lastIndex = 0;
    if (TP.regex.STYLE_STRING.test(aString)) {
        dict = TP.hc();
        TP.regex.STYLE_STRING.performWith(
            function(whole, key, value, index, str) {

                var styleKey;

                //  don't make keys of undefined, and don't let trailing ;
                //  mess things up if the regex matched to that separator

                /* eslint-disable no-extra-parens */
                if ((styleKey = key.strip(';').asDOMName())) {
                    dict.atPut(styleKey, value);
                }
                /* eslint-enable no-extra-parens */
            }, aString);
    } else {
        //  We don't match a style string.
        return null;
    }

    return dict;
});

//  ------------------------------------------------------------------------

TP.core.Hash.addParser(TP.core.Hash.STYLE_STRING_PARSER);

//  ------------------------------------------------------------------------

TP.core.Hash.Type.defineConstant('ATTRIBUTE_STRING_PARSER',
function(aString) {

    /**
     * @method ATTRIBUTE_STRING_PARSER
     * @summary A parse function specific to XML attribute strings.
     * @description The input is checked for conformance to key="value" syntax
     *     and parsed into a valid hash if it matches.
     * @param {String} aString A valid XML attribute string.
     * @returns {TP.core.Hash} A new instance.
     */

    var dict;

    TP.regex.ATTRIBUTE_STRING.lastIndex = 0;
    if (TP.regex.ATTRIBUTE_STRING.test(aString)) {
        dict = TP.hc();
        TP.regex.ATTRIBUTE_STRING.performWith(
            function(whole, key, quoteChar, value, index, str) {

                //  don't make keys of undefined
                if (TP.notEmpty(key)) {
                    dict.atPut(key, value);
                }
            }, aString);
    } else {
        //  We don't match an attribute string.
        return null;
    }

    return dict;
});

//  ------------------------------------------------------------------------

TP.core.Hash.addParser(TP.core.Hash.ATTRIBUTE_STRING_PARSER);

//  ------------------------------------------------------------------------

TP.core.Hash.Type.defineConstant('URI_STRING_PARSER',
function(aString) {

    /**
     * @method URI_STRING_PARSER
     * @summary A parse function specific to URI strings.
     * @param {String} aString A valid URI string.
     * @returns {TP.core.Hash} A new instance.
     */

    var dict,

        urlRegExp,

        match,
        partNames,

        i,

        queryPart,
        queryDict;

    dict = TP.hc();

    //   The 'scheme' will be the first result here, so if its empty, that
    //   means this wasn't a valid URL.
    if (TP.notEmpty(TP.regex.URI_STRICT.exec(aString).at(1))) {
        urlRegExp = TP.regex.URI_STRICT;
    } else if (TP.notEmpty(TP.regex.URI_LOOSE.exec(aString).at(1))) {
        urlRegExp = TP.regex.URI_LOOSE;
    } else {
        //  We don't match a URI, either strictly or loosely.
        return null;
    }

    //  Run the RegExp and get the match results.
    match = urlRegExp.exec(aString);

    partNames = TP.ac('source',
                        'scheme',
                        'authority',
                            'userInfo', 'user', 'password',
                            'hostname', 'port',
                        'relative',
                            'path',
                                'directory',
                                'file',
                            'query',
                            'fragment');

    //  Now, gather up the pieces by running a replace using a RegExp
    for (i = 0; i < partNames.getSize(); i++) {
        dict.atPut(partNames.at(i),
                    TP.notEmpty(match.at(i)) ? match.at(i) : '');
    }

    //  If we also got a query, construct a TP.core.Hash from it.
    if (TP.notEmpty(queryPart = dict.at('query'))) {
        queryDict = TP.core.Hash.fromString(queryPart);
        dict.atPut('queryDict', queryDict);
    }

    return dict;
});

//  ------------------------------------------------------------------------

TP.core.Hash.addParser(TP.core.Hash.URI_STRING_PARSER);

//  ------------------------------------------------------------------------

TP.core.Hash.Type.defineConstant('QUERY_STRING_PARSER',
function(aString) {

    /**
     * @method QUERY_STRING_PARSER
     * @summary A parse function specific to URI query strings.
     * @description The input is checked for conformance to key=value[&|;]...
     *     syntax and parsed into a valid hash if it matches. NOTE that a
     *     leading ? is allowed, and discarded by this routine (and in fact the
     *     entire URI can be passed to this routine if necessary). This method
     *     automatically decodes query values by calling decodeURIParameter() on
     *     them.
     * @param {String} aString A valid URI query string.
     * @returns {TP.core.Hash} A new instance.
     */

    var dict;

    dict = TP.hc();

    TP.regex.URI_QUERY.lastIndex = 0;
    if (!TP.regex.URI_QUERY.test(aString)) {
        //  We don't match a URI query
        return null;
    }

    TP.regex.URI_QUERY.lastIndex = 0;
    aString.replace(
        TP.regex.URI_QUERY,
        function(wholeMatch, aKey, aValue) {

            if (TP.notEmpty(aKey)) {
                dict.atPut(aKey,
                    TP.ifEmpty(decodeURIComponent(aValue), true));
            }
        });

    return dict;
});

//  ------------------------------------------------------------------------

TP.core.Hash.addParser(TP.core.Hash.QUERY_STRING_PARSER);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.definePrimitive('hc',
function() {

    /**
     * @method hc
     * @summary Construct and return a new hash, populating it with initial
     *     data based on the argument list.
     * @description Input data can be provided in a variety of formats including
     *     an array of ordered pairs, an array of key, value sequences, an
     *     Object (not recommended for speed reasons), a hash of key/value
     *     pairs, or a simple argument list of key, value sequences.
     * @returns {TP.core.Hash} The receiver.
     */

    return TP.core.Hash.construct.apply(TP.core.Hash, arguments);
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineAttribute('$$hash');

//  what delim should be used when joining array elements into a string
TP.core.Hash.Inst.defineAttribute('delimiter', ', ');

//  ------------------------------------------------------------------------

TP.core.Hash.Type.defineMethod('fromObject',
function(anObject) {

    /**
     * @method fromObject
     * @summary Constructs a new hash from the object(s) provided as arguments.
     * @param {Object} anObject The source object.
     * @returns {TP.core.Hash} A new instance.
     */

    //  the constructor handles most everything possible that'll actually
    //  work
    return this.construct(anObject);
});

//  ------------------------------------------------------------------------

TP.core.Hash.Type.defineMethod('fromOrphan',
function(anObject) {

    /**
     * @method fromOrphan
     * @summary Constructs a new hash from the orphan object (i.e. one with no
     *     prototype) provided.
     * @param {Object} anObject An orphan source object.
     * @returns {TP.core.Hash} A new instance.
     */

    var newInst;

    newInst = this.construct();

    newInst.$set('$$hash', TP.copy(anObject), false);

    return newInst;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Type.defineMethod('fromString',
function(anObject) {

    /**
     * @method fromString
     * @summary Constructs a new hash from the String provided.
     * @param {String} anObject The source object.
     * @returns {TP.core.Hash} A new instance.
     */

    var newInst,
        val;

    newInst = this.construct();

    if (TP.isJSONString(anObject)) {

        val = TP.json2js(anObject);
        if (TP.isValid(val)) {
            //  Note how we grab the '$$hash' prototype-less
            //  object and make that *our* $$hash.
            newInst.$set('$$hash', val.$$hash, false);

            return newInst;
        }
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Initialize the instance.
     * @returns {TP.core.Hash} A new instance.
     */

    var obj,
        i,
        pair,
        attrs,
        len,
        val,
        thisref;

    this.callNextMethod();

    thisref = this;

    //  NB: For performance reasons, there are multiple occurrences of setting
    //  the internal hash to an orphan object here. This is due to the desire to
    //  minimize checking and object creation.
    switch (arguments.length) {
        case 0:
            this.$set('$$hash', TP.constructOrphanObject(), false);
            break;

        case 1:
            obj = arguments[0];

            if (TP.notValid(obj)) {
                this.$set('$$hash', TP.constructOrphanObject(), false);
            } else {

                //  If the supplied object is a primitive Hash, just grab the
                //  POJO that's its Hash and process that below.
                if (obj.$$prototype &&
                    obj.$$prototype.constructor === TP.boot.PHash) {
                    obj = obj.$$hash;
                }

                if (TP.isPlainObject(obj) && !TP.isPrototype(obj)) {
                    this.$set('$$hash', TP.constructOrphanObject(), false);
                    TP.objectGetKeys(obj).forEach(
                            function(key) {
                                var value;

                                value = obj[key];
                                if (TP.isPlainObject(value) &&
                                    !TP.isPrototype(value)) {
                                    value = TP.core.Hash.construct(value);
                                }

                                thisref.atPut(
                                    key,
                                    TP.notDefined(value) ? null : value);
                            });
                } else if (TP.isArray(obj)) {
                    //  allocate internal hash - note that it is a
                    //  prototype-less object.
                    this.$set('$$hash', TP.constructOrphanObject(), false);

                    if (TP.isPair(obj[0])) {
                        //  pair syntax [['a', 1], ['b', 2], ['c', 3]]
                        for (i = 0; i < obj.length; i++) {
                            pair = obj[i];
                            val = pair[1];
                            this.atPut(
                                pair[0],
                                TP.notDefined(val) ? null : val,
                                false);
                        }
                    } else {
                        //  array syntax ['a', 1, 'b', 2, 'c', 3]
                        for (i = 0; i < obj.length; i += 2) {
                            val = obj[i + 1];
                            this.atPut(
                                obj[i],
                                TP.notDefined(val) ? null : val,
                                false);
                        }
                    }
                } else if (TP.isString(obj)) {
                    return TP.core.Hash.fromString(obj);
                } else if (TP.isElement(obj)) {
                    //  allocate internal hash - note that it is a
                    //  prototype-less object.
                    this.$set('$$hash', TP.constructOrphanObject(), false);

                    attrs = obj.attributes;
                    len = attrs.length;

                    for (i = 0; i < len; i++) {
                        this.atPut(attrs[i].name, attrs[i].value);
                    }
                } else if (TP.isHash(obj)) {
                    return obj;
                } else {

                    //  JSON conversions can fail so protect against that.
                    try {
                        val = TP.js2json(obj);
                        if (TP.isValid(val)) {
                            val = TP.json2js(val);
                            if (TP.isValid(val)) {
                                //  Note how we grab the '$$hash' prototype-less
                                //  object and make that *our* $$hash.
                                this.$set('$$hash', val.$$hash, false);
                            } else {
                                this.$set('$$hash', TP.constructOrphanObject(),
                                        false);
                            }
                        }
                    } catch (e) {
                        return;
                    }
                }
            }
            break;

        default:
            //  allocate internal hash - note that it is a prototype-less
            //  object.
            this.$set('$$hash', TP.constructOrphanObject(), false);

            //  arguments syntax 'a', 1, 'b', 2, 'c', 3
            for (i = 0; i < arguments.length; i += 2) {
                val = arguments[i + 1];
                this.atPut(
                    arguments[i],
                    TP.notDefined(val) ? null : val,
                    false);
            }
            break;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('addAllKeys',
function(aCollection) {

    /**
     * @method addAllKeys
     * @summary Adds all the keys contained in aCollection.
     * @description This is a fast way to get a simple lookup table from an
     *     array. The values are initialized to their index, effectively
     *     inverting the array into the hash. You can use the resulting hash to
     *     do containment checking against a hash key instead of scanning the
     *     original array by using hash.containsKey().
     * @param {TPCollection} aCollection A collection of one or more keys.
     * @returns {TP.core.Hash} The receiver.
     * @fires Change
     */

    var keys,
        hash,
        keyArr,
        i,
        len,
        item;

    if (!TP.canInvoke(aCollection, 'getKeys')) {
        this.raise('TP.sig.InvalidCollection');
        return this;
    }

    keys = TP.isArray(aCollection) ? aCollection : aCollection.getKeys();

    hash = this.$get('$$hash');
    keyArr = this.getKeys();

    len = keys.getSize();
    for (i = 0; i < len; i++) {
        item = keys[i];

        //  If we don't know about this value, or its a property but not on
        //  us.
        if (TP.notDefined(hash[item]) || !TP.owns(hash, item)) {
            hash[item] = i;
        }
    }

    if (len > 0) {
        this.changed('keys', TP.INSERT,
                        TP.hc(TP.OLDVAL, len, TP.NEWVAL, keyArr.getSize()));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('asAttributeString',
function() {

    /**
     * @method asAttributeString
     * @summary Returns the receiver in an XML attribute string format, meaning
     *     each key/value pair becomes key="value" and each pair is separated by
     *     a single space. The resulting string is suitable for inclusion in
     *     strings used to construct nodes.
     * @returns {String} The receiver as an attribute String.
     */

    return TP.attributeStringFromHash(this);
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('asDumpString',
function(depth, level) {

    /**
     * @method asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @param {Number} [depth=1] Optional max depth to descend into target.
     * @param {Number} [level=1] Passed by machinery, don't provide this.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    var marker,
        joinCh,
        joinArr,
        keys,
        len,
        i,
        val,
        str,
        $depth,
        $level;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asDumpString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    joinCh = this.$get('delimiter');

    if (!TP.isString(joinCh)) {
        //  If 'joinCh' is not a String, maybe it's a hash or other Object with
        //  a 'join' property.
        if (!TP.isString(joinCh = joinCh.get('join'))) {
            joinCh = '';
        }
    }

    str = '[' + TP.tname(this) + ' :: ';

    $depth = TP.ifInvalid(depth, 1);
    $level = TP.ifInvalid(level, 0);

    joinArr = TP.ac();

    try {
        keys = TP.keys(this);
        len = keys.getSize();

        for (i = 0; i < len; i++) {

            val = this.at(keys.at(i));

            if (val === this) {
                if (TP.canInvoke(val, 'asRecursionString')) {
                    joinArr.push(
                        TP.join(keys.at(i), ' => ', val.asRecursionString()));
                } else {
                    joinArr.push(TP.join(keys.at(i), ' => this'));
                }
            } else {
                if ($level > $depth && TP.isMutable(val)) {
                    joinArr.push(TP.join(keys.at(i), ' => ',
                        '@' + TP.id(val)));
                } else {
                    joinArr.push(TP.join(keys.at(i), ' => ',
                        TP.dump(val, $depth, $level + 1)));
                }
            }
        }

        str += joinArr.join(joinCh) + ']';
    } catch (e) {
        str += this.toString() + ']';
    } finally {
        delete this[marker];
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver.
     * @returns {String} The receiver in HTML string format.
     */

    var marker,
        joinArr,
        keys,
        len,
        i,
        joinStr;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asHTMLString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    joinArr = TP.ac();

    try {
        keys = TP.keys(this);
        len = keys.getSize();

        for (i = 0; i < len; i++) {
            joinArr.push(
                    TP.join('<span data-name="', keys.at(i), '">',
                            TP.htmlstr(this.at(keys.at(i))),
                            '</span>'));
        }

        joinStr = '<span class="TP_core_Hash">' +
                     joinArr.join('') +
                     '</span>';
    } catch (e) {
        joinStr = this.toString();
    } finally {
        delete this[marker];
    }

    return joinStr;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @method asJSONSource
     * @summary Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    var marker,
        joinArr,
        keys,
        len,
        i,
        joinStr;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asJSONSource';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    joinArr = TP.ac();

    try {
        keys = TP.keys(this);
        len = keys.getSize();

        for (i = 0; i < len; i++) {
            joinArr.push(
                    TP.join(keys.at(i).quoted('"'),
                            ':',
                            TP.jsonsrc(this.at(keys.at(i)))));
        }

        joinStr = '{' + joinArr.join(',') + '}';
    } catch (e) {
        joinStr = this.toString();
    } finally {
        delete this[marker];
    }

    return joinStr;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('asObject',
function() {

    /**
     * @method asObject
     * @summary Returns a 'plain JavaScript object' version of the receiver -
     *     and makes sure that any nested content is also converted to its plain
     *     JavaScript equivalent.
     * @returns {Object} The receiver - and its content - as plain JavaScript
     *     objects.
     */

    var marker,
        keys,
        len,
        obj,
        i,
        val;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asObject';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    keys = TP.keys(this);
    len = keys.getSize();
    obj = {};

    try {
        for (i = 0; i < len; i++) {
            val = this.at(keys[i]);

            //  Make sure to recurse in so that we end up with plain Object
            //  versions of all values.
            if (TP.canInvoke(val, 'asObject')) {
                val = val.asObject();
            }
            obj[keys[i]] = val;
        }
    } finally {
        delete this[marker];
    }

    return obj;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('toJSON',
function() {

    /**
     * @method toJSON
     * @summary Returns the object to use in JSON representations.
     * @returns {Object} The object to use in a JSON representation.
     */

    //  Return the plain JS object version of this object.
    return this.asObject();
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @method asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    var marker,
        joinArr,
        keys,
        len,
        i,
        joinStr;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asPrettyString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    joinArr = TP.ac();

    try {
        keys = TP.keys(this);
        len = keys.getSize();

        for (i = 0; i < len; i++) {
            joinArr.push(
                TP.join('<dt class="pretty key">', keys.at(i), '</dt>',
                        '<dd class="pretty value">',
                            TP.pretty(this.at(keys.at(i))),
                        '</dd>'));
        }

        joinStr = '<dl class="pretty ' + TP.escapeTypeName(TP.tname(this)) +
                        '">' +
                    '<dt>Type name</dt>' +
                    '<dd class="pretty typename">' +
                        this.getTypeName() +
                    '</dd>' +
                    joinArr.join('') +
                    '</dl>';
    } catch (e) {
        joinStr = this.toString();
    } finally {
        delete this[marker];
    }


    return joinStr;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('asQueryString',
function(aSeparator, undefVal) {

    /**
     * @method asQueryString
     * @summary Returns the receiver in URI query string form, meaning each
     *     key/value pair becomes key=value and each pair is separated by a
     *     single & or separator as provided.
     * @description This method automatically encodes query values by calling
     *     encodeURIComponent() on them.
     * @param {String} aSeparator The default is '&'.
     * @param {String} undefVal The value to use when a key's value is
     *     undefined.
     * @returns {String} The receiver as a valid query string.
     */

    var delim,
        arr,
        keys,
        thisref,
        len,
        undef;

    if (!TP.isString(delim = aSeparator)) {
        delim = '&';
    }

    undef = TP.ifInvalid(undefVal, '');

    arr = TP.ac();
    thisref = this;

    keys = this.getKeys();
    len = keys.getSize();
    keys.forEach(function(key, index) {
        var val;

        arr.push(key);
        val = thisref.at(key);
        if (TP.isValid(val)) {
            arr.push('=', encodeURIComponent(thisref.at(key)));
        } else if (TP.notEmpty(undef)) {
            arr.push('=', encodeURIComponent(undef));
        }
        if (index < len - 1) {
            arr.push(delim);
        }
    });

    return arr.join('');
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('asSource',
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
        i;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asSource';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    keys = TP.keys(this);
    len = keys.getSize();
    arr = TP.ac();

    try {
        for (i = 0; i < len; i++) {
            arr.push(
                TP.join(TP.src(keys[i]),
                        ', ',
                        TP.src(this.at(keys[i]))));
        }
    } finally {
        delete this[marker];
    }


    return TP.join('TP.hc(', arr.join(', '), ')');
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('asStyleString',
function() {

    /**
     * @method asStyleString
     * @summary Returns the receiver in CSS style attribute string form,
     *     meaning each key/value pair becomes key:value and each pair is
     *     separated by a single
     * @returns {String} The receiver as a String.
     */

    return TP.styleStringFromHash(this);
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('asXMLString',
function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver.
     * @returns {String} The receiver in XML string format.
     */

    var marker,
        joinArr,
        keys,
        len,
        i,
        joinStr;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asXMLString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    joinArr = TP.ac();

    try {
        keys = TP.keys(this);
        len = keys.getSize();

        for (i = 0; i < len; i++) {
            joinArr.push(
                    TP.join('<', keys.at(i), '>',
                            TP.xmlstr(this.at(keys.at(i))),
                            '</', keys.at(i), '>'));
        }

        joinStr = '<instance type="' + TP.tname(this) + '">' +
                     joinArr.join('') +
                     '</instance>';
    } catch (e) {
        joinStr = this.toString();
    } finally {
        delete this[marker];
    }

    return joinStr;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('atAllPutKeys',
function() {

    /**
     * @method atAllPutKeys
     * @summary Assigns the value in each location in the collection to be
     *     equal to the key at that location. This works as an initializer for
     *     certain operations.
     * @returns {Object} The receiver.
     * @fires Change
     */

    this.convert(
        function(it, ind) {
            return it.first();
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('clearTextContent',
function() {

    /**
     * @method clearTextContent
     * @summary Clears out any text content of mutable items in the receiver,
     *     thereby clearing all of the non-mutable (primitive) items and leaving
     *     just the data structure.
     * @returns {TP.core.Hash} The receiver.
     */

    var hash,
        keys,

        len,
        i,
        it;

    hash = this.$get('$$hash');
    keys = this.getKeys();

    len = keys.getSize();
    for (i = 0; i < len; i++) {

        it = this.at(keys.at(i));

        //  Make sure that the item is both mutable and implements a 'clear'
        //  method.
        if (TP.isMutable(it) && TP.canInvoke(it, 'clear')) {
            it.clear();
        } else {
            hash[keys.at(i)] = '';
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('copy',
function(deep, aFilterNameOrKeys, contentOnly) {

    /**
     * @method copy
     * @summary Returns a copy of the receiver. If contentOnly is true then a
     *     TP.core.Hash is returned contains only the content values (key, val,
     *     key, val ...), and no 'special values' on the receiver are copied.
     *     The filter defines which keys are used to select from the receiver.
     * @param {Boolean} [deep=false] True to force clones to be deep.
     * @param {String|String[]} [aFilterNameOrKeys] get*Interface() filter or
     *     key array.
     * @param {Boolean} [contentOnly=true] Copy content only? This parameter is
     *     ignored for this type.
     * @returns {TP.core.Hash} A copy of the receiver.
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

    newinst = this.getType().construct();

    if (!onlyContent) {
        //  Any reasonable filter should not include '$$hash' or '$$keys'.
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

            newinst.$set(ndx, val, false);
        }
    } else {
        if (!TP.isArray(keys = aFilterNameOrKeys)) {
            keys = TP.keys(this);
        }

        len = keys.getSize();

        for (i = 0; i < len; i++) {
            ndx = keys.at(i);
            val = this.at(ndx);

            if (TP.isTrue(deep) && TP.isReferenceType(val)) {
                //  NB: We do *not* pass along the filter name or keys here
                val = TP.copy(val, deep, null, contentOnly);
            }

            newinst.atPut(ndx, val, false);
        }
    }

    return newinst;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('get',
function(attributeName) {

    /**
     * @method get
     * @summary Returns the value of attributeName from the receiver.
     * @description Note that get() operates on the object's methods first and
     *     then searches its content and properties. In other words, if the
     *     receiver has both a method named 'foo' and a key/value pair under the
     *     key 'foo' you won't get the value back, you'll get the result of
     *     getFoo() if that's a valid method for a hash. After methods the
     *     content of the hash is checked, followed by the hash's slots. Use
     *     at() if you want to focus exclusively on the content of the hash and
     *     never acquire method results or property values. Use $get if you want
     *     to focus exclusively on the hash's slot values.
     * @param {String} attributeName The name of the attribute to return.
     * @returns {Object} The value contained in the named attribute on the
     *     receiver.
     */

    var path,
        pathStr,

        args,

        funcName,

        val;

    //  If we got handed an 'access path', then we need to let it handle this.
    if (!TP.isString(attributeName) && attributeName.isAccessPath()) {
        path = attributeName;

        //  If the path's String representation is a simple JS_IDENTIFIER, then
        //  we need to check to see if this is just a TIBET path with a name to
        //  an 'aliased' access path (i.e. 'lastname' -> 'foo.bar.lastname').
        //  So, here we check to see if there is an access path for this simple
        //  identifier and, if there is, we use *that* path as the way to access
        //  the underlying data. NOTE: Unlike other overrides of 'get', we do
        //  NOT check for custom getters and setters here - we treat
        //  TP.core.Hash very specially around get/set and at/atPut.
        if (TP.regex.JS_IDENTIFIER.test(pathStr = path.get('srcPath'))) {
            if (TP.notValid(path = this.getAccessPathFor(pathStr, 'value'))) {
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

        //  This part is specific to TP.core.Hash - we check with our internal
        //  hash.
        if (TP.isDefined(val = this.at(attributeName))) {
            return val;
        }
    }

    //  If we got a valid path above or if we have a 'value' facet that has an
    //  access path, then invoke the path.
    if (TP.isValid(path) ||
        TP.isValid(path = this.getAccessPathFor(attributeName, 'value'))) {

        pathStr = path.asString();
        if (pathStr === '.') {
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

TP.core.Hash.Inst.defineMethod('getContent',
function() {

    /**
     * @method getContent
     * @summary Overrides from supertype to check to see if our internal
     *     content has a slot named 'content'. If so, that is returned.
     *     Otherwise, a standard 'getValue()' is performed.
     * @returns The value of our 'content' slot if we have one.
     */

    if (this.hasKey('content')) {
        return this.at('content');
    }

    //  This is what our supertype does.
    return this.getValue();
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('getParameters',
function() {

    /**
     * @method getParameters
     * @summary Returns the receiver's parameters. For a TP.core.Hash this
     *     returns the hash itself.
     * @returns {Object} A TP.core.Hash or TP.sig.Request containing parameter
     *     data (typically).
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('getPayload',
function() {

    /**
     * @method getPayload
     * @summary Returns the receiver.
     * @returns {TP.core.Hash} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('hasKey',
function(aKey) {

    /**
     * @method hasKey
     * @summary Returns true if aKey has been defined for the receiver.
     * @param {String} aKey The string key to test for.
     * @returns {Boolean} True if the key is defined.
     */

    //  Note how we use 'TP.FunctionProto.hasOwnProperty.call'... this is due
    //  to the fact that the hash itself is a prototype-less Object and
    //  therefore 'hasOwnProperty' won't exist.
    return TP.FunctionProto.hasOwnProperty.call(this.$get('$$hash'), aKey);
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('$$isPair',
function() {

    /**
     * @method $$isPair
     * @summary This method always returns false for TP.core.Hash.
     * @returns {Boolean} False as TP.core.Hash is never an ordered pair.
     */

    return false;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('populate',
function(propertyHash, defaultSource, defaultsPrompt, onlyMissing) {

    /**
     * @method populate
     * @summary Populates the keys listed in the propertyHash by prompting the
     *     user. Information in the propertyHash provides the keys to populate,
     *     the prompts to use, and optionally the aspects to use when querying
     *     the defaultSource for values.
     * @param {TP.core.Hash} propertyHash A hash whose keys are the names of the
     *     properties to populate and whose values are either the prompts to use
     *     or arrays containing the prompt and the aspect name to use with the
     *     defaultSource for lookups.
     * @param {Object} defaultSource An optional object to query for default
     *     values using the default property name(s) given.
     * @param {Boolean} defaultsPrompt Should the default values be used or be
     *     prompts? Default is false.
     * @param {Boolean} onlyMissing Should all keys be updated or only those
     *     which are missing? Default is true.
     * @returns {TP.core.Hash} The receiver.
     * @example:
            hash.populate(TP.hc('uri', TP.ac('uri', 'Enter Service URI'),
     *                          'password', 'Enter password');
     * @fires Change
     */

    var keys,
        len,
        i,
        key,
        item,
        defkey,
        query,
        fname,
        defval,
        newval;

    keys = TP.keys(propertyHash);
    len = keys.getSize();

    for (i = 0; i < len; i++) {
        key = keys.at(i);

        if (TP.isDefined(this.at(key)) && TP.notFalse(onlyMissing)) {
            continue;
        }

        item = propertyHash.at(key);
        defkey = TP.isArray(item) ? item.first() : key;
        query = TP.isArray(item) ? item.last() : item;

        //  prefer at over get, and make sure it's really callable
        fname = TP.canInvoke(defaultSource, 'at') ? 'at' : 'get';
        if (TP.canInvoke(defaultSource, fname)) {
            defval = defaultSource[fname](defkey);
            if (TP.isValid(defval) && TP.notTrue(defaultsPrompt)) {
                this.atPut(key, defval);

                continue;
            }
        }

        //  NOTE that we're accessing the value of the property hash here
        //  and getting either the prompt (last) or
        newval = prompt(query, defval);

        this.atPut(key, newval);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('$removeInternalKey',
function(aKey) {

    /**
     * @method $removeInternalKey
     * @summary A private method that removes a key from our private, internal
     *     hash.
     * @param {Object} aKey The key value to remove.
     * @returns {TP.core.Hash} The receiver.
     */

    var hash;

    hash = this.$get('$$hash');

    //  Make sure that the supplied key matches a property on our internal hash.
    if (!TP.owns(hash, aKey)) {
        return this;
    }

    delete hash[aKey];

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('removeValue',
function(aValue, aTest) {

    /**
     * @method removeValue
     * @summary Removes the value provided if the collection contains it. This
     *     removes all keys which contain the value.
     * @param {Object} aValue The value to remove.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @exception TP.sig.InvalidParameter
     * @returns {Object} The receiver.
     * @fires Change
     */

    var tmparr,

        changed,

        len,
        i;

    tmparr = this.getPositions(aValue, aTest);
    if (tmparr.getSize() < 1) {
        return this;
    }

    changed = false;

    len = tmparr.getSize();
    for (i = 0; i < len; i++) {
        this.$removeInternalKey(tmparr.at(i));
        changed = true;
    }

    if (changed) {
        this.changed('value', TP.DELETE);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('replaceKey',
function(oldKey, newKey) {

    /**
     * @method replaceKey
     * @summary Replaces the key/value pair oldKey/value with newKey/value.
     * @param {String} oldKey The old key to find the value with.
     * @param {String} newKey The new key to register the value under.
     * @exception TP.sig.InvalidKey
     * @returns {Object} The receiver.
     * @fires Change
     */

    var val,
        shouldSignal;

    if (TP.isEmpty(oldKey) || TP.isEmpty(newKey)) {
        return this.raise('TP.sig.InvalidKey');
    }

    //  nothing to do here...
    if (TP.equal(oldKey, newKey)) {
        return this;
    }

    val = this.at(oldKey);

    //  turn off change signaling
    shouldSignal = this.shouldSignalChange();
    this.shouldSignalChange(false);

    try {
        this.removeKey(oldKey);
        this.atPut(newKey, val);
    } finally {
        //  re-enable change notification
        this.shouldSignalChange(shouldSignal);
    }

    this.changed('keys', TP.UPDATE,
                        TP.hc(TP.OLDVAL, oldKey, TP.NEWVAL, newKey));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('replaceValue',
function(oldValue, newValue, aTest) {

    /**
     * @method replaceValue
     * @summary Replaces all occurrences of oldValue with newValue.
     * @param {Object} oldValue The value to replace.
     * @param {Object} newValue The new value to update with.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Object} The receiver.
     * @fires Change
     */

    var replaced,

        shouldSignal;

    replaced = 0;

    //  turn off change signaling
    shouldSignal = this.shouldSignalChange();
    this.shouldSignalChange(false);

    try {
        this.convert(
            function(item, index) {
                switch (aTest) {
                    case TP.IDENTITY:
                        if (TP.identical(item.last(), oldValue)) {
                            replaced++;
                            return newValue;
                        }
                        break;
                    default:
                        if (TP.equal(item.last(), oldValue)) {
                            replaced++;
                            return newValue;
                        }
                        break;
                }

                //  default is to return old value, leaving item unchanged
                return item.last();
            });
    } finally {
        //  re-enable change notification
        this.shouldSignalChange(shouldSignal);
    }

    if (replaced > 0) {
        this.changed('values', TP.UPDATE,
                        TP.hc(TP.OLDVAL, oldValue, TP.NEWVAL, newValue));
    }

    return replaced;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('set',
function(attributeName, attributeValue, shouldSignal) {

    /**
     * @method set
     * @summary Sets the value of the named attribute to the value provided. If
     *     no value is provided the value null is used.
     * @param {String|TP.path.AccessPath} attributeName The name of the
     *     attribute to set.
     * @param {Object} attributeValue The value to set.
     * @param {Boolean} shouldSignal If false no signaling occurs. Defaults to
     *     this.shouldSignalChange().
     * @returns {TP.core.Hash} The receiver.
     * @fires Change
     */

    var path,
        pathStr,

        funcName,

        args,

        sigFlag,
        oldFlag;

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
        //  the underlying data. NOTE: Unlike other overrides of 'set', we do
        //  NOT check for custom getters and setters here - we treat
        //  TP.core.Hash very specially around get/set and at/atPut.
        if (TP.regex.JS_IDENTIFIER.test(pathStr = path.get('srcPath'))) {
            if (TP.notValid(path = this.getAccessPathFor(pathStr, 'value'))) {
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

    //  NB: Use this construct this way for better performance
    if (TP.notValid(sigFlag = shouldSignal)) {
        sigFlag = this.shouldSignalChange();
    }

    //  if its defined, we want to know (true or false)
    if (TP.isDefined(sigFlag)) {
        oldFlag = this.shouldSignalChange();

        this.shouldSignalChange(sigFlag);

        //  let the standard mechanism handle it
        this.atPut(attributeName, attributeValue);

        this.shouldSignalChange(oldFlag);
    } else {
        //  let the standard mechanism handle it
        this.atPut(attributeName, attributeValue);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('setDelimiter',
function(aString) {

    /**
     * @method setDelimiter
     * @summary Sets the join delimiter to use when converting the hash to and
     *     from a string.
     * @param {String} aString The string used to join() the array.
     * @returns {TP.core.Hash} The receiver.
     */

    var str;

    str = TP.ifInvalid(aString, ', ');

    if (this.$get('delimiter') !== str) {
        this.$set('delimiter', str);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('shift',
function() {

    /**
     * @method shift
     * @summary Removes and returns the first element in the hash, as if the
     *     hash had been turned into an array and the shift had been performed
     *     on that collection.
     * @returns {Object[]} An ordered pair containing the first item in the hash
     *     based on the current sort function.
     * @fires Change
     */

    var item;

    item = this.first();
    this.remove(item);

    return item;
});

//  ------------------------------------------------------------------------
//  TPCollection API
//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('add',
function(varargs) {

    /**
     * @method add
     * @summary Adds one or more key/value pairs to the receiver. The input can
     *     be provided in a variety of formats including an array of ordered
     *     pairs, an array of key, value sequences, an Object (not recommended
     *     for speed reasons), a hash of key/value pairs, or a simple argument
     *     list of key, value sequences.
     * @param {arguments} varargs Variable-length argument list of ordered
     *     pairs.
     * @returns {TP.core.Hash} The receiver.
     * @fires Change
     */

    var count,
        i,
        pair,
        obj,

        keys,
        len;

    count = 0;

    switch (arguments.length) {
        case 0:
            return this;
        case 1:
            obj = arguments[0];
            if (TP.isArray(obj)) {
                if (TP.isPair(obj[0])) {
                    //  pair syntax [['a', 1], ['b', 2], ['c', 3]]
                    for (i = 0; i < obj.length; i++) {
                        pair = obj[i];
                        this.atPut(
                            pair[0],
                            TP.notDefined(pair[1]) ? null : pair[1],
                            false);

                        count++;
                    }
                } else {
                    //  array syntax ['a', 1, 'b', 2, 'c', 3]
                    for (i = 0; i < obj.length; i += 2) {
                        this.atPut(
                            obj[i],
                            TP.notDefined(obj[i + 1]) ? null : obj[i + 1],
                            false);

                        count++;
                    }
                }
            } else {
                //  NB: We're only interested in the local keys here.
                keys = TP.$getOwnKeys(obj);
                len = keys.getSize();

                for (i = 0; i < len; i++) {
                    this.atPut(keys.at(i), obj[keys.at(i)], false);
                    count++;
                }
            }
            break;
        case 2:
            this.atPut(arguments[0], arguments[1], false);
            count++;
            break;
        default:
            //  arguments syntax 'a', 1, 'b', 2, 'c', 3
            for (i = 0; i < arguments.length; i += 2) {
                this.atPut(
                    arguments[i],
                    TP.notDefined(arguments[i + 1]) ?
                                    null :
                                    arguments[i + 1],
                    false);
                count++;
            }
            break;
    }

    if (count > 0) {
        this.changed('value', TP.INSERT);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('addAll',
function(aCollection, aFunction) {

    /**
     * @method addAll
     * @summary Adds all the ordered pairs contained in the collection to the
     *     receiver. The optional function can be used to decide which value
     *     will be used when a duplicate key is found.
     * @param {TPCollection} aCollection A collection of ordered pairs to add.
     * @param {Function} aFunction A function accepting a key and two values
     *     (key, old, new) which returns the value to use for the key.
     * @returns {TP.core.Hash} The receiver.
     * @fires Change
     */

    var thisref,
        count;

    //  arrays of ordered pairs are handled nicely by add() as long as we're
    //  not trying to check for duplicates
    if (TP.isArray(aCollection) && !TP.isCallable(aFunction)) {
        return this.add(aCollection);
    }

    //  anything else has to be able to give us items during a perform
    if (!TP.canInvoke(aCollection, 'perform')) {
        return this.raise('TP.sig.InvalidCollection');
    }

    thisref = this;
    count = 0;

    //  typically don't have a dup function test, so avoid overhead
    if (!TP.isCallable(aFunction)) {
        aCollection.perform(
            function(item, index) {
                thisref.atPut(item.first(), item.last(), false);
                count++;
            });
    } else {
        aCollection.perform(
            function(item, index) {
                var val,
                    newval;

                val = thisref.at(item.first());
                if (TP.isDefined(val)) {
                    newval = aFunction(item.first(), val, item.last());
                    if (newval !== val) {
                        thisref.atPut(item.first(), newval, false);
                        count++;
                    }
                } else {
                    thisref.atPut(item.first(), item.last(), false);
                    count++;
                }
            });
    }

    if (count > 0) {
        this.changed('value', TP.INSERT);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('addAllIfAbsent',
function(aCollection) {

    /**
     * @method addAllIfAbsent
     * @summary Adds all the ordered pairs contained in the collection to the
     *     receiver where the keys are not already in the target collection.
     * @param {TPCollection} aCollection A collection of ordered pairs to add.
     * @returns {TP.core.Hash} The receiver.
     * @fires Change
     */

    var thisref;

    thisref = this;

    return this.addAll(aCollection,
        function(key, oldval, newval) {

            if (thisref.containsKey(key)) {
                return oldval;
            }

            return newval;
        });
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('addIfAbsent',
function(anItemOrKey, aValue, varargs) {

    /**
     * @method addIfAbsent
     * @summary Using the key/value pair provided assign the value to the key
     *     in the receiver if the key doesn't already exist. Additional
     *     key/value pairs can be provided just as with the TP.core.Hash
     *     constructor to avoid having to call this routine multiple times with
     *     each pair.
     * @param {TPOrderedPair|String} anItemOrKey The ordered pair to add, or the
     *     key for a pair.
     * @param {Object} aValue Optional value to store when the first argument is
     *     a string.
     * @param {arguments} varargs Additional key signifying that more key/value
     *     pairs are available. When this is defined the routine will loop
     *     across all input arguments and attempt to add all valid key/value
     *     pairings that can be found.
     * @exception TP.sig.InvalidParameter
     * @returns {Object|undefined} The key's value after processing.
     * @fires Change
     */

    var i,
        len,
        key,
        val;

    //  most cases are single values so optimize a bit for that case
    if (TP.isString(anItemOrKey)) {
        key = anItemOrKey;
        val = aValue;
    } else if (TP.isPair(anItemOrKey)) {
        //  TODO:   hopefully we don't say Hashes are ordered pairs
        key = anItemOrKey.first();
        val = anItemOrKey.last();
    } else {
        this.raise('TP.sig.InvalidParameter', 'Invalid key or item.');

        return;
    }

    if (TP.notDefined(this.at(key))) {
        this.atPut(key, val);
    }

    if (TP.notDefined(varargs)) {
        return this.at(key);
    }

    len = arguments.length - 2;
    for (i = 2; i < len; i += 2) {
        key = arguments[i];
        val = arguments[i + 1];

        if (TP.notDefined(this.at(key))) {
            this.atPut(key, val);
        }
    }

    return this.at(key);
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('addItem',
function(anItem) {

    /**
     * @method addItem
     * @summary Adds a single item to the receiver. If the key already exists
     *     the new value is inserted.
     * @param {The} anItem item to add.
     * @returns {TP.core.Hash} The receiver.
     * @fires Change
     */

    if (!TP.isPair(anItem)) {
        this.raise('InvalidPair');
        return this;
    }

    this.atPut(anItem.first(), anItem.last());

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('addWithCount',
function(anObject, aCount) {

    /**
     * @method addWithCount
     * @summary Adds the object N times, where N defaults to 0. NOTE that in
     *     the absence of a valid count the object is not added. For a Hash the
     *     outcome is either no addition, or one new item since the key/value
     *     can only occupy on location in the Hash.
     * @param {Object} anObject The object to add.
     * @param {Number} aCount A number of times to add the object. Default is 0.
     * @returns {TP.core.Hash} The receiver.
     * @fires Change
     */

    var count;

    //  no count? no work to do
    if (TP.notValid(aCount)) {
        return this;
    }

    //  count, but not a number? won't try to convert, just warn/exit
    count = parseInt(aCount, 10);
    if (!TP.isNumber(count)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  number, but less than 1? no work to do
    if (count < 1) {
        return this;
    }

    //  this will check for a valid pair for us
    this.addItem(anObject);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('asArray',
function() {

    /**
     * @method asArray
     * @summary Returns the receiver as an array of key/value pairs. For
     *     example TP.hc('a',1,'b',2).asArray() returns the equivalent of [['a',
     *     1], ['b', 2]].
     * @returns {Object[]} The receiver as an Array.
     */

    return this.getPairs();
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('asHash',
function() {

    /**
     * @method asHash
     * @summary Returns the receiver as a suitable hash. In this type this
     *     method returns the receiver.
     * @returns {TP.core.Hash} The receiver as a TP.core.Hash.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('asIterator',
function(aStep) {

    /**
     * @method asIterator
     * @summary Returns a newly initialized interator on the receiver.
     * @param {Number} aStep The step size for iteration over the receiver.
     * @returns {TP.core.Iterator} An iterator on the receiver.
     */

    return this.getIteratorType().construct(this, aStep);
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('asRange',
function() {

    /**
     * @method asRange
     * @summary Returns a new TP.core.Range based on the size of the receiver.
     * @returns {TP.core.Range} The new range object.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('asString',
function(verbose) {

    /**
     * @method asString
     * @summary Returns the hash as a string.
     * @description Constructs a new string from the hash.
     *     The join is done using the receiver's current 'delimiter' value,
     *     normally ', '. Set the 'delimiter' value on the receiver to use a
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the TP.core.Hash's String representation. The default is true.
     * @returns {String} The receiver as a String.
     */

    var marker,
        wantsVerbose,
        joinCh,
        joinArr,
        keys,
        len,
        i,
        joinStr;

    wantsVerbose = TP.ifInvalid(verbose, true);
    if (!wantsVerbose) {
        return TP.objectToString(this);
    }

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    joinCh = this.$get('delimiter');

    if (!TP.isString(joinCh)) {
        //  If 'joinCh' is not a String, maybe it's a hash or other Object with
        //  a 'join' property.
        if (!TP.isString(joinCh = joinCh.get('join'))) {
            joinCh = '';
        }
    }

    joinArr = TP.ac();

    try {
        keys = TP.keys(this);
        len = keys.getSize();

        for (i = 0; i < len; i++) {
            joinArr.push(
                        TP.join(keys.at(i),
                                ' => ',
                                TP.str(this.at(keys.at(i)), false)));
        }

        joinStr = joinArr.join(joinCh);
    } catch (e) {
        joinStr = this.toString();
    } finally {
        delete this[marker];
    }

    return joinStr;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('collapse',
function() {

    /**
     * @method collapse
     * @summary Returns the receiver.
     * @description This method is defined purely for polymorphic reasons so
     *     that the system can just send 'collapse' to any object. For Arrays
     *     and other collections, the first item is returned.
     * @returns {Object} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------
//  collect                     Kernel
//  ------------------------------------------------------------------------
//  collectGet                  Kernel
//  ------------------------------------------------------------------------
//  collectInvoke               Kernel
//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('compact',
function(aFilter) {

    /**
     * @method compact
     * @summary Returns the receiver with all null/undefined values removed,
     *     meaning any keys whose values are null/undefined will be removed. If
     *     a filtering function is provided then items for which the function
     *     returns true will be removed and all other values will be retained.
     *     In this sense using compact with a filter is like doing a reject()
     *     inline.
     * @param {Function} aFilter The filtering function. This should return true
     *     for values to remove from the collection.
     * @returns {Array} The receiver.
     * @fires Change
     */

    var items,
        filter,

        shouldSignal,

        len,

        thisref;

    filter = aFilter ||
                function(item) {
                    return TP.notValid(item.last());
                };

    items = this.select(
        function(item, index) {

            return filter(item);
        });

    //  turn off change signaling
    shouldSignal = this.shouldSignalChange();
    this.shouldSignalChange(false);

    len = this.getSize();

    thisref = this;

    items.perform(
        function(item) {
            thisref.removeKey(item.first());
        });

    //  re-enable change notification
    this.shouldSignalChange(shouldSignal);

    if (items.getSize() > 0) {
        this.changed('length', TP.DELETE,
                        TP.hc(TP.OLDVAL, len, TP.NEWVAL, this.getSize()));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('conform',
function(anInterface, inline) {

    /**
     * @method conform
     * @summary Returns the receiver with all values which don't implement the
     *     interface removed. The resulting collection's values will, on
     *     completion of this method, respond to the next iteration
     *     (collectInvoke perhaps) that you want to run.
     * @param {String|Array} anInterface A method name or collection of them to
     *     test against.
     * @param {Boolean} inline False to return a new array instead of collapsing
     *     inline. Default is true.
     * @returns {TP.core.Hash} The receiver.
     * @fires Change
     */

    var thisref;

    //  simple select when a new collection is desired
    if (TP.isFalse(inline)) {
        return TP.hc(
            this.select(
                    function(item) {

                        return TP.canInvokeInterface(item, anInterface);
                    }));
    }

    thisref = this;

    //  this loop will clear any values where the value isn't conforming,
    //  which sets the collection up for a compact to remove all nulls
    //  (since they don't conform to any interface)
    this.perform(
        function(item, index) {
            //  NOTE the use of last() here, which is where this differs
            //  from array processing
            if (!TP.canInvokeInterface(item.last(), anInterface)) {
                thisref.atPut(index, null, false);
            }
        });

    return this.compact();
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('contains',
function(anItem, aTest) {

    /**
     * @method contains
     * @summary Returns true if the item (anItem) provided is found in the
     *     receiver. So that hash and array containers can be used for common
     *     operations if anItem is a simple string this method returns true if
     *     that string is a key in the receiver.
     * @param {TPOrderedPair} anItem The item to find in the receiver.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @exception InvalidPair
     * @returns {Boolean} Whether or not the receiver contains the value
     *     provided.
     */

    var val,
        test;

    //  allow contains to work somewhat polymorphically between Hash and
    //  Array types, but note that we
    if (TP.isString(anItem)) {
        return this.containsKey(anItem);
    }

    if (!TP.isPair(anItem)) {
        return this.raise('InvalidPair');
    }

    test = TP.ifInvalid(aTest, TP.EQUALITY);

    if (TP.notDefined(val = this.at(anItem.first()))) {
        return false;
    }

    if (test === TP.EQUALITY) {
        return TP.equal(val, anItem.last());
    } else {
        return TP.identical(val, anItem.last());
    }
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('containsAll',
function(aCollection, aTest) {

    /**
     * @method containsAll
     * @summary Returns true if all the values in the collection provided are
     *     found in the receiver.
     * @param {TPCollection} aCollection The collection of elements all of which
     *     must be equal to at least one element in the receiver for this method
     *     to return true.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @exception TP.sig.InvalidCollection
     * @returns {Boolean} Whether or not the receiver contains all of the values
     *     in the collection provided.
     */

    var arr,
        retval,
        len,
        i;

    if (TP.isArray(aCollection)) {
        arr = aCollection;
    } else {
        if (!TP.canInvoke(aCollection, 'asArray')) {
            return this.raise('TP.sig.InvalidCollection');
        }

        arr = aCollection.asArray();
    }

    if (TP.isEmpty(arr)) {
        return false;
    }

    retval = true;

    len = arr.getSize();
    for (i = 0; i < len; i++) {
        if (!this.contains(arr.at(i), aTest)) {
            retval = false;
            break;
        }
    }

    return retval;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('containsAny',
function(aCollection, aTest) {

    /**
     * @method containsAny
     * @summary Returns true if any of the values in the collection provided
     *     are found in the receiver.
     * @param {TPCollection} aCollection The collection of elements any of which
     *     must be equal to any element in the receiver for this method to be
     *     true.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @exception TP.sig.InvalidCollection
     * @returns {Boolean} Whether or not the receiver contains any of the values
     *     in the collection provided.
     */

    var arr,
        retval,
        len,
        i;

    if (TP.isArray(aCollection)) {
        arr = aCollection;
    } else {
        if (!TP.canInvoke(aCollection, 'asArray')) {
            return this.raise('TP.sig.InvalidCollection');
        }

        arr = aCollection.asArray();
    }

    if (TP.isEmpty(arr)) {
        return false;
    }

    retval = false;

    len = arr.getSize();
    for (i = 0; i < len; i++) {
        if (this.contains(arr.at(i), aTest)) {
            retval = true;
            break;
        }
    }

    return retval;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('containsString',
function(aString) {

    /**
     * @method containsString
     * @summary Returns true if the receiver contains the string provided.
     * @param {String} aString The string value to check for as a value.
     * @returns {Boolean}
     */

    return this.containsValue(aString);
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('convert',
function(aFunction) {

    /**
     * @method convert
     * @summary Converts the values of the receiver in place, altering the
     *     receiver such that the return value of aFunction is used as the new
     *     value for each key/value pair in the receiver.
     * @param {Function} aFunction A function which should return the new value
     *     given an item to process.
     * @returns {TP.core.Hash} The receiver.
     */

    var thisref,

        shouldSignal;

    //  turn off change signaling
    shouldSignal = this.shouldSignalChange();
    this.shouldSignalChange(false);

    thisref = this;

    this.perform(
        function(item, index) {
            thisref.atPut(item.first(), aFunction(item, index));
        });

    //  re-enable change notification
    this.shouldSignalChange(shouldSignal);

    this.changed('value', TP.UPDATE);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('countOf',
function(anItem, aTest) {

    /**
     * @method countOf
     * @summary Returns a count of the number of times anItem is found in the
     *     hash.
     * @param {TPOrderedPair} anItem The item/pair whose value is checked
     *     against.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Number} The number of occurrences of anItem.
     */

    //  since it's an item...key/value...the answer is either 0 or 1...
    return this.contains(anItem, aTest) ? 1 : 0;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('deltas',
function(aHash, aTest) {

    /**
     * @method deltas
     * @summary Compares two hashes as if they are "versions" of the same hash.
     *     The result is an array of triplets containing key, value, and
     *     operation where operation is TP.INSERT, TP.UPDATE, or TP.DELETE.
     *     The incoming hash is treated as the target version while the receiver
     *     is considered the source version. For updates the value provided is
     *     the new value to set in the source to produce the target.
     * @param {TP.core.Hash} aHash The hash to be compared.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Object[]} The change set from aHash to the receiver.
     */

    var sourceKeys,
        targetKeys,
        sourceItem,
        targetItem,
        changeSet,
        thisref;

    if (!TP.isHash(aHash)) {
        return this.raise('InvalidHash', aHash);
    }

    thisref = this;
    changeSet = TP.ac();
    sourceKeys = this.getKeys();
    targetKeys = aHash.getKeys();

    //  Things in the source missing from target were "deleted".
    sourceKeys.difference(targetKeys).forEach(
        function(key) {
            changeSet.push(TP.ac(key, thisref.at(key), TP.DELETE));
        });

    //  Things in the target missing from the source were "inserted".
    targetKeys.difference(sourceKeys).forEach(
        function(key) {
            changeSet.push(TP.ac(key, aHash.at(key), TP.INSERT));
        });

    //  Keys in both are compared by value equality/identity for "updates"
    sourceKeys.intersection(targetKeys).forEach(
        function(key) {
            sourceItem = thisref.at(key);
            targetItem = aHash.at(key);

            switch (aTest) {
                case TP.IDENTITY:
                    if (!TP.identical(sourceItem, targetItem)) {
                        changeSet.push(TP.ac(key, targetItem, TP.UPDATE));
                    }
                    break;
                default:
                    if (!TP.equal(sourceItem, targetItem)) {
                        changeSet.push(TP.ac(key, targetItem, TP.UPDATE));
                    }
                    break;
            }
        });

    return changeSet;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('detect',
function(aFunction) {

    /**
     * @method detect
     * @summary Returns the first element in the receiver which matches the
     *     criteria provided or null if the element isn't found. NOTE that for a
     *     hash the ordering is arbitrary, so this is more like a simple "find"
     *     that's useful when trying to find based on the value rather than key.
     * @param {Function} aFunction A function which should return true if the
     *     element it is passed passes the function's test, or false if it does
     *     not.
     * @returns {Object} The element detected or undefined.
     */

    var retval,
        keys,
        len,
        i,
        key,
        value,
        item;

    keys = this.getKeys();
    len = keys.getSize();

    for (i = 0; i < len; i++) {
        key = keys.at(i);
        value = this.at(key);
        item = [key, value];
        if (aFunction(item, i)) {
            retval = item;
            break;
        }
    }

    return retval;
});

//  ------------------------------------------------------------------------
//  detectInvoke                Kernel
//  ------------------------------------------------------------------------
//  detectMax                   Kernel
//  ------------------------------------------------------------------------
//  detectMin                   Kernel
//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('difference',
function(aCollection, aTest) {

    /**
     * @method difference
     * @summary Returns the elements contained in the receiver which are not in
     *     the collection provided.
     * @description This method can be thought of as subtracting all elements
     *     found in the collection provided from the receiver. What's left are
     *     those elements unique to the receiver.
     * @param {TPCollection} aCollection The collection to difference against
     *     the receiver.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @exception TP.sig.InvalidCollection
     * @returns {Object[]} An array containing the key/value pairs that differ.
     *     Since keys might have different values in different hashes we don't
     *     attempt to turn the list back into a hash.
     */

    var arr;

    if (TP.isArray(aCollection)) {
        arr = aCollection;
    } else {
        if (!TP.canInvoke(aCollection, 'asArray')) {
            return this.raise('TP.sig.InvalidCollection');
        }

        arr = aCollection.asArray();
    }

    return arr.difference(this.getItems(), aTest);
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('disjunction',
function(aCollection, aTest) {

    /**
     * @method disjunction
     * @summary Returns the 'symmetric difference' or those elements which are
     *     disjunct between the two collections. NOTE: this method does not
     *     return a new hash since there may have been key overlaps that would
     *     cause data to be missing from the resulting hash. The array of
     *     ordered pairs returned from this method doesn't suffer from that
     *     problem.
     * @description This method returns a new array containing the disjunction
     *     between the receiver and aCollection. This means that only those
     *     elements which occur in one of the collections but not the other are
     *     returned.
     * @param {TPCollection} aCollection The collection to disjunct against the
     *     receiver.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @exception TP.sig.InvalidCollection
     * @returns {Object[]} An array containing the key/value pairs that differ.
     *     Since keys might have different values in different hashes we don't
     *     attempt to turn the list back into a hash.
     */

    var arr;

    if (TP.isArray(aCollection)) {
        arr = aCollection;
    } else {
        if (!TP.canInvoke(aCollection, 'asArray')) {
            return this.raise('TP.sig.InvalidCollection');
        }

        arr = aCollection.asArray();
    }

    return arr.disjunction(this.getItems(), aTest);
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('empty',
function() {

    /**
     * @method empty
     * @summary Empties the receiver.
     * @returns {TP.core.Hash} The receiver.
     * @fires Change
     */

    var hash,
        keys,
        len,
        i;

    hash = this.$get('$$hash');

    keys = this.getKeys();
    len = keys.getSize();

    for (i = 0; i < len; i++) {
        delete hash[keys[i]];
    }

    this.changed('length', TP.DELETE, TP.hc(TP.OLDVAL, len, TP.NEWVAL, 0));

    return this;
});

//  ------------------------------------------------------------------------
//  flatten                     Kernel
//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('getKeysForValue',
function(aValue, aTest) {

    /**
     * @method getKeysForValue
     * @summary Returns an array containing the keys where the value matches the
     *     supplied value, according to the test.
     * @param {Object} aValue The value to check.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {String[]} An array of the keys for the supplied value.
     */

    var arr,

        keys,
        hash,

        val,

        i;

    arr = TP.ac();

    keys = TP.keys(this);

    if (TP.notNull(hash = this.$get('$$hash'))) {
        for (i = 0; i < keys.length; i++) {

            val = hash[keys[i]];

            switch (aTest) {
                case TP.IDENTITY:
                    if (TP.identical(aValue, val)) {
                        arr.push(keys[i]);
                    }
                    break;
                default:
                    if (TP.equal(aValue, val)) {
                        arr.push(keys[i]);
                    }
            }
        }
    }

    return arr;
});

//  ------------------------------------------------------------------------
//  getItems                    Kernel
//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('getIterator',
function() {

    /**
     * @method getIterator
     * @summary Returns the iterator used for the receiver. You shouldn't count
     *     on this being set at the start or in having any particular ordering.
     *     See the TP.core.Iterator type for information on how to order the
     *     iteration.
     * @returns {TP.core.Iterator} The iterator.
     */

    if (TP.notValid(this.$get('iterator'))) {
        this.$set('iterator', this.asIterator());
    }

    return this.$get('iterator');
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('getIteratorType',
function() {

    /**
     * @method getIteratorType
     * @summary Returns the type of iterator used for the receiver.
     * @returns {TP.core.Iterator} The type of the iterator.
     */

    var type;

    if (TP.notValid(type = TP.sys.getTypeByName('TP.core.Iterator'))) {
        return this.raise('TP.sig.TypeNotFound');
    }

    return type;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('getSize',
function() {

    /**
     * @method getSize
     * @summary Returns the size of the receiver.
     * @returns {Number} The size.
     */

    return this.getKeys().getSize();
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('getValues',
function() {

    /**
     * @method getValues
     * @summary Returns an array containing the values for the objects'
     *     attributes.
     * @returns {String[]} An array of the values for the receiver's keys.
     */

    var arr,
        keys,
        hash,
        i;

    arr = TP.ac();

    keys = TP.keys(this);

    if (TP.notNull(hash = this.$get('$$hash'))) {
        for (i = 0; i < keys.length; i++) {
            arr.push(hash[keys[i]]);
        }
    }

    return arr;
});

//  ------------------------------------------------------------------------
//  grep                        Kernel
//  ------------------------------------------------------------------------
//  groupBy                     Kernel
//  ------------------------------------------------------------------------
//  injectInto                  Kernel
//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('intersection',
function(aCollection, aTest) {

    /**
     * @method intersection
     * @summary Returns the intersection of the two collections as a new
     *     TP.core.Hash.
     * @description This method returns a hash of those elements which occur in
     *     BOTH the receiver and in aCollection. NOTE that both the keys and the
     *     values are used in testing.
     * @param {TPCollection} aCollection The collection to intersect the
     *     receiver with.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @exception TP.sig.InvalidCollection
     * @returns {TP.core.Hash} A hash containing the elements in the
     *     intersection of the two collections.
     */

    var arr;

    if (TP.isArray(aCollection)) {
        arr = aCollection;
    } else {
        if (!TP.canInvoke(aCollection, 'asArray')) {
            return this.raise('TP.sig.InvalidCollection');
        }

        arr = aCollection.asArray();
    }

    return arr.intersection(this.getItems(), aTest).asHash();
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('$$isCollection',
function() {

    /**
     * @method $$isCollection
     * @summary Returns true if the receiver is a collection instance.
     * @returns {Boolean} True if the receiver is a collection.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('isSortedCollection',
function() {

    /**
     * @method isSortedCollection
     * @summary Returns true if the receiver is behaving as a sorted
     *     collection. Effectively true any time the receiver has a valid sort
     *     function assigned.
     * @description Objects cannot maintain their content in a sorted fashion
     *     although their keys may be sorted if a sort function has been
     *     defined. In that case this method returns true.
     * @returns {Boolean} Whether this hash is a sorted collection or not.
     */

    return TP.isCallable(this.getSortFunction());
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('merge',
function(varargs) {

    /**
     * @method merge
     * @summary Merge the receiver's elements with elements from one or more
     *     collections.
     * @param {arguments} varargs Variable-length argument list of other
     *     collections
     * @returns {TP.core.Hash} A hash containing the merged values from the
     *     receiver and all of the supplied collections.
     */

    var arr,

        result,

        len,
        i,

        otherCollection,
        otherKeys,

        len2,
        j;

    arr = TP.args(arguments);
    arr.unshift(this);

    result = TP.hc();

    len = arr.getSize();
    for (i = 0; i < len; i++) {
        otherCollection = arr.at(i);
        otherKeys = otherCollection.getKeys();
        len2 = otherKeys.getSize();

        for (j = 0; j < len2; j++) {
            result.atPut(otherKeys.at(j),
                            otherCollection.at(otherKeys.at(j)));
        }
    }

    return result;
});

//  ------------------------------------------------------------------------
//  partition                   Kernel
//  ------------------------------------------------------------------------
//  perform                     Kernel
//  ------------------------------------------------------------------------
//  performInvoke               Kernel
//  ------------------------------------------------------------------------
//  performSet                  Kernel
//  ------------------------------------------------------------------------
//  performUntil                Kernel
//  ------------------------------------------------------------------------
//  performWhile                Kernel
//  ------------------------------------------------------------------------
//  performWith                 Kernel
//  ------------------------------------------------------------------------
//  reject                      Kernel
//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('remove',
function(anItem, aTest) {

    /**
     * @method remove
     * @summary Removes an item from the receiver.
     * @description In this method, all instances of the item are removed. The
     *     key and value must match for the item to be removed. If you want to
     *     remove the key without concern for whether the value matches use
     *     removeKey or removeAt.
     * @param {TPOrderedPair} anItem The item to be removed.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @exception InvalidItem
     * @exception InvalidPair
     * @returns {Number} The count of items removed.
     * @fires Change
     */

    var count;

    count = this.contains(anItem, aTest) ? 1 : 0;

    if (count > 0) {
        //  should signal for us
        this.removeKey(anItem.first());
    }

    return count;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('removeAll',
function(aCollection, aTest) {

    /**
     * @method removeAll
     * @summary Removes the items contained in the collection from the
     *     receiver.
     * @param {TPCollection} aCollection The collection of items to remove.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.InvalidCollection
     * @returns {Number} The count of items removed.
     * @fires Change
     */

    var arr,
        count,
        thisref,

        len,

        shouldSignal;

    if (TP.isArray(aCollection)) {
        arr = aCollection;
    } else {
        if (!TP.canInvoke(aCollection, 'asArray')) {
            this.raise('TP.sig.InvalidCollection');
            return 0;
        }

        arr = aCollection.asArray();
    }

    count = 0;
    thisref = this;

    len = this.getSize();

    shouldSignal = this.shouldSignalChange();

    try {
        arr.perform(
            function(item, index) {
                //  turn off change signaling - 'remove' will reset this
                //  setting, so redo each time through loop.
                thisref.shouldSignalChange(false);

                count += thisref.remove(item, aTest);
            });
    } finally {
        //  re-enable change notification
        this.shouldSignalChange(shouldSignal);
    }

    if (count > 0) {
        this.changed('value', TP.DELETE,
                        TP.hc(TP.OLDVAL, len, TP.NEWVAL, this.getSize()));
    }

    return count;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('replace',
function(oldItem, newItem, aTest) {

    /**
     * @method replace
     * @summary Replaces the item having the value oldItem with an item having
     *     the value newItem.
     * @param {TPOrderedPair} oldItem The old item to look for.
     * @param {TPOrderedPair} newItem The new item to replace the old item with.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @exception TP.sig.InvalidParameter
     * @exception InvalidPair
     * @returns {Object} The receiver.
     * @fires Change
     */

    var shouldSignal;

    if (!TP.isPair(oldItem) || !TP.isPair(newItem)) {
        this.raise('InvalidPair');

        return 0;
    }

    //  do we have a match or not?
    if (!this.contains(oldItem, aTest)) {
        return 0;
    }

    //  turn off change signaling
    shouldSignal = this.shouldSignalChange();
    this.shouldSignalChange(false);

    try {
        this.remove(oldItem, aTest);
        this.add(newItem);

        this.changed('value', TP.UPDATE);
    } finally {
        //  re-enable change notification
        this.shouldSignalChange(shouldSignal);
    }

    return 1;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('replaceAll',
function(aCollection, newItem, aTest) {

    /**
     * @method replaceAll
     * @summary Replaces all the items in aCollection with the newItem.
     * @param {TPCollection} aCollection A collection of old items to replace.
     * @param {TPOrderedPair} newItem The new item to replace the old items
     *     with.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @exception TP.sig.InvalidCollection
     * @exception TP.sig.InvalidPair,
     * @exception TP.sig.InvalidParameter
     * @returns {Object} The receiver.
     * @fires Change
     */

    var arr,
        count,
        thisref,

        shouldSignal;

    if (TP.isArray(aCollection)) {
        arr = aCollection;
    } else {
        if (!TP.canInvoke(aCollection, 'asArray')) {
            return this.raise('TP.sig.InvalidCollection');
        }

        arr = aCollection.asArray();
    }

    count = 0;
    thisref = this;

    shouldSignal = this.shouldSignalChange();

    try {
        arr.perform(
            function(item, index) {
                //  turn off change signaling - 'replace' will reset this
                //  setting, so redo each time through loop.
                thisref.shouldSignalChange(false);

                count += thisref.replace(item, newItem, aTest);
            });
    } finally {
        //  re-enable change notification
        this.shouldSignalChange(shouldSignal);
    }

    if (count > 0) {
        this.changed('value', TP.UPDATE);
    }

    return count;
});

//  ------------------------------------------------------------------------
//  select                      Kernel
//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('transpose',
function() {

    /**
     * @method transpose
     * @summary Transposes the keys and values of the receiver, creating a
     *     reverse-lookup version of the receiver.
     * @description Note that the sort order (if any) of the keys determines how
     *     duplicate values will ultimately be handled (ie. which key 'wins'
     *     when there are multiple values whose keys will collide).
     * @returns {TP.core.Hash} A new instance with the values and keys reversed.
     */

    var dict;

    dict = TP.hc();

    return this.injectInto(
            dict,
            function(item, accum, index) {

                var key;

                if (TP.isValid(key = item.last())) {
                    accum.atPut(key, item.first());
                }

                return accum;
            });
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('union',
function(aCollection, aFunction) {

    /**
     * @method union
     * @summary Returns a new Hash containing the items combining the keys and
     *     values of both objects. When aFunction is provided it is used to
     *     produce a return value for duplicate keys, otherwise the incoming
     *     collection's values will replace the receiver's values.
     * @param {TPCollection} aCollection An object containing key/value data to
     *     be combined with the receiver.
     * @param {Function} aFunction A function accepting a key and two values
     *     (key, old, new) which returns the value to use for the key.
     * @returns {TP.core.Hash} A new hash containing items from both
     *     collections.
     */

    var dups,
        hash,

        thisref;

    if (!TP.canInvoke(aCollection, 'getKeys')) {
        return this.raise('TP.sig.InvalidCollection',
                'Collection must support getKeys for union operation.');
    }

    hash = this.copy();

    thisref = this;

    if (TP.isCallable(aFunction)) {
        //  going to try to resolve duplicate key issues so we need to
        //  collect the actual values via the function
        dups = this.getKeys().intersection(aCollection.getKeys());

        if (TP.notEmpty(dups)) {

            dups.convert(
                function(key) {

                    return TP.ac(key,
                                aFunction(key,
                                            thisref.at(key),
                                            aCollection.at(key)));
                });

            hash.addAll(aCollection);
            hash.addAll(dups);

            return hash;
        }
    }

    return hash.addAll(aCollection);
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('unique',
function(aTest) {

    /**
     * @method unique
     * @summary Collapses the receiver to contain only 1 of each unique value.
     *     For a hash this is a no-op since each item is inherently a unique
     *     key/value combination.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Object} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------
//  TPIndexedCollection Interface
//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('addAt',
function(aValue, anIndex) {

    /**
     * @method addAt
     * @summary Adds the value provided at anIndex.
     * @param {Object} aValue The value to add at anIndex.
     * @param {Number} anIndex The index to add aValue at.
     * @exception TP.sig.InvalidIndex
     * @returns {Object} The receiver.
     * @fires Change
     */

    if (TP.notValid(anIndex)) {
        return this.raise('TP.sig.InvalidIndex');
    }

    return this.atPut(anIndex, aValue);
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('addAllAt',
function(aCollection, anIndex) {

    /**
     * @method addAllAt
     * @summary Adds aCollection at the index provided. NOTE that the entire
     *     collection becomes the value for the key provided.
     * @param {TPCollection} aCollection The collection to add.
     * @param {Number} anIndex The index to add elements.
     * @exception TP.sig.InvalidIndex
     * @returns {Object} The receiver.
     * @fires Change
     */

    return this.addAt(aCollection, anIndex);
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('at',
function(anIndex) {

    /**
     * @method at
     * @summary Returns the value at the index provided.
     * @param {Object} anIndex The index to use for locating the value. Note
     *     that this is usually a string, but could be any object. This method
     *     is designed to protect against returning any of the receiver's
     *     methods.
     * @returns {Object|undefined} The item at the index provided or undefined.
     */

    var hash;

    hash = this.$get('$$hash');

    //  Make sure that our internal hash is real.
    if (!hash) {
        return;
    }

    //  null or undefined will be distinguished properly for callers.
    return hash[anIndex];
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('atAll',
function(aCollection) {

    /**
     * @method atAll
     * @summary Returns an array containing the values at each of the indices
     *     provided.
     * @param {TPCollection} aCollection The collection of indexes.
     * @exception TP.sig.InvalidCollection
     * @returns {Object[]} A new array containing the values collected.
     */

    var arr,
        thisref;

    if (!TP.canInvoke(aCollection, 'perform')) {
        return this.raise(
                    'TP.sig.InvalidCollection',
                    'Collection must support perform for atAll operation.');
    }

    arr = TP.ac();
    thisref = this;

    aCollection.perform(
        function(item, index) {
            arr.push(thisref.at(item));
        });

    return arr;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('atAllPut',
function(aCollection, aValue) {

    /**
     * @method atAllPut
     * @summary Inserts aValue at a set of locations.
     * @description Places aValue at each location in the receiver. If the
     *     optional collection is provided the indices listed in the collection
     *     are updated rather than the entire collection.
     * @param {TPCollection} aCollection An optional collection specifying
     *     indexes which should be altered to contain aValue.
     * @param {Object} aValue The element to put at all the locations in this
     *     collection (unless aCollection of indexes is provided).
     * @exception TP.sig.InvalidCollection
     * @returns {Object} The receiver.
     * @fires Change
     */

    var count,
        thisref;

    if (!TP.canInvoke(aCollection, 'perform')) {
        this.raise('TP.sig.InvalidCollection',
                    'Collection must support perform for atAll operation.');
        return this;
    }

    count = 0;
    thisref = this;

    aCollection.perform(
        function(item, index) {
            if (!TP.equal(thisref.at(item), aValue)) {
                thisref.atPut(item, aValue, false);
                count++;
            }

            return;
        });

    if (count > 0) {
        this.changed('value', TP.UPDATE);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('atIfInvalid',
function(anIndex, aDefault) {

    /**
     * @method atIfInvalid
     * @summary Returns the value at the index provided or the default value if
     *     the key doesn't exist.
     * @description If a Function is supplied as the default value to this
     *     method, it will be executed and its value will be returned as the
     *     value. Therefore, this method cannot be used if the Function object
     *     itself is what is desired as the returned value.
     * @param {Object} anIndex The index of the value to return.
     * @param {Object} aDefault The default value to return if invalid.
     * @returns {Object} The element at anIndex in this collection.
     */

    var value;

    if (TP.isValid(value = this.at(anIndex))) {
        return value;
    } else if (TP.isCallable(aDefault)) {
        return aDefault();
    } else {
        return aDefault;
    }
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('atIfNull',
function(anIndex, aDefault) {

    /**
     * @method atIfNull
     * @summary Returns the value at the index provided or the default value if
     *     the key returns a value of null (not undefined).
     * @description If a Function is supplied as the default value to this
     *     method, it will be executed and its value will be returned as the
     *     value. Therefore, this method cannot be used if the Function object
     *     itself is what is desired as the returned value.
     * @param {Object} anIndex The index of the value to return.
     * @param {Object} aDefault The default value to return if null.
     * @returns {Object} The element at anIndex in this collection.
     */

    var value;

    if (TP.notNull(value = this.at(anIndex))) {
        return value;
    } else if (TP.isCallable(aDefault)) {
        return aDefault();
    } else {
        return aDefault;
    }
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('atIfUndefined',
function(anIndex, aDefault) {

    /**
     * @method atIfUndefined
     * @summary Returns the value at the index provided or the default value if
     *     the key returns undefined.
     * @description If a Function is supplied as the default value to this
     *     method, it will be executed and its value will be returned as the
     *     value. Therefore, this method cannot be used if the Function object
     *     itself is what is desired as the returned value.
     * @param {Object} anIndex The index of the value to return.
     * @param {Object} aDefault The default value to return if undefined.
     * @returns {Object} The element at anIndex in this collection.
     */

    var value;

    if (TP.isDefined(value = this.at(anIndex))) {
        return value;
    } else if (TP.isCallable(aDefault)) {
        return aDefault();
    } else {
        return aDefault;
    }
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('atPath',
function(anIndex) {

    /**
     * @method atPath
     * @summary Retrieves the value at the 'end' of set of TP.core.Hashes that
     *     should each match an entry in the dot-separated index.
     * @param {String} anIndex The 'dot separated' path to retrieve the value
     *     from.
     * @returns {Object|undefined} The item at the index provided or undefined.
     */

    var entry,
        indices,

        len,
        i,

        index,

        item;

    if (!/\./.test(anIndex)) {
        //  TODO: Throw an exception here?
        return;
    }

    /* eslint-disable consistent-this */
    entry = this;

    indices = anIndex.split('.');

    len = indices.getSize();
    for (i = 0; i < len; i++) {
        index = indices.at(i);

        //  If we're at the last position, then we get the real value
        if (i === len - 1) {
            return entry.at(index);
        } else {
            //  Otherwise, we see if there's a TP.core.Hash at that
            //  position. If not, we return null. Otherwise, we set the next
            //  'entry' to be the 'next TP.core.Hash in line'
            item = entry.at(index);

            if (!TP.isHash(item)) {
                return null;
            }

            entry = item;
        }
    }
    /* eslint-enable consistent-this */

    return null;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('atPathPut',
function(anIndex, aValue) {

    /**
     * @method atPathPut
     * @summary Places the supplied value at the 'end' of set of TP.core.Hashes
     *     that should each match an entry in the dot-separated index. If a
     *     TP.core.Hash isn't found at that entry in the hash at the current
     *     entry point, one is created.
     * @param {String} anIndex The 'dot separated' path to put aValue into.
     * @param {Object} aValue The value to place at the end of the path.
     * @example Construct a series of TP.core.Hashes 'along a path' and place a
     *     value in the last one:
     *     <code>
     *          myHash = TP.hc();
     *          myHash.atPathPut('foo.bar.baz', 'moo');
     *          myHash.asSource();
     *          <samp>TP.hc('foo', TP.hc('bar', TP.hc('baz', 'moo')))</samp>
     *     </code>
     * @returns {TP.core.Hash} The receiver.
     * @fires Change
     */

    var entry,
        indices,

        shouldSignal,

        op,

        len,
        i,

        index,

        val,
        item;

    if (!/\./.test(anIndex)) {
        //  TODO: Throw an exception here?
        return this;
    }

    /* eslint-disable consistent-this */
    entry = this;

    indices = anIndex.split('.');

    //  Turn off change signaling (after capturing the previous setting).
    //  We'll signal ourself using the path at the bottom.
    shouldSignal = this.shouldSignalChange();
    this.shouldSignalChange(false);

    op = null;

    len = indices.getSize();
    for (i = 0; i < len; i++) {
        index = indices.at(i);

        //  If we're at the last position, then we set the real value
        if (i === len - 1) {
            //  If an op wasn't already set below (i.e. we didn't
            //  actually create any hashes), and we were signaling Change
            //  then set it to either TP.INSERT or TP.UPDATE.
            if (TP.notValid(op) && shouldSignal) {
                if (TP.notDefined(val = entry.at(index))) {
                    op = TP.INSERT;
                } else {
                    //  We need to compare values to see if this is truly a
                    //  TP.UPDATE (which will only occur if the *values are
                    //  different*).
                    if (!TP.equal(val, aValue)) {
                        op = TP.UPDATE;
                    }
                }
            }

            entry.atPut(index, aValue);
        } else {
            //  Otherwise, we see if there's a TP.core.Hash at that
            //  position. If not, we create one. In either case, we set the
            //  next 'entry' to be the 'next TP.core.Hash in line'
            item = entry.at(index);

            if (!TP.isHash(item)) {
                item = TP.hc();
                entry.atPut(index, item);
                op = TP.INSERT;
            }

            entry = item;
        }
    }
    /* eslint-enable consistent-this */

    //  set change signaling back to its previous setting
    this.shouldSignalChange(shouldSignal);

    //  'changed' will check further to see if we signal Change.
    if (TP.isValid(op)) {
        this.changed(anIndex, op);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('atPut',
function(anIndex, aValue) {

    /**
     * @method atPut
     * @summary Replaces the value at anIndex with aValue.
     * @param {Object} anIndex The index to put aValue into.
     * @param {Object} aValue The value to place at anIndex.
     * @returns {TP.core.Hash} The receiver.
     * @fires Change
     */

    var hash,
        shouldSignal,
        op,
        val,
        changeRecord,
        changeRecordHash;

    hash = this.$get('$$hash');
    shouldSignal = this.shouldSignalChange();
    op = null;

    //  three things matter here...that we add the index to our key array,
    //  that we update our hash with the key/value pair, and that we
    //  signal changes

    //  setting a key to undefined deletes it
    if (TP.notDefined(aValue)) {
        //  This method will take care of both removing the key and deleting
        //  the slot on our internal hash.
        this.$removeInternalKey(anIndex);
        op = TP.DELETE;
    } else {
        //  If we don't know about this value, or its a property but not on
        //  us, then this is an insert and requires a key array update.
        if (TP.notDefined(hash[anIndex]) || !TP.owns(hash, anIndex)) {
            hash[anIndex] = aValue;

            op = TP.INSERT;
        } else {
            //  Otherwise, this is an update.

            //  If we're signaling Change, we need to compare values to see
            //  if this is truly a TP.UPDATE (which will only occur if the
            //  *values are different*).
            if (shouldSignal) {
                val = hash[anIndex];

                if (!TP.equal(val, aValue)) {
                    hash[anIndex] = aValue;
                    if (TP.notValid(op)) {
                        op = TP.UPDATE;
                    }
                }
            } else {
                //  Otherwise, we're not gonna signal Change so we just set
                //  the slot and return.
                hash[anIndex] = aValue;

                return this;
            }
        }
    }

    //  'changed' will check further to see if we signal Change.
    if (TP.isValid(op) && shouldSignal) {
        //  NB: Here, we cannot use the normal TP.hc(arguments...) form of the
        //  constructor or we'll loop endlessly back into this method. We must
        //  use lower-level constructs.
        //  this.changed(anIndex, op, TP.hc(TP.OLDVAL, val, TP.NEWVAL, aValue));

        changeRecord = TP.hc();

        changeRecordHash = changeRecord.$get('$$hash');

        changeRecordHash[TP.OLDVAL] = val;
        changeRecordHash[TP.NEWVAL] = aValue;

        this.changed(anIndex, op, changeRecord);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('atPutIfAbsent',
function(aKey, aValue) {

    /**
     * @method atPutIfAbsent
     * @summary Add the key and value if the key doesn't already exist. NOTE
     *     that the value isn't relevant in this test, the value may be null, or
     *     undefined, and as long at the key has been defined at some point this
     *     method will not update the value.
     * @param {Object} aKey The key to test and optionally add to the receiver.
     * @param {Object} aValue Optional value to store when the first argument is
     *     a string.
     * @exception InvalidPair
     * @returns {Object} The key's value after processing.
     * @fires Change
     */

    return this.addIfAbsent(aKey, aValue);
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('containsKey',
function(aKey) {

    /**
     * @method containsKey
     * @summary Returns true if the receiver contains the key provided.
     * @param {Object} aKey The key to test.
     * @returns {Boolean}
     */

    return TP.isDefined(this.at(aKey));
});

//  ------------------------------------------------------------------------
//  containsValue               Kernel
//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('detectKeyAt',
function(aKey, anIndex) {

    /**
     * @method detectKeyAt
     * @summary Searches for the first nested element whose value at(anIndex)
     *     matches aKey. This can be a useful detection for finding data in an
     *     ordered collection (array, sorted hash, or node) by the value at a
     *     particular index or attribute location.
     * @param {String|RegExp} aKey The string or regular expression selector to
     *     match with.
     * @param {Number} anIndex The "column" index to check in each nested array.
     * @returns {Object[]} The nested array whose value at anIndex matches aKey.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('getKeys',
function() {

    /**
     * @method getKeys
     * @summary Returns the unique keys of the receiver.
     * @description If the receiver has a sort function defined the keys are
     *     sorted. The result is that all methods which use the key array as a
     *     focal point for iteration effectively work to produce output sorted
     *     by the ordering of the keys.
     * @returns {String[]} An array containing the receiver's keys.
     */

    var arr,
        func;

    arr = TP.objectGetKeys(this.$get('$$hash'));

    func = this.getSortFunction();
    if (!func) {
        return arr;
    }

    return arr.sort(func);
});

//  ------------------------------------------------------------------------
//  getKVPairs                  Kernel
//  ------------------------------------------------------------------------
//  getPairs                    Kernel
//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('getPosition',
function(aValue, aTest) {

    /**
     * @method getPosition
     * @summary Returns the first index of the element provided or undefined if
     *     the element isn't found. For hashes with a sort function the ordering
     *     will be relevant, otherwise it will be random and the results will be
     *     unpredictable.
     * @param {Object} aValue What to search for.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Object|undefined} The index of the value or undefined.
     */

    var found;

    found = this.detect(
        function(item, index) {

            switch (aTest) {
                case TP.IDENTITY:
                    return TP.identical(item.last(), aValue);
                default:
                    return TP.equal(item.last(), aValue);
            }
        });

    if (TP.isValid(found)) {
        return found.first();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('getPositions',
function(aValue, aTest) {

    /**
     * @method getPositions
     * @summary Returns an array containing all indexes where aValue exists. No
     *     particular order is implied however sorted hashes will return the
     *     indexes in the order defined by their sort function.
     * @param {Object} aValue The value to search for.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Number[]} A new array of indexes.
     */

    var items;

    items = this.select(
        function(item, index) {

            switch (aTest) {
                case TP.IDENTITY:
                    return TP.identical(item.last(), aValue);
                default:
                    return TP.equal(item.last(), aValue);
            }
        });

    //  return the keys from our itemset, those are our 'indexes'
    return items.collect(
                    function(item) {
                        return item.first();
                    });
});

//  ------------------------------------------------------------------------
//  grepKeys                    Kernel
//  ------------------------------------------------------------------------
//  performOver                 Kernel
//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('removeAt',
function(anIndex) {

    /**
     * @method removeAt
     * @summary Removes the element at the index provided.
     * @param {Object} anIndex The index at which to remove the element.
     * @returns {Object} The receiver.
     * @fires Change
     */

    return this.removeKey(anIndex);
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('removeAtAll',
function(aCollection) {

    /**
     * @method removeAtAll
     * @summary Provides a way to remove a collection of keys (and their
     *     values) from the collection.
     * @param {TPCollection} aCollection A collection of keys.
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.InvalidCollection
     * @returns {Object} The receiver.
     * @fires Change
     */

    var count,
        thisref,

        shouldSignal;

    if (!TP.canInvoke(aCollection, 'perform')) {
        return this.raise(
                    'TP.sig.InvalidCollection',
                    'Collection must support perform for atAll operation.');
    }

    count = 0;
    thisref = this;

    shouldSignal = this.shouldSignalChange();

    try {
        aCollection.perform(
            function(item, index) {
                //  duplicate test, but we want to know if we should count
                if (TP.isDefined(thisref.at(item))) {
                    //  turn off change signaling - 'removeKey' will reset
                    //  this setting, so redo each time through loop.
                    thisref.shouldSignalChange(false);

                    thisref.removeKey(item);
                    count++;
                }

                return this;
            });
    } finally {
        //  re-enable change notification
        this.shouldSignalChange(shouldSignal);
    }

    if (count > 0) {
        this.changed('value', TP.DELETE);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('removeKey',
function(aKey) {

    /**
     * @method removeKey
     * @summary Removes the key provided if the collection contains it. Note
     *     that this won't remove a key if the key references a method.
     * @param {Object} aKey The key value to remove.
     * @exception TP.sig.InvalidParameter
     * @returns {Object} The receiver.
     * @fires Change
     */

    if (TP.isEmpty(aKey)) {
        return this.raise(
                    'TP.sig.InvalidParameter',
                    'Empty key provided.');
    }

    if (TP.isDefined(this.at(aKey))) {
        this.$removeInternalKey(aKey);

        this.changed(aKey, TP.DELETE);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('removeKeys',
function(aKeyArray) {

    /**
     * @method removeKeys
     * @summary Removes the keys provided if the collection contains them. Note
     *     that this won't remove a key if the key references a method.
     * @param {String[]} aKeyArray The key values to remove.
     * @exception TP.sig.InvalidParameter
     * @returns {Object} The receiver.
     * @fires Change
     */

    var changed,

        len,
        i;

    if (!TP.isArray(aKeyArray)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Invalid key array provided.');
    }

    changed = false;

    len = aKeyArray.getSize();
    for (i = 0; i < len; i++) {
        if (TP.isDefined(this.at(aKeyArray.at(i)))) {
            this.$removeInternalKey(aKeyArray.at(i));
            changed = true;
        }
    }

    if (changed) {
        this.changed('value', TP.DELETE);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('transpose',
function() {

    /**
     * @method transpose
     * @summary
     * @returns {TP.core.Hash}
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------
//  TPSortedCollection
//  ------------------------------------------------------------------------

/*
By associating a sort function with the Hash we allow you to effectively use
a Hash as a sorted collection. The sort function is applied to the getKeys
calls used to drive iteration, thereby allowing you to have predictable
ordering to the Hash. NOTE that there is no default sort block so without
setting a sort function for the Hash no sort overhead is incurred.
*/

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('getSortFunction',
function() {

    /**
     * @method getSortFunction
     * @summary Returns the current sort function or null.
     * @returns {Function} This array's sort function.
     */

    return this.sortFunction;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('setSortFunction',
function(aFunction) {

    /**
     * @method setSortFunction
     * @summary Sets the receiver's internal sort function.
     * @description This function will be called any time the receiver has been
     *     updated without being sorted and a request for a value is made. This
     *     method will flag the receiver so that a re-sort will occur on the
     *     next data access call.
     * @param {Function} aFunction The function to set this array's sort
     *     function to.
     * @exception TP.sig.InvalidFunction
     * @returns {TP.core.Hash} The receiver.
     * @fires Change
     */

    //  no change? don't waste time
    if (TP.identical(aFunction, this.sortFunction)) {
        return this;
    }

    this.sortFunction = aFunction;

    //  notify, since our order will be different for consumers
    this.changed('order', TP.SORTED);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('sort',
function(aSortFunction) {

    /**
     * @method sort
     * @summary Sorts the receiver's keys, possibly reordering the items in the
     *     receiver. NOTE that if no function is supplied here and the receiver
     *     doesn't have a sort function installed via setSortFunction(), the
     *     results are sorted alphabetically by key string values.
     * @param {Function} aSortFunction A function capable of sorting the
     *     receiver's key array.
     * @returns {TP.core.Hash} The receiver.
     */

    var func;

    func = aSortFunction || this.getSortFunction();

    //  Have to avoid passing null to sort() on FF or it freaks out.
    if (TP.isCallable(func)) {
        TP.keys(this).sort(func);
    } else {
        TP.keys(this).sort();
    }

    this.changed('order', TP.SORTED);

    return this;
});

//  ------------------------------------------------------------------------
//  DNU HANDLING
//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('canResolveDNU',
function(anOrigin, aMethodName, anArgArray, callingContext) {

    /**
     * @method canResolveDNU
     * @summary Provides an instance that has triggered the DNU machinery with
     *     an opportunity to handle the problem itself. For TP.core.Hash
     *     instances this results in a test to see if the method is a getter and
     *     whether the receiver has a key fitting a pattern such that at() would
     *     resolve the query.
     * @param {Object} anOrigin The object asking for help. The receiver in this
     *     case.
     * @param {String} aMethodName The method name that failed.
     * @param {Object[]} anArgArray Optional arguments to function.
     * @param {Function|arguments} callingContext The calling context.
     * @returns {Boolean} TRUE means resolveDNU() will be called. FALSE means
     *     the standard DNU machinery will continue processing. The default is
     *     FALSE.
     */

    var key;

    if (TP.regex.GETTER.test(aMethodName)) {

        key = aMethodName.replace(
                TP.regex.GETTER,
                function(whole, part) {

                    return part.toLowerCase();
                });

        return TP.isDefined(this.at(key));
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.core.Hash.Inst.defineMethod('resolveDNU',
function(anOrigin, aMethodName, anArgArray, callingContext) {

    /**
     * @method resolveDNU
     * @summary Invoked by the main DNU machinery when the instance has
     *     responded TRUE to canResolveDNU() for the parameters given. For a
     *     hash this means returning the key in question based on the "getter"
     *     prefix being removed.
     * @param {Object} anOrigin The object asking for help.
     * @param {String} aMethodName The method name that failed.
     * @param {Object[]} anArgArray Optional arguments to function.
     * @param {Function|arguments} callingContext The calling context.
     * @returns {Object} The results of function resolution.
     */

    var key;

    key = aMethodName.replace(
            TP.regex.GETTER,
            function(whole, part) {

                return part.toLowerCase();
            });

    return this.at(key);
});

//  ========================================================================

/**
 * @type {TP.core.Iterator}
 * @summary TP.core.Iterator supports collection iteration.
 * @description TP.core.Iterator implements the TP.api.IterationAPI protocol as
 *     well as defining some basic constants and function implementions.
 * @example
 *     //  to print out a collection's elements
 *     var it = aCollection.asIterator();
 *     while (!it.atEnd()) {
 *         TP.info(it.nextValue());
 *     }
 *
 *     //   to do it in reverse
 *     var it = aCollection.asIterator();
 *     it.reverse();
 *     while (!it.atEnd()) {
 *         TP.info(it.nextValue());
 *     }
 *
 *     //  to locate a value and get the index of it
 *     while (!it.atEnd()) {
 *         if (it.nextValue() == aValue) {
 *             return it.currentKey();
 *         }
 *     }
 *
 *     //  slicing
 *     it.seek(start);
 *     while (!it.atEnd() && (it.currentKey() != end) {
 *         arr.push(it.nextValue());
 *     }
 *
 *     //   get current value (what nextValue() last returned)
 *     it.currentValue();
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.Iterator');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the current step amount, always a positive increment
TP.core.Iterator.Inst.defineAttribute('step');

//  create the range we're working with, the "viewport" of indices
TP.core.Iterator.Inst.defineAttribute('range');

//  the collection we're iterating on
TP.core.Iterator.Inst.defineAttribute('coll');

//  are we "active", i.e. have we started iterating??
TP.core.Iterator.Inst.defineAttribute('active', false);

//  the keys for the collection, which is what we really iterate on
TP.core.Iterator.Inst.defineAttribute('keys');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Iterator.Inst.defineMethod('init',
function(aCollection, aStep) {

    /**
     * @name init
     * @summary Initialize the iterator instance.
     * @param {TP.api.CollectionAPI} aCollection The collection to iterate over.
     * @param {Number} aStep The step size to use. Iteration can occur in
     *     "steps" by setting a size other than 1. The default is 1.
     * @exception TP.sig.InvalidCollection
     * @returns {TP.core.Iterator} A new instance.
     * @todo
     */

    var i,
        step,
        range;

    if (TP.notValid(aCollection)) {
        return TP.raise(this, 'TP.sig.InvalidCollection', arguments);
    }

    this.callNextMethod();

    step = TP.ifInvalid(aStep, 1);
    this.$set('step', (1).max(step));
    step = this.$get('step');

    //  range is our internal set of indices
    range = TP.ac();
    this.$set('range', range);

    //  set up for 0 thru step-1 as starting range "ready" but not "active"
    for (i = 0; i < step; i++) {
        range.atPut(i, i);
    }

    //  capture the collection reference
    this.$set('coll', aCollection);

    //  no filtering but we force iteration on all keys via includeUndef
    this.$set('keys', aCollection.getKeys(null, true));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Iterator.Inst.defineMethod('atEnd',
function() {

    /**
     * @name atEnd
     * @summary Returns true if the iterator is positioned at the end. The
     *     'end' may be the front of the collection if reverse() has been
     *     called.
     * @returns {Boolean}
     */

    var range;

    //  where we are only matters if we've been activated via next*()
    if (this.get('active')) {
        range = this.get('range');

        //  if no new data can be reached by incrementing the range then
        //  we're 'atEnd'
        return range.at(range.getSize() - 1) >=
            this.get('keys').getSize() - 1;
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.core.Iterator.Inst.defineMethod('atStart',
function() {

    /**
     * @name atStart
     * @summary Returns true if the iterator is positioned at the start. The
     *     'start' may be the end of the collection if reverse() has been
     *     called.
     * @returns {Boolean}
     */

    return this.get('range').at(0) === 0;
});

//  ------------------------------------------------------------------------

TP.core.Iterator.Inst.defineMethod('currentItem',
function() {

    /**
     * @name currentItem
     * @summary Returns the current "item" of the iterator. Items consist of a
     *     key/value pair i.e. they are "ordered pairs".
     * @returns {Object|undefined} The item of the underlying collection at the
     *     current iterator location or undefined.
     */

    var arr;

    if (!this.get('active')) {
        return;
    }

    if (this.get('step') > 1) {
        return;
    }

    arr = TP.ac();
    arr.atPut(0, this.currentKey());
    arr.atPut(1, this.get('coll').at(this.currentKey()));

    return arr;
});

//  ------------------------------------------------------------------------

TP.core.Iterator.Inst.defineMethod('currentItems',
function() {

    /**
     * @name currentItems
     * @summary Returns the current "items" of the iterator. Items consist of a
     *     key/value pair i.e. they are "ordered pairs".
     * @returns {Object[]|undefined} The items of the underlying collection at
     *     the current iterator location or undefined.
     * @todo
     */

    var i,
        k,
        arr,
        tmparr,
        coll;

    if (!this.get('active')) {
        return;
    }

    k = this.currentKeys();
    if (TP.notValid(k)) {
        return;
    }

    coll = this.get('coll');
    tmparr = TP.ac();
    for (i = 0; i < k.getSize(); i++) {
        arr = TP.ac();
        arr.atPut(0, k.at(i));
        arr.atPut(1, coll.at(k.at(i)));

        tmparr.add(arr);
    }

    return tmparr;
});

//  ------------------------------------------------------------------------

TP.core.Iterator.Inst.defineMethod('currentKey',
function() {

    /**
     * @name currentKey
     * @summary Returns the current key of the iterator.
     * @description Iterators work from the keys/indices of thier underlying
     *     collection. This method returns the current key rather than the
     *     current value. If the iterator has a step greater than 1 this method
     *     returns undefined; use currentKeys() to get the set of keys. If the
     *     iterator hasn't yet been used via next*(), this method will return
     *     undefined.
     * @returns {Object|undefined} The key/index of the underlying collection at
     *     the current iterator location or undefined.
     */

    if (!this.get('active')) {
        return;
    }

    if (this.get('step') > 1) {
        return;
    }

    return this.get('keys').at(this.get('range').at(0));
});

//  ------------------------------------------------------------------------

TP.core.Iterator.Inst.defineMethod('currentKeys',
function() {

    /**
     * @name currentKeys
     * @summary Returns an array containing the current keys of the iterator.
     * @description This array will contain "step" number of keys so if the
     *     iterator has a step of five an array of five keys will be returned.
     *     If the iterator hasn't yet been used via next*(), this method returns
     *     undefined.
     * @returns {String[]|undefined} An array of keys or undefined.
     * @todo
     */

    var i,
        tmparr,
        step,
        keys,
        coll,
        range,
        len;

    if (!this.get('active')) {
        return;
    }

    tmparr = TP.ac();

    step = this.get('step');
    keys = this.get('keys');
    coll = this.get('coll');
    range = this.get('range');
    len = coll.getSize();

    for (i = 0; i < step; i++) {
        if (range.at(i) < len) {
            tmparr.add(keys.at(range.at(i)));
        }
    }

    return tmparr;
});

//  ------------------------------------------------------------------------

TP.core.Iterator.Inst.defineMethod('currentValue',
function() {

    /**
     * @name currentValue
     * @summary Returns the element of the collection at the iterator's
     *     currentKey().
     * @description If the iterator hasn't been used via next*() this method
     *     returns undefined. If the iterator has a step value > 1 this method
     *     returns undefined -- use currentValues() for iterators with larger
     *     step sizes.
     * @exception TP.sig.InvalidIndex
     * @returns {Object|undefined} An object or undefined.
     */

    if (!this.get('active')) {
        return;
    }

    if (this.get('step') > 1) {
        return;
    }

    return this.get('coll').at(this.currentKey());
});

//  ------------------------------------------------------------------------

TP.core.Iterator.Inst.defineMethod('currentValues',
function() {

    /**
     * @name currentValues
     * @summary Returns an array of elements from the currentKeys(). If the
     *     iterator hasn't yet been used this method returns undefined.
     * @returns {Object[]|undefined} An array, or undefined.
     * @todo
     */

    if (!this.get('active')) {
        return;
    }

    return this.get('coll').atAll(this.currentKeys());
});

//  ------------------------------------------------------------------------

TP.core.Iterator.Inst.defineMethod('nextItem',
function() {

    /**
     * @name nextItem
     * @summary Returns the next key/value pair from the iterator.
     * @returns {Object|undefined} An ordered pair/item.
     */

    if (TP.notValid(this.nextKey())) {
        return;
    }

    //  note that the previous line (nextKey()) incremented for us
    return this.currentItem();
});

//  ------------------------------------------------------------------------

TP.core.Iterator.Inst.defineMethod('nextItems',
function() {

    /**
     * @name nextItems
     * @summary Returns an array of items from the currentKeys() locations in
     *     the underlying collection.
     * @returns {Object[]|undefined} An array of items or undefined.
     * @todo
     */

    if (TP.notValid(this.nextKeys())) {
        return;
    }

    //  note that the previous line (nextKeys()) incremented for us
    return this.currentItems();
});

//  ------------------------------------------------------------------------

TP.core.Iterator.Inst.defineMethod('nextKey',
function() {

    /**
     * @name nextKey
     * @summary Returns the next available key from the iterator or undefined
     *     if atEnd(). If the iterator has a step size > 1 this method returns
     *     undefined. Use nextKeys() in cases where the iterator has a larger
     *     step size.
     * @returns {Object|undefined} An object or undefined.
     * @signals PositionChange
     * @todo
     */

    var i,
        range;

    if (this.atEnd()) {
        return;
    }

    if (this.get('step') > 1) {
        return;
    }

    range = this.get('range');
    if (this.get('active')) {
        for (i = 0; i < range.getSize(); i++) {
            range.atPut(i, range.at(i) + this.get('step'));
        }
    } else {
        this.set('active', true);
    }

    this.changed('position', TP.UPDATE);

    return this.currentKey();
});

//  ------------------------------------------------------------------------

TP.core.Iterator.Inst.defineMethod('nextKeys',
function() {

    /**
     * @name nextKeys
     * @summary Returns an array containing the next "step" number of keys for
     *     the iterator. If the iterator is atEnd() the result is undefined.
     * @returns {String[]|undefined} An array or undefined.
     * @signals PositionChange
     * @todo
     */

    var i,
        range;

    if (this.atEnd()) {
        return;
    }

    range = this.get('range');
    if (this.get('active')) {
        for (i = 0; i < range.getSize(); i++) {
            range.atPut(i, range.at(i) + this.get('step'));
        }
    } else {
        this.set('active', true);
    }

    this.changed('position', TP.UPDATE);

    return this.currentKeys();
});

//  ------------------------------------------------------------------------

TP.core.Iterator.Inst.defineMethod('nextValue',
function() {

    /**
     * @name nextValue
     * @summary Returns the next available element from the iterator or
     *     undefined if the element doesn't exist. This method also returns
     *     undefined if the iterator has a step size > 1.
     * @exception TP.sig.InvalidIndex
     * @returns {Object|undefined} An object or undefined.
     * @signals PositionChange
     * @todo
     */

    var k;

    if (this.get('step') > 1) {
        return;
    }

    k = this.nextKey();
    if (TP.notValid(k)) {
        return;
    }

    return this.get('coll').at(k);
});

//  ------------------------------------------------------------------------

TP.core.Iterator.Inst.defineMethod('nextValues',
function() {

    /**
     * @name nextValues
     * @summary Returns an array containing the next "step" number of elements
     *     from the collection. This is the preferred method to call when using
     *     a step size other than 1.
     * @exception TP.sig.InvalidIndex
     * @returns {Object[]|undefined} An array or undefined.
     * @signals PositionChange
     * @todo
     */

    var k;

    k = this.nextKeys();
    if (TP.notValid(k)) {
        return;
    }

    return this.get('coll').atAll(k);
});

//  ------------------------------------------------------------------------

TP.core.Iterator.Inst.defineMethod('peekNextKeys',
function() {

    /**
     * @name peekNextKeys
     * @summary Returns an array containing the current keys of the iterator
     *     (but DOES NOT advance the iterator!).
     * @description This array will contain "step" number of keys so if the
     *     iterator has a step of five an array of five keys will be returned.
     *     If the iterator hasn't yet been used via next*(), this method returns
     *     undefined.
     * @returns {String[]|undefined} An array of keys or undefined.
     * @todo
     */

    var i,
        tmparr,
        step,
        range,
        keys;

    if (!this.get('active')) {
        return;
    }

    if (this.atEnd()) {
        return;
    }

    tmparr = TP.ac();

    step = this.get('step');
    range = this.get('range');
    keys = this.get('keys');

    if (this.get('active')) {
        for (i = 0; i < step; i++) {
            tmparr.add(keys.at(range.at(i) + step));
        }
    } else {
        this.set('active', true);
    }

    return tmparr;
});

//  ------------------------------------------------------------------------

TP.core.Iterator.Inst.defineMethod('previousItem',
function() {

    /**
     * @name previousItem
     * @summary Returns the previous item from the iterator's collection or
     *     undefined.
     * @returns {Object|undefined} An object or undefined.
     * @signals PositionChange
     * @todo
     */

    if (TP.notValid(this.previousKey())) {
        return;
    }

    //  note that the previous line (previousKey()) decremented for us
    return this.currentItem();
});

//  ------------------------------------------------------------------------

TP.core.Iterator.Inst.defineMethod('previousItems',
function() {

    /**
     * @name previousItems
     * @summary Returns an array containing the previous items from the
     *     iterators collection.
     * @returns {Object[]|undefined} An Array or undefined.
     * @signals PositionChange
     * @todo
     */

    if (TP.notValid(this.previousKeys())) {
        return;
    }

    //  note that the previous line (previousKeys()) decremented for us
    return this.currentItems();
});

//  ------------------------------------------------------------------------

TP.core.Iterator.Inst.defineMethod('previousKey',
function() {

    /**
     * @name previousKey
     * @summary Returns the previous available key from the iterator or
     *     undefined if atStart(). If the iterator has a step size > 1 this
     *     method returns undefined. Use previousKeys() in cases where the
     *     iterator has a larger step size.
     * @returns {Object|undefined} An object or undefined.
     * @signals PositionChange
     * @todo
     */

    var i,
        range,
        step;

    //  avoid decrementing below 0
    if (this.atStart()) {
        return;
    }

    if (this.get('step') > 1) {
        return;
    }

    range = this.get('range');
    step = this.get('step');

    if (this.get('active')) {
        for (i = 0; i < range.getSize(); i++) {
            range.atPut(i, range.at(i) - step);
        }
        this.changed('position', TP.UPDATE);
    }

    return this.currentKey();
});

//  ------------------------------------------------------------------------

TP.core.Iterator.Inst.defineMethod('previousKeys',
function() {

    /**
     * @name previousKeys
     * @summary Returns an array containing the previous "step" number of keys
     *     for the iterator. If the iterator is atEnd() the result is undefined.
     * @returns {String[]|undefined} An array or undefined.
     * @signals PositionChange
     * @todo
     */

    var i,
        step,
        range;

    //  avoid decrementing below 0
    if (this.atStart()) {
        return;
    }

    step = this.get('step');
    range = this.get('range');

    if (this.get('active')) {
        for (i = 0; i < range.getSize(); i++) {
            range.atPut(i, range.at(i) - step);
        }
        this.changed('position', TP.UPDATE);
    }

    return this.currentKeys();
});

//  ------------------------------------------------------------------------

TP.core.Iterator.Inst.defineMethod('previousValue',
function() {

    /**
     * @name previousValue
     * @summary Returns the previous element from the iterator or undefined.
     *     This method also returns undefined if the iterator has a step value >
     *     1.
     * @returns {Object|undefined} An object or undefined.
     * @signals PositionChange
     * @todo
     */

    var k;

    if (this.get('step') > 1) {
        return;
    }

    k = this.previousKey();
    if (TP.notValid(k)) {
        return;
    }

    return this.get('coll').at(k);
});

//  ------------------------------------------------------------------------

TP.core.Iterator.Inst.defineMethod('previousValues',
function() {

    /**
     * @name previousValues
     * @summary Returns an array containing the previous "step" number of
     *     elements from the collection. If the iterator is atStart() or hasn't
     *     yet be used via next*() this method returns undefined.
     * @returns {Object[]|undefined} An array or undefined.
     * @signals PositionChange
     * @todo
     */

    var k;

    k = this.previousKeys();
    if (TP.notValid(k)) {
        return;
    }

    return this.get('coll').atAll(k);
});

//  ------------------------------------------------------------------------

TP.core.Iterator.Inst.defineMethod('reverse',
function() {

    /**
     * @name reverse
     * @summary Changes the direction of the iterator. This method can only be
     *     used when the iterator is atEnd() or atStart().
     * @returns {TP.core.Iterator} The receiver or undefined.
     * @signals PositionChange
     * @todo
     */

    if (!this.atEnd() && !this.atStart()) {
        return this;
    }

    this.get('keys').reverse();
    this.seek(0);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Iterator.Inst.defineMethod('rewind',
function() {

    /**
     * @name rewind
     * @summary Sets the iterator back to the start of the collection if
     *     iterating forward or to the end if iterating backwards.
     * @returns {TP.core.Iterator} The receiver.
     * @signals PositionChange
     * @todo
     */

    return this.seek(0);
});

//  ------------------------------------------------------------------------

TP.core.Iterator.Inst.defineMethod('seek',
function(anIndex) {

    /**
     * @name seek
     * @summary Sets the iterator to the index location provided. If no
     *     index/key is provided the iterator 'rewinds' to the starting
     *     location.
     * @param {Number} anIndex A numerical index to seek.
     * @returns {TP.core.Iterator} The receiver.
     * @signals PositionChange
     * @todo
     */

    var ind,
        i,
        range;

    ind = TP.ifInvalid(anIndex, 0);

    if (ind < 0) {
        //  deal with negative indexes
        ind = (0).max(this.get('keys').getSize() + ind);
    }

    range = this.get('range');
    for (i = 0; i < range.getSize(); i++) {
        range.atPut(i, ind + i);
    }

    if (ind === 0) {
        this.set('active', false);
    }

    this.changed('position', TP.SEEK);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Iterator.Inst.defineMethod('seekToKey',
function(aKey) {

    /**
     * @name seekToKey
     * @summary Sets the iterator to the index of the key provided. If no key
     *     is provided (or the key cannot be found) the iterator 'rewinds' to
     *     the starting location.
     * @param {The} aKey key to seek to.
     * @returns {TP.core.Iterator} The receiver.
     * @signals PositionChange
     * @todo
     */

    this.seek(this.get('keys').indexOf(aKey));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Iterator.Inst.defineMethod('sort',
function(aSortFunction) {

    /**
     * @name sort
     * @summary Sorts the iterator's internal keys so that subsequent iteration
     *     occurs in a sorted fashion. As with reverse() this operation can only
     *     be performed when the iterator is atStart() or atEnd().
     * @param {Function} aSortFunction A function conforming to the rules for
     *     array sort functions used to sort the keys.
     * @returns {TP.core.Iterator} The receiver.
     * @signals OrderChange, PositionChange
     * @todo
     */

    if (!this.atEnd() && !this.atStart()) {
        return this;
    }

    //  apparently "undefined" isn't a "valid sort argument" :)
    if (TP.isCallable(aSortFunction)) {
        this.get('keys').sort(aSortFunction);
    } else {
        this.get('keys').sort();
    }

    this.seek(0);
    this.changed('order', TP.SORTED);

    return this;
});

//  ------------------------------------------------------------------------
/*
TP.core.Iterator.Inst.defineMethod('getCurrentItem',
                TP.core.Iterator.getInstPrototype().currentItem.copy());
TP.core.Iterator.Inst.defineMethod('getCurrentItems',
                TP.core.Iterator.getInstPrototype().currentItems.copy());
TP.core.Iterator.Inst.defineMethod('getCurrentKey',
                TP.core.Iterator.getInstPrototype().currentKey.copy());
TP.core.Iterator.Inst.defineMethod('getCurrentKeys',
                TP.core.Iterator.getInstPrototype().currentKeys.copy());
TP.core.Iterator.Inst.defineMethod('getCurrentValue',
                TP.core.Iterator.getInstPrototype().currentValue.copy());
TP.core.Iterator.Inst.defineMethod('getCurrentValues',
                TP.core.Iterator.getInstPrototype().currentValues.copy());

TP.core.Iterator.Inst.defineMethod('getNextItem',
                TP.core.Iterator.getInstPrototype().currentItem.copy());
TP.core.Iterator.Inst.defineMethod('getNextItems',
                TP.core.Iterator.getInstPrototype().currentItems.copy());
TP.core.Iterator.Inst.defineMethod('getNextKey',
                TP.core.Iterator.getInstPrototype().currentKey.copy());
TP.core.Iterator.Inst.defineMethod('getNextKeys',
                TP.core.Iterator.getInstPrototype().currentKeys.copy());
TP.core.Iterator.Inst.defineMethod('getNextValue',
                TP.core.Iterator.getInstPrototype().currentValue.copy());
TP.core.Iterator.Inst.defineMethod('getNextValues',
                TP.core.Iterator.getInstPrototype().currentValues.copy());

TP.core.Iterator.Inst.defineMethod('getPreviousItem',
                TP.core.Iterator.getInstPrototype().currentItem.copy());
TP.core.Iterator.Inst.defineMethod('getPreviousItems',
                TP.core.Iterator.getInstPrototype().currentItems.copy());
TP.core.Iterator.Inst.defineMethod('getPreviousKey',
                TP.core.Iterator.getInstPrototype().currentKey.copy());
TP.core.Iterator.Inst.defineMethod('getPreviousKeys',
                TP.core.Iterator.getInstPrototype().currentKeys.copy());
TP.core.Iterator.Inst.defineMethod('getPreviousValue',
                TP.core.Iterator.getInstPrototype().currentValue.copy());
TP.core.Iterator.Inst.defineMethod('getPreviousValues',
                TP.core.Iterator.getInstPrototype().currentValues.copy());
*/
//  ========================================================================

/**
 * @type {TP.core.Range}
 * @summary TP.core.Range provides a simple interface to a range of numbers.
 *     This allows for interesting iteration possibilities such as:
 *
 *     (1).to(10).perform(function (ind) {alert('index is: ' + ind)});
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.Range');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.Range.Inst.defineAttribute('start');
TP.core.Range.Inst.defineAttribute('end');

TP.core.Range.Inst.defineAttribute('step');

TP.core.Range.Inst.defineAttribute('keys');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Range.Inst.defineMethod('init',
function(startIndex, endIndex, aStep) {

    /**
     * @method init
     * @summary Initializes a new instance
     * @param {Number} startIndex The beginning index of the range.
     * @param {Number} endIndex The end index of the range.
     * @param {Number} aStep The range increment for interation. When the start
     *     is smaller than the end this defaults to 1, when the start is larger
     *     than the end the step defaults to -1.
     * @returns {TP.core.Range} A new instance.
     */

    var startInd,
        endInd;

    this.callNextMethod();

    //  convert to Numbers to be sure
    if (TP.notValid(startIndex) || TP.isNaN(startInd = startIndex.asNumber())) {
        startInd = 0;
    }

    if (TP.notValid(endIndex) || TP.isNaN(endInd = endIndex.asNumber())) {
        endInd = TP.MAX_DOUBLE;
    }

    this.set('start', startInd);
    this.set('end', endInd);

    //  step defaults based on direction
    if (startInd > endInd) {
        this.set('step', TP.ifInvalid(aStep, -1));
    } else {
        this.set('step', TP.ifInvalid(aStep, 1));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Range.Inst.defineMethod('asArray',
function() {

    /**
     * @method asArray
     * @summary Returns the receiver in array form (as an Array of its keys).
     * @returns {Object[]} The receiver as an Array.
     */

    var vals;

    vals = TP.ac();

    this.perform(
        function(aVal) {
            vals.push(aVal);
        });

    return vals;
});

//  ------------------------------------------------------------------------

TP.core.Range.Inst.defineMethod('at',
function(anIndex) {

    /**
     * @method at
     * @summary Returns the range key at the index provided.
     * @param {Number} anIndex The index to access.
     * @returns {Object} The object at the index provided.
     */

    var arr;

    if (TP.notValid(arr = this.get('keys'))) {
        return null;
    }

    return arr.at(anIndex);
});

//  ------------------------------------------------------------------------

TP.core.Range.Inst.defineMethod('by',
function(aStep) {

    /**
     * @method by
     * @summary Sets the range iteration step size.
     * @param {Number} aStep The numerical step size.
     * @returns {TP.core.Range} The receiver.
     */

    //  new step? then use it
    if (!TP.isNumber(aStep)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  truncate
    this.empty();

    this.set('step', aStep);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Range.Inst.defineMethod('empty',
function() {

    /**
     * @method empty
     * @summary Clears the range's internal index cache, if it exists.
     * @returns {TP.core.Range} The receiver.
     */

    this.$set('keys', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Range.Inst.defineMethod('getKeys',
function() {

    /**
     * @method getKeys
     * @summary Returns an array containing the keys of the receiver.
     * @returns {String[]} The receiver as an array of key values.
     */

    var keys,

        step,
        start,
        end,

        i;

    if (TP.notValid(keys = this.$get('keys'))) {
        keys = TP.ac();

        step = this.get('step');
        start = this.get('start');
        end = this.get('end');

        if (step.isPositive()) {
            for (i = start; i <= end; i = i + step) {
                keys.push(i);
            }
        } else {
            //  still adding step, it's negative...
            for (i = start; i >= end; i = i + step) {
                keys.push(i);
            }
        }

        this.set('keys', keys);
    }

    return keys;
});

//  ------------------------------------------------------------------------

TP.core.Range.Inst.defineMethod('perform',
function(aFunction) {

    /**
     * @method perform
     * @summary Iterates over the range and invokes aFunction on each
     *     iteration.
     * @param {Function} aFunction The function to invoke on each iteration.
     *     This function should accept the loop count as its only parameter.
     * @returns {TP.core.Range} The receiver.
     */

    var count,

        step,
        start,
        end,
        i;

    count = 0;

    step = this.get('step');
    start = this.get('start');
    end = this.get('end');

    /* eslint-disable no-extra-parens */
    if (step.isPositive()) {
        for (i = start; i <= end; i = i + step) {
            if (aFunction(i, count) === TP.BREAK) {
                break;
            }
            count++;
        }
    } else {
        //  still adding step, it's negative...
        for (i = start; i >= end; i = i + step) {
            if (aFunction(i, count) === TP.BREAK) {
                break;
            }

            count++;
        }
    }
    /* eslint-enable no-extra-parens */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Range.Inst.defineMethod('performUntil',
function(aFunction, terminateFunction) {

    /**
     * @method performUntil
     * @summary Performs the function on each iteration of the receiver until
     *     terminateFunction returns true.
     * @description performUntil can be used as an alternative to constructing
     *     repeat loops to iterate over a range.
     * @param {Function} aFunction A function which performs some action with
     *     each iteration.
     * @param {Function} terminateFunction A test Function which ends the loop.
     *     This should be a Function that returns a Boolean. It is passed the
     *     same data as the performed function.
     * @returns {TP.core.Range} The receiver.
     */

    var f,
        tst,
        count,
        step,
        start,
        end,
        i;

    f = TP.RETURN_FALSE;
    tst = terminateFunction;

    if (!TP.isCallable(tst)) {
        tst = f;
    }

    count = 0;

    step = this.get('step');
    start = this.get('start');
    end = this.get('end');

    if (step.isPositive()) {
        for (i = start; i <= end; i = i + step) {
            aFunction(i, count);
            if (tst(i, count)) {
                break;
            }
            count++;
        }
    } else {
        //  still adding step, it's negative...
        for (i = start; i >= end; i = i + step) {
            aFunction(i, count);
            if (tst(i, count)) {
                break;
            }
            count++;
        }
    }
    /* eslint-enable no-extra-parens */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Range.Inst.defineMethod('performWhile',
function(aFunction, terminateFunction) {

    /**
     * @method performWhile
     * @summary Performs the function on each iteration of the receiver while
     *     terminateFunction returns true.
     * @description performUntil can be used as an alternative to constructing
     *     while loops to iterate over a range
     * @param {Function} aFunction A function which performs some action with
     *     each iteration index.
     * @param {Function} terminateFunction A test Function which ends the loop.
     *     This should be a Function that returns a Boolean. It is passed the
     *     same data as the performed function.
     * @returns {TP.core.Range} The receiver.
     */

    var count,
        step,
        start,
        end,
        i;

    count = 0;

    step = this.get('step');
    start = this.get('start');
    end = this.get('end');

    if (step.isPositive()) {
        for (i = start; i <= end; i = i + step) {
            if (TP.notTrue(terminateFunction(i, count))) {
                break;
            }
            aFunction(i, count);
            count++;
        }
    } else {
        //  still adding step, it's negative...
        for (i = start; i >= end; i = i + step) {
            if (TP.notTrue(terminateFunction(i, count))) {
                break;
            }
            aFunction(i, count);
            count++;
        }
    }
    /* eslint-enable no-extra-parens */

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
