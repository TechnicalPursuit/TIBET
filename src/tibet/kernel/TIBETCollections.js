//  ========================================================================
/*
NAME:   TIBETCollections.js
AUTH:   Scott Shattuck (ss)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.

*/
//  ========================================================================

/*
Our belief is that a solid set of collection types is just as important to
success for a language/library as any other feature you might consider.
Programming is, after all, largely about data structures and their
manipulation so an OO system without powerful collections is crippled.

While we certainly can't claim to be any good at writing optimal data
structures we've made an attempt here to get the API in place along with
a first cut at functionality. Perhaps most importantly, we've made every
attempt to leverage this API throughout TIBET so that as better, faster
implementations of these methods come out the entire system will benefit.

In addition to what you'll find here, you'll also find a number of iteration
support functions in TIBETFoundation.js, particularly those on native types
like Array, Number, and String that are also part of our collection support.
This allows us to use those functions throughout lower levels of the kernel
which may be loading and executing before this file loads.

One of the primary features of our collection types is their integration
with TIBET's change notification system. This allows Arrays, Objects, and
the various TIBET collections to act as models in an MVC system. Every
object in TIBET is capable of being observed for Change signals related to
various aspects of their state.

Finally you'll find a complete set of encapsulation functions for get/set
operations that are specific to collection content rather than properties of
the collections themselves. Aside from the obvious polymorphism benefits
that this conveys (avoiding type checks and allowing swapping of data
structures in some cases) it also provides benefits like being able to
handle negative indexes in a fashion consistent with the rest of JavaScript.
*/

//  ------------------------------------------------------------------------
//  TP.api.CollectionAPI
//  ------------------------------------------------------------------------

/**
 * @type {TP.api.CollectionAPI}
 * @synopsis The TP.api.CollectionAPI, which defines the core methods we
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
 * @synopsis The TP.api.IndexedCollection API, which adds support for accessing
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
        'atAllIfAbsent',
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
        'getKVPairs',
        'getPairs',
        'getPosition',
        'getPositions',
        'grepKeys',
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
 * @synopsis The TP.api.OrderedCollection API, which adds methods which deal
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
 * @synopsis The API required of objects which act as ordered pairs.
 * @description TP.api.OrderedPairAPI is an interface which can be implemented
 *     by any object which may be used to hold key/value pairs. Objects in the
 *     core which implement this API include Array, Object, and TP.lang.Hash.
 */

//  ------------------------------------------------------------------------

TP.api.OrderedPairAPI =
    TP.ac(

        /**
         * @name getPair
         * @synopsis Returns an array containing the key and value of the
         *     receiver.
         * @description This method expects the receiver to have only a single
         *     key/value pair. Objects can be used as ordered pairs as in:
         *
         *     {'a':1}
         *
         *     but it it MUCH more efficient to use Arrays instead. This method
         *     is here primarily for flexibility and polymorphism.
         * @raises TP.sig.InvalidPairRequest
         * @returns {TPOrderedPair} The key/value pair.
         */

        'getPair',

        //  ---

        /**
         * @name first
         * @returns {Object} An Object.
         * @asbstract Returns the first element of the ordered pair.
         * @todo
         */

        'first',

        //  ---

        /**
         * @name last
         * @synopsis Returns the second (last) element of the ordered pair.
         * @returns {Object} An Object.
         */

        'last'
    );

//  ------------------------------------------------------------------------
//  TP.api.SortedCollectionAPI
//  ------------------------------------------------------------------------

/**
 * @type {TP.api.SortedCollectionAPI}
 * @synopsis The API required of objects which act as sorted collections.
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
         * @name getSortFunction
         * @synopsis Returns the sort function, if any, which has been assigned
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
         * @name setSortFunction
         * @synopsis Sets the sort function which will be used to determine the
         *     ordering of items in the collection. The value can be null if the
         *     desired sort is an ALPHA sort.
         * @param {Function} aFunction A function or null. If a function is
         *     passed it should take two parameters for testing and return -1 if
         *     the first is "less than" the second, +1 if the first is "greater
         *     than" the second and 0 if the two are "equal" in value.
         * @raises TP.sig.InvalidFunction
         */

        'setSortFunction',

        //  ---

        /**
         * @name sort
         * @synopsis Performs a sort on the underlying collection.
         * @returns {Collection} The receiver.
         */

        'sort'
    );

//  ------------------------------------------------------------------------
//  TP.api.IterationAPI
//  ------------------------------------------------------------------------

/**
 * @type {TP.api.IterationAPI}
 * @synopsis The API required of objects which can support a TP.core.Iterator.
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
         * @name at
         * @synopsis Returns the value at the index provided.
         * @param {Number} anIndex
         * @raises TP.sig.InvalidIndex
         * @returns {Object} The item at the index provided or undefined.
         */

        'at',

        //  ---

        /**
         * @name atAll
         * @synopsis Returns a new collection containing the items in the
         *     receiver at the various indexes contained in the collection
         *     provided.
         * @param {TPCollection} anIndexCollection
         * @raises TP.sig.InvalidParameter, TP.sig.InvalidCollection
         * @returns {Array} An array of zero or more items.
         * @todo
         */

        'atAll',

        //  ---

        /**
         * @name getKeys
         * @synopsis Returns an array of keys for the underlying collection. In
         *     the case of an object with an Array for a data structure this
         *     results in an array containing the indices whose contents are not
         *     undefined. For Object data stores the result is the set of unique
         *     keys for the object.
         * @returns {Array} An array of 'keys' for the underlying collection.
         * @todo
         */

        'getKeys',

        //  ---

        /**
         * @name getSize
         * @synopsis Returns a count of the items in the receiving collection.
         * @returns {Number}
         */

        'getSize'

    );

//  ========================================================================
//  Array Extensions
//  ========================================================================

/**
 * @type {Array}
 * @synopsis Collection-oriented API's for Array base class.
 * @description The vast majority of functional support for the collection
 *     module. Most other collection classes rely on Array for their internal
 *     storage needs either for data, keys, or both. Array implements all of the
 *     TPCollection, TPIndexedCollection, and TPOrderedCollection APIs as well
 *     as the TPOrderedPair and TPSortedCollection interfaces.
 * @example See the /tibet/test directory for collection tests which provide a
 *     good view of usage.
 * @todo
 */

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

Array.Inst.defineMethod('equalAs',
function(aType) {

    /**
     * @name equalAs
     * @synopsis Performs an equality test on the receiver's elements Example
     *     [a,b].equalAs(Bag) would test a and b for equality when in the form
     *     of a Bag. This method is typically targeted at instances that
     *     represent an ordered pair, but no check for that is performed here.
     *     All values are tested.
     * @param {TP.lang.RootObject} aType A type object for conversion. Defaults
     *     to the type of the first element in the receiver.
     * @returns {Boolean}
     * @todo
     */

    var value,
        found,
        testval,
        retval,
        type,
        i,
        item,
        len;

    //  you could go either way here...but nulls aren't considered to be of
    //  any particular type (at least not in JavaScript ;)) so an empty
    //  array returns false
    if (TP.isEmpty(this)) {
        return false;
    }

    value = this.first();
    if (TP.notValid(value)) {
        //  first value as a null is tricky since we can't have any other
        //  elements that are non-null if the test is going to be true
        found = this.detect(
                    function(it) {

                        return TP.isValid(it);
                    }, 1);      //  NOTE that start index :)

        return TP.isValid(found);
    }

    //  first value not null, so we can default to its type for the test
    type = TP.ifInvalid(aType, value.getType());

    //  we'll let the instances do the work when they can since that's going
    //  to typically produce a more accurate translation
    if (TP.canInvoke(value, 'as')) {
        testval = value.as(type);
    } else {
        testval = type.from(value);
    }

    retval = true;

    //  now that we've got a starting point value we can iterate
    len = this.length;
    for (i = 0; i < len; i++) {
        item = this[i];

        if (TP.canInvoke(item, 'as')) {
            value = item.as(type);
        } else {
            value = type.from(item);
        }

        /* jshint eqeqeq:false */
        if (value != testval) {
        /* jshint eqeqeq:true */
            retval = false;
            return TP.BREAK;
        }
    }

    return retval;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('$$isCollection',
function() {

    /**
     * @name $$isCollection
     * @synopsis Returns true if the receiver is a collection instance.
     * @returns {Boolean} True if the receiver is a collection.
     */

    return true;
});

//  ------------------------------------------------------------------------
//  $$isPair                    Kernel
//  ------------------------------------------------------------------------

Array.Inst.defineMethod('vslice',
function(startIndexOrSpec, endIndex, aStep) {

    /**
     * @name vslice
     * @synopsis Returns a 'virtual slice' as a TP.core.Range that allows
     *     iteration over contents of the receiver.
     * @description This method can take a 'range spec' as the first argument.
     *     This range spec follows the Python syntax for 'slicing' (which has
     *     also been proposed for JavaScript):
     *     [1:3]    -> slice items 1 and 2
     *     [:3]     -> slice items 0, 1 and 2
     *     [2:]     -> slice from item 2 to the end of the Array
     *     [2:-1]   -> slice from item 2 to the second to last element
     *     [1:6:2]  -> slice from item 1 to item 5 stepping by 2
     *     [6:1:-2] -> slice from item 6 to item 2 stepping by -2 (i.e. reversing)
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
     *
     *          TP.log(item, TP.LOG, arguments);
     *          });
     *          <samp>6 4 2</samp>
     *          myArr.vslice('[2:6:2]').perform(
     *          function(item) {
     *
     *          TP.log(item, TP.LOG, arguments);
     *          });
     *          <samp>2 4</samp>
     *     </code>
     * @returns {TP.core.Range} The newly constructed TP.core.Range.
     * @todo
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
     * @name truncate
     * @synopsis Reduces the size of the receiver to the size specified.
     * @description If the size provided is larger than the receiver the
     *     receiver is unaltered. If the size provided is negative the receiver
     *     is emptied. If no size is provided this method does nothing.
     * @param {Number} aSize The new size (if smaller than current).
     * @returns {Array} The receiver.
     * @signals Change
     * @todo
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
     * @name add
     * @synopsis Adds (appends) the argument(s) provided.
     * @param {arguments} varargs A variable list of arguments.
     * @returns {Array} The receiver.
     * @signals Change
     * @todo
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

    /*
    @method     addAll
    @abstract   Adds all the elements of the collection as elements of the
                receiver.
    @param      aCollection     TPCollection    The collection from which
                                                all elements should be
                                                added.
    @return     Array           The receiver.
    @raises     TP.sig.InvalidCollection
    @signals    Change
    */

    var thisref,
        len,
        i,
        len2;

    len = this.length;

    if (TP.isArray(aCollection)) {
        len2 = aCollection.length;
        for (i = 0; i < len2; i++) {
            this.push(aCollection[i]);
        }
    } else {
        if (!TP.canInvoke(aCollection, 'perform')) {
            return this.raise('TP.sig.InvalidCollection', arguments);
        }

        thisref = this;
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
     * @name addAllIfAbsent
     * @param {TPCollection} aCollection
     * @abstract
     * @return
     * @signals Change
     * @todo
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('addIfAbsent',
function(anObject, aTest) {

    /**
     * @name addIfAbsent
     * @synopsis Adds an object to the receiver if it isn't already in the
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
     * @signals Change
     * @todo
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
     * @name addItem
     * @synopsis Adds a single item to the receiver.
     * @description As mentioned in other contexts an item may have different
     *     properties. For an array an item is a value unless that value happens
     *     to be an ordered pair whose first element is a number. In that case
     *     the receiver works like a numerically-indexed hash and adds the
     *     last() element of anItem at the index defined by the first() element.
     * @param {Object|Pair} anItem The item to add.
     * @returns {Array} The receiver.
     * @signals Change
     * @todo
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
     * @name addWithCount
     * @synopsis Adds the object N times, where N defaults to 0. NOTE that in
     *     the absence of a valid count the object is not added.
     * @param {Object} anObject The object to add.
     * @param {Number} aCount A number of times to add the object. Default is 0.
     * @returns {Array} The receiver.
     * @signals Change
     * @todo
     */

    var i,
        count,

        len;

    //  no count? no work to do
    if (TP.notValid(aCount)) {
        return;
    }

    //  count, but not a number? won't try to convert, just warn/exit
    count = parseInt(aCount, 10);
    if (!TP.isNumber(count)) {
        return this.raise('TP.sig.InvalidParameter', arguments);
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
     * @name asArray
     * @synopsis Returns the receiver in Array form. For an Array instance this
     *     method simply returns the array.
     * @returns {Array} The receiver.
     * @todo
     */

    return this;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('asHash',
function() {

    /**
     * @name asHash
     * @synopsis Returns a hash containing the key/value pairs of the array. The
     *     indexes of this hash are the numerical indices of the receiver for
     *     which the value TP.isDefined().
     * @description The resulting hash's keys are the indices of the array from
     *     0 to array.length. Note that if the receiver is an ordered pair the
     *     result is a hash containing the key/value data from the single
     *     ordered pair.
     * @returns {TP.lang.Hash} A new TP.lang.Hash.
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

Array.Inst.defineMethod('asTP_lang_Hash', Array.getInstPrototype().asHash);

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('asIterator',
function(aStep) {

    /**
     * @name asIterator
     * @synopsis Returns a new iterator on the receiver.
     * @param {Number} aStep Defines the increment size the iteration should
     *     use. The default value is 1.
     * @returns {TP.core.Iterator} The new iterator.
     * @todo
     */

    //  sort first because the iterator will copy our keys on init()
    this.$sortIfNeeded();

    return this.getIteratorType().construct(this, aStep);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('asRange',
function() {

    /**
     * @name asRange
     * @synopsis Returns a new TP.core.Range based on the size of the receiver.
     * @raises TP.sig.TypeNotFound
     * @returns {TP.core.Range} The receiver as a range.
     */

    var type;

    //  TP.core.Range is an optional type, so we'll need to try to load it
    if (TP.notValid(type = TP.sys.require('TP.core.Range'))) {
        return this.raise('TP.sig.TypeNotFound', arguments);
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
     * @name collapse
     * @synopsis Returns the "simplest" form of the receiver possible, meaning
     *     that when the receiver has only one item that item is returned,
     *     otherwise the receiver is returned.
     * @returns {Array|Object} The receiver, or its single item.
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
     * @name containsAll
     * @synopsis Returns true if all the values in the collection provided are
     *     found in the receiver.
     * @param {TPCollection} aCollection The collection of elements all of which
     *     must be equal to at least one element in the receiver for this method
     *     to return true.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @raises TP.sig.InvalidCollection
     * @returns {Boolean} Whether or not the receiver contains all of the values
     *     in the collection provided.
     * @todo
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
            return this.raise('TP.sig.InvalidCollection', arguments);
        }

        comp = aCollection.asArray();
        if (TP.isEmpty(comp)) {
            return false;
        }
    }

    //  we'll be sorting so let's work on a copy
    copy = this.copy();

    if (aTest === TP.IDENTITY) {
        copy.sort(TP.IDENTITY_SORT);
        comp.sort(TP.IDENTITY_SORT);
    } else {
        copy.sort(TP.EQUALITY_SORT);
        comp.sort(TP.EQUALITY_SORT);
    }

    //  iterating on the incoming data means item is what we'll be looking
    //  for in ourselves (or at least, our copy of ourselves). the first
    //  detected missing value will terminate the loop here
    found = comp.detect(
        function(item, index) {

            return !copy.contains(item);
        });

    return TP.notValid(found);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('containsAny',
function(aCollection, aTest) {

    /**
     * @name containsAny
     * @synopsis Returns true if any of the values in the collection provided
     *     are found in the receiver.
     * @param {TPCollection} aCollection The collection of elements any of which
     *     must be equal to any element in the receiver for this method to be
     *     true.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @raises TP.sig.InvalidCollection
     * @returns {Boolean} Whether or not the receiver contains any of the values
     *     in the collection provided.
     * @todo
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
            return this.raise('TP.sig.InvalidCollection', arguments);
        }

        comp = aCollection.asArray();
        if (TP.isEmpty(comp)) {
            return false;
        }
    }

    //  we'll be sorting so let's work on a copy
    copy = this.copy();

    if (aTest === TP.IDENTITY) {
        copy.sort(TP.IDENTITY_SORT);
        comp.sort(TP.IDENTITY_SORT);
    } else {
        copy.sort(TP.EQUALITY_SORT);
        comp.sort(TP.EQUALITY_SORT);
    }

    //  iterating on the incoming data means item is what we'll be looking
    //  for in ourselves (or at least, our copy of ourselves). the first
    //  detected found value will terminate the loop here
    found = comp.detect(
        function(item, index) {

            return copy.contains(item);
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
     * @name countOf
     * @synopsis Returns a count of the number of times anItem is found in the
     *     array.
     * @param {Object} anItem The element whose value is checked against.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Number} The number of occurrences of anItem.
     * @todo
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
     * @name difference
     * @synopsis Returns the elements contained in the receiver which are not in
     *     the collection provided.
     * @description This method can be thought of as subtracting all elements
     *     found in the collection provided from the receiver. What's left are
     *     those elements unique to the receiver.
     * @param {TPCollection} aCollection The collection to difference against
     *     the receiver.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @raises TP.sig.InvalidCollection
     * @returns {Array} The difference between aCollection and the receiver.
     * @todo
     */

    var arr;

    if (!TP.canInvoke(aCollection, 'asArray')) {
        return this.raise('TP.sig.InvalidCollection', arguments);
    }

    arr = aCollection.asArray();

    return this.select(
        function(item, index) {

            return !arr.contains(item);
        });
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('disjunction',
function(aCollection, aTest) {

    /**
     * @name disjunction
     * @synopsis Returns the 'symmetric difference' or those elements which are
     *     disjunct between the two collections.
     * @description This method returns a new array containing the disjunction
     *     between the receiver and aCollection. This means that only those
     *     elements which occur in one of the collections but not the other are
     *     returned.
     * @param {TPCollection} aCollection The collection to disjunct against the
     *     receiver.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Array} The disjunction of aCollection and the receiver.
     * @todo
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

                    if (!thisref.contains(item)) {
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
     * @name empty
     * @synopsis Empties the receiver.
     * @returns {Array} The receiver.
     * @signals Change
     * @todo
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
     * @name flatten
     * @synopsis Extracts embedded elements which may exist and flattens them.
     * @returns {Array} A new array containing the elements of the receiver in
     *     flattened form.
     * @todo
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
     * @name getIterator
     * @synopsis Returns the receiver's internal iterator. If no iterator exists
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
     * @name getIteratorType
     * @synopsis Returns the type of iterator used for the receiver.
     * @returns {TP.core.Iterator} The type of the iterator.
     */

    var type;

    if (TP.notValid(type = TP.sys.getTypeByName('TP.core.Iterator'))) {
        return this.raise('TP.sig.TypeNotFound', arguments);
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
     * @name intersection
     * @synopsis Returns the intersection of the two collections.
     * @description This method returns a collection of those elements which
     *     occur in BOTH the receiver and in aCollection.
     * @param {TPCollection} aCollection The collection to intersect the
     *     receiver with.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @raises TP.sig.InvalidCollection
     * @returns {Array} An array of elements occurring in both.
     * @todo
     */

    if (!TP.canInvoke(aCollection, 'contains')) {
        return this.raise('TP.sig.InvalidCollection', arguments);
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
     * @name isSortedCollection
     * @synopsis Returns true if the receiver is behaving as a sorted
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
function() {

    /**
     * @name merge
     * @synopsis Merge the receiver's elements with elements from one or more
     *     collections. In some sense the reverse of partition, using an
     *     optional function to determine which elements of a set of collections
     *     should be grouped into pairs/triplets/quads etc.
     * @param {arguments} varargs Variable-length argument list of ordered
     *     pairs.
     * @returns {Array} An array containing ordered pairs (or triplets, quads,
     *     etc.) constructed from the receiver and incoming collection elements.
     * @todo
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
     * @name remove
     * @synopsis Removes a value from the receiver.
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
     * @signals Change
     * @todo
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
        deleted = (len) - wi;
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
     * @name removeAll
     * @synopsis Removes the values contained in the collection from the
     *     receiver.
     * @param {TPCollection} aCollection The collection of elements that removed
     *     elements need to be equal to.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @raises TP.sig.InvalidCollection
     * @returns {Number} The number of elements removed.
     * @signals Change
     * @todo
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
            return this.raise('TP.sig.InvalidCollection', arguments);
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

                deleted += thisref.remove(item);
            });
    } catch (e) {
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
     * @name replace
     * @synopsis Replaces the element having the value oldValue with an element
     *     having the value newValue whereever it occurs in the receiver.
     * @param {Object} oldValue The old value to look for.
     * @param {Object} newValue The new value to replace the old value with.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Array} The receiver.
     * @signals Change
     * @todo
     */

    var shouldSignal,

        replaced,
        thisref,

        len;

    //  turn off change signaling
    shouldSignal = this.shouldSignalChange();
    this.shouldSignalChange(false);

    replaced = 0;
    thisref = this;

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
    } catch (e) {
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
     * @name replaceAll
     * @synopsis Replaces all values in aCollection with a newValue using the
     *     test provided to determine a match. The default test is TP.EQUALITY.
     * @param {TPCollection} aCollection A collection containing the elements to
     *     replace.
     * @param {Object} newValue A new value to replace objects with.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @raises TP.sig.InvalidCollection
     * @returns {Array} The receiver.
     * @signals Change
     * @todo
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
            return this.raise('TP.sig.InvalidCollection', arguments);
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

                replaced += thisref.replace(item, newValue);
            });
    } catch (e) {
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
     * @name union
     * @synopsis Returns a new array containing the members of both arrays.
     * @description This method computes a new array of elements, placing into
     *     it all elements from this array and all elements from aCollection.
     * @param {TPCollection} aCollection The other collection to union this
     *     array against.
     * @raises TP.sig.InvalidCollection
     * @returns {Array} The new array containing elements from both arrays.
     * @todo
     */

    var arr;

    if (!TP.canInvoke(aCollection, 'injectInto')) {
        return this.raise('TP.sig.InvalidCollection', arguments);
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
     * @name addAt
     * @synopsis Adds the value provided at anIndex. Note that this does not
     *     replace the item at that location, it splices the new value into
     *     place hence the 'add' terminology. To replace use atPut() or set().
     * @param {Object} anItem The element to add at anIndex.
     * @param {Number} anIndex The index to add anItem at.
     * @returns {Array} The receiver.
     * @signals Change
     * @todo
     */

    var index,
        len;

    index = parseInt(anIndex, 10);
    if (!TP.isNumber(index)) {
        return this.raise('TP.sig.InvalidIndex', arguments);
    }

    index = (index > 0) ? index : this.normalizeIndex(index);

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
     * @name addAllAt
     * @synopsis Adds all the elements of aCollection beginning at the index
     *     provided.
     * @param {TPCollection} aCollection The collection to add elements from.
     * @param {Number} anIndex The index to begin adding elements.
     * @raises TP.sig.InvalidCollection, TP.sig.InvalidIndex
     * @returns {Array} The receiver.
     * @signals Change
     * @todo
     */

    var arr,
        index,

        len,

        tmparr;

    index = parseInt(anIndex, 10);
    if (!TP.isNumber(index)) {
        return this.raise('TP.sig.InvalidIndex', arguments);
    }

    if (TP.isArray(aCollection)) {
        arr = aCollection;
    } else {
        if (!TP.canInvoke(aCollection, 'asArray')) {
            return this.raise('TP.sig.InvalidCollection', arguments);
        }

        arr = aCollection.asArray();
    }

    tmparr = TP.ac();
    index = (index > 0) ? index : this.normalizeIndex(index);

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
     * @name atAll
     * @synopsis Returns an array containing the values at each of the indices
     *     provided.
     * @param {TPCollection} aCollection The collection of indexes.
     * @raises TP.sig.InvalidCollection, TP.sig.InvalidIndex
     * @returns {Array} A new array containing the values collected.
     * @todo
     */

    var arr,
        tmparr,
        thisref;

    if (TP.isArray(aCollection)) {
        arr = aCollection;
    } else {
        if (!TP.canInvoke(aCollection, 'asArray')) {
            return this.raise('TP.sig.InvalidCollection', arguments);
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

Array.Inst.defineMethod('atAllIfAbsent',
function(aCollection) {

    /**
     * @name atAllIfAbsent
     * @param {TPCollection} aCollection
     * @raises TP.sig.InvalidCollection, TP.sig.InvalidIndex
     * @returns {Array}
     * @abstract
     * @todo
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('atAllPut',
function(aCollection, anItem) {

    /**
     * @name atAllPut
     * @synopsis Inserts anItem at a set of locations.
     * @description Places anItem at each location in the receiver. If the
     *     optional collection is provided the indices listed in the collection
     *     are updated rather than the entire array.
     * @param {TPCollection} aCollection An optional collection specifying
     *     indexes which should be altered to contain anItem.
     * @param {Object} anItem The element to put at all the locations in this
     *     array (unless aCollection of indexes is provided).
     * @raises TP.sig.InvalidCollection
     * @returns {Array} The receiver.
     * @signals Change
     * @todo
     */

    var arr,
        altered,
        thisref,

        len;

    if (TP.isArray(aCollection)) {
        arr = aCollection;
    } else {
        if (!TP.canInvoke(aCollection, 'asArray')) {
            return this.raise('TP.sig.InvalidCollection', arguments);
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
     * @name atIfInvalid
     * @synopsis Returns the value at the index provided or the default value if
     *     the key returns an invalid value.
     * @description If a Function is supplied as the default value to this
     *     method, it will be executed and its value will be returned as the
     *     value. Therefore, this method cannot be used if the Function object
     *     itself is what is desired as the returned value.
     * @param {Number} anIndex The index of the value to return.
     * @param {Object} aDefault The default value to return if undefined.
     *     Functions are executed to return their value in response.
     * @returns {Object} The element at anIndex in this collection.
     * @todo
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
     * @name atIfNull
     * @synopsis Returns the value at the index provided or the default value if
     *     the key returns null (and not undefined).
     * @description If a Function is supplied as the default value to this
     *     method, it will be executed and its value will be returned as the
     *     value. Therefore, this method cannot be used if the Function object
     *     itself is what is desired as the returned value.
     * @param {Number} anIndex The index of the value to return.
     * @param {Object} aDefault The default value to return if undefined.
     *     Functions are executed to return their value in response.
     * @returns {Object} The element at anIndex in this collection.
     * @todo
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
     * @name atIfUndefined
     * @synopsis Returns the value at the index provided or the default value if
     *     the key returns undefined.
     * @description If a Function is supplied as the default value to this
     *     method, it will be executed and its value will be returned as the
     *     value. Therefore, this method cannot be used if the Function object
     *     itself is what is desired as the returned value.
     * @param {Number} anIndex The index of the value to return.
     * @param {Object} aDefault The default value to return if undefined.
     *     Functions are executed to return their value in response.
     * @returns {Object} The element at anIndex in this collection.
     * @todo
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
     * @name atPutIfAbsent
     * @synopsis Add the key and value if the key doesn't already exist. NOTE
     *     that the value isn't relevant in this test, the value may be null, or
     *     undefined, and as long at the key has been defined at some point this
     *     method will not update the value.
     * @param {Object} aKey The key to test and optionally add to the receiver.
     * @param {Object} aValue Optional value to store when the first argument is
     *     a string.
     * @raises InvalidPair
     * @returns {Object} The key's value after processing.
     * @signals Change
     * @todo
     */

    if (!TP.isNumber(aKey)) {
        return this.raise('TP.sig.InvalidParameter', arguments);
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
     * @name detectKeyAt
     * @synopsis Searches for the first nested element whose value at(anIndex)
     *     matches aKey. This can be a useful detection for finding data in an
     *     ordered collection (array, sorted hash, or node) by the value at a
     *     particular index or attribute location.
     * @param {String|RegExp} aKey The string or regular expression selector to
     *     match with.
     * @param {Number} anIndex The "column" index to check in each nested array.
     * @returns {Array} The nested array whose value at anIndex matches aKey.
     * @todo
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

Array.Inst.defineMethod('getPosition',
function(anItem, startIndex, aTest) {

    /**
     * @name getPosition
     * @synopsis Returns the first index of anItem in the receiver.
     * @param {Object} anItem The element to search for.
     * @param {Number} startIndex The index to start looking for anItem.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Number} The first index of an element equal to anItem.
     * @todo
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
     * @name getPositions
     * @synopsis Returns an array containing all indexes where anItem exists.
     * @param {Object} anItem The value to search for.
     * @param {Number} startIndex The index to start looking for anItem.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Array} A new array of indexes.
     * @todo
     */

    var tmparr,
        start;

    start = TP.ifInvalid(this.normalizeIndex(startIndex), 0);

    this.$sortIfNeeded();

    tmparr = TP.ac();

    this.perform(
        function(item, index) {

            if (index < start) {
                return;
            }

            switch (aTest) {
                case TP.IDENTITY:

                    if (TP.identical(item, anItem)) {
                        tmparr.push(index);
                    }
                    break;

                default:

                    if (TP.equal(item, anItem)) {
                        tmparr.push(index);
                    }
                    break;
            }
        });

    return tmparr;
});

//  ------------------------------------------------------------------------
//  grepKeys                    Kernel
//  ------------------------------------------------------------------------
//  performOver                 Kernel
//  ------------------------------------------------------------------------

Array.Inst.defineMethod('removeAt',
function(anIndex) {

    /**
     * @name removeAt
     * @synopsis Removes the element at the index provided.
     * @param {Number} anIndex The index at which to remove the element.
     * @raises TP.sig.InvalidIndex
     * @returns {Array} The receiver.
     * @signals Change
     * @todo
     */

    var index,

        len;

    index = parseInt(anIndex, 10);
    if (!TP.isNumber(index)) {
        return this.raise('TP.sig.InvalidIndex', arguments);
    }

    this.$sortIfNeeded();

    index = (index > 0) ? index : this.normalizeIndex(index);
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
     * @name removeAtAll
     * @synopsis Removes the elements at the indexes (keys) contained in the
     *     collection provided. Upon completion the remaining elements are
     *     shifted into new positions.
     * @param {TPCollection} aCollection The collection of indexes. TP.EQUALITY.
     * @raises TP.sig.InvalidCollection
     * @returns {Array} The receiver.
     * @signals Change
     * @todo
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
            return this.raise('TP.sig.InvalidCollection', arguments);
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
     * @name transpose
     * @synopsis Transposes the rows and columns of an array whose elements are
     *     other arrays. For example, [[1,2],[3,4],[5,6]] becomes an array
     *     containing [[1,3,5],[2,4,6]].
     * @returns {Array} An array containing ordered pairs (or triplets, quads,
     *     etc.) constructed from the receiver and incoming collection elements.
     * @todo
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
     * @name addAfter
     * @synopsis Adds the value provided after the element provided.
     * @param {Object} aValue The value to add after anItem.
     * @param {Object} anItem The item located to define the index.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @raises NotFound
     * @returns {Array} The receiver.
     * @signals Change
     * @todo
     */

    var ind;

    ind = this.getPosition(anItem, 0, aTest);
    if (ind === TP.NOT_FOUND) {
        return this.raise('TP.sig.NotFound', arguments);
    }

    return this.addAt(aValue, ind + 1);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('addAllAfter',
function(aCollection, anItem, aTest) {

    /**
     * @name addAllAfter
     * @synopsis Adds the collection of elements after the element provided.
     * @param {TPCollection} aCollection The collection containing the elements
     *     to add after aValue.
     * @param {Object} anItem The element used to locate the index for the
     *     addition.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @raises NotFound
     * @returns {Array} The receiver.
     * @signals Change
     * @todo
     */

    var ind;

    ind = this.getPosition(anItem, 0, aTest);
    if (ind === TP.NOT_FOUND) {
        return this.raise('TP.sig.NotFound', arguments);
    }

    return this.addAllAt(aCollection, ind + 1);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('addAllBefore',
function(aCollection, anItem, aTest) {

    /**
     * @name addAllBefore
     * @synopsis Adds the collection of elements before the element equal to the
     *     value provided.
     * @param {TPCollection} aCollection The collection containing the elements
     *     to add before aValue.
     * @param {Object} anItem The element used to locate the insertion index.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @raises NotFound
     * @returns {Array} The receiver.
     * @signals Change
     * @todo
     */

    var ind;

    ind = this.getPosition(anItem, 0, aTest);
    if (ind === TP.NOT_FOUND) {
        return this.raise('TP.sig.NotFound', arguments);
    }

    return this.addAllAt(aCollection, ind);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('addAllFirst',
function(aCollection) {

    /**
     * @name addAllFirst
     * @synopsis Adds the elements of the collection at the start of the array.
     * @param {TPCollection} aCollection The collection containing the elements
     *     to prepend.
     * @returns {Array} The receiver.
     * @signals Change
     * @todo
     */

    return this.addAllAt(aCollection, 0);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('addAllLast',
function(aCollection) {

    /**
     * @name addAllLast
     * @synopsis Appends the elements of the collection to the receiver.
     * @param {TPCollection} aCollection The collection containing the elements
     *     to append.
     * @returns {Array} The receiver.
     * @signals Change
     * @todo
     */

    return this.addAllAt(aCollection, this.length);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('addBefore',
function(aValue, anItem, aTest) {

    /**
     * @name addBefore
     * @synopsis Adds aValue prior to the first occurrence of anItem
     * @param {Object} aValue The value to add before the search element.
     * @param {Object} anItem The element used to locate the insertion point.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @raises NotFound
     * @returns {Array} The receiver.
     * @signals Change
     * @todo
     */

    var ind;

    ind = this.getPosition(anItem, 0, aTest);
    if (ind === TP.NOT_FOUND) {
        return this.raise('TP.sig.NotFound', arguments);
    }

    return this.addAt(aValue, ind);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('addFirst',
function(aValue) {

    /**
     * @name addFirst
     * @synopsis Adds the values provided to the start of the receiver.
     * @param {arguments} varargs A variable list of arguments.
     * @returns {Array} The receiver.
     * @signals Change
     * @todo
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
function(aValue) {

    /**
     * @name addLast
     * @synopsis Appends the values provided to the end of the receiver.
     * @param {arguments} varargs A variable list of arguments.
     * @returns {Array} The receiver.
     * @signals Change
     * @todo
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
function(anItem, aTest, noRaise) {

    /**
     * @name after
     * @synopsis Returns the element, if any, after the element provided.
     * @param {Object} anItem The item to search for.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @raises NotFound
     * @returns {Object} An object or undefined.
     * @todo
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
function(anItem, aTest, noRaise) {

    /**
     * @name before
     * @synopsis Returns the element, if any, before the element provided.
     * @param {Object} anItem The item to search for.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @raises NotFound
     * @returns {Object} An object or undefined.
     * @todo
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
     * @name getLastPosition
     * @synopsis Returns the last index of anItem in the receiver.
     * @param {Object} anItem The item to search for.
     * @param {Number} startIndex What index should search "start" from keeping
     *     in mind that we're working backwards so this will be the "last" index
     *     that is checked.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Number} The last index of the element equal to anItem.
     * @todo
     */

    var found;

    found = TP.NOT_FOUND;

    this.perform(
        function(item, index) {

            switch (aTest) {
                case TP.IDENTITY:

                    if (TP.identical(item, anItem)) {
                        found = index;
                        return TP.BREAK;
                    }

                    break;

                default:

                    if (TP.equal(item, anItem)) {
                        found = index;
                        return TP.BREAK;
                    }

                    break;
            }
        },
        null,
        true);      //  reverse the order

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
     * @name removeFirst
     * @synopsis Removes the first occurrence of anItem in the receiver.
     * @param {Object} anItem The item to remove.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Array} The receiver.
     * @signals Change
     * @todo
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
     * @name removeLast
     * @synopsis Removes the last occurrence of anItem in the receiver, or the
     *     last element if no specific element is provided.
     * @param {Object} anItem The item to remove.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Array} The receiver.
     * @signals Change
     * @todo
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
     * @name replaceFirst
     * @synopsis Replaces the first element having the value oldValue with an
     *     element having the value newValue.
     * @param {Object} oldValue The old value to look for.
     * @param {Object} newValue The new value to replace the old value with.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Array} The receiver.
     * @signals Change
     * @todo
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
     * @name replaceLast
     * @synopsis Replaces the last element having the value oldValue with an
     *     element having the value newValue.
     * @param {Object} oldValue The old value to look for.
     * @param {Object} newValue The new value to replace the old value with.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Array} The receiver.
     * @signals Change
     * @todo
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
     * @name getSortFunction
     * @synopsis Returns the current sort function or null.
     * @returns {Function} This array's sort function.
     */

    return this.sortFunction;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('isSorted',
function() {

    /**
     * @name isSorted
     * @synopsis Returns true if the receiver is sorted.
     * @returns {Boolean}
     */

    return !this.$needsSort;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('setSortFunction',
function(aFunction) {

    /**
     * @name setSortFunction
     * @synopsis Sets the receiver's internal sort function.
     * @description This function will be called any time the receiver has been
     *     updated without being sorted and a request for a value is made. This
     *     method will flag the receiver so that a re-sort will occur on the
     *     next data access call.
     * @param {Function} aFunction The function to set this array's sort
     *     function to.
     * @raises TP.sig.InvalidFunction
     * @returns {Array} The receiver.
     * @signals Change
     * @todo
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
     * @name avg
     * @synopsis Returns the average value from an array of numbers. This is
     *     equivalent to sum()/getSize();
     * @returns {Number} The average of numeric values in the receiver.
     */

    return this.sum() / this.getSize();
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('max',
function() {

    /**
     * @name max
     * @synopsis Returns the numerical maximum value from the receiver.
     * @returns {Number} The highest value number in the receiver.
     */

    return this.detectMax(TP.RETURN_ARG0);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('min',
function() {

    /**
     * @name min
     * @synopsis Returns the numerical minimum value from the receiver.
     * @returns {Number} The lowest value number in the receiver.
     */

    return this.detectMin(TP.RETURN_ARG0);
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('sum',
function() {

    /**
     * @name sum
     * @synopsis Adds the numeric values in the receiver to produce a sum.
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
     * @name times
     * @synopsis Expands the receiver's content multiple times. For example, an
     *     array containing 1,2,3 * 3 becomes 1,2,3,1,2,3,1,2,3.
     * @param {Number} aCount The number of times to duplicate the receiver's
     *     content.
     * @param {Boolean} inline False to construct a new instance, otherwise the
     *     receiver is modified.
     * @returns {Array} The receiver, or a new instance if inline is false.
     * @todo
     */

    var arr,
        dat;

    if (aCount < 2) {
        return TP.isFalse(inline) ? this.copy() : this;
    }

    if (TP.isFalse(inline)) {
        dat = this;
        arr = this.copy();
    } else {
        dat = this.copy();
        arr = this;
    }

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
 * @synopsis Collection API extensions for Object.
 * @description Because of the problems associated with keeping a clear
 *     distinction between keys which are "content" and keys which are
 *     "properties" we _STRONGLY_ discourage using Objects as hashes. But for
 *     polymorphic reasons we add a few methods in the kernel so if you get an
 *     Object rather than a TP.lang.Hash once in a while it hopefully won't
 *     cause everything to break.
 * @subject Collection Extensions
 * @todo
 */

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.defineCommonMethod('collapse',
function() {

    /**
     * @name collapse
     * @synopsis Returns the receiver.
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
     * @name asHash
     * @synopsis Returns the receiver as a suitable hash.
     * @returns {TP.lang.Hash} The receiver as a TP.lang.Hash.
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
     * @name removeKey
     * @synopsis Removes the key provided if the collection contains it. Note
     *     that this won't remove a key if the key references a method.
     * @param {Object} aKey The key value to remove.
     * @raises TP.sig.InvalidParameter
     * @returns {Object} The receiver.
     * @signals Change
     * @todo
     */

    var k;

    if (TP.notValid(aKey)) {
        return this.raise('TP.sig.InvalidParameter', arguments);
    }

    k = this.at(aKey);
    if (TP.notDefined(k)) {
        return;
    }

    if (TP.isMethod(k)) {
        return this.raise('TP.sig.InvalidOperation',
            arguments, 'Attempt to replace/remove method: ' + k);
    }

    delete(this[aKey]);

    this.changed('value', TP.DELETE);

    return this;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('removeKeys',
function(aKeyArray) {

    /**
     * @name removeKeys
     * @synopsis Removes the keys provided if the collection contains them. Note
     *     that this won't remove a key if the key references a method.
     * @param {Array} aKeyArray The key values to remove.
     * @raises TP.sig.InvalidParameter
     * @returns {Object} The receiver.
     * @signals Change
     * @todo
     */

    var changed;

    if (TP.notValid(aKeyArray)) {
        return this.raise('TP.sig.InvalidParameter', arguments);
    }

    changed = false;

    aKeyArray.perform(
        function(aKey) {

            var k;

            k = this.at(aKey);
            if (TP.notDefined(k)) {
                return;
            }

            if (TP.isMethod(k)) {
                this.raise('TP.sig.InvalidOperation',
                    arguments, 'Attempt to replace/remove method: ' + k);

                return TP.BREAK;
            }

            changed = true;
            delete(this[aKey]);
        });

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
 * @synopsis Extensions to Number for collection-related behavior.
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
     * @name asRange
     * @synopsis Returns a TP.core.Range from startIndex to the receiver by
     *     step.
     * @param {Number} startIndex What index should begin the range. The default
     *     is 0.
     * @param {Number} aStep What step should we use? The default is 1.
     * @returns {TP.core.Range}
     * @todo
     */

    var step,
        start;

    start = TP.ifInvalid(this.normalizeIndex(startIndex), 0);
    step = TP.ifInvalid(aStep, 1);

    return (start).to(this).by(step);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('getItems',
function() {

    /**
     * @name getItems
     * @synopsis Returns the "values" of the receiver, in this case a
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
     * @name getPosition
     * @synopsis Returns the first index of the element provided or undefined if
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
     * @name times
     * @synopsis Performs an operation the number of times defined by the
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
        return this.raise('TP.sig.InvalidParameter', arguments);
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
     * @name to
     * @synopsis Constructs a range from the receiver to the number provided.
     * @param {Number} endIndex A numerical index for the end of the range.
     * @raises TP.sig.TypeNotFound
     * @returns {TP.core.Range} A newly constructed TP.core.Range.
     */

    var type;

    if (TP.notValid(type = TP.sys.require('TP.core.Range'))) {
        return this.raise('TP.sig.TypeNotFound', arguments);
    }

    return type.construct(this, endIndex);
});

//  ========================================================================
//  String Extensions
//  ========================================================================

/**
 * @type {String}
 * @synopsis Extensions allowing strings to perform more powerful operations.
 *     NOTE that we don't implement any of the mutation methods since native
 *     String types aren't mutable.
 * @subject Collection Extensions
 * @todo
 */

//  ------------------------------------------------------------------------

String.Inst.defineMethod('$$isPair',
function() {

    /**
     * @name $$isPair
     * @synopsis Returns true if the receiver can be thought of as an ordered
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
     * @name asHash
     * @synopsis Returns the receiver as a TP.lang.Hash.
     * @returns {TP.lang.Hash} The receiver converted into a TP.lang.Hash.
     */

    //  Make sure to '.toString()' this to get the primitive value.
    return TP.hc('value', this.toString());
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asIterator',
function(aStep) {

    /**
     * @name asIterator
     * @synopsis Returns a new iterator on the receiver.
     * @param {Number} aStep Defines the increment size the iteration should
     *     use. The default value is 1.
     * @returns {TP.core.Iterator} The new iterator.
     * @todo
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asRange',
function() {

    /**
     * @name asRange
     * @synopsis Returns a new TP.core.Range based on the size of the receiver.
     * @raises TP.sig.TypeNotFound
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
     * @name collapse
     * @synopsis Returns the "simplest" form of the receiver possible, meaning
     *     that when the receiver has only one item that item is returned,
     *     otherwise the receiver is returned.
     * @returns {String|Object} The receiver, or its single item.
     */

    if (this.getSize() === 1) {
        return this.charAt(0);
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
     * @name contains
     * @synopsis Returns true if the receiver contains the value.
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
     * @name containsAll
     * @synopsis Returns true if all the values in the collection provided are
     *     found in the receiver.
     * @param {TPCollection} aCollection The collection of elements all of which
     *     must be equal to at least one element in the receiver for this method
     *     to return true.
     * @raises TP.sig.InvalidCollection
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
            return this.raise('TP.sig.InvalidCollection', arguments);
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
     * @name containsAny
     * @synopsis Returns true if any of the values in the collection provided
     *     are found in the receiver.
     * @param {TPCollection} aCollection The collection of elements any of which
     *     must be equal to any element in the receiver for this method to be
     *     true.
     * @raises TP.sig.InvalidCollection
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
            return this.raise('TP.sig.InvalidCollection', arguments);
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
     * @name containsString
     * @synopsis Returns true if the receiver contains the string provided.
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
     * @name countOf
     * @synopsis Returns a count of the number of times aValue is found in the
     *     string.
     * @param {String} aValue The value that elements in the string must be
     *     equal to to be counted.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Number} The number of occurrences of aValue.
     * @todo
     */

    return this.getPositions(aValue).getSize();
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('detect',
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

    var retVal,
        start;

    start = TP.ifInvalid(this.normalizeIndex(startIndex), 0);

    retVal = undefined;

    this.perform(
        function(item, index) {

            if (index < start) {
                return;
            }

            if (aFunction(item, index)) {
                retVal = item;

                return TP.BREAK;
            }
        });

    return retVal;
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
     * @name difference
     * @synopsis Returns the elements contained in the receiver which are not in
     *     the collection provided.
     * @description This method can be thought of as subtracting all elements
     *     found in the collection provided from the receiver. What's left are
     *     those elements unique to the receiver.
     * @param {TPCollection} aCollection The collection to difference against
     *     the receiver.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @raises TP.sig.InvalidCollection
     * @returns {String} The difference between aCollection and the receiver.
     * @todo
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('disjunction',
function(aCollection, aTest) {

    /**
     * @name disjunction
     * @synopsis Returns the 'symmetric difference' or those elements which are
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
     * @todo
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
     * @name getIterator
     * @synopsis Returns the receiver's internal iterator. If no iterator exists
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
     * @name getIteratorType
     * @synopsis Returns the type of iterator used for the receiver.
     * @returns {TP.core.Iterator} The type of the iterator.
     */

    var type;

    if (TP.notValid(type = TP.sys.getTypeByName('TP.core.Iterator'))) {
        return this.raise('TP.sig.TypeNotFound', arguments);
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
function(aCollection, aTest) {

    /**
     * @name intersection
     * @synopsis Returns the intersection of the two collections.
     * @description This method returns a collection of those elements which
     *     occur in BOTH the receiver and in aCollection.
     * @param {TPCollection} aCollection The collection to intersect the
     *     receiver with.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @raises TP.sig.InvalidCollection
     * @returns {Array} An array of elements occurring in both.
     * @todo
     */

    if (!TP.canInvoke(aCollection, 'contains')) {
        return this.raise('TP.sig.InvalidCollection', arguments);
    }

    return this.select(
        function(item) {

            return aCollection.contains(item, aTest);
        });
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('isSortedCollection',
function() {

    /**
     * @name isSortedCollection
     * @synopsis Returns true if the receiver is a sorted collection. String
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
     * @name union
     * @synopsis Returns a new string containing the members of both strings.
     * @description This method computes a new string of characters, placing
     *     into it all characters from this string and all elements from
     *     aCollection.
     * @param {TPCollection} aCollection The other collection to union this
     *     string against.
     * @raises TP.sig.InvalidCollection
     * @returns {Array} The new string containing elements from both
     *     collections.
     * @todo
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
     * @name atAll
     * @synopsis Returns a new collection containing the characters in the
     *     receiver at the various indexes contained in the collection provided.
     * @param {TPCollection} aCollection The collection of numeric indices to
     *     use.
     * @raises TP.sig.InvalidParameter, TP.sig.InvalidCollection
     * @returns {Array} An array of zero or more items.
     * @todo
     */

    return this.split('').atAll(aCollection);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('atAllIfAbsent',
function(aCollection) {

    /**
     * @name atAllIfAbsent
     * @param {TPCollection} aCollection The collection of indexes.
     * @raises TP.sig.InvalidCollection, TP.sig.InvalidIndex
     * @abstract
     * @return
     * @todo
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------
//  atAllPut                    Mutator - not implemented for String
//  ------------------------------------------------------------------------

String.Inst.defineMethod('atIfInvalid',
function(anIndex, aDefault) {

    /**
     * @name atIfInvalid
     * @synopsis Returns the value at the index provided or the default value if
     *     the key returns an invalid value.
     * @description If a Function is supplied as the default value to this
     *     method, it will be executed and its value will be returned as the
     *     value. Therefore, this method cannot be used if the Function object
     *     itself is what is desired as the returned value.
     * @param {Number} anIndex The index of the value to return.
     * @param {Object} aDefault The default value to return if undefined.
     *     Functions are executed to return their value in response.
     * @returns {Object} The element at anIndex in this collection.
     * @todo
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
     * @name atIfNull
     * @synopsis Returns the value at the index provided or the default value if
     *     the key returns null (and not undefined).
     * @description If a Function is supplied as the default value to this
     *     method, it will be executed and its value will be returned as the
     *     value. Therefore, this method cannot be used if the Function object
     *     itself is what is desired as the returned value.
     * @param {Number} anIndex The index of the value to return.
     * @param {Object} aDefault The default value to return if undefined.
     *     Functions are executed to return their value in response.
     * @returns {Object} The element at anIndex in this collection.
     * @todo
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
     * @name atIfUndefined
     * @synopsis Returns the value at the index provided or the default value if
     *     the key returns undefined.
     * @description If a Function is supplied as the default value to this
     *     method, it will be executed and its value will be returned as the
     *     value. Therefore, this method cannot be used if the Function object
     *     itself is what is desired as the returned value.
     * @param {Number} anIndex The index of the value to return.
     * @param {Object} aDefault The default value to return if undefined.
     *     Functions are executed to return their value in response.
     * @returns {Object} The element at anIndex in this collection.
     * @todo
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
     * @name detectKeyAt
     * @synopsis Searches for the first nested element whose value at(anIndex)
     *     matches aKey. This can be a useful detection for finding data in an
     *     ordered collection (array, sorted hash, or node) by the value at a
     *     particular index or attribute location.
     * @param {String|RegExp} aKey The string or regular expression selector to
     *     match with.
     * @param {Number} anIndex The "column" index to check in each nested array.
     * @returns {Array} The nested array whose value at anIndex matches aKey.
     * @todo
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
     * @name getPosition
     * @synopsis Returns the first index of anItem in the receiver.
     * @param {Object} anItem The element to search for.
     * @param {Number} startIndex The index to start looking for anItem.
     * @returns {Number} The first index of an element equal to anItem.
     * @todo
     */

    return this.indexOf(anItem, startIndex);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('getPositions',
function(aValue, startIndex) {

    /**
     * @name getPositions
     * @synopsis Returns a collection of all indexes where the value is found.
     * @param {String} aValue The character to look for.
     * @param {Number} startIndex The index to start looking for aValue.
     * @returns {Array} An array containing indexes for the value provided. May
     *     be empty.
     * @todo
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
     * @name after
     * @synopsis Returns the portion of the receiver after the substring
     *     provided.
     * @param {String} substring The substring to search for.
     * @returns {String} The next element or undefined.
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
     * @name before
     * @synopsis Returns the portion of the receiver preceding the substring
     *     provided.
     * @param {String} substring The substring to search for.
     * @returns {String} The previous substring.
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
     * @name getLastPosition
     * @synopsis Returns the last index of anItem in the receiver.
     * @param {Object} anItem The element to search for.
     * @param {Number} startIndex The index to start looking for anItem.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY.
     *     Ignore for this type.
     * @returns {Number} The last index of an element equal to anItem.
     * @todo
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
//  TP.lang.Hash
//  ========================================================================

/**
 * @type {TP.lang.Hash}
 * @synopsis Collection-oriented API's for TP.lang.Hash base class.
 * @description TIBET's hash (dictionary, associative array) type. You should
 *     always use a TP.lang.Hash (available via TP.hc()) when dealing with data
 *     in key/value form. In TIBET it's a dangerous, and potentially slow
 *     practice to use a regular object ({}) as a hash. We recommend you never
 *     use an Object as a hash since there's no clear separation between
 *     properties that represent content and those that represent the state
 *     and/or behavior of the hash itself. In addition, iteration on a standard
 *     object in TIBET using for/in can be quite slow.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('lang:Hash');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  NOTE: Make sure this parser is installed first! Because of ambiguities
//  in syntax, the URI parsers below will also match a 'style string' and we
//  want to give one first crack at it.
TP.lang.Hash.Type.defineConstant('STYLE_STRING_PARSER',
function(aString) {

    /**
     * @name STYLE_STRING_PARSER
     * @synopsis A parse function specific to CSS style strings.
     * @description The input is checked for conformance to key:value; syntax
     *     and parsed into a valid hash if it matches. In addition the keys are
     *     converted into their proper DOM equivalents so that 'float' in CSS
     *     becomes 'cssFloat' in the hash.
     * @param {String} aString A valid CSS style string.
     * @returns {TP.lang.Hash} A new instance.
     */

    var dict;

    TP.regex.STYLE_STRING.lastIndex = 0;
    if (TP.regex.STYLE_STRING.test(aString)) {
        dict = TP.hc();
        TP.regex.STYLE_STRING.performWith(
            function(whole, key, value, index, str) {

                //  don't make keys of undefined, and don't let trailing ;
                //  mess things up if the regex matched to that separator
                if ((key = key.strip(';').asDOMName())) {
                    dict.atPut(key, value);
                }
            }, aString);
    } else {
        //  We don't match a style string.
        return null;
    }

    return dict;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.addParser(TP.lang.Hash.STYLE_STRING_PARSER);

//  ------------------------------------------------------------------------

TP.lang.Hash.Type.defineConstant('ATTRIBUTE_STRING_PARSER',
function(aString) {

    /**
     * @name ATTRIBUTE_STRING_PARSER
     * @synopsis A parse function specific to XML attribute strings.
     * @description The input is checked for conformance to key="value" syntax
     *     and parsed into a valid hash if it matches.
     * @param {String} aString A valid XML attribute string.
     * @returns {TP.lang.Hash} A new instance.
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

TP.lang.Hash.addParser(TP.lang.Hash.ATTRIBUTE_STRING_PARSER);

//  ------------------------------------------------------------------------

TP.lang.Hash.Type.defineConstant('URI_STRING_PARSER',
function(aString) {

    /**
     * @name URI_STRING_PARSER
     * @synopsis A parse function specific to URI strings.
     * @param {String} aString A valid URI string.
     * @returns {TP.lang.Hash} A new instance.
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
                            'host', 'port',
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

    //  If we also got a query, construct a TP.lang.Hash from it.
    if (TP.notEmpty(queryPart = dict.at('query'))) {
        queryDict = TP.lang.Hash.fromString(queryPart);
        dict.atPut('queryDict', queryDict);
    }

    return dict;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.addParser(TP.lang.Hash.URI_STRING_PARSER);

//  ------------------------------------------------------------------------

TP.lang.Hash.Type.defineConstant('QUERY_STRING_PARSER',
function(aString) {

    /**
     * @name QUERY_STRING_PARSER
     * @synopsis A parse function specific to URI query strings.
     * @description The input is checked for conformance to key=value[&|;]...
     *     syntax and parsed into a valid hash if it matches. NOTE that a
     *     leading ? is allowed, and discarded by this routine (and in fact the
     *     entire URI can be passed to this routine if necessary). This method
     *     automatically decodes query values by calling decodeURIParameter() on
     *     them.
     * @param {String} aString A valid URI query string.
     * @returns {TP.lang.Hash} A new instance.
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
                dict.atPut(aKey, decodeURIComponent(aValue));
            }
        });

    return dict;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.addParser(TP.lang.Hash.QUERY_STRING_PARSER);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.definePrimitive('hc',
function() {

    /**
     * @name hc
     * @synopsis Construct and return a new hash, populating it with initial
     *     data based on the argument list.
     * @description Input data can be provided in a variety of formats including
     *     an array of ordered pairs, an array of key, value sequences, an
     *     Object (not recommended for speed reasons), a hash of key/value
     *     pairs, or a simple argument list of key, value sequences.
     * @returns {TP.lang.Hash} The receiver.
     */

    var dict,
        obj,
        i,
        pair,
        attrs,

        len,
        keys;

    dict = TP.lang.Hash.construct();

    switch (arguments.length) {
        case 0:
            break;
        case 1:
            obj = arguments[0];
            if (TP.notValid(obj)) {
                return dict;
            } else if (TP.isArray(obj)) {
                if (TP.isPair(obj[0])) {
                    //  pair syntax [['a', 1], ['b', 2], ['c', 3]]
                    for (i = 0; i < obj.length; i++) {
                        pair = obj[i];
                        dict.atPut(
                            pair[0],
                            pair[1],
                            false);
                    }
                } else {
                    //  array syntax ['a', 1, 'b', 2, 'c', 3]
                    for (i = 0; i < obj.length; i += 2) {
                        dict.atPut(
                            obj[i],
                            obj[i + 1],
                            false);
                    }
                }
            } else if (TP.isString(obj)) {
                return TP.lang.Hash.fromString(obj);
            } else if (TP.isElement(obj)) {
                attrs = obj.attributes;
                len = attrs.length;

                for (i = 0; i < len; i++) {
                    dict.atPut(attrs[i].name, attrs[i].value);
                }
            } else if (TP.isKindOf(obj, TP.lang.Hash)) {
                return obj;
            } else {
                //  NB: We're only interested in the local keys here.
                keys = TP.$getOwnKeys(obj);
                len = keys.getSize();

                for (i = 0; i < len; i++) {
                    dict.atPut(keys.at(i), obj[keys.at(i)], false);
                }
            }
            break;
        default:
            //  arguments syntax 'a', 1, 'b', 2, 'c', 3
            for (i = 0; i < arguments.length; i += 2) {
                dict.atPut(
                    arguments[i],
                    arguments[i + 1],
                    false);
            }
            break;
    }

    return dict;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineAttribute('$$hash');

//  what delim should be used when joining array elements into a string
TP.lang.Hash.Inst.defineAttribute('delimiter', ', ');

//  ------------------------------------------------------------------------

TP.lang.Hash.Type.defineMethod('fromObject',
function(anObject) {

    /**
     * @name fromObject
     * @synopsis Constructs a new hash from the object(s) provided as arguments.
     * @param {Object} anObject The source object.
     * @returns {TP.lang.Hash} A new instance.
     */

    //  the constructor handles most everything possible that'll actually
    //  work
    return this.construct(anObject);
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('init',
function() {

    /**
     * @name init
     * @synopsis Initialize the instance.
     * @returns {TP.lang.Hash} The receiver.
     */

    var hash,
        obj,
        i,
        pair,
        attrs,

        keys,
        len;

    this.callNextMethod();

    //  force a unique ID
    this.$set(TP.ID, TP.genID('TP.lang.Hash'));

    //  allocate internal hash - note that it is a prototype-less object.
    hash = TP.constructOrphanObject();
    this.$set('$$hash', hash);

    switch (arguments.length) {
        case 0:
            break;
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
                    }
                } else {
                    //  array syntax ['a', 1, 'b', 2, 'c', 3]
                    for (i = 0; i < obj.length; i += 2) {
                        this.atPut(
                            obj[i],
                            TP.notDefined(obj[i + 1]) ? null : obj[i + 1],
                            false);
                    }
                }
            } else if (TP.isString(obj)) {
                return TP.lang.Hash.fromString(obj);
            } else if (TP.isElement(obj)) {
                attrs = obj.attributes;
                len = attrs.length;

                for (i = 0; i < len; i++) {
                    this.atPut(attrs[i].name, attrs[i].value);
                }
            } else if (TP.isKindOf(obj, TP.lang.Hash)) {
                return obj;
            } else {
                //  NB: We're only interested in the local keys here.
                keys = TP.$getOwnKeys(obj);
                len = keys.getSize();

                for (i = 0; i < len; i++) {
                    this.atPut(keys.at(i), obj[keys.at(i)], false);
                }
            }
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
            }
            break;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('addAllKeys',
function(aCollection) {

    /**
     * @name addAllKeys
     * @synopsis Adds all the keys contained in aCollection.
     * @description This is a fast way to get a simple lookup table from an
     *     array. The values are initialized to their index, effectively
     *     inverting the array into the hash. You can use the resulting hash to
     *     do containment checking against a hash key instead of scanning the
     *     original array by using hash.containsKey().
     * @param {TPCollection} aCollection A collection of one or more keys.
     * @returns {TP.lang.Hash} The receiver.
     * @signals Change
     * @todo
     */

    var keys,
        hash,
        keyArr,
        i,
        len,
        item;

    if (!TP.canInvoke(aCollection, 'getKeys')) {
        this.raise('TP.sig.InvalidCollection', arguments);
        return;
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
            keyArr.push(item);
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

TP.lang.Hash.Inst.defineMethod('asAttributeString',
function() {

    /**
     * @name asAttributeString
     * @synopsis Returns the receiver in an XML attribute string format, meaning
     *     each key/value pair becomes key="value" and each pair is separated by
     *     a single space. The resulting string is suitable for inclusion in
     *     strings used to construct nodes.
     * @returns {String} The receiver as an attribute String.
     */

    return TP.attributeStringFromHash(this);
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('asDumpString',
function() {

    /**
     * @name asDumpString
     * @synopsis Returns the receiver as a string suitable for use in log
     *     output.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    var joinCh,

        joinArr,

        keys,
        len,
        i,

        joinStr;

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
    this.$$format_asDumpString = true;

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
                                TP.dump(this.at(keys.at(i)))));
        }

        joinStr = TP.tname(this) + ' :: ' + '(' + joinArr.join(joinCh) + ')';
    } catch (e) {
        joinStr = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asDumpString;

    return joinStr;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @name asHTMLString
     * @synopsis Produces an HTML string representation of the receiver.
     * @returns {String} The receiver in HTML string format.
     */

    var joinArr,

        keys,
        len,
        i,

        joinStr;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asHTMLString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asHTMLString = true;

    joinArr = TP.ac();

    try {
        keys = TP.keys(this);
        len = keys.getSize();

        for (i = 0; i < len; i++) {
            joinArr.push(
                    TP.join('<span data-name="', keys.at(i), '">',
                            TP.htmlstr(this.at(keys.at(i))),
                            '<\/span>'));
        }

        joinStr = '<span class="TP_lang_Hash">' +
                     joinArr.join('') +
                     '<\/span>';
    } catch (e) {
        joinStr = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asHTMLString;

    return joinStr;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @name asJSONSource
     * @synopsis Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    var joinArr,

        keys,
        len,
        i,

        joinStr;

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
    this.$$format_asJSONSource = true;

    joinArr = TP.ac();

    try {
        keys = TP.keys(this);
        len = keys.getSize();

        for (i = 0; i < len; i++) {
            joinArr.push(
                    TP.join(keys.at(i).quoted('"'),
                            ':',
                            TP.json(this.at(keys.at(i)))));
        }

        joinStr = '{' + joinArr.join(',') + '}';
    } catch (e) {
        joinStr = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asJSONSource;

    return joinStr;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('asObject',
function() {

    /**
     * @name asObject
     * @synopsis Returns the receiver as an array of key/value pairs. For
     *     example TP.hc('a',1,'b',2).asObject() returns the equivalent of {a:
     *     1, b: 2}.
     * @returns {Object} The receiver as an Object.
     */

    var keys,
        len,

        obj,

        i;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.conversion_asObject) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.conversion_asObject = true;

    keys = TP.keys(this);
    len = keys.getSize();

    obj = {};

    for (i = 0; i < len; i++) {
        obj[keys[i]] = this.at(keys[i]);
    }

    //  We're done - we can set the recursion flag back off.
    this.conversion_asObject = false;

    return obj;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @name asPrettyString
     * @synopsis Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    var joinArr,

        keys,
        len,
        i,

        joinStr;

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
    this.$$format_asPrettyString = true;

    joinArr = TP.ac();

    try {
        keys = TP.keys(this);
        len = keys.getSize();

        for (i = 0; i < len; i++) {
            joinArr.push(
                TP.join('<dt class="pretty key">', keys.at(i), '<\/dt>',
                        '<dd class="pretty value">',
                            TP.pretty(this.at(keys.at(i))),
                        '<\/dd>'));
        }

        joinStr = '<dl class="pretty ' + TP.escapeTypeName(TP.tname(this)) +
                        '">' +
                    '<dt>Type name<\/dt>' +
                    '<dd class="pretty typename">' +
                        this.getTypeName() +
                    '<\/dd>' +
                    joinArr.join('') +
                    '<\/dl>';
    } catch (e) {
        joinStr = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asPrettyString;

    return joinStr;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('asQueryString',
function(aSeparator) {

    /**
     * @name asQueryString
     * @synopsis Returns the receiver in URI query string form, meaning each
     *     key/value pair becomes key=value and each pair is separated by a
     *     single & or separator as provided.
     * @description This method automatically encodes query values by calling
     *     encodeURIComponent() on them.
     * @param {String} aSeparator The default is '&'.
     * @returns {String} The receiver as a valid query string.
     * @todo
     */

    var delim,
        arr,
        func;

    if (!TP.isString(delim = aSeparator)) {
        delim = '&';
    }

    arr = TP.ac();

    func = function(item, accum, index) {
        arr.push(item.first(), '=', encodeURIComponent(item.last()));
        if (!func.atEnd()) {
            arr.push(delim);
        }
    };

    this.injectInto(arr, func);

    return arr.join('');
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('asSource',
function() {

    /**
     * @name asSource
     * @synopsis Returns the receiver as a TIBET source code string.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    var keys,
        len,

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

    keys = TP.keys(this);
    len = keys.getSize();

    arr = TP.ac();

    for (i = 0; i < len; i++) {
        arr.push(
            TP.join(TP.src(keys[i]),
                    ', ',
                    TP.src(this.at(keys[i]))));
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asSource;

    return TP.join('TP.hc(', arr.join(', '), ')');
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('asStyleString',
function() {

    /**
     * @name asStyleString
     * @synopsis Returns the receiver in CSS style attribute string form,
     *     meaning each key/value pair becomes key:value and each pair is
     *     separated by a single
     * @returns {String} The receiver as a String.
     */

    return TP.styleStringFromHash(this);
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('asXMLString',
function() {

    /**
     * @name asXMLString
     * @synopsis Produces an XML string representation of the receiver.
     * @returns {String} The receiver in XML string format.
     */

    var joinArr,

        keys,
        len,
        i,

        joinStr;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asXMLString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asXMLString = true;

    joinArr = TP.ac();

    try {
        keys = TP.keys(this);
        len = keys.getSize();

        for (i = 0; i < len; i++) {
            joinArr.push(
                    TP.join('<', keys.at(i), '>',
                            TP.xmlstr(this.at(keys.at(i))),
                            '<\/', keys.at(i), '>'));
        }

        joinStr = '<instance type="' + TP.tname(this) + '">' +
                     joinArr.join('') +
                     '<\/instance>';
    } catch (e) {
        joinStr = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asXMLString;

    return joinStr;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('atAllPutKeys',
function() {

    /**
     * @name atAllPutKeys
     * @synopsis Assigns the value in each location in the collection to be
     *     equal to the key at that location. This works as an initializer for
     *     certain operations.
     * @returns {Object} The receiver.
     * @signals Change
     * @todo
     */

    this.convert(function(it, ind) {return it.first();});

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('copy',
function(aFilterNameOrKeys, contentOnly) {

    /**
     * @name copy
     * @synopsis Returns a shallow copy of the receiver. Adequate for dealing
     *     with reference type attribute problems. If contentOnly is true then a
     *     TP.lang.Hash is returned contains only the content values (key, val,
     *     key, val ...), and no 'special values' on the receiver are copied.
     * @param {String|Array} aFilterNameOrKeys A get*Interface() filter or key
     *     array.
     * @param {Boolean} contentOnly Copy content only? Default is true.
     * @returns {TP.lang.Hash} A shallow copy of the receiver.
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

    newinst = this.getType().construct();

    if (!content) {
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
            newinst.$set(ndx, this.at(ndx), false);
        }
    } else {
        if (!TP.isArray(keys = aFilterNameOrKeys)) {
            keys = TP.keys(this);
        }

        len = keys.getSize();

        for (i = 0; i < len; i++) {
            ndx = keys.at(i);
            newinst.atPut(ndx, this.at(ndx), false);
        }
    }

    return newinst;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('get',
function(attributeName) {

    /**
     * @name get
     * @synopsis Returns the value of attributeName from the receiver.
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
        args,
    
        funcName,
        
        val;

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
    
        //  This part is specific to TP.lang.Hash - we check with our internal
        //  hash.
        if (TP.isDefined(val = this.at(attributeName))) {
            return val;
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

TP.lang.Hash.Inst.defineMethod('getParameters',
function() {

    /**
     * @name getParameters
     * @synopsis Returns the receiver's parameters. For a TP.lang.Hash this
     *     returns the hash itself.
     * @returns {Object} A TP.lang.Hash or TP.sig.Request containing parameter
     *     data (typically).
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('hasKey',
function(aKey) {

    /**
     * @name hasKey
     * @synopsis Returns true if aKey has been defined for the receiver.
     * @param {String} aKey The string key to test for.
     * @returns {Boolean} True if the key is defined.
     */

    //  Note how we use 'TP.FunctionProto.hasOwnProperty.call'... this is due
    //  to the fact that the hash itself is a prototype-less Object and
    //  therefore 'hasOwnProperty' won't exist.
    return TP.FunctionProto.hasOwnProperty.call(this.$get('$$hash'), aKey);
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('$$isPair',
function() {

    /**
     * @name $$isPair
     * @synopsis This method always returns false for TP.lang.Hash.
     * @returns {Boolean} False as TP.lang.Hash is never an ordered pair.
     */

    return false;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('populate',
function(propertyHash, defaultSource, defaultsPrompt, onlyMissing) {

    /**
     * @name populate
     * @synopsis Populates the keys listed in the propertyHash by prompting the
     *     user. Information in the propertyHash provides the keys to populate,
     *     the prompts to use, and optionally the aspects to use when querying
     *     the defaultSource for values.
     * @param {TP.lang.Hash} propertyHash A hash whose keys are the names of the
     *     properties to populate and whose values are either the prompts to use
     *     or arrays containing the prompt and the aspect name to use with the
     *     defaultSource for lookups.
     * @param {Object} defaultSource An optional object to query for default
     *     values using the default property name(s) given.
     * @param {Boolean} defaultsPrompt Should the default values be used or be
     *     prompts? Default is false.
     * @param {Boolean} onlyMissing Should all keys be updated or only those
     *     which are missing? Default is true.
     * @returns {TP.lang.Hash} The receiver.
     * @example:
            hash.populate(TP.hc('uri', TP.ac('uri', 'Enter Service URI'),
     *                          'password', 'Enter password');
     *
     *
     * @signals Change
     * @todo
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
        newval,
        value;

    keys = TP.keys(propertyHash);
    len = keys.getSize();

    for (i = 0; i < len; i++) {
        key = keys.at(i);

        if (TP.isDefined(value = this.at(key)) && TP.notFalse(onlyMissing)) {
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
        newval = TP.prompt(query, defval);

        this.atPut(key, newval);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('$removeInternalKey',
function(aKey) {

    /**
     * @name $removeInternalKey
     * @synopsis A private method that removes a key from our private, internal
     *     hash.
     * @param {Object} aKey The key value to remove.
     * @returns {TP.lang.Hash} The receiver.
     */

    var hash;

    hash = this.$get('$$hash');

    //  Make sure that the supplied key matches a property on our internal hash.
    if (!TP.owns(hash, aKey)) {
        return;
    }

    delete(hash[aKey]);

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('removeValue',
function(aValue, aTest) {

    /**
     * @name removeValue
     * @synopsis Removes the value provided if the collection contains it. This
     *     removes all keys which contain the value.
     * @param {Object} aValue The value to remove.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @raises TP.sig.InvalidParameter
     * @returns {Object} The receiver.
     * @signals Change
     * @todo
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

TP.lang.Hash.Inst.defineMethod('replaceKey',
function(oldKey, newKey, aTest) {

    /**
     * @name replaceKey
     * @synopsis Replaces the key/value pair oldKey/value with newKey/value.
     * @param {String} oldKey The old key to find the value with.
     * @param {String} newKey The new key to register the value under.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @raises TP.sig.InvalidKey
     * @returns {Object} The receiver.
     * @signals Change
     * @todo
     */

    var val,
        shouldSignal;

    if (TP.isEmpty(oldKey) || TP.isEmpty(newKey)) {
        return this.raise('TP.sig.InvalidKey', arguments);
    }

    //  nothing to do here...
    if (TP.equal(oldKey, newKey)) {
        return;
    }

    val = this.at(oldKey);

    //  turn off change signaling
    shouldSignal = this.shouldSignalChange();
    this.shouldSignalChange(false);

    try {
        this.removeKey(oldKey);
        this.atPut(newKey, val);
    } catch (e) {
    } finally {
        //  re-enable change notification
        this.shouldSignalChange(shouldSignal);
    }

    this.changed('keys', TP.UPDATE,
                        TP.hc(TP.OLDVAL, oldKey, TP.NEWVAL, newKey));

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('replaceValue',
function(oldValue, newValue, aTest) {

    /**
     * @name replaceValue
     * @synopsis Replaces all occurrences of oldValue with newValue.
     * @param {Object} oldValue The value to replace.
     * @param {Object} newValue The new value to update with.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Object} The receiver.
     * @signals Change
     * @todo
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
    } catch (e) {
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

TP.lang.Hash.Inst.defineMethod('set',
function(attributeName, attributeValue, shouldSignal) {

    /**
     * @name set
     * @synopsis Sets the value of the named attribute to the value provided. If
     *     no value is provided the value null is used.
     * @param {String|TP.core.AccessPath} attributeName The name of the
     *     attribute to set.
     * @param {Object} attributeValue The value to set.
     * @param {Boolean} shouldSignal If false no signaling occurs. Defaults to
     *     this.shouldSignalChange().
     * @returns {TP.lang.Hash} The receiver.
     * @signals Change
     * @todo
     */

    var path,
    
        funcName,

        args,
    
        sigFlag,
        oldFlag;

    if (TP.isEmpty(attributeName)) {
        return this.raise('TP.sig.InvalidKey', arguments);
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

    //  NB: Use this construct this way for better performance
    if (TP.notValid(sigFlag = shouldSignal)) {
        sigFlag = this.shouldSignalChange();
    }

    if (sigFlag) {
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

TP.lang.Hash.Inst.defineMethod('setDelimiter',
function(aString) {

    /**
     * @name setDelimiter
     * @synopsis Sets the join delimiter to use when converting the hash to and
     *     from a string.
     * @param {String} aString The string used to join() the array.
     * @returns {TP.lang.Hash} The receiver.
     */

    var str;

    str = TP.ifInvalid(aString, ', ');

    if (this.$get('delimiter') !== str) {
        this.$set('delimiter', str);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('shift',
function() {

    /**
     * @name shift
     * @synopsis Removes and returns the first element in the hash, as if the
     *     hash had been turned into an array and the shift had been performed
     *     on that collection.
     * @returns {Array} An ordered pair containing the first item in the hash
     *     based on the current sort function.
     * @signals Change
     * @todo
     */

    var item;

    item = this.first();
    this.remove(item);

    return item;
});

//  ------------------------------------------------------------------------
//  TPCollection API
//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('add',
function() {

    /**
     * @name add
     * @synopsis Adds one or more key/value pairs to the receiver. The input can
     *     be provided in a variety of formats including an array of ordered
     *     pairs, an array of key, value sequences, an Object (not recommended
     *     for speed reasons), a hash of key/value pairs, or a simple argument
     *     list of key, value sequences.
     * @param {arguments} varargs Variable-length argument list of ordered
     *     pairs.
     * @returns {TP.lang.Hash} The receiver.
     * @signals Change
     * @todo
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

TP.lang.Hash.Inst.defineMethod('addAll',
function(aCollection, aFunction) {

    /**
     * @name addAll
     * @synopsis Adds all the ordered pairs contained in the collection to the
     *     receiver. The optional function can be used to decide which value
     *     will be used when a duplicate key is found.
     * @param {TPCollection} aCollection A collection of ordered pairs to add.
     * @param {Function} aFunction A function accepting a key and two values
     *     (key, old, new) which returns the value to use for the key.
     * @returns {TP.lang.Hash} The receiver.
     * @signals Change
     * @todo
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
        return this.raise('TP.sig.InvalidCollection', arguments);
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

TP.lang.Hash.Inst.defineMethod('addAllIfAbsent',
function(aCollection) {

    /**
     * @name addAllIfAbsent
     * @synopsis Adds all the ordered pairs contained in the collection to the
     *     receiver where the keys are not already in the target collection.
     * @param {TPCollection} aCollection A collection of ordered pairs to add.
     * @returns {TP.lang.Hash} The receiver.
     * @signals Change
     * @todo
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

TP.lang.Hash.Inst.defineMethod('addIfAbsent',
function(anItemOrKey, aValue, varargs) {

    /**
     * @name addIfAbsent
     * @synopsis Using the key/value pair provided assign the value to the key
     *     in the receiver if the key doesn't already exist. Additional
     *     key/value pairs can be provided just as with the TP.lang.Hash
     *     constructor to avoid having to call this routine multiple times with
     *     each pair.
     * @param {TPOrderedPair|String} anItemOrKey The ordered pair to add, or the
     *     key for a pair.
     * @param {Object} aValue Optional value to store when the first argument is
     *     a string.
     * @param {String} varargs Additional key signifying that more key/value
     *     pairs are available. When this is defined the routine will loop
     *     across all input arguments and attempt to add all valid key/value
     *     pairings that can be found.
     * @raises TP.sig.InvalidParameter
     * @returns {Object} The key's value after processing.
     * @signals Change
     * @todo
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
        this.raise('TP.sig.InvalidParameter',
                    arguments,
                    'Invalid key or item.');

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

TP.lang.Hash.Inst.defineMethod('addItem',
function(anItem) {

    /**
     * @name addItem
     * @synopsis Adds a single item to the receiver. If the key already exists
     *     the new value is inserted.
     * @param {The} anItem item to add.
     * @returns {TP.lang.Hash} The receiver.
     * @signals Change
     * @todo
     */

    if (!TP.isPair(anItem)) {
        return this.raise('InvalidPair', arguments);
    }

    this.atPut(anItem.first(), anItem.last());

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('addWithCount',
function(anObject, aCount) {

    /**
     * @name addWithCount
     * @synopsis Adds the object N times, where N defaults to 0. NOTE that in
     *     the absence of a valid count the object is not added. For a Hash the
     *     outcome is either no addition, or one new item since the key/value
     *     can only occupy on location in the Hash.
     * @param {Object} anObject The object to add.
     * @param {Number} aCount A number of times to add the object. Default is 0.
     * @returns {TP.lang.Hash} The receiver.
     * @signals Change
     * @todo
     */

    var count;

    //  no count? no work to do
    if (TP.notValid(aCount)) {
        return;
    }

    //  count, but not a number? won't try to convert, just warn/exit
    count = parseInt(aCount, 10);
    if (!TP.isNumber(count)) {
        return this.raise('TP.sig.InvalidParameter', arguments);
    }

    //  number, but less than 1? no work to do
    if (count < 1) {
        return;
    }

    //  this will check for a valid pair for us
    return this.addItem(anObject);
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('asArray',
function() {

    /**
     * @name asArray
     * @synopsis Returns the receiver as an array of key/value pairs. For
     *     example TP.hc('a',1,'b',2).asArray() returns the equivalent of [['a',
     *     1], ['b', 2]].
     * @returns {Array} The receiver as an Array.
     * @todo
     */

    return this.getPairs();
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('asHash',
function() {

    /**
     * @name asHash
     * @synopsis Returns the receiver as a suitable hash. In this type this
     *     method returns the receiver.
     * @returns {TP.lang.Hash} The receiver as a TP.lang.Hash.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('asIterator',
function(aStep) {

    /**
     * @name asIterator
     * @synopsis Returns a newly initialized interator on the receiver.
     * @param {Number} aStep The step size for iteration over the receiver.
     * @returns {TP.core.Iterator} An iterator on the receiver.
     */

    return this.getIteratorType().construct(this, aStep);
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('asRange',
function() {

    /**
     * @name asRange
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('asString',
function(verbose) {

    /**
     * @name asString
     * @synopsis Returns the hash as a string.
     * @description Constructs a new string from the hash.
     *     The join is done using the receiver's current 'delimiter' value,
     *     normally ', '. Set the 'delimiter' value on the receiver to use a
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the TP.lang.Hash's String representation. The default is true.
     * @returns {String} The receiver as a String.
     */

    var wantsVerbose,

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
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asString;

    return joinStr;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('collapse',
function() {

    /**
     * @name collapse
     * @synopsis Returns the receiver.
     * @description This method is defined purely for polymorphic reasons so
     *     that the system can just send 'collapse' to any object. For Arrays
     *     and other collections, the first item is returned.
     * @returns {Object} The receiver.
     * @todo
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

TP.lang.Hash.Inst.defineMethod('compact',
function(aFilter) {

    /**
     * @name compact
     * @synopsis Returns the receiver with all null/undefined values removed,
     *     meaning any keys whose values are null/undefined will be removed. If
     *     a filtering function is provided then items for which the function
     *     returns true will be removed and all other values will be retained.
     *     In this sense using compact with a filter is like doing a reject()
     *     inline.
     * @param {Function} aFilter The filtering function. This should return true
     *     for values to remove from the collection.
     * @returns {Array} The receiver.
     * @signals Change
     * @todo
     */

    var items,
        filter,

        shouldSignal,

        len;

    filter = aFilter || function(item) {return TP.notValid(item.last());};

    items = this.select(
        function(item, index) {

            return filter(item);
        });

    //  turn off change signaling
    shouldSignal = this.shouldSignalChange();
    this.shouldSignalChange(false);

    len = this.getSize();

    items.perform(
        function(item) {

            this.removeKey(item.first());
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

TP.lang.Hash.Inst.defineMethod('conform',
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
     * @returns {TP.lang.Hash} The receiver.
     * @signals Change
     * @todo
     */

    //  simple select when a new collection is desired
    if (TP.isFalse(inline)) {
        return TP.hc(
            this.select(
                    function(item) {

                        return TP.canInvoke(item, anInterface);
                    }));
    }

    //  this loop will clear any values where the value isn't conforming,
    //  which sets the collection up for a compact to remove all nulls
    //  (since they don't conform to any interface)
    this.perform(
        function(item, index) {

            //  NOTE the use of last() here, which is where this differs
            //  from array processing
            if (!TP.canInvoke(item.last(), anInterface)) {
                this.atPut(index, null, false);
            }
        });

    return this.compact();
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('contains',
function(anItem, aTest) {

    /**
     * @name contains
     * @synopsis Returns true if the item (anItem) provided is found in the
     *     receiver. So that hash and array containers can be used for common
     *     operations if anItem is a simple string this method returns true if
     *     that string is a key in the receiver.
     * @param {TPOrderedPair} anItem The item to find in the receiver.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @raises InvalidPair
     * @returns {Boolean} Whether or not the receiver contains the value
     *     provided.
     * @todo
     */

    var val,
        test;

    //  allow contains to work somewhat polymorphically between Hash and
    //  Array types, but note that we
    if (TP.isString(anItem)) {
        return this.containsKey(anItem);
    }

    if (!TP.isPair(anItem)) {
        return this.raise('InvalidPair', arguments);
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

    return false;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('containsAll',
function(aCollection, aTest) {

    /**
     * @name containsAll
     * @synopsis Returns true if all the values in the collection provided are
     *     found in the receiver.
     * @param {TPCollection} aCollection The collection of elements all of which
     *     must be equal to at least one element in the receiver for this method
     *     to return true.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @raises TP.sig.InvalidCollection
     * @returns {Boolean} Whether or not the receiver contains all of the values
     *     in the collection provided.
     * @todo
     */

    var arr,
        retval,
        thisref;

    if (TP.isArray(aCollection)) {
        arr = aCollection;
    } else {
        if (!TP.canInvoke(aCollection, 'asArray')) {
            return this.raise('TP.sig.InvalidCollection', arguments);
        }

        arr = aCollection.asArray();
    }

    if (TP.isEmpty(arr)) {
        return false;
    }

    retval = true;
    thisref = this;

    arr.perform(
        function(item, index) {

            if (!thisref.contains(item, aTest)) {
                retval = false;

                return TP.BREAK;
            }
        });

    return retval;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('containsAny',
function(aCollection, aTest) {

    /**
     * @name containsAny
     * @synopsis Returns true if any of the values in the collection provided
     *     are found in the receiver.
     * @param {TPCollection} aCollection The collection of elements any of which
     *     must be equal to any element in the receiver for this method to be
     *     true.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @raises TP.sig.InvalidCollection
     * @returns {Boolean} Whether or not the receiver contains any of the values
     *     in the collection provided.
     * @todo
     */

    var arr,
        retval,
        thisref;

    if (TP.isArray(aCollection)) {
        arr = aCollection;
    } else {
        if (!TP.canInvoke(aCollection, 'asArray')) {
            return this.raise('TP.sig.InvalidCollection', arguments);
        }

        arr = aCollection.asArray();
    }

    if (TP.isEmpty(arr)) {
        return false;
    }

    retval = false;
    thisref = this;

    arr.perform(
        function(item, index) {

            if (thisref.contains(item, aTest)) {
                retval = true;
                return TP.BREAK;
            }
        });

    return retval;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('containsString',
function(aString) {

    /**
     * @name containsString
     * @synopsis Returns true if the receiver contains the string provided.
     * @param {String} aValue The value that at least one element in the
     *     receiver should be equal to for this method to return true.
     * @returns {Boolean}
     */

    return this.containsValue(aString);
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('convert',
function(aFunction) {

    /**
     * @name convert
     * @synopsis Converts the values of the receiver in place, altering the
     *     receiver such that the return value of aFunction is used as the new
     *     value for each key/value pair in the receiver.
     * @param {Function} aFunction A function which should return the new value
     *     given an item to process.
     * @returns {TP.lang.Hash} The receiver.
     */

    var thisref,

        shouldSignal;

    thisref = this;

    //  turn off change signaling
    shouldSignal = this.shouldSignalChange();
    this.shouldSignalChange(false);

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

TP.lang.Hash.Inst.defineMethod('countOf',
function(anItem, aTest) {

    /**
     * @name countOf
     * @synopsis Returns a count of the number of times anItem is found in the
     *     hash.
     * @param {TPOrderedPair} anItem The item/pair whose value is checked
     *     against.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Number} The number of occurrences of anItem.
     * @todo
     */

    //  since it's an item...key/value...the answer is either 0 or 1...
    return this.contains(anItem, aTest) ? 1 : 0;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('detect',
function(aFunction) {

    /**
     * @name detect
     * @synopsis Returns the first element in the receiver which matches the
     *     criteria provided or null if the element isn't found. NOTE that for a
     *     hash the ordering is arbitrary, so this is more like a simple "find"
     *     that's useful when trying to find based on the value rather than key.
     * @param {Function} aFunction A function which should return true if the
     *     element it is passed passes the function's test, or false if it does
     *     not.
     * @returns {Object} The element detected or undefined.
     */

    var retval;

    this.perform(
        function(item, index) {

            if (aFunction(item, index)) {
                retval = item;
                return TP.BREAK;
            }
        });

    return retval;
});

//  ------------------------------------------------------------------------
//  detectInvoke                Kernel
//  ------------------------------------------------------------------------
//  detectMax                   Kernel
//  ------------------------------------------------------------------------
//  detectMin                   Kernel
//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('difference',
function(aCollection, aTest) {

    /**
     * @name difference
     * @synopsis Returns the elements contained in the receiver which are not in
     *     the collection provided.
     * @description This method can be thought of as subtracting all elements
     *     found in the collection provided from the receiver. What's left are
     *     those elements unique to the receiver.
     * @param {TPCollection} aCollection The collection to difference against
     *     the receiver.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @raises TP.sig.InvalidCollection
     * @returns {Array} An array containing the key/value pairs that differ.
     *     Since keys might have different values in different hashes we don't
     *     attempt to turn the list back into a hash.
     * @todo
     */

    var arr;

    if (TP.isArray(aCollection)) {
        arr = aCollection;
    } else {
        if (!TP.canInvoke(aCollection, 'asArray')) {
            return this.raise('TP.sig.InvalidCollection', arguments);
        }

        arr = aCollection.asArray();
    }

    return arr.difference(this.getItems());
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('disjunction',
function(aCollection, aTest) {

    /**
     * @name disjunction
     * @synopsis Returns the 'symmetric difference' or those elements which are
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
     * @raises TP.sig.InvalidCollection
     * @returns {Array} An array containing the key/value pairs that differ.
     *     Since keys might have different values in different hashes we don't
     *     attempt to turn the list back into a hash.
     * @todo
     */

    var arr;

    if (TP.isArray(aCollection)) {
        arr = aCollection;
    } else {
        if (!TP.canInvoke(aCollection, 'asArray')) {
            return this.raise('TP.sig.InvalidCollection', arguments);
        }

        arr = aCollection.asArray();
    }

    return arr.disjunction(this.getItems());
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('empty',
function() {

    /**
     * @name empty
     * @synopsis Empties the receiver.
     * @returns {TP.lang.Hash} The receiver.
     * @signals Change
     * @todo
     */

    var hash,
        keys,
        len,
        i;

    hash = this.$get('$$hash');

    keys = this.getKeys();
    len = keys.getSize();

    for (i = 0; i < len; i++) {
        delete(hash[keys[i]]);
    }

    keys.empty();

    this.changed('length', TP.DELETE, TP.hc(TP.OLDVAL, len, TP.NEWVAL, 0));

    return this;
});

//  ------------------------------------------------------------------------
//  flatten                     Kernel
//  ------------------------------------------------------------------------
//  getItems                    Kernel
//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('getIterator',
function() {

    /**
     * @name getIterator
     * @synopsis Returns the iterator used for the receiver. You shouldn't count
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

TP.lang.Hash.Inst.defineMethod('getIteratorType',
function() {

    /**
     * @name getIteratorType
     * @synopsis Returns the type of iterator used for the receiver.
     * @returns {TP.core.Iterator} The type of the iterator.
     */

    var type;

    if (TP.notValid(type = TP.sys.getTypeByName('TP.core.Iterator'))) {
        return this.raise('TP.sig.TypeNotFound', arguments);
    }

    return type;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('getSize',
function() {

    /**
     * @name getSize
     * @synopsis Returns the size of the receiver.
     * @returns {Number} The size.
     */

    return this.getKeys().getSize();
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('getValues',
function() {

    /**
     * @name getValues
     * @synopsis Returns an array containing the values for the objects'
     *     attributes.
     * @returns {Array} An array of the values for the receiver's keys.
     * @todo
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

TP.lang.Hash.Inst.defineMethod('intersection',
function(aCollection, aTest) {

    /**
     * @name intersection
     * @synopsis Returns the intersection of the two collections as a new
     *     TP.lang.Hash.
     * @description This method returns a hash of those elements which occur in
     *     BOTH the receiver and in aCollection. NOTE that both the keys and the
     *     values are used in testing.
     * @param {TPCollection} aCollection The collection to intersect the
     *     receiver with.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @raises TP.sig.InvalidCollection
     * @returns {TP.lang.Hash} A hash containing the elements in the
     *     intersection of the two collections.
     * @todo
     */

    var arr;

    if (TP.isArray(aCollection)) {
        arr = aCollection;
    } else {
        if (!TP.canInvoke(aCollection, 'asArray')) {
            return this.raise('TP.sig.InvalidCollection', arguments);
        }

        arr = aCollection.asArray();
    }

    return arr.intersection(this.getItems()).asHash();
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('$$isCollection',
function() {

    /**
     * @name $$isCollection
     * @synopsis Returns true if the receiver is a collection instance.
     * @returns {Boolean} True if the receiver is a collection.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('isSortedCollection',
function() {

    /**
     * @name isSortedCollection
     * @synopsis Returns true if the receiver is behaving as a sorted
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

TP.lang.Hash.Inst.defineMethod('merge',
function(shouldForce) {

    /**
     * @name merge
     * @synopsis Merge the receiver's elements with elements from one or more
     *     collections.
     * @param {arguments} varargs Variable-length argument list of other
     *     collections
     * @returns {TP.lang.Hash} A hash containing the merged values from the
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

TP.lang.Hash.Inst.defineMethod('remove',
function(anItem, aTest) {

    /**
     * @name remove
     * @synopsis Removes an item from the receiver.
     * @description In this method, all instances of the item are removed. The
     *     key and value must match for the item to be removed. If you want to
     *     remove the key without concern for whether the value matches use
     *     removeKey or removeAt.
     * @param {TPOrderedPair} anItem The item to be removed.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @raises InvalidItem, InvalidPair
     * @returns {Number} The count of items removed.
     * @signals Change
     * @todo
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

TP.lang.Hash.Inst.defineMethod('removeAll',
function(aCollection, aTest) {

    /**
     * @name removeAll
     * @synopsis Removes the items contained in the collection from the
     *     receiver.
     * @param {TPCollection} aCollection The collection of items to remove.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @raises TP.sig.InvalidParameter, TP.sig.InvalidCollection
     * @returns {Number} The count of items removed.
     * @signals Change
     * @todo
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
            this.raise('TP.sig.InvalidCollection', arguments);
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

                count += thisref.remove(item);
            });
    } catch (e) {
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

TP.lang.Hash.Inst.defineMethod('replace',
function(oldItem, newItem, aTest) {

    /**
     * @name replace
     * @synopsis Replaces the item having the value oldItem with an item having
     *     the value newItem.
     * @param {TPOrderedPair} oldItem The old item to look for.
     * @param {TPOrderedPair} newItem The new item to replace the old item with.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @raises TP.sig.InvalidParameter, InvalidPair
     * @returns {Object} The receiver.
     * @signals Change
     * @todo
     */

    var shouldSignal;

    if (!TP.isPair(oldItem) || !TP.isPair(newItem)) {
        this.raise('InvalidPair', arguments);

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
        this.remove(oldItem);
        this.add(newItem);

        this.changed('value', TP.UPDATE);
    } catch (e) {
    } finally {
        //  re-enable change notification
        this.shouldSignalChange(shouldSignal);
    }

    return 1;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('replaceAll',
function(aCollection, newItem, aTest) {

    /**
     * @name replaceAll
     * @synopsis Replaces all the items in aCollection with the newItem.
     * @param {TPCollection} aCollection A collection of old items to replace.
     * @param {TPOrderedPair} newItem The new item to replace the old items
     *     with.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @raises TP.sig.InvalidCollection,TP.sig.InvalidPair,
     *     TP.sig.InvalidParameter
     * @returns {Object} The receiver.
     * @signals Change
     * @todo
     */

    var arr,
        count,
        thisref,

        shouldSignal;

    if (TP.isArray(aCollection)) {
        arr = aCollection;
    } else {
        if (!TP.canInvoke(aCollection, 'asArray')) {
            return this.raise('TP.sig.InvalidCollection', arguments);
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

                count += thisref.replace(item, newItem);
            });
    } catch (e) {
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

TP.lang.Hash.Inst.defineMethod('transpose',
function() {

    /**
     * @name transpose
     * @synopsis Transposes the keys and values of the receiver, creating a
     *     reverse-lookup version of the receiver.
     * @description Note that the sort order (if any) of the keys determines how
     *     duplicate values will ultimately be handled (ie. which key 'wins'
     *     when there are multiple values whose keys will collide).
     * @returns {TP.lang.Hash} A new instance with the values and keys reversed.
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

TP.lang.Hash.Inst.defineMethod('union',
function(aCollection, aFunction) {

    /**
     * @name union
     * @synopsis Returns a new Hash containing the items combining the keys and
     *     values of both objects. When aFunction is provided it is used to
     *     produce a return value for duplicate keys, otherwise the incoming
     *     collection's values will replace the receiver's values.
     * @param {TPCollection} aCollection An object containing key/value data to
     *     be combined with the receiver.
     * @param {Function} aFunction A function accepting a key and two values
     *     (key, old, new) which returns the value to use for the key.
     * @returns {TP.lang.Hash} A new hash containing items from both
     *     collections.
     * @todo
     */

    var dups,
        hash;

    if (!TP.canInvoke(aCollection, 'getKeys')) {
        return this.raise('TP.sig.InvalidCollection', arguments,
                'Collection must support getKeys for union operation.');
    }

    hash = this.copy();

    if (TP.isCallable(aFunction)) {
        //  going to try to resolve duplicate key issues so we need to
        //  collect the actual values via the function
        dups = this.getKeys().intersection(aCollection.getKeys());

        if (TP.notEmpty(dups)) {
            dups.convert(
                function(key) {

                    return TP.ac(key,
                                aFunction(key,
                                            this.at(key),
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

TP.lang.Hash.Inst.defineMethod('unique',
function(aTest) {

    /**
     * @name unique
     * @synopsis Collapses the receiver to contain only 1 of each unique value.
     *     For a hash this is a no-op since each item is inherently a unique
     *     key/value combination.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Object} The receiver.
     * @todo
     */

    return this;
});

//  ------------------------------------------------------------------------
//  TPIndexedCollection Interface
//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('addAt',
function(aValue, anIndex) {

    /**
     * @name addAt
     * @synopsis Adds the value provided at anIndex.
     * @param {Object} aValue The value to add at anIndex.
     * @param {Number} anIndex The index to add aValue at.
     * @raises TP.sig.InvalidIndex
     * @returns {Object} The receiver.
     * @signals Change
     * @todo
     */

    if (TP.notValid(anIndex)) {
        return this.raise('TP.sig.InvalidIndex', arguments);
    }

    return this.atPut(anIndex, aValue);
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('addAllAt',
function(aCollection, anIndex) {

    /**
     * @name addAllAt
     * @synopsis Adds aCollection at the index provided. NOTE that the entire
     *     collection becomes the value for the key provided.
     * @param {TPCollection} aCollection The collection to add.
     * @param {Number} anIndex The index to add elements.
     * @raises TP.sig.InvalidIndex
     * @returns {Object} The receiver.
     * @signals Change
     * @todo
     */

    return this.addAt(aCollection, anIndex);
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('at',
function(anIndex) {

    /**
     * @name at
     * @synopsis Returns the value at the index provided.
     * @param {Object} anIndex The index to use for locating the value. Note
     *     that this is usually a string, but could be any object. This method
     *     is designed to protect against returning any of the receiver's
     *     methods.
     * @returns {Object} The item at the index provided or undefined.
     */

    var hash;

    hash = this.$get('$$hash');

    //  Make sure that the supplied key matches a property on our internal hash.

    //  (wje): Use 'hasOwnProperty' here for better performance
    //  Note how we use 'TP.FunctionProto.hasOwnProperty.call'... this is due
    //  to the fact that the hash itself is a prototype-less Object and
    //  therefore 'hasOwnProperty' won't exist.
    if (!hash || !TP.FunctionProto.hasOwnProperty.call(hash, anIndex)) {
        return;
    }

    //  null or undefined will be distinguished properly for callers.
    return hash[anIndex];
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('atAll',
function(aCollection) {

    /**
     * @name atAll
     * @synopsis Returns an array containing the values at each of the indices
     *     provided.
     * @param {TPCollection} aCollection The collection of indexes.
     * @raises TP.sig.InvalidCollection
     * @returns {Array} A new array containing the values collected.
     * @todo
     */

    var arr,
        thisref;

    if (!TP.canInvoke(aCollection, 'perform')) {
        return this.raise(
                    'TP.sig.InvalidCollection',
                    arguments,
                    'Collection must support perform for atAll operation.');
    }

    arr = TP.ac();
    thisref = this;

    aCollection.perform(
        function(item, index) {

            arr.push(thisref.at(item));

            return;
        });

    return arr;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('atAllIfAbsent',
function(aCollection) {

    /**
     * @name atAllIfAbsent
     * @param {TPCollection} aCollection The collection of indexes.
     * @raises TP.sig.InvalidCollection, TP.sig.InvalidIndex
     * @returns {Array}
     * @abstract
     * @todo
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('atAllPut',
function(aCollection, aValue) {

    /**
     * @name atAllPut
     * @synopsis Inserts aValue at a set of locations.
     * @description Places aValue at each location in the receiver. If the
     *     optional collection is provided the indices listed in the collection
     *     are updated rather than the entire collection.
     * @param {TPCollection} aCollection An optional collection specifying
     *     indexes which should be altered to contain aValue.
     * @param {Object} aValue The element to put at all the locations in this
     *     collection (unless aCollection of indexes is provided).
     * @raises TP.sig.InvalidCollection
     * @returns {Object} The receiver.
     * @signals Change
     * @todo
     */

    var count,
        thisref;

    if (!TP.canInvoke(aCollection, 'perform')) {
        return this.raise(
                    'TP.sig.InvalidCollection',
                    arguments,
                    'Collection must support perform for atAll operation.');
    }

    count = 0;
    thisref = this;

    aCollection.perform(
        function(item, index) {

            if (!TP.equal(this.at(item), aValue)) {
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

TP.lang.Hash.Inst.defineMethod('atIfInvalid',
function(anIndex, aDefault) {

    /**
     * @name atIfInvalid
     * @synopsis Returns the value at the index provided or the default value if
     *     the key doesn't exist.
     * @description If a Function is supplied as the default value to this
     *     method, it will be executed and its value will be returned as the
     *     value. Therefore, this method cannot be used if the Function object
     *     itself is what is desired as the returned value.
     * @param {Object} anIndex The index of the value to return.
     * @param {Object} aDefault The default value to return if invalid.
     * @returns {Object} The element at anIndex in this collection.
     * @todo
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

TP.lang.Hash.Inst.defineMethod('atIfNull',
function(anIndex, aDefault) {

    /**
     * @name atIfNull
     * @synopsis Returns the value at the index provided or the default value if
     *     the key returns a value of null (not undefined).
     * @description If a Function is supplied as the default value to this
     *     method, it will be executed and its value will be returned as the
     *     value. Therefore, this method cannot be used if the Function object
     *     itself is what is desired as the returned value.
     * @param {Object} anIndex The index of the value to return.
     * @param {Object} aDefault The default value to return if null.
     * @returns {Object} The element at anIndex in this collection.
     * @todo
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

TP.lang.Hash.Inst.defineMethod('atIfUndefined',
function(anIndex, aDefault) {

    /**
     * @name atIfUndefined
     * @synopsis Returns the value at the index provided or the default value if
     *     the key returns undefined.
     * @description If a Function is supplied as the default value to this
     *     method, it will be executed and its value will be returned as the
     *     value. Therefore, this method cannot be used if the Function object
     *     itself is what is desired as the returned value.
     * @param {Object} anIndex The index of the value to return.
     * @param {Object} aDefault The default value to return if undefined.
     * @returns {Object} The element at anIndex in this collection.
     * @todo
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

TP.lang.Hash.Inst.defineMethod('atPath',
function(anIndex) {

    /**
     * @name atPath
     * @synopsis Retrieves the value at the 'end' of set of TP.lang.Hashes that
     *     should each match an entry in the dot-separated index.
     * @param {String} anIndex The 'dot separated' path to retrieve the value
     *     from.
     * @returns {Object} The item at the index provided or undefined.
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

    entry = this;

    indices = anIndex.split('.');

    len = indices.getSize();
    for (i = 0; i < len; i++) {
        index = indices.at(i);

        //  If we're at the last position, then we get the real value
        if (i === len - 1) {
            return entry.at(index);
        } else {
            //  Otherwise, we see if there's a TP.lang.Hash at that
            //  position. If not, we return null. Otherwise, we set the next
            //  'entry' to be the 'next TP.lang.Hash in line'
            item = entry.at(index);

            if (!TP.isKindOf(item, TP.lang.Hash)) {
                return null;
            }

            entry = item;
        }
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('atPathPut',
function(anIndex, aValue) {

    /**
     * @name atPathPut
     * @synopsis Places the supplied value at the 'end' of set of TP.lang.Hashes
     *     that should each match an entry in the dot-separated index. If a
     *     TP.lang.Hash isn't found at that entry in the hash at the current
     *     entry point, one is created.
     * @param {String} anIndex The 'dot separated' path to put aValue into.
     * @param {Object} aValue The value to place at the end of the path.
     * @example Construct a series of TP.lang.Hashes 'along a path' and place a
     *     value in the last one:
     *     <code>
     *          myHash = TP.hc();
     *          myHash.atPathPut('foo.bar.baz', 'moo');
     *          myHash.asSource();
     *          <samp>TP.hc('foo', TP.hc('bar', TP.hc('baz', 'moo')))</samp>
     *     </code>
     * @returns {TP.lang.Hash} The receiver.
     * @signals Change
     * @todo
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
        return;
    }

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
            //  Otherwise, we see if there's a TP.lang.Hash at that
            //  position. If not, we create one. In either case, we set the
            //  next 'entry' to be the 'next TP.lang.Hash in line'
            item = entry.at(index);

            if (!TP.isKindOf(item, TP.lang.Hash)) {
                item = TP.hc();
                entry.atPut(index, item);
                op = TP.INSERT;
            }

            entry = item;
        }
    }

    //  set change signaling back to its previous setting
    this.shouldSignalChange(shouldSignal);

    //  'changed' will check further to see if we signal Change.
    if (TP.isValid(op)) {
        this.changed(anIndex, op);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('atPut',
function(anIndex, aValue) {

    /**
     * @name atPut
     * @synopsis Replaces the value at anIndex with aValue.
     * @param {Object} anIndex The index to put aValue into.
     * @param {Object} aValue The value to place at anIndex.
     * @returns {TP.lang.Hash} The receiver.
     * @signals Change
     * @todo
     */

    var hash,
        keyArr,

        shouldSignal,

        op,
        val,

        changeRecord,
        changeRecordHash;

    hash = this.$get('$$hash');
    keyArr = this.getKeys();

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
            keyArr.push(anIndex);
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
        //this.changed(anIndex, op, TP.hc(TP.OLDVAL, val, TP.NEWVAL, aValue));

        changeRecord = TP.hc();

        changeRecordHash = changeRecord.$get('$$hash');

        changeRecordHash[TP.OLDVAL] = val;
        changeRecordHash[TP.NEWVAL] = aValue;

        this.changed(anIndex, op, changeRecord);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('atPutIfAbsent',
function(aKey, aValue) {

    /**
     * @name atPutIfAbsent
     * @synopsis Add the key and value if the key doesn't already exist. NOTE
     *     that the value isn't relevant in this test, the value may be null, or
     *     undefined, and as long at the key has been defined at some point this
     *     method will not update the value.
     * @param {Object} aKey The key to test and optionally add to the receiver.
     * @param {Object} aValue Optional value to store when the first argument is
     *     a string.
     * @raises InvalidPair
     * @returns {Object} The key's value after processing.
     * @signals Change
     * @todo
     */

    return this.addIfAbsent(aKey, aValue);
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('containsKey',
function(aKey) {

    /**
     * @name containsKey
     * @synopsis Returns true if the receiver contains the key provided.
     * @param {Object} aKey The key to test.
     * @returns {Boolean}
     */

    return TP.isDefined(this.at(aKey));
});

//  ------------------------------------------------------------------------
//  containsValue               Kernel
//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('detectKeyAt',
function(aKey, anIndex) {

    /**
     * @name detectKeyAt
     * @param {String|RegExp} aKey The string or regular expression selector to
     *     match with.
     * @param {Number} anIndex
     * @returns {Object}
     * @abstract
     * @todo
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('getKeys',
function(aFilterName) {

    /**
     * @name getKeys
     * @synopsis Returns the unique keys of the receiver.
     * @description If the receiver has a sort function defined the keys are
     *     sorted. The result is that all methods which use the key array as a
     *     focal point for iteration effectively work to produce output sorted
     *     by the ordering of the keys.
     * @param {String} aFilterName A get*Interface() filter spec.
     * @returns {Array} An array containing the receiver's keys.
     * @todo
     */

    var arr,
        func;

    arr = Object.keys(this.$get('$$hash'));

    //  If we're a sorted TP.lang.Hash, then sort the keys.
    return (TP.isCallable(func = this.getSortFunction())) ?
                arr.sort(func) :
                arr;
});

//  ------------------------------------------------------------------------
//  getKVPairs                  Kernel
//  ------------------------------------------------------------------------
//  getPairs                    Kernel
//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('getPosition',
function(aValue, aTest) {

    /**
     * @name getPosition
     * @synopsis Returns the first index of the element provided or undefined if
     *     the element isn't found. For hashes with a sort function the ordering
     *     will be relevant, otherwise it will be random and the results will be
     *     unpredictable.
     * @param {Object} aValue What to search for.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Object} The index of the value or undefined.
     * @todo
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

            return false;
        });

    if (TP.isValid(found)) {
        return found.first();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('getPositions',
function(aValue, aTest) {

    /**
     * @name getPositions
     * @synopsis Returns an array containing all indexes where aValue exists. No
     *     particular order is implied however sorted hashes will return the
     *     indexes in the order defined by their sort function.
     * @param {Object} aValue The value to search for.
     * @param {String} aTest Which test to use, TP.IDENTITY or TP.EQUALITY. The
     *     default is TP.EQUALITY.
     * @returns {Array} A new array of indexes.
     * @todo
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

            return false;
    });

    //  return the keys from our itemset, those are our 'indexes'
    return items.collect(function(item) {return item.first();});
});

//  ------------------------------------------------------------------------
//  grepKeys                    Kernel
//  ------------------------------------------------------------------------
//  performOver                 Kernel
//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('removeAt',
function(anIndex) {

    /**
     * @name removeAt
     * @synopsis Removes the element at the index provided.
     * @param {Object} anIndex The index at which to remove the element.
     * @returns {Object} The receiver.
     * @signals Change
     * @todo
     */

    return this.removeKey(anIndex);
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('removeAtAll',
function(aCollection) {

    /**
     * @name removeAtAll
     * @synopsis Provides a way to remove a collection of keys (and their
     *     values) from the collection.
     * @param {TPCollection} aCollection A collection of keys.
     * @raises TP.sig.InvalidParameter, TP.sig.InvalidCollection
     * @returns {Object} The receiver.
     * @signals Change
     * @todo
     */

    var count,
        thisref,

        shouldSignal;

    if (!TP.canInvoke(aCollection, 'perform')) {
        return this.raise(
                    'TP.sig.InvalidCollection',
                    arguments,
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

                return;
            });
    } catch (e) {
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

TP.lang.Hash.Inst.defineMethod('removeKey',
function(aKey) {

    /**
     * @name removeKey
     * @synopsis Removes the key provided if the collection contains it. Note
     *     that this won't remove a key if the key references a method.
     * @param {Object} aKey The key value to remove.
     * @raises TP.sig.InvalidParameter
     * @returns {Object} The receiver.
     * @signals Change
     * @todo
     */

    if (TP.isEmpty(aKey)) {
        return this.raise(
                    'TP.sig.InvalidParameter',
                    arguments,
                    'Empty key provided.');
    }

    if (TP.isDefined(this.at(aKey))) {
        this.$removeInternalKey(aKey);

        this.changed(aKey, TP.DELETE);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('removeKeys',
function(aKeyArray) {

    /**
     * @name removeKeys
     * @synopsis Removes the keys provided if the collection contains them. Note
     *     that this won't remove a key if the key references a method.
     * @param {Array} aKeyArray The key values to remove.
     * @raises TP.sig.InvalidParameter
     * @returns {Object} The receiver.
     * @signals Change
     * @todo
     */

    var changed,

        len,
        i;

    if (TP.isEmpty(aKeyArray)) {
        return this.raise('TP.sig.InvalidParameter',
                            arguments,
                            'Empty key array provided.');
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

TP.lang.Hash.Inst.defineMethod('transpose',
function() {

    /**
     * @name transpose
     * @returns {TP.core.Hash}
     * @abstract
     * @todo
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

TP.lang.Hash.Inst.defineMethod('getSortFunction',
function() {

    /**
     * @name getSortFunction
     * @synopsis Returns the current sort function or null.
     * @returns {Function} This array's sort function.
     */

    return this.sortFunction;
});

//  ------------------------------------------------------------------------

TP.lang.Hash.Inst.defineMethod('setSortFunction',
function(aFunction) {

    /**
     * @name setSortFunction
     * @synopsis Sets the receiver's internal sort function.
     * @description This function will be called any time the receiver has been
     *     updated without being sorted and a request for a value is made. This
     *     method will flag the receiver so that a re-sort will occur on the
     *     next data access call.
     * @param {Function} aFunction The function to set this array's sort
     *     function to.
     * @raises TP.sig.InvalidFunction
     * @returns {TP.lang.Hash} The receiver.
     * @signals Change
     * @todo
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

TP.lang.Hash.Inst.defineMethod('sort',
function(aSortFunction) {

    /**
     * @name sort
     * @synopsis Sorts the receiver's keys, possibly reordering the items in the
     *     receiver. NOTE that if no function is supplied here and the receiver
     *     doesn't have a sort function installed via setSortFunction(), the
     *     results are sorted alphabetically by key string values.
     * @param {Function} aSortFunction A function capable of sorting the
     *     receiver's key array.
     * @returns {TP.lang.Hash} The receiver.
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

TP.lang.Hash.Inst.defineMethod('canResolveDNU',
function(anOrigin, aMethodName, anArgArray, aContext) {

    /**
     * @name canResolveDNU
     * @synopsis Provides an instance that has triggered the DNU machinery with
     *     an opportunity to handle the problem itself. For TP.lang.Hash
     *     instances this results in a test to see if the method is a getter and
     *     whether the receiver has a key fitting a pattern such that at() would
     *     resolve the query.
     * @param {Object} anOrigin The object asking for help. The receiver in this
     *     case.
     * @param {String} aMethodName The method name that failed.
     * @param {arguments} anArgArray Optional arguments to function.
     * @param {Function|Context} aContext The calling context.
     * @returns {Boolean} TRUE means resolveDNU() will be called. FALSE means
     *     the standard DNU machinery will continue processing. The default is
     *     FALSE.
     * @todo
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

TP.lang.Hash.Inst.defineMethod('resolveDNU',
function(anOrigin, aMethodName, anArgArray, aContext) {

    /**
     * @name resolveDNU
     * @synopsis Invoked by the main DNU machinery when the instance has
     *     responded TRUE to canResolveDNU() for the parameters given. For a
     *     hash this means returning the key in question based on the "getter"
     *     prefix being removed.
     * @param {Object} anOrigin The object asking for help.
     * @param {String} aMethodName The method name that failed.
     * @param {arguments} anArgArray Optional arguments to function.
     * @param {Function|Context} aContext The calling context.
     * @returns {Object} The results of function resolution.
     * @todo
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
 * @type {TP.core.Range}
 * @synopsis TP.core.Range provides a simple interface to a range of numbers.
 *     This allows for interesting iteration possibilities such as:
 *     
 *     (1).to(10).perform(function (ind) {alert('index is: ' + ind)});
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core:Range');

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
     * @name init
     * @synopsis Initializes a new instance
     * @param {Number} startIndex The beginning index of the range.
     * @param {Number} endIndex The end index of the range.
     * @param {Number} aStep The range increment for interation. When the start
     *     is smaller than the end this defaults to 1, when the start is larger
     *     than the end the step defaults to -1.
     * @returns {TP.core.Range} A new instance.
     * @todo
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
     * @name asArray
     * @synopsis Returns the receiver in array form (as an Array of its keys).
     * @returns {Array} The receiver as an Array.
     * @todo
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
     * @name at
     * @synopsis Returns the range key at the index provided.
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
     * @name by
     * @synopsis Sets the range iteration step size.
     * @param {Number} aStep The numerical step size.
     * @returns {TP.core.Range} The receiver.
     */

    //  new step? then use it
    if (!TP.isNumber(aStep)) {
        return this.raise('TP.sig.InvalidParameter', arguments);
    }

    //  truncate
    this.empty();

    this.set('step', aStep);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Range.Inst.defineMethod('empty',
function(anIndex) {

    /**
     * @name empty
     * @synopsis Clears the range's internal index cache, if it exists.
     * @returns {TP.core.Range} The receiver.
     */

    this.$set('keys', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Range.Inst.defineMethod('getKeys',
function() {

    /**
     * @name getKeys
     * @synopsis Returns an array containing the keys of the receiver.
     * @returns {Array} The receiver as an array of key values.
     * @todo
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
     * @name perform
     * @synopsis Iterates over the range and invokes aFunction on each
     *     iteration.
     * @param {Function} aFunction The function to invoke on each iteration.
     *     This function should accept the loop count as its only parameter.
     * @returns {TP.core.Range} The receiver.
     */

    var count,

        step,
        start,
        end,

        instrument,

        i;

    count = 0;

    step = this.get('step');
    start = this.get('start');
    end = this.get('end');

    //  instrumenting at[Start|End] is expensive, make sure we need it
    instrument = true;
    if ((end - start) > TP.sys.cfg('perform.instrument_max')) {
        instrument = TP.regex.PERFORM_INSTRUMENT.test(aFunction.toString());
    }

    if (step.isPositive()) {
        for (i = start; i <= end; i = i + step) {
            if (instrument) {
                //  update iteration edge flags so our function can tell
                //  when its at the start/end of the overall collection
                aFunction.atStart((i === 0) ? true : false);
                aFunction.atEnd((i === end) ? true : false);
            }

            if (aFunction(i, count) === TP.BREAK) {
                break;
            }

            count++;
        }
    } else {
        //  still adding step, it's negative...
        for (i = start; i >= end; i = i + step) {
            if (instrument) {
                //  update iteration edge flags so our function can tell
                //  when its at the start/end of the overall collection
                aFunction.atStart((i === 0) ? true : false);
                aFunction.atEnd((i === end) ? true : false);
            }

            if (aFunction(i, count) === TP.BREAK) {
                break;
            }

            count++;
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Range.Inst.defineMethod('performUntil',
function(aFunction, aTest) {

    /**
     * @name performUntil
     * @synopsis Performs the function on each iteration of the receiver until
     *     aTest returns true.
     * @description performUntil can be used as an alternative to constructing
     *     repeat loops to iterate over a range.
     * @param {Function} aFunction A function which performs some action with
     *     each iteration.
     * @param {String} aTest A test condition which ends the loop. The test
     *     should be a second function that returns a Boolean. The test is
     *     passed the same data as the performed function.
     * @returns {TP.core.Range} The receiver.
     * @todo
     */

    var f,
        tst,

        count,

        step,
        start,
        end,

        instrument,

        i;

    f = TP.RETURN_FALSE;
    tst = aTest;

    if (!TP.isCallable(tst)) {
        tst = f;
    }

    count = 0;

    step = this.get('step');
    start = this.get('start');
    end = this.get('end');

    //  instrumenting at[Start|End] is expensive, make sure we need it
    instrument = true;
    if ((end - start) > TP.sys.cfg('perform.instrument_max')) {
        instrument = TP.regex.PERFORM_INSTRUMENT.test(aFunction.toString());
    }

    if (step.isPositive()) {
        for (i = start; i <= end; i = i + step) {
            if (instrument) {
                //  update iteration edge flags so our function can tell
                //  when its at the start/end of the overall collection
                aFunction.atStart((i === 0) ? true : false);
                aFunction.atEnd((i === end) ? true : false);
            }

            aFunction(i, count);

            if (tst(i, count)) {
                break;
            }

            count++;
        }
    } else {
        //  still adding step, it's negative...
        for (i = start; i >= end; i = i + step) {
            if (instrument) {
                //  update iteration edge flags so our function can tell
                //  when its at the start/end of the overall collection
                aFunction.atStart((i === 0) ? true : false);
                aFunction.atEnd((i === end) ? true : false);
            }

            aFunction(i, count);

            if (tst(i, count)) {
                break;
            }

            count++;
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Range.Inst.defineMethod('performWhile',
function(aFunction, aTest) {

    /**
     * @name performWhile
     * @synopsis Performs the function on each iteration of the receiver while
     *     aTest returns true.
     * @description performUntil can be used as an alternative to constructing
     *     while loops to iterate over a range
     * @param {Function} aFunction A function which performs some action with
     *     each iteration index.
     * @param {String} aTest A test condition which ends the loop. The test
     *     should be a second function that returns a Boolean. The test is
     *     passed the same data as the performed function.
     * @returns {TP.core.Range} The receiver.
     * @todo
     */

    var count,

        step,
        start,
        end,

        instrument,

        i;

    count = 0;

    step = this.get('step');
    start = this.get('start');
    end = this.get('end');

    //  instrumenting at[Start|End] is expensive, make sure we need it
    instrument = true;
    if ((end - start) > TP.sys.cfg('perform.instrument_max')) {
        instrument = TP.regex.PERFORM_INSTRUMENT.test(aFunction.toString());
    }

    if (step.isPositive()) {
        for (i = start; i <= end; i = i + step) {
            if (instrument) {
                //  update iteration edge flags so our function can tell
                //  when its at the start/end of the overall collection
                aFunction.atStart((i === 0) ? true : false);
                aFunction.atEnd((i === end) ? true : false);
            }

            if (TP.notTrue(aTest(i, count))) {
                break;
            }

            aFunction(i, count);

            count++;
        }
    } else {
        //  still adding step, it's negative...
        for (i = start; i >= end; i = i + step) {
            if (TP.notTrue(aTest(i, count))) {
                break;
            }

            if (instrument) {
                //  update iteration edge flags so our function can tell
                //  when its at the start/end of the overall collection
                aFunction.atStart((i === 0) ? true : false);
                aFunction.atEnd((i === end) ? true : false);
            }

            aFunction(i, count);
            count++;
        }
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
